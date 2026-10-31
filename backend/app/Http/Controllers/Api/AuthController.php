<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\PasswordResetRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Iniciar sesión con DNI y contraseña.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'dni' => ['required', 'digits:8'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:50'],
        ], [
            'dni.required' => 'El DNI es obligatorio.',
            'dni.digits' => 'El DNI debe tener exactamente 8 dígitos.',
            'password.required' => 'La contraseña es obligatoria.',
        ]);

        $throttleKey = 'login|' . $validated['dni'] . '|' . $request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return response()->json([
                'message' => "Demasiados intentos fallidos. Intente nuevamente en {$seconds} segundos.",
            ], 429);
        }

        $user = User::where('dni', $validated['dni'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            RateLimiter::hit($throttleKey, 60);

            return response()->json([
                'message' => 'Credenciales inválidas. Verifique su DNI y contraseña.',
            ], 401);
        }

        if (! $user->is_active) {
            return response()->json([
                'message' => 'Este usuario se encuentra inactivo. Comuníquese con la administración.',
            ], 403);
        }

        RateLimiter::clear($throttleKey);

        $deviceName = $validated['device_name'] ?? 'web-lan';
        $token = $user->createToken($deviceName)->plainTextToken;

        // Registrar auditoría de inicio de sesión
        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'login',
            'module' => 'auth',
            'details' => "Inicio de sesión exitoso desde {$deviceName}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Inicio de sesión exitoso.',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'dni' => $user->dni,
                'name' => $user->name,
                'last_name' => $user->last_name,
                'full_name' => "{$user->name} {$user->last_name}",
                'email' => $user->email,
                'phone' => $user->phone,
                'address' => $user->address,
                'photo_url' => $user->photo_url,
                'role' => $user->role,
                'is_active' => $user->is_active,
                'password_must_change' => $user->password_must_change,
            ],
        ]);
    }

    /**
     * Cerrar sesión y revocar token.
     */
    public function logout(Request $request)
    {
        $user = $request->user();

        if ($user && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();

            AuditLog::create([
                'user_id' => $user->id,
                'action' => 'logout',
                'module' => 'auth',
                'details' => 'Cierre de sesión de usuario',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        return response()->json([
            'message' => 'Sesión cerrada correctamente.',
        ]);
    }

    /**
     * Obtener datos del usuario autenticado.
     */
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'dni' => $user->dni,
            'name' => $user->name,
            'last_name' => $user->last_name,
            'full_name' => "{$user->name} {$user->last_name}",
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'photo_url' => $user->photo_url,
            'role' => $user->role,
            'is_active' => $user->is_active,
            'password_must_change' => $user->password_must_change,
        ]);
    }

    /**
     * Solicitar recuperación asistida de contraseña (offline LAN).
     */
    public function requestPasswordReset(Request $request)
    {
        $validated = $request->validate([
            'dni' => ['required', 'digits:8'],
            'notes' => ['nullable', 'string', 'max:255'],
        ], [
            'dni.required' => 'El DNI es obligatorio.',
            'dni.digits' => 'El DNI debe tener 8 dígitos.',
        ]);

        $user = User::where('dni', $validated['dni'])->first();

        if (! $user) {
            // Respuesta genérica para no enumerar usuarios
            return response()->json([
                'message' => 'Si el DNI se encuentra registrado, la solicitud fue recibida. Acérquese a la oficina de supervisión para su restablecimiento.',
            ]);
        }

        PasswordResetRequest::create([
            'user_id' => $user->id,
            'dni' => $user->dni,
            'status' => 'pending',
            'notes' => $validated['notes'] ?? 'Solicitud iniciada desde pantalla de acceso.',
        ]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'password_reset_requested',
            'module' => 'auth',
            'details' => "Solicitud de recuperación de contraseña para DNI {$user->dni}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Solicitud registrada. Por favor acérquese con su DNI ante el supervisor o administrador para la verificación presencial.',
        ]);
    }

    /**
     * Restablecer contraseña asistida por administrador.
     */
    public function resetAdmin(Request $request)
    {
        if (! $request->user()->isAdmin()) {
            return response()->json([
                'message' => 'No autorizado. Solo los administradores pueden restablecer contraseñas.',
            ], 403);
        }

        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'new_password' => ['required', 'string', 'min:6'],
        ]);

        $targetUser = User::findOrFail($validated['user_id']);
        $targetUser->password = Hash::make($validated['new_password']);
        $targetUser->password_must_change = true;
        $targetUser->save();

        // Revocar todos los tokens previos del usuario afectado
        $targetUser->tokens()->delete();

        // Actualizar solicitudes pendientes
        PasswordResetRequest::where('user_id', $targetUser->id)
            ->where('status', 'pending')
            ->update([
                'status' => 'resolved',
                'resolved_by' => $request->user()->id,
                'resolved_at' => now(),
            ]);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'password_reset_by_admin',
            'module' => 'auth',
            'details' => "Administrador restableció la contraseña del usuario DNI {$targetUser->dni}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => "Contraseña para el DNI {$targetUser->dni} restablecida correctamente. Deberá cambiarla en su siguiente acceso.",
        ]);
    }
}
