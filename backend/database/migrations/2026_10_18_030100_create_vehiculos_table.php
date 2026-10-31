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
        Schema::create('vehiculos', function (Blueprint $table) {
            $table->id();
            $table->string('numero_unidad', 30)->unique();
            $table->string('placa', 15)->unique();
            $table->string('marca', 50)->default('Mercedes-Benz');
            $table->string('modelo', 50)->default('OF-1721');
            $table->unsignedSmallInteger('anio_fabricacion')->default(2022);
            $table->unsignedSmallInteger('capacidad_pasajeros')->default(45);
            $table->enum('estado', [
                'operativo',
                'en_ruta',
                'mantenimiento',
                'fuera_servicio',
            ])->default('operativo');
            $table->unsignedInteger('kilometraje')->default(0);
            $table->date('soat_vencimiento')->nullable();
            $table->date('revision_tecnica_vencimiento')->nullable();
            $table->text('notas')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['estado', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehiculos');
    }
};
