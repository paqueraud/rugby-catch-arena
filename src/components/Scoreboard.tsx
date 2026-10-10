import React from 'react';
import { Player, GameSettings } from '../types/game';
import { CHARACTERS } from '../constants/characters';
import { Trophy, Bot, User, Flame } from 'lucide-react';

interface ScoreboardProps {
  players: Player[];
  activePlayerId: string;
  currentRound: number;
  settings: GameSettings;
  className?: string;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  players,
  activePlayerId,
  currentRound,
  settings,
  className = '',
}) => {
  // Sort players by score descending for ranking display
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.ballsCaught - a.ballsCaught;
  });

  return (
    <aside
      aria-label="Tableau des scores"
      className={`bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex flex-col shadow-2xl ${className}`}
    >
      {/* Scoreboard Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide uppercase font-display">
              Tableau des Scores
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span>Tour {currentRound} / {settings.totalRounds}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{settings.difficulty}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Players List */}
      <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
        {sortedPlayers.map((player, index) => {
          const char = CHARACTERS[player.character];
          const isActive = player.id === activePlayerId;
          const rank = index + 1;

          return (
            <div
              key={player.id}
              className={`relative rounded-xl p-3 transition-all duration-200 border ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500/15 via-slate-800/80 to-slate-800/80 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/40'
                  : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800/80'
              }`}
            >
              {/* Active Playing Badge */}
              {isActive && (
                <div className="absolute -top-2.5 right-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 rounded-full shadow-sm flex items-center gap-1">
                  <Flame className="w-3 h-3 animate-pulse" />
                  <span>En jeu</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                {/* Rank Badge */}
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 font-display ${
                    rank === 1
                      ? 'bg-amber-400 text-slate-950'
                      : rank === 2
                      ? 'bg-slate-300 text-slate-900'
                      : rank === 3
                      ? 'bg-amber-700 text-amber-100'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {rank}
                </div>

                {/* Character Mascot Avatar */}
                <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-slate-700 bg-slate-950">
                  <img
                    src={char.image}
                    alt={char.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback icon container
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      if (target.nextElementSibling) {
                        (target.nextElementSibling as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                  <div
                    style={{ display: 'none' }}
                    className="w-full h-full items-center justify-center text-xl bg-slate-800"
                  >
                    {char.icon}
                  </div>
                </div>

                {/* Player Information */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-white truncate max-w-[120px]">
                      {player.name}
                    </span>
                    {player.isHuman ? (
                      <span className="text-[11px] text-slate-400" title="Joueur Humain">
                        <User className="w-3 h-3 inline" />
                      </span>
                    ) : (
                      <span className="text-[11px] text-cyan-400" title="Ordinateur">
                        <Bot className="w-3 h-3 inline" />
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span style={{ color: char.color }} className="font-semibold">
                      {char.name}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {player.ballsCaught} {player.ballsCaught <= 1 ? 'ballon' : 'ballons'}
                    </span>
                    {(settings.difficulty === 'difficile' || settings.difficulty === 'cauchemar') && player.minesHit > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-red-400 tabular-nums">-{player.minesHit * 2}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <span className="text-2xl font-black text-amber-400 font-display tabular-nums tracking-tight">
                    {player.score}
                  </span>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    Pts
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rules / Legend summary at bottom */}
      <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>🏈 1 ballon = +1 pt</span>
        {settings.difficulty !== 'facile' && <span>🍉 Fruit = piège</span>}
        {(settings.difficulty === 'difficile' || settings.difficulty === 'cauchemar') && (
          <span className="text-red-400">💣 Mine = -2 pts</span>
        )}
      </div>
    </aside>
  );
};
