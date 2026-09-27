import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Volume2, VolumeX, Palette, X, Shield, Lock } from 'lucide-react';
import { SettingsContext } from '../context/SettingsContext';
import AdminModal from './AdminModal';

const SettingsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const { soundEnabled, setSoundEnabled, activeTheme, setActiveTheme, themes, playClick, playHover } = useContext(SettingsContext);

  return (
    <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-[100]">
      {/* Settings Button */}
      <button
        onClick={() => {
          try { playClick?.(); } catch {}
          setIsOpen(!isOpen);
        }}
        onMouseEnter={() => playHover?.()}
        className="w-10 h-10 md:w-12 md:h-12 rounded-full glass-panel flex items-center justify-center text-cyber-blue hover:scale-110 transition-all duration-300 relative group cursor-pointer"
        title="System Settings"
      >
        <Settings
          size={24}
          className={`transition-transform duration-700 ${isOpen ? 'rotate-180 text-cyber-red' : 'group-hover:rotate-90'}`}
        />
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full border border-cyber-blue/50 group-hover:border-cyber-blue group-hover:shadow-[0_0_15px_var(--color-cyber-blue)] transition-all pointer-events-none"></div>
      </button>

      {/* Settings Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, originX: 0, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-16 left-0 w-72 glass-panel rounded-xl border border-white/10 p-5 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] bg-cyber-dark/95 backdrop-blur-md"
          >
            <div className="flex justify-between items-center mb-5 pb-2 border-b border-white/10">
              <h3 className="text-white font-orbitron tracking-widest text-sm font-bold flex items-center gap-2">
                <Settings size={16} className="text-cyber-blue" />
                SYSTEM PREFS
              </h3>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-gray-400 hover:text-cyber-red transition-colors p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sound Toggle */}
            <div className="mb-5 flex justify-between items-center group">
              <div className="flex items-center gap-3 text-gray-300 group-hover:text-white transition-colors">
                {soundEnabled ? <Volume2 size={18} className="text-cyber-blue" /> : <VolumeX size={18} className="text-gray-500" />}
                <span className="font-inter text-sm">UI Sounds</span>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 cursor-pointer ${soundEnabled ? 'bg-cyber-blue' : 'bg-gray-700'}`}
              >
                <motion.div
                  className="w-4 h-4 bg-white rounded-full shadow-md"
                  animate={{ x: soundEnabled ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            {/* Theme Selector */}
            <div className="mb-5">
              <div className="flex items-center gap-3 text-gray-300 mb-3 font-inter text-sm">
                <Palette size={18} className="text-cyber-blue" />
                <span>Neon Accent Theme</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {Object.entries(themes).map(([name, color]) => (
                  <button
                    key={name}
                    onClick={() => {
                      try { playClick?.(); } catch {}
                      setActiveTheme(name);
                    }}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer ${activeTheme === name ? 'border-2 border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)] z-10' : 'border border-transparent hover:scale-105 opacity-70 hover:opacity-100'}`}
                    style={{ backgroundColor: color }}
                    title={name.replace('-', ' ').toUpperCase()}
                  />
                ))}
              </div>
            </div>

            {/* Admin Section Access Button */}
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  try { playClick?.(); } catch {}
                  setIsOpen(false);
                  setIsAdminOpen(true);
                }}
                onMouseEnter={() => playHover?.()}
                className="w-full py-2.5 px-3 rounded-xl border border-cyber-purple/50 bg-cyber-purple/15 hover:bg-cyber-purple/25 text-white font-orbitron text-xs flex items-center justify-between transition-all group/admin cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                title="Only Administrator Can Access"
              >
                <div className="flex items-center gap-2">
                  <Shield size={15} className="text-cyber-purple group-hover/admin:animate-pulse" />
                  <span className="font-bold tracking-wider">ADMIN PORTAL</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyber-blue font-bold tracking-wider bg-cyber-blue/10 px-2 py-0.5 rounded border border-cyber-blue/40">
                  <Lock size={10} />
                  <span>ACCESS</span>
                </div>
              </button>
            </div>

            {/* Holographic background noise for panel */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 pointer-events-none mix-blend-overlay"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Control Modal */}
      <AdminModal 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
      />
    </div>
  );
};

export default SettingsPanel;
