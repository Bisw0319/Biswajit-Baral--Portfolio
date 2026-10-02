import { Link } from 'react-router-dom';
import { Terminal, Sparkles } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-cyber-blue/20 bg-cyber-dark/80 backdrop-blur-md pt-12 pb-6 overflow-hidden">
      {/* Decorative top line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-blue to-transparent opacity-50"></div>
      
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          
          <button 
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open_admin_portal'))}
            className="flex items-center gap-2 group cursor-pointer bg-transparent border-0 p-0 text-left"
            title="Open System Administrator Portal"
            aria-label="Open System Administrator Portal"
          >
            <Terminal className="text-cyber-blue group-hover:text-cyber-yellow transition-colors" size={24} />
            <span className="font-orbitron font-bold tracking-widest text-lg group-hover:neon-text-blue transition-all">
              SYS_ADMIN
            </span>
          </button>
          
          <div className="flex gap-6">
            <Link to="/contact" className="text-sm font-inter text-gray-400 hover:text-cyber-blue transition-colors uppercase tracking-wider">
              Transmission
            </Link>
            <Link to="/skills" className="text-sm font-inter text-gray-400 hover:text-cyber-blue transition-colors uppercase tracking-wider">
              Network
            </Link>
            <Link to="/projects" className="text-sm font-inter text-gray-400 hover:text-cyber-blue transition-colors uppercase tracking-wider">
              Protocol
            </Link>
          </div>
        </div>
        
        {/* Bottom Bar: Left (Copyright + Crafted by Biswas badge) and Right (CONNECTION_SECURE) */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <p className="text-gray-400 font-inter text-xs sm:text-sm flex items-center gap-1.5">
              © {currentYear} <span className="text-cyber-blue font-orbitron font-semibold">Biswajit Baral</span>. All rights reserved.
            </p>

            {/* Crafted by Biswas Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyber-blue/10 border border-cyber-blue/30 text-xs font-inter text-gray-200 shadow-[0_0_12px_rgba(0,240,255,0.15)] hover:border-cyber-blue/60 transition-all select-none">
              <span className="text-gray-300">Crafted by</span>
              <span className="font-bold text-cyber-blue font-orbitron tracking-wide">Biswas</span>
              <Sparkles size={13} className="text-cyber-blue animate-pulse" />
            </div>
          </div>

          {/* Secure Uplink Indicator on the Right */}
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-black/60 px-3.5 py-1.5 rounded-lg border border-white/10 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>
            <span className="tracking-wider text-[11px] sm:text-xs">
              CONNECTION_SECURE // PORT_8080 // UPLINK_ESTABLISHED
            </span>
          </div>
        </div>
      </div>
      
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-24 bg-cyber-blue/5 blur-[100px] pointer-events-none rounded-full"></div>
    </footer>
  );
};

export default Footer;
