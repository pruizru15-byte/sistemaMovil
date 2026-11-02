<?php

namespace Database\Seeders;

use App\Models\AsignacionTurno;
use App\Models\Asistencia;
use App\Models\AuditLog;
use App\Models\Conductor;
use App\Models\Configuracion;
use App\Models\Incidencia;
use App\Models\Notificacion;
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
     * Población de base de datos completa con al menos 10 registros por módulo.
     */
    public function run(): void
    {
        $passwordComun = Hash::make('Cond123!');
        $adminPassword = Hash::make('Admin123!');
        $superPassword = Hash::make('Super123!');
        $hoy = Carbon::today()->toDateString();
        $ayer = Carbon::yesterday()->toDateString();

        // ========================================================
        // 1. MÓDULO: USUARIOS (Al menos 10 registros)
        // ========================================================
        $admin = User::updateOrCreate(
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
                'password' => $adminPassword,
            ]
        );

        $super1 = User::updateOrCreate(
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
                'password' => $superPassword,
            ]
        );

        $super2 = User::updateOrCreate(
            ['dni' => '00000011'],
            [
                'name' => 'Pedro',
                'last_name' => 'Salazar',
                'email' => 'psalazar@asistencia.lan',
                'phone' => '987654323',
                'address' => 'Urb. Mayorazgo Mz. D Lt. 12, Ate',
                'role' => 'supervisor',
                'is_active' => true,
                'password_must_change' => false,
                'password' => $superPassword,
            ]
        );

        $conductoresUsersData = [
            ['dni' => '00000003', 'name' => 'Carlos', 'last_name' => 'Mendoza', 'email' => 'conductor@asistencia.lan', 'phone' => '987654301', 'address' => 'Urb. Vitarte Mz. B Lt. 14, Ate'],
            ['dni' => '00000004', 'name' => 'Luis', 'last_name' => 'Ramírez', 'email' => 'lramirez@asistencia.lan', 'phone' => '987654302', 'address' => 'Av. La Molina 1200, Ate'],
            ['dni' => '00000005', 'name' => 'Juan', 'last_name' => 'Pérez', 'email' => 'jperez@asistencia.lan', 'phone' => '987654303', 'address' => 'Av. Metropolitana 890, Ate'],
            ['dni' => '00000006', 'name' => 'Roberto', 'last_name' => 'Díaz', 'email' => 'rdiaz@asistencia.lan', 'phone' => '987654304', 'address' => 'Jr. Progreso 312, Ate'],
            ['dni' => '00000007', 'name' => 'Miguel', 'last_name' => 'Quispe', 'email' => 'mquispe@asistencia.lan', 'phone' => '987654305', 'address' => 'Av. Separadora Industrial 550, Ate'],
            ['dni' => '00000008', 'name' => 'Jorge', 'last_name' => 'Flores', 'email' => 'jflores@asistencia.lan', 'phone' => '987654306', 'address' => 'Av. Los Frutales 420, Ate'],
            ['dni' => '00000009', 'name' => 'Raúl', 'last_name' => 'Huamán', 'email' => 'rhuaman@asistencia.lan', 'phone' => '987654307', 'address' => 'Calle Las Palmeras 104, Vitarte'],
            ['dni' => '00000010', 'name' => 'David', 'last_name' => 'Paredes', 'email' => 'dparedes@asistencia.lan', 'phone' => '987654308', 'address' => 'Av. Santa Anita 730, Ate'],
            ['dni' => '00000012', 'name' => 'Víctor', 'last_name' => 'Castro', 'email' => 'vcastro@asistencia.lan', 'phone' => '987654309', 'address' => 'Calle San Martín 215, Ate'],
            ['dni' => '00000013', 'name' => 'César', 'last_name' => 'Morales', 'email' => 'cmorales@asistencia.lan', 'phone' => '987654310', 'address' => 'Jr. Las Gardenias 410, Ate'],
        ];

        $conductoresUsers = [];
        foreach ($conductoresUsersData as $uData) {
            $conductoresUsers[] = User::updateOrCreate(
                ['dni' => $uData['dni']],
                [
                    'name' => $uData['name'],
                    'last_name' => $uData['last_name'],
                    'email' => $uData['email'],
                    'phone' => $uData['phone'],
                    'address' => $uData['address'],
                    'role' => 'conductor',
                    'is_active' => true,
                    'password_must_change' => false,
                    'password' => $passwordComun,
                ]
            );
        }

        // ========================================================
        // 2. MÓDULO: CONDUCTORES (10 registros)
        // ========================================================
        $conductoresSpecs = [
            ['lic' => 'Q00000003', 'cat' => 'A-IIIa', 'venc' => '2028-12-31', 'exp' => 6, 'estado' => 'en_servicio', 'em_nom' => 'Rosa Mendoza (Esposa)', 'em_tel' => '912345601', 'notas' => 'Conductor titular de Ruta 01.'],
            ['lic' => 'Q00000004', 'cat' => 'A-IIIb', 'venc' => '2027-09-15', 'exp' => 4, 'estado' => 'disponible', 'em_nom' => 'Elena Ramírez (Madre)', 'em_tel' => '912345602', 'notas' => 'Disponible para turno tarde.'],
            ['lic' => 'Q00000005', 'cat' => 'A-IIIa', 'venc' => '2029-05-20', 'exp' => 8, 'estado' => 'en_servicio', 'em_nom' => 'Carmen Pérez (Hermana)', 'em_tel' => '912345603', 'notas' => 'Turno mañana asignado a Ruta 03.'],
            ['lic' => 'Q00000006', 'cat' => 'A-IIb', 'venc' => '2026-11-10', 'exp' => 3, 'estado' => 'descanso', 'em_nom' => 'Miriam Díaz (Esposa)', 'em_tel' => '912345604', 'notas' => 'Día libre programado.'],
            ['lic' => 'Q00000007', 'cat' => 'A-IIIc', 'venc' => '2028-04-18', 'exp' => 10, 'estado' => 'en_servicio', 'em_nom' => 'Gladys Quispe (Esposa)', 'em_tel' => '912345605', 'notas' => 'Conductor especializado en unidades articuladas.'],
            ['lic' => 'Q00000008', 'cat' => 'A-IIIa', 'venc' => '2027-10-30', 'exp' => 5, 'estado' => 'disponible', 'em_nom' => 'Julio Flores (Hermano)', 'em_tel' => '912345606', 'notas' => 'Relevo programado para Ruta 04.'],
            ['lic' => 'Q00000009', 'cat' => 'A-IIIb', 'venc' => '2029-01-14', 'exp' => 7, 'estado' => 'en_servicio', 'em_nom' => 'Nancy Huamán (Hija)', 'em_tel' => '912345607', 'notas' => 'Turno tarde asignado a Ruta 05.'],
            ['lic' => 'Q00000010', 'cat' => 'A-IIIa', 'venc' => '2028-07-22', 'exp' => 9, 'estado' => 'disponible', 'em_nom' => 'Teresa Paredes (Esposa)', 'em_tel' => '912345608', 'notas' => 'Conductor con certificado de primeros auxilios.'],
            ['lic' => 'Q00000012', 'cat' => 'A-IIIc', 'venc' => '2030-03-05', 'exp' => 12, 'estado' => 'en_servicio', 'em_nom' => 'Patricia Castro (Esposa)', 'em_tel' => '912345609', 'notas' => 'Conductor veterano de flota pesada.'],
            ['lic' => 'Q00000013', 'cat' => 'A-IIb', 'venc' => '2027-12-01', 'exp' => 2, 'estado' => 'disponible', 'em_nom' => 'Mario Morales (Padre)', 'em_tel' => '912345610', 'notas' => 'Capacitación en control de flota aprobada.'],
        ];

        $conductores = [];
        foreach ($conductoresUsers as $idx => $cUser) {
            $spec = $conductoresSpecs[$idx];
            $conductores[] = Conductor::updateOrCreate(
                ['user_id' => $cUser->id],
                [
                    'licencia_conducir' => $spec['lic'],
                    'categoria_licencia' => $spec['cat'],
                    'licencia_vencimiento' => $spec['venc'],
                    'experiencia_anos' => $spec['exp'],
                    'estado_operativo' => $spec['estado'],
                    'contacto_emergencia_nombre' => $spec['em_nom'],
                    'contacto_emergencia_telefono' => $spec['em_tel'],
                    'notas' => $spec['notas'],
                ]
            );
        }

        // ========================================================
        // 3. MÓDULO: VEHÍCULOS (10 registros)
        // ========================================================
        $vehiculosData = [
            ['num' => 'Unidad 01', 'placa' => 'ABC-101', 'marca' => 'Mercedes-Benz', 'modelo' => 'OF-1721', 'anio' => 2022, 'cap' => 45, 'estado' => 'operativo', 'km' => 45200, 'soat' => '2027-06-30', 'rev' => '2027-05-15'],
            ['num' => 'Unidad 02', 'placa' => 'ABC-102', 'marca' => 'Mercedes-Benz', 'modelo' => 'OF-1721', 'anio' => 2022, 'cap' => 45, 'estado' => 'operativo', 'km' => 48900, 'soat' => '2027-06-30', 'rev' => '2027-05-15'],
            ['num' => 'Unidad 03', 'placa' => 'ABC-103', 'marca' => 'Scania', 'modelo' => 'K310', 'anio' => 2023, 'cap' => 49, 'estado' => 'en_ruta', 'km' => 32150, 'soat' => '2027-08-20', 'rev' => '2027-07-10'],
            ['num' => 'Unidad 04', 'placa' => 'ABC-104', 'marca' => 'Scania', 'modelo' => 'K310', 'anio' => 2023, 'cap' => 49, 'estado' => 'operativo', 'km' => 36400, 'soat' => '2027-08-20', 'rev' => '2027-07-10'],
            ['num' => 'Unidad 05', 'placa' => 'ABC-105', 'marca' => 'Volvo', 'modelo' => 'B270F', 'anio' => 2021, 'cap' => 42, 'estado' => 'mantenimiento', 'km' => 84000, 'soat' => '2027-04-12', 'rev' => '2027-03-30'],
            ['num' => 'Unidad 06', 'placa' => 'ABC-106', 'marca' => 'Volvo', 'modelo' => 'B270F', 'anio' => 2022, 'cap' => 42, 'estado' => 'operativo', 'km' => 51200, 'soat' => '2027-05-18', 'rev' => '2027-04-20'],
            ['num' => 'Unidad 07', 'placa' => 'ABC-107', 'marca' => 'Hyundai', 'modelo' => 'Universe Luxury', 'anio' => 2023, 'cap' => 47, 'estado' => 'operativo', 'km' => 28000, 'soat' => '2027-10-15', 'rev' => '2027-09-01'],
            ['num' => 'Unidad 08', 'placa' => 'ABC-108', 'marca' => 'Hyundai', 'modelo' => 'Universe Luxury', 'anio' => 2023, 'cap' => 47, 'estado' => 'en_ruta', 'km' => 30500, 'soat' => '2027-10-15', 'rev' => '2027-09-01'],
            ['num' => 'Unidad 09', 'placa' => 'ABC-109', 'marca' => 'Mercedes-Benz', 'modelo' => 'Tourismo', 'anio' => 2024, 'cap' => 50, 'estado' => 'operativo', 'km' => 12400, 'soat' => '2028-02-10', 'rev' => '2028-01-15'],
            ['num' => 'Unidad 10', 'placa' => 'ABC-110', 'marca' => 'Mercedes-Benz', 'modelo' => 'OF-1721', 'anio' => 2020, 'cap' => 45, 'estado' => 'fuera_servicio', 'km' => 110000, 'soat' => '2026-12-05', 'rev' => '2026-11-20'],
        ];

        $vehiculos = [];
        foreach ($vehiculosData as $vData) {
            $vehiculos[] = Vehiculo::updateOrCreate(
                ['numero_unidad' => $vData['num']],
                [
                    'placa' => $vData['placa'],
                    'marca' => $vData['marca'],
                    'modelo' => $vData['modelo'],
                    'anio_fabricacion' => $vData['anio'],
                    'capacidad_pasajeros' => $vData['cap'],
                    'estado' => $vData['estado'],
                    'kilometraje' => $vData['km'],
                    'soat_vencimiento' => $vData['soat'],
                    'revision_tecnica_vencimiento' => $vData['rev'],
                ]
            );
        }

        // ========================================================
        // 4. MÓDULO: RUTAS (10 registros)
        // ========================================================
        $rutasData = [
            ['codigo' => 'R-01', 'nombre' => 'Ruta 01 - Terminal Ate / Javier Prado (La Molina)', 'origen' => 'Terminal Ate', 'destino' => 'Av. Javier Prado Este', 'km' => 18.5, 'min' => 45, 'col' => '#2563EB', 'par' => ['Terminal Ate', 'Vitarte Centro', 'Ceres Medio', 'Av. Separadora', 'Av. La Molina', 'Av. Aviación']],
            ['codigo' => 'R-02', 'nombre' => 'Ruta 02 - Terminal Ate / Santa Anita', 'origen' => 'Terminal Ate', 'destino' => 'Óvalo Santa Anita', 'km' => 10.2, 'min' => 30, 'col' => '#0284C7', 'par' => ['Terminal Ate', 'Ceres Medio', 'Puente Santa Anita', 'Óvalo Santa Anita']],
            ['codigo' => 'R-03', 'nombre' => 'Ruta 03 - Terminal Ate / Parque Industrial', 'origen' => 'Terminal Ate', 'destino' => 'Zona Industrial San Juan', 'km' => 12.0, 'min' => 35, 'col' => '#16A34A', 'par' => ['Terminal Ate', 'Av. Ferrocarril', 'Puente Santa Anita', 'Parque Industrial']],
            ['codigo' => 'R-04', 'nombre' => 'Ruta 04 - Terminal Ate / Chaclacayo', 'origen' => 'Terminal Ate', 'destino' => 'Plaza Central Chaclacayo', 'km' => 22.4, 'min' => 50, 'col' => '#7C3AED', 'par' => ['Terminal Ate', 'Ñaña', 'Huaycán Entrada', 'Los Ángeles', 'Chaclacayo']],
            ['codigo' => 'R-05', 'nombre' => 'Ruta 05 - Circunvalación Ate / Puruchuco', 'origen' => 'Terminal Ate', 'destino' => 'Óvalo Mayorazgo', 'km' => 14.2, 'min' => 40, 'col' => '#D97706', 'par' => ['Terminal Ate', 'Av. Metropolitana', 'Av. Esperanza', 'Mayorazgo']],
            ['codigo' => 'R-06', 'nombre' => 'Ruta 06 - Terminal Ate / Huachipa Ramiro Prialé', 'origen' => 'Terminal Ate', 'destino' => 'Intercambio Huachipa', 'km' => 16.8, 'min' => 42, 'col' => '#DC2626', 'par' => ['Terminal Ate', 'Carretera Central', 'Av. Las Torres', 'Huachipa']],
            ['codigo' => 'R-07', 'nombre' => 'Ruta 07 - Alimentador Ceres / Vitarte', 'origen' => 'Terminal Ate', 'destino' => 'Mercado Ceres', 'km' => 8.5, 'min' => 25, 'col' => '#0D9488', 'par' => ['Terminal Ate', 'Av. Central', 'Av. San Martín', 'Mercado Ceres']],
            ['codigo' => 'R-08', 'nombre' => 'Ruta 08 - Terminal Ate / Mercado Productores', 'origen' => 'Terminal Ate', 'destino' => 'Gran Mercado Productores', 'km' => 11.3, 'min' => 35, 'col' => '#4F46E5', 'par' => ['Terminal Ate', 'Separadora Industrial', 'Av. Huarochirí', 'Productores']],
            ['codigo' => 'R-09', 'nombre' => 'Ruta 09 - Terminal Ate / Los Incas (Surco)', 'origen' => 'Terminal Ate', 'destino' => 'Av. El Derby / Los Incas', 'km' => 19.1, 'min' => 52, 'col' => '#EA580C', 'par' => ['Terminal Ate', 'Av. La Molina', 'Javier Prado Este', 'Av. Los Incas']],
            ['codigo' => 'R-10', 'nombre' => 'Ruta 10 - Expreso Vía Evitamiento / Caquetá', 'origen' => 'Terminal Ate', 'destino' => 'Intercambio Caquetá', 'km' => 25.0, 'min' => 55, 'col' => '#059669', 'par' => ['Terminal Ate', 'Santa Anita', 'Puente Nuevo', 'Caquetá']],
        ];

        $rutas = [];
        foreach ($rutasData as $rData) {
            $rutas[] = Ruta::updateOrCreate(
                ['codigo_ruta' => $rData['codigo']],
                [
                    'nombre' => $rData['nombre'],
                    'origen' => $rData['origen'],
                    'destino' => $rData['destino'],
                    'distancia_km' => $rData['km'],
                    'tiempo_estimado_minutos' => $rData['min'],
                    'color' => $rData['col'],
                    'paraderos_json' => $rData['par'],
                    'is_active' => true,
                ]
            );
        }

        // ========================================================
        // 5. MÓDULO: TURNOS (10 registros)
        // ========================================================
        $turnosData = [
            ['nom' => 'Turno Mañana Principal', 'ini' => '06:00:00', 'fin' => '14:30:00', 'tol' => 15],
            ['nom' => 'Turno Mañana Secundario', 'ini' => '07:00:00', 'fin' => '15:30:00', 'tol' => 15],
            ['nom' => 'Turno Mañana Refuerzo', 'ini' => '08:00:00', 'fin' => '16:30:00', 'tol' => 10],
            ['nom' => 'Turno Tarde Principal', 'ini' => '14:00:00', 'fin' => '22:30:00', 'tol' => 15],
            ['nom' => 'Turno Tarde Intermedio', 'ini' => '15:00:00', 'fin' => '23:30:00', 'tol' => 15],
            ['nom' => 'Turno Tarde Refuerzo', 'ini' => '16:00:00', 'fin' => '00:30:00', 'tol' => 10],
            ['nom' => 'Turno Noche Guardia', 'ini' => '22:00:00', 'fin' => '06:00:00', 'tol' => 15],
            ['nom' => 'Turno Madrugada Especial', 'ini' => '03:30:00', 'fin' => '11:30:00', 'tol' => 10],
            ['nom' => 'Turno Sábado Completo', 'ini' => '07:00:00', 'fin' => '17:00:00', 'tol' => 20],
            ['nom' => 'Turno Domingo y Feriados', 'ini' => '08:00:00', 'fin' => '18:00:00', 'tol' => 20],
        ];

        $turnos = [];
        foreach ($turnosData as $tData) {
            $turnos[] = Turno::updateOrCreate(
                ['nombre' => $tData['nom']],
                [
                    'hora_inicio' => $tData['ini'],
                    'hora_fin' => $tData['fin'],
                    'tolerancia_minutos' => $tData['tol'],
                    'is_active' => true,
                ]
            );
        }

        // ========================================================
        // 6. MÓDULO: ASIGNACIONES DE TURNO (10 registros)
        // ========================================================
        $asignaciones = [];
        for ($i = 0; $i < 10; $i++) {
            $asignaciones[] = AsignacionTurno::updateOrCreate(
                [
                    'fecha' => $i < 5 ? $hoy : $ayer,
                    'turno_id' => $turnos[$i % count($turnos)]->id,
                    'conductor_id' => $conductores[$i]->id,
                ],
                [
                    'vehiculo_id' => $vehiculos[$i]->id,
                    'ruta_id' => $rutas[$i]->id,
                    'supervisor_id' => ($i % 2 === 0) ? $super1->id : $super2->id,
                    'estado' => $i < 4 ? 'en_curso' : ($i < 8 ? 'completado' : 'programado'),
                    'observaciones' => "Servicio asignado para {$rutas[$i]->nombre} con {$vehiculos[$i]->numero_unidad}.",
                ]
            );
        }

        // ========================================================
        // 7. MÓDULO: SERVICIOS DE TRANSPORTE (10 registros)
        // ========================================================
        $servicios = [];
        for ($i = 0; $i < 10; $i++) {
            $servicios[] = Servicio::updateOrCreate(
                [
                    'conductor_id' => $conductores[$i]->id,
                    'vehiculo_id' => $vehiculos[$i]->id,
                    'ruta_id' => $rutas[$i]->id,
                    'asignacion_turno_id' => $asignaciones[$i]->id,
                ],
                [
                    'hora_inicio_real' => Carbon::now()->subHours(8 - ($i * 0.7)),
                    'hora_fin_real' => $i >= 4 ? Carbon::now()->subHours(1) : null,
                    'km_inicio' => $vehiculos[$i]->kilometraje,
                    'km_fin' => $i >= 4 ? $vehiculos[$i]->kilometraje + (int)$rutas[$i]->distancia_km : null,
                    'pasajeros_transportados' => 35 + ($i * 2),
                    'estado' => $i < 4 ? 'en_ruta' : 'finalizado',
                    'observaciones' => "Recorrido en {$rutas[$i]->codigo_ruta}. Pasajeros conformes.",
                ]
            );
        }

        // ========================================================
        // 8. MÓDULO: ASISTENCIAS GPS (10 registros)
        // ========================================================
        for ($i = 0; $i < 10; $i++) {
            $esTarde = ($i % 4 === 1);
            $horaMarcada = Carbon::today()->setHour(6)->setMinute(50 + ($i * 3));

            Asistencia::updateOrCreate(
                [
                    'conductor_id' => $conductores[$i]->id,
                    'asignacion_turno_id' => $asignaciones[$i]->id,
                    'tipo' => ($i >= 7) ? 'salida' : 'entrada',
                ],
                [
                    'fecha_hora_servidor' => $horaMarcada,
                    'fecha_hora_dispositivo' => $horaMarcada->copy()->subSeconds(2),
                    'latitud' => -12.0256800 + (($i - 5) * 0.00008),
                    'longitud' => -76.9205100 + (($i - 5) * 0.00007),
                    'precision_metros' => 6.50 + ($i * 0.5),
                    'distancia_terminal_metros' => 18.00 + ($i * 4.2),
                    'dentro_geocerca' => true,
                    'es_mock_location' => false,
                    'estado_puntualidad' => $esTarde ? 'tardanza' : 'a_tiempo',
                    'minutos_diferencia' => $esTarde ? 8 : 2,
                    'ip_origen' => '192.168.1.' . (50 + $i),
                    'user_agent' => 'TerminalMovil-LAN/2026 Android/14',
                    'validado' => true,
                    'observaciones' => "Marcación GPS Garita Principal Terminal Ate - Conductor {$conductoresUsers[$i]->name} {$conductoresUsers[$i]->last_name}.",
                ]
            );
        }

        // ========================================================
        // 9. MÓDULO: INCIDENCIAS OPERATIVAS (10 registros)
        // ========================================================
        $incidenciasData = [
            ['tit' => 'Tráfico denso en Puente Santa Anita', 'tipo' => 'trafico', 'prio' => 'alta', 'desc' => 'Congestión vehicular severa por trabajos nocturnos en carril derecho.', 'ref' => 'Puente Santa Anita km 5.2', 'est' => 'en_atencion'],
            ['tit' => 'Obras viales en Carretera Central', 'tipo' => 'desvio', 'prio' => 'media', 'desc' => 'Desvío habilitado por Municipalidad de Ate hacia Av. Esperanza.', 'ref' => 'Carretera Central km 8.0', 'est' => 'reportada'],
            ['tit' => 'Sensor de puertas en Unidad 05 con alerta', 'tipo' => 'mecanica', 'prio' => 'media', 'desc' => 'Lectura irregular de sensor en puerta posterior.', 'ref' => 'Taller Terminal Ate', 'est' => 'resuelta'],
            ['tit' => 'Llovizna y calzada húmeda en Vitarte', 'tipo' => 'climatica', 'prio' => 'baja', 'desc' => 'Visibilidad moderada, se indica reducir velocidad a 40 km/h.', 'ref' => 'Entrada Huaycán', 'est' => 'resuelta'],
            ['tit' => 'Control de fiscalización de transporte', 'tipo' => 'otro', 'prio' => 'baja', 'desc' => 'Operativo preventivo de ATU sin observaciones.', 'ref' => 'Ceres Medio', 'est' => 'resuelta'],
            ['tit' => 'Bloqueo temporal en cruce Av. La Molina', 'tipo' => 'trafico', 'prio' => 'alta', 'desc' => 'Semáforo fuera de servicio genera demora de 12 minutos.', 'ref' => 'Av. Javier Prado con La Molina', 'est' => 'en_atencion'],
            ['tit' => 'Baja presión en neumático trasero Unidad 02', 'tipo' => 'mecanica', 'prio' => 'media', 'desc' => 'Compensado con unidad auxiliar en parada autorizada.', 'ref' => 'Av. Separadora Industrial', 'est' => 'resuelta'],
            ['tit' => 'Pavimento resbaladizo en Ramiro Prialé', 'tipo' => 'climatica', 'prio' => 'media', 'desc' => 'Precaución por lodo en acceso a Huachipa.', 'ref' => 'Intercambio Huachipa', 'est' => 'reportada'],
            ['tit' => 'Desvío por evento local en Vitarte Centro', 'tipo' => 'desvio', 'prio' => 'baja', 'desc' => 'Ruta alternativa por Av. Central.', 'ref' => 'Plaza Vitarte', 'est' => 'resuelta'],
            ['tit' => 'Vehículo particular averiado en carril rápido', 'tipo' => 'accidente', 'prio' => 'alta', 'desc' => 'Obstruye paso hacia Terminal Ate. Personal de apoyo en sitio.', 'ref' => 'Av. Nicolás Ayllón frente a Real Plaza', 'est' => 'en_atencion'],
        ];

        foreach ($incidenciasData as $idx => $inc) {
            Incidencia::updateOrCreate(
                ['titulo' => $inc['tit']],
                [
                    'servicio_id' => $servicios[$idx]->id,
                    'conductor_id' => $conductores[$idx]->id,
                    'vehiculo_id' => $vehiculos[$idx]->id,
                    'ruta_id' => $rutas[$idx]->id,
                    'tipo' => $inc['tipo'],
                    'prioridad' => $inc['prio'],
                    'descripcion' => $inc['desc'],
                    'ubicacion_referencia' => $inc['ref'],
                    'latitud' => -12.0256000 + (($idx - 5) * 0.001),
                    'longitud' => -76.9205000 + (($idx - 5) * 0.001),
                    'estado' => $inc['est'],
                    'fecha_hora' => Carbon::now()->subMinutes(120 - ($idx * 10)),
                    'atendida_por' => ($idx % 2 === 0) ? $super1->id : $super2->id,
                ]
            );
        }

        // ========================================================
        // 10. MÓDULO: NOTIFICACIONES LAN (10 registros)
        // ========================================================
        $notificacionesData = [
            ['tit' => 'Mantenimiento vial en Av. Nicolás Ayllón', 'msg' => 'Se reportan trabajos de repavimentación entre km 7 y 9. Conducir a velocidad preventiva.', 'tipo' => 'alerta', 'target' => 'todos', 'leido' => null],
            ['tit' => 'Inspección técnica obligatoria para flota 2022', 'msg' => 'Las unidades 01, 02 y 06 deben pasar por rampa de inspección antes del día viernes.', 'tipo' => 'info', 'target' => 'supervisor', 'leido' => now()],
            ['tit' => 'Geocerca oficial de Terminal Ate actualizada', 'msg' => 'El radio de tolerancia de marcación se ha verificado en 300 metros alrededor de garita.', 'tipo' => 'asistencia', 'target' => 'admin', 'leido' => now()],
            ['tit' => 'Publicación de turnos y asignaciones semanales', 'msg' => 'Ya se encuentran disponibles los horarios y rutas correspondientes a la semana en curso.', 'tipo' => 'turno', 'target' => 'conductor', 'leido' => null],
            ['tit' => 'Tráfico denso en Puente Santa Anita', 'msg' => 'Utilizar el desvío por Separadora Industrial para unidades en ruta hacia La Molina.', 'tipo' => 'incidencia', 'target' => 'todos', 'leido' => null],
            ['tit' => 'Auditoría mensual de licencias de conducir', 'msg' => 'Verificación de SOAT y brevete electrónico concluida satisfactoriamente al 100%.', 'tipo' => 'info', 'target' => 'supervisor', 'leido' => now()],
            ['tit' => 'Capacitación en marcación móvil offline LAN', 'msg' => 'Charla informativa sobre persistencia de marcaciones en red local sin conexión externa.', 'tipo' => 'info', 'target' => 'conductor', 'leido' => null],
            ['tit' => 'Alerta de llovizna en el sector Este', 'msg' => 'Mantener distancia de seguridad y verificar funcionamiento de limpiaparabrisas.', 'tipo' => 'alerta', 'target' => 'conductor', 'leido' => null],
            ['tit' => 'Ajuste de tolerancia de ingreso matutino', 'msg' => 'Se confirma tolerancia estándar de 15 minutos en Turno Mañana conforme a política LAN.', 'tipo' => 'turno', 'target' => 'todos', 'leido' => now()],
            ['tit' => 'Nueva garita de acceso norte habilitada', 'msg' => 'Disponible segundo punto de marcación GPS con cobertura extendida en Terminal Ate.', 'tipo' => 'asistencia', 'target' => 'todos', 'leido' => null],
        ];

        foreach ($notificacionesData as $notif) {
            Notificacion::updateOrCreate(
                ['titulo' => $notif['tit']],
                [
                    'user_id' => null,
                    'role_target' => $notif['target'],
                    'mensaje' => $notif['msg'],
                    'tipo' => $notif['tipo'],
                    'leido_en' => $notif['leido'],
                ]
            );
        }

        // ========================================================
        // 11. MÓDULO: AUDITORÍA (10 registros)
        // ========================================================
        $auditLogsData = [
            ['act' => 'login_exitoso', 'mod' => 'auth', 'det' => 'Acceso administrativo desde puesto central Terminal Ate', 'ip' => '192.168.1.10', 'u' => $admin->id],
            ['act' => 'asignacion_turno', 'mod' => 'turnos', 'det' => 'Asignación de Unidad 14 a Carlos Mendoza en Ruta 01', 'ip' => '192.168.1.15', 'u' => $super1->id],
            ['act' => 'marcacion_gps', 'mod' => 'asistencia', 'det' => 'Registro de asistencia validado en geocerca (24m de garita)', 'ip' => '192.168.1.50', 'u' => $conductoresUsers[0]->id],
            ['act' => 'registro_conductor', 'mod' => 'conductores', 'det' => 'Alta en catálogo del conductor Miguel Quispe con licencia A-IIIc', 'ip' => '192.168.1.10', 'u' => $admin->id],
            ['act' => 'estado_vehiculo', 'mod' => 'vehiculos', 'det' => 'Cambio de estado operativo a mantenimiento en Unidad 05', 'ip' => '192.168.1.15', 'u' => $super1->id],
            ['act' => 'config_geocerca', 'mod' => 'configuracion', 'det' => 'Ajuste de radio de tolerancia a 300m y coordenadas Terminal Ate', 'ip' => '192.168.1.10', 'u' => $admin->id],
            ['act' => 'exportacion_reporte', 'mod' => 'reportes', 'det' => 'Exportación de reporte consolidado de puntualidad en formato CSV', 'ip' => '192.168.1.12', 'u' => $super2->id],
            ['act' => 'comunicado_emitido', 'mod' => 'notificaciones', 'det' => 'Envío de aviso operacional a flota por obras en Carretera Central', 'ip' => '192.168.1.15', 'u' => $super1->id],
            ['act' => 'inicio_servicio', 'mod' => 'servicios', 'det' => 'Inicio de servicio programado en Ruta 03 Parque Industrial', 'ip' => '192.168.1.52', 'u' => $conductoresUsers[2]->id],
            ['act' => 'incidencia_atendida', 'mod' => 'incidencias', 'det' => 'Atención y resolución de incidencia de sensor de puertas Unidad 05', 'ip' => '192.168.1.15', 'u' => $super1->id],
        ];

        foreach ($auditLogsData as $log) {
            AuditLog::firstOrCreate(
                [
                    'action' => $log['act'],
                    'details' => $log['det'],
                ],
                [
                    'user_id' => $log['u'],
                    'module' => $log['mod'],
                    'ip_address' => $log['ip'],
                    'user_agent' => 'SistemaAsistencia-LAN/2026 AdminConsole',
                ]
            );
        }

        // ========================================================
        // 12. CONFIGURACIÓN DEL SISTEMA
        // ========================================================
        $configs = [
            ['clave' => 'terminal_nombre', 'valor' => 'Terminal Central de Ate', 'descripcion' => 'Nombre del terminal principal de operaciones', 'grupo' => 'geocerca'],
            ['clave' => 'geocerca_lat', 'valor' => '-12.0256', 'descripcion' => 'Latitud de referencia del terminal', 'grupo' => 'geocerca'],
            ['clave' => 'geocerca_lng', 'valor' => '-76.9205', 'descripcion' => 'Longitud de referencia del terminal', 'grupo' => 'geocerca'],
            ['clave' => 'geocerca_radio', 'valor' => '300', 'descripcion' => 'Radio de geocerca en metros permitidos para marcación', 'grupo' => 'geocerca'],
            ['clave' => 'tolerancia_tardanza', 'valor' => '15', 'descripcion' => 'Minutos de tolerancia antes de computar tardanza', 'grupo' => 'turnos'],
            ['clave' => 'sesion_timeout', 'valor' => '120', 'descripcion' => 'Tiempo de expiración de sesión en minutos', 'grupo' => 'seguridad'],
            ['clave' => 'red_lan_ssid', 'valor' => 'TERMINAL_ATE_LAN', 'descripcion' => 'Identificador SSID de la red Wi-Fi autorizada', 'grupo' => 'seguridad'],
            ['clave' => 'ip_servidor_lan', 'valor' => '192.168.1.10', 'descripcion' => 'Dirección IP del servidor local en LAN', 'grupo' => 'seguridad'],
            ['clave' => 'bloqueo_mock_gps', 'valor' => 'true', 'descripcion' => 'Rechazar marcaciones con ubicaciones simuladas', 'grupo' => 'seguridad'],
            ['clave' => 'modo_offline_cache', 'valor' => 'true', 'descripcion' => 'Habilitar almacenamiento temporal local ante microcortes', 'grupo' => 'general'],
        ];

        foreach ($configs as $cfg) {
            Configuracion::updateOrCreate(
                ['clave' => $cfg['clave']],
                [
                    'valor' => $cfg['valor'],
                    'descripcion' => $cfg['descripcion'],
                    'grupo' => $cfg['grupo'],
                ]
            );
        }
    }
}
