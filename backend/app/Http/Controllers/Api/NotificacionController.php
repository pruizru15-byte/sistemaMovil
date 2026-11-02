<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use Illuminate\Http\Request;

class NotificacionController extends Controller
{
    /**
     * Listar notificaciones aplicables al usuario actual.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Notificacion::where(function ($q) use ($user) {
            $q->where('user_id', $user->id)
                ->orWhere('role_target', 'todos')
                ->orWhere('role_target', $user->role);
        })->orderBy('created_at', 'desc');

        $notificaciones = $query->take(30)->get();

        $unreadCount = $notificaciones->whereNull('leido_en')->count();

        return response()->json([
            'data' => $notificaciones,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Marcar una notificación como leída.
     */
    public function markAsRead(Request $request, string $id)
    {
        $notificacion = Notificacion::findOrFail($id);
        $notificacion->leido_en = now();
        $notificacion->save();

        return response()->json([
            'message' => 'Notificación marcada como leída.',
        ]);
    }

    /**
     * Marcar todas las notificaciones como leídas.
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();

        Notificacion::where(function ($q) use ($user) {
            $q->where('user_id', $user->id)
                ->orWhere('role_target', 'todos')
                ->orWhere('role_target', $user->role);
        })
            ->whereNull('leido_en')
            ->update(['leido_en' => now()]);

        return response()->json([
            'message' => 'Todas las notificaciones han sido marcadas como leídas.',
        ]);
    }

    /**
     * Crear un anuncio o aviso operativo (Admin o Supervisor).
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'conductor') {
            return response()->json(['message' => 'No autorizado para emitir comunicados.'], 403);
        }

        $validated = $request->validate([
            'titulo' => ['required', 'string', 'max:150'],
            'mensaje' => ['required', 'string', 'max:1000'],
            'tipo' => ['required', 'in:info,alerta,incidencia,turno,asistencia'],
            'role_target' => ['required', 'in:admin,supervisor,conductor,todos'],
        ]);

        $notif = Notificacion::create([
            'user_id' => null, // Difusión general
            'role_target' => $validated['role_target'],
            'titulo' => $validated['titulo'],
            'mensaje' => $validated['mensaje'],
            'tipo' => $validated['tipo'],
        ]);

        return response()->json([
            'message' => 'Aviso emitido en la red local correctamente.',
            'notificacion' => $notif,
        ], 201);
    }
}

