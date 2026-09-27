import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Code, Database, Globe, Shield, Terminal, Zap, Award, Sparkles } from 'lucide-react';
import { getAboutData } from '../utils/portfolioStorage';

const getMetricIcon = (iconName) => {
  switch ((iconName || '').toLowerCase()) {
    case 'globe': return <Globe className="text-cyber-blue" />;
    case 'database': return <Database className="text-cyber-purple" />;
    case 'cpu': return <Cpu className="text-cyber-yellow" />;
    case 'code': return <Code className="text-cyber-red" />;
    case 'shield': return <Shield className="text-emerald-400" />;
    case 'terminal': return <Terminal className="text-teal-400" />;
    case 'zap': return <Zap className="text-yellow-400" />;
    case 'award': return <Award className="text-purple-400" />;
    default: return <Sparkles className="text-cyber-blue" />;
  }
};

const About = () => {
  const [aboutData, setAboutData] = useState(getAboutData());

  useEffect(() => {
    const handleUpdate = () => {
      setAboutData(getAboutData());
    };
    window.addEventListener('portfolio_data_updated', handleUpdate);
    return () => window.removeEventListener('portfolio_data_updated', handleUpdate);
  }, []);

  const metrics = aboutData.metrics || [];

  return (
    <section id="about" className="min-h-screen pt-28 md:pt-32 pb-20 relative flex items-center">
      <div className="container mx-auto px-6 z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-orbitron inline-block relative">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-white">
              {aboutData.title || "Data.Profile"}
            </span>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-cyber-blue neon-border-blue"></div>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
          
          {/* Bio Section */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-panel p-5 sm:p-8 rounded-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-blue/10 rounded-full blur-[50px] -z-10 group-hover:bg-cyber-blue/20 transition-all duration-500"></div>
            
            <h3 className="text-xl sm:text-2xl font-orbitron text-cyber-blue mb-4 sm:mb-6 flex items-center gap-3">
              <span className="w-8 h-px bg-cyber-blue inline-block"></span>
              {aboutData.heading || "Origin Story"}
            </h3>
            
            <p className="text-gray-300 leading-relaxed mb-4 sm:mb-6 font-inter text-sm sm:text-lg">
              {aboutData.paragraph1 || "I am a digital architect operating at the intersection of design and engineering. My prime directive is building immersive, high-performance web applications that push the boundaries of what's possible in the browser."}
            </p>
            {aboutData.paragraph2 && (
              <p className="text-gray-300 leading-relaxed font-inter text-sm sm:text-lg mb-4">
                {aboutData.paragraph2}
              </p>
            )}

            {/* Row-wise Feature Chips on Mobile & Desktop */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10">
              <span className="px-2.5 py-1 rounded-lg bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue text-[10px] sm:text-xs font-mono">
                ⚡ High-Performance
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-cyber-purple/10 border border-cyber-purple/30 text-purple-300 text-[10px] sm:text-xs font-mono">
                🛡️ Zero-Trust Security
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] sm:text-xs font-mono">
                🌐 Full-Stack Cloud
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-[10px] sm:text-xs font-mono">
                🎮 Cyber Game UX
              </span>
            </div>
          </motion.div>

          {/* Stats/Skills Grid - 2-Column Row-Wise on Mobile */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 gap-3 sm:gap-6"
          >
            {metrics.map((skill, index) => (
              <motion.div 
                key={skill.id || index}
                whileHover={{ y: -5, scale: 1.02 }}
                className="glass-panel p-3.5 sm:p-6 rounded-xl border-l-2 sm:border-l-4 border-l-cyber-blue relative overflow-hidden"
              >
                {/* Background glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue/0 to-cyber-blue/5 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex justify-between items-center mb-2 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-cyber-dark rounded-lg border border-white/5">
                    {getMetricIcon(skill.icon)}
                  </div>
                  <span className="text-base sm:text-2xl font-orbitron font-bold text-gray-500 opacity-50">
                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                  </span>
                </div>
                
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h4 className="text-xs sm:text-xl font-orbitron text-white truncate">{skill.name}</h4>
                  <span className="text-[10px] sm:text-xs font-mono text-cyber-blue font-bold">{skill.level}%</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-cyber-dark h-1.5 rounded-full mt-2 sm:mt-4 overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyber-blue neon-border-blue"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.3 + (index * 0.1) }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default About;
