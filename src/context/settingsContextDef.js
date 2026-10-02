import { createContext } from 'react';

export const THEMES = {
  'cyber-blue': '#00f0ff',
  'neon-pink': '#ff00ff',
  'matrix-green': '#00ff00',
  'solar-yellow': '#fcee0a',
};

export const SettingsContext = createContext({
  soundEnabled: true,
  setSoundEnabled: () => {},
  toggleSound: () => {},
  playHover: () => {},
  playClick: () => {},
  playToggle: () => {},
  activeTheme: 'cyber-blue',
  setActiveTheme: () => {},
  themes: THEMES
});
