<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Incidencia extends Model
{
    use HasFactory;

    protected $table = 'incidencias';

    protected $fillable = [
        'servicio_id',
        'conductor_id',
        'vehiculo_id',
        'ruta_id',
        'tipo',
        'prioridad',
        'titulo',
        'descripcion',
        'ubicacion_referencia',
        'latitud',
        'longitud',
        'estado',
        'fecha_hora',
        'atendida_por',
    ];

    protected function casts(): array
    {
        return [
            'fecha_hora' => 'datetime',
            'latitud' => 'decimal:7',
            'longitud' => 'decimal:7',
        ];
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

    public function servicio()
    {
        return $this->belongsTo(Servicio::class);
    }

    public function atendidoPor()
    {
        return $this->belongsTo(User::class, 'atendida_por');
    }
}
