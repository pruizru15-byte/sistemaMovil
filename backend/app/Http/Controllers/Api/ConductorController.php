<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Conductor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ConductorController extends Controller
{
    /**
     * Listar conductores con filtros y estadísticas.
     */
    public function index(Request $request)
    {
        $query = Conductor::with('user');

        // Búsqueda por término
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('licencia_conducir', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('last_name', 'like', "%{$search}%")
                         ->orWhere('dni', 'like', "%{$search}%")
                         ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        // Filtro por estado operativo
        if ($estado = $request->query('estado')) {
            if ($estado !== 'todos') {
                $query->where('estado_operativo', $estado);
            }
        }

        $conductores = $query->orderBy('id', 'desc')->get();

        // Estadísticas para KPIs
        $stats = [
            'total' => Conductor::count(),
            'disponibles' => Conductor::where('estado_operativo', 'disponible')->count(),
            'en_servicio' => Conductor::where('estado_operativo', 'en_servicio')->count(),
            'descanso' => Conductor::where('estado_operativo', 'descanso')->count(),
            'suspendidos' => Conductor::where('estado_operativo', 'suspendido')->count(),
        ];

        return response()->json([
            'data' => $conductores,
            'stats' => $stats,
        ]);
    }

    /**
     * Obtener detalle de un conductor.
     */
    public function show($id)
    {
        $conductor = Conductor::with('user')->findOrFail($id);

        return response()->json($conductor);
    }

    /**
     * Registrar un nuevo conductor con su usuario correspondiente.
     */
    public function store(Request $request)
    {
        if (! $request->user()->isAdmin() && ! $request->user()->isSupervisor()) {
            return response()->json(['message' => 'No autorizado para registrar conductores.'], 403);
        }

        $validated = $request->validate([
            'dni' => ['required', 'digits:8', 'unique:users,dni'],
            'name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
            'licencia_conducir' => ['required', 'string', 'max:20', 'unique:conductores,licencia_conducir'],
            'categoria_licencia' => ['required', 'string', 'max:10'],
            'licencia_vencimiento' => ['nullable', 'date'],
            'experiencia_anos' => ['nullable', 'integer', 'min:0'],
            'estado_operativo' => ['required', 'in:disponible,en_servicio,descanso,vacaciones,suspendido'],
            'contacto_emergencia_nombre' => ['nullable', 'string', 'max:100'],
            'contacto_emergencia_telefono' => ['nullable', 'string', 'max:20'],
            'notas' => ['nullable', 'string'],
        ]);

        return DB::transaction(function () use ($validated, $request) {
            // Contraseña inicial igual al DNI
            $user = User::create([
                'dni' => $validated['dni'],
                'name' => $validated['name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
                'role' => 'conductor',
                'is_active' => true,
                'password_must_change' => true,
                'password' => Hash::make($validated['dni']),
            ]);

            $conductor = Conductor::create([
                'user_id' => $user->id,
                'licencia_conducir' => $validated['licencia_conducir'],
                'categoria_licencia' => $validated['categoria_licencia'],
                'licencia_vencimiento' => $validated['licencia_vencimiento'] ?? null,
                'experiencia_anos' => $validated['experiencia_anos'] ?? 1,
                'estado_operativo' => $validated['estado_operativo'],
                'contacto_emergencia_nombre' => $validated['contacto_emergencia_nombre'] ?? null,
                'contacto_emergencia_telefono' => $validated['contacto_emergencia_telefono'] ?? null,
                'notas' => $validated['notas'] ?? null,
            ]);

            AuditLog::create([
                'user_id' => $request->user()->id,
                'action' => 'conductor_created',
                'module' => 'conductores',
                'details' => "Conductor creado: {$user->name} {$user->last_name} (DNI {$user->dni})",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'message' => 'Conductor registrado exitosamente.',
                'conductor' => $conductor->load('user'),
            ], 201);
        });
    }

    /**
     * Actualizar conductor y datos del usuario.
     */
    public function update(Request $request, $id)
    {
        if (! $request->user()->isAdmin() && ! $request->user()->isSupervisor()) {
            return response()->json(['message' => 'No autorizado para editar conductores.'], 403);
        }

        $conductor = Conductor::with('user')->findOrFail($id);

        $validated = $request->validate([
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
            'licencia_conducir' => ['required', 'string', 'max:20', "unique:conductores,licencia_conducir,{$conductor->id}"],
            'categoria_licencia' => ['required', 'string', 'max:10'],
            'licencia_vencimiento' => ['nullable', 'date'],
            'experiencia_anos' => ['nullable', 'integer', 'min:0'],
            'estado_operativo' => ['required', 'in:disponible,en_servicio,descanso,vacaciones,suspendido'],
            'contacto_emergencia_nombre' => ['nullable', 'string', 'max:100'],
            'contacto_emergencia_telefono' => ['nullable', 'string', 'max:20'],
            'notas' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($conductor, $validated, $request) {
            $conductor->user->update([
                'phone' => $validated['phone'] ?? $conductor->user->phone,
                'address' => $validated['address'] ?? $conductor->user->address,
            ]);

            $conductor->update([
                'licencia_conducir' => $validated['licencia_conducir'],
                'categoria_licencia' => $validated['categoria_licencia'],
                'licencia_vencimiento' => $validated['licencia_vencimiento'] ?? $conductor->licencia_vencimiento,
                'experiencia_anos' => $validated['experiencia_anos'] ?? $conductor->experiencia_anos,
                'estado_operativo' => $validated['estado_operativo'],
                'contacto_emergencia_nombre' => $validated['contacto_emergencia_nombre'] ?? $conductor->contacto_emergencia_nombre,
                'contacto_emergencia_telefono' => $validated['contacto_emergencia_telefono'] ?? $conductor->contacto_emergencia_telefono,
                'notas' => $validated['notas'] ?? $conductor->notas,
            ]);

            AuditLog::create([
                'user_id' => $request->user()->id,
                'action' => 'conductor_updated',
                'module' => 'conductores',
                'details' => "Conductor actualizado ID {$conductor->id} ({$conductor->user->name} {$conductor->user->last_name})",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        });

        return response()->json([
            'message' => 'Conductor actualizado correctamente.',
            'conductor' => $conductor->fresh(['user']),
        ]);
    }

    /**
     * Desactivar lógicamente conductor.
     */
    public function destroy(Request $request, $id)
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Solo administradores pueden desactivar conductores.'], 403);
        }

        $conductor = Conductor::with('user')->findOrFail($id);

        DB::transaction(function () use ($conductor, $request) {
            $conductor->user->update(['is_active' => false]);
            $conductor->user->delete();
            $conductor->delete();

            AuditLog::create([
                'user_id' => $request->user()->id,
                'action' => 'conductor_deleted',
                'module' => 'conductores',
                'details' => "Conductor dado de baja lógica: DNI {$conductor->user->dni}",
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        });

        return response()->json(['message' => 'Conductor dado de baja correctamente.']);
    }
}
