<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Incidencia;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class IncidenciaController extends Controller
{
    public function index(Request $request)
    {
        $query = Incidencia::with([
            'conductor.user',
            'vehiculo',
            'ruta',
            'servicio',
            'atendidoPor'
        ]);

        if ($request->filled('estado')) {
            $query->where('estado', $request->query('estado'));
        }

        if ($request->filled('prioridad')) {
            $query->where('prioridad', $request->query('prioridad'));
        }

        $incidencias = $query->orderBy('fecha_hora', 'desc')->get();

        return response()->json([
            'data' => $incidencias,
            'summary' => [
                'total' => $incidencias->count(),
                'abiertas' => $incidencias->where('estado', 'abierta')->count(),
                'en_atencion' => $incidencias->where('estado', 'en_atencion')->count(),
                'resueltas' => $incidencias->where('estado', 'resuelta')->count(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'servicio_id' => 'nullable|exists:servicios,id',
            'conductor_id' => 'required|exists:conductores,id',
            'vehiculo_id' => 'required|exists:vehiculos,id',
            'ruta_id' => 'nullable|exists:rutas,id',
            'tipo' => 'required|in:mecanica,trafico,accidente,retraso,desvio,otro',
            'prioridad' => 'required|in:baja,media,alta,critica',
            'titulo' => 'required|string|max:150',
            'descripcion' => 'required|string|max:1000',
            'ubicacion_referencia' => 'nullable|string|max:200',
            'latitud' => 'nullable|numeric',
            'longitud' => 'nullable|numeric',
        ]);

        $validated['estado'] = 'abierta';
        $validated['fecha_hora'] = now();

        $incidencia = Incidencia::create($validated);
        $incidencia->load(['conductor.user', 'vehiculo', 'ruta']);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'incidencia_reportada',
            'module' => 'incidencias',
            'details' => "Incidencia: {$incidencia->titulo} ({$incidencia->tipo} - Prioridad {$incidencia->prioridad})",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Incidencia reportada exitosamente',
            'data' => $incidencia
        ], 201);
    }

    public function atender(Request $request, $id)
    {
        $incidencia = Incidencia::findOrFail($id);
        $user = $request->user();

        $validated = $request->validate([
            'estado' => 'required|in:en_atencion,resuelta',
            'observaciones' => 'nullable|string|max:500'
        ]);

        $incidencia->update([
            'estado' => $validated['estado'],
            'atendida_por' => $user->id,
        ]);

        $incidencia->load(['conductor.user', 'vehiculo', 'ruta', 'atendidoPor']);

        return response()->json([
            'message' => 'Incidencia actualizada',
            'data' => $incidencia
        ]);
    }
}
