import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, 
  ShieldAlert, 
  Terminal, 
  Zap, 
  Cpu, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import CyberMatrixGame from './CyberMatrixGame';
import MatrixCypherGame from './games/MatrixCypherGame';
import QuantumRunnerGame from './games/QuantumRunnerGame';
import NeuralCircuitGame from './games/NeuralCircuitGame';

const CyberArcadeStation = () => {
  const [activeGame, setActiveGame] = useState('defender'); // 'defender' | 'cypher' | 'runner' | 'circuit'

  const games = [
    {
      id: 'defender',
      title: 'Firewall Defender',
      subtitle: 'Space-Arcade Shooter',
      icon: ShieldAlert,
      tag: 'ARCADE',
      color: 'from-cyber-blue to-cyber-purple',
      borderColor: 'border-cyber-blue',
      glow: 'shadow-[0_0_20px_rgba(0,240,255,0.4)]',
      desc: 'Command the plasma drone, trigger EMP shockwaves, and conquer the Wave 3 Rogue AI Core!'
    },
    {
      id: 'cypher',
      title: 'Matrix Cypher',
      subtitle: 'Hacker Terminal Decryptor',
      icon: Terminal,
      tag: 'LOGIC',
      color: 'from-cyber-purple to-pink-500',
      borderColor: 'border-cyber-purple',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
      desc: 'Analyze memory dumps and crack classified 5-letter access passcodes before lockdown.'
    },
    {
      id: 'runner',
      title: 'Neon Runner',
      subtitle: 'Quantum Synthwave Dash',
      icon: Zap,
      tag: 'REFLEX',
      color: 'from-cyan-400 to-emerald-400',
      borderColor: 'border-cyan-400',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.4)]',
      desc: 'High-speed endless sprint! Double-jump laser spikes, duck beneath beams, and collect crystals.'
    },
    {
      id: 'circuit',
      title: 'Circuit Connect',
      subtitle: 'Neural Energy Router',
      icon: Cpu,
      tag: 'PUZZLE',
      color: 'from-emerald-400 to-cyber-yellow',
      borderColor: 'border-emerald-400',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]',
      desc: 'Rotate cyber cable nodes to route electric power from the Root Source to the Quantum Core.'
    }
  ];

  const currentGame = games.find(g => g.id === activeGame) || games[0];

  return (
    <div className="w-full">
      {/* Game Selector Tabs Bar - 2x2 Row-Wise Grid on Mobile, Flex on Desktop */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6">
        {games.map((g, idx) => {
          const Icon = g.icon;
          const isSelected = activeGame === g.id;

          return (
            <motion.button
              key={g.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveGame(g.id)}
              className={`flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5 px-2.5 sm:px-5 py-2.5 rounded-xl border text-[11px] sm:text-sm font-orbitron transition-all cursor-pointer w-full sm:w-auto ${
                isSelected
                  ? `bg-gradient-to-r ${g.color} text-black font-bold border-white ${g.glow}`
                  : 'glass-panel text-gray-300 hover:text-white border-white/10 hover:border-white/30'
              }`}
            >
              <Icon size={15} className={isSelected ? 'text-black' : 'text-cyber-blue'} />
              <span className="truncate">{idx + 1}. {g.title}</span>
              <span className={`hidden xs:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider ${
                isSelected ? 'bg-black/30 text-white' : 'bg-white/10 text-gray-400'
              }`}>
                {g.tag}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Selected Game Info Capsule */}
      <div className="text-center mb-6 px-4">
        <span className="text-xs font-mono text-gray-400">
          Playing: <strong className="text-white font-orbitron">{currentGame.title}</strong> — {currentGame.desc}
        </span>
      </div>

      {/* Active Game Display with Smooth Fade & Scale Transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeGame}
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.98 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full"
        >
          {activeGame === 'defender' && <CyberMatrixGame />}
          {activeGame === 'cypher' && <MatrixCypherGame />}
          {activeGame === 'runner' && <QuantumRunnerGame />}
          {activeGame === 'circuit' && <NeuralCircuitGame />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CyberArcadeStation;
