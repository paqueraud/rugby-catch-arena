import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Player, GameSettings, FlyingItem, FruitKind } from '../types/game';
import { CHARACTERS, STADIUM_IMAGE } from '../constants/characters';
import { RugbyBall } from './RugbyBall';
import { DistractorItem } from './DistractorItem';
import { sound } from '../services/sound';
import { generateRandomLinearTrajectory } from '../utils/trajectory';
import { Volume2, VolumeX, Play, ArrowRight, Trophy, Bot, User, Sparkles } from 'lucide-react';

interface StadiumFieldProps {
  player: Player;
  settings: GameSettings;
  currentRound: number;
  isLastTurnOfGame: boolean;
  onTurnComplete: (caught: number, netScoreChange: number) => void;
  onToggleSound: () => void;
  isSoundEnabled: boolean;
}

type TurnPhase = 'READY_TO_START' | 'COUNTDOWN' | 'FLYING' | 'TURN_RECAP';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
}

interface FloatingFeedback {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

export const StadiumField: React.FC<StadiumFieldProps> = ({
  player,
  settings,
  currentRound,
  isLastTurnOfGame,
  onTurnComplete,
  onToggleSound,
  isSoundEnabled,
}) => {
  const [turnPhase, setTurnPhase] = useState<TurnPhase>('READY_TO_START');
  const [countdownValue, setCountdownValue] = useState<number>(3);
  const [items, setItems] = useState<FlyingItem[]>([]);
  const [activeBallsCaught, setActiveBallsCaught] = useState(0);
  const [turnScoreDelta, setTurnScoreDelta] = useState(0);
  const [screenShake, setScreenShake] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [feedbacks, setFeedbacks] = useState<FloatingFeedback[]>([]);
  const [botCursor, setBotCursor] = useState<{ x: number; y: number; visible: boolean; clicking: boolean }>({
    x: 50,
    y: 50,
    visible: false,
    clicking: false,
  });

  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const turnFinishedRef = useRef<boolean>(false);
  const botTargetedIds = useRef<Set<string>>(new Set());

  // Reset to READY_TO_START when player or round changes
  useEffect(() => {
    setTurnPhase('READY_TO_START');
    setCountdownValue(3);
    setItems([]);
    setActiveBallsCaught(0);
    setTurnScoreDelta(0);
    setParticles([]);
    setFeedbacks([]);
    turnFinishedRef.current = false;
    botTargetedIds.current.clear();
    setBotCursor({ x: 50, y: 50, visible: false, clicking: false });

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [player.id, currentRound]);

  // Generate 3 rugby balls + distractors with guaranteed visible trajectories
  const generateTurnItems = useCallback(() => {
    const list: FlyingItem[] = [];
    const isEasy = settings.difficulty === 'facile';
    const isNormal = settings.difficulty === 'normale';
    const isHard = settings.difficulty === 'difficile';
    const isNightmare = settings.difficulty === 'cauchemar';

    if (isNightmare) {
      // CAUCHEMAR MODE:
      // 3 balls spawn AT THE SAME TIME and last for 5 SECONDS (5000ms) with unique trajectories
      for (let idx = 0; idx < 3; idx++) {
        const traj = generateRandomLinearTrajectory({ minSpan: 65, maxSpan: 88 });
        list.push({
          id: `ball-nightmare-${idx}-${Date.now()}`,
          type: 'rugby_ball',
          startX: traj.startX,
          startY: traj.startY,
          endX: traj.endX,
          endY: traj.endY,
          spawnTime: 200,
          durationMs: 5000,
          rotationSpeed: traj.rotationSpeed,
          initialRotation: traj.initialRotation,
          isClicked: false,
        });
      }

      // PLEIN DE FRUITS (8 fruits with omni-directional trajectories)
      const fruits: FruitKind[] = ['banana', 'watermelon', 'orange', 'apple'];
      for (let idx = 0; idx < 8; idx++) {
        const traj = generateRandomLinearTrajectory({ minSpan: 50, maxSpan: 85 });
        list.push({
          id: `fruit-nightmare-${idx}-${Date.now()}`,
          type: 'fruit',
          fruitKind: fruits[idx % fruits.length],
          startX: traj.startX,
          startY: traj.startY,
          endX: traj.endX,
          endY: traj.endY,
          spawnTime: 200 + idx * 400,
          durationMs: Math.max(2000, 4200 - idx * 250),
          rotationSpeed: traj.rotationSpeed,
          initialRotation: traj.initialRotation,
          isClicked: false,
        });
      }

      // PLEIN DE MINES (8 mines with omni-directional trajectories)
      for (let idx = 0; idx < 8; idx++) {
        const traj = generateRandomLinearTrajectory({ minSpan: 50, maxSpan: 85 });
        list.push({
          id: `mine-nightmare-${idx}-${Date.now()}`,
          type: 'mine',
          startX: traj.startX,
          startY: traj.startY,
          endX: traj.endX,
          endY: traj.endY,
          spawnTime: 200 + idx * 420,
          durationMs: Math.max(2000, 4400 - idx * 280),
          rotationSpeed: 70,
          initialRotation: traj.initialRotation,
          isClicked: false,
        });
      }

      return list;
    }

    // Standard Modes (Facile, Normale, Difficile):
    // 3 Rugby Balls with 2000ms duration each & high-variance paths
    const ballSpawns = [300, 2000, 3700];
    ballSpawns.forEach((spawnTime, idx) => {
      const traj = generateRandomLinearTrajectory({
        minSpan: isEasy ? 50 : 65,
        maxSpan: isEasy ? 65 : 85,
      });

      list.push({
        id: `ball-${idx}-${Date.now()}`,
        type: 'rugby_ball',
        startX: traj.startX,
        startY: traj.startY,
        endX: traj.endX,
        endY: traj.endY,
        spawnTime,
        durationMs: 2000,
        rotationSpeed: traj.rotationSpeed,
        initialRotation: traj.initialRotation,
        isClicked: false,
      });
    });

    // Fruits in Normal and Hard
    if (isNormal || isHard) {
      const fruits: FruitKind[] = ['banana', 'watermelon', 'orange', 'apple'];
      const fruitSpawns = [1100, 2800];

      fruitSpawns.forEach((spawnTime, idx) => {
        const traj = generateRandomLinearTrajectory({ minSpan: 55, maxSpan: 85 });
        list.push({
          id: `fruit-${idx}-${Date.now()}`,
          type: 'fruit',
          fruitKind: fruits[Math.floor(Math.random() * fruits.length)],
          startX: traj.startX,
          startY: traj.startY,
          endX: traj.endX,
          endY: traj.endY,
          spawnTime,
          durationMs: 2000,
          rotationSpeed: traj.rotationSpeed,
          initialRotation: traj.initialRotation,
          isClicked: false,
        });
      });
    }

    // Mines in Hard
    if (isHard) {
      const mineSpawns = [1600, 3300];

      mineSpawns.forEach((spawnTime, idx) => {
        const traj = generateRandomLinearTrajectory({ minSpan: 55, maxSpan: 85 });
        list.push({
          id: `mine-${idx}-${Date.now()}`,
          type: 'mine',
          startX: traj.startX,
          startY: traj.startY,
          endX: traj.endX,
          endY: traj.endY,
          spawnTime,
          durationMs: 2000,
          rotationSpeed: 60,
          initialRotation: traj.initialRotation,
          isClicked: false,
        });
      });
    }

    return list;
  }, [settings.difficulty]);

  // Particles
  const createParticles = (x: number, y: number, color: string, count = 14) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = 2 + Math.random() * 3.5;
      newParticles.push({
        id: Math.random(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 5 + Math.random() * 5,
        alpha: 1,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  };

  // Feedback floater
  const addFeedback = (x: number, y: number, text: string, color: string) => {
    const fb: FloatingFeedback = {
      id: Math.random(),
      x,
      y,
      text,
      color,
    };
    setFeedbacks((prev) => [...prev, fb]);
    setTimeout(() => {
      setFeedbacks((prev) => prev.filter((item) => item.id !== fb.id));
    }, 900);
  };

  // Item click handler
  const handleItemClick = useCallback(
    (item: FlyingItem, currentX: number, currentY: number) => {
      if (item.isClicked || turnFinishedRef.current) return;

      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, isClicked: true } : it))
      );

      if (item.type === 'rugby_ball') {
        sound.playCatchBall();
        createParticles(currentX, currentY, '#F59E0B', 16);
        addFeedback(currentX, currentY, '+1 POINT !', 'text-amber-300');
        setActiveBallsCaught((prev) => prev + 1);
        setTurnScoreDelta((prev) => prev + 1);
      } else if (item.type === 'fruit') {
        sound.playFruitSquish();
        createParticles(currentX, currentY, '#F97316', 10);
        addFeedback(currentX, currentY, 'Trompé ! 🍌', 'text-orange-400');
      } else if (item.type === 'mine') {
        sound.playMineExplosion();
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 450);
        createParticles(currentX, currentY, '#EF4444', 22);
        addFeedback(currentX, currentY, 'BOOM ! -2 PTS 💥', 'text-red-500');
        setTurnScoreDelta((prev) => prev - 2);
      }
    },
    []
  );

  // START TURN COUNTDOWN
  const startCountdown = () => {
    sound.playCountdown(false);
    setTurnPhase('COUNTDOWN');
    setCountdownValue(3);

    const interval = setInterval(() => {
      setCountdownValue((prev) => {
        if (prev === 3) {
          sound.playCountdown(false);
          return 2;
        }
        if (prev === 2) {
          sound.playCountdown(false);
          return 1;
        }
        if (prev === 1) {
          sound.playCountdown(true);
          return 0; // GO !
        }
        clearInterval(interval);
        launchFlyingPhase();
        return 0;
      });
    }, 700);
  };

  // LAUNCH FLYING PHASE
  const launchFlyingPhase = () => {
    setTurnPhase('FLYING');
    turnFinishedRef.current = false;
    botTargetedIds.current.clear();
    const newItems = generateTurnItems();
    setItems(newItems);
    startTimeRef.current = performance.now();
    sound.playWhistle();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;

      // Computer bot behavior
      if (!player.isHuman && !turnFinishedRef.current) {
        setBotCursor((prev) => ({ ...prev, visible: true }));

        const activeBalls = newItems.filter((it) => {
          if (it.type !== 'rugby_ball' || it.isClicked) return false;
          const itElapsed = elapsed - it.spawnTime;
          return itElapsed >= 400 && itElapsed <= (settings.difficulty === 'cauchemar' ? 4700 : 1700);
        });

        if (activeBalls.length > 0) {
          const targetBall = activeBalls[0];
          const itElapsed = elapsed - targetBall.spawnTime;
          const progress = Math.min(1, Math.max(0, itElapsed / targetBall.durationMs));
          const targetX = targetBall.startX + (targetBall.endX - targetBall.startX) * progress;
          const targetY = targetBall.startY + (targetBall.endY - targetBall.startY) * progress;

          setBotCursor((c) => ({
            ...c,
            x: c.x + (targetX - c.x) * 0.22,
            y: c.y + (targetY - c.y) * 0.22,
          }));

          const minReaction = settings.difficulty === 'cauchemar' ? 650 : 750;
          if (!botTargetedIds.current.has(targetBall.id) && itElapsed >= minReaction) {
            botTargetedIds.current.add(targetBall.id);

            let successChance = 0.72;
            if (settings.difficulty === 'normale') successChance = 0.82;
            if (settings.difficulty === 'difficile') successChance = 0.88;
            if (settings.difficulty === 'cauchemar') successChance = 0.85;

            if (Math.random() < successChance) {
              setTimeout(() => {
                setBotCursor((c) => ({ ...c, clicking: true }));
                handleItemClick(targetBall, targetX, targetY);
                setTimeout(() => setBotCursor((c) => ({ ...c, clicking: false })), 150);
              }, 120);
            }
          }
        }
      }

      // Update particles
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx * 0.2,
            y: p.y + p.vy * 0.2,
            alpha: p.alpha - 0.035,
          }))
          .filter((p) => p.alpha > 0.05)
      );

      // Total round time: 5500ms in Cauchemar (5s flight + 500ms), 6000ms in other modes
      const totalTurnTime = settings.difficulty === 'cauchemar' ? 5500 : 6000;
      if (elapsed >= totalTurnTime && !turnFinishedRef.current) {
        turnFinishedRef.current = true;
        setBotCursor((prev) => ({ ...prev, visible: false }));
        setTurnPhase('TURN_RECAP');
        return;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Bot auto-countdown in READY_TO_START
  useEffect(() => {
    if (!player.isHuman && turnPhase === 'READY_TO_START') {
      const timer = setTimeout(() => {
        startCountdown();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [player.isHuman, turnPhase]);

  const char = CHARACTERS[player.character];

  return (
    <div
      className={`relative w-full h-[62vh] min-h-[480px] max-h-[700px] rounded-2xl overflow-hidden select-none border-2 border-emerald-800/60 shadow-2xl bg-slate-950 ${
        screenShake ? 'animate-shake' : ''
      }`}
      style={{ touchAction: 'none' }}
    >
      {/* Stadium Pitch Background Image */}
      <img
        src={STADIUM_IMAGE}
        alt="Stade de Rugby"
        className="absolute inset-0 w-full h-full object-cover brightness-[0.88] contrast-[1.1]"
        referrerPolicy="no-referrer"
      />

      {/* Floodlight & Stadium Lighting Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/40 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-1/2 h-40 bg-emerald-400/10 blur-3xl pointer-events-none" />

      {/* Rugby Pitch Markings */}
      <div className="absolute inset-0 pointer-events-none opacity-45">
        {/* Goal Post Silhouette in Distance */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-end gap-14 opacity-75">
          <div className="w-2 h-40 bg-white/90 shadow-[0_0_12px_white]" />
          <div className="w-36 h-1.5 bg-white/90 absolute bottom-14 -left-11 shadow-[0_0_12px_white]" />
          <div className="w-2 h-40 bg-white/90 shadow-[0_0_12px_white]" />
        </div>
        {/* 50m & 22m lines */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/40 border-b border-dashed border-white/50" />
        <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-white/30" />
        <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-white/30" />
      </div>

      {/* TOP ARENA HUD */}
      <div className="absolute top-3 inset-x-3 sm:inset-x-5 flex items-center justify-between z-20 pointer-events-auto">
        {/* Active Player Card Banner */}
        <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 rounded-xl shadow-lg">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-600 bg-slate-950 shrink-0">
            <img
              src={char.image}
              alt={char.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white tracking-tight">{player.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-semibold uppercase">
                {player.isHuman ? 'Humain' : 'Ordi'}
              </span>
            </div>
            <div className="text-xs text-amber-400 font-medium">
              {char.name} · <span className="text-slate-300">Tour {currentRound}</span>
            </div>
          </div>
        </div>

        {/* Turn Catch Counter & Sound Toggle */}
        <div className="flex items-center gap-2">
          {/* Balls caught in this turn: 3 balls maximum */}
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
            <span className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Ballons :</span>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((idx) => {
                const caught = idx < activeBallsCaught;
                return (
                  <div
                    key={idx}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      caught
                        ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.9)] scale-110 font-bold text-sm'
                        : 'bg-slate-800/80 border border-slate-700 text-slate-500 text-xs'
                    }`}
                  >
                    🏉
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sound Mute/Unmute */}
          <button
            onClick={onToggleSound}
            aria-label={isSoundEnabled ? 'Couper le son' : 'Activer le son'}
            className="p-2.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* FLYING ITEMS LAYER */}
      {turnPhase === 'FLYING' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-auto">
          {items.map((item) => {
            const now = performance.now();
            const elapsed = now - startTimeRef.current - item.spawnTime;

            if (elapsed < 0 || elapsed > item.durationMs) {
              return null;
            }

            const progress = Math.min(1, Math.max(0, elapsed / item.durationMs));
            const currentX = item.startX + (item.endX - item.startX) * progress;
            const currentY = item.startY + (item.endY - item.startY) * progress;
            const rotation = item.initialRotation + item.rotationSpeed * (elapsed / 1000);

            return (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (player.isHuman) {
                    handleItemClick(item, currentX, currentY);
                  }
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  if (player.isHuman) {
                    handleItemClick(item, currentX, currentY);
                  }
                }}
                style={{
                  position: 'absolute',
                  left: `${currentX}%`,
                  top: `${currentY}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: item.type === 'rugby_ball' ? 25 : 20,
                }}
                className="cursor-crosshair no-select"
              >
                {item.type === 'rugby_ball' ? (
                  <RugbyBall rotation={rotation} isClicked={item.isClicked} />
                ) : (
                  <DistractorItem
                    type={item.type}
                    fruitKind={item.fruitKind}
                    rotation={rotation}
                    isClicked={item.isClicked}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* PARTICLES */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            opacity: p.alpha,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            boxShadow: `0 0 10px ${p.color}`,
          }}
        />
      ))}

      {/* FLOATING TEXT FEEDBACKS */}
      {feedbacks.map((f) => (
        <div
          key={f.id}
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
          }}
          className={`absolute -translate-x-1/2 -translate-y-8 font-extrabold text-xl sm:text-2xl font-display tracking-wider pointer-events-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] animate-bounce ${f.color} z-30`}
        >
          {f.text}
        </div>
      ))}

      {/* COMPUTER (ORDI) RETICLE CURSOR */}
      {!player.isHuman && botCursor.visible && (
        <div
          style={{
            left: `${botCursor.x}%`,
            top: `${botCursor.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          className="absolute pointer-events-none z-40 transition-transform duration-75 ease-out"
        >
          <div
            className={`w-10 h-10 rounded-full border-2 border-cyan-400 flex items-center justify-center transition-all ${
              botCursor.clicking ? 'scale-75 bg-cyan-400/60 shadow-[0_0_20px_#22d3ee]' : 'scale-100'
            }`}
          >
            <div className="w-2 h-2 bg-cyan-300 rounded-full" />
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-cyan-300 bg-slate-900/95 px-2 py-0.5 rounded border border-cyan-500/60 whitespace-nowrap shadow-lg">
              IA Cible
            </span>
          </div>
        </div>
      )}

      {/* IN-ARENA OVERLAY 1: READY_TO_START (Never obscures with black modal!) */}
      {turnPhase === 'READY_TO_START' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-[2px]">
          <div className="max-w-md w-full bg-slate-900/95 border-2 border-slate-700/80 rounded-2xl p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Mascot Avatar */}
            <div className="relative w-20 h-20 mx-auto mb-3 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl bg-slate-950 ring-4 ring-amber-400/20">
              <img
                src={char.image}
                alt={char.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight uppercase">
              C'est à {player.name} !
            </h3>
            <p style={{ color: char.color }} className="text-xs sm:text-sm font-bold mb-3">
              {char.icon} {char.name} · {char.nickname}
            </p>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 mb-5 text-xs text-slate-300 text-left space-y-1">
              <div className="font-semibold text-white flex items-center justify-between">
                <span>Tour {currentRound} · 3 ballons :</span>
                <span className={`capitalize font-bold ${settings.difficulty === 'cauchemar' ? 'text-purple-400' : 'text-amber-400'}`}>
                  {settings.difficulty === 'cauchemar' ? '☠️ Cauchemar' : settings.difficulty}
                </span>
              </div>
              {settings.difficulty === 'cauchemar' ? (
                <>
                  <p className="text-purple-300 font-bold">
                    • 3 ballons apparaissent EN MÊME TEMPS pendant 5 secondes !
                  </p>
                  <p className="text-red-400 font-bold">
                    • DÉLUGE SIMULTANÉ de fruits et de MINES explosives (-2 pts) !
                  </p>
                </>
              ) : (
                <>
                  <p className="text-slate-400">
                    • 3 ballons vont traverser le terrain pendant 2 secondes chacun.
                  </p>
                  {settings.difficulty !== 'facile' && (
                    <p className="text-orange-400">
                      • Attention aux fruits trompeurs qui traversent le terrain !
                    </p>
                  )}
                  {settings.difficulty === 'difficile' && (
                    <p className="text-red-400">
                      • Attention aux MINES : toucher une mine retire 2 points !
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Launch Turn CTA */}
            {player.isHuman ? (
              <button
                type="button"
                onClick={startCountdown}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base uppercase tracking-wider font-display rounded-xl shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>Lancer mon Tour !</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={startCountdown}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-sm uppercase tracking-wider font-display rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bot className="w-5 h-5" />
                <span>Lancer le Tour de l'IA</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* IN-ARENA OVERLAY 2: COUNTDOWN (3.. 2.. 1.. GO!) */}
      {turnPhase === 'COUNTDOWN' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <div className="text-center animate-in zoom-in-75 duration-200">
            <span className="text-8xl sm:text-9xl font-black text-amber-400 font-display drop-shadow-[0_8px_24px_rgba(0,0,0,0.9)] animate-pulse">
              {countdownValue === 0 ? 'GO !' : countdownValue}
            </span>
            <div className="text-base sm:text-lg font-bold text-white uppercase tracking-widest mt-2 drop-shadow">
              {countdownValue === 0 ? 'Attrapez les ballons !' : 'Préparez-vous...'}
            </div>
          </div>
        </div>
      )}

      {/* IN-ARENA OVERLAY 3: TURN_RECAP (Clear result on pitch + button to advance) */}
      {turnPhase === 'TURN_RECAP' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="max-w-md w-full bg-slate-900/95 border-2 border-slate-700/80 rounded-2xl p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              {activeBallsCaught === 3 ? (
                <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
              ) : (
                <Sparkles className="w-8 h-8 text-amber-400" />
              )}
            </div>

            <h3 className="text-2xl font-black text-white font-display uppercase tracking-wide">
              {activeBallsCaught === 3
                ? 'Essai Transformé !'
                : activeBallsCaught > 0
                ? 'Bien Joué !'
                : 'Essai Manqué'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Tour de <strong className="text-white">{player.name}</strong> ({char.name})
            </p>

            <div className="my-5 grid grid-cols-2 gap-3">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Ballons Attrapés
                </span>
                <div className="text-2xl font-black text-amber-400 font-display tabular-nums mt-0.5">
                  {activeBallsCaught} / 3
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Points du Tour
                </span>
                <div
                  className={`text-2xl font-black font-display tabular-nums mt-0.5 ${
                    turnScoreDelta > 0
                      ? 'text-emerald-400'
                      : turnScoreDelta < 0
                      ? 'text-red-400'
                      : 'text-slate-400'
                  }`}
                >
                  {turnScoreDelta > 0 ? `+${turnScoreDelta}` : turnScoreDelta}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onTurnComplete(activeBallsCaught, turnScoreDelta)}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base uppercase tracking-wider font-display rounded-xl shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isLastTurnOfGame ? 'Voir le Podium Final 🏆' : 'Joueur Suivant'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM ARENA FOOTER BAR */}
      <div className="absolute bottom-3 inset-x-3 sm:inset-x-5 flex items-center justify-between text-xs text-slate-300 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 z-20">
        <div className="flex items-center gap-2">
          {settings.difficulty === 'cauchemar' ? (
            <>
              <span className="text-purple-400 font-bold">☠️ Mode Cauchemar</span>
              <span aria-hidden="true">·</span>
              <span className="text-white font-semibold">3 ballons en même temps (5s)</span>
              <span aria-hidden="true">·</span>
              <span className="text-red-400 font-semibold">Déluge de mines</span>
            </>
          ) : (
            <>
              <span>🏉 3 ballons rectilignes par tour</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-400 font-semibold font-display">2 sec / ballon</span>
            </>
          )}
        </div>
        <div className="font-semibold text-slate-400 hidden sm:block">
          {player.isHuman ? 'Cliquez ou touchez les ballons !' : 'IA en action'}
        </div>
      </div>
    </div>
  );
};
