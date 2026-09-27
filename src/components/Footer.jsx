import React from 'react';
import { Terminal } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-cyber-blue/20 bg-cyber-dark/80 backdrop-blur-md pt-12 pb-6 overflow-hidden">
      {/* Decorative top line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-blue to-transparent opacity-50"></div>
      
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          
          <div className="flex items-center gap-2 group cursor-pointer">
            <Terminal className="text-cyber-blue group-hover:text-cyber-yellow transition-colors" size={24} />
            <span className="font-orbitron font-bold tracking-widest text-lg group-hover:neon-text-blue transition-all">
              SYS_ADMIN
            </span>
          </div>
          
          <div className="flex gap-6">
            <a href="#" className="text-sm font-inter text-gray-500 hover:text-cyber-blue transition-colors uppercase tracking-wider">
              Transmission
            </a>
            <a href="#" className="text-sm font-inter text-gray-500 hover:text-cyber-blue transition-colors uppercase tracking-wider">
              Network
            </a>
            <a href="#" className="text-sm font-inter text-gray-500 hover:text-cyber-blue transition-colors uppercase tracking-wider">
              Protocol
            </a>
          </div>
        </div>
        
        <div className="text-center border-t border-white/5 pt-6 flex flex-col items-center justify-center">
          <p className="text-gray-500 font-inter text-sm flex items-center gap-2">
            © {currentYear} <span className="text-cyber-blue font-orbitron">Biswajit Baral</span>. All rights reserved.
          </p>
          <div className="mt-2 text-xs text-gray-600 font-mono">
            CONNECTION_SECURE // PORT_8080 // UPLINK_ESTABLISHED
          </div>
        </div>
      </div>
      
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-24 bg-cyber-blue/5 blur-[100px] pointer-events-none rounded-full"></div>
    </footer>
  );
};

export default Footer;
