import React, { useState } from 'react';
import { Player, GameSettings, GamePhase, GameMode, CharacterType } from './types/game';
import { SetupScreen } from './components/SetupScreen';
import { StadiumField } from './components/StadiumField';
import { InfiniteStadiumField } from './components/InfiniteStadiumField';
import { Scoreboard } from './components/Scoreboard';
import { GameOverModal } from './components/GameOverModal';
import { CHARACTER_LIST } from './constants/characters';
import { sound } from './services/sound';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ZipDownloadModal } from './components/ZipDownloadModal';
import { Volume2, VolumeX, RotateCcw, Info, X, Shield, Sparkles, Infinity, Trophy, Download, Maximize2, Minimize2, Tablet, Github, Share } from 'lucide-react';

const DEFAULT_SETTINGS: GameSettings = {
  difficulty: 'normale',
  totalRounds: 5,
  soundEnabled: true,
};

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('SETUP');
  const [gameMode, setGameMode] = useState<GameMode>('tournament');
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showCharactersModal, setShowCharactersModal] = useState<boolean>(false);
  const [showGithubModal, setShowGithubModal] = useState<boolean>(false);
  const [showZipModal, setShowZipModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Toggle browser fullscreen (ideal for tablets)
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen not supported or blocked (e.g. some iFrames)
    }
  };

  // Infinite Solo mode state
  const [infinitePlayer, setInfinitePlayer] = useState<{ character: CharacterType; name: string }>({
    character: 'leopard',
    name: 'Champion',
  });

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setEnabled(next);
  };

  // Start new match from setup screen
  const handleStartGame = (configuredPlayers: Player[], gameSettings: GameSettings) => {
    setPlayers(configuredPlayers);
    setSettings(gameSettings);
    setCurrentPlayerIndex(0);
    setCurrentRound(1);
    setGameMode('tournament');
    setPhase('PLAYING');
  };

  // Start infinite solo mode
  const handleStartInfinite = (character: CharacterType, playerName: string) => {
    setInfinitePlayer({ character, name: playerName });
    setGameMode('infinite');
    setPhase('PLAYING');
  };

  // When a turn completes in StadiumField
  const handleTurnComplete = (caught: number, netScoreChange: number) => {
    setPlayers((prev) => {
      const copy = [...prev];
      const p = { ...copy[currentPlayerIndex] };
      p.ballsCaught += caught;
      p.ballsMissed += 3 - caught;
      p.score = Math.max(0, p.score + netScoreChange);
      p.turnScores = [...p.turnScores, netScoreChange];
      if (netScoreChange < 0) {
        p.minesHit += Math.abs(netScoreChange) / 2;
      }
      copy[currentPlayerIndex] = p;
      return copy;
    });

    // Advance to next player or round or game over
    const isLastPlayer = currentPlayerIndex >= players.length - 1;
    const isLastRound = currentRound >= settings.totalRounds;

    if (!isLastPlayer) {
      setCurrentPlayerIndex((prev) => prev + 1);
    } else if (!isLastRound) {
      setCurrentPlayerIndex(0);
      setCurrentRound((prev) => prev + 1);
    } else {
      setPhase('GAME_OVER');
    }
  };

  // Rematch with identical players/characters
  const handleRematch = () => {
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        score: 0,
        ballsCaught: 0,
        ballsMissed: 0,
        fruitsHit: 0,
        minesHit: 0,
        turnScores: [],
      }))
    );
    setCurrentPlayerIndex(0);
    setCurrentRound(1);
    setPhase('PLAYING');
  };

  // Return to setup
  const handleNewSetup = () => {
    setPhase('SETUP');
  };

  const activePlayer = players[currentPlayerIndex];
  const isLastTurnOfGame =
    currentPlayerIndex === players.length - 1 && currentRound === settings.totalRounds;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* TOP BAR CONTRACT: Zone 1 (Brand) — Zone 2 (Nav Links) — Zone 3 (Action) */}
      <header className="flex items-center justify-between gap-3 px-3 sm:px-6 py-3 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40">
        {/* Zone 1: Brand wordmark */}
        <button
          type="button"
          onClick={handleNewSetup}
          className="text-base sm:text-xl font-black tracking-tight text-white uppercase font-display whitespace-nowrap min-w-0 flex items-center gap-2 text-left cursor-pointer hover:opacity-90 transition-opacity"
        >
          <span className="text-amber-400">🏉</span>
          <span className="truncate">Rugby Catch Arena</span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            type="button"
            onClick={() => setShowRulesModal(true)}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Règles du Jeu
          </button>
          <button
            type="button"
            onClick={() => setShowCharactersModal(true)}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Les 5 Mascottes
          </button>
          <button
            type="button"
            onClick={() => setShowGithubModal(true)}
            className="hover:text-emerald-400 text-emerald-300 font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Tablet className="w-4 h-4 text-emerald-400" />
            <span>Tablette & GitHub</span>
          </button>
          <button
            type="button"
            onClick={toggleSound}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>Audio Activé</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-500" />
                <span>Audio Coupé</span>
              </>
            )}
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          {/* PWA Install Button (automatically adapts to Android / iOS / Desktop) */}
          <PWAInstallButton variant="header" />

          {/* Fullscreen Button (great for tablets!) */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="hidden md:flex p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition cursor-pointer"
            title={isFullscreen ? "Quitter le plein écran" : "Passer en plein écran (idéal tablette)"}
            aria-label="Plein écran"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Compact sound toggle (the text nav is hidden below xl) */}
          <button
            type="button"
            onClick={toggleSound}
            className="xl:hidden p-2 text-slate-300 hover:text-white bg-slate-800 rounded-lg border border-slate-700 cursor-pointer"
            aria-label={soundEnabled ? 'Couper le son' : 'Activer le son'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Verified ZIP Download for Windows & Offline */}
          <button
            type="button"
            onClick={() => setShowZipModal(true)}
            className="hidden md:flex px-2.5 py-1.5 text-xs font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/50 rounded-lg transition-colors whitespace-nowrap shrink-0 items-center gap-1.5 cursor-pointer shadow-sm"
            title="Télécharger l'archive ZIP certifiée valide (Windows & Offline)"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">ZIP Windows</span>
          </button>

          {phase !== 'SETUP' ? (
            <button
              type="button"
              onClick={handleNewSetup}
              className="px-3 py-1.5 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quitter</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowRulesModal(true)}
              className="xl:hidden p-2 text-slate-300 hover:text-white bg-slate-800 rounded-lg border border-slate-700"
              aria-label="Règles"
            >
              <Info className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col">
        {phase === 'SETUP' ? (
          <SetupScreen
            onStartGame={handleStartGame}
            onStartInfinite={handleStartInfinite}
            defaultSettings={settings}
            onOpenZipModal={() => setShowZipModal(true)}
          />
        ) : gameMode === 'infinite' ? (
          <InfiniteStadiumField
            character={infinitePlayer.character}
            playerName={infinitePlayer.name}
            onExit={handleNewSetup}
            onToggleSound={toggleSound}
            isSoundEnabled={soundEnabled}
          />
        ) : (
          <div className="flex-1 max-w-7xl w-full min-w-0 mx-auto p-3 sm:p-6 flex flex-col lg:flex-row gap-5 items-stretch">
            {/* Left/Center Container: Rugby Stadium Field (100% visible & unblocked!) */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              {activePlayer && (
                <StadiumField
                  player={activePlayer}
                  settings={settings}
                  currentRound={currentRound}
                  isLastTurnOfGame={isLastTurnOfGame}
                  onTurnComplete={handleTurnComplete}
                  onToggleSound={toggleSound}
                  isSoundEnabled={soundEnabled}
                />
              )}
            </div>

            {/* Right Sidebar: Tableau des Scores (Always visible on the right) */}
            <div className="w-full lg:w-80 shrink-0">
              <Scoreboard
                players={players}
                activePlayerId={activePlayer ? activePlayer.id : ''}
                currentRound={currentRound}
                settings={settings}
                className="h-full min-h-[380px]"
              />
            </div>
          </div>
        )}
      </main>

      {/* GAME OVER PODIUM MODAL (Tournament mode only) */}
      {phase === 'GAME_OVER' && gameMode === 'tournament' && (
        <GameOverModal
          players={players}
          settings={settings}
          onRematch={handleRematch}
          onNewSetup={handleNewSetup}
        />
      )}

      {/* RULES MODAL */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowRulesModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white font-display uppercase tracking-wide">
                Règles de Rugby Catch Arena
              </h2>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider font-display">
                  🏆 Mode Tournoi (Tour par Tour)
                </h4>
                <p>
                  Chaque joueur joue à son tour. 3 ballons apparaissent pendant 2 secondes chacun (ou simultanés en Cauchemar). Le tableau des scores en direct départage les joueurs avec un podium final.
                </p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider font-display">
                  ♾️ Mode Solo Infini
                </h4>
                <p>
                  Session sans fin ! Attrapez les ballons sans arrêt, enchaînez les combos et battez votre record personnel.
                </p>
                <p className="text-cyan-300">
                  ⚡ <strong>Options modifiables en direct pendant le jeu :</strong>
                </p>
                <ul className="text-slate-400 space-y-1 text-xs">
                  <li>• <strong>Fruits (Normal) :</strong> trompeurs traversant l'écran.</li>
                  <li>• <strong>Mines (Difficile) :</strong> explosives (-2 pts).</li>
                  <li>• <strong>Cauchemar :</strong> déluge intense de fruits et de mines simultanés.</li>
                  <li>• <strong>Accélération :</strong> ballons apparaissant d'abord 3s l'un après l'autre, puis accélérant jusqu'à 1s avec superposition !</li>
                </ul>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider font-display">
                  Niveaux de Difficulté
                </h4>
                <p>🟢 <strong>Facile :</strong> Ballons lents, aucun piège.</p>
                <p>🟡 <strong>Normale :</strong> Ballons plus rapides + fruits trompeurs.</p>
                <p>🔴 <strong>Difficile :</strong> Ballons rapides + fruits + MINES explosives (-2 pts).</p>
                <p>☠️ <strong>Cauchemar :</strong> 3 ballons EN MÊME TEMPS (5s) + déluge de fruits et de mines.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHARACTERS MODAL */}
      {showCharactersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCharactersModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white font-display uppercase tracking-wide">
                Les 5 Mascottes de Rugby
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CHARACTER_LIST.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/60"
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-slate-600 bg-slate-950">
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{c.icon}</span>
                      <span>{c.name}</span>
                      <span className="text-xs text-amber-400">({c.nickname})</span>
                    </h3>
                    <div className="text-xs font-semibold text-slate-400 mt-0.5">{c.role}</div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{c.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GITHUB & TABLETTE PWA GUIDE MODAL */}
      {showGithubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-200">
            <button
              onClick={() => setShowGithubModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Tablet className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-display uppercase tracking-wide">
                  Jouer depuis GitHub sur Tablette (PWA)
                </h2>
                <p className="text-xs text-emerald-400">
                  Compatibilité complète iPad, Android Tablette & Ordinateur
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300">
              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider font-display flex items-center gap-2">
                  <Github className="w-4 h-4 text-white" />
                  1. Comment envoyer ce projet sur GitHub (Étape par étape)
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300 leading-relaxed">
                  <li>
                    Rendez-vous sur <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-semibold">github.com/new</a> et créez un nouveau dépôt public (ex: <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono text-[11px]">rugby-catch-arena</code>). <em>Ne cochez pas "Add README"</em>.
                  </li>
                  <li>
                    Ouvrez un terminal dans le dossier du jeu décompressé sur votre ordinateur et tapez :
                  </li>
                </ol>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-300 space-y-1 select-all">
                  <div>git init</div>
                  <div>git add .</div>
                  <div>git commit -m "Rugby Catch Arena PWA"</div>
                  <div>git branch -M main</div>
                  <div className="text-amber-300">git remote add origin https://github.com/VOTRE-PSEUDO/rugby-catch-arena.git</div>
                  <div>git push -u origin main</div>
                </div>
                <div className="p-2.5 bg-emerald-950/40 rounded-lg border border-emerald-500/30 text-[11px] text-emerald-200">
                  <span className="font-bold">🚀 Déploiement automatique inclus :</span> Le fichier <code className="bg-slate-900 px-1 py-0.5 rounded text-emerald-300">.github/workflows/deploy.yml</code> est déjà prêt ! Dans votre dépôt GitHub, allez simplement dans <strong>Settings &gt; Pages &gt; Build and deployment &gt; Source</strong> et choisissez <strong>GitHub Actions</strong>. Votre jeu sera en ligne en 1 minute !
                </div>
              </div>

              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider font-display flex items-center gap-2">
                  <Tablet className="w-4 h-4" />
                  2. Lancer et Installer sur Tablette
                </h4>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-400">📱 iPad (Safari) :</span>
                    <span>Ouvrez le lien GitHub de votre jeu, touchez le bouton <strong>Partager</strong> <Share className="inline w-3 h-3 text-blue-400" /> puis <strong>"Sur l'écran d'accueil"</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-emerald-400">🤖 Tablette Android (Chrome) :</span>
                    <span>Touchez le bouton <strong>"Installer l'App"</strong> en haut ou le menu ⋮ puis <strong>"Ajouter à l'écran d'accueil"</strong>.</span>
                  </li>
                </ul>
              </div>

              <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 space-y-1">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Pourquoi la PWA est idéale sur Tablette ?
                </div>
                <p className="text-[11px] leading-relaxed">
                  ✓ <strong>100% Hors-Ligne :</strong> Les terrains, mascottes, sons et logique de jeu sont stockés localement grâce au Service Worker.<br />
                  ✓ <strong>Plein Écran Natif :</strong> Pas de barre de recherche gênante, réactivité tactile instantanée.<br />
                  ✓ <strong>Multijoueur Pass & Play :</strong> Posez la tablette au milieu de la table et passez-la de main en main jusqu'à 5 joueurs !
                </p>
              </div>

              <div className="pt-2">
                <PWAInstallButton variant="banner" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ZIP DOWNLOAD MODAL (VERIFIED & IN-BROWSER JSZIP) */}
      <ZipDownloadModal
        isOpen={showZipModal}
        onClose={() => setShowZipModal(false)}
      />

      {/* OFFLINE INDICATOR */}
      <OfflineIndicator />
    </div>
  );
}
