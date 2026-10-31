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
        Schema::create('conductores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->string('licencia_conducir', 20)->unique();
            $table->string('categoria_licencia', 10)->default('A-IIIa');
            $table->date('licencia_vencimiento')->nullable();
            $table->unsignedInteger('experiencia_anos')->default(1);
            $table->enum('estado_operativo', [
                'disponible',
                'en_servicio',
                'descanso',
                'vacaciones',
                'suspendido',
            ])->default('disponible');
            $table->string('contacto_emergencia_nombre', 100)->nullable();
            $table->string('contacto_emergencia_telefono', 20)->nullable();
            $table->text('notas')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['estado_operativo', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conductores');
    }
};
