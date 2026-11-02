<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ConductorController;
use App\Http\Controllers\Api\VehiculoController;
use App\Http\Controllers\Api\RutaController;
use App\Http\Controllers\Api\TurnoController;
use App\Http\Controllers\Api\ServicioController;
use App\Http\Controllers\Api\IncidenciaController;
use App\Http\Controllers\Api\AsistenciaController;
use App\Http\Controllers\Api\PerfilController;
use App\Http\Controllers\Api\ReporteController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ConfiguracionController;
use App\Http\Controllers\Api\NotificacionController;
use App\Http\Controllers\Api\DashboardController;
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
        Route::put('/me', [PerfilController::class, 'update']);
        Route::post('/auth/reset-admin', [AuthController::class, 'resetAdmin']);

        // Módulo 02: Dashboard en Vivo
        Route::get('dashboard/stats', [DashboardController::class, 'stats']);

        // Módulo 11: Mi Perfil
        Route::get('perfil', [PerfilController::class, 'show']);
        Route::put('perfil', [PerfilController::class, 'update']);
        Route::put('perfil/password', [PerfilController::class, 'updatePassword']);

        // Módulo 01: Gestión de Usuarios (Admin)
        Route::apiResource('users', UserController::class);
        Route::post('users/{id}/toggle-status', [UserController::class, 'toggleStatus']);
        Route::post('users/{id}/reset-password', [UserController::class, 'resetPassword']);

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

        // Módulo 07: Reportes y Exportación
        Route::get('reportes/stats', [ReporteController::class, 'stats']);
        Route::get('reportes/asistencias/export', [ReporteController::class, 'exportAsistencias']);
        Route::get('reportes/vehiculos/export', [ReporteController::class, 'exportVehiculos']);
        Route::get('reportes/turnos/export', [ReporteController::class, 'exportTurnos']);

        // Módulo 08: Notificaciones y Alertas LAN
        Route::get('notificaciones', [NotificacionController::class, 'index']);
        Route::post('notificaciones', [NotificacionController::class, 'store']);
        Route::post('notificaciones/{id}/read', [NotificacionController::class, 'markAsRead']);
        Route::post('notificaciones/read-all', [NotificacionController::class, 'markAllAsRead']);

        // Módulo 09: Configuración (Admin)
        Route::get('configuracion', [ConfiguracionController::class, 'index']);
        Route::put('configuracion', [ConfiguracionController::class, 'update']);
    });
});
