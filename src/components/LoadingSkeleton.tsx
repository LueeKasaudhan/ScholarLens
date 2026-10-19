import React from 'react';

export const LoadingSkeleton: React.FC<{ count?: number; viewMode?: 'grid' | 'list' }> = ({
  count = 6,
  viewMode = 'grid'
}) => {
  return (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
          : 'space-y-4'
      }
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 space-y-4 animate-pulse"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <div className="h-5 w-20 bg-stone-200 dark:bg-stone-800 rounded-md" />
              <div className="h-5 w-16 bg-stone-200 dark:bg-stone-800 rounded-md" />
              <div className="h-5 w-24 bg-stone-200 dark:bg-stone-800 rounded-md" />
            </div>
            <div className="h-7 w-7 bg-stone-200 dark:bg-stone-800 rounded-lg" />
          </div>

          <div className="space-y-2">
            <div className="h-5 w-4/5 bg-stone-200 dark:bg-stone-800 rounded" />
            <div className="h-4 w-1/2 bg-stone-200 dark:bg-stone-800 rounded" />
          </div>

          <div className="h-12 w-full bg-stone-100 dark:bg-stone-800/60 rounded-lg" />

          <div className="flex gap-2">
            <div className="h-4 w-16 bg-stone-200 dark:bg-stone-800 rounded" />
            <div className="h-4 w-20 bg-stone-200 dark:bg-stone-800 rounded" />
            <div className="h-4 w-14 bg-stone-200 dark:bg-stone-800 rounded" />
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <div className="h-5 w-28 bg-stone-200 dark:bg-stone-800 rounded-md" />
            <div className="h-4 w-20 bg-stone-200 dark:bg-stone-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};
