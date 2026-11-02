<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AsignacionTurno;
use App\Models\Asistencia;
use App\Models\AuditLog;
use App\Models\Servicio;
use App\Models\Vehiculo;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReporteController extends Controller
{
    /**
     * Resumen de KPIs de reportes y auditoría.
     */
    public function stats(Request $request)
    {
        $fechaInicio = $request->query('fecha_inicio', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $fechaFin = $request->query('fecha_fin', Carbon::now()->format('Y-m-d'));

        $totalAsistencias = Asistencia::whereBetween('fecha', [$fechaInicio, $fechaFin])->count();
        $puntuales = Asistencia::whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->where('estado', 'puntual')
            ->count();
        $enGeocerca = Asistencia::whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->where('distancia_terminal_metros', '<=', 300)
            ->count();

        $tasaPuntualidad = $totalAsistencias > 0
            ? round(($puntuales / $totalAsistencias) * 100, 1)
            : 100.0;

        $cumplimientoGps = $totalAsistencias > 0
            ? round(($enGeocerca / $totalAsistencias) * 100, 1)
            : 100.0;

        $totalServicios = Servicio::whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->where('estado', 'completado')
            ->count();

        return response()->json([
            'total_asistencias' => $totalAsistencias,
            'tasa_puntualidad' => $tasaPuntualidad,
            'cumplimiento_gps' => $cumplimientoGps,
            'servicios_completados' => $totalServicios,
            'horas_estimadas' => $totalServicios * 4,
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin,
        ]);
    }

    /**
     * Exportar reporte consolidado de Asistencias y Puntualidad (CSV compatible con Excel).
     */
    public function exportAsistencias(Request $request): StreamedResponse
    {
        $fechaInicio = $request->query('fecha_inicio', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $fechaFin = $request->query('fecha_fin', Carbon::now()->format('Y-m-d'));

        $asistencias = Asistencia::with(['conductor.user', 'turno'])
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->orderBy('fecha', 'desc')
            ->orderBy('hora_marcada', 'desc')
            ->get();

        $filename = "Reporte_Asistencias_{$fechaInicio}_al_{$fechaFin}.csv";

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'report_exported',
            'module' => 'reportes',
            'details' => "Exportación de reporte de asistencias del {$fechaInicio} al {$fechaFin}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->streamDownload(function () use ($asistencias) {
            $handle = fopen('php://output', 'w');
            // BOM UTF-8 para que Excel reconozca acentos y caracteres latinos
            fputs($handle, "\xEF\xBB\xBF");

            // Cabeceras de columnas
            fputcsv($handle, [
                'ID',
                'Fecha',
                'Hora Marcada',
                'DNI',
                'Conductor',
                'Tipo Marcación',
                'Turno',
                'Estado Puntualidad',
                'Latitud',
                'Longitud',
                'Distancia Terminal (m)',
                'Mock Location Detectado',
                'IP Servidor LAN',
            ]);

            foreach ($asistencias as $asist) {
                fputcsv($handle, [
                    $asist->id,
                    $asist->fecha,
                    $asist->hora_marcada,
                    $asist->conductor->user->dni ?? 'N/A',
                    $asist->conductor->user->full_name ?? ($asist->conductor->user->name ?? 'N/A'),
                    $asist->tipo_marcacion ?? 'ingreso',
                    $asist->turno->nombre ?? 'N/A',
                    $asist->estado,
                    $asist->latitud,
                    $asist->longitud,
                    $asist->distancia_terminal_metros,
                    $asist->is_mock_location ? 'SI (FRAUDE)' : 'NO',
                    $asist->ip_address ?? 'LAN Local',
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Exportar reporte de Rendimiento y Estado de la Flota (CSV).
     */
    public function exportVehiculos(Request $request): StreamedResponse
    {
        $vehiculos = Vehiculo::orderBy('placa')->get();
        $filename = "Reporte_Flota_Vehicular_" . now()->format('Y-m-d') . ".csv";

        return response()->streamDownload(function () use ($vehiculos) {
            $handle = fopen('php://output', 'w');
            fputs($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'ID',
                'Placa',
                'Marca',
                'Modelo',
                'Año',
                'Capacidad Pasajeros',
                'Estado Operativo',
                'SOAT Vencimiento',
                'Revisión Técnica',
            ]);

            foreach ($vehiculos as $v) {
                fputcsv($handle, [
                    $v->id,
                    $v->placa,
                    $v->marca,
                    $v->modelo,
                    $v->anio,
                    $v->capacidad_pasajeros,
                    $v->estado,
                    $v->soat_vencimiento ?? 'N/A',
                    $v->revision_tecnica_vencimiento ?? 'N/A',
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Exportar matriz de Turnos y Asignaciones (CSV).
     */
    public function exportTurnos(Request $request): StreamedResponse
    {
        $fechaInicio = $request->query('fecha_inicio', Carbon::now()->startOfWeek()->format('Y-m-d'));
        $fechaFin = $request->query('fecha_fin', Carbon::now()->endOfWeek()->format('Y-m-d'));

        $asignaciones = AsignacionTurno::with(['conductor.user', 'vehiculo', 'ruta', 'turno'])
            ->whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->orderBy('fecha', 'desc')
            ->get();

        $filename = "Reporte_Asignacion_Turnos_{$fechaInicio}_al_{$fechaFin}.csv";

        return response()->streamDownload(function () use ($asignaciones) {
            $handle = fopen('php://output', 'w');
            fputs($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'ID',
                'Fecha',
                'Turno',
                'Horario',
                'Conductor',
                'DNI',
                'Vehículo (Placa)',
                'Ruta Asignada',
                'Estado Asignación',
            ]);

            foreach ($asignaciones as $asig) {
                fputcsv($handle, [
                    $asig->id,
                    $asig->fecha,
                    $asig->turno->nombre ?? 'N/A',
                    ($asig->turno ? "{$asig->turno->hora_inicio} - {$asig->turno->hora_fin}" : 'N/A'),
                    $asig->conductor->user->full_name ?? ($asig->conductor->user->name ?? 'N/A'),
                    $asig->conductor->user->dni ?? 'N/A',
                    $asig->vehiculo->placa ?? 'N/A',
                    $asig->ruta->nombre ?? 'Sin ruta',
                    $asig->estado,
                ]);
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
