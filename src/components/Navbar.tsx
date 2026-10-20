import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext';
import { useTheme } from '../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { count } = useBookmarks();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [isAudioActive, setIsAudioActive] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleToggleSound = () => {
    const next = !isAudioActive;
    setIsAudioActive(next);
    window.dispatchEvent(new CustomEvent('toggle-ambient-sound', { detail: { active: next } }));
  };

  return (
    <header className="sticky top-0 z-50 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b-[1px] border-dashed border-stone-300/80 dark:border-stone-800/80 bg-[#faf8f5]/90 dark:bg-[#141312]/90 px-3 py-2.5 backdrop-blur-md md:gap-x-4 md:px-[22px] transition-colors">
      {/* Zone 1: Left Brand / Logo (Without Playground text) */}
      <div className="flex min-w-0 flex-nowrap items-center gap-2.5 col-start-1 justify-start">
        <Link to="/" className="flex items-baseline gap-1.5 group select-none">
          <span className="font-serif-title text-2xl md:text-[26px] tracking-tight text-stone-900 dark:text-stone-100 font-normal leading-none">
            scholar<span className="font-sans font-bold text-lg md:text-xl tracking-tighter">Lens</span>
          </span>
        </Link>
      </div>

      {/* Zone 2: Center Segmented Tabs — ONLY Library & Saved */}
      <nav
        aria-label="Main Navigation"
        className="flex w-fit justify-self-center items-center gap-0.5 md:gap-1 border-[1px] border-dashed border-stone-300/90 dark:border-stone-700/80 p-0.5 md:p-1 bg-[#faf8f5]/60 dark:bg-[#141312]/60"
      >
        <Link
          to="/"
          className={`cursor-pointer px-3.5 py-1.5 md:px-5 text-[12.5px] md:text-[13px] font-medium transition-all ${
            isActive('/')
              ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 shadow-2xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          Library
        </Link>

        <Link
          to="/bookmarks"
          className={`cursor-pointer px-3.5 py-1.5 md:px-5 text-[12.5px] md:text-[13px] font-medium transition-all flex items-center gap-1.5 ${
            isActive('/bookmarks')
              ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 shadow-2xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <span>Saved</span>
          {count > 0 && (
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold">
              {count}
            </span>
          )}
        </Link>
      </nav>

      {/* Zone 3: Right Controls in Epoch Square Action Button Style */}
      <div className="flex min-w-0 flex-nowrap items-center gap-1.5 md:gap-2 col-start-3 justify-end">
        {/* Square audio toggle */}
        <button
          type="button"
          onClick={handleToggleSound}
          className={`size-[32px] md:size-[34px] border-[1px] border-dashed border-stone-300 dark:border-stone-700 flex items-center justify-center transition-colors cursor-pointer ${
            isAudioActive
              ? 'bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900'
              : 'bg-[#faf8f5] dark:bg-[#141312] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
          title={isAudioActive ? 'Mute ambient wind chime' : 'Enable ambient wind chime'}
          aria-label="Toggle ambient sound"
        >
          {isAudioActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Square theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="size-[32px] md:size-[34px] border-[1px] border-dashed border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-[#141312] text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 flex items-center justify-center transition-colors cursor-pointer"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
};
