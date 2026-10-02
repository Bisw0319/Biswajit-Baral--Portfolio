import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { Mail, Download } from 'lucide-react';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { SettingsContext } from '../context/SettingsContext';
import { getHomeData, getContactData, getResumeData } from '../utils/portfolioStorage';

const Hero = () => {
  const { playHover, playClick } = useContext(SettingsContext);
  const [homeData, setHomeData] = useState(getHomeData());
  const [contactData, setContactData] = useState(getContactData());
  const [resumeData, setResumeData] = useState(() => getResumeData());

  useEffect(() => {
    const handleUpdate = () => {
      setHomeData(getHomeData());
      setContactData(getContactData());
      setResumeData(getResumeData());
    };
    window.addEventListener('portfolio_data_updated', handleUpdate);
    return () => window.removeEventListener('portfolio_data_updated', handleUpdate);
  }, []);

  const animationSequence = homeData.roles && homeData.roles.length > 0
    ? homeData.roles.flatMap(role => [role, 2000])
    : ['Full Stack Developer', 2000];

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      <div className="container mx-auto px-6 z-10">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-12">

          {/* Text Content */}
          <motion.div
            className="flex-1 text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-block mb-4 px-3 py-1 border border-cyber-blue text-cyber-blue rounded-full text-sm font-semibold tracking-widest uppercase neon-border-blue bg-cyber-blue/10">
              {homeData.systemStatus || "System Online"}
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              <span className="block text-white">{homeData.greeting || "Hi, I'm"}</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue to-cyber-purple hover-glitch">
                {homeData.name || "Biswajit Baral"}
              </span>
            </h1>

            <div className="text-xl md:text-2xl text-gray-400 mb-8 font-inter h-12">
              <TypeAnimation
                key={homeData.roles ? homeData.roles.join('|') : 'sequence'}
                sequence={animationSequence}
                wrapper="span"
                speed={50}
                repeat={Infinity}
                className="text-cyber-yellow"
              />
            </div>

            <p className="text-gray-400 max-w-lg mb-8 leading-relaxed">
              {homeData.bio || "Building futuristic digital experiences with clean code and cutting-edge technologies. Welcome to my digital frontier."}
            </p>

            <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
              {resumeData?.url ? (
                <a
                  href={resumeData.url}
                  download={resumeData.fileName || "Biswajit_Baral_Resume.pdf"}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={playHover}
                  onClick={playClick}
                  className="group relative inline-flex items-center gap-2.5 px-6 sm:px-8 py-3 bg-gradient-to-r from-cyber-blue/15 to-cyber-purple/20 border-2 border-cyber-blue text-cyber-blue font-orbitron font-bold text-xs sm:text-sm tracking-widest uppercase hover:bg-cyber-blue hover:text-black transition-all duration-300 neon-border-blue hover:shadow-[0_0_25px_#00f0ff] rounded cursor-pointer"
                  title="Download Biswajit Baral's CV / Resume"
                >
                  <Download size={18} className="text-cyber-blue group-hover:text-black transition-all group-hover:translate-y-0.5" />
                  <span>{resumeData.buttonText || "DOWNLOAD CV"}</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => alert("Resume is currently being updated. Please check back shortly or connect directly via Contact!")}
                  className="group relative inline-flex items-center gap-2.5 px-6 sm:px-8 py-3 bg-transparent border-2 border-cyber-blue/40 text-gray-400 font-orbitron font-bold text-xs sm:text-sm tracking-widest uppercase rounded cursor-not-allowed"
                >
                  <Download size={18} />
                  <span>CV IN PROGRESS</span>
                </button>
              )}

              <div className="flex gap-5 items-center flex-wrap">
                {(contactData?.socials || []).map((s) => {
                  let Icon = FaGithub;
                  let hoverColor = '#ffffff';
                  const p = (s.platform || '').toLowerCase();
                  if (p.includes('linkedin')) {
                    Icon = FaLinkedin;
                    hoverColor = '#0a66c2';
                  } else if (p.includes('insta')) {
                    Icon = FaInstagram;
                    hoverColor = '#e1306c';
                  } else if (p.includes('twitter') || p.includes('x')) {
                    Icon = FaXTwitter;
                    hoverColor = '#ffffff';
                  }
                  return (
                    <motion.a
                      key={s.id || s.url || s.platform}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 transition-colors duration-300"
                      whileHover={{
                        scale: 1.25,
                        y: -4,
                        color: hoverColor,
                        filter: `drop-shadow(0 0 8px ${hoverColor})`
                      }}
                      whileTap={{ scale: 0.95 }}
                      title={s.platform}
                      aria-label={s.platform || "Social Profile"}
                    >
                      <Icon size={28} />
                    </motion.a>
                  );
                })}
                {contactData?.email && (
                  <motion.a
                    href={`mailto:${contactData.email}`}
                    className="text-gray-400 transition-colors duration-300"
                    whileHover={{
                      scale: 1.25,
                      y: -4,
                      color: '#ea4335',
                      filter: 'drop-shadow(0 0 8px rgba(234, 67, 53, 0.7))'
                    }}
                    whileTap={{ scale: 0.95 }}
                    title="Send Email"
                    aria-label="Send direct email to Biswajit Baral"
                  >
                    <Mail size={28} />
                  </motion.a>
                )}
              </div>
            </div>
          </motion.div>

          {/* Image/Avatar */}
          <motion.div
            className="flex-1 flex justify-center relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Decorative background elements behind image */}
            <div className="absolute inset-0 bg-cyber-blue/20 rounded-full blur-[100px] -z-10"></div>

            <div className="relative w-64 h-64 md:w-96 md:h-96">
              {/* Animated borders */}
              <motion.div
                className="absolute inset-0 border-2 border-cyber-blue rounded-full border-dashed"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-4 border border-cyber-purple rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-8 border border-cyber-yellow rounded-full opacity-50"
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              />

              {/* Profile Image container */}
              <div className="absolute inset-2 rounded-full overflow-hidden border-2 border-cyber-blue/30 bg-cyber-dark z-10 flex items-center justify-center group/avatar">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyber-blue/20 to-transparent z-20 pointer-events-none group-hover/avatar:opacity-0 transition-opacity" />
                <img
                  src={homeData.profilePic || "/avatar.png"}
                  alt={homeData.name ? `${homeData.name} - Profile Avatar` : "Biswajit Baral - Profile Avatar"}
                  className="w-full h-full object-cover rounded-full opacity-90 grayscale hover:grayscale-0 transition-all duration-700"
                  style={{ filter: 'drop-shadow(0 0 10px var(--color-cyber-blue))' }}
                />
                {/* Scanline effect on image */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-30 pointer-events-none opacity-30" />
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Explore Next Page Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Link 
          to="/about"
          onMouseEnter={playHover}
          onClick={playClick}
          className="group flex flex-col items-center cursor-pointer"
          title="Proceed to About Page"
          aria-label="Explore About Section"
        >
          <span className="text-xs text-cyber-blue font-orbitron tracking-widest uppercase mb-2 group-hover:neon-text-blue transition-all">Explore</span>
          <div className="w-px h-12 bg-gradient-to-b from-cyber-blue to-transparent"></div>
        </Link>
      </motion.div>
    </section>
  );
};

export default Hero;
