<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ruta extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'rutas';

    protected $fillable = [
        'codigo_ruta',
        'nombre',
        'origen',
        'destino',
        'distancia_km',
        'tiempo_estimado_minutos',
        'paraderos_json',
        'color',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'distancia_km' => 'decimal:2',
            'tiempo_estimado_minutos' => 'integer',
            'paraderos_json' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function asignaciones()
    {
        return $this->hasMany(AsignacionTurno::class);
    }

    public function servicios()
    {
        return $this->hasMany(Servicio::class);
    }
}
