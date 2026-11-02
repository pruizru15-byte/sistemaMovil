<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tabla de Configuraciones del Sistema LAN
        Schema::create('configuraciones', function (Blueprint $table) {
            $table->id();
            $table->string('clave', 50)->unique();
            $table->text('valor');
            $table->string('descripcion', 255)->nullable();
            $table->string('grupo', 50)->default('general');
            $table->timestamps();
        });

        // 2. Tabla de Notificaciones y Alertas Operativas LAN
        Schema::create('notificaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('role_target', ['admin', 'supervisor', 'conductor', 'todos'])->default('todos');
            $table->string('titulo', 150);
            $table->text('mensaje');
            $table->enum('tipo', ['info', 'alerta', 'incidencia', 'turno', 'asistencia'])->default('info');
            $table->timestamp('leido_en')->nullable();
            $table->json('data_json')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'leido_en']);
            $table->index(['role_target', 'created_at']);
        });

        // Valores iniciales por defecto para el Terminal de Ate
        DB::table('configuraciones')->insert([
            [
                'clave' => 'terminal_nombre',
                'valor' => 'Terminal Central de Ate',
                'descripcion' => 'Nombre del terminal principal',
                'grupo' => 'geocerca',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'clave' => 'geocerca_lat',
                'valor' => '-12.0256',
                'descripcion' => 'Latitud de geocerca del terminal',
                'grupo' => 'geocerca',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'clave' => 'geocerca_lng',
                'valor' => '-76.9205',
                'descripcion' => 'Longitud de geocerca del terminal',
                'grupo' => 'geocerca',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'clave' => 'geocerca_radio_metros',
                'valor' => '300',
                'descripcion' => 'Radio permitido en metros para marcación GPS',
                'grupo' => 'geocerca',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'clave' => 'tolerancia_tardanza_minutos',
                'valor' => '15',
                'descripcion' => 'Minutos de tolerancia antes de marcar tardanza',
                'grupo' => 'asistencia',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'clave' => 'anticipacion_maxima_minutos',
                'valor' => '60',
                'descripcion' => 'Minutos permitidos para marcar antes de inicio de turno',
                'grupo' => 'asistencia',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'clave' => 'empresa_nombre',
                'valor' => 'Transportes de Personal Ate S.A.C.',
                'descripcion' => 'Razón social del operador de transporte',
                'grupo' => 'general',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Notificaciones iniciales de bienvenida
        DB::table('notificaciones')->insert([
            [
                'user_id' => null,
                'role_target' => 'todos',
                'titulo' => 'Servidor Local LAN Conectado',
                'mensaje' => 'El sistema de control de asistencia y asignación de turnos se encuentra operando en el Terminal de Ate.',
                'tipo' => 'info',
                'created_at' => now()->subMinutes(10),
                'updated_at' => now()->subMinutes(10),
            ],
            [
                'user_id' => null,
                'role_target' => 'conductor',
                'titulo' => 'Marcación GPS dentro de Geocerca',
                'mensaje' => 'Recuerde activar su ubicación GPS y marcar asistencia al ingresar al perímetro de 300m del Terminal de Ate.',
                'tipo' => 'alerta',
                'created_at' => now()->subMinutes(5),
                'updated_at' => now()->subMinutes(5),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notificaciones');
        Schema::dropIfExists('configuraciones');
    }
};
