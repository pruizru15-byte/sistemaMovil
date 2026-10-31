<?php

namespace Database\Seeders;

use App\Models\AsignacionTurno;
use App\Models\Asistencia;
use App\Models\Conductor;
use App\Models\Incidencia;
use App\Models\Ruta;
use App\Models\Servicio;
use App\Models\Turno;
use App\Models\User;
use App\Models\Vehiculo;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Usuarios Base
        $admin = User::firstOrCreate(
            ['dni' => '00000001'],
            [
                'name' => 'María',
                'last_name' => 'López',
                'email' => 'admin@asistencia.lan',
                'phone' => '987654321',
                'address' => 'Av. Javier Prado Este 4500, Ate',
                'role' => 'admin',
                'is_active' => true,
                'password_must_change' => false,
                'password' => Hash::make('Admin123!'),
            ]
        );

        $super = User::firstOrCreate(
            ['dni' => '00000002'],
            [
                'name' => 'Ana',
                'last_name' => 'Torres',
                'email' => 'supervisor@asistencia.lan',
                'phone' => '987654322',
                'address' => 'Av. Nicolás Ayllón 2340, Ate',
                'role' => 'supervisor',
                'is_active' => true,
                'password_must_change' => false,
                'password' => Hash::make('Super123!'),
            ]
        );

        // Conductores
        $cond1User = User::firstOrCreate(
            ['dni' => '00000003'],
            [
                'name' => 'Carlos',
                'last_name' => 'Mendoza',
                'email' => 'conductor@asistencia.lan',
                'phone' => '987654323',
                'address' => 'Urb. Vitarte Mz. B Lt. 14, Ate',
                'role' => 'conductor',
                'is_active' => true,
                'password_must_change' => false,
                'password' => Hash::make('Cond123!'),
            ]
        );

        $cond1 = Conductor::firstOrCreate(
            ['user_id' => $cond1User->id],
            [
                'licencia_conducir' => 'Q00000003',
                'categoria_licencia' => 'A-IIIa',
                'licencia_vencimiento' => '2028-12-31',
                'experiencia_anos' => 6,
                'estado_operativo' => 'en_servicio',
                'contacto_emergencia_nombre' => 'Rosa Mendoza (Esposa)',
                'contacto_emergencia_telefono' => '912345678',
                'notas' => 'Conductor titular de Ruta 01.',
            ]
        );

        $cond2User = User::firstOrCreate(
            ['dni' => '00000004'],
            [
                'name' => 'Luis',
                'last_name' => 'Ramírez',
                'email' => 'lramirez@asistencia.lan',
                'phone' => '987654324',
                'address' => 'Av. La Molina 1200, Ate',
                'role' => 'conductor',
                'is_active' => true,
                'password_must_change' => false,
                'password' => Hash::make('Cond123!'),
            ]
        );

        $cond2 = Conductor::firstOrCreate(
            ['user_id' => $cond2User->id],
            [
                'licencia_conducir' => 'Q00000004',
                'categoria_licencia' => 'A-IIIb',
                'licencia_vencimiento' => '2027-09-15',
                'experiencia_anos' => 4,
                'estado_operativo' => 'disponible',
                'contacto_emergencia_nombre' => 'Elena Ramírez (Madre)',
                'contacto_emergencia_telefono' => '912345679',
                'notas' => 'Disponible para turno tarde.',
            ]
        );

        $cond3User = User::firstOrCreate(
            ['dni' => '00000005'],
            [
                'name' => 'Juan',
                'last_name' => 'Pérez',
                'email' => 'jperez@asistencia.lan',
                'phone' => '987654325',
                'address' => 'Av. Metropolitana 890, Ate',
                'role' => 'conductor',
                'is_active' => true,
                'password_must_change' => false,
                'password' => Hash::make('Cond123!'),
            ]
        );

        $cond3 = Conductor::firstOrCreate(
            ['user_id' => $cond3User->id],
            [
                'licencia_conducir' => 'Q00000005',
                'categoria_licencia' => 'A-IIIa',
                'licencia_vencimiento' => '2029-05-20',
                'experiencia_anos' => 8,
                'estado_operativo' => 'en_servicio',
                'contacto_emergencia_nombre' => 'Carmen Pérez (Hermana)',
                'contacto_emergencia_telefono' => '912345680',
                'notas' => 'Turno mañana asignado a Ruta 03.',
            ]
        );

        $cond4User = User::firstOrCreate(
            ['dni' => '00000006'],
            [
                'name' => 'Roberto',
                'last_name' => 'Díaz',
                'email' => 'rdiaz@asistencia.lan',
                'phone' => '987654326',
                'address' => 'Jr. Progreso 312, Ate',
                'role' => 'conductor',
                'is_active' => true,
                'password_must_change' => false,
                'password' => Hash::make('Cond123!'),
            ]
        );

        $cond4 = Conductor::firstOrCreate(
            ['user_id' => $cond4User->id],
            [
                'licencia_conducir' => 'Q00000006',
                'categoria_licencia' => 'A-IIb',
                'licencia_vencimiento' => '2026-11-10',
                'experiencia_anos' => 3,
                'estado_operativo' => 'descanso',
                'contacto_emergencia_nombre' => 'Miriam Díaz (Esposa)',
                'contacto_emergencia_telefono' => '912345681',
                'notas' => 'Día libre programado.',
            ]
        );

        // 2. Flota de Vehículos
        $v1 = Vehiculo::firstOrCreate(['numero_unidad' => 'Unidad 01'], [
            'placa' => 'ABC-101', 'marca' => 'Mercedes-Benz', 'modelo' => 'OF-1721',
            'anio_fabricacion' => 2022, 'capacidad_pasajeros' => 45, 'estado' => 'operativo',
            'kilometraje' => 45200, 'soat_vencimiento' => '2027-06-30', 'revision_tecnica_vencimiento' => '2027-05-15',
        ]);

        $v2 = Vehiculo::firstOrCreate(['numero_unidad' => 'Unidad 02'], [
            'placa' => 'ABC-102', 'marca' => 'Mercedes-Benz', 'modelo' => 'OF-1721',
            'anio_fabricacion' => 2022, 'capacidad_pasajeros' => 45, 'estado' => 'operativo',
            'kilometraje' => 48900, 'soat_vencimiento' => '2027-06-30', 'revision_tecnica_vencimiento' => '2027-05-15',
        ]);

        $v3 = Vehiculo::firstOrCreate(['numero_unidad' => 'Unidad 03'], [
            'placa' => 'ABC-103', 'marca' => 'Scania', 'modelo' => 'K310',
            'anio_fabricacion' => 2023, 'capacidad_pasajeros' => 49, 'estado' => 'en_ruta',
            'kilometraje' => 32150, 'soat_vencimiento' => '2027-08-20', 'revision_tecnica_vencimiento' => '2027-07-10',
        ]);

        $v5 = Vehiculo::firstOrCreate(['numero_unidad' => 'Unidad 05'], [
            'placa' => 'ABC-105', 'marca' => 'Volvo', 'modelo' => 'B270F',
            'anio_fabricacion' => 2021, 'capacidad_pasajeros' => 42, 'estado' => 'mantenimiento',
            'kilometraje' => 84000, 'soat_vencimiento' => '2027-04-12', 'revision_tecnica_vencimiento' => '2027-03-30',
        ]);

        $v14 = Vehiculo::firstOrCreate(['numero_unidad' => 'Unidad 14'], [
            'placa' => 'ABC-114', 'marca' => 'Mercedes-Benz', 'modelo' => 'OF-1721',
            'anio_fabricacion' => 2023, 'capacidad_pasajeros' => 45, 'estado' => 'en_ruta',
            'kilometraje' => 29400, 'soat_vencimiento' => '2027-09-18', 'revision_tecnica_vencimiento' => '2027-08-25',
        ]);

        $v18 = Vehiculo::firstOrCreate(['numero_unidad' => 'Unidad 18'], [
            'placa' => 'ABC-118', 'marca' => 'Scania', 'modelo' => 'K310',
            'anio_fabricacion' => 2023, 'capacidad_pasajeros' => 49, 'estado' => 'operativo',
            'kilometraje' => 18300, 'soat_vencimiento' => '2027-11-05', 'revision_tecnica_vencimiento' => '2027-10-12',
        ]);

        // 3. Catálogo de Rutas
        $r1 = Ruta::firstOrCreate(['codigo_ruta' => 'Ruta 01'], [
            'nombre' => 'Ruta 01 - Ate Vitarte / La Molina',
            'origen' => 'Terminal Ate',
            'destino' => 'Av. Javier Prado Este (La Molina)',
            'distancia_km' => 18.50,
            'tiempo_estimado_minutos' => 45,
            'color' => '#2563EB',
            'paraderos_json' => ['Terminal Ate', 'Vitarte Centro', 'Ceres Medio', 'Av. Separadora', 'Av. La Molina', 'Av. Aviación'],
        ]);

        $r3 = Ruta::firstOrCreate(['codigo_ruta' => 'Ruta 03'], [
            'nombre' => 'Ruta 03 - Parque Industrial',
            'origen' => 'Terminal Ate',
            'destino' => 'Zona Industrial San Juan',
            'distancia_km' => 12.00,
            'tiempo_estimado_minutos' => 35,
            'color' => '#16A34A',
            'paraderos_json' => ['Terminal Ate', 'Av. Ferrocarril', 'Puente Santa Anita', 'Parque Industrial'],
        ]);

        $r5 = Ruta::firstOrCreate(['codigo_ruta' => 'Ruta 05'], [
            'nombre' => 'Ruta 05 - Circunvalación Ate',
            'origen' => 'Terminal Ate',
            'destino' => 'Óvalo Mayorazgo',
            'distancia_km' => 14.20,
            'tiempo_estimado_minutos' => 40,
            'color' => '#D97706',
            'paraderos_json' => ['Terminal Ate', 'Av. Metropolitana', 'Av. Esperanza', 'Mayorazgo'],
        ]);

        // 4. Catálogo de Turnos
        $tManana = Turno::firstOrCreate(['nombre' => 'Turno Mañana'], [
            'hora_inicio' => '07:00:00',
            'hora_fin' => '15:30:00',
            'tolerancia_minutos' => 15,
        ]);

        $tTarde = Turno::firstOrCreate(['nombre' => 'Turno Tarde'], [
            'hora_inicio' => '15:00:00',
            'hora_fin' => '23:30:00',
            'tolerancia_minutos' => 15,
        ]);

        $tNoche = Turno::firstOrCreate(['nombre' => 'Turno Noche'], [
            'hora_inicio' => '23:00:00',
            'hora_fin' => '07:00:00',
            'tolerancia_minutos' => 15,
        ]);

        // 5. Asignaciones de Turno de Hoy
        $hoy = Carbon::today()->toDateString();

        $asig1 = AsignacionTurno::firstOrCreate([
            'fecha' => $hoy,
            'turno_id' => $tManana->id,
            'conductor_id' => $cond1->id,
        ], [
            'vehiculo_id' => $v14->id,
            'ruta_id' => $r1->id,
            'supervisor_id' => $super->id,
            'estado' => 'en_curso',
            'observaciones' => 'Ruta prioritaria Ate - Javier Prado.',
        ]);

        $asig2 = AsignacionTurno::firstOrCreate([
            'fecha' => $hoy,
            'turno_id' => $tManana->id,
            'conductor_id' => $cond3->id,
        ], [
            'vehiculo_id' => $v3->id,
            'ruta_id' => $r3->id,
            'supervisor_id' => $super->id,
            'estado' => 'en_curso',
            'observaciones' => 'Servicio hacia Parque Industrial.',
        ]);

        $asig3 = AsignacionTurno::firstOrCreate([
            'fecha' => $hoy,
            'turno_id' => $tTarde->id,
            'conductor_id' => $cond2->id,
        ], [
            'vehiculo_id' => $v1->id,
            'ruta_id' => $r5->id,
            'supervisor_id' => $super->id,
            'estado' => 'programado',
            'observaciones' => 'Programado para relevo 15:00.',
        ]);

        // 6. Servicios en Ruta
        $serv1 = Servicio::firstOrCreate([
            'conductor_id' => $cond1->id,
            'vehiculo_id' => $v14->id,
            'ruta_id' => $r1->id,
            'estado' => 'en_ruta',
        ], [
            'asignacion_turno_id' => $asig1->id,
            'hora_inicio_real' => Carbon::now()->subMinutes(90),
            'km_inicio' => 29400,
            'pasajeros_transportados' => 42,
            'observaciones' => 'Recorrido regular sin novedades mecánicas.',
        ]);

        $serv2 = Servicio::firstOrCreate([
            'conductor_id' => $cond3->id,
            'vehiculo_id' => $v3->id,
            'ruta_id' => $r3->id,
            'estado' => 'en_ruta',
        ], [
            'asignacion_turno_id' => $asig2->id,
            'hora_inicio_real' => Carbon::now()->subMinutes(60),
            'km_inicio' => 32150,
            'pasajeros_transportados' => 38,
            'observaciones' => 'Reporta tráfico moderado en Av. Principal.',
        ]);

        // 7. Alertas Operativas / Incidencias (idénticas a los mockups)
        Incidencia::firstOrCreate(['titulo' => 'Tardanzas en conductores'], [
            'conductor_id' => $cond2->id,
            'vehiculo_id' => $v1->id,
            'ruta_id' => $r5->id,
            'tipo' => 'otro',
            'prioridad' => 'media',
            'descripcion' => '3 conductores han reportado retraso leve por congestión en Av. Ayllón.',
            'ubicacion_referencia' => 'Entrada Vitarte',
            'estado' => 'en_atencion',
        ]);

        Incidencia::firstOrCreate(['titulo' => 'Incidencia en ruta 03'], [
            'servicio_id' => $serv2->id,
            'conductor_id' => $cond3->id,
            'vehiculo_id' => $v3->id,
            'ruta_id' => $r3->id,
            'tipo' => 'trafico',
            'prioridad' => 'alta',
            'descripcion' => 'Tráfico denso en Av. Principal por obras en calzada.',
            'ubicacion_referencia' => 'Av. Principal km 4.5',
            'estado' => 'reportada',
        ]);

        Incidencia::firstOrCreate(['titulo' => 'Ruta con retraso'], [
            'conductor_id' => $cond1->id,
            'vehiculo_id' => $v14->id,
            'ruta_id' => $r1->id,
            'tipo' => 'desvio',
            'prioridad' => 'media',
            'descripcion' => 'Ruta 05 con 15 min de retraso por desvío temporal.',
            'ubicacion_referencia' => 'Av. Nicolás Ayllón',
            'estado' => 'reportada',
        ]);

        // 8. Registro de Asistencia Inicial (Carlos Mendoza a las 07:02)
        Asistencia::firstOrCreate([
            'conductor_id' => $cond1->id,
            'tipo' => 'entrada',
        ], [
            'asignacion_turno_id' => $asig1->id,
            'fecha_hora_servidor' => Carbon::today()->setHour(7)->setMinute(2)->setSecond(15),
            'fecha_hora_dispositivo' => Carbon::today()->setHour(7)->setMinute(2)->setSecond(10),
            'latitud' => -12.0256800,
            'longitud' => -76.9205100,
            'precision_metros' => 8.50,
            'distancia_terminal_metros' => 24.30,
            'dentro_geocerca' => true,
            'es_mock_location' => false,
            'estado_puntualidad' => 'a_tiempo',
            'minutos_diferencia' => 2,
            'validado' => true,
            'observaciones' => 'Marcación GPS en garita principal Terminal Ate.',
        ]);
    }
}
