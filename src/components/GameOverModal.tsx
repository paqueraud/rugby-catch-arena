import React, { useEffect } from 'react';
import { Player, GameSettings } from '../types/game';
import { CHARACTERS } from '../constants/characters';
import { Trophy, RotateCcw, Sliders, Medal, Award, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../services/sound';

interface GameOverModalProps {
  players: Player[];
  settings: GameSettings;
  onRematch: () => void;
  onNewSetup: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  players,
  settings,
  onRematch,
  onNewSetup,
}) => {
  // Sort players descending by score
  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.ballsCaught - a.ballsCaught;
  });

  const winner = sorted[0];
  const winnerChar = CHARACTERS[winner.character];

  useEffect(() => {
    sound.playVictory();

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#FFFFFF'],
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 400);

      return () => clearTimeout(timer);
    } catch {
      // Confetti fallback
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 text-center shadow-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Glow ambient */}
        <div
          style={{ backgroundColor: winnerChar.color }}
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
        />

        {/* Victory Header */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Trophy className="w-4 h-4" />
          <span>Fin du Tournoi de Rugby</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-white font-display uppercase tracking-tight">
          Victoire de {winner.name} !
        </h2>
        <p className="text-sm text-slate-300 mt-1">
          {winnerChar.name} · Champion de l’Arène avec{' '}
          <span className="font-bold text-amber-400 tabular-nums">{winner.score} points</span>
        </p>

        {/* WINNER SPOTLIGHT */}
        <div className="my-6 relative inline-block">
          <div className="w-32 h-32 sm:w-36 sm:h-36 mx-auto rounded-2xl overflow-hidden border-4 border-amber-400 shadow-2xl bg-slate-950 ring-8 ring-amber-400/20">
            <img
              src={winnerChar.image}
              alt={winnerChar.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase font-display shadow-md">
            Grand Vainqueur
          </div>
        </div>

        {/* PODIUM CARDS (Top 3 or available players) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
          {sorted.slice(0, 3).map((p, idx) => {
            const pChar = CHARACTERS[p.character];
            const rank = idx + 1;

            return (
              <div
                key={p.id}
                className={`rounded-2xl p-4 border transition-all ${
                  rank === 1
                    ? 'bg-gradient-to-b from-amber-500/20 to-slate-900 border-amber-400/80 shadow-lg'
                    : rank === 2
                    ? 'bg-slate-800/60 border-slate-600'
                    : 'bg-slate-800/40 border-slate-700/60'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-2 font-display font-bold text-sm">
                  {rank === 1 && <Medal className="w-4 h-4 text-amber-400" />}
                  {rank === 2 && <Award className="w-4 h-4 text-slate-300" />}
                  {rank === 3 && <Award className="w-4 h-4 text-amber-700" />}
                  <span
                    className={
                      rank === 1
                        ? 'text-amber-400'
                        : rank === 2
                        ? 'text-slate-300'
                        : 'text-amber-700'
                    }
                  >
                    {rank === 1 ? '1ère Place' : rank === 2 ? '2ème Place' : '3ème Place'}
                  </span>
                </div>

                <div className="w-12 h-12 mx-auto mb-2 rounded-xl overflow-hidden bg-slate-950 border border-slate-700">
                  <img
                    src={pChar.image}
                    alt={pChar.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="font-bold text-sm text-white truncate">{p.name}</div>
                <div className="text-xs text-slate-400">{pChar.name}</div>
                <div className="mt-2 text-xl font-black text-amber-400 font-display tabular-nums">
                  {p.score} pts
                </div>
              </div>
            );
          })}
        </div>

        {/* DETAILED STATS TABLE */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-6 text-left">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 font-display">
            Statistiques Détaillées du Match
          </h3>
          <div className="space-y-2">
            {sorted.map((p, idx) => {
              const pChar = CHARACTERS[p.character];
              const totalPossibleBalls = settings.totalRounds * 3;
              const precisionPct =
                totalPossibleBalls > 0
                  ? Math.round((p.ballsCaught / totalPossibleBalls) * 100)
                  : 0;

              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400 w-4">{idx + 1}.</span>
                    <span className="font-bold text-white">{p.name}</span>
                    <span className="text-slate-500">({pChar.name})</span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-300 tabular-nums">
                    <span>
                      <strong className="text-white">{p.ballsCaught}</strong> / {totalPossibleBalls} ballons ({precisionPct}%)
                    </span>
                    {(settings.difficulty === 'difficile' || settings.difficulty === 'cauchemar') && p.minesHit > 0 && (
                      <span className="text-red-400 font-semibold">
                        {p.minesHit} {p.minesHit > 1 ? 'mines' : 'mine'}
                      </span>
                    )}
                    <span className="font-black text-amber-400 text-sm font-display min-w-[40px] text-right">
                      {p.score} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onRematch}
            className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider font-display rounded-xl shadow-lg hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rejouer le Match</span>
          </button>

          <button
            type="button"
            onClick={onNewSetup}
            className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm uppercase tracking-wider font-display rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>Nouvelle Partie & Équipes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
