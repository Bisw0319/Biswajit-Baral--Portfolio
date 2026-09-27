import React, { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, Move, Heart, Minus, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { SettingsContext } from '../context/SettingsContext';

const AnimeCompanion = () => {
  const fullMessage = "Hello, I'm Biswajit Baral, let's connect together!";
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [replayKey, setReplayKey] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [isWinking, setIsWinking] = useState(false);
  const [isMinimized, setIsMinimized] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const context = useContext(SettingsContext);
  const playHover = context?.playHover;
  const playClick = context?.playClick;

  // Auto-minimize on mobile viewports
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMinimized(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. Mouse Tracking: Eyes & head subtly follow the user's cursor
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isMinimized) return;
      // Calculate normalized vector relative to center of screen
      const x = ((e.clientX / window.innerWidth) - 0.5) * 2;
      const y = ((e.clientY / window.innerHeight) - 0.5) * 2;
      setMouseOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMinimized]);

  // 2. Typewriter animation - says message 1 by 1
  useEffect(() => {
    let index = 0;
    setDisplayedText("");
    setIsTyping(true);

    const timer = setInterval(() => {
      if (index < fullMessage.length) {
        setDisplayedText(fullMessage.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 42);

    return () => clearInterval(timer);
  }, [replayKey, isMinimized]);

  // 3. Realistic eye blinking timer
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
      }, 150);
    }, 3200);

    return () => clearInterval(blinkInterval);
  }, []);

  // 4. Interactive Click: Wink & heart reaction
  const handleCharacterClick = () => {
    try {
      playClick?.();
    } catch {
      // safe fallback
    }
    setShowHeart(true);
    setIsWinking(true);
    setTimeout(() => setShowHeart(false), 1400);
    setTimeout(() => setIsWinking(false), 900);
    setReplayKey(prev => prev + 1);
  };

  // Pupil offsets based on mouse gaze
  const pupilX = mouseOffset.x * 4.5;
  const pupilY = mouseOffset.y * 3.5;
  const headRotate = mouseOffset.x * 4;

  return (
    <div 
      ref={containerRef}
      className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 md:right-8 z-50 pointer-events-none"
    >
      <AnimatePresence>
        {!isMinimized ? (
          /* Main Interactive Living Character - Enters from Right */
          <motion.div
            key="companion-expanded"
            drag
            dragElastic={0.15}
            dragMomentum={false}
            whileDrag={{ scale: 1.03, cursor: "grabbing" }}
            initial={{ x: 450, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 450, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 70, delay: 0.25 }}
            className="flex flex-col items-center select-none cursor-grab pointer-events-auto touch-none origin-bottom-right scale-[0.70] sm:scale-100 max-w-[85vw]"
          >
            {/* 1. Speech Dialog Bubble (Types message 1 by 1) */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="relative mb-2 w-[240px] sm:w-[295px] p-3 sm:p-3.5 rounded-2xl glass-panel border border-cyber-blue/60 shadow-[0_0_25px_rgba(0,240,255,0.35)] bg-cyber-dark/95 backdrop-blur-md"
            >
              {/* Top Dialog Bar */}
              <div className="flex justify-between items-center pb-1.5 mb-1.5 border-b border-white/10 text-[10px] font-mono text-gray-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyber-blue animate-pulse"></span>
                  <span className="text-cyber-blue font-orbitron font-bold tracking-wider">A.I.D.A // LIVE AVATAR</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setReplayKey(prev => prev + 1);
                      try { playClick?.(); } catch {}
                    }}
                    onMouseEnter={() => playHover?.()}
                    className="flex items-center gap-1 text-gray-400 hover:text-cyber-blue transition-colors cursor-pointer"
                    title="Replay message"
                  >
                    <RotateCcw size={11} className={isTyping ? "animate-spin" : ""} />
                    <span>Replay</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMinimized(true);
                      try { playClick?.(); } catch {}
                    }}
                    onMouseEnter={() => playHover?.()}
                    className="text-gray-400 hover:text-cyber-red transition-colors cursor-pointer p-0.5"
                    title="Minimize avatar"
                  >
                    <Minus size={13} />
                  </button>
                </div>
              </div>

              {/* Message Content with Typing Cursor */}
              <div className="text-xs sm:text-sm font-inter text-white leading-relaxed min-h-[40px]">
                <span className="text-gray-100 font-medium">{displayedText}</span>
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="inline-block w-1.5 h-3.5 ml-1 bg-cyber-blue align-middle"
                  />
                )}
              </div>

              {/* Speech Bubble Arrow pointing to character */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-cyber-dark border-r border-b border-cyber-blue/60 rotate-45"></div>
            </motion.div>

            {/* Heart emote on click reaction */}
            <AnimatePresence>
              {showHeart && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.5 }}
                  animate={{ opacity: 1, y: -45, scale: 1.3 }}
                  exit={{ opacity: 0, y: -70, scale: 0.8 }}
                  className="absolute top-24 z-50 pointer-events-none text-cyber-red"
                >
                  <Heart size={32} fill="#ff003c" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* 2. REAL ARTICULATED ANIME CHARACTER (Live SVG Rig) */}
            <motion.div 
              onClick={handleCharacterClick}
              onMouseEnter={() => playHover?.()}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-48 sm:w-56 md:w-64 cursor-pointer select-none transition-transform hover:scale-105 active:scale-95"
              style={{
                filter: "drop-shadow(0 0 16px rgba(0, 240, 255, 0.45)) drop-shadow(0 12px 28px rgba(0, 0, 0, 0.8))"
              }}
            >
              {/* Holographic Projection Base Ring */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-36 h-4 rounded-full bg-cyber-blue/20 blur-md pointer-events-none"></div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-32 h-2.5 rounded-full border border-cyber-blue/60 shadow-[0_0_12px_rgba(0,240,255,0.7)] pointer-events-none animate-pulse"></div>

              {/* The Rigged Anime Character Vector Art */}
              <svg 
                viewBox="0 0 400 480" 
                className="w-full h-auto overflow-visible"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Skin Gradients */}
                  <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fff2ec" />
                    <stop offset="100%" stopColor="#f7d4c6" />
                  </linearGradient>
                  <linearGradient id="skinShadow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f5c7b5" />
                    <stop offset="100%" stopColor="#eab5a2" />
                  </linearGradient>

                  {/* Eye Iris Gradient (Cyber Cyan to Deep Purple) */}
                  <linearGradient id="irisGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00f0ff" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>

                  {/* Cyberpunk Hair Gradient */}
                  <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e0e7ff" />
                    <stop offset="45%" stopColor="#c7d2fe" />
                    <stop offset="85%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#00f0ff" />
                  </linearGradient>

                  {/* Cyber Suit Gradient */}
                  <linearGradient id="suitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>

                  {/* Neon Glow Filters */}
                  <filter id="neonCyanGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* --- BACK HAIR (Flowing Behind Body) --- */}
                <motion.g 
                  animate={{ rotate: [-2, 2, -2] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  style={{ transformOrigin: "200px 180px" }}
                >
                  <path 
                    d="M 120 220 Q 90 320 110 400 Q 140 360 160 330 Z" 
                    fill="url(#hairGrad)" 
                    opacity="0.85"
                  />
                  <path 
                    d="M 280 220 Q 310 320 290 400 Q 260 360 240 330 Z" 
                    fill="url(#hairGrad)" 
                    opacity="0.85"
                  />
                </motion.g>

                {/* --- BODY & TORSO (Cyber Jacket - Rock steady, shoulders do NOT move) --- */}
                <g>
                  {/* Shoulders & Upper Body */}
                  <path 
                    d="M 140 340 L 110 440 L 290 440 L 260 340 Q 200 365 140 340 Z" 
                    fill="url(#suitGrad)" 
                    stroke="#334155" 
                    strokeWidth="2" 
                  />

                  {/* Cyber Suit Lapels & Glowing Trim Lines */}
                  <path 
                    d="M 175 330 L 185 410 L 200 440 L 215 410 L 225 330" 
                    fill="none" 
                    stroke="#00f0ff" 
                    strokeWidth="2.5" 
                    filter="url(#neonCyanGlow)"
                  />
                  {/* Cyber Badge */}
                  <rect x="155" y="375" width="22" height="12" rx="3" fill="#000" stroke="#00f0ff" strokeWidth="1" />
                  <circle cx="162" cy="381" r="2.5" fill="#00f0ff" className="animate-ping" />
                  <rect x="168" y="379" width="6" height="4" fill="#a855f7" />

                  {/* Left Arm (Resting on Hip) */}
                  <path 
                    d="M 140 340 Q 115 390 120 440" 
                    fill="none" 
                    stroke="#1e293b" 
                    strokeWidth="22" 
                    strokeLinecap="round" 
                  />
                  {/* Left Cyber Glove */}
                  <circle cx="120" cy="435" r="9" fill="#0f172a" stroke="#00f0ff" strokeWidth="2" />
                </g>

                {/* --- NECK --- */}
                <path d="M 188 285 L 188 335 Q 200 345 212 335 L 212 285 Z" fill="url(#skinShadow)" />

                {/* --- HEAD GROUP (Tracks Mouse & Tilts) --- */}
                <motion.g
                  animate={{ rotate: headRotate }}
                  transition={{ type: "spring", damping: 15, stiffness: 90 }}
                  style={{ transformOrigin: "200px 280px" }}
                >
                  {/* Face Base */}
                  <path 
                    d="M 148 200 C 146 250 172 298 200 306 C 228 298 254 250 252 200 C 252 145 148 145 148 200 Z" 
                    fill="url(#skinGrad)" 
                    stroke="#e2b7a5" 
                    strokeWidth="1.2" 
                  />

                  {/* Soft Anime Cheeks (Blushing) */}
                  <ellipse cx="165" cy="246" rx="14" ry="7" fill="#ff4d79" opacity="0.32" />
                  <ellipse cx="235" cy="246" rx="14" ry="7" fill="#ff4d79" opacity="0.32" />
                  <line x1="160" y1="243" x2="164" y2="249" stroke="#ff1f66" strokeWidth="1.2" opacity="0.6" />
                  <line x1="166" y1="243" x2="170" y2="249" stroke="#ff1f66" strokeWidth="1.2" opacity="0.6" />
                  <line x1="230" y1="243" x2="234" y2="249" stroke="#ff1f66" strokeWidth="1.2" opacity="0.6" />
                  <line x1="236" y1="243" x2="240" y2="249" stroke="#ff1f66" strokeWidth="1.2" opacity="0.6" />

                  {/* Cute Anime Nose */}
                  <circle cx="200" cy="256" r="1.5" fill="#d97768" />

                  {/* --- REAL TALKING MOUTH (Lip-Sync when typing) --- */}
                  {isTyping ? (
                    <motion.path 
                      animate={{ 
                        d: [
                          "M 192 278 Q 200 279 208 278", 
                          "M 192 277 Q 200 286 208 277 Q 200 280 192 277", 
                          "M 193 277 Q 200 283 207 277"
                        ] 
                      }} 
                      transition={{ duration: 0.25, repeat: Infinity }}
                      fill="#e11d48" 
                      stroke="#881337" 
                      strokeWidth="1.5" 
                    />
                  ) : (
                    /* Sweet Content Smile */
                    <path 
                      d="M 192 278 Q 200 285 208 278" 
                      fill="none" 
                      stroke="#be123c" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                    />
                  )}

                  {/* --- LEFT ANIME EYE (With Eyeball Tracking & Blinking) --- */}
                  <g transform="translate(168, 222)">
                    {/* Eye Sclera (White) */}
                    <path d="M -18 -10 Q 0 -18 18 -10 Q 18 12 0 16 Q -18 12 -18 -10 Z" fill="#ffffff" />
                    
                    {/* Movable Iris & Pupil (Follows Mouse Cursor!) */}
                    <g transform={`translate(${pupilX}, ${pupilY})`}>
                      {/* Gradient Iris */}
                      <ellipse cx="0" cy="1" rx="10" ry="12.5" fill="url(#irisGrad)" />
                      {/* Deep Pupil */}
                      <ellipse cx="0" cy="1" rx="4.5" ry="6" fill="#0b0f19" />
                      {/* Cyber Iris Ring Accent */}
                      <circle cx="0" cy="3" r="7" fill="none" stroke="#00f0ff" strokeWidth="1" opacity="0.8" />
                      {/* Primary Eye Sparkle / Specular Reflection */}
                      <ellipse cx="-3.5" cy="-3.5" rx="3.5" ry="4" fill="#ffffff" />
                      {/* Secondary Tiny Highlight */}
                      <circle cx="3" cy="5" r="1.5" fill="#ffffff" opacity="0.9" />
                    </g>

                    {/* Bold Anime Upper Eyelash */}
                    <path 
                      d="M -20 -10 Q 0 -19 20 -8 L 22 -6" 
                      fill="none" 
                      stroke="#1e1b4b" 
                      strokeWidth="3.8" 
                      strokeLinecap="round" 
                    />
                    {/* Eyelash Wing Detail */}
                    <path d="M 16 -10 L 22 -14" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" />

                    {/* Interactive Animated Eyelid (Blinking & Winking) */}
                    <motion.rect
                      x="-22"
                      y="-22"
                      width="44"
                      height="44"
                      fill="url(#skinGrad)"
                      animate={{ scaleY: (isBlinking || isWinking) ? 1 : 0 }}
                      transition={{ duration: 0.08 }}
                      style={{ transformOrigin: "0px -10px" }}
                    />
                    {/* Closed Eyelash Line when blinking */}
                    {(isBlinking || isWinking) && (
                      <path d="M -18 0 Q 0 8 18 0" fill="none" stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" />
                    )}
                  </g>

                  {/* --- RIGHT ANIME EYE (With Eyeball Tracking & Blinking) --- */}
                  <g transform="translate(232, 222)">
                    {/* Eye Sclera (White) */}
                    <path d="M -18 -10 Q 0 -12 18 -10 Q 18 12 0 16 Q -18 12 -18 -10 Z" fill="#ffffff" />
                    
                    {/* Movable Iris & Pupil (Follows Mouse Cursor!) */}
                    <g transform={`translate(${pupilX}, ${pupilY})`}>
                      {/* Gradient Iris */}
                      <ellipse cx="0" cy="1" rx="10" ry="12.5" fill="url(#irisGrad)" />
                      {/* Deep Pupil */}
                      <ellipse cx="0" cy="1" rx="4.5" ry="6" fill="#0b0f19" />
                      {/* Cyber Iris Ring Accent */}
                      <circle cx="0" cy="3" r="7" fill="none" stroke="#00f0ff" strokeWidth="1" opacity="0.8" />
                      {/* Primary Eye Sparkle */}
                      <ellipse cx="-3.5" cy="-3.5" rx="3.5" ry="4" fill="#ffffff" />
                      {/* Secondary Tiny Highlight */}
                      <circle cx="3" cy="5" r="1.5" fill="#ffffff" opacity="0.9" />
                    </g>

                    {/* Bold Anime Upper Eyelash */}
                    <path 
                      d="M -20 -8 Q 0 -19 20 -10 L 22 -8" 
                      fill="none" 
                      stroke="#1e1b4b" 
                      strokeWidth="3.8" 
                      strokeLinecap="round" 
                    />
                    {/* Eyelash Wing Detail */}
                    <path d="M -16 -10 L -22 -14" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" />

                    {/* Interactive Animated Eyelid (Blinking only, stays open on wink) */}
                    <motion.rect
                      x="-22"
                      y="-22"
                      width="44"
                      height="44"
                      fill="url(#skinGrad)"
                      animate={{ scaleY: isBlinking ? 1 : 0 }}
                      transition={{ duration: 0.08 }}
                      style={{ transformOrigin: "0px -10px" }}
                    />
                    {/* Closed Eyelash Line when blinking */}
                    {isBlinking && (
                      <path d="M -18 0 Q 0 8 18 0" fill="none" stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" />
                    )}
                  </g>

                  {/* Delicate Eyebrows */}
                  <path d="M 152 198 Q 168 190 184 196" fill="none" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M 216 196 Q 232 190 248 198" fill="none" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" />

                  {/* --- CYBERPUNK MECHA HEADSET WITH AUDIO EQUALIZER --- */}
                  {/* Headband arch */}
                  <path d="M 134 210 C 132 120 268 120 266 210" fill="none" stroke="#0f172a" strokeWidth="8" strokeLinecap="round" />
                  <path d="M 140 200 C 145 130 255 130 260 200" fill="none" stroke="#00f0ff" strokeWidth="2" filter="url(#neonCyanGlow)" />

                  {/* Left Ear Cup */}
                  <rect x="122" y="200" width="16" height="34" rx="8" fill="#1e293b" stroke="#00f0ff" strokeWidth="1.8" />
                  {/* Glowing Equalizer Bars on Headset */}
                  <motion.rect x="126" y="210" width="2.5" height="12" rx="1" fill="#00f0ff" animate={{ height: [4, 14, 4] }} transition={{ duration: 0.6, repeat: Infinity }} />
                  <motion.rect x="130" y="208" width="2.5" height="16" rx="1" fill="#a855f7" animate={{ height: [8, 16, 8] }} transition={{ duration: 0.4, repeat: Infinity, delay: 0.2 }} />
                  <motion.rect x="134" y="212" width="2.5" height="8" rx="1" fill="#00f0ff" animate={{ height: [3, 10, 3] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }} />

                  {/* Right Ear Cup */}
                  <rect x="262" y="200" width="16" height="34" rx="8" fill="#1e293b" stroke="#00f0ff" strokeWidth="1.8" />
                  {/* Headset Cat-Ear Antennas */}
                  <polygon points="135,142 120,95 158,128" fill="#1e293b" stroke="#00f0ff" strokeWidth="1.8" />
                  <polygon points="132,135 125,108 148,128" fill="#00f0ff" opacity="0.75" />
                  <polygon points="265,142 280,95 242,128" fill="#1e293b" stroke="#00f0ff" strokeWidth="1.8" />
                  <polygon points="268,135 275,108 252,128" fill="#00f0ff" opacity="0.75" />

                  {/* Headset Mic extending to mouth */}
                  <path d="M 130 226 Q 140 270 178 280" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="180" cy="280" r="3.5" fill="#00f0ff" filter="url(#neonCyanGlow)" />

                  {/* --- CYBERPUNK HAIR BANGS & FOREHEAD STRANDS --- */}
                  <g fill="url(#hairGrad)">
                    {/* Center Bangs */}
                    <path d="M 140 170 Q 200 135 260 170 Q 240 215 228 220 Q 215 190 200 230 Q 185 190 172 220 Q 160 215 140 170 Z" />
                    {/* Left Swept Bang */}
                    <path d="M 145 160 Q 130 220 150 250 Q 158 225 160 190 Z" />
                    {/* Right Swept Bang */}
                    <path d="M 255 160 Q 270 220 250 250 Q 242 225 240 190 Z" />
                    {/* Forehead Hair Highlight Sheen */}
                    <path d="M 160 170 Q 200 155 240 170" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.6" strokeLinecap="round" />
                  </g>
                </motion.g>

                {/* --- STATIONARY RIGHT SHOULDER & UPPER ARM (Shoulder is 100% Fixed) --- */}
                <g id="stationary-upper-arm">
                  {/* Stationary Upper Arm (Shoulder 255,340 to Elbow 295,275) */}
                  <path 
                    d="M 255 340 Q 275 315 295 275" 
                    fill="none" 
                    stroke="#1e293b" 
                    strokeWidth="20" 
                    strokeLinecap="round" 
                  />
                  {/* Stationary Cyber Bicep Ring */}
                  <circle cx="278" cy="305" r="10" fill="none" stroke="#00f0ff" strokeWidth="2.5" filter="url(#neonCyanGlow)" />
                </g>

                {/* --- FOREARM & PALM ATTACHED AT ELBOW (ONLY Elbow Rotates the Arm) --- */}
                <g transform="translate(295, 275)">
                  {/* Fixed Elbow Socket */}
                  <circle cx="0" cy="0" r="10" fill="#0f172a" stroke="#00f0ff" strokeWidth="2" />

                  {/* Arm & Palm waving strictly from Elbow (0, 0) */}
                  <g>
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      values="-15 0 0; 20 0 0; -15 0 0"
                      dur="1.15s"
                      repeatCount="indefinite"
                      calcMode="spline"
                      keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
                    />

                    {/* Forearm (Starts directly at Elbow (0, 0) and connects to Wrist (12, -65)) */}
                    <path 
                      d="M 0 0 L 12 -65" 
                      fill="none" 
                      stroke="#1e293b" 
                      strokeWidth="16" 
                      strokeLinecap="round" 
                    />

                    {/* Forearm Neon Circuit Line */}
                    <path 
                      d="M 2 -4 L 11 -58" 
                      fill="none" 
                      stroke="#00f0ff" 
                      strokeWidth="2" 
                      filter="url(#neonCyanGlow)" 
                    />

                    {/* Cybernetic Wristband (Placed on Wrist (12, -65)) */}
                    <rect 
                      x="3" 
                      y="-69" 
                      width="18" 
                      height="8" 
                      rx="2" 
                      fill="#0f172a" 
                      stroke="#00f0ff" 
                      strokeWidth="1.5" 
                      transform="rotate(10, 12, -65)" 
                    />

                    {/* Real Anime Palm placed directly on Wrist (14, -75) */}
                    <g id="hand-and-palm">
                      {/* Palm */}
                      <ellipse cx="14" cy="-75" rx="9" ry="8" fill="url(#skinGrad)" stroke="#e2b7a5" strokeWidth="1" />
                      
                      {/* 5 Normal Human Fingers */}
                      {/* Thumb */}
                      <path d="M 7 -72 Q 1 -77 4 -83 Q 8 -83 10 -76" fill="url(#skinGrad)" stroke="#e2b7a5" strokeWidth="1" />
                      {/* Index Finger */}
                      <path d="M 9 -81 Q 10 -91 14 -90 Q 17 -89 15 -80" fill="url(#skinGrad)" stroke="#e2b7a5" strokeWidth="1" />
                      {/* Middle Finger */}
                      <path d="M 15 -80 Q 18 -93 22 -92 Q 24 -90 21 -79" fill="url(#skinGrad)" stroke="#e2b7a5" strokeWidth="1" />
                      {/* Ring Finger */}
                      <path d="M 20 -78 Q 24 -89 28 -88 Q 29 -86 25 -77" fill="url(#skinGrad)" stroke="#e2b7a5" strokeWidth="1" />
                      {/* Pinky Finger */}
                      <path d="M 24 -75 Q 29 -84 32 -82 Q 32 -80 26 -73" fill="url(#skinGrad)" stroke="#e2b7a5" strokeWidth="1" />

                      {/* Holographic Wave Hello Pulses radiating directly from palm center (17, -82) */}
                      <circle cx="17" cy="-82" r="16" fill="none" stroke="#00f0ff" strokeWidth="1.8">
                        <animate attributeName="r" values="8; 24; 8" dur="1.15s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.9; 0; 0.9" dur="1.15s" repeatCount="indefinite" />
                      </circle>
                      <circle cx="17" cy="-82" r="22" fill="none" stroke="#a855f7" strokeWidth="1.2">
                        <animate attributeName="r" values="12; 28; 12" dur="1.15s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.7; 0; 0.7" dur="1.15s" repeatCount="indefinite" />
                      </circle>

                      {/* Sparkle star on top of waving fingers */}
                      <g transform="translate(21, -100) scale(0.6)">
                        <path d="M 0 -12 Q 2 -2 12 0 Q 2 2 0 12 Q -2 2 -12 0 Q -2 -2 0 -12 Z" fill="#fcee0a" />
                      </g>
                    </g>
                  </g>
                </g>
              </svg>

              {/* Movable Drag Hint Pill */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/85 border border-cyber-blue/60 text-[9px] font-orbitron text-cyber-blue flex items-center gap-1 shadow-[0_0_12px_rgba(0,240,255,0.5)] whitespace-nowrap">
                <Move size={9} className="animate-pulse" />
                <span>DRAG ME</span>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          /* Minimized Floating Cyber Badge - Click to restore */
          <motion.button
            key="companion-minimized"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsMinimized(false);
              try { playClick?.(); } catch {}
            }}
            onMouseEnter={() => playHover?.()}
            className="flex items-center gap-2 p-2 rounded-full glass-panel border border-cyber-blue/70 shadow-[0_0_20px_rgba(0,240,255,0.4)] bg-cyber-dark/90 backdrop-blur-md cursor-pointer pointer-events-auto group"
            title="Open Assistant"
          >
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-cyber-blue shadow-[0_0_10px_#00f0ff] bg-slate-900 flex items-center justify-center">
              <Sparkles size={18} className="text-cyber-blue animate-spin" style={{ animationDuration: '4s' }} />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-cyber-blue border border-black animate-pulse"></span>
            </div>
            <div className="pr-2 flex items-center gap-1 text-[11px] font-orbitron text-white">
              <span className="text-cyber-blue">A.I.D.A</span>
              <ChevronUp size={14} className="text-gray-400 group-hover:text-cyber-blue transition-colors" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimeCompanion;
