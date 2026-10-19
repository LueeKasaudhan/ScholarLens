import React from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';

export const DemoDataBanner: React.FC = () => {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 px-4 py-2 text-xs md:text-sm font-medium">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong>Demo data notice:</strong> Entries are illustrative, not real programs. Official links point to <code className="bg-amber-100 dark:bg-amber-900/80 px-1 py-0.5 rounded text-[11px]">example.com</code>.
          </span>
        </div>
        <span className="hidden sm:inline-block text-amber-700 dark:text-amber-300 text-xs">
          V1 Frontend Prototype
        </span>
      </div>
    </div>
  );
};
