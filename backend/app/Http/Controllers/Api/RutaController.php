<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ruta;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class RutaController extends Controller
{
    public function index(Request $request)
    {
        $query = Ruta::query();

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('codigo_ruta', 'like', "%{$search}%")
                  ->orWhere('nombre', 'like', "%{$search}%")
                  ->orWhere('origen', 'like', "%{$search}%")
                  ->orWhere('destino', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $rutas = $query->withCount([
            'servicios as servicios_activos_count' => function ($q) {
                $q->where('estado', 'en_ruta');
            }
        ])->orderBy('codigo_ruta', 'asc')->get();

        return response()->json([
            'data' => $rutas,
            'summary' => [
                'total' => Ruta::count(),
                'activas' => Ruta::where('is_active', true)->count(),
            ]
        ]);
    }

    public function show($id)
    {
        $ruta = Ruta::with(['servicios.conductor.user', 'servicios.vehiculo'])->findOrFail($id);
        return response()->json(['data' => $ruta]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'codigo_ruta' => 'required|string|max:20|unique:rutas,codigo_ruta',
            'nombre' => 'required|string|max:120',
            'origen' => 'required|string|max:120',
            'destino' => 'required|string|max:120',
            'distancia_km' => 'required|numeric|min:0.1',
            'tiempo_estimado_minutos' => 'required|integer|min:1',
            'paraderos_json' => 'nullable|array',
            'color' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        $ruta = Ruta::create($validated);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'ruta_creada',
            'module' => 'rutas',
            'details' => "Ruta creada: {$ruta->codigo_ruta} - {$ruta->nombre}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Ruta registrada exitosamente',
            'data' => $ruta
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $ruta = Ruta::findOrFail($id);

        $validated = $request->validate([
            'codigo_ruta' => 'required|string|max:20|unique:rutas,codigo_ruta,' . $ruta->id,
            'nombre' => 'required|string|max:120',
            'origen' => 'required|string|max:120',
            'destino' => 'required|string|max:120',
            'distancia_km' => 'required|numeric|min:0.1',
            'tiempo_estimado_minutos' => 'required|integer|min:1',
            'paraderos_json' => 'nullable|array',
            'color' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        $oldValues = $ruta->toArray();
        $ruta->update($validated);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'UPDATE_RUTA',
            'table_name' => 'rutas',
            'record_id' => $ruta->id,
            'old_values' => $oldValues,
            'new_values' => $ruta->toArray(),
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Ruta actualizada exitosamente',
            'data' => $ruta
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $ruta = Ruta::findOrFail($id);
        $ruta->delete();

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'DELETE_RUTA',
            'table_name' => 'rutas',
            'record_id' => $ruta->id,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Ruta eliminada (baja lógica)'
        ]);
    }
}
