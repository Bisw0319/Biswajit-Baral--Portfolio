import React, { useState, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  ShieldCheck, 
  Maximize2, 
  X, 
  Copy, 
  Check, 
  LayoutGrid, 
  Layers,
  MoveHorizontal,
  Play,
  Pause
} from 'lucide-react';
import { SettingsContext } from '../context/SettingsContext';
import { getEffectiveCertificates } from '../utils/portfolioStorage';

const defaultCertificates = [
  {
    id: "dcsc-pentest",
    title: "Web Application Penetration Testing (DCSC)",
    subtitle: "Drop Certified Security Course",
    issuer: "TDO Tech Education Pvt. Ltd.",
    certNumber: "DCSC-BBBB0425",
    date: "21-04-2026",
    validity: "Valid upto 21-04-2029",
    category: "Penetration Testing",
    glowColor: "#00f0ff", // cyber-blue
    image: "/certificates/cert-tdo-security.png",
    url: "#",
    verified: true,
    badge: "ISO 9001:2015",
    description: "Successfully completed all rigorous criteria and requirements for Web Application Penetration Testing through formal examination administered by TDO Tech Education."
  },
  {
    id: "tdo-internship",
    title: "Cybersecurity Internship",
    subtitle: "Practical Industry Security Program",
    issuer: "TDO Tech Education Pvt. Ltd.",
    certNumber: "DCSC-BBBB0426",
    date: "21-04-2026",
    validity: "Completed",
    category: "Security Internship",
    glowColor: "#fcee0a", // cyber-yellow
    image: "/certificates/cert-tdo-internship.png",
    url: "#",
    verified: true,
    badge: "Industry Internship",
    description: "Awarded in recognition of outstanding performance, technical diligence, and practical contributions during the Cybersecurity Internship program."
  },
  {
    id: "ibm-cybersecurity",
    title: "Cybersecurity Case Studies and Capstone Project",
    subtitle: "IBM Skills Network",
    issuer: "IBM & Coursera",
    certNumber: "B47MQ4OOFSOY",
    date: "May 5, 2025",
    validity: "Permanent",
    category: "Security Capstone",
    glowColor: "#ff003c", // cyber-red
    image: "/certificates/cert-ibm-cybersecurity.png",
    url: "https://coursera.org/verify/B47MQ4OOFSOY",
    verified: true,
    badge: "IBM Capstone",
    description: "Deep-dive analysis of real-world cybersecurity breaches, threat modeling, defense strategies, incident response, and hands-on capstone project execution."
  },
  {
    id: "ibm-genai",
    title: "Generative AI: Impact, Considerations, and Ethical Issues",
    subtitle: "IBM Skills Network",
    issuer: "IBM & Coursera",
    certNumber: "5ROD03A2UU7X",
    date: "Apr 29, 2025",
    validity: "Permanent",
    category: "AI & Ethics",
    glowColor: "#38bdf8", // bright sky blue
    image: "/certificates/cert-ibm-genai.png",
    url: "https://coursera.org/verify/5ROD03A2UU7X",
    verified: true,
    badge: "IBM Authorized",
    description: "Comprehensive study into foundational Generative AI principles, real-world societal impact, ethical governance, risk mitigation, and algorithmic accountability."
  },
  {
    id: "coursera-resume",
    title: "Build a Professional Resume using Canva",
    subtitle: "Coursera Project Network",
    issuer: "Coursera Project Network",
    certNumber: "3QO2VOOL2HD5",
    date: "Apr 16, 2025",
    validity: "Permanent",
    category: "Professional Skills",
    glowColor: "#a855f7", // cyber-purple
    image: "/certificates/cert-coursera-resume.png",
    url: "https://coursera.org/verify/3QO2VOOL2HD5",
    verified: true,
    badge: "Coursera Project",
    description: "Applied project covering modern layout design, personal branding, and high-impact technical resume presentation principles."
  }
];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.55 },
      opacity: { duration: 0.35, ease: "easeOut" }
    }
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    transition: {
      x: { type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.48 },
      opacity: { duration: 0.25, ease: "easeIn" }
    }
  })
};

