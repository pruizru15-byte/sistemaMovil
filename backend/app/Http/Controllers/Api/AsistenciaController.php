<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asistencia;
use App\Models\AsignacionTurno;
use App\Models\AuditLog;
use App\Models\Configuracion;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AsistenciaController extends Controller
{
    // Coordenadas base del Terminal de Ate (LAN Offline)
    const TERMINAL_LAT = -12.0256;
    const TERMINAL_LNG = -76.9205;
    const GEOCERCA_RADIO_METROS = 300.0;

    public function index(Request $request)
    {
        $query = Asistencia::with(['conductor.user', 'asignacion.turno', 'asignacion.vehiculo', 'asignacion.ruta']);

        if ($request->filled('fecha')) {
            $query->whereDate('fecha_hora_servidor', $request->query('fecha'));
        }

        if ($request->filled('conductor_id')) {
            $query->where('conductor_id', $request->query('conductor_id'));
        }

        if ($request->filled('tipo')) {
            $query->where('tipo', $request->query('tipo'));
        }

        if ($request->filled('estado_puntualidad')) {
            $query->where('estado_puntualidad', $request->query('estado_puntualidad'));
        }

        $user = $request->user();
        if ($user->role === 'conductor') {
            $conductor = $user->conductor;
            if ($conductor) {
                $query->where('conductor_id', $conductor->id);
            }
        }

        $asistencias = $query->orderBy('fecha_hora_servidor', 'desc')->get();

        $total = $asistencias->count();
        $aTiempo = $asistencias->where('estado_puntualidad', 'a_tiempo')->count();
        $tardanzas = $asistencias->where('estado_puntualidad', 'tardanza')->count();
        $dentroGeocerca = $asistencias->where('dentro_geocerca', true)->count();

        $terminalLat = (float) Configuracion::get('geocerca_lat', self::TERMINAL_LAT);
        $terminalLng = (float) Configuracion::get('geocerca_lng', self::TERMINAL_LNG);
        $radioMetros = (float) Configuracion::get('geocerca_radio_metros', self::GEOCERCA_RADIO_METROS);

        return response()->json([
            'data' => $asistencias,
            'summary' => [
                'total' => $total,
                'a_tiempo' => $aTiempo,
                'tardanzas' => $tardanzas,
                'faltas' => 0,
                'dentro_geocerca' => $dentroGeocerca,
                'porcentaje_geocerca' => $total > 0 ? round(($dentroGeocerca / $total) * 100, 1) : 100,
                'terminal_coordenadas' => [
                    'lat' => $terminalLat,
                    'lng' => $terminalLng,
                    'radio_metros' => $radioMetros
                ]
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'conductor_id' => 'required|exists:conductores,id',
            'asignacion_turno_id' => 'nullable|exists:asignaciones_turno,id',
            'tipo' => 'required|in:entrada,salida',
            'fecha_hora_dispositivo' => 'required|date',
            'latitud' => 'required|numeric|between:-90,90',
            'longitud' => 'required|numeric|between:-180,180',
            'precision_metros' => 'required|numeric|min:0',
            'es_mock_location' => 'nullable|boolean',
            'observaciones' => 'nullable|string|max:500',
        ]);

        $serverNow = Carbon::now();
        $deviceTime = Carbon::parse($validated['fecha_hora_dispositivo']);
        $diffMinutes = abs($serverNow->diffInMinutes($deviceTime));

        $terminalLat = (float) Configuracion::get('geocerca_lat', self::TERMINAL_LAT);
        $terminalLng = (float) Configuracion::get('geocerca_lng', self::TERMINAL_LNG);
        $radioMetros = (float) Configuracion::get('geocerca_radio_metros', self::GEOCERCA_RADIO_METROS);

        // Cálculo de distancia Haversine al Terminal de Ate
        $distanciaMetros = $this->calcularDistanciaHaversine(
            $validated['latitud'],
            $validated['longitud'],
            $terminalLat,
            $terminalLng
        );

        $dentroGeocerca = ($distanciaMetros <= $radioMetros);
        $esMock = $validated['es_mock_location'] ?? false;

        // Evaluar puntualidad
        $estadoPuntualidad = 'a_tiempo';
        $asignacion = null;

        if (!empty($validated['asignacion_turno_id'])) {
            $asignacion = AsignacionTurno::with('turno')->find($validated['asignacion_turno_id']);
        } else {
            // Buscar asignación para hoy del conductor
            $asignacion = AsignacionTurno::with('turno')
                ->where('conductor_id', $validated['conductor_id'])
                ->whereDate('fecha', $serverNow->toDateString())
                ->first();
        }

        if ($asignacion && $asignacion->turno && $validated['tipo'] === 'entrada') {
            $horaInicioTurno = Carbon::parse($serverNow->toDateString() . ' ' . $asignacion->turno->hora_inicio);
            $toleranciaMinutos = $asignacion->turno->tolerancia_minutos ?? 10;
            $horaLimite = $horaInicioTurno->copy()->addMinutes($toleranciaMinutos);

            if ($serverNow->greaterThan($horaLimite)) {
                $estadoPuntualidad = 'tardanza';
            }
        }

        $asistencia = Asistencia::create([
            'conductor_id' => $validated['conductor_id'],
            'asignacion_turno_id' => $asignacion ? $asignacion->id : null,
            'tipo' => $validated['tipo'],
            'fecha_hora_servidor' => $serverNow,
            'fecha_hora_dispositivo' => $deviceTime,
            'latitud' => $validated['latitud'],
            'longitud' => $validated['longitud'],
            'precision_metros' => $validated['precision_metros'],
            'distancia_terminal_metros' => round($distanciaMetros, 2),
            'dentro_geocerca' => $dentroGeocerca,
            'es_mock_location' => $esMock,
            'estado_puntualidad' => $estadoPuntualidad,
            'minutos_diferencia' => $diffMinutes,
            'ip_origen' => $request->ip(),
            'user_agent' => substr($request->userAgent() ?? 'Desconocido', 0, 255),
            'validado' => $dentroGeocerca && !$esMock && $diffMinutes <= 15,
            'observaciones' => $validated['observaciones'] ?? null,
        ]);

        $asistencia->load(['conductor.user', 'asignacion.turno', 'asignacion.vehiculo', 'asignacion.ruta']);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'asistencia_' . $validated['tipo'],
            'module' => 'asistencias',
            'details' => "Marcación {$validated['tipo']} conductor #{$validated['conductor_id']}. Distancia: {$distanciaMetros}m. Geocerca: " . ($dentroGeocerca ? 'DENTRO' : 'FUERA'),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Marcación registrada correctamente',
            'data' => $asistencia,
            'geocerca' => [
                'dentro' => $dentroGeocerca,
                'distancia_metros' => round($distanciaMetros, 1),
                'radio_permitido' => self::GEOCERCA_RADIO_METROS,
                'terminal' => 'Terminal Terrestre de Ate'
            ]
        ], 201);
    }

    private function calcularDistanciaHaversine($lat1, $lon1, $lat2, $lon2): float
    {
        $radioTierra = 6371000; // metros

        $latDelta = deg2rad($lat2 - $lat1);
        $lonDelta = deg2rad($lon2 - $lon1);

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($lonDelta / 2) * sin($lonDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $radioTierra * $c;
    }
}
