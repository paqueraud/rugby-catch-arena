import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Tablet, Share, PlusSquare, X, CheckCircle2, Sparkles } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'modal' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, isTablet, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already installed and running standalone
  if (isInstalled) {
    if (variant === 'modal') {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Application PWA installée sur cet appareil</span>
        </div>
      );
    }
    return null;
  }

  const handleAction = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleAction}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
          variant === 'header'
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/40 shadow-emerald-950/40'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white w-full justify-center py-2.5'
        }`}
        title="Installer l'application sur votre tablette ou smartphone"
      >
        <Download className="w-3.5 h-3.5 text-emerald-200 animate-bounce" />
        <span>Installer l'App {isTablet ? 'sur Tablette' : ''}</span>
      </button>

      {/* Guide Modal for iPad / Tablet / Chrome */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-emerald-500/40 p-6 shadow-2xl text-slate-100">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Tablet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white tracking-wide">
                  Installer sur Tablette & Mobile
                </h3>
                <p className="text-xs text-emerald-400 font-medium">
                  Application progressive (PWA) &bull; Mode plein écran hors-ligne
                </p>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-3.5 text-xs text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <p className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Sur iPad ou iPhone (Safari) :
                </p>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    1
                  </span>
                  <p>
                    Touchez le bouton <strong className="text-white">Partager</strong>{' '}
                    <Share className="inline w-3.5 h-3.5 text-blue-400 mx-0.5" /> dans la barre de votre navigateur Safari.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    2
                  </span>
                  <p>
                    Faites défiler et touchez{' '}
                    <strong className="text-white flex items-center gap-1 inline-flex">
                      <PlusSquare className="w-3.5 h-3.5 text-slate-300" /> Sur l'écran d'accueil
                    </strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    3
                  </span>
                  <p>
                    Validez en touchant <strong className="text-emerald-400">Ajouter</strong> en haut à droite. Le jeu apparaîtra comme une vraie application sur votre écran d'accueil !
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <p className="font-semibold text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Sur Android, Chrome ou Edge sur Tablette :
                </p>
                <p>
                  1. Cliquez sur le bouton d'installation ci-dessous ou sur l'icône <strong className="text-white">Installer l'application</strong> dans la barre d'adresse de votre navigateur.
                </p>
                <p>
                  2. Ou ouvrez le menu <strong className="text-white">⋮ (trois points)</strong> en haut à droite et choisissez <strong className="text-emerald-400">"Installer Rugby Catch Arena"</strong> ou <strong className="text-emerald-400">"Ajouter à l'écran d'accueil"</strong>.
                </p>
                {isInstallable && (
                  <button
                    onClick={async () => {
                      await install();
                      setShowGuide(false);
                    }}
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Lancer l'installation maintenant
                  </button>
                )}
              </div>
            )}

            <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-200/90 leading-relaxed">
              🏉 <strong>Jouer depuis GitHub sur Tablette :</strong> Une fois le dépôt hébergé sur GitHub Pages (ou cloné), vous accédez à l'URL sur votre tablette et installez l'icône. Le jeu fonctionnera ensuite 100% hors-ligne même sans connexion Wi-Fi !
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="mt-4 w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-semibold text-slate-200 transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
};
