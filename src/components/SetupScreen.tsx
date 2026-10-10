import React, { useState } from 'react';
import { CharacterType, DifficultyLevel, Player, GameSettings, GameMode } from '../types/game';
import { CHARACTERS, CHARACTER_LIST } from '../constants/characters';
import { Users, Bot, Zap, Play, ShieldAlert, Sparkles, ShieldCheck, Infinity, Flame, Trophy, Download } from 'lucide-react';

interface SetupScreenProps {
  onStartGame: (players: Player[], settings: GameSettings) => void;
  onStartInfinite: (character: CharacterType, playerName: string) => void;
  defaultSettings: GameSettings;
  onOpenZipModal?: () => void;
}

interface PlayerDraft {
  id: string;
  name: string;
  isHuman: boolean;
  character: CharacterType;
}

const DEFAULT_NAMES = ['Capitaine', 'Toucheur', 'L’Ailier', 'Le Stratège', 'Le Sprinteur'];
const BOT_NAMES = ['Ordi Robo-XV', 'IA Titan', 'Cyborg Rugby', 'Bot Vitesse', 'IA Champion'];

export const SetupScreen: React.FC<SetupScreenProps> = ({
  onStartGame,
  onStartInfinite,
  defaultSettings,
  onOpenZipModal,
}) => {
  const [gameMode, setGameMode] = useState<GameMode>('tournament');
  const [infiniteCharacter, setInfiniteCharacter] = useState<CharacterType>('leopard');
  const [infinitePlayerName, setInfinitePlayerName] = useState<string>('Lucas');

  const [totalPlayersCount, setTotalPlayersCount] = useState<number>(2);
  const [humanCount, setHumanCount] = useState<number>(1);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(defaultSettings.difficulty);
  const [totalRounds, setTotalRounds] = useState<number>(5);

  // Initialize draft players
  const [playersDraft, setPlayersDraft] = useState<PlayerDraft[]>([
    {
      id: 'p-1',
      name: 'Lucas',
      isHuman: true,
      character: 'leopard',
    },
    {
      id: 'p-2',
      name: 'Ordi Robo-XV',
      isHuman: false,
      character: 'chevalier',
    },
    {
      id: 'p-3',
      name: 'Joueur 3',
      isHuman: false,
      character: 'chat',
    },
    {
      id: 'p-4',
      name: 'Joueur 4',
      isHuman: false,
      character: 'serpent',
    },
    {
      id: 'p-5',
      name: 'Joueur 5',
      isHuman: false,
      character: 'oiseau',
    },
  ]);

  // Adjust draft players when total or human count changes
  const handleTotalPlayersChange = (newTotal: number) => {
    setTotalPlayersCount(newTotal);
    if (humanCount > newTotal) {
      setHumanCount(newTotal);
    }
  };

  const handleHumanCountChange = (newHumans: number) => {
    setHumanCount(newHumans);
  };

  const updatePlayerName = (index: number, newName: string) => {
    setPlayersDraft((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], name: newName };
      return copy;
    });
  };

  const updatePlayerCharacter = (index: number, char: CharacterType) => {
    setPlayersDraft((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], character: char };
      return copy;
    });
  };

  const updatePlayerIsHuman = (index: number, isHuman: boolean) => {
    setPlayersDraft((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        isHuman,
        name: isHuman
          ? copy[index].name.startsWith('Ordi') ? DEFAULT_NAMES[index] : copy[index].name
          : copy[index].name.startsWith('Joueur') || copy[index].name === DEFAULT_NAMES[index] ? BOT_NAMES[index] : copy[index].name,
      };
      return copy;
    });
  };

  // Compile players for game start
  const handleLaunch = () => {
    const activeDrafts = playersDraft.slice(0, totalPlayersCount).map((p, idx) => ({
      ...p,
      isHuman: idx < humanCount,
      name: p.name.trim() || (idx < humanCount ? `Joueur ${idx + 1}` : `Ordi ${idx + 1}`),
    }));

    const finalPlayers: Player[] = activeDrafts.map((draft, idx) => ({
      id: `player-${idx + 1}`,
      name: draft.name,
      isHuman: draft.isHuman,
      character: draft.character,
      score: 0,
      ballsCaught: 0,
      ballsMissed: 0,
      fruitsHit: 0,
      minesHit: 0,
      turnScores: [],
    }));

    onStartGame(finalPlayers, {
      difficulty,
      totalRounds,
      soundEnabled: defaultSettings.soundEnabled,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4 sm:px-6">
      {/* Title & Introduction */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Arène de Rugby Multijoueur</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase font-display drop-shadow">
          Rugby Catch Arena
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          À chaque tour, 3 ballons surgissent pendant 2 secondes. Attrapez-les au vol, esquivez les pièges et surpassez vos adversaires !
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs">
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full font-medium">
            📱 Application PWA disponible &bull; Optimisé Tablette & Hors-Ligne
          </span>
          {onOpenZipModal && (
            <button
              type="button"
              onClick={onOpenZipModal}
              className="inline-flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 px-3 py-1 rounded-full font-semibold transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger l'Archive ZIP (Windows)</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode Selector Segmented Tabs */}
      <div className="flex items-center justify-center mb-8">
        <div className="bg-slate-900/90 border border-slate-800 p-1 rounded-2xl flex items-center gap-1 shadow-lg max-w-md w-full">
          <button
            type="button"
            onClick={() => setGameMode('tournament')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              gameMode === 'tournament'
                ? 'bg-amber-500 text-slate-950 shadow-md font-display'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Tournoi Tour par Tour</span>
          </button>

          <button
            type="button"
            onClick={() => setGameMode('infinite')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              gameMode === 'infinite'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-display'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Infinity className="w-4 h-4" />
            <span>Mode Solo Infini</span>
          </button>
        </div>
      </div>

      {gameMode === 'infinite' ? (
        /* INFINITE SOLO MODE CONFIGURATION */
        <div className="space-y-6">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase mb-2">
                <Flame className="w-3.5 h-3.5" />
                <span>Entraînement Sans Fin</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-tight">
                Mode Solo Infini
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Le jeu ne s'arrête jamais ! Attrapez autant de ballons que possible et battez votre record.
              </p>
            </div>

            {/* Player Name */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-display">
                Votre Nom :
              </label>
              <input
                type="text"
                maxLength={18}
                value={infinitePlayerName}
                onChange={(e) => setInfinitePlayerName(e.target.value)}
                placeholder="Votre nom de joueur"
                className="w-full max-w-sm bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>

            {/* Character Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 font-display">
                Choisissez votre Mascotte :
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {CHARACTER_LIST.map((c) => {
                  const isSelected = infiniteCharacter === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setInfiniteCharacter(c.id)}
                      className={`flex flex-col items-center p-3 rounded-xl border transition-all text-center cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-400 shadow-lg ring-2 ring-emerald-400/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-950 mb-2 border border-slate-700">
                        <img
                          src={c.image}
                          alt={c.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className={`text-xs font-bold ${isSelected ? 'text-emerald-300' : 'text-slate-300'}`}>
                        {c.name}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{c.role}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Real-time In-game Options Explainer */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-300 space-y-2">
              <span className="font-bold text-white text-xs uppercase tracking-wider block font-display">
                ⚡ Options Modifiables en Direct pendant le jeu :
              </span>
              <ul className="space-y-1.5 text-slate-300">
                <li className="flex items-center gap-2">
                  <span>🍌 <strong>Ajouter les fruits (Mode Normal) :</strong> traverse l'écran pour tromper vos réflexes.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>💣 <strong>Ajouter les mines (Mode Difficile) :</strong> attention à l'explosion (-2 points).</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>☠️ <strong>Mode Cauchemar :</strong> déluge intense de fruits et de mines en simultané.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🚀 <strong>Accélération progressive :</strong> démarre à 3 secondes par ballon, puis accélère jusqu'à 1 seconde avec superposition de ballons !</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Launch Infinite Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => onStartInfinite(infiniteCharacter, infinitePlayerName.trim() || 'Champion')}
              className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base uppercase tracking-wider font-display rounded-2xl shadow-xl hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Infinity className="w-5 h-5 stroke-[2.5]" />
              <span>Lancer la Session Infinie !</span>
            </button>
          </div>
        </div>
      ) : (
        /* TOURNAMENT ROUNDS CONFIGURATION */
        <div className="space-y-6">
        {/* SECTION 1: DIFFICULTÉ */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 font-display">
            Niveau de Difficulté
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Facile */}
            <button
              type="button"
              onClick={() => setDifficulty('facile')}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                difficulty === 'facile'
                  ? 'bg-emerald-500/15 border-emerald-400/80 ring-1 ring-emerald-400/50 text-white'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-base text-emerald-400 font-display">Facile</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Ballons modérés (durée 2s). Pas de pièges. Parfait pour s’échauffer.
              </p>
            </button>

            {/* Normale */}
            <button
              type="button"
              onClick={() => setDifficulty('normale')}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                difficulty === 'normale'
                  ? 'bg-amber-500/15 border-amber-400/80 ring-1 ring-amber-400/50 text-white'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-base text-amber-400 font-display">Normale</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Ballons plus rapides + fruits trompeurs qui traversent l’écran !
              </p>
            </button>

            {/* Difficile */}
            <button
              type="button"
              onClick={() => setDifficulty('difficile')}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                difficulty === 'difficile'
                  ? 'bg-red-500/15 border-red-400/80 ring-1 ring-red-400/50 text-white'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-base text-red-400 font-display">Difficile</span>
                <ShieldAlert className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Fruits trompeurs + MINES explosives qui retirent des points (-2 pts) !
              </p>
            </button>

            {/* Cauchemar */}
            <button
              type="button"
              onClick={() => setDifficulty('cauchemar')}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                difficulty === 'cauchemar'
                  ? 'bg-purple-950/50 border-purple-400/90 ring-1 ring-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-base text-purple-400 font-display">Cauchemar</span>
                <span className="text-sm">☠️</span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                3 ballons EN MÊME TEMPS (5s) au milieu d'un déluge de fruits et de mines !
              </p>
            </button>
          </div>
        </div>

        {/* SECTION 2: JOUEURS & CONFIGURATION */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide uppercase font-display">
                Nombre de Joueurs (1 à 5)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Jouez seul contre l’ordinateur ou entre amis à tour de rôle !
              </p>
            </div>

            {/* Player Count Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleTotalPlayersChange(num)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    totalPlayersCount === num
                      ? 'bg-amber-500 text-slate-950 shadow-md font-display'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {num} {num === 1 ? 'Joueur' : 'Joueurs'}
                </button>
              ))}
            </div>
          </div>

          {/* Human Count Sub-Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                Joueurs Humains :
              </span>
              <span className="text-xs text-slate-400 ml-2">
                {humanCount} humain{humanCount > 1 ? 's' : ''} + {totalPlayersCount - humanCount} ordinateur{totalPlayersCount - humanCount > 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPlayersCount }, (_, i) => i + 1).map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => handleHumanCountChange(cnt)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                    humanCount === cnt
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>

          {/* PLAYERS LIST CONFIGURATION CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: totalPlayersCount }, (_, i) => {
              const draft = playersDraft[i];
              const isHuman = i < humanCount;
              const char = CHARACTERS[draft.character];

              return (
                <div
                  key={draft.id}
                  className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-3 relative overflow-hidden"
                >
                  {/* Header: Player # and Type Tag */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display">
                      Joueur {i + 1}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      {isHuman ? (
                        <span className="text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          <Users className="w-3 h-3" /> Humain
                        </span>
                      ) : (
                        <span className="text-cyan-400 flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                          <Bot className="w-3 h-3" /> Ordinateur
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Player Name Input */}
                  <div>
                    <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                      Nom du joueur :
                    </label>
                    <input
                      type="text"
                      maxLength={18}
                      value={draft.name}
                      onChange={(e) => updatePlayerName(i, e.target.value)}
                      placeholder={`Nom du joueur ${i + 1}`}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-white focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  {/* Character Mascot Selection */}
                  <div>
                    <label className="block text-[11px] text-slate-400 font-semibold mb-2">
                      Choix du Personnage :
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {CHARACTER_LIST.map((c) => {
                        const isSelected = draft.character === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => updatePlayerCharacter(i, c.id)}
                            className={`flex flex-col items-center p-1.5 rounded-lg border transition-all ${
                              isSelected
                                ? 'bg-amber-500/20 border-amber-400 shadow-md ring-1 ring-amber-400'
                                : 'bg-slate-900/60 border-slate-700/60 hover:border-slate-500'
                            }`}
                            title={`${c.name} - ${c.role}`}
                          >
                            <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-950 mb-1 border border-slate-700">
                              <img
                                src={c.image}
                                alt={c.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <span
                              className={`text-[10px] font-bold truncate max-w-full ${
                                isSelected ? 'text-amber-300' : 'text-slate-400'
                              }`}
                            >
                              {c.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected mascot preview badge */}
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-700/50">
                    <span style={{ color: char.color }} className="font-bold">
                      {char.icon} {char.name}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-400 italic truncate">{char.role}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: DURÉE DU MATCH & LANCEMENT */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display">
              Tours par joueur :
            </span>
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
              {[3, 5, 7].map((rounds) => (
                <button
                  key={rounds}
                  type="button"
                  onClick={() => setTotalRounds(rounds)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    totalRounds === rounds
                      ? 'bg-amber-500 text-slate-950 font-display'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {rounds} Tours
                </button>
              ))}
            </div>
          </div>

          {/* Start Game CTA */}
          <button
            type="button"
            onClick={handleLaunch}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base uppercase tracking-wider font-display rounded-xl shadow-lg hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Démarrer le Match</span>
            <Play className="w-5 h-5 fill-slate-950 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
      )}
    </div>
  );
};
