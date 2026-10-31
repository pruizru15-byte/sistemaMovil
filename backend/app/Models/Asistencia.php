<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asistencia extends Model
{
    use HasFactory;

    protected $table = 'asistencias';

    protected $fillable = [
        'conductor_id',
        'asignacion_turno_id',
        'tipo',
        'fecha_hora_servidor',
        'fecha_hora_dispositivo',
        'latitud',
        'longitud',
        'precision_metros',
        'distancia_terminal_metros',
        'dentro_geocerca',
        'es_mock_location',
        'estado_puntualidad',
        'minutos_diferencia',
        'ip_origen',
        'user_agent',
        'validado',
        'observaciones',
    ];

    protected function casts(): array
    {
        return [
            'fecha_hora_servidor' => 'datetime',
            'fecha_hora_dispositivo' => 'datetime',
            'latitud' => 'decimal:7',
            'longitud' => 'decimal:7',
            'precision_metros' => 'decimal:2',
            'distancia_terminal_metros' => 'decimal:2',
            'dentro_geocerca' => 'boolean',
            'es_mock_location' => 'boolean',
            'validado' => 'boolean',
            'minutos_diferencia' => 'integer',
        ];
    }

    public function conductor()
    {
        return $this->belongsTo(Conductor::class);
    }

    public function asignacion()
    {
        return $this->belongsTo(AsignacionTurno::class, 'asignacion_turno_id');
    }
}
