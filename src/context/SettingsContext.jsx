import React, { createContext, useState, useEffect, useCallback } from 'react';
import { soundEngine } from '../utils/audio';

export const SettingsContext = createContext({
  soundEnabled: true,
  setSoundEnabled: () => {},
  toggleSound: () => {},
  playHover: () => {},
  playClick: () => {},
  playToggle: () => {},
  activeTheme: 'cyber-blue',
  setActiveTheme: () => {},
  themes: {}
});

export const SettingsProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Theme colors available
  const themes = {
    'cyber-blue': '#00f0ff',
    'neon-pink': '#ff00ff',
    'matrix-green': '#00ff00',
    'solar-yellow': '#fcee0a',
  };

  const [activeTheme, setActiveTheme] = useState('cyber-blue');

  useEffect(() => {
    soundEngine.setEnabled(soundEnabled);
  }, [soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      soundEngine.setEnabled(next);
      if (next) soundEngine.playToggle(true);
      return next;
    });
  }, []);

  const playHover = useCallback(() => {
    soundEngine.playHover();
  }, []);

  const playClick = useCallback(() => {
    soundEngine.playClick();
  }, []);

  const playToggle = useCallback((state) => {
    soundEngine.playToggle(state);
  }, []);

  useEffect(() => {
    // Dynamically update the CSS variable for cyber-blue across the site
    document.documentElement.style.setProperty('--color-cyber-blue', themes[activeTheme]);
  }, [activeTheme]);

  return (
    <SettingsContext.Provider value={{
      soundEnabled, setSoundEnabled, toggleSound,
      playHover, playClick, playToggle,
      activeTheme, setActiveTheme,
      themes
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
