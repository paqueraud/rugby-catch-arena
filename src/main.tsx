import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker for offline tablet and mobile support
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Nouvelle version de Rugby Catch Arena disponible.');
  },
  onOfflineReady() {
    console.log('Rugby Catch Arena est prêt pour une utilisation hors-ligne.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
