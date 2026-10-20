import React from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';

export const DemoDataBanner: React.FC = () => {
  return (
    <div className="bg-[#faf8f5] dark:bg-[#141312] border-b border-dashed border-stone-300 dark:border-stone-800 text-stone-600 dark:text-stone-400 px-4 py-1.5 text-xs font-mono">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-stone-400" />
          <span>
            <strong className="text-stone-800 dark:text-stone-200">Demo notice:</strong> Illustrative entries for indexing proof-of-concept. Official links point to <code className="bg-stone-200/60 dark:bg-stone-800 px-1 py-0.5 rounded text-[10.5px]">example.com</code>.
          </span>
        </div>
        <span className="hidden sm:inline-block text-stone-400 text-[11px]">
          Curated Prototype
        </span>
      </div>
    </div>
  );
};
