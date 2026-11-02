<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Configuracion extends Model
{
    use HasFactory;

    protected $table = 'configuraciones';

    protected $fillable = [
        'clave',
        'valor',
        'descripcion',
        'grupo',
    ];

    /**
     * Helper estático para obtener valor con fallback.
     */
    public static function get(string $clave, $default = null)
    {
        $item = static::where('clave', $clave)->first();
        return $item ? $item->valor : $default;
    }

    /**
     * Helper estático para guardar o actualizar.
     */
    public static function set(string $clave, $valor, string $grupo = 'general', ?string $descripcion = null): self
    {
        return static::updateOrCreate(
            ['clave' => $clave],
            [
                'valor' => (string) $valor,
                'grupo' => $grupo,
                'descripcion' => $descripcion,
            ]
        );
    }
}
