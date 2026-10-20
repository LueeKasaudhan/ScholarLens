import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search long-tail awards, universities, or tech fields (e.g., embedded, VLSI, Germany)...',
  className = ''
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Global hotkey '/' to quickly jump to search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-20 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 dark:focus:ring-emerald-500 focus:border-transparent text-sm transition-all shadow-xs"
        aria-label="Search opportunities"
      />
      <div className="absolute right-3 flex items-center gap-1.5 pointer-events-auto">
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded"
            aria-label="Clear search text"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-stone-400 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded shadow-xs">
            /
          </kbd>
        )}
      </div>
    </div>
  );
};
