import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getSkillsData } from '../utils/portfolioStorage';
import CyberArcadeStation from './CyberArcadeStation';
import { Gamepad2 } from 'lucide-react';

const Skills = () => {
  const [skillCategories, setSkillCategories] = useState(getSkillsData());

  useEffect(() => {
    const handleUpdate = () => {
      setSkillCategories(getSkillsData());
    };
    window.addEventListener('portfolio_data_updated', handleUpdate);
    return () => window.removeEventListener('portfolio_data_updated', handleUpdate);
  }, []);

  return (
    <section id="skills" className="min-h-screen pt-28 md:pt-32 pb-24 relative z-10">
      <div className="container mx-auto px-6">
        
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-orbitron inline-block relative">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-white">
              Tech.Stack
            </span>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-cyber-blue neon-border-blue"></div>
          </h2>
          <p className="text-gray-400 text-sm font-inter mt-4 max-w-xl mx-auto">
            Core computational competencies, frameworks, and cyber defense protocols.
          </p>
        </motion.div>

        {/* Tech Stack Categories Grid - 2-Column Row-Wise on Mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {skillCategories.map((category, idx) => (
            <motion.div
              key={category.id || idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-panel p-3.5 sm:p-6 rounded-xl border-t-2 sm:border-t-4 border-t-cyber-blue hover:-translate-y-2 transition-transform duration-300 flex flex-col"
            >
              <h3 className="text-xs sm:text-xl font-orbitron text-cyber-blue mb-2.5 sm:mb-6 border-b border-white/10 pb-2 sm:pb-4 truncate">
                &gt; {category.title}
              </h3>
              
              <div className="flex flex-wrap gap-1.5 sm:gap-3 flex-grow">
                {category.skills.map((skill, sIdx) => (
                  <motion.span
                    key={sIdx}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(0, 240, 255, 0.1)' }}
                    className="px-2 py-0.5 sm:px-3 sm:py-1 bg-cyber-dark border border-cyber-blue/30 text-gray-300 text-[10px] sm:text-sm font-mono rounded cursor-default transition-colors hover:text-cyber-blue hover:border-cyber-blue"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Futuristic Cyber Arcade Station Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-24 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyber-blue/10 border border-cyber-blue/40 text-cyber-blue text-xs font-orbitron tracking-widest uppercase mb-3 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Gamepad2 size={15} />
            <span>Cyber Arcade Suite // 4 Simulations</span>
          </div>

          <h3 className="text-3xl md:text-4xl font-orbitron font-bold text-white mb-3">
            Neural Arcade Terminal
          </h3>
          <p className="text-gray-400 font-inter text-sm max-w-2xl mx-auto">
            Choose from 4 interactive cyberpunk simulations: Defend the Firewall against malware waves, decrypt classified Matrix Ciphers, sprint down the Quantum Neon Highway, or route energy through Neural Circuit Pipelines!
          </p>
        </motion.div>

        {/* 4 Games Arcade Station Hub */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10"
        >
          <CyberArcadeStation />
        </motion.div>
        
      </div>
    </section>
  );
};

export default Skills;
