<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class PerfilController extends Controller
{
    /**
     * Obtener el perfil completo del usuario autenticado.
     */
    public function show(Request $request)
    {
        $user = $request->user()->load('conductor');

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
            'conductor' => $user->conductor ? [
                'id' => $user->conductor->id,
                'licencia_numero' => $user->conductor->licencia_numero,
                'licencia_categoria' => $user->conductor->licencia_categoria,
                'licencia_vencimiento' => $user->conductor->licencia_vencimiento,
                'estado' => $user->conductor->estado,
            ] : null,
        ]);
    }

    /**
     * Actualizar datos personales permitidos (DNI y rol protegidos).
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:100', 'unique:users,email,' . $user->id],
            'photo_url' => ['nullable', 'string', 'max:500'],
        ], [
            'email.email' => 'El correo electrónico debe ser válido.',
            'email.unique' => 'El correo electrónico ya está registrado por otro usuario.',
        ]);

        $user->update([
            'phone' => $validated['phone'] ?? $user->phone,
            'address' => $validated['address'] ?? $user->address,
            'email' => $validated['email'] ?? $user->email,
            'photo_url' => array_key_exists('photo_url', $validated) ? $validated['photo_url'] : $user->photo_url,
        ]);

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'profile_updated',
            'module' => 'perfil',
            'details' => 'Usuario actualizó sus datos de contacto y perfil',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Perfil actualizado correctamente.',
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
     * Cambio de contraseña propia con verificación de contraseña actual.
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ], [
            'current_password.required' => 'La contraseña actual es obligatoria.',
            'password.required' => 'La nueva contraseña es obligatoria.',
            'password.min' => 'La nueva contraseña debe tener al menos 6 caracteres.',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
        ]);

        if (! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['La contraseña actual no es correcta.'],
            ]);
        }

        $user->password = Hash::make($validated['password']);
        $user->password_must_change = false;
        $user->save();

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'password_changed',
            'module' => 'perfil',
            'details' => 'Usuario cambió su contraseña exitosamente',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Contraseña modificada exitosamente.',
        ]);
    }
}

