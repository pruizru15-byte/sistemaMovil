<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AsignacionTurno extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'asignaciones_turno';

    protected $fillable = [
        'fecha',
        'turno_id',
        'conductor_id',
        'vehiculo_id',
        'ruta_id',
        'supervisor_id',
        'estado',
        'observaciones',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
        ];
    }

    public function turno()
    {
        return $this->belongsTo(Turno::class);
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

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function servicios()
    {
        return $this->hasMany(Servicio::class);
    }

    public function asistencias()
    {
        return $this->hasMany(Asistencia::class);
    }
}
