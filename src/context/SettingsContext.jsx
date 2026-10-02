import { useState, useEffect, useCallback } from 'react';
import { soundEngine } from '../utils/audio';
import { SettingsContext, THEMES } from './settingsContextDef';

export { SettingsContext, THEMES };

export const SettingsProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const themes = THEMES;
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
    document.documentElement.style.setProperty('--color-cyber-blue', THEMES[activeTheme]);
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
