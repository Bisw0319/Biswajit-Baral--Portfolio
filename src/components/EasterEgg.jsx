import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EasterEgg = () => {
  const [isActive, setIsActive] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount === 5) {
      setIsActive(true);
      setTimeout(() => {
        setIsActive(false);
        setClickCount(0);
      }, 5000); // 5 seconds of glitch
    }
  };

  return (
    <>
      <div 
        className="fixed bottom-4 right-4 w-4 h-4 rounded-sm border border-cyber-blue/20 cursor-pointer z-[100] opacity-30 hover:opacity-100 hover:border-cyber-blue hover:bg-cyber-blue/10 transition-all"
        onClick={handleClick}
        title="Override System"
      ></div>

      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] pointer-events-none bg-black flex items-center justify-center overflow-hidden"
          >
            {/* Matrix rain effect simplified with CSS/Framer */}
            <div className="absolute inset-0 opacity-50 flex items-center justify-center">
               <h1 className="text-[10vw] font-orbitron font-bold text-cyber-red animate-pulse glitch-text uppercase" style={{ textShadow: '0 0 20px #ff003c' }}>
                  SYSTEM_BREACH
               </h1>
            </div>
            
            <div className="absolute inset-0 bg-cyber-grid bg-[length:20px_20px] opacity-30"></div>
            
            {/* Glitch overlays */}
            <motion.div 
              className="absolute inset-0 bg-cyber-blue mix-blend-overlay"
              animate={{ opacity: [0, 0.5, 0, 0.8, 0] }}
              transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror" }}
            />
            <motion.div 
              className="absolute inset-0 bg-cyber-red mix-blend-color-dodge"
              animate={{ opacity: [0, 0.3, 0, 0.5, 0], x: [-10, 10, -5, 5, 0] }}
              transition={{ duration: 0.1, repeat: Infinity, repeatType: "mirror" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EasterEgg;
