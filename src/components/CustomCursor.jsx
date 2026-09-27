import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e) => {
      if (e.target.tagName.toLowerCase() === 'a' || 
          e.target.tagName.toLowerCase() === 'button' ||
          e.target.closest('a') || 
          e.target.closest('button')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  const variants = {
    default: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      transition: {
        type: 'spring',
        mass: 0.1,
        stiffness: 800,
        damping: 50,
      }
    },
    hover: {
      x: mousePosition.x - 24,
      y: mousePosition.y - 24,
      height: 48,
      width: 48,
      backgroundColor: 'rgba(0, 240, 255, 0.2)',
      border: '1px solid rgba(0, 240, 255, 0.8)',
      boxShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
      transition: {
        type: 'spring',
        mass: 0.1,
        stiffness: 800,
        damping: 50,
      }
    }
  };

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-cyber-blue pointer-events-none z-[100] mix-blend-screen hidden md:block"
        variants={variants}
        animate={isHovering ? "hover" : "default"}
      />
      <div 
        className="fixed top-0 left-0 w-2 h-2 bg-cyber-yellow rounded-full pointer-events-none z-[100] hidden md:block"
        style={{ 
          transform: `translate(${mousePosition.x - 4}px, ${mousePosition.y - 4}px)`,
          boxShadow: '0 0 10px #fcee0a'
        }}
      />
    </>
  );
};

export default CustomCursor;
