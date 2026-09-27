import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Zap, 
  Shield, 
  Trophy, 
  Maximize2, 
  Minimize2, 
  Crosshair, 
  Sparkles,
  Flame,
  Award,
  AlertTriangle
} from 'lucide-react';

// Procedural Web Audio API sound synthesizer (no external audio files required)
class CyberSoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  laser() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {}
  }

  explosion() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.linearRampToValueAtTime(50, now + 0.15);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    } catch (e) {}
  }

  powerup() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.05;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.11);
      });
    } catch (e) {}
  }

  emp() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.5);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.52);
    } catch (e) {}
  }

  victory() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.1;

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.26);
      });
    } catch (e) {}
  }
}

const soundFX = new CyberSoundFX();

const CyberMatrixGame = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // High score in local storage
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('cyber_matrix_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });

  // UI States
  const [gameState, setGameState] = useState('menu'); // 'menu' | 'playing' | 'gameover' | 'victory'
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [wave, setWave] = useState(1);
  const [empCharge, setEmpCharge] = useState(0); // 0 to 100
  const [combo, setCombo] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoFire, setAutoFire] = useState(true);

  // References for live mutable game state inside requestAnimationFrame loop
  const gameRef = useRef({
    running: false,
    score: 0,
    health: 100,
    wave: 1,
    empCharge: 0,
    combo: 1,
    comboTimer: 0,
    lastShotTime: 0,
    lastEnemySpawnTime: 0,
    player: {
      x: 400,
      y: 430,
      width: 48,
      height: 24,
      targetX: 400,
      tripleShot: false,
      tripleShotTimer: 0,
      shieldActive: false,
      shieldTimer: 0
    },
    lasers: [],
    enemies: [],
    particles: [],
    floatingTexts: [],
    powerups: [],
    boss: null,
    bossSpawned: false,
    keys: { left: false, right: false, fire: false },
    screenShake: 0
  });

  // Toggle Sound Mute
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundFX.muted = nextMuted;
  };

  // Start / Reboot Game
  const startGame = () => {
    soundFX.init();
    soundFX.powerup();

    const g = gameRef.current;
    g.running = true;
    g.score = 0;
    g.health = 100;
    g.wave = 1;
    g.empCharge = 20;
    g.combo = 1;
    g.comboTimer = 0;
    g.lastShotTime = 0;
    g.lastEnemySpawnTime = 0;
    g.lasers = [];
    g.enemies = [];
    g.particles = [];
    g.floatingTexts = [];
    g.powerups = [];
    g.boss = null;
    g.bossSpawned = false;
    g.screenShake = 0;
    g.player.x = 400;
    g.player.targetX = 400;
    g.player.tripleShot = false;
    g.player.tripleShotTimer = 0;
    g.player.shieldActive = false;

    setScore(0);
    setHealth(100);
    setWave(1);
    setEmpCharge(20);
    setCombo(1);
    setGameState('playing');
  };

  // Trigger EMP Super Weapon
  const triggerEmp = () => {
    const g = gameRef.current;
    if (g.empCharge < 100 || !g.running) return;

    soundFX.emp();
    g.empCharge = 0;
    setEmpCharge(0);
    g.screenShake = 18;

    // Floating EMP text
    g.floatingTexts.push({
      x: 400,
      y: 250,
      text: '⚡ EMP OVERLOAD // PURGE COMPLETE ⚡',
      color: '#00f0ff',
      alpha: 1,
      size: 20
    });

    // Destroy all regular enemies with massive particle bursts
    g.enemies.forEach(enemy => {
      createExplosion(enemy.x, enemy.y, enemy.color || '#ff003c', 20);
      g.score += enemy.points * 2;
    });
    g.enemies = [];

    // Damage boss if alive
    if (g.boss) {
      g.boss.health -= 60;
      createExplosion(g.boss.x, g.boss.y, '#fcee0a', 25);
    }

    setScore(g.score);
  };

  // Helper: Particle Explosion
  const createExplosion = (x, y, color, count = 12) => {
    const g = gameRef.current;
    soundFX.explosion();
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = Math.random() * 5 + 2;
      g.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        radius: Math.random() * 3 + 1.5,
        alpha: 1,
        life: 1
      });
    }
  };

  // Helper: Spawn Powerup
  const spawnPowerup = (x, y) => {
    const types = ['triple', 'shield', 'emp', 'rapid'];
    const selected = types[Math.floor(Math.random() * types.length)];
    gameRef.current.powerups.push({
      x,
      y,
      type: selected,
      vy: 1.8,
      radius: 12
    });
  };

  // ==========================================
  // MAIN GAME LOOP & CANVAS RENDERING
  // ==========================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    // Standard Virtual Canvas Dimensions
    const V_WIDTH = 800;
    const V_HEIGHT = 480;
    canvas.width = V_WIDTH;
    canvas.height = V_HEIGHT;

    // Enemy Type Definitions
    const enemyConfigs = [
      { type: 'DDoS', label: 'DDoS.pkt', color: '#ff003c', points: 100, speed: 2.2, hp: 1, width: 28, height: 18 },
      { type: 'Trojan', label: 'Trojan.exe', color: '#00ff66', points: 150, speed: 1.6, hp: 2, width: 34, height: 20 },
      { type: 'Ransomware', label: 'Ransom.lock', color: '#bc13fe', points: 250, speed: 1.2, hp: 3, width: 40, height: 24 },
      { type: 'SQLi', label: 'SQL_Inject', color: '#fcee0a', points: 200, speed: 2.0, hp: 1, width: 30, height: 20 }
    ];

    let lastTime = performance.now();

    const gameLoop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      const g = gameRef.current;

      // 1. Clear Screen
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

      // Cyber Grid Background with Perspective lines
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 1;
      const gridOffset = (currentTime * 0.04) % 30;

      for (let y = gridOffset; y < V_HEIGHT; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(V_WIDTH, y);
        ctx.stroke();
      }
      for (let x = 0; x < V_WIDTH; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, V_HEIGHT);
        ctx.stroke();
      }
      ctx.restore();

      // Screen Shake translation
      if (g.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * g.screenShake;
        const shakeY = (Math.random() - 0.5) * g.screenShake;
        ctx.translate(shakeX, shakeY);
        g.screenShake *= 0.88;
        if (g.screenShake < 0.5) g.screenShake = 0;
      }

      if (g.running) {
        // ==========================================
        // 2. PLAYER LOGIC & CONTROLS
        // ==========================================
        // Smooth target lerp
        if (g.keys.left) g.player.targetX -= 400 * dt;
        if (g.keys.right) g.player.targetX += 400 * dt;
        g.player.targetX = Math.max(30, Math.min(V_WIDTH - 30, g.player.targetX));
        g.player.x += (g.player.targetX - g.player.x) * 0.25;

        // Triple shot timer
        if (g.player.tripleShot) {
          g.player.tripleShotTimer -= dt;
          if (g.player.tripleShotTimer <= 0) {
            g.player.tripleShot = false;
          }
        }

        // Shield timer
        if (g.player.shieldActive) {
          g.player.shieldTimer -= dt;
          if (g.player.shieldTimer <= 0) {
            g.player.shieldActive = false;
          }
        }

        // Combo decay timer
        if (g.combo > 1) {
          g.comboTimer -= dt;
          if (g.comboTimer <= 0) {
            g.combo = 1;
            setCombo(1);
          }
        }

        // Auto or manual firing
        const shouldFire = autoFire || g.keys.fire;
        const fireInterval = g.player.tripleShot ? 0.13 : 0.18;
        if (shouldFire && currentTime - g.lastShotTime > fireInterval * 1000) {
          g.lastShotTime = currentTime;
          soundFX.laser();

          if (g.player.tripleShot) {
            // Triple spread
            g.lasers.push({ x: g.player.x, y: g.player.y - 15, vx: 0, vy: -12, color: '#00f0ff' });
            g.lasers.push({ x: g.player.x - 12, y: g.player.y - 12, vx: -2.5, vy: -11.5, color: '#fcee0a' });
            g.lasers.push({ x: g.player.x + 12, y: g.player.y - 12, vx: 2.5, vy: -11.5, color: '#fcee0a' });
          } else {
            // Dual laser
            g.lasers.push({ x: g.player.x - 8, y: g.player.y - 15, vx: 0, vy: -13, color: '#00f0ff' });
            g.lasers.push({ x: g.player.x + 8, y: g.player.y - 15, vx: 0, vy: -13, color: '#00f0ff' });
          }
        }

        // ==========================================
        // 3. SPAWN LOGIC & WAVES
        // ==========================================
        const spawnDelay = Math.max(700, 1500 - g.wave * 250);
        if (g.wave < 3) {
          if (currentTime - g.lastEnemySpawnTime > spawnDelay) {
            g.lastEnemySpawnTime = currentTime;
            const config = enemyConfigs[Math.floor(Math.random() * enemyConfigs.length)];
            g.enemies.push({
              x: Math.random() * (V_WIDTH - 100) + 50,
              y: -20,
              ...config,
              currentHp: config.hp
            });
          }

          // Advance Wave if score thresholds met
          if (g.wave === 1 && g.score >= 1200) {
            g.wave = 2;
            setWave(2);
            soundFX.powerup();
            g.floatingTexts.push({
              x: 400,
              y: 200,
              text: '⚡ WAVE 2: ADVANCED THREAT INVASION ⚡',
              color: '#fcee0a',
              alpha: 1,
              size: 22
            });
          } else if (g.wave === 2 && g.score >= 3000 && !g.bossSpawned) {
            g.wave = 3;
            setWave(3);
            g.bossSpawned = true;
            soundFX.victory();
            g.floatingTexts.push({
              x: 400,
              y: 180,
              text: '🚨 WARNING: ROGUE AI CORE DETECTED! 🚨',
              color: '#ff003c',
              alpha: 1,
              size: 24
            });
            g.boss = {
              x: 400,
              y: 90,
              width: 140,
              height: 60,
              maxHealth: 150,
              health: 150,
              vx: 1.8,
              lastShot: currentTime
            };
          }
        }

        // ==========================================
        // 4. UPDATE LASERS
        // ==========================================
        for (let i = g.lasers.length - 1; i >= 0; i--) {
          const l = g.lasers[i];
          l.x += (l.vx || 0);
          l.y += l.vy;

          // Out of screen bounds
          if (l.y < -20 || l.x < -20 || l.x > V_WIDTH + 20) {
            g.lasers.splice(i, 1);
            continue;
          }

          // Check hit against regular enemies
          let hit = false;
          for (let j = g.enemies.length - 1; j >= 0; j--) {
            const e = g.enemies[j];
            if (
              l.x >= e.x - e.width / 2 &&
              l.x <= e.x + e.width / 2 &&
              l.y >= e.y - e.height / 2 &&
              l.y <= e.y + e.height / 2
            ) {
              hit = true;
              e.currentHp -= 1;
              createExplosion(l.x, l.y, l.color, 6);

              if (e.currentHp <= 0) {
                // Enemy Destroyed
                createExplosion(e.x, e.y, e.color, 16);
                const earnedPoints = e.points * g.combo;
                g.score += earnedPoints;

                // Increase Combo
                g.combo = Math.min(5, g.combo + 1);
                g.comboTimer = 2.5;
                setCombo(g.combo);

                // Charge EMP
                g.empCharge = Math.min(100, g.empCharge + 10);
                setEmpCharge(g.empCharge);

                // Floating text score
                g.floatingTexts.push({
                  x: e.x,
                  y: e.y,
                  text: `+${earnedPoints}${g.combo > 1 ? ` (x${g.combo})` : ''}`,
                  color: e.color,
                  alpha: 1,
                  size: 14
                });

                // Drop powerup with 25% chance
                if (Math.random() < 0.25) {
                  spawnPowerup(e.x, e.y);
                }

                g.enemies.splice(j, 1);
              }
              break;
            }
          }

          // Check hit against Boss
          if (!hit && g.boss) {
            const b = g.boss;
            if (
              l.x >= b.x - b.width / 2 &&
              l.x <= b.x + b.width / 2 &&
              l.y >= b.y - b.height / 2 &&
              l.y <= b.y + b.height / 2
            ) {
              hit = true;
              b.health -= 2;
              createExplosion(l.x, l.y, '#fcee0a', 5);

              if (b.health <= 0) {
                // BOSS DEFEATED -> VICTORY!
                createExplosion(b.x, b.y, '#fcee0a', 45);
                soundFX.victory();
                g.score += 2500;
                setScore(g.score);
                g.boss = null;
                g.running = false;
                setGameState('victory');

                if (g.score > highScore) {
                  setHighScore(g.score);
                  try {
                    localStorage.setItem('cyber_matrix_highscore', g.score.toString());
                  } catch {}
                }
              }
            }
          }

          if (hit) {
            g.lasers.splice(i, 1);
            setScore(g.score);
          }
        }

        // ==========================================
        // 5. UPDATE ENEMIES
        // ==========================================
        for (let i = g.enemies.length - 1; i >= 0; i--) {
          const e = g.enemies[i];
          e.y += e.speed;

          // Reached Core (Damage Player)
          if (e.y > V_HEIGHT - 35) {
            if (!g.player.shieldActive) {
              g.health = Math.max(0, g.health - 15);
              setHealth(g.health);
              g.screenShake = 12;
              soundFX.explosion();
            } else {
              createExplosion(e.x, e.y, '#00f0ff', 10);
            }

            g.floatingTexts.push({
              x: e.x,
              y: V_HEIGHT - 40,
              text: g.player.shieldActive ? '🛡️ SHIELD BLOCKED!' : '-15 CORE INTEGRITY!',
              color: g.player.shieldActive ? '#00f0ff' : '#ff003c',
              alpha: 1,
              size: 13
            });

            g.enemies.splice(i, 1);

            if (g.health <= 0) {
              // Game Over
              g.running = false;
              soundFX.explosion();
              setGameState('gameover');

              if (g.score > highScore) {
                setHighScore(g.score);
                try {
                  localStorage.setItem('cyber_matrix_highscore', g.score.toString());
                } catch {}
              }
            }
          }
        }

        // ==========================================
        // 6. UPDATE BOSS LOGIC
        // ==========================================
        if (g.boss) {
          const b = g.boss;
          b.x += b.vx;
          if (b.x < 100 || b.x > V_WIDTH - 100) {
            b.vx *= -1;
          }

          // Boss shoots energy orbs
          if (currentTime - b.lastShot > 1400) {
            b.lastShot = currentTime;
            soundFX.laser();
            g.enemies.push({
              x: b.x,
              y: b.y + b.height / 2,
              type: 'BossOrb',
              label: 'MALWARE_PULSE',
              color: '#ff003c',
              points: 50,
              speed: 3.2,
              hp: 1,
              currentHp: 1,
              width: 18,
              height: 18
            });
          }
        }

        // ==========================================
        // 7. UPDATE POWERUPS
        // ==========================================
        for (let i = g.powerups.length - 1; i >= 0; i--) {
          const p = g.powerups[i];
          p.y += p.vy;

          // Collected by player
          const dist = Math.hypot(p.x - g.player.x, p.y - g.player.y);
          if (dist < p.radius + 24) {
            soundFX.powerup();

            if (p.type === 'triple') {
              g.player.tripleShot = true;
              g.player.tripleShotTimer = 8;
              g.floatingTexts.push({ x: p.x, y: p.y, text: '⚡ TRIPLE SPREAD ACTIVE!', color: '#00f0ff', alpha: 1, size: 14 });
            } else if (p.type === 'shield') {
              g.player.shieldActive = true;
              g.player.shieldTimer = 7;
              g.health = Math.min(100, g.health + 20);
              setHealth(g.health);
              g.floatingTexts.push({ x: p.x, y: p.y, text: '🛡️ SHIELD OVERCHARGED +20%!', color: '#00ff66', alpha: 1, size: 14 });
            } else if (p.type === 'emp') {
              g.empCharge = 100;
              setEmpCharge(100);
              g.floatingTexts.push({ x: p.x, y: p.y, text: '💥 EMP READY TO DETONATE!', color: '#fcee0a', alpha: 1, size: 14 });
            } else {
              g.score += 300;
              setScore(g.score);
              g.floatingTexts.push({ x: p.x, y: p.y, text: '+300 OVERCLOCK BONUS!', color: '#bc13fe', alpha: 1, size: 14 });
            }

            g.powerups.splice(i, 1);
            continue;
          }

          if (p.y > V_HEIGHT + 20) {
            g.powerups.splice(i, 1);
          }
        }
      }

      // ==========================================
      // 8. RENDER GAME OBJECTS
      // ==========================================
      // A. Render Powerups
      g.powerups.forEach(p => {
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#00f0ff';
        ctx.fillStyle = p.type === 'triple' ? '#00f0ff' : p.type === 'shield' ? '#00ff66' : p.type === 'emp' ? '#fcee0a' : '#bc13fe';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const label = p.type === 'triple' ? '3x' : p.type === 'shield' ? 'SH' : p.type === 'emp' ? 'EMP' : 'CLK';
        ctx.fillText(label, p.x, p.y);
        ctx.restore();
      });

      // B. Render Regular Enemies
      g.enemies.forEach(e => {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = e.color;
        ctx.fillStyle = e.color;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;

        // Shape
        ctx.beginPath();
        ctx.roundRect(e.x - e.width / 2, e.y - e.height / 2, e.width, e.height, 4);
        ctx.fill();
        ctx.stroke();

        // Label
        ctx.fillStyle = '#000';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(e.label, e.x, e.y);
        ctx.restore();
      });

      // C. Render Boss
      if (g.boss) {
        const b = g.boss;
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff003c';

        // Outer Hull
        ctx.fillStyle = '#111827';
        ctx.strokeStyle = '#ff003c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(b.x - b.width / 2, b.y - b.height / 2, b.width, b.height, 10);
        ctx.fill();
        ctx.stroke();

        // Glowing Core
        ctx.fillStyle = '#ff003c';
        ctx.beginPath();
        ctx.arc(b.x, b.y, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('ROGUE_AI_CORE', b.x, b.y - 12);

        // Health Bar above Boss
        const hpPercent = Math.max(0, b.health / b.maxHealth);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(b.x - b.width / 2, b.y - b.height / 2 - 14, b.width, 6);
        ctx.fillStyle = '#ff003c';
        ctx.fillRect(b.x - b.width / 2, b.y - b.height / 2 - 14, b.width * hpPercent, 6);
        ctx.restore();
      }

      // D. Render Lasers
      g.lasers.forEach(l => {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = l.color;
        ctx.fillStyle = l.color;
        ctx.fillRect(l.x - 2, l.y, 4, 12);
        ctx.restore();
      });

      // E. Render Player Drone / Turret
      const p = g.player;
      ctx.save();
      ctx.shadowBlur = p.tripleShot ? 22 : 14;
      ctx.shadowColor = p.tripleShot ? '#fcee0a' : '#00f0ff';

      // Shield Aura
      if (p.shieldActive) {
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 32, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Ship Base
      ctx.fillStyle = '#0a192f';
      ctx.strokeStyle = p.tripleShot ? '#fcee0a' : '#00f0ff';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 18);
      ctx.lineTo(p.x + 22, p.y + 12);
      ctx.lineTo(p.x + 8, p.y + 8);
      ctx.lineTo(p.x, p.y + 14);
      ctx.lineTo(p.x - 8, p.y + 8);
      ctx.lineTo(p.x - 22, p.y + 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cockpit Glow
      ctx.fillStyle = p.tripleShot ? '#fcee0a' : '#00f0ff';
      ctx.beginPath();
      ctx.arc(p.x, p.y - 2, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // F. Render Particles
      for (let i = g.particles.length - 1; i >= 0; i--) {
        const pt = g.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= dt * 2.2;

        if (pt.alpha <= 0) {
          g.particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // G. Render Floating Combat Text
      for (let i = g.floatingTexts.length - 1; i >= 0; i--) {
        const ft = g.floatingTexts[i];
        ft.y -= 30 * dt;
        ft.alpha -= dt * 1.4;

        if (ft.alpha <= 0) {
          g.floatingTexts.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.fillStyle = ft.color;
        ctx.font = `bold ${ft.size || 13}px "Orbitron", monospace`;
        ctx.textAlign = 'center';
        ctx.shadowBlur = 8;
        ctx.shadowColor = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      // Bottom Gateway Line
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(0, V_HEIGHT - 32);
      ctx.lineTo(V_WIDTH, V_HEIGHT - 32);
      ctx.stroke();
      ctx.setLineDash([]);

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [autoFire, highScore]);

  // ==========================================
  // INPUT CONTROLS (MOUSE, TOUCH, KEYBOARD)
  // ==========================================
  useEffect(() => {
    const handleKeyDown = (e) => {
      const g = gameRef.current;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) g.keys.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) g.keys.right = true;
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        g.keys.fire = true;
        soundFX.init();
      }
      if (['KeyE'].includes(e.code)) {
        triggerEmp();
      }
    };

    const handleKeyUp = (e) => {
      const g = gameRef.current;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) g.keys.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) g.keys.right = false;
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) g.keys.fire = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse / Pointer Move on Canvas
  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const scaleX = 800 / rect.width;
    const canvasX = (clientX - rect.left) * scaleX;
    gameRef.current.player.targetX = Math.max(30, Math.min(770, canvasX));
  };

  const handlePointerDown = () => {
    soundFX.init();
    gameRef.current.keys.fire = true;
  };

  const handlePointerUp = () => {
    gameRef.current.keys.fire = false;
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-[9999] bg-black/95 p-4 sm:p-8 flex flex-col justify-center' : 'mt-16'
      }`}
    >
      <div className="max-w-5xl mx-auto w-full glass-panel p-4 sm:p-6 rounded-2xl border border-cyber-blue/30 relative overflow-hidden shadow-[0_0_35px_rgba(0,240,255,0.15)]">
        
        {/* Futuristic Top Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyber-blue/10 border border-cyber-blue/40 text-cyber-blue shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <Crosshair size={22} className="animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-orbitron font-bold text-white tracking-wider">
                  NEURAL FIREWALL DEFENDER
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  SIMULATION.SYS
                </span>
              </div>
              <p className="text-xs text-gray-400 font-inter">
                Eliminate incoming cyber vulnerabilities & secure the Neural Core
              </p>
            </div>
          </div>

          {/* Quick HUD Metrics */}
          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/50 border border-yellow-500/30 text-yellow-300 font-mono text-xs">
              <Trophy size={14} className="text-cyber-yellow" />
              <span>HI: {highScore}</span>
            </div>

            <button
              onClick={toggleMute}
              className="p-2 rounded-xl glass-panel text-gray-300 hover:text-white border border-white/10 cursor-pointer transition-colors"
              title={isMuted ? "Unmute Sound" : "Mute Sound"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-cyber-blue" />}
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl glass-panel text-gray-300 hover:text-white border border-white/10 cursor-pointer transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>

        {/* Live Game Status & HUD Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-3 font-mono text-xs">
          {/* Score */}
          <div className="p-2.5 rounded-xl bg-black/60 border border-cyber-blue/30 flex items-center justify-between">
            <span className="text-gray-400 text-[10px] uppercase">SCORE</span>
            <span className="text-cyber-blue font-bold text-sm tracking-wider">{score}</span>
          </div>

          {/* Wave */}
          <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
            <span className="text-gray-400 text-[10px] uppercase">WAVE</span>
            <span className="text-white font-bold">{wave} / 3</span>
          </div>

          {/* Core Health / Shield */}
          <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
            <span className="text-gray-400 text-[10px] uppercase flex items-center gap-1">
              <Shield size={12} className="text-emerald-400" />
              CORE
            </span>
            <span className={`font-bold ${health > 35 ? 'text-emerald-400' : 'text-cyber-red animate-pulse'}`}>
              {health}%
            </span>
          </div>

          {/* Combo */}
          <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
            <span className="text-gray-400 text-[10px] uppercase flex items-center gap-1">
              <Flame size={12} className="text-cyber-yellow" />
              COMBO
            </span>
            <span className="text-cyber-yellow font-bold">x{combo}</span>
          </div>

          {/* EMP Blast Trigger */}
          <button
            onClick={triggerEmp}
            disabled={empCharge < 100 || gameState !== 'playing'}
            className={`col-span-2 sm:col-span-1 p-2 rounded-xl border flex items-center justify-center gap-1.5 uppercase font-orbitron text-[11px] font-bold transition-all cursor-pointer ${
              empCharge >= 100 && gameState === 'playing'
                ? 'bg-cyber-blue text-black border-white animate-pulse shadow-[0_0_20px_#00f0ff]'
                : 'bg-black/60 text-gray-500 border-white/10 cursor-not-allowed'
            }`}
          >
            <Zap size={14} />
            <span>EMP {empCharge >= 100 ? 'READY [E]' : `${empCharge}%`}</span>
          </button>
        </div>

        {/* Canvas Game Arena Container */}
        <div className="relative w-full min-h-[380px] sm:min-h-[440px] aspect-[4/3] sm:aspect-[16/9] rounded-xl overflow-hidden border-2 border-cyber-blue/40 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] bg-black">
          <canvas
            ref={canvasRef}
            onPointerMove={handlePointerMove}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            className="w-full h-full block cursor-crosshair touch-none select-none"
          />

          {/* Scanline CRT overlay */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-40"></div>

          {/* 1. START MENU OVERLAY - FULLY MOBILE OPTIMIZED */}
          {gameState === 'menu' && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-3 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto z-20">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-cyber-blue/15 border-2 border-cyber-blue flex items-center justify-center text-cyber-blue shadow-[0_0_30px_rgba(0,240,255,0.4)] flex-shrink-0">
                <Crosshair size={28} className="sm:hidden animate-pulse" />
                <Crosshair size={36} className="hidden sm:block animate-pulse" />
              </div>

              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue uppercase tracking-widest inline-block mb-1">
                  TACTICAL ARCADE MODULE
                </span>
                <h4 className="text-xl sm:text-2xl md:text-3xl font-orbitron font-bold text-white tracking-wider">
                  FIREWALL DEFENDER
                </h4>
                <p className="text-[11px] sm:text-xs md:text-sm text-gray-300 font-inter max-w-md mx-auto line-clamp-2 sm:line-clamp-none mt-1">
                  Command the plasma drone, eliminate incoming cyber malware, and defeat the Wave 3 Rogue AI Core!
                </p>
              </div>

              {/* Tablet / Desktop Instruction Badges */}
              <div className="hidden sm:grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-gray-400 max-w-lg w-full">
                <div className="p-2 rounded-lg bg-cyber-dark/80 border border-white/10">
                  <span className="text-cyber-blue block font-bold">DRAG / KEYS</span>
                  <span>Move Left/Right</span>
                </div>
                <div className="p-2 rounded-lg bg-cyber-dark/80 border border-white/10">
                  <span className="text-cyber-yellow block font-bold">AUTO-FIRE</span>
                  <span>Plasma Blasters</span>
                </div>
                <div className="p-2 rounded-lg bg-cyber-dark/80 border border-white/10">
                  <span className="text-emerald-400 block font-bold">POWERUPS</span>
                  <span>Shields & Tri-Shot</span>
                </div>
                <div className="p-2 rounded-lg bg-cyber-dark/80 border border-white/10">
                  <span className="text-pink-400 block font-bold">KEY [E]</span>
                  <span>EMP Super Nuke</span>
                </div>
              </div>

              {/* Mobile Quick Hint */}
              <div className="sm:hidden flex items-center justify-center gap-1.5 text-[10px] font-mono text-cyber-blue bg-cyber-blue/10 px-3 py-1.5 rounded-lg border border-cyber-blue/30">
                <span>Touch screen or tap on-screen arrows below to move</span>
              </div>

              {/* START BUTTON - ALWAYS VISIBLE AND PROMINENT */}
              <button
                onClick={startGame}
                className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-cyber-blue via-emerald-400 to-cyber-purple text-black font-orbitron font-bold text-xs sm:text-sm uppercase tracking-widest hover:opacity-95 active:scale-95 transition-all shadow-[0_0_25px_rgba(0,240,255,0.7)] cursor-pointer flex items-center gap-2 border-2 border-white flex-shrink-0"
              >
                <Play size={16} fill="currentColor" />
                <span>START DEFENSE NOW</span>
              </button>
            </div>
          )}

          {/* 2. VICTORY OVERLAY */}
          {gameState === 'victory' && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.5)] animate-bounce">
                <Award size={36} />
              </div>

              <div>
                <span className="text-xs font-mono px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase tracking-widest">
                  THREAT ELIMINATED // ACCESS GRANTED
                </span>
                <h4 className="text-2xl sm:text-3xl font-orbitron font-bold text-white mt-2">
                  NEURAL FIREWALL SECURED!
                </h4>
                <p className="text-xs sm:text-sm text-gray-300 font-inter max-w-md mx-auto mt-1">
                  You conquered the Rogue AI Core and protected the network! Honorary rank: <strong className="text-cyber-blue">ELITE SENTINEL ARCHITECT</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/60 border border-emerald-400/40 text-emerald-300 font-mono text-sm">
                FINAL SCORE: <strong className="text-white text-base">{score}</strong>
              </div>

              <button
                onClick={startGame}
                className="px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-orbitron font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(52,211,153,0.4)]"
              >
                <RotateCcw size={15} />
                <span>DEFEND AGAIN</span>
              </button>
            </div>
          )}

          {/* 3. GAME OVER OVERLAY */}
          {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-cyber-red/20 border-2 border-cyber-red flex items-center justify-center text-cyber-red shadow-[0_0_30px_rgba(255,0,60,0.5)]">
                <AlertTriangle size={36} className="animate-pulse" />
              </div>

              <div>
                <h4 className="text-2xl sm:text-3xl font-orbitron font-bold text-cyber-red mb-1">
                  GATEWAY BREACHED
                </h4>
                <p className="text-xs text-gray-400 font-inter">
                  Core integrity reached 0%. Reboot defense subroutines to counterattack!
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-xs font-mono space-y-1">
                <div className="text-gray-400">Score Achieved: <strong className="text-white">{score}</strong></div>
                <div className="text-yellow-400">All-Time Best: <strong>{highScore}</strong></div>
              </div>

              <button
                onClick={startGame}
                className="px-6 py-3 rounded-xl bg-cyber-blue hover:bg-cyber-blue/90 text-black font-orbitron font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.4)]"
              >
                <RotateCcw size={15} />
                <span>REBOOT & RETRY</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Dedicated Game Control Buttons (Left / EMP / Right) */}
        <div className="sm:hidden grid grid-cols-3 gap-2 mt-2.5 select-none">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              soundFX.init();
              gameRef.current.keys.left = true;
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              gameRef.current.keys.left = false;
            }}
            onPointerLeave={(e) => {
              e.preventDefault();
              gameRef.current.keys.left = false;
            }}
            className="py-3 rounded-xl bg-cyber-blue/15 active:bg-cyber-blue text-cyber-blue active:text-black border border-cyber-blue/40 font-orbitron font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
          >
            <span>◀ LEFT</span>
          </button>

          <button
            type="button"
            onClick={triggerEmp}
            disabled={empCharge < 100 || gameState !== 'playing'}
            className={`py-3 rounded-xl border font-orbitron font-bold text-xs flex items-center justify-center gap-1 transition-all ${
              empCharge >= 100 && gameState === 'playing'
                ? 'bg-yellow-400 text-black border-white animate-pulse shadow-[0_0_15px_#fcee0a]'
                : 'bg-black/60 text-gray-500 border-white/10'
            }`}
          >
            <Zap size={13} />
            <span>EMP {empCharge >= 100 ? 'READY' : `${empCharge}%`}</span>
          </button>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              soundFX.init();
              gameRef.current.keys.right = true;
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              gameRef.current.keys.right = false;
            }}
            onPointerLeave={(e) => {
              e.preventDefault();
              gameRef.current.keys.right = false;
            }}
            className="py-3 rounded-xl bg-cyber-blue/15 active:bg-cyber-blue text-cyber-blue active:text-black border border-cyber-blue/40 font-orbitron font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
          >
            <span>RIGHT ▶</span>
          </button>
        </div>

        {/* Mobile / Casual Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-white/10 text-xs font-mono text-gray-400">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoFire(!autoFire)}
              className={`px-3 py-1.5 rounded-lg border text-[11px] font-orbitron transition-all cursor-pointer ${
                autoFire 
                  ? 'bg-cyber-blue/15 text-cyber-blue border-cyber-blue/40' 
                  : 'bg-black/40 text-gray-500 border-white/10'
              }`}
            >
              AUTO-TARGET: {autoFire ? 'ENABLED' : 'MANUAL'}
            </button>
            <span className="hidden sm:inline text-gray-500">
              Drag mouse/finger to steer • Press [E] for EMP
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500">
              Tech Dropped: <span className="text-cyber-blue">REACT</span> • <span className="text-emerald-400">SHIELD</span> • <span className="text-yellow-400">EMP</span>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CyberMatrixGame;
