<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Rutas de transporte
        Schema::create('rutas', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_ruta', 20)->unique(); // Ej: R-01, R-03
            $table->string('nombre', 100); // Ej: Terminal Ate - Av. Javier Prado
            $table->string('origen', 100)->default('Terminal Ate');
            $table->string('destino', 100);
            $table->decimal('distancia_km', 6, 2)->default(15.00);
            $table->unsignedInteger('tiempo_estimado_minutos')->default(45);
            $table->json('paraderos_json')->nullable();
            $table->string('color', 20)->default('#2563EB');
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });

        // 2. Catálogo de Turnos (Horarios)
        Schema::create('turnos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 50); // Turno Mañana, Turno Tarde, Turno Noche
            $table->time('hora_inicio'); // 07:00:00
            $table->time('hora_fin'); // 15:30:00
            $table->unsignedInteger('tolerancia_minutos')->default(15);
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();
        });

        // 3. Asignaciones de Turno (Conductor + Vehículo + Ruta + Horario)
        Schema::create('asignaciones_turno', function (Blueprint $table) {
            $table->id();
            $table->date('fecha');
            $table->foreignId('turno_id')->constrained('turnos')->onDelete('cascade');
            $table->foreignId('conductor_id')->constrained('conductores')->onDelete('cascade');
            $table->foreignId('vehiculo_id')->constrained('vehiculos')->onDelete('cascade');
            $table->foreignId('ruta_id')->nullable()->constrained('rutas')->nullOnDelete();
            $table->foreignId('supervisor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('estado', [
                'programado',
                'en_curso',
                'completado',
                'cancelado',
                'inasistencia',
            ])->default('programado');
            $table->text('observaciones')->nullable();
            $table->softDeletes();
            $table->timestamps();

            // Índices de búsqueda y prevención de solapamientos
            $table->index(['fecha', 'estado']);
            $table->unique(['fecha', 'turno_id', 'conductor_id'], 'unique_conductor_turno_fecha');
            $table->unique(['fecha', 'turno_id', 'vehiculo_id'], 'unique_vehiculo_turno_fecha');
        });

        // 4. Servicios en Curso / Recorridos
        Schema::create('servicios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asignacion_turno_id')->nullable()->constrained('asignaciones_turno')->nullOnDelete();
            $table->foreignId('conductor_id')->constrained('conductores')->onDelete('cascade');
            $table->foreignId('vehiculo_id')->constrained('vehiculos')->onDelete('cascade');
            $table->foreignId('ruta_id')->constrained('rutas')->onDelete('cascade');
            $table->timestamp('hora_inicio_real')->nullable();
            $table->timestamp('hora_fin_real')->nullable();
            $table->unsignedInteger('km_inicio')->nullable();
            $table->unsignedInteger('km_fin')->nullable();
            $table->unsignedInteger('pasajeros_transportados')->default(0);
            $table->enum('estado', [
                'en_espera',
                'en_ruta',
                'finalizado',
                'interrumpido',
            ])->default('en_espera');
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->index(['estado', 'created_at']);
        });

        // 5. Incidencias Operativas en Ruta
        Schema::create('incidencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('servicio_id')->nullable()->constrained('servicios')->nullOnDelete();
            $table->foreignId('conductor_id')->constrained('conductores')->onDelete('cascade');
            $table->foreignId('vehiculo_id')->nullable()->constrained('vehiculos')->nullOnDelete();
            $table->foreignId('ruta_id')->nullable()->constrained('rutas')->nullOnDelete();
            $table->enum('tipo', ['trafico', 'mecanica', 'climatica', 'accidente', 'desvio', 'otro'])->default('trafico');
            $table->enum('prioridad', ['baja', 'media', 'alta', 'critica'])->default('media');
            $table->string('titulo', 150);
            $table->text('descripcion');
            $table->string('ubicacion_referencia', 150)->nullable();
            $table->decimal('latitud', 10, 7)->nullable();
            $table->decimal('longitud', 10, 7)->nullable();
            $table->enum('estado', ['reportada', 'en_atencion', 'resuelta'])->default('reportada');
            $table->timestamp('fecha_hora')->useCurrent();
            $table->foreignId('atendida_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['estado', 'prioridad']);
        });

        // 6. Control de Asistencias Georreferenciadas (GPS y Geocerca Ate)
        Schema::create('asistencias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conductor_id')->constrained('conductores')->onDelete('cascade');
            $table->foreignId('asignacion_turno_id')->nullable()->constrained('asignaciones_turno')->nullOnDelete();
            $table->enum('tipo', ['entrada', 'salida'])->default('entrada');
            $table->timestamp('fecha_hora_servidor')->useCurrent();
            $table->timestamp('fecha_hora_dispositivo')->nullable();
            $table->decimal('latitud', 10, 7);
            $table->decimal('longitud', 10, 7);
            $table->decimal('precision_metros', 8, 2)->default(10.00);
            $table->decimal('distancia_terminal_metros', 8, 2)->default(0.00);
            $table->boolean('dentro_geocerca')->default(true);
            $table->boolean('es_mock_location')->default(false);
            $table->enum('estado_puntualidad', [
                'a_tiempo',
                'tardanza',
                'anticipado',
                'fuera_horario',
            ])->default('a_tiempo');
            $table->unsignedInteger('minutos_diferencia')->default(0);
            $table->string('ip_origen', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->boolean('validado')->default(true);
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->index(['conductor_id', 'fecha_hora_servidor']);
            $table->index(['tipo', 'estado_puntualidad']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asistencias');
        Schema::dropIfExists('incidencias');
        Schema::dropIfExists('servicios');
        Schema::dropIfExists('asignaciones_turno');
        Schema::dropIfExists('turnos');
        Schema::dropIfExists('rutas');
    }
};
