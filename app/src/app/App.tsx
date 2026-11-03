import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppHeader } from '@/widgets/layout/AppHeader';
import { DashboardPage } from '@/pages/DashboardPage';
import { CrmPage } from '@/pages/CrmPage';
import { ScriptsPage } from '@/pages/ScriptsPage';
import { SettingsPlaceholder } from '@/pages/PlaceholderPages';
import { TrainerPage } from '@/pages/TrainerPage';
import { useAppStore } from '@/shared/lib/store';
import type { ScreenId } from '@/shared/types';

const PATH_TO_SCREEN: Record<string, ScreenId> = {
  '/': 'dashboard',
  '/crm': 'crm',
  '/scripts': 'scripts',
  '/trainer': 'trainer',
  '/settings': 'settings',
};

/** Синхронизирует URL с legacy-полем state.currentScreen (для совместимости миграции) */
function ScreenSync() {
  const location = useLocation();
  const setCurrentScreen = useAppStore((s) => s.setCurrentScreen);

  useEffect(() => {
    const screen = PATH_TO_SCREEN[location.pathname];
    if (screen) setCurrentScreen(screen);
  }, [location.pathname, setCurrentScreen]);

  return null;
}

export function App() {
  return (
    <HashRouter>
      <div className="flex min-h-full flex-col">
        <AppHeader />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-5">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/crm" element={<CrmPage />} />
            <Route path="/scripts" element={<ScriptsPage />} />
            <Route path="/trainer" element={<TrainerPage />} />
            <Route path="/settings" element={<SettingsPlaceholder />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <ScreenSync />
      <Toaster theme="dark" position="bottom-right" richColors closeButton />
    </HashRouter>
  );
}
