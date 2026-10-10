import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, ShieldCheck } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-500/95 px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-2xl backdrop-blur-md border border-amber-300 animate-pulse">
      <WifiOff className="w-4 h-4 text-slate-950" />
      <span>Mode Hors-Ligne actif — PWA fonctionne sans connexion</span>
      <ShieldCheck className="w-3.5 h-3.5 text-slate-900 opacity-75" />
    </div>
  );
};
