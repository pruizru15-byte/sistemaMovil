<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model
{
    use HasFactory;

    protected $table = 'notificaciones';

    protected $fillable = [
        'user_id',
        'role_target',
        'titulo',
        'mensaje',
        'tipo',
        'leido_en',
        'data_json',
    ];

    protected $casts = [
        'data_json' => 'array',
        'leido_en' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isLeido(): bool
    {
        return $this->leido_en !== null;
    }
}

