<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Configuracion;
use Illuminate\Http\Request;

class ConfiguracionController extends Controller
{
    /**
     * Listar todas las configuraciones del sistema.
     */
    public function index(Request $request)
    {
        $configs = Configuracion::all();
        $map = [];

        foreach ($configs as $cfg) {
            $map[$cfg->clave] = $cfg->valor;
        }

        return response()->json([
            'settings' => $map,
            'grouped' => $configs->groupBy('grupo'),
            'geocerca' => [
                'terminal_nombre' => $map['terminal_nombre'] ?? 'Terminal Central de Ate',
                'lat' => (float) ($map['geocerca_lat'] ?? -12.0256),
                'lng' => (float) ($map['geocerca_lng'] ?? -76.9205),
                'radio_metros' => (float) ($map['geocerca_radio_metros'] ?? 300),
            ],
            'tolerancias' => [
                'tardanza_minutos' => (int) ($map['tolerancia_tardanza_minutos'] ?? 15),
                'anticipacion_minutos' => (int) ($map['anticipacion_maxima_minutos'] ?? 60),
            ],
        ]);
    }

    /**
     * Actualizar configuraciones del sistema (Solo Administradores).
     */
    public function update(Request $request)
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'No autorizado. Se requieren privilegios de Administrador.'], 403);
        }

        $validated = $request->validate([
            'terminal_nombre' => ['nullable', 'string', 'max:100'],
            'geocerca_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'geocerca_lng' => ['nullable', 'numeric', 'between:-180,180'],
            'geocerca_radio_metros' => ['nullable', 'numeric', 'min:50', 'max:5000'],
            'tolerancia_tardanza_minutos' => ['nullable', 'integer', 'min:0', 'max:120'],
            'anticipacion_maxima_minutos' => ['nullable', 'integer', 'min:0', 'max:180'],
            'empresa_nombre' => ['nullable', 'string', 'max:150'],
        ]);

        foreach ($validated as $clave => $valor) {
            if ($valor !== null) {
                $grupo = str_contains($clave, 'geocerca') || str_contains($clave, 'terminal')
                    ? 'geocerca'
                    : (str_contains($clave, 'tardanza') || str_contains($clave, 'anticipacion') ? 'asistencia' : 'general');

                Configuracion::set($clave, $valor, $grupo);
            }
        }

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'configuration_updated',
            'module' => 'configuracion',
            'details' => 'Parámetros del sistema y geocerca actualizados por Administrador',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Configuración del sistema actualizada correctamente.',
        ]);
    }
}

