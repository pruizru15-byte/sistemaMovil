<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehiculo extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'vehiculos';

    protected $fillable = [
        'numero_unidad',
        'placa',
        'marca',
        'modelo',
        'anio_fabricacion',
        'capacidad_pasajeros',
        'estado',
        'kilometraje',
        'soat_vencimiento',
        'revision_tecnica_vencimiento',
        'notas',
    ];

    protected function casts(): array
    {
        return [
            'anio_fabricacion' => 'integer',
            'capacidad_pasajeros' => 'integer',
            'kilometraje' => 'integer',
            'soat_vencimiento' => 'date',
            'revision_tecnica_vencimiento' => 'date',
        ];
    }
}
