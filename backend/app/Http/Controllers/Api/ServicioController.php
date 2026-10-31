<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Servicio;
use App\Models\AsignacionTurno;
use App\Models\Vehiculo;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class ServicioController extends Controller
{
    public function index(Request $request)
    {
        $query = Servicio::with([
            'conductor.user',
            'vehiculo',
            'ruta',
            'incidencias'
        ]);

        if ($request->filled('estado')) {
            $query->where('estado', $request->query('estado'));
        }

        if ($request->filled('ruta_id')) {
            $query->where('ruta_id', $request->query('ruta_id'));
        }

        $user = $request->user();
        if ($user->role === 'conductor') {
            $conductor = $user->conductor;
            if ($conductor) {
                $query->where('conductor_id', $conductor->id);
            }
        }

        $servicios = $query->orderBy('hora_inicio_real', 'desc')->get();

        return response()->json([
            'data' => $servicios,
            'summary' => [
                'total' => $servicios->count(),
                'en_ruta' => $servicios->where('estado', 'en_ruta')->count(),
                'completados' => $servicios->where('estado', 'completado')->count(),
                'cancelados' => $servicios->where('estado', 'cancelado')->count(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        // Iniciar un nuevo servicio
        $validated = $request->validate([
            'asignacion_turno_id' => 'required|exists:asignaciones_turno,id',
            'km_inicio' => 'required|integer|min:0',
            'observaciones' => 'nullable|string|max:500',
        ]);

        $asignacion = AsignacionTurno::findOrFail($validated['asignacion_turno_id']);

        // Crear servicio
        $servicio = Servicio::create([
            'asignacion_turno_id' => $asignacion->id,
            'conductor_id' => $asignacion->conductor_id,
            'vehiculo_id' => $asignacion->vehiculo_id,
            'ruta_id' => $asignacion->ruta_id,
            'hora_inicio_real' => now(),
            'km_inicio' => $validated['km_inicio'],
            'estado' => 'en_ruta',
            'observaciones' => $validated['observaciones'] ?? null,
        ]);

        // Actualizar estado de asignación y vehículo
        $asignacion->update(['estado' => 'en_curso']);
        Vehiculo::where('id', $asignacion->vehiculo_id)->update(['estado' => 'en_servicio']);

        $servicio->load(['conductor.user', 'vehiculo', 'ruta']);

        return response()->json([
            'message' => 'Servicio iniciado exitosamente',
            'data' => $servicio
        ], 201);
    }

    public function finalizar(Request $request, $id)
    {
        $servicio = Servicio::findOrFail($id);

        $validated = $request->validate([
            'km_fin' => 'required|integer|gte:' . $servicio->km_inicio,
            'pasajeros_transportados' => 'nullable|integer|min:0',
            'observaciones' => 'nullable|string|max:500',
        ]);

        $servicio->update([
            'hora_fin_real' => now(),
            'km_fin' => $validated['km_fin'],
            'pasajeros_transportados' => $validated['pasajeros_transportados'] ?? 0,
            'estado' => 'completado',
            'observaciones' => $validated['observaciones'] ?? $servicio->observaciones,
        ]);

        // Actualizar kilometraje y estado del vehículo
        Vehiculo::where('id', $servicio->vehiculo_id)->update([
            'kilometraje' => $validated['km_fin'],
            'estado' => 'disponible',
        ]);

        $servicio->load(['conductor.user', 'vehiculo', 'ruta']);

        return response()->json([
            'message' => 'Servicio finalizado exitosamente',
            'data' => $servicio
        ]);
    }
}
