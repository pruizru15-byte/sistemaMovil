<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Turno extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'turnos';

    protected $fillable = [
        'nombre',
        'hora_inicio',
        'hora_fin',
        'tolerancia_minutos',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'tolerancia_minutos' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function asignaciones()
    {
        return $this->hasMany(AsignacionTurno::class);
    }
}
