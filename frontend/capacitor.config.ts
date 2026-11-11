import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.popydev.asistenciamovil',
  appName: 'Control Asistencia',
  webDir: 'dist',
  server: {
    // Al abrir la app móvil en Android se conecta directamente a la versión en línea
    url: 'https://popydev.com/auto-movil',
    cleartext: true,
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
};

export default config;

