<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Conductor extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'conductores';

    protected $fillable = [
        'user_id',
        'licencia_conducir',
        'categoria_licencia',
        'licencia_vencimiento',
        'experiencia_anos',
        'estado_operativo',
        'contacto_emergencia_nombre',
        'contacto_emergencia_telefono',
        'notas',
    ];

    protected function casts(): array
    {
        return [
            'licencia_vencimiento' => 'date',
            'experiencia_anos' => 'integer',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