const CertificateSlideCard = React.memo(({
  cert,
  isDragging,
  setModalCert,
  copiedId,
  handleCopy,
  playHover,
  playClick
}) => {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center select-none">
      {/* Slide Card: Left Image */}
      <div className="lg:col-span-6 relative flex flex-col items-center">
        <div 
          onClick={() => {
            if (!isDragging) {
              playClick?.();
              setModalCert(cert);
            }
          }}
          onMouseEnter={() => playHover?.()}
          className="w-full relative group rounded-xl overflow-hidden border border-white/20 bg-black/70 shadow-2xl transition-all duration-300 hover:border-cyber-blue/60 cursor-pointer"
          style={{ 
            boxShadow: `0 0 30px ${cert.glowColor || '#00f0ff'}25`,
            transform: 'translateZ(0)'
          }}
        >
          {/* Glowing Neon Accent Corners */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 pointer-events-none z-20 transition-colors" style={{ borderColor: cert.glowColor }}></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 pointer-events-none z-20 transition-colors" style={{ borderColor: cert.glowColor }}></div>

          {/* Image */}
          <img 
            src={cert.image} 
            alt={cert.title}
            draggable="false"
            loading="eager"
            decoding="async"
            className="w-full h-auto object-cover max-h-[340px] md:max-h-[400px] pointer-events-none transition-transform duration-500 group-hover:scale-105"
          />

          {/* Laser Scanline */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-25"></div>

          {/* Hover Overlay with Zoom Icon */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 z-30">
            <div className="p-3.5 rounded-full bg-cyber-blue text-black shadow-[0_0_20px_#00f0ff] transform group-hover:scale-110 transition-transform">
              <Maximize2 size={24} />
            </div>
            <span className="text-white font-orbitron text-xs tracking-widest uppercase font-bold">Inspect Document</span>
            <span className="text-cyber-blue text-[10px] font-mono">Drag to slide &bull; Click to zoom</span>
          </div>
        </div>

        {/* Quick Mobile Expand */}
        <button
          onClick={() => { playClick?.(); setModalCert(cert); }}
          className="mt-3 flex items-center gap-1.5 text-xs text-cyber-blue font-orbitron hover:underline md:hidden cursor-pointer"
        >
          <Maximize2 size={13} />
          <span>Tap to enlarge certificate</span>
        </button>
      </div>

      {/* Slide Card: Right Details */}
      <div className="lg:col-span-6 flex flex-col justify-center space-y-4">
        <div className="flex items-center gap-2">
          <Award size={18} style={{ color: cert.glowColor }} />
          <span className="text-xs font-orbitron tracking-widest uppercase font-semibold" style={{ color: cert.glowColor }}>
            {cert.category}
          </span>
        </div>

        <h3 className="text-2xl md:text-3xl font-orbitron font-bold text-white leading-tight">
          {cert.title}
        </h3>

        <div className="text-cyber-blue font-inter font-medium text-base">
          {cert.issuer}
          {cert.subtitle && (
            <span className="text-gray-400 block text-xs mt-0.5 font-mono">{cert.subtitle}</span>
          )}
        </div>

        <p className="text-gray-300 text-sm leading-relaxed font-inter">
          {cert.description}
        </p>

        {/* Meta Grid */}
        <div className="grid grid-cols-2 gap-3 py-3 border-y border-white/10 text-xs font-mono">
          <div>
            <span className="text-gray-500 block uppercase text-[10px]">Issue Date</span>
            <span className="text-gray-200">{cert.date}</span>
          </div>
          <div>
            <span className="text-gray-500 block uppercase text-[10px]">Validity</span>
            <span className="text-gray-200">{cert.validity}</span>
          </div>
          <div className="col-span-2 flex items-center justify-between bg-black/50 p-2.5 rounded-lg border border-white/10">
            <div>
              <span className="text-gray-500 block uppercase text-[10px]">Credential ID</span>
              <span className="text-cyber-blue font-mono font-bold tracking-wider">{cert.certNumber}</span>
            </div>
            <button
              onClick={() => handleCopy(cert.id, cert.certNumber)}
              onMouseEnter={() => playHover?.()}
              className="p-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Copy Credential ID"
            >
              {copiedId === cert.id ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          {cert.url && cert.url !== "#" && (
            <a
              href={cert.url}
              target="_blank"
              rel="noreferrer"
              onMouseEnter={() => playHover?.()}
              onClick={() => playClick?.()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyber-blue text-black font-orbitron font-bold text-xs uppercase tracking-wider rounded transition-all hover:shadow-[0_0_20px_#00f0ff] hover:scale-105 cursor-pointer"
            >
              <span>Verify Online</span>
              <ExternalLink size={14} />
            </a>
          )}

          <button
            onClick={() => { playClick?.(); setModalCert(cert); }}
            onMouseEnter={() => playHover?.()}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/20 hover:border-cyber-blue text-white hover:text-cyber-blue font-orbitron text-xs uppercase tracking-wider rounded transition-all glass-panel cursor-pointer"
          >
            <Maximize2 size={14} />
            <span>Full Resolution</span>
          </button>
        </div>
      </div>
    </div>
  );
});

const Certificates = () => {
  const [[page, direction], setPage] = useState([0, 0]);
  const [viewMode, setViewMode] = useState('carousel'); // 'carousel' | 'grid'
  const [modalCert, setModalCert] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const context = useContext(SettingsContext);
  const playHover = context?.playHover;
  const playClick = context?.playClick;

  const [allCertificates, setAllCertificates] = useState(() => getEffectiveCertificates());

  // Background Image Preloader: ensures next/prev slide images are immediately decoded in VRAM
  useEffect(() => {
    if (!allCertificates || allCertificates.length === 0) return;
    allCertificates.forEach(cert => {
      if (cert.image) {
        const img = new Image();
        img.src = cert.image;
      }
    });
  }, [allCertificates]);

  useEffect(() => {
    const handleSync = () => {
      setAllCertificates(getEffectiveCertificates());
      // When certificates are updated/added, jump directly to index 0 so new certificate is shown in front
      setPage([0, 0]);
    };
    window.addEventListener('portfolio_data_updated', handleSync);
    return () => window.removeEventListener('portfolio_data_updated', handleSync);
  }, []);

  const totalCerts = allCertificates.length || 1;
  const currentIndex = ((page % totalCerts) + totalCerts) % totalCerts;
  const currentCert = allCertificates[currentIndex] || defaultCertificates[0];

  const prevIdx = (currentIndex - 1 + totalCerts) % totalCerts;
  const nextIdx = (currentIndex + 1) % totalCerts;
  const prevCertItem = allCertificates[prevIdx] || currentCert;
  const nextCertItem = allCertificates[nextIdx] || currentCert;

  const paginate = useCallback((newDirection) => {
    try {
      playClick?.();
    } catch {
      // safe fallback
    }
    setPage(([prevPage]) => [prevPage + newDirection, newDirection]);
  }, [playClick]);

  const jumpTo = useCallback((idx) => {
    if (idx === currentIndex) return;
    try {
      playClick?.();
    } catch {
      // safe fallback
    }
    const dir = idx > currentIndex ? 1 : -1;
    setPage([idx, dir]);
  }, [currentIndex, playClick]);

  const handleCopy = (id, text) => {
    try {
      playClick?.();
    } catch {
      // safe fallback
    }
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Keyboard left/right arrow navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (viewMode !== 'carousel' || modalCert) return;
      if (e.key === 'ArrowRight') {
        paginate(1);
      } else if (e.key === 'ArrowLeft') {
        paginate(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, modalCert, paginate]);

  // Autoplay timer (always on, smoothly pauses on user hover or drag, resets cleanly on page change)
  useEffect(() => {
    if (!isAutoPlay || viewMode !== 'carousel' || modalCert || isHovered || isDragging) return;
    const interval = setInterval(() => {
      setPage(([prevPage]) => [prevPage + 1, 1]);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlay, viewMode, modalCert, isHovered, isDragging, page]);

  return (
    <section id="certificates" className="min-h-screen pt-28 md:pt-32 pb-24 relative z-10 select-none">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-cyber-blue/30 bg-cyber-blue/10 text-cyber-blue text-xs font-orbitron tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <ShieldCheck size={14} className="text-cyber-blue" />
            <span>{allCertificates.length < 10 ? `0${allCertificates.length}` : allCertificates.length} Authenticated Credentials</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold font-orbitron relative block">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue via-white to-cyber-purple">
              System.Credentials
            </span>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-28 h-1 bg-cyber-blue neon-border-blue"></div>
          </h2>

          <p className="text-gray-400 max-w-xl mx-auto mt-6 text-sm font-inter">
            Verified certifications in Cybersecurity, Web Penetration Testing, Generative AI, and Systems Engineering.
          </p>

          {/* View Mode Switcher */}
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              onClick={() => { playClick?.(); setViewMode('carousel'); }}
              onMouseEnter={() => playHover?.()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-orbitron tracking-wider uppercase transition-all ${
                viewMode === 'carousel' 
                  ? 'bg-cyber-blue text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.5)]' 
                  : 'glass-panel text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              <Layers size={14} />
              <span>Slideable Showcase</span>
            </button>
            <button
              onClick={() => { playClick?.(); setViewMode('grid'); }}
              onMouseEnter={() => playHover?.()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-orbitron tracking-wider uppercase transition-all ${
                viewMode === 'grid' 
                  ? 'bg-cyber-blue text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.5)]' 
                  : 'glass-panel text-gray-400 hover:text-white border border-white/10'
              }`}
            >
              <LayoutGrid size={14} />
              <span>Grid Matrix</span>
            </button>
          </div>
        </motion.div>

        {/* 1. SLIDEABLE CAROUSEL SHOWCASE */}
        {viewMode === 'carousel' && (
          <div className="relative">

            {/* Gesture Hint & Controls Bar */}
            <div className="flex justify-between items-center px-4 py-2 mb-4 text-xs font-mono text-gray-400">
              <div className="flex items-center gap-2">
                <MoveHorizontal size={14} className="text-cyber-blue animate-pulse" />
                <span className="text-gray-300 font-orbitron text-[11px] tracking-wide">
                  CLICK NEXT / PREV OR DRAG CARDS TO SLIDE
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { playClick?.(); setIsAutoPlay(!isAutoPlay); }}
                  onMouseEnter={() => playHover?.()}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-orbitron transition-all ${
                    isAutoPlay 
                      ? 'border-cyber-blue text-cyber-blue bg-cyber-blue/10 shadow-[0_0_10px_rgba(0,240,255,0.3)]' 
                      : 'border-white/10 text-gray-400 hover:text-white'
                  }`}
                  title="Toggle Auto Slide"
                >
                  {isAutoPlay ? <Pause size={12} /> : <Play size={12} />}
                  <span>{isAutoPlay ? 'Auto-Slide ON' : 'Auto-Slide'}</span>
                </button>
              </div>
            </div>

            {/* Stage */}
            <div className="relative overflow-hidden py-2 px-1">
              
              {/* Outer Slider Wrapper */}
              <div 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="glass-panel border border-white/10 rounded-2xl overflow-hidden relative shadow-[0_15px_50px_rgba(0,0,0,0.85)]"
              >
                
                {/* Top Cyber Status Bar */}
                <div className="flex justify-between items-center px-6 py-3 border-b border-white/10 bg-black/50 text-xs font-mono text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: currentCert.glowColor }}></span>
                    <span className="text-white font-orbitron tracking-wider">CREDENTIAL_0{currentIndex + 1} // {totalCerts < 10 ? `0${totalCerts}` : totalCerts}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider" style={{ backgroundColor: `${currentCert.glowColor}25`, color: currentCert.glowColor, border: `1px solid ${currentCert.glowColor}40` }}>
                      {currentCert.badge}
                    </span>
                    <span className="text-green-400 font-mono hidden sm:inline">AUTHENTICATED</span>
                  </div>
                </div>

                {/* Coverflow / Slide Track Area */}
                <div className="relative p-4 md:p-8 min-h-[420px] flex items-center justify-center">

                  {/* Left Floating Peek Card (Clickable to slide prev) */}
                  <div 
                    onClick={() => paginate(-1)}
                    onMouseEnter={() => playHover?.()}
                    className="hidden xl:block absolute left-[-60px] top-1/2 -translate-y-1/2 w-[280px] opacity-35 hover:opacity-75 hover:scale-95 transition-all duration-300 cursor-pointer z-0 -rotate-3 select-none pointer-events-auto"
                    title={`Previous: ${prevCertItem.title}`}
                  >
                    <div className="rounded-xl overflow-hidden border border-white/10 bg-black/80 p-2 shadow-2xl">
                      <img src={prevCertItem.image} alt={prevCertItem.title} className="w-full h-40 object-cover rounded opacity-80" />
                      <p className="text-[11px] font-orbitron text-gray-400 mt-2 truncate text-center">{prevCertItem.title}</p>
                    </div>
                  </div>

                  {/* Right Floating Peek Card (Clickable to slide next) */}
                  <div 
                    onClick={() => paginate(1)}
                    onMouseEnter={() => playHover?.()}
                    className="hidden xl:block absolute right-[-60px] top-1/2 -translate-y-1/2 w-[280px] opacity-35 hover:opacity-75 hover:scale-95 transition-all duration-300 cursor-pointer z-0 rotate-3 select-none pointer-events-auto"
                    title={`Next: ${nextCertItem.title}`}
                  >
                    <div className="rounded-xl overflow-hidden border border-white/10 bg-black/80 p-2 shadow-2xl">
                      <img src={nextCertItem.image} alt={nextCertItem.title} className="w-full h-40 object-cover rounded opacity-80" />
                      <p className="text-[11px] font-orbitron text-gray-400 mt-2 truncate text-center">{nextCertItem.title}</p>
                    </div>
                  </div>

                  {/* Previous Slide Button */}
                  <button 
                    onClick={() => paginate(-1)}
                    onMouseEnter={() => playHover?.()}
                    className="absolute left-2 md:left-5 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-cyber-dark/95 border border-white/20 text-white hover:text-cyber-blue hover:border-cyber-blue hover:scale-110 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all group cursor-pointer"
                    aria-label="Previous Certificate"
                  >
                    <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
                  </button>

                  {/* Next Slide Button */}
                  <button 
                    onClick={() => paginate(1)}
                    onMouseEnter={() => playHover?.()}
                    className="absolute right-2 md:right-5 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-cyber-dark/95 border border-white/20 text-white hover:text-cyber-blue hover:border-cyber-blue hover:scale-110 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all group cursor-pointer"
                    aria-label="Next Certificate"
                  >
                    <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  {/* Center Interactive Slide Container */}
                  <div className="w-full max-w-4xl relative overflow-hidden px-4 sm:px-8 md:px-12 py-2 min-h-[580px] sm:min-h-[520px] lg:min-h-[460px] flex items-center justify-center">
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                      <motion.div
                        key={page}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragStart={() => setIsDragging(true)}
                        onDragEnd={(e, info) => {
                          setTimeout(() => setIsDragging(false), 50);
                          const threshold = 35;
                          const velocity = 0.2;
                          if (info.offset.x < -threshold || info.velocity.x < -velocity) {
                            paginate(1);
                          } else if (info.offset.x > threshold || info.velocity.x > velocity) {
                            paginate(-1);
                          }
                        }}
                        style={{ willChange: 'transform, opacity' }}
                        className="w-full cursor-grab active:cursor-grabbing touch-pan-y"
                      >
                        <CertificateSlideCard
                          cert={allCertificates[((page % totalCerts) + totalCerts) % totalCerts] || defaultCertificates[0]}
                          isDragging={isDragging}
                          setModalCert={setModalCert}
                          copiedId={copiedId}
                          handleCopy={handleCopy}
                          playHover={playHover}
                          playClick={playClick}
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>

                </div>

                {/* Bottom Navigation & Indicator Track */}
                <div className="flex justify-between items-center px-6 py-4 border-t border-white/10 bg-black/40">
                  <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                    <span className="text-cyber-blue font-bold">0{currentIndex + 1}</span>
                    <span>/</span>
                    <span>{totalCerts < 10 ? `0${totalCerts}` : totalCerts}</span>
                  </div>

                  {/* Interactive Dot Indicators */}
                  <div className="flex gap-2.5 items-center">
                    {allCertificates.map((cert, idx) => (
                      <button
                        key={cert.id}
                        onClick={() => jumpTo(idx)}
                        onMouseEnter={() => playHover?.()}
                        className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                          idx === currentIndex 
                            ? 'w-9 bg-cyber-blue shadow-[0_0_12px_#00f0ff]' 
                            : 'w-2.5 bg-white/20 hover:bg-white/50'
                        }`}
                        aria-label={`Jump to certificate ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <div className="text-[11px] font-mono text-gray-400 hidden sm:block">
                    USE ARROWS &bull; SWIPE TO SLIDE
                  </div>
                </div>

              </div>
            </div>

            {/* Thumbnail Navigation Strip */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 sm:gap-3 mt-6">
              {allCertificates.map((cert, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <div
                    key={cert.id}
                    onClick={() => jumpTo(idx)}
                    onMouseEnter={() => playHover?.()}
                    className={`cursor-pointer rounded-lg overflow-hidden border transition-all p-1.5 glass-panel ${
                      isActive 
                        ? 'border-cyber-blue shadow-[0_0_15px_rgba(0,240,255,0.5)] scale-105 bg-cyber-blue/10' 
                        : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                    }`}
                  >
                    <img 
                      src={cert.image} 
                      alt={cert.title}
                      className="w-full h-14 md:h-20 object-cover rounded pointer-events-none"
                    />
                    <div className="text-[10px] font-orbitron truncate text-gray-300 mt-1 text-center hidden md:block">
                      {cert.badge}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. GRID MATRIX VIEW */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCertificates.map((cert) => (
              <motion.div
                key={cert.id}
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ duration: 0.3 }}
                className="glass-panel border border-white/10 rounded-xl overflow-hidden flex flex-col justify-between group hover:border-cyber-blue/50 transition-all duration-300 shadow-lg"
              >
                {/* Image preview with click to zoom */}
                <div 
                  onClick={() => { playClick?.(); setModalCert(cert); }}
                  onMouseEnter={() => playHover?.()}
                  className="relative cursor-pointer overflow-hidden bg-black/40 aspect-[4/3] flex items-center justify-center"
                >
                  <img 
                    src={cert.image} 
                    alt={cert.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="p-2 rounded-full bg-cyber-blue text-black shadow-[0_0_10px_#00f0ff]">
                      <Maximize2 size={18} />
                    </span>
                    <span className="text-white text-xs font-orbitron uppercase">Inspect</span>
                  </div>
                  <span 
                    className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                    style={{ backgroundColor: `${cert.glowColor}30`, color: cert.glowColor, border: `1px solid ${cert.glowColor}60` }}
                  >
                    {cert.badge}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
                  <div>
                    <span className="text-[11px] font-orbitron tracking-wider uppercase block mb-1" style={{ color: cert.glowColor }}>
                      {cert.category}
                    </span>
                    <h4 className="text-lg font-orbitron font-bold text-white group-hover:text-cyber-blue transition-colors line-clamp-2">
                      {cert.title}
                    </h4>
                    <p className="text-gray-400 text-xs font-inter mt-1">
                      {cert.issuer}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-gray-400">
                    <span>{cert.date}</span>
                    {cert.url !== "#" ? (
                      <a 
                        href={cert.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        onMouseEnter={() => playHover?.()}
                        onClick={() => playClick?.()}
                        className="text-cyber-blue hover:underline flex items-center gap-1 font-orbitron text-[11px]"
                      >
                        <span>Verify</span>
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-green-400 font-mono text-[11px]">VALIDATED</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>

      {/* 3. LIGHTBOX FULL RESOLUTION INSPECT MODAL */}
      <AnimatePresence>
        {modalCert && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-md">
            {/* Modal Backdrop Click */}
            <div 
              className="absolute inset-0 cursor-pointer"
              onClick={() => { playClick?.(); setModalCert(null); }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-5xl w-full max-h-[92vh] glass-panel border border-cyber-blue/40 rounded-2xl overflow-hidden flex flex-col z-10 shadow-[0_0_50px_rgba(0,240,255,0.3)] bg-cyber-dark/95"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-black/50">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={20} className="text-cyber-blue" />
                  <div>
                    <h4 className="text-sm md:text-base font-orbitron font-bold text-white truncate max-w-md">
                      {modalCert.title}
                    </h4>
                    <span className="text-xs text-gray-400 font-mono">
                      ID: {modalCert.certNumber} // {modalCert.issuer}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {modalCert.url !== "#" && (
                    <a
                      href={modalCert.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-cyber-blue/10 border border-cyber-blue text-cyber-blue text-xs font-orbitron rounded hover:bg-cyber-blue hover:text-black transition-all"
                    >
                      <span>Verify Authenticity</span>
                      <ExternalLink size={13} />
                    </a>
                  )}
                  <button
                    onClick={() => { playClick?.(); setModalCert(null); }}
                    className="p-2 text-gray-400 hover:text-cyber-red transition-colors rounded-lg hover:bg-white/5 cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X size={22} />
                  </button>
                </div>
              </div>

              {/* Modal Image Viewer */}
              <div className="p-4 md:p-8 overflow-auto flex items-center justify-center flex-grow bg-black/40">
                <img 
                  src={modalCert.image} 
                  alt={modalCert.title} 
                  className="max-h-[72vh] w-auto object-contain rounded-lg shadow-2xl border border-white/10"
                />
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 border-t border-white/10 bg-black/50 flex flex-wrap justify-between items-center text-xs font-mono text-gray-400 gap-2">
                <div>
                  <span className="text-gray-500">Issued: </span>
                  <span className="text-white">{modalCert.date}</span>
                  <span className="mx-2">|</span>
                  <span className="text-gray-500">Status: </span>
                  <span className="text-green-400 font-bold">VERIFIED AUTHENTIC</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(modalCert.id, modalCert.certNumber)}
                    className="flex items-center gap-1 text-cyber-blue hover:underline cursor-pointer"
                  >
                    {copiedId === modalCert.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    <span>{copiedId === modalCert.id ? 'Copied ID' : 'Copy Credential ID'}</span>
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default Certificates;
