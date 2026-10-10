import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CharacterType, FruitKind, FlyingItem } from '../types/game';
import { CHARACTERS, STADIUM_IMAGE } from '../constants/characters';
import { RugbyBall } from './RugbyBall';
import { DistractorItem } from './DistractorItem';
import { sound } from '../services/sound';
import { generateRandomLinearTrajectory } from '../utils/trajectory';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Pause,
  Play,
  Trophy,
  Flame,
  Zap,
  Bomb,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';

interface InfiniteStadiumFieldProps {
  character: CharacterType;
  playerName: string;
  onExit: () => void;
  onToggleSound: () => void;
  isSoundEnabled: boolean;
}

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

export const InfiniteStadiumField: React.FC<InfiniteStadiumFieldProps> = ({
  character,
  playerName,
  onExit,
  onToggleSound,
  isSoundEnabled,
}) => {
  // Real-time dynamic options
  const [includeFruits, setIncludeFruits] = useState(false);
  const [includeMines, setIncludeMines] = useState(false);
  const [nightmareDensity, setNightmareDensity] = useState(false);
  const [progressiveAcceleration, setProgressiveAcceleration] = useState(true);

  // Gameplay state
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('rugby_infinite_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [ballsCaught, setBallsCaught] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [currentBallDuration, setCurrentBallDuration] = useState(3.0); // starts at 3.0s

  const [items, setItems] = useState<FlyingItem[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [feedbacks, setFeedbacks] = useState<FloatingFeedback[]>([]);

  // Timers and refs
  const nextBallTimeRef = useRef(0);
  const nextFruitTimeRef = useRef(0);
  const nextMineTimeRef = useRef(0);
  const sessionStartTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef(performance.now());
  const itemsRef = useRef<FlyingItem[]>([]);
  itemsRef.current = items;

  const char = CHARACTERS[character];

  // Particle helper
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

  // Floating text feedback
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
      if (item.isClicked || isPaused) return;

      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, isClicked: true } : it))
      );

      if (item.type === 'rugby_ball') {
        sound.playCatchBall();
        createParticles(currentX, currentY, '#F59E0B', 16);
        setCombo((c) => {
          const newCombo = c + 1;
          const comboBonus = newCombo >= 5 ? 2 : 1;
          const pts = comboBonus;
          setScore((s) => {
            const newScore = s + pts;
            if (newScore > highScore) {
              setHighScore(newScore);
              try {
                localStorage.setItem('rugby_infinite_highscore', newScore.toString());
              } catch {
                // ignore
              }
            }
            return newScore;
          });
          addFeedback(
            currentX,
            currentY,
            newCombo >= 5 ? `COMBO x${newCombo} ! +${pts} PTS` : '+1 POINT !',
            newCombo >= 5 ? 'text-yellow-300' : 'text-amber-300'
          );
          return newCombo;
        });
        setBallsCaught((prev) => prev + 1);
      } else if (item.type === 'fruit') {
        sound.playFruitSquish();
        createParticles(currentX, currentY, '#F97316', 10);
        addFeedback(currentX, currentY, 'Trompé ! 🍌', 'text-orange-400');
        setCombo(0); // broken combo
      } else if (item.type === 'mine') {
        sound.playMineExplosion();
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 450);
        createParticles(currentX, currentY, '#EF4444', 22);
        addFeedback(currentX, currentY, 'BOOM ! -2 PTS 💥', 'text-red-500');
        setScore((s) => Math.max(0, s - 2));
        setCombo(0);
      }
    },
    [highScore, isPaused]
  );

  // Restart infinite run
  const handleResetRun = () => {
    setScore(0);
    setBallsCaught(0);
    setCombo(0);
    setItems([]);
    setParticles([]);
    setFeedbacks([]);
    sessionStartTimeRef.current = performance.now();
    nextBallTimeRef.current = performance.now() + 500;
    nextFruitTimeRef.current = performance.now() + 1500;
    nextMineTimeRef.current = performance.now() + 2000;
    setCurrentBallDuration(3.0);
    sound.playWhistle();
  };

  // Main game loop
  useEffect(() => {
    sound.playWhistle();
    sessionStartTimeRef.current = performance.now();
    nextBallTimeRef.current = performance.now() + 500;
    nextFruitTimeRef.current = performance.now() + 1500;
    nextMineTimeRef.current = performance.now() + 2000;

    const gameLoop = (currentTime: number) => {
      if (!isPaused) {
        // Calculate progressive acceleration
        // In progressive acceleration: starts at 3.0s duration per ball.
        // As caught count and elapsed time increase, drops down to 1.0s!
        // Also spawn interval drops from 3.0s down to 0.7s so balls overlap heavily!
        let ballDurationMs = 2000;
        let spawnIntervalMs = 2000;

        if (progressiveAcceleration) {
          const runSeconds = (currentTime - sessionStartTimeRef.current) / 1000;
          // Progress factor: 0 at start, 1 after ~70s or 35 balls
          const progress = Math.min(1, Math.max(0, runSeconds / 65 + ballsCaught / 35) / 2);
          // Duration drops from 3000ms down to 1000ms
          ballDurationMs = Math.round(3000 - progress * 2000);
          // Spawn interval drops from 3000ms down to 650ms (simultaneous overlap!)
          spawnIntervalMs = Math.round(3000 - progress * 2350);
          setCurrentBallDuration(ballDurationMs / 1000);
        } else {
          setCurrentBallDuration(2.0);
        }

        // 1. SPAWN RUGBY BALLS
        if (currentTime >= nextBallTimeRef.current) {
          const traj = generateRandomLinearTrajectory({ minSpan: 55, maxSpan: 85 });
          const newBall: FlyingItem = {
            id: `inf-ball-${Date.now()}-${Math.random()}`,
            type: 'rugby_ball',
            startX: traj.startX,
            startY: traj.startY,
            endX: traj.endX,
            endY: traj.endY,
            spawnTime: currentTime,
            durationMs: ballDurationMs,
            rotationSpeed: traj.rotationSpeed,
            initialRotation: traj.initialRotation,
            isClicked: false,
          };

          setItems((prev) => [...prev, newBall]);
          nextBallTimeRef.current = currentTime + spawnIntervalMs;
        }

        // 2. SPAWN FRUITS (if enabled or nightmare)
        if ((includeFruits || nightmareDensity) && currentTime >= nextFruitTimeRef.current) {
          const fruits: FruitKind[] = ['banana', 'watermelon', 'orange', 'apple'];
          const traj = generateRandomLinearTrajectory({ minSpan: 50, maxSpan: 85 });
          const fruitDur = Math.max(1600, ballDurationMs + 400);

          const newFruit: FlyingItem = {
            id: `inf-fruit-${Date.now()}-${Math.random()}`,
            type: 'fruit',
            fruitKind: fruits[Math.floor(Math.random() * fruits.length)],
            startX: traj.startX,
            startY: traj.startY,
            endX: traj.endX,
            endY: traj.endY,
            spawnTime: currentTime,
            durationMs: fruitDur,
            rotationSpeed: traj.rotationSpeed,
            initialRotation: traj.initialRotation,
            isClicked: false,
          };

          setItems((prev) => [...prev, newFruit]);
          // Faster fruit spawns in nightmare
          const fruitDelay = nightmareDensity ? 900 + Math.random() * 800 : 1800 + Math.random() * 1400;
          nextFruitTimeRef.current = currentTime + fruitDelay;
        }

        // 3. SPAWN MINES (if enabled or nightmare)
        if ((includeMines || nightmareDensity) && currentTime >= nextMineTimeRef.current) {
          const traj = generateRandomLinearTrajectory({ minSpan: 50, maxSpan: 85 });
          const mineDur = Math.max(1600, ballDurationMs + 600);

          const newMine: FlyingItem = {
            id: `inf-mine-${Date.now()}-${Math.random()}`,
            type: 'mine',
            startX: traj.startX,
            startY: traj.startY,
            endX: traj.endX,
            endY: traj.endY,
            spawnTime: currentTime,
            durationMs: mineDur,
            rotationSpeed: 60,
            initialRotation: traj.initialRotation,
            isClicked: false,
          };

          setItems((prev) => [...prev, newMine]);
          // Faster mine spawns in nightmare
          const mineDelay = nightmareDensity ? 1000 + Math.random() * 900 : 2200 + Math.random() * 1600;
          nextMineTimeRef.current = currentTime + mineDelay;
        }

        // 4. CLEAN UP EXPIRED ITEMS & DETECT MISSED BALLS (FOR COMBO)
        setItems((prev) => {
          const alive: FlyingItem[] = [];
          for (const item of prev) {
            const elapsed = currentTime - item.spawnTime;
            if (elapsed <= item.durationMs) {
              alive.push(item);
            } else if (item.type === 'rugby_ball' && !item.isClicked) {
              // Missed ball resets combo
              setCombo(0);
            }
          }
          return alive;
        });

        // 5. UPDATE PARTICLES
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
      }

      lastFrameTimeRef.current = currentTime;
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    isPaused,
    includeFruits,
    includeMines,
    nightmareDensity,
    progressiveAcceleration,
    ballsCaught,
  ]);

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-5 flex flex-col gap-4">
      {/* HEADER / CONTROL STRIP */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 shadow-xl">
        {/* Left: Back button & Mascot avatar */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExit}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Menu</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
              <img
                src={char.image}
                alt={char.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{playerName}</span>
                <span className="text-[10px] text-amber-400 font-display">({char.name})</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <Flame className="w-3 h-3 animate-pulse" />
                <span>Mode Solo Infini</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Stats HUD */}
        <div className="flex items-center gap-4 sm:gap-6 bg-slate-950/70 px-4 py-1.5 rounded-xl border border-slate-800">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-display">
              Score
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-display tabular-nums">
              {score}
            </span>
          </div>

          <div className="w-px h-7 bg-slate-800" />

          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-display">
              Record
            </span>
            <span className="text-xl sm:text-2xl font-black text-purple-400 font-display tabular-nums">
              {highScore}
            </span>
          </div>

          <div className="w-px h-7 bg-slate-800" />

          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-display">
              Ballons
            </span>
            <span className="text-base sm:text-lg font-bold text-white font-display tabular-nums">
              {ballsCaught}
            </span>
          </div>

          {combo >= 2 && (
            <>
              <div className="w-px h-7 bg-slate-800" />
              <div className="text-center animate-bounce">
                <span className="text-[10px] uppercase font-bold text-yellow-400 block font-display">
                  Combo
                </span>
                <span className="text-base sm:text-lg font-black text-yellow-300 font-display tabular-nums">
                  x{combo}
                </span>
              </div>
            </>
          )}

          <div className="w-px h-7 bg-slate-800 hidden md:block" />

          <div className="text-center hidden md:block">
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-display">
              Vitesse
            </span>
            <span className="text-base font-bold text-cyan-400 font-display tabular-nums">
              {currentBallDuration.toFixed(1)}s
            </span>
          </div>
        </div>

        {/* Right: Pause, Reset & Audio */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isPaused
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-display'
                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-700'
            }`}
            title={isPaused ? 'Reprendre' : 'Pause'}
          >
            {isPaused ? <Play className="w-4 h-4 fill-slate-950" /> : <Pause className="w-4 h-4" />}
            <span className="hidden sm:inline">{isPaused ? 'Reprendre' : 'Pause'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetRun}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Recommencer la session"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title={isSoundEnabled ? 'Couper le son' : 'Activer le son'}
          >
            {isSoundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>

      {/* DYNAMIC LIVE OPTIONS STRIP (Modifiables en direct pendant qu'on joue!) */}
      <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Options en direct :</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Option 1: Fruits (Mode Normal) */}
          <button
            type="button"
            onClick={() => setIncludeFruits((v) => !v)}
            className={`px-3 py-1.5 rounded-xl border font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              includeFruits
                ? 'bg-orange-500/20 border-orange-400 text-orange-300 shadow-sm'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🍌</span>
            <span>Fruits (Normal)</span>
          </button>

          {/* Option 2: Mines (Mode Difficile) */}
          <button
            type="button"
            onClick={() => setIncludeMines((v) => !v)}
            className={`px-3 py-1.5 rounded-xl border font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              includeMines
                ? 'bg-red-500/20 border-red-400 text-red-300 shadow-sm'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bomb className="w-3.5 h-3.5 text-red-400" />
            <span>Mines (Difficile)</span>
          </button>

          {/* Option 3: Plus de fruits et de mines (Mode Cauchemar) */}
          <button
            type="button"
            onClick={() => setNightmareDensity((v) => !v)}
            className={`px-3 py-1.5 rounded-xl border font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              nightmareDensity
                ? 'bg-purple-950/60 border-purple-400 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>☠️</span>
            <span>Cauchemar (Déluge)</span>
          </button>

          {/* Option 4: Accélération du jeu (3s -> 1s + superposition) */}
          <button
            type="button"
            onClick={() => setProgressiveAcceleration((v) => !v)}
            className={`px-3 py-1.5 rounded-xl border font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              progressiveAcceleration
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Accélération (3s → 1s)</span>
          </button>
        </div>
      </div>

      {/* THE ENDLESS RUGBY STADIUM ARENA */}
      <div
        className={`relative w-full h-[62vh] min-h-[480px] max-h-[720px] rounded-2xl overflow-hidden select-none border-2 border-emerald-800/60 shadow-2xl bg-slate-950 ${
          screenShake ? 'animate-shake' : ''
        }`}
        style={{ touchAction: 'none' }}
      >
        {/* Stadium Image Backdrop */}
        <img
          src={STADIUM_IMAGE}
          alt="Stade de Rugby"
          className="absolute inset-0 w-full h-full object-cover brightness-[0.88] contrast-[1.1]"
          referrerPolicy="no-referrer"
        />

        {/* Ambient Stadium Glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/40 pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-1/2 h-40 bg-emerald-400/10 blur-3xl pointer-events-none" />

        {/* Rugby Pitch Markings */}
        <div className="absolute inset-0 pointer-events-none opacity-45">
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-end gap-14 opacity-75">
            <div className="w-2 h-40 bg-white/90 shadow-[0_0_12px_white]" />
            <div className="w-36 h-1.5 bg-white/90 absolute bottom-14 -left-11 shadow-[0_0_12px_white]" />
            <div className="w-2 h-40 bg-white/90 shadow-[0_0_12px_white]" />
          </div>
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/40 border-b border-dashed border-white/50" />
          <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-white/30" />
          <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-white/30" />
        </div>

        {/* FLYING ITEMS LAYER */}
        {!isPaused && (
          <div className="absolute inset-0 overflow-hidden pointer-events-auto">
            {items.map((item) => {
              const now = performance.now();
              const elapsed = now - item.spawnTime;

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
                    handleItemClick(item, currentX, currentY);
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    handleItemClick(item, currentX, currentY);
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

        {/* PAUSE OVERLAY */}
        {isPaused && (
          <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
            <div className="max-w-sm w-full bg-slate-900 border-2 border-slate-700 rounded-2xl p-6 text-center shadow-2xl">
              <h3 className="text-2xl font-black text-white font-display uppercase tracking-wide mb-2">
                Partie en Pause
              </h3>
              <p className="text-xs text-slate-300 mb-5">
                Modifiez vos options ci-dessus ou cliquez pour reprendre votre session infinie.
              </p>
              <button
                type="button"
                onClick={() => setIsPaused(false)}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base uppercase tracking-wider font-display rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>Reprendre le Jeu</span>
              </button>
            </div>
          </div>
        )}

        {/* BOTTOM ARENA FOOTER BAR */}
        <div className="absolute bottom-3 inset-x-3 sm:inset-x-5 flex items-center justify-between text-xs text-slate-300 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 z-20">
          <div className="flex items-center gap-2">
            <span>🏉 Mode Infini · Attrapez les ballons sans fin</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400 font-semibold font-display">
              {progressiveAcceleration ? `Vitesse : ${currentBallDuration.toFixed(1)}s` : 'Vitesse stable : 2.0s'}
            </span>
          </div>
          <div className="font-semibold text-slate-400 hidden sm:block">
            Tapez ou cliquez sur les ballons de rugby !
          </div>
        </div>
      </div>
    </div>
  );
};
