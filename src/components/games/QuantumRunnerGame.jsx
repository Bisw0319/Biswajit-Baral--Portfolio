import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  RotateCcw, 
  Trophy, 
  Volume2, 
  VolumeX, 
  Zap, 
  Shield, 
  Flame, 
  ArrowUp, 
  ArrowDown 
} from 'lucide-react';

class RunnerAudioFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  jump() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {}
  }
  collect() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.06);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }
  crash() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(30, now + 0.25);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch {}
  }
}

const runnerAudio = new RunnerAudioFX();

const QuantumRunnerGame = () => {
  const canvasRef = useRef(null);

  const [gameState, setGameState] = useState('menu'); // 'menu' | 'playing' | 'gameover'
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('quantum_runner_high') || '0', 10);
    } catch {
      return 0;
    }
  });

  const stateRef = useRef({
    running: false,
    score: 0,
    distance: 0,
    speed: 6.5,
    player: {
      x: 100,
      y: 260,
      width: 32,
      height: 32,
      vy: 0,
      isGrounded: true,
      jumpsLeft: 2,
      isSliding: false,
      slideTimer: 0,
      hasShield: false
    },
    obstacles: [],
    coins: [],
    particles: [],
    lastObstacleDist: 0,
    lastCoinDist: 0,
    trail: []
  });

  const startGame = () => {
    runnerAudio.init();
    runnerAudio.collect();

    const s = stateRef.current;
    s.running = true;
    s.score = 0;
    s.distance = 0;
    s.speed = 6.5;
    s.player.y = 260;
    s.player.vy = 0;
    s.player.isGrounded = true;
    s.player.jumpsLeft = 2;
    s.player.isSliding = false;
    s.player.hasShield = false;
    s.obstacles = [];
    s.coins = [];
    s.particles = [];
    s.trail = [];
    s.lastObstacleDist = 0;
    s.lastCoinDist = 0;

    setScore(0);
    setDistance(0);
    setGameState('playing');
  };

  const jump = () => {
    runnerAudio.init();
    const s = stateRef.current;
    if (!s.running) return;

    if (s.player.jumpsLeft > 0) {
      s.player.vy = -12.5;
      s.player.isGrounded = false;
      s.player.isSliding = false;
      s.player.jumpsLeft -= 1;
      runnerAudio.jump();

      // Jump dust particles
      for (let i = 0; i < 6; i++) {
        s.particles.push({
          x: s.player.x,
          y: s.player.y + 16,
          vx: -Math.random() * 3 - 1,
          vy: (Math.random() - 0.5) * 3,
          color: '#00f0ff',
          radius: 2,
          alpha: 1
        });
      }
    }
  };

  const slide = () => {
    runnerAudio.init();
    const s = stateRef.current;
    if (!s.running || !s.player.isGrounded) return;
    s.player.isSliding = true;
    s.player.slideTimer = 0.55; // slide duration seconds
  };

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        jump();
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        slide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main Canvas Render & Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const V_WIDTH = 750;
    const V_HEIGHT = 340;
    const FLOOR_Y = 270;
    canvas.width = V_WIDTH;
    canvas.height = V_HEIGHT;

    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      const s = stateRef.current;

      // 1. Clear Canvas with Synthwave dark purple backdrop
      const bgGrad = ctx.createLinearGradient(0, 0, 0, V_HEIGHT);
      bgGrad.addColorStop(0, '#0a0518');
      bgGrad.addColorStop(0.7, '#160d33');
      bgGrad.addColorStop(1, '#06020f');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

      // Glowing Synthwave Sun on horizon
      ctx.save();
      const sunGrad = ctx.createRadialGradient(V_WIDTH * 0.75, 110, 5, V_WIDTH * 0.75, 110, 65);
      sunGrad.addColorStop(0, '#fcee0a');
      sunGrad.addColorStop(0.5, '#ff007f');
      sunGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(V_WIDTH * 0.75, 110, 65, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Distant City Skyline Silhouettes
      ctx.fillStyle = 'rgba(15, 8, 38, 0.9)';
      for (let b = 0; b < V_WIDTH; b += 45) {
        const h = 40 + ((b * 13) % 65);
        ctx.fillRect(b, FLOOR_Y - h, 38, h);
      }

      // Neon Highway Grid Ground
      ctx.save();
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00f0ff';
      ctx.beginPath();
      ctx.moveTo(0, FLOOR_Y);
      ctx.lineTo(V_WIDTH, FLOOR_Y);
      ctx.stroke();

      // Scrolling grid vertical lines
      const roadOffset = (s.distance * 12) % 40;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.lineWidth = 1;
      for (let x = -roadOffset; x < V_WIDTH; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, FLOOR_Y);
        ctx.lineTo(x - 50, V_HEIGHT);
        ctx.stroke();
      }
      ctx.restore();

      if (s.running) {
        // Distance & Speed
        s.distance += s.speed * dt * 4;
        s.speed = Math.min(13, 6.5 + s.distance * 0.003);
        setDistance(Math.floor(s.distance));

        // Player Physics
        s.player.vy += 32 * dt; // gravity
        s.player.y += s.player.vy;

        // Ground collision
        if (s.player.y >= FLOOR_Y - (s.player.isSliding ? 14 : 24)) {
          s.player.y = FLOOR_Y - (s.player.isSliding ? 14 : 24);
          s.player.vy = 0;
          s.player.isGrounded = true;
          s.player.jumpsLeft = 2;
        }

        // Slide timer
        if (s.player.isSliding) {
          s.player.slideTimer -= dt;
          if (s.player.slideTimer <= 0) {
            s.player.isSliding = false;
            s.player.y = FLOOR_Y - 24;
          }
        }

        // Trail effect
        s.trail.push({ x: s.player.x, y: s.player.y, alpha: 0.8, isSliding: s.player.isSliding });
        if (s.trail.length > 8) s.trail.shift();

        // Spawn Obstacles
        if (s.distance - s.lastObstacleDist > 220 + Math.random() * 180) {
          s.lastObstacleDist = s.distance;
          const isHighLaser = Math.random() > 0.55;
          if (isHighLaser) {
            // Laser Barrier that requires sliding underneath
            s.obstacles.push({
              x: V_WIDTH + 30,
              y: FLOOR_Y - 48,
              width: 24,
              height: 18,
              type: 'high_laser',
              color: '#ff003c'
            });
          } else {
            // Ground Spikes that require jumping
            s.obstacles.push({
              x: V_WIDTH + 30,
              y: FLOOR_Y - 26,
              width: 26,
              height: 26,
              type: 'spike',
              color: '#ff003c'
            });
          }
        }

        // Spawn Data Coins
        if (s.distance - s.lastCoinDist > 140 + Math.random() * 100) {
          s.lastCoinDist = s.distance;
          const coinY = Math.random() > 0.5 ? FLOOR_Y - 20 : FLOOR_Y - 60;
          s.coins.push({
            x: V_WIDTH + 30,
            y: coinY,
            radius: 8,
            type: Math.random() > 0.8 ? 'chip' : 'crystal'
          });
        }

        // Update Obstacles
        for (let i = s.obstacles.length - 1; i >= 0; i--) {
          const obs = s.obstacles[i];
          obs.x -= s.speed * 60 * dt;

          // Check Player Collision
          const pWidth = s.player.isSliding ? 34 : 24;
          const pHeight = s.player.isSliding ? 14 : 26;
          const px = s.player.x;
          const py = s.player.y;

          if (
            px + pWidth / 2 >= obs.x - obs.width / 2 &&
            px - pWidth / 2 <= obs.x + obs.width / 2 &&
            py + pHeight / 2 >= obs.y - obs.height / 2 &&
            py - pHeight / 2 <= obs.y + obs.height / 2
          ) {
            // Collision!
            if (s.player.hasShield) {
              s.player.hasShield = false;
              s.obstacles.splice(i, 1);
              runnerAudio.crash();
              continue;
            } else {
              s.running = false;
              runnerAudio.crash();
              setGameState('gameover');
              const finalScore = s.score + Math.floor(s.distance);
              if (finalScore > highScore) {
                setHighScore(finalScore);
                try {
                  localStorage.setItem('quantum_runner_high', finalScore.toString());
                } catch {}
              }
              break;
            }
          }

          if (obs.x < -40) {
            s.obstacles.splice(i, 1);
          }
        }

        // Update Coins
        for (let i = s.coins.length - 1; i >= 0; i--) {
          const c = s.coins[i];
          c.x -= s.speed * 60 * dt;

          const dist = Math.hypot(c.x - s.player.x, c.y - s.player.y);
          if (dist < c.radius + 20) {
            runnerAudio.collect();
            const earned = c.type === 'chip' ? 150 : 50;
            s.score += earned;
            setScore(s.score);

            // Particles
            for (let p = 0; p < 8; p++) {
              s.particles.push({
                x: c.x,
                y: c.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                color: c.type === 'chip' ? '#fcee0a' : '#00f0ff',
                radius: 2,
                alpha: 1
              });
            }

            s.coins.splice(i, 1);
            continue;
          }

          if (c.x < -30) s.coins.splice(i, 1);
        }
      }

      // Render Trail
      s.trail.forEach(t => {
        ctx.save();
        ctx.globalAlpha = t.alpha * 0.35;
        ctx.fillStyle = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00f0ff';
        ctx.beginPath();
        if (t.isSliding) {
          ctx.roundRect(t.x - 16, t.y - 7, 32, 14, 4);
        } else {
          ctx.arc(t.x, t.y, 14, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.restore();
        t.alpha -= dt * 2.5;
      });

      // Render Player
      ctx.save();
      ctx.shadowBlur = 16;
      ctx.shadowColor = s.player.hasShield ? '#00ff66' : '#00f0ff';
      ctx.fillStyle = s.player.hasShield ? '#00ff66' : '#00f0ff';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;

      ctx.beginPath();
      if (s.player.isSliding) {
        // Flat sliding pod
        ctx.roundRect(s.player.x - 18, s.player.y - 8, 36, 16, 6);
      } else {
        // Glowing Quantum Drone Sphere
        ctx.arc(s.player.x, s.player.y, 14, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.stroke();

      // Glowing Cockpit Core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.player.x + (s.player.isSliding ? 4 : 2), s.player.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Render Obstacles
      s.obstacles.forEach(obs => {
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = obs.color;
        ctx.fillStyle = obs.color;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;

        if (obs.type === 'spike') {
          // Sharp ground spikes
          ctx.beginPath();
          ctx.moveTo(obs.x - obs.width / 2, FLOOR_Y);
          ctx.lineTo(obs.x, obs.y - obs.height / 2);
          ctx.lineTo(obs.x + obs.width / 2, FLOOR_Y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else {
          // High Laser Gate
          ctx.fillRect(obs.x - obs.width / 2, obs.y - obs.height / 2, obs.width, obs.height);
          ctx.strokeRect(obs.x - obs.width / 2, obs.y - obs.height / 2, obs.width, obs.height);

          ctx.fillStyle = '#fff';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('LASER', obs.x, obs.y + 3);
        }
        ctx.restore();
      });

      // Render Coins
      s.coins.forEach(c => {
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = c.type === 'chip' ? '#fcee0a' : '#00f0ff';
        ctx.fillStyle = c.type === 'chip' ? '#fcee0a' : '#00f0ff';

        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(c.type === 'chip' ? '★' : '◆', c.x, c.y);
        ctx.restore();
      });

      // Render Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= dt * 2.5;

        if (pt.alpha <= 0) {
          s.particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [highScore]);

  return (
    <div className="w-full glass-panel p-4 sm:p-6 rounded-2xl border border-cyan-500/30 relative overflow-hidden shadow-[0_0_35px_rgba(6,182,212,0.15)] bg-black/60">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Zap size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-orbitron font-bold text-white tracking-wider">
                QUANTUM NEON RUNNER
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                OVERCLOCK.RUN
              </span>
            </div>
            <p className="text-xs text-gray-400 font-inter">
              Sprint through the fiber-optic highway, dodge laser barriers, and harvest quantum data!
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/50 border border-yellow-500/30 text-yellow-300 font-mono text-xs">
            <Trophy size={14} className="text-cyber-yellow" />
            <span>RECORD: {highScore}</span>
          </div>

          <button
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              runnerAudio.muted = nextMuted;
            }}
            className="p-2 rounded-xl glass-panel text-gray-300 hover:text-white border border-white/10 cursor-pointer"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Live Distance & Score HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3 font-mono text-xs">
        <div className="p-2.5 rounded-xl bg-black/60 border border-cyan-500/30 flex items-center justify-between">
          <span className="text-gray-400 text-[10px] uppercase">DISTANCE</span>
          <span className="text-cyan-400 font-bold text-sm">{distance}m</span>
        </div>
        <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
          <span className="text-gray-400 text-[10px] uppercase">SCORE</span>
          <span className="text-cyber-yellow font-bold text-sm">{score}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
          <span className="text-gray-400 text-[10px] uppercase">TOTAL</span>
          <span className="text-white font-bold text-sm">{score + distance}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
          <span className="text-gray-400 text-[10px] uppercase">SPEED</span>
          <span className="text-emerald-400 font-bold text-sm">{(Math.min(13, 6.5 + distance * 0.003)).toFixed(1)}x</span>
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        onClick={jump}
        className="relative w-full min-h-[280px] sm:min-h-[340px] aspect-[4/3] sm:aspect-[2/1] rounded-xl overflow-hidden border-2 border-cyan-500/40 shadow-[inset_0_0_25px_rgba(0,0,0,0.8)] bg-black cursor-pointer select-none"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Start Overlay - Mobile Optimized */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center text-center p-3 sm:p-6 space-y-2.5 sm:space-y-4 overflow-y-auto z-20">
            <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-cyan-500/15 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] flex-shrink-0 animate-bounce">
              <Zap size={26} className="sm:hidden" />
              <Zap size={36} className="hidden sm:block" />
            </div>

            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 uppercase tracking-widest inline-block mb-1">
                CYBER REFLEX RUNNER
              </span>
              <h4 className="text-xl sm:text-2xl md:text-3xl font-orbitron font-bold text-white mb-1">
                QUANTUM NEON RUNNER
              </h4>
              <p className="text-[11px] sm:text-xs text-gray-300 font-inter max-w-sm mx-auto">
                Jump over red spikes & duck underneath high laser beams! Tap screen or use buttons.
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="px-6 sm:px-8 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-orbitron font-bold text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(6,182,212,0.6)] cursor-pointer flex items-center gap-2 border border-white flex-shrink-0 active:scale-95"
            >
              <Play size={16} fill="currentColor" />
              <span>START RUN NOW</span>
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-center p-4 sm:p-6 space-y-3 overflow-y-auto z-20">
            <h4 className="text-xl sm:text-3xl font-orbitron font-bold text-cyber-red">
              GRID IMPACT
            </h4>
            <div className="p-3 rounded-xl bg-black/70 border border-white/10 text-xs font-mono space-y-1">
              <div className="text-gray-400">Total Run Score: <strong className="text-white text-sm">{score + distance}</strong></div>
              <div className="text-yellow-400">High Score: <strong>{highScore}</strong></div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
              className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-orbitron font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              <RotateCcw size={14} />
              <span>RUN AGAIN</span>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Dedicated Runner Touch Controls */}
      <div className="sm:hidden grid grid-cols-2 gap-2 mt-2.5 select-none">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            jump();
          }}
          className="py-3 rounded-xl bg-cyan-500/15 active:bg-cyan-400 text-cyan-300 active:text-black border border-cyan-500/40 font-orbitron font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
        >
          <span>▲ JUMP (TAP)</span>
        </button>
        <button
          type="button"
          onPointerDown={(e) => {
            e.stopPropagation();
            stateRef.current.player.isDucking = true;
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            stateRef.current.player.isDucking = false;
          }}
          onPointerLeave={(e) => {
            e.stopPropagation();
            stateRef.current.player.isDucking = false;
          }}
          className="py-3 rounded-xl bg-cyan-500/15 active:bg-cyan-400 text-cyan-300 active:text-black border border-cyan-500/40 font-orbitron font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
        >
          <span>▼ DUCK (HOLD)</span>
        </button>
      </div>

      {/* Controls Bar for Desktop & Touch */}
      <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-white/10 text-xs font-mono text-gray-400">
        <div className="flex items-center gap-2">
          <button
            onClick={jump}
            className="px-3.5 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-black border border-cyan-500/40 text-xs font-orbitron font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowUp size={14} />
            <span>JUMP (SPACE / TAP)</span>
          </button>

          <button
            onClick={slide}
            className="px-3.5 py-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500 text-yellow-300 hover:text-black border border-yellow-500/40 text-xs font-orbitron font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowDown size={14} />
            <span>SLIDE (DOWN KEY)</span>
          </button>
        </div>

        <span className="hidden sm:inline text-[11px] text-gray-500">
          Double-jump enabled • Duck under floating lasers
        </span>
      </div>

    </div>
  );
};

export default QuantumRunnerGame;
