import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  RotateCcw, 
  Trophy, 
  CheckCircle, 
  Zap, 
  Radio, 
  Timer, 
  Sparkles,
  Volume2,
  VolumeX,
  Play
} from 'lucide-react';

class CircuitAudioFX {
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
  rotate() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(660, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }
  power() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch {}
  }
  victory() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.08;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.22);
      });
    } catch {}
  }
}

const circuitAudio = new CircuitAudioFX();

// Tile directions: [Top, Right, Bottom, Left]
const BASE_TILES = {
  straight: [true, false, true, false],     // |
  corner: [true, true, false, false],       // └
  tee: [true, true, true, false],           // ├
  cross: [true, true, true, true]           // +
};

// Rotate array clockwise: [T, R, B, L] -> [L, T, R, B]
const rotateConnections = (conns, times = 1) => {
  let res = [...conns];
  for (let t = 0; t < times % 4; t++) {
    res = [res[3], res[0], res[1], res[2]];
  }
  return res;
};

const GRID_SIZE = 4;

const NeuralCircuitGame = () => {
  const [grid, setGrid] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [bestMoves, setBestMoves] = useState(() => {
    try {
      return parseInt(localStorage.getItem('circuit_best_moves') || '999', 10);
    } catch {
      return 999;
    }
  });

  // Generate solvable random board
  const generateBoard = () => {
    circuitAudio.init();
    const newGrid = [];
    const tileTypes = ['straight', 'corner', 'tee', 'cross'];

    for (let r = 0; r < GRID_SIZE; r++) {
      const row = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        const type = (r === 0 && c === 0) ? 'corner' : 
                     (r === GRID_SIZE - 1 && c === GRID_SIZE - 1) ? 'corner' :
                     tileTypes[Math.floor(Math.random() * tileTypes.length)];
        
        const rotation = Math.floor(Math.random() * 4); // 0, 1, 2, 3 (each is 90 deg)
        row.push({
          row: r,
          col: c,
          type,
          rotation,
          baseConns: BASE_TILES[type],
          isPowered: false
        });
      }
      newGrid.push(row);
    }

    setGrid(updatePowerNetwork(newGrid));
    setMoves(0);
    setTime(0);
    setIsWon(false);
    setIsPlaying(true);
  };

  // Breadth-first search flood fill from (0,0) to energize connected nodes
  const updatePowerNetwork = (currentGrid) => {
    // Clone and reset powered
    const g = currentGrid.map(row => row.map(tile => ({ ...tile, isPowered: false })));

    // Source is at (0, 0)
    const queue = [[0, 0]];
    g[0][0].isPowered = true;

    // Direction offsets: Top, Right, Bottom, Left
    const dRow = [-1, 0, 1, 0];
    const dCol = [0, 1, 0, -1];
    const oppositeDir = [2, 3, 0, 1];

    while (queue.length > 0) {
      const [r, c] = queue.shift();
      const currentTile = g[r][c];
      const curConns = rotateConnections(currentTile.baseConns, currentTile.rotation);

      for (let dir = 0; dir < 4; dir++) {
        if (!curConns[dir]) continue; // tile has no wire in this direction

        const nr = r + dRow[dir];
        const nc = c + dCol[dir];

        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
          const neighbor = g[nr][nc];
          if (!neighbor.isPowered) {
            const neighConns = rotateConnections(neighbor.baseConns, neighbor.rotation);
            const neededDir = oppositeDir[dir];

            // If neighbor has wire facing back to current tile -> Connected!
            if (neighConns[neededDir]) {
              neighbor.isPowered = true;
              queue.push([nr, nc]);
            }
          }
        }
      }
    }

    return g;
  };

  useEffect(() => {
    generateBoard();
  }, []);

  // Timer
  useEffect(() => {
    let interval = null;
    if (isPlaying && !isWon) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isWon]);

  // Handle tile click / tap to rotate 90 deg
  const handleTileClick = (r, c) => {
    if (isWon) return;
    circuitAudio.init();
    circuitAudio.rotate();

    setGrid(prevGrid => {
      const newGrid = prevGrid.map((row, rowIdx) =>
        row.map((tile, colIdx) => {
          if (rowIdx === r && colIdx === c) {
            return {
              ...tile,
              rotation: (tile.rotation + 1) % 4
            };
          }
          return tile;
        })
      );

      const poweredGrid = updatePowerNetwork(newGrid);

      // Check Victory Condition: Target Core at bottom right (GRID_SIZE - 1, GRID_SIZE - 1) is powered!
      if (poweredGrid[GRID_SIZE - 1][GRID_SIZE - 1].isPowered && !isWon) {
        circuitAudio.victory();
        setIsWon(true);
        const finalMoves = moves + 1;
        if (finalMoves < bestMoves) {
          setBestMoves(finalMoves);
          try {
            localStorage.setItem('circuit_best_moves', finalMoves.toString());
          } catch {}
        }
      }

      return poweredGrid;
    });

    setMoves(prev => prev + 1);
  };

  // Helper to draw SVG circuit wires
  const renderWires = (conns, isPowered) => {
    const color = isPowered ? '#00f0ff' : '#475569';
    const glow = isPowered ? 'drop-shadow(0 0 6px #00f0ff)' : 'none';

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full" style={{ filter: glow }}>
        {/* Center node */}
        <circle cx="50" cy="50" r="10" fill={color} />

        {/* Top Wire */}
        {conns[0] && <rect x="44" y="0" width="12" height="50" fill={color} rx="2" />}
        {/* Right Wire */}
        {conns[1] && <rect x="50" y="44" width="50" height="12" fill={color} rx="2" />}
        {/* Bottom Wire */}
        {conns[2] && <rect x="44" y="50" width="12" height="50" fill={color} rx="2" />}
        {/* Left Wire */}
        {conns[3] && <rect x="0" y="44" width="50" height="12" fill={color} rx="2" />}
      </svg>
    );
  };

  return (
    <div className="w-full glass-panel p-4 sm:p-6 rounded-2xl border border-emerald-500/30 relative overflow-hidden shadow-[0_0_35px_rgba(16,185,129,0.15)] bg-black/60">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Cpu size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-orbitron font-bold text-white tracking-wider">
                NEURAL CIRCUIT CONNECT
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PIPELINE.SYS
              </span>
            </div>
            <p className="text-xs text-gray-400 font-inter">
              Rotate data cables to route energy from the Root Transmitter to the Quantum Core!
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/50 border border-yellow-500/30 text-yellow-300 font-mono text-xs">
            <Trophy size={14} className="text-cyber-yellow" />
            <span>BEST MOVES: {bestMoves === 999 ? '--' : bestMoves}</span>
          </div>

          <button
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              circuitAudio.muted = nextMuted;
            }}
            className="p-2 rounded-xl glass-panel text-gray-300 hover:text-white border border-white/10 cursor-pointer"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-emerald-400" />}
          </button>

          <button
            onClick={generateBoard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/40 text-xs font-orbitron font-bold transition-all cursor-pointer"
            title="Reset & Generate Board"
          >
            <RotateCcw size={14} />
            <span>New Board</span>
          </button>
        </div>
      </div>

      {/* Game HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 font-mono text-xs">
        <div className="p-2.5 rounded-xl bg-black/60 border border-emerald-500/30 flex items-center justify-between">
          <span className="text-gray-400 text-[10px] uppercase">MOVES TAKEN</span>
          <span className="text-emerald-400 font-bold text-sm">{moves}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
          <span className="text-gray-400 text-[10px] uppercase">TIME ELAPSED</span>
          <span className="text-white font-bold text-sm">{time}s</span>
        </div>
        <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
          <span className="text-gray-400 text-[10px] uppercase">SOURCE NODE</span>
          <span className="text-cyber-blue font-bold text-xs">[0, 0] ROOT</span>
        </div>
        <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between">
          <span className="text-gray-400 text-[10px] uppercase">CORE STATUS</span>
          <span className={`font-bold text-xs ${isWon ? 'text-emerald-400 animate-pulse' : 'text-gray-500'}`}>
            {isWon ? 'ENERGIZED 100%' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Grid Canvas Board Container */}
      <div className="max-w-md mx-auto aspect-square p-3 sm:p-4 rounded-2xl bg-black/80 border-2 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative">
        
        {/* Source & Destination Badges */}
        <div className="absolute -top-3 left-4 px-2 py-0.5 rounded bg-cyber-blue text-black font-orbitron font-bold text-[9px] uppercase tracking-wider shadow-[0_0_10px_#00f0ff] z-10">
          Source Transmitter
        </div>
        <div className="absolute -bottom-3 right-4 px-2 py-0.5 rounded bg-emerald-400 text-black font-orbitron font-bold text-[9px] uppercase tracking-wider shadow-[0_0_10px_#34d399] z-10">
          Quantum Core Node
        </div>

        <div className="grid grid-cols-4 gap-2 w-full h-full">
          {grid.map((row, r) =>
            row.map((tile, c) => {
              const conns = rotateConnections(tile.baseConns, tile.rotation);
              const isSource = r === 0 && c === 0;
              const isCore = r === GRID_SIZE - 1 && c === GRID_SIZE - 1;

              return (
                <motion.button
                  key={`${r}-${c}`}
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => handleTileClick(r, c)}
                  className={`relative w-full h-full rounded-xl border flex items-center justify-center p-2.5 transition-all cursor-pointer ${
                    tile.isPowered
                      ? 'bg-cyber-dark/80 border-cyan-400/80 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                      : 'bg-black/50 border-white/10 hover:border-white/30'
                  }`}
                >
                  {/* Glowing Node Marker */}
                  {isSource && (
                    <span className="absolute top-1 left-1.5 w-2 h-2 rounded-full bg-cyber-blue shadow-[0_0_8px_#00f0ff]"></span>
                  )}
                  {isCore && (
                    <span className={`absolute bottom-1 right-1.5 w-2 h-2 rounded-full ${tile.isPowered ? 'bg-emerald-400 shadow-[0_0_10px_#34d399] animate-ping' : 'bg-gray-600'}`}></span>
                  )}

                  {renderWires(conns, tile.isPowered)}
                </motion.button>
              );
            })
          )}
        </div>
      </div>

      {/* Victory Celebration Modal */}
      <AnimatePresence>
        {isWon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-md mx-auto mt-5 p-5 rounded-2xl bg-emerald-500/15 border-2 border-emerald-400 text-center space-y-3 shadow-[0_0_35px_rgba(52,211,153,0.3)] backdrop-blur-md"
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-400/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_#34d399] animate-bounce">
              <CheckCircle size={32} />
            </div>

            <div>
              <span className="text-[10px] font-mono px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 uppercase tracking-widest border border-emerald-500/30">
                CIRCUIT SYNCHRONIZED // 100% ONLINE
              </span>
              <h4 className="text-2xl font-orbitron font-bold text-white mt-2">
                CORE PIPELINE RESTORED!
              </h4>
              <p className="text-xs text-gray-300 font-inter">
                Electricity routed in <strong className="text-white font-mono">{moves} moves</strong> ({time} seconds). Rating: <strong className="text-cyber-yellow">⭐⭐⭐ MASTER ARCHITECT</strong>.
              </p>
            </div>

            <button
              onClick={generateBoard}
              className="px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-orbitron font-bold text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_15px_rgba(52,211,153,0.4)] transition-all"
            >
              Play Next Pipeline
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center mt-4 text-[11px] font-mono text-gray-400">
        Click or tap any tile to rotate 90° • Connect the blue Source to the green Quantum Core!
      </div>

    </div>
  );
};

export default NeuralCircuitGame;
