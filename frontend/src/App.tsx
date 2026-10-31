import { AuthProvider, useAuth } from './modules/auth/context/AuthContext';
import { LoginPage } from './modules/auth/pages/LoginPage';
import { DashboardPage } from './modules/dashboard/pages/DashboardPage';
import { Bus } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl animate-bounce mb-4" style={{ backgroundColor: 'var(--color-primary)' }}>
          <Bus className="w-9 h-9" />
        </div>
        <p className="text-sm font-semibold tracking-wide">Cargando sistema...</p>
        <p className="text-xs text-slate-400 mt-1">Conectando a servidor local LAN</p>
      </div>
    );
  }

  return isAuthenticated ? <DashboardPage /> : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
