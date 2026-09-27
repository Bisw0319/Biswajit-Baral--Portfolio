import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import CustomCursor from './components/CustomCursor';
import ParticleBackground from './components/ParticleBackground';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Certificates from './components/Certificates';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import EasterEgg from './components/EasterEgg';
import SettingsPanel from './components/SettingsPanel';
import { SettingsProvider } from './context/SettingsContext';
import { getHomeData } from './utils/portfolioStorage';

const LoadingScreen = ({ onComplete }) => {
  return (
    <motion.div 
      className="fixed inset-0 z-[9999] bg-cyber-dark flex flex-col items-center justify-center"
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
    >
      <div className="w-64 h-2 bg-cyber-dark rounded-full overflow-hidden border border-white/10 relative">
        <motion.div 
          className="h-full bg-cyber-blue shadow-[0_0_15px_#00f0ff]"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, ease: "easeInOut" }}
          onAnimationComplete={onComplete}
        />
      </div>
      <motion.div 
        className="mt-6 text-cyber-blue font-orbitron text-sm tracking-widest uppercase flex items-center gap-2"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <span className="animate-spin inline-block">|</span> INITIALIZING SYSTEM
      </motion.div>
    </motion.div>
  );
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    className="w-full"
  >
    {children}
  </motion.div>
);

const SkillsPage = () => (
  <div className="w-full">
    <Skills />
  </div>
);

function App() {
  const [loading, setLoading] = useState(true);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Detect touch device
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();

    // Audio unlock for mobile
    const unlockAudio = () => {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const context = new AudioContext();
        context.resume();
      }
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  // Real-time Title Bar Icon (Favicon) Synchronization with Profile Picture
  useEffect(() => {
    const syncFavicon = () => {
      try {
        const home = getHomeData();
        const iconSrc = home.profilePic || '/favicon.png';
        const link = document.getElementById('app-favicon') || document.querySelector("link[rel*='icon']");
        if (link) {
          link.href = iconSrc;
        }
        const appleIcon = document.getElementById('app-apple-icon') || document.querySelector("link[rel='apple-touch-icon']");
        if (appleIcon) {
          appleIcon.href = iconSrc;
        }
      } catch (err) {}
    };

    syncFavicon();
    window.addEventListener('portfolio_data_updated', syncFavicon);
    return () => window.removeEventListener('portfolio_data_updated', syncFavicon);
  }, []);

  return (
    <SettingsProvider>
      <div className="relative min-h-screen bg-cyber-dark text-white selection:bg-cyber-blue selection:text-black transition-colors duration-500">
        <AnimatePresence>
          {loading && <LoadingScreen onComplete={() => setLoading(false)} />}
        </AnimatePresence>

        {!isTouchDevice && <CustomCursor />}
        <ScrollToTop />
        
        {!loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            {/* Background Layer */}
            <div className="fixed inset-0 z-0">
              <ParticleBackground />
              <div className="absolute inset-0 bg-cyber-dark/80 mix-blend-multiply pointer-events-none"></div>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyber-blue/5 via-transparent to-transparent pointer-events-none"></div>
            </div>

            {/* Content Layer */}
            <div className="relative z-10 flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <AnimatePresence mode="wait">
                  <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<PageWrapper><Hero /></PageWrapper>} />
                    <Route path="/home" element={<Navigate to="/" replace />} />
                    <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
                    <Route path="/skills" element={<PageWrapper><SkillsPage /></PageWrapper>} />
                    <Route path="/certificates" element={<PageWrapper><Certificates /></PageWrapper>} />
                    <Route path="/projects" element={<PageWrapper><Projects /></PageWrapper>} />
                    <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AnimatePresence>
              </main>
              <Footer />
              <EasterEgg />
              <SettingsPanel />
            </div>
          </motion.div>
        )}
      </div>
    </SettingsProvider>
  );
}

export default App;
