import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  RotateCcw, 
  Trophy, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle,
  Key,
  ShieldAlert,
  Zap,
  Lock,
  Unlock,
  Volume2,
  VolumeX
} from 'lucide-react';

// Sound Synthesizer for Terminal Cyber Sounds
class TerminalSoundFX {
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
  keyClick() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200 + Math.random() * 300, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }
  match() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.17);
    } catch {}
  }
  fail() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch {}
  }
  victory() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [440, 554, 659, 880, 1108].forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(f, now + i * 0.08);
        gain.gain.setValueAtTime(0.1, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.22);
      });
    } catch {}
  }
}

const snd = new TerminalSoundFX();

// Cyber security vocabulary words (all 5 letters)
const CYBER_WORDS = [
  'CYBER', 'PROXY', 'NEXUS', 'TOKEN', 'LOGIC', 
  'SHIFT', 'TRACE', 'VIRUS', 'STACK', 'SHELL', 
  'GUARD', 'ROBOT', 'PATCH', 'MACRO', 'LINUX', 
  'QUERY', 'CIPHER', 'FIBER', 'ALERT', 'BLOCK',
  'CRACK', 'HASHY', 'ARRAY', 'DEBUG', 'BYTES'
];

const MatrixCypherGame = () => {
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing' | 'won' | 'lost'
  const [attemptsLeft, setAttemptsLeft] = useState(6);
  const [isMuted, setIsMuted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(() => {
    try {
      return parseInt(localStorage.getItem('cypher_best_streak') || '0', 10);
    } catch {
      return 0;
    }
  });

  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
  ];

  const initGame = () => {
    snd.init();
    const word = CYBER_WORDS[Math.floor(Math.random() * CYBER_WORDS.length)];
    setTargetWord(word);
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('playing');
    setAttemptsLeft(6);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleKeyPress = (key) => {
    snd.init();
    if (gameStatus !== 'playing') return;

    if (key === 'ENTER') {
      if (currentGuess.length !== 5) {
        snd.fail();
        return;
      }
      submitGuess();
    } else if (key === 'DEL' || key === 'BACKSPACE') {
      snd.keyClick();
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      snd.keyClick();
      setCurrentGuess(prev => prev + key);
    }
  };

  const submitGuess = () => {
    const formatted = currentGuess.toUpperCase();
    const newGuesses = [...guesses, formatted];
    setGuesses(newGuesses);
    setCurrentGuess('');
    setAttemptsLeft(6 - newGuesses.length);

    if (formatted === targetWord) {
      // Won
      snd.victory();
      setGameStatus('won');
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
        try {
          localStorage.setItem('cypher_best_streak', newStreak.toString());
        } catch {}
      }
    } else if (newGuesses.length >= 6) {
      // Lost
      snd.fail();
      setGameStatus('lost');
      setStreak(0);
    } else {
      snd.match();
    }
  };

  // Physical Keyboard Listener
  const handleKeyPressRef = useRef(handleKeyPress);
  useEffect(() => {
    handleKeyPressRef.current = handleKeyPress;
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();
      if (key === 'ENTER') handleKeyPressRef.current?.('ENTER');
      else if (key === 'BACKSPACE') handleKeyPressRef.current?.('DEL');
      else if (/^[A-Z]$/.test(key)) handleKeyPressRef.current?.(key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Color logic for guessed letters
  const getLetterStatus = (letter, pos, word) => {
    if (!word) return 'empty';
    if (targetWord[pos] === letter) return 'correct';
    if (targetWord.includes(letter)) return 'present';
    return 'absent';
  };

  // Keyboard key styling
  const getKeyStatus = (key) => {
    let status = 'default';
    guesses.forEach(guess => {
      for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];
        if (letter === key) {
          if (targetWord[i] === letter) {
            status = 'correct';
            return;
          } else if (targetWord.includes(letter) && status !== 'correct') {
            status = 'present';
          } else if (status === 'default') {
            status = 'absent';
          }
        }
      }
    });
    return status;
  };

  return (
    <div className="w-full glass-panel p-4 sm:p-6 rounded-2xl border border-cyber-purple/30 relative overflow-hidden shadow-[0_0_35px_rgba(168,85,247,0.15)] bg-black/60">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyber-purple/10 border border-cyber-purple/40 text-cyber-purple shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Terminal size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-orbitron font-bold text-white tracking-wider">
                MATRIX CYPHER BREAKER
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30">
                ROOT.DECRYPT
              </span>
            </div>
            <p className="text-xs text-gray-400 font-inter">
              Crack the encrypted 5-letter security hash before the security protocol locks down!
            </p>
          </div>
        </div>

        {/* Stats & Controls */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/50 border border-yellow-500/30 text-yellow-300 font-mono text-xs">
            <Trophy size={14} className="text-cyber-yellow" />
            <span>STREAK: {streak} (BEST: {bestStreak})</span>
          </div>

          <button
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              snd.muted = nextMuted;
            }}
            className="p-2 rounded-xl glass-panel text-gray-300 hover:text-white border border-white/10 cursor-pointer"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-cyber-purple" />}
          </button>

          <button
            onClick={initGame}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyber-purple/15 hover:bg-cyber-purple text-cyber-purple hover:text-black border border-cyber-purple/40 text-xs font-orbitron font-bold transition-all cursor-pointer"
            title="Generate New Cipher Code"
          >
            <RotateCcw size={14} />
            <span>New Cipher</span>
          </button>
        </div>
      </div>

      {/* Grid of 6 Rows */}
      <div className="max-w-xs mx-auto mb-6 space-y-2">
        {[0, 1, 2, 3, 4, 5].map((rowIdx) => {
          const guess = guesses[rowIdx];
          const isCurrentRow = rowIdx === guesses.length;
          
          return (
            <div key={rowIdx} className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4].map((colIdx) => {
                let char = '';
                let status = 'empty';

                if (guess) {
                  char = guess[colIdx] || '';
                  status = getLetterStatus(char, colIdx, guess);
                } else if (isCurrentRow) {
                  char = currentGuess[colIdx] || '';
                  if (char) status = 'active';
                }

                let bgClass = 'bg-black/60 border-white/15 text-white';
                if (status === 'correct') {
                  bgClass = 'bg-emerald-500/30 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.4)]';
                } else if (status === 'present') {
                  bgClass = 'bg-cyber-yellow/30 border-cyber-yellow text-cyber-yellow shadow-[0_0_12px_rgba(252,238,10,0.3)]';
                } else if (status === 'absent') {
                  bgClass = 'bg-gray-800/40 border-gray-700 text-gray-500';
                } else if (status === 'active') {
                  bgClass = 'bg-cyber-purple/20 border-cyber-purple text-white shadow-[0_0_8px_rgba(168,85,247,0.3)] animate-pulse';
                }

                return (
                  <motion.div
                    key={colIdx}
                    initial={guess ? { rotateX: 90 } : false}
                    animate={guess ? { rotateX: 0 } : false}
                    transition={{ duration: 0.25, delay: colIdx * 0.08 }}
                    className={`w-full aspect-square rounded-xl border flex items-center justify-center font-orbitron font-bold text-lg sm:text-xl uppercase transition-colors ${bgClass}`}
                  >
                    {char}
                  </motion.div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Status Overlay Banners */}
      <AnimatePresence>
        {gameStatus === 'won' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-md mx-auto mb-5 p-4 rounded-xl bg-emerald-500/15 border border-emerald-400 text-center space-y-2 shadow-[0_0_20px_rgba(52,211,153,0.25)]"
          >
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-orbitron font-bold text-sm">
              <Unlock size={18} />
              <span>ACCESS GRANTED // CYPHER DECRYPTED!</span>
            </div>
            <p className="text-xs font-inter text-gray-300">
              The root passcode was <strong className="text-emerald-300 font-mono text-sm tracking-wider">"{targetWord}"</strong>. Firewalls bypassed in {guesses.length}/6 attempts!
            </p>
            <button
              onClick={initGame}
              className="px-4 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-black font-orbitron font-bold text-xs uppercase cursor-pointer transition-all"
            >
              Crack Next Cipher
            </button>
          </motion.div>
        )}

        {gameStatus === 'lost' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-md mx-auto mb-5 p-4 rounded-xl bg-cyber-red/15 border border-cyber-red text-center space-y-2 shadow-[0_0_20px_rgba(255,0,60,0.25)]"
          >
            <div className="flex items-center justify-center gap-2 text-cyber-red font-orbitron font-bold text-sm">
              <Lock size={18} />
              <span>SECURITY LOCKDOWN // TRACE COMPLETE</span>
            </div>
            <p className="text-xs font-inter text-gray-300">
              Attempts exhausted. The target cipher code was <strong className="text-cyber-blue font-mono text-sm tracking-wider">"{targetWord}"</strong>.
            </p>
            <button
              onClick={initGame}
              className="px-4 py-2 rounded-lg bg-cyber-blue hover:bg-cyber-blue/90 text-black font-orbitron font-bold text-xs uppercase cursor-pointer transition-all"
            >
              Reboot Terminal
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cyberpunk Touch Keyboard */}
      <div className="max-w-md mx-auto space-y-1.5 select-none">
        {keyboardRows.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5">
            {row.map((key) => {
              const status = getKeyStatus(key);
              let keyBg = 'bg-cyber-dark/80 text-gray-200 border-white/10 hover:border-cyber-purple/50';
              if (status === 'correct') {
                keyBg = 'bg-emerald-500 text-black font-bold border-emerald-400 shadow-sm';
              } else if (status === 'present') {
                keyBg = 'bg-cyber-yellow text-black font-bold border-yellow-400 shadow-sm';
              } else if (status === 'absent') {
                keyBg = 'bg-black/50 text-gray-600 border-transparent';
              }

              const isWide = key === 'ENTER' || key === 'DEL';

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeyPress(key)}
                  className={`py-2.5 sm:py-3 rounded-lg border font-mono font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-95 ${
                    isWide ? 'px-3 sm:px-4 text-[10px] sm:text-xs tracking-wider bg-cyber-purple/20 border-cyber-purple/40 text-cyber-purple hover:bg-cyber-purple hover:text-black' : 'flex-1 max-w-[36px]'
                  } ${keyBg}`}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Hints / Instructions */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-5 pt-3 border-t border-white/10 text-[11px] font-mono text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
          <span>Green = Valid byte & position</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-cyber-yellow inline-block"></span>
          <span>Yellow = Exists in cipher</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-gray-700 inline-block"></span>
          <span>Grey = Not in cipher</span>
        </div>
      </div>

    </div>
  );
};

export default MatrixCypherGame;
