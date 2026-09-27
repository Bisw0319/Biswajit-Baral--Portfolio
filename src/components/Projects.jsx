import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Folder, Sparkles } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { getEffectiveProjects } from '../utils/portfolioStorage';

const defaultProjects = [
  {
    title: "Neon Nexus",
    description: "A cyberpunk themed e-commerce platform with 3D product previews and crypto payments integration.",
    tech: ["React", "Three.js", "Node.js", "MongoDB"],
    github: "https://github.com/",
    live: "https://example.com",
    image: "url('/project1.png') center/cover no-repeat"
  },
  {
    title: "DataStream Analytics",
    description: "Real-time dashboard for monitoring network traffic and server health with predictive AI alerts.",
    tech: ["Next.js", "Python", "TensorFlow", "WebSockets"],
    github: "https://github.com/",
    live: "https://example.com",
    image: "url('/project2.png') center/cover no-repeat"
  },
  {
    title: "Holo UI Library",
    description: "An open-source React component library focused on glassmorphism and animated interfaces.",
    tech: ["React", "Framer Motion", "TailwindCSS"],
    github: "https://github.com/",
    live: "https://example.com",
    image: "url('/project3.png') center/cover no-repeat"
  },
  {
    title: "Neural Net visualizer",
    description: "Interactive educational tool to visualize how neural networks learn and process information.",
    tech: ["Vue.js", "D3.js", "Express"],
    github: "https://github.com/",
    live: "https://example.com",
    image: "url('/project4.png') center/cover no-repeat"
  }
];

const getProjectBackground = (img) => {
  if (!img) return "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)";
  if (img.startsWith('url(') || img.startsWith('linear-gradient')) return img;
  return `url('${img}') center/cover no-repeat`;
};

const Projects = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [allProjects, setAllProjects] = useState(() => getEffectiveProjects());

  useEffect(() => {
    const handleSync = () => {
      setAllProjects(getEffectiveProjects());
    };
    window.addEventListener('portfolio_data_updated', handleSync);
    return () => window.removeEventListener('portfolio_data_updated', handleSync);
  }, []);

  return (
    <section id="projects" className="min-h-screen pt-28 md:pt-32 pb-20 relative z-10">
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
              System.Projects
            </span>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-cyber-blue neon-border-blue"></div>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {allProjects.map((project, index) => (
            <motion.div
              key={project.id || project.title || index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="glass-panel rounded-xl overflow-hidden group relative min-h-[350px] flex flex-col border border-white/10 hover:border-cyber-blue/50 transition-all duration-300"
            >
              {/* Project Image / Visual */}
              <div 
                className="absolute inset-0 z-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                style={{ background: getProjectBackground(project.image) }}
              ></div>

              {/* Overlay grid lines */}
              <div className="absolute inset-0 bg-cyber-grid bg-[length:30px_30px] opacity-10 z-0 pointer-events-none"></div>

              <div className="relative z-10 p-8 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-cyber-dark/80 rounded-lg border border-cyber-blue/30 text-cyber-blue group-hover:neon-border-blue transition-all">
                    <Folder size={24} />
                  </div>
                  <div className="flex gap-4">
                    {project.github && project.github !== "#" && (
                      <a href={project.github} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-cyber-blue transition-colors">
                        <FaGithub size={22} />
                      </a>
                    )}
                    {project.live && project.live !== "#" && (
                      <a href={project.live} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-cyber-yellow transition-colors">
                        <ExternalLink size={22} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-2xl font-orbitron font-bold text-white group-hover:text-cyber-blue transition-colors">
                    {project.title}
                  </h3>
                  {project.isCustom && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-orbitron font-bold tracking-widest uppercase bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/40">
                      NEW
                    </span>
                  )}
                </div>
                
                <p className="text-gray-300 font-inter mb-6 flex-grow leading-relaxed">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto">
                  {(Array.isArray(project.tech) ? project.tech : [project.tech]).map((tech, i) => (
                    <span 
                      key={i} 
                      className="text-xs font-mono px-3 py-1 bg-cyber-dark/50 border border-white/10 rounded text-cyber-blue group-hover:border-cyber-blue/30 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hover Frame effect */}
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 border-2 border-cyber-blue z-20 pointer-events-none rounded-xl"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 10px, 10px 10px, 10px 100%, 0 100%)' }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default Projects;
