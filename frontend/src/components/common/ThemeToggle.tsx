import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { effectiveTheme, setTheme } = useTheme();
  const isDark = effectiveTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
      className="relative w-10 h-10 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors duration-200 overflow-hidden"
    >
      <Sun
        className={`absolute w-5 h-5 transition-[transform,opacity] duration-500 ease-out ${
          isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
        }`}
      />
      <Moon
        className={`absolute w-5 h-5 transition-[transform,opacity] duration-500 ease-out ${
          isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
        }`}
      />
    </button>
  );
};
