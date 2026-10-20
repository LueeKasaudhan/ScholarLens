import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bookmark, Compass, Settings, Sun, Moon, Sparkles } from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext';
import { useTheme } from '../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { count } = useBookmarks();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-50/90 dark:bg-stone-950/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-700 text-stone-50 flex items-center justify-center font-bold text-lg shadow-sm group-hover:from-amber-600 group-hover:to-orange-700 transition-all">
            SL
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-stone-900 dark:text-stone-50 tracking-tight text-base sm:text-lg">
                ScholarLens
              </span>
              <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold bg-amber-100/80 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded border border-amber-300 dark:border-amber-800">
                <Sparkles className="w-2.5 h-2.5" /> Indus Motion
              </span>
            </div>
            <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium hidden sm:inline-block">
              Beyond the famous ten • Long-tail awards for Indian tech graduates
            </span>
          </div>
        </Link>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/')
                ? 'bg-stone-200/80 dark:bg-stone-800 text-stone-900 dark:text-stone-50'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </Link>

          <Link
            to="/bookmarks"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors relative ${
              isActive('/bookmarks')
                ? 'bg-stone-200/80 dark:bg-stone-800 text-stone-900 dark:text-stone-50'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-900'
            }`}
            aria-label={`Saved opportunities (${count})`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved</span>
            {count > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 text-[11px] font-bold bg-emerald-700 text-white rounded-full min-w-4 text-center">
                {count}
              </span>
            )}
          </Link>

          <div className="h-5 w-px bg-stone-200 dark:bg-stone-800 mx-1" />

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
