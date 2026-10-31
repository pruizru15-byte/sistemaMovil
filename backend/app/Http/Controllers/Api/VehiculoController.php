<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Vehiculo;
use Illuminate\Http\Request;

class VehiculoController extends Controller
{
    /**
     * Listar vehículos con filtros y estadísticas.
     */
    public function index(Request $request)
    {
        $query = Vehiculo::query();

        // Búsqueda por término
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('numero_unidad', 'like', "%{$search}%")
                  ->orWhere('placa', 'like', "%{$search}%")
                  ->orWhere('marca', 'like', "%{$search}%")
                  ->orWhere('modelo', 'like', "%{$search}%");
            });
        }

        // Filtro por estado
        if ($estado = $request->query('estado')) {
            if ($estado !== 'todos') {
                $query->where('estado', $estado);
            }
        }

        $vehiculos = $query->orderBy('numero_unidad', 'asc')->get();

        // Estadísticas de flota
        $stats = [
            'total' => Vehiculo::count(),
            'operativos' => Vehiculo::where('estado', 'operativo')->count(),
            'en_ruta' => Vehiculo::where('estado', 'en_ruta')->count(),
            'mantenimiento' => Vehiculo::where('estado', 'mantenimiento')->count(),
            'fuera_servicio' => Vehiculo::where('estado', 'fuera_servicio')->count(),
        ];

        return response()->json([
            'data' => $vehiculos,
            'stats' => $stats,
        ]);
    }

    /**
     * Obtener detalle de un vehículo.
     */
    public function show($id)
    {
        $vehiculo = Vehiculo::findOrFail($id);

        return response()->json($vehiculo);
    }

    /**
     * Registrar una nueva unidad de transporte.
     */
    public function store(Request $request)
    {
        if (! $request->user()->isAdmin() && ! $request->user()->isSupervisor()) {
            return response()->json(['message' => 'No autorizado para registrar vehículos.'], 403);
        }

        $validated = $request->validate([
            'numero_unidad' => ['required', 'string', 'max:30', 'unique:vehiculos,numero_unidad'],
            'placa' => ['required', 'string', 'max:15', 'unique:vehiculos,placa'],
            'marca' => ['required', 'string', 'max:50'],
            'modelo' => ['required', 'string', 'max:50'],
            'anio_fabricacion' => ['required', 'integer', 'min:2000', 'max:2030'],
            'capacidad_pasajeros' => ['required', 'integer', 'min:10', 'max:100'],
            'estado' => ['required', 'in:operativo,en_ruta,mantenimiento,fuera_servicio'],
            'kilometraje' => ['nullable', 'integer', 'min:0'],
            'soat_vencimiento' => ['nullable', 'date'],
            'revision_tecnica_vencimiento' => ['nullable', 'date'],
            'notas' => ['nullable', 'string'],
        ]);

        $vehiculo = Vehiculo::create($validated);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'vehiculo_created',
            'module' => 'vehiculos',
            'details' => "Vehículo creado: {$vehiculo->numero_unidad} (Placa {$vehiculo->placa})",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Vehículo registrado exitosamente.',
            'vehiculo' => $vehiculo,
        ], 201);
    }

    /**
     * Actualizar vehículo.
     */
    public function update(Request $request, $id)
    {
        if (! $request->user()->isAdmin() && ! $request->user()->isSupervisor()) {
            return response()->json(['message' => 'No autorizado para editar vehículos.'], 403);
        }

        $vehiculo = Vehiculo::findOrFail($id);

        $validated = $request->validate([
            'numero_unidad' => ['required', 'string', 'max:30', "unique:vehiculos,numero_unidad,{$vehiculo->id}"],
            'placa' => ['required', 'string', 'max:15', "unique:vehiculos,placa,{$vehiculo->id}"],
            'marca' => ['required', 'string', 'max:50'],
            'modelo' => ['required', 'string', 'max:50'],
            'anio_fabricacion' => ['required', 'integer', 'min:2000', 'max:2030'],
            'capacidad_pasajeros' => ['required', 'integer', 'min:10', 'max:100'],
            'estado' => ['required', 'in:operativo,en_ruta,mantenimiento,fuera_servicio'],
            'kilometraje' => ['nullable', 'integer', 'min:0'],
            'soat_vencimiento' => ['nullable', 'date'],
            'revision_tecnica_vencimiento' => ['nullable', 'date'],
            'notas' => ['nullable', 'string'],
        ]);

        $vehiculo->update($validated);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'vehiculo_updated',
            'module' => 'vehiculos',
            'details' => "Vehículo actualizado: {$vehiculo->numero_unidad} (Estado: {$vehiculo->estado})",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Vehículo actualizado correctamente.',
            'vehiculo' => $vehiculo,
        ]);
    }

    /**
     * Desactivar lógicamente vehículo.
     */
    public function destroy(Request $request, $id)
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Solo administradores pueden dar de baja vehículos.'], 403);
        }

        $vehiculo = Vehiculo::findOrFail($id);
        $vehiculo->delete();

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'vehiculo_deleted',
            'module' => 'vehiculos',
            'details' => "Vehículo dado de baja lógica: {$vehiculo->numero_unidad} (Placa {$vehiculo->placa})",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['message' => 'Vehículo dado de baja correctamente.']);
    }
}
