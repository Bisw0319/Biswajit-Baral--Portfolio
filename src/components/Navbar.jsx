import React, { useState, useEffect, useRef, useContext } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Home, 
  User, 
  Cpu, 
  Award, 
  FolderPlus, 
  Mail 
} from 'lucide-react';
import { SettingsContext } from '../context/SettingsContext';

const NAV_LINKS = [
  { name: 'Home', path: '/', icon: Home, short: 'HOME' },
  { name: 'About', path: '/about', icon: User, short: 'ABOUT' },
  { name: 'Skills', path: '/skills', icon: Cpu, short: 'SKILLS' },
  { name: 'Certificates', path: '/certificates', icon: Award, short: 'CERTS' },
  { name: 'Projects', path: '/projects', icon: FolderPlus, short: 'PROJECTS' },
  { name: 'Contact', path: '/contact', icon: Mail, short: 'CONTACT' },
];

const AUTO_SLIDE_DURATION_MS = 8000; // 8 seconds per section on auto-tour

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAutoSlide, setIsAutoSlide] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);
  const [isPausedByInteraction, setIsPausedByInteraction] = useState(false);

  const { playHover, playClick } = useContext(SettingsContext);
  const location = useLocation();
  const navigate = useNavigate();

  const stripRef = useRef(null);
  const interactionTimerRef = useRef(null);
  const autoSlideIntervalRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  // 1. Detect Scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isLinkActive = (path) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    return location.pathname.startsWith(path);
  };

  const getCurrentIndex = () => {
    const idx = NAV_LINKS.findIndex(l => isLinkActive(l.path));
    return idx === -1 ? 0 : idx;
  };

  const navigateNext = () => {
    try { playClick?.(); } catch {}
    const current = getCurrentIndex();
    const next = (current + 1) % NAV_LINKS.length;
    navigate(NAV_LINKS[next].path);
    setSlideProgress(0);
  };

  const navigatePrev = () => {
    try { playClick?.(); } catch {}
    const current = getCurrentIndex();
    const prev = (current - 1 + NAV_LINKS.length) % NAV_LINKS.length;
    navigate(NAV_LINKS[prev].path);
    setSlideProgress(0);
  };

  // 2. Auto-scroll mobile pill strip to active item
  useEffect(() => {
    if (!stripRef.current) return;
    const activeBtn = stripRef.current.querySelector('[data-active="true"]');
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [location.pathname]);

  // 3. User Interaction Pause Detector (Smart Pause)
  const triggerInteractionPause = () => {
    setIsPausedByInteraction(true);
    if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
    // Automatically resume auto-tour after 6s of inactivity
    interactionTimerRef.current = setTimeout(() => {
      setIsPausedByInteraction(false);
    }, 6000);
  };

  // 4. Section Auto-Slide Engine
  useEffect(() => {
    if (!isAutoSlide) {
      setSlideProgress(0);
      return;
    }

    const stepMs = 100;
    const increment = (stepMs / AUTO_SLIDE_DURATION_MS) * 100;

    autoSlideIntervalRef.current = setInterval(() => {
      // Don't advance if paused by user interaction or typing
      const activeEl = document.activeElement;
      const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

      if (isPausedByInteraction || isTyping) {
        return;
      }

      setSlideProgress((prev) => {
        if (prev >= 100) {
          navigateNext();
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => {
      if (autoSlideIntervalRef.current) clearInterval(autoSlideIntervalRef.current);
    };
  }, [isAutoSlide, isPausedByInteraction, location.pathname]);

  // 5. Mobile Touch Swipe Gestures
  useEffect(() => {
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
      triggerInteractionPause();
    };

    const handleTouchEnd = (e) => {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      // Ignore if touched inside interactive game canvas or modal
      const target = e.target;
      if (target.closest('canvas') || target.closest('[role="dialog"]') || target.closest('input') || target.closest('textarea')) {
        return;
      }

      // Horizontal swipe threshold: > 60px horizontal, < 50px vertical, within 450ms
      if (Math.abs(deltaX) > 60 && Math.abs(deltaY) < 50 && deltaTime < 450) {
        if (deltaX < 0) {
          navigateNext(); // Swipe Left -> Next
        } else {
          navigatePrev(); // Swipe Right -> Prev
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [location.pathname]);

  // 6. TV, Projector & Desktop Keyboard Navigation (Arrow Keys & Number Keys 1-6)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigatePrev();
      } else if (e.key >= '1' && e.key <= '6') {
        const targetIdx = parseInt(e.key, 10) - 1;
        if (NAV_LINKS[targetIdx]) {
          e.preventDefault();
          try { playClick?.(); } catch {}
          navigate(NAV_LINKS[targetIdx].path);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [location.pathname]);

  return (
    <>
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? 'glass-panel py-2.5 shadow-[0_4px_25px_rgba(0,0,0,0.8)] border-b border-cyber-blue/20' 
            : 'bg-black/40 backdrop-blur-md py-3.5 border-b border-white/5'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 md:px-12 flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link 
              to="/" 
              className="cursor-pointer group flex items-center gap-1.5" 
              onMouseEnter={playHover} 
              onClick={playClick}
            >
              <div className="text-xl sm:text-2xl font-orbitron font-bold text-white tracking-widest group-hover:neon-text-blue transition-all">
                <span className="text-cyber-blue">&lt;</span>
                SYS
                <span className="text-cyber-blue">/&gt;</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links (Spacious for TV, Projectors & Desktops) */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {NAV_LINKS.map((link, idx) => {
              const active = isLinkActive(link.path);
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onMouseEnter={playHover}
                  onClick={playClick}
                  className={`font-orbitron text-xs lg:text-sm uppercase tracking-widest cursor-pointer transition-all relative py-2 flex items-center gap-1.5 ${
                    active 
                      ? 'text-cyber-blue font-bold drop-shadow-[0_0_10px_var(--color-cyber-blue)]' 
                      : 'text-gray-300 hover:text-cyber-blue'
                  }`}
                >
                  <Icon size={14} className={active ? 'text-cyber-blue animate-pulse' : 'text-gray-400'} />
                  <span>{link.name}</span>
                  <span 
                    className={`absolute bottom-0 left-0 h-0.5 bg-cyber-blue transition-all duration-300 ${
                      active ? 'w-full neon-border-blue' : 'w-0 hover:w-full'
                    }`} 
                  />
                </NavLink>
              );
            })}

          </div>

          {/* Mobile Right Controls: Auto-Tour Toggle ONLY on Mobile (No 3-bar hamburger needed) */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => {
                try { playClick?.(); } catch {}
                setIsAutoSlide(!isAutoSlide);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-orbitron font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isAutoSlide 
                  ? 'bg-cyber-blue text-black border-white shadow-[0_0_12px_#00f0ff]' 
                  : 'bg-black/70 text-gray-300 border-white/20 hover:border-cyber-blue/50'
              }`}
              title="Toggle automatic presentation tour between sections"
            >
              {isAutoSlide ? (
                <>
                  <Pause size={12} />
                  <span>TOUR ON</span>
                </>
              ) : (
                <>
                  <Play size={12} fill="currentColor" />
                  <span>AUTO-TOUR</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* MOBILE AUTO-SLIDE NAVIGATION PILL STRIP (Home, About, Skills...)  */}
        {/* ================================================================= */}
        <div className="md:hidden w-full mt-2 pt-1 border-t border-white/5 relative overflow-hidden">
          <div 
            ref={stripRef}
            className="flex items-center gap-1.5 px-3 py-1 overflow-x-auto no-scrollbar scroll-smooth"
          >
            {NAV_LINKS.map((link) => {
              const active = isLinkActive(link.path);
              const Icon = link.icon;

              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  data-active={active ? "true" : "false"}
                  onClick={() => {
                    try { playClick?.(); } catch {}
                    setSlideProgress(0);
                    triggerInteractionPause();
                  }}
                  className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-orbitron uppercase tracking-wider transition-all cursor-pointer ${
                    active
                      ? 'bg-cyber-blue text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.6)] border border-white'
                      : 'bg-black/50 text-gray-300 border border-white/10 hover:border-cyber-blue/40'
                  }`}
                >
                  <Icon size={12} className={active ? 'text-black' : 'text-cyber-blue'} />
                  <span>{link.short}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Glowing Auto-Slide Progress Bar on Mobile */}
          {isAutoSlide && (
            <div className="w-full h-0.5 bg-black/50 overflow-hidden relative mt-1">
              <div 
                className="h-full bg-cyber-blue shadow-[0_0_8px_#00f0ff] transition-all duration-100 ease-linear"
                style={{ width: `${slideProgress}%` }}
              />
            </div>
          )}
        </div>

      </nav>

      {/* ================================================================= */}
      {/* MOBILE ONE-THUMB QUICK NAVIGATION FLOATING BUTTONS (< PREV / NEXT >) */}
      {/* ================================================================= */}
      <div className="md:hidden fixed bottom-5 left-4 z-40 pointer-events-auto">
        <button
          onClick={navigatePrev}
          aria-label="Previous Section"
          className="p-2.5 rounded-full glass-panel text-cyber-blue hover:text-white border border-cyber-blue/40 shadow-[0_0_15px_rgba(0,240,255,0.3)] active:scale-90 transition-all cursor-pointer bg-black/70 backdrop-blur-md"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="md:hidden fixed bottom-5 right-4 z-40 pointer-events-auto">
        <button
          onClick={navigateNext}
          aria-label="Next Section"
          className="p-2.5 rounded-full glass-panel text-cyber-blue hover:text-white border border-cyber-blue/40 shadow-[0_0_15px_rgba(0,240,255,0.3)] active:scale-90 transition-all cursor-pointer bg-black/70 backdrop-blur-md"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </>
  );
};

export default Navbar;
