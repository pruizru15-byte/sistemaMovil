<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ConductorController;
use App\Http\Controllers\Api\VehiculoController;
use App\Http\Controllers\Api\RutaController;
use App\Http\Controllers\Api\TurnoController;
use App\Http\Controllers\Api\ServicioController;
use App\Http\Controllers\Api\IncidenciaController;
use App\Http\Controllers\Api\AsistenciaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

Route::prefix('v1')->group(function () {
    // Verificación de estado del sistema LAN
    Route::get('/health', function () {
        $dbStatus = 'disconnected';
        try {
            DB::connection()->getPdo();
            $dbStatus = 'connected';
        } catch (\Exception $e) {
            $dbStatus = 'error: ' . $e->getMessage();
        }

        return response()->json([
            'status' => 'online',
            'system' => 'Sistema de Asistencia y Turnos - Terminal Ate',
            'version' => '1.0.0',
            'api_version' => 'v1',
            'database' => $dbStatus,
            'timestamp' => now()->format('Y-m-d H:i:s'),
            'timezone' => config('app.timezone'),
        ]);
    });

    // Rutas públicas de autenticación
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/password-reset-request', [AuthController::class, 'requestPasswordReset']);

    // Rutas protegidas con Sanctum
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/auth/reset-admin', [AuthController::class, 'resetAdmin']);

        // Módulo 03: Conductores
        Route::apiResource('conductores', ConductorController::class);

        // Módulo 04: Vehículos
        Route::apiResource('vehiculos', VehiculoController::class);

        // Módulo 10: Rutas
        Route::apiResource('rutas', RutaController::class);

        // Módulo 05: Turnos y Asignaciones
        Route::get('turnos', [TurnoController::class, 'index']);
        Route::get('asignaciones-turno', [TurnoController::class, 'asignaciones']);
        Route::post('asignaciones-turno', [TurnoController::class, 'storeAsignacion']);
        Route::put('asignaciones-turno/{id}', [TurnoController::class, 'updateAsignacion']);
        Route::delete('asignaciones-turno/{id}', [TurnoController::class, 'destroyAsignacion']);

        // Módulo 10: Servicios
        Route::get('servicios', [ServicioController::class, 'index']);
        Route::post('servicios', [ServicioController::class, 'store']);
        Route::post('servicios/{id}/finalizar', [ServicioController::class, 'finalizar']);

        // Incidencias y Alertas Operativas
        Route::get('incidencias', [IncidenciaController::class, 'index']);
        Route::post('incidencias', [IncidenciaController::class, 'store']);
        Route::post('incidencias/{id}/atender', [IncidenciaController::class, 'atender']);

        // Módulo 06: Asistencia GPS
        Route::get('asistencias', [AsistenciaController::class, 'index']);
        Route::post('asistencias', [AsistenciaController::class, 'store']);
    });
});
