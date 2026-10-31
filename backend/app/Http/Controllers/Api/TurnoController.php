<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Turno;
use App\Models\AsignacionTurno;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class TurnoController extends Controller
{
    public function index()
    {
        $turnos = Turno::where('is_active', true)->orderBy('hora_inicio')->get();
        return response()->json(['data' => $turnos]);
    }

    public function asignaciones(Request $request)
    {
        $query = AsignacionTurno::with([
            'turno',
            'conductor.user',
            'vehiculo',
            'ruta',
            'supervisor'
        ]);

        if ($request->filled('fecha')) {
            $query->whereDate('fecha', $request->query('fecha'));
        }

        if ($request->filled('fecha_desde') && $request->filled('fecha_hasta')) {
            $query->whereBetween('fecha', [$request->query('fecha_desde'), $request->query('fecha_hasta')]);
        }

        if ($request->filled('turno_id')) {
            $query->where('turno_id', $request->query('turno_id'));
        }

        if ($request->filled('conductor_id')) {
            $query->where('conductor_id', $request->query('conductor_id'));
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->query('estado'));
        }

        // Si es conductor, solo ve sus propias asignaciones
        $user = $request->user();
        if ($user->role === 'conductor') {
            $conductor = $user->conductor;
            if ($conductor) {
                $query->where('conductor_id', $conductor->id);
            }
        }

        $asignaciones = $query->orderBy('fecha', 'desc')->orderBy('turno_id', 'asc')->get();

        return response()->json([
            'data' => $asignaciones,
            'summary' => [
                'total' => $asignaciones->count(),
                'programados' => $asignaciones->where('estado', 'programado')->count(),
                'en_curso' => $asignaciones->where('estado', 'en_curso')->count(),
                'completados' => $asignaciones->where('estado', 'completado')->count(),
                'cancelados' => $asignaciones->where('estado', 'cancelado')->count(),
            ]
        ]);
    }

    public function storeAsignacion(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'conductor') {
            return response()->json(['message' => 'No autorizado para asignar turnos'], 403);
        }

        $validated = $request->validate([
            'fecha' => 'required|date',
            'turno_id' => 'required|exists:turnos,id',
            'conductor_id' => 'required|exists:conductores,id',
            'vehiculo_id' => 'required|exists:vehiculos,id',
            'ruta_id' => 'required|exists:rutas,id',
            'observaciones' => 'nullable|string|max:500',
        ]);

        // Verificar si el conductor ya tiene asignación en esa fecha y turno
        $existeConductor = AsignacionTurno::where('fecha', $validated['fecha'])
            ->where('turno_id', $validated['turno_id'])
            ->where('conductor_id', $validated['conductor_id'])
            ->where('estado', '!=', 'cancelado')
            ->exists();

        if ($existeConductor) {
            return response()->json([
                'message' => 'El conductor ya cuenta con una asignación para esta fecha y turno.'
            ], 422);
        }

        // Verificar si el vehículo ya está asignado en esa fecha y turno
        $existeVehiculo = AsignacionTurno::where('fecha', $validated['fecha'])
            ->where('turno_id', $validated['turno_id'])
            ->where('vehiculo_id', $validated['vehiculo_id'])
            ->where('estado', '!=', 'cancelado')
            ->exists();

        if ($existeVehiculo) {
            return response()->json([
                'message' => 'El vehículo ya se encuentra asignado a otro conductor en este turno.'
            ], 422);
        }

        $validated['supervisor_id'] = $user->id;
        $validated['estado'] = 'programado';

        $asignacion = AsignacionTurno::create($validated);
        $asignacion->load(['turno', 'conductor.user', 'vehiculo', 'ruta']);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'asignacion_turno_creada',
            'module' => 'turnos',
            'details' => "Asignación turno #{$asignacion->id} para conductor #{$asignacion->conductor_id} y vehículo #{$asignacion->vehiculo_id}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Asignación creada exitosamente',
            'data' => $asignacion
        ], 201);
    }

    public function updateAsignacion(Request $request, $id)
    {
        $asignacion = AsignacionTurno::findOrFail($id);

        $validated = $request->validate([
            'estado' => 'sometimes|in:programado,en_curso,completado,cancelado',
            'observaciones' => 'nullable|string|max:500',
            'vehiculo_id' => 'sometimes|exists:vehiculos,id',
            'ruta_id' => 'sometimes|exists:rutas,id',
        ]);

        $asignacion->update($validated);
        $asignacion->load(['turno', 'conductor.user', 'vehiculo', 'ruta']);

        return response()->json([
            'message' => 'Asignación actualizada',
            'data' => $asignacion
        ]);
    }

    public function destroyAsignacion(Request $request, $id)
    {
        $asignacion = AsignacionTurno::findOrFail($id);
        $asignacion->update(['estado' => 'cancelado']);
        $asignacion->delete();

        return response()->json([
            'message' => 'Asignación cancelada'
        ]);
    }
}
