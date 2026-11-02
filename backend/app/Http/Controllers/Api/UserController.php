<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Conductor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Listar todos los usuarios con filtros (Solo Administradores).
     */
    public function index(Request $request)
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'No autorizado. Se requieren privilegios de Administrador.'], 403);
        }

        $query = User::with('conductor')->orderBy('created_at', 'desc');

        if ($request->has('role') && in_array($request->role, ['admin', 'supervisor', 'conductor'])) {
            $query->where('role', $request->role);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('dni', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return response()->json($query->paginate(20));
    }

    /**
     * Crear nuevo usuario en el sistema LAN.
     */
    public function store(Request $request)
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $validated = $request->validate([
            'dni' => ['required', 'digits:8', 'unique:users,dni'],
            'name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:100', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
            'role' => ['required', 'in:admin,supervisor,conductor'],
            'password' => ['required', 'string', 'min:6'],
            // Si es conductor, datos de brevete opcionales
            'licencia_numero' => ['nullable', 'required_if:role,conductor', 'string', 'max:20'],
            'licencia_categoria' => ['nullable', 'string', 'max:10'],
            'licencia_vencimiento' => ['nullable', 'date'],
        ], [
            'dni.required' => 'El DNI es obligatorio.',
            'dni.digits' => 'El DNI debe tener exactamente 8 dígitos.',
            'dni.unique' => 'Ya existe un usuario registrado con este DNI.',
            'name.required' => 'El nombre es obligatorio.',
            'last_name.required' => 'Los apellidos son obligatorios.',
            'role.required' => 'El rol de usuario es obligatorio.',
            'password.min' => 'La contraseña debe tener mínimo 6 caracteres.',
        ]);

        $user = User::create([
            'dni' => $validated['dni'],
            'name' => $validated['name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'role' => $validated['role'],
            'password' => Hash::make($validated['password']),
            'is_active' => true,
            'password_must_change' => true,
        ]);

        // Si el rol es conductor, vincular o registrar perfil de conductor
        if ($user->role === 'conductor') {
            Conductor::create([
                'user_id' => $user->id,
                'licencia_numero' => $validated['licencia_numero'] ?? ('Q' . $user->dni),
                'licencia_categoria' => $validated['licencia_categoria'] ?? 'A-IIIa',
                'licencia_vencimiento' => $validated['licencia_vencimiento'] ?? now()->addYears(3)->format('Y-m-d'),
                'estado' => 'disponible',
            ]);
        }

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'user_created',
            'module' => 'usuarios',
            'details' => "Administrador creó usuario DNI {$user->dni} con rol {$user->role}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => "Usuario {$user->name} {$user->last_name} creado exitosamente.",
            'user' => $user->load('conductor'),
        ], 201);
    }

    /**
     * Actualizar datos y rol de usuario.
     */
    public function update(Request $request, string $id)
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:100', Rule::unique('users')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
            'role' => ['required', 'in:admin,supervisor,conductor'],
            'is_active' => ['boolean'],
        ]);

        // Evitar que el admin se desactive a sí mismo
        if ($user->id === $request->user()->id && isset($validated['is_active']) && ! $validated['is_active']) {
            return response()->json(['message' => 'No puede desactivar su propia cuenta de administrador.'], 422);
        }

        $user->update($validated);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'user_updated',
            'module' => 'usuarios',
            'details' => "Administrador actualizó información del usuario DNI {$user->dni}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Usuario actualizado correctamente.',
            'user' => $user->load('conductor'),
        ]);
    }

    /**
     * Desactivación lógica de usuario (Regla de negocio: nunca borrar físicamente con historial).
     */
    public function destroy(Request $request, string $id)
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'No puede eliminar ni desactivar su propio usuario administrador.'], 422);
        }

        // Desactivación lógica y revocar tokens activos
        $user->is_active = false;
        $user->save();
        $user->tokens()->delete();

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'user_deactivated',
            'module' => 'usuarios',
            'details' => "Administrador desactivó lógicamente la cuenta DNI {$user->dni}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => "La cuenta de {$user->name} {$user->last_name} ha sido desactivada lógicamente.",
        ]);
    }

    /**
     * Alternar estado activo / inactivo.
     */
    public function toggleStatus(Request $request, string $id)
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'No puede cambiar el estado de su propia cuenta.'], 422);
        }

        $user->is_active = ! $user->is_active;
        $user->save();

        if (! $user->is_active) {
            $user->tokens()->delete();
        }

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'user_status_toggled',
            'module' => 'usuarios',
            'details' => "Estado de usuario DNI {$user->dni} cambiado a " . ($user->is_active ? 'Activo' : 'Inactivo'),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => "Estado de la cuenta actualizado a " . ($user->is_active ? 'Activa' : 'Inactiva') . ".",
            'is_active' => $user->is_active,
        ]);
    }

    /**
     * Restablecer contraseña directamente por Administrador.
     */
    public function resetPassword(Request $request, string $id)
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $validated = $request->validate([
            'password' => ['required', 'string', 'min:6'],
        ], [
            'password.required' => 'La nueva contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
        ]);

        $user = User::findOrFail($id);
        $user->password = Hash::make($validated['password']);
        $user->password_must_change = true;
        $user->save();
        $user->tokens()->delete();

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'password_reset_by_admin',
            'module' => 'usuarios',
            'details' => "Contraseña restablecida por Administrador para usuario DNI {$user->dni}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => "Contraseña para el DNI {$user->dni} restablecida exitosamente. Deberá cambiarla al ingresar.",
        ]);
    }
}

