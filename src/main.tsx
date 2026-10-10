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

// iPad/iPhone Safari ignores user-scalable=no: block pinch-zoom so swiping in the game never zooms the page
['gesturestart', 'gesturechange', 'gestureend'].forEach((type) => {
  document.addEventListener(type, (e) => e.preventDefault(), { passive: false });
});
document.addEventListener(
  'touchmove',
  (e) => {
    if (e.touches.length > 1) e.preventDefault();
  },
  { passive: false }
);

createRoot(document.getElementById('root')!).render(<App />);
