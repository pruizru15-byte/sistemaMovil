<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Servicio extends Model
{
    use HasFactory;

    protected $table = 'servicios';

    protected $fillable = [
        'asignacion_turno_id',
        'conductor_id',
        'vehiculo_id',
        'ruta_id',
        'hora_inicio_real',
        'hora_fin_real',
        'km_inicio',
        'km_fin',
        'pasajeros_transportados',
        'estado',
        'observaciones',
    ];

    protected function casts(): array
    {
        return [
            'hora_inicio_real' => 'datetime',
            'hora_fin_real' => 'datetime',
            'km_inicio' => 'integer',
            'km_fin' => 'integer',
            'pasajeros_transportados' => 'integer',
        ];
    }

    public function asignacion()
    {
        return $this->belongsTo(AsignacionTurno::class, 'asignacion_turno_id');
    }

    public function conductor()
    {
        return $this->belongsTo(Conductor::class);
    }

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class);
    }

    public function ruta()
    {
        return $this->belongsTo(Ruta::class);
    }

    public function incidencias()
    {
        return $this->hasMany(Incidencia::class);
    }
}
