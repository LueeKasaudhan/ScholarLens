import React from 'react';
import { Sparkles, Compass } from 'lucide-react';
import { IndusMotionGraphics, AmbienceMood } from './IndusMotionGraphics';

interface IndusMotionHeroProps {
  totalCount: number;
  onExploreClick: () => void;
  onSemanticClick: () => void;
  currentMood: AmbienceMood;
  onMoodChange: (mood: AmbienceMood) => void;
}

export const IndusMotionHero: React.FC<IndusMotionHeroProps> = ({
  totalCount,
  onExploreClick,
  onSemanticClick,
  currentMood,
  onMoodChange
}) => {
  return (
    <div className="relative mb-8 rounded-xl overflow-hidden border-[1.5px] border-dashed border-stone-300 dark:border-stone-800 bg-[#faf8f5]/90 dark:bg-stone-900/60 p-6 sm:p-8 lg:p-9 shadow-2xs transition-all duration-300">
      {/* Soft background subtle warmth */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-amber-200/20 via-orange-200/10 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Epoch-style Editorial Prose */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Headline: Epoch Serif styling */}
          <h1 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl text-stone-900 dark:text-stone-50 tracking-tight leading-[1.15] font-normal">
            Beyond the Famous Ten.
            <span className="block text-stone-600 dark:text-stone-400 italic text-2xl sm:text-3xl lg:text-4xl mt-1">
              Where quiet curiosity finds full funding.
            </span>
          </h1>

          {/* Subtitle with peaceful, warm slice-of-life prose */}
          <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed max-w-xl font-sans">
            Skip the hyper-saturated 1% marquee grants. Discover legitimate, full-stipend
            European &amp; Asian university awards, institute fellowships, and technical research chairs —
            matched mathematically with our Cosine Similarity vector engine.
          </p>

          {/* Action Buttons styled with Epoch precision */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onSemanticClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 font-medium text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Semantic Studio</span>
            </button>

            <button
              type="button"
              onClick={onExploreClick}
              className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-stone-400 dark:border-stone-600 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-stone-500" />
              <span>Browse {totalCount} Awards</span>
            </button>
          </div>

          {/* Trust Metrics in clean Epoch tabular format */}
          <div className="pt-4 border-t border-dashed border-stone-300 dark:border-stone-800 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-stone-500 dark:text-stone-400 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-stone-900 dark:text-stone-100 tabular-nums">{totalCount}</span>
              <span>awards indexed</span>
            </div>
            <span className="text-stone-300 dark:text-stone-700">/</span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-stone-900 dark:text-stone-100 tabular-nums">100%</span>
              <span>vector matched</span>
            </div>
            <span className="text-stone-300 dark:text-stone-700">/</span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-stone-900 dark:text-stone-100">0</span>
              <span>tuition traps</span>
            </div>
          </div>
        </div>

        {/* Right Column: Motion Graphics Component with Golden Hour, Twilight, and Starlit Options */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full relative group">
            {/* Luminous warm aura behind the canvas */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-400/30 via-orange-400/20 to-indigo-400/30 blur-md opacity-75 group-hover:opacity-100 transition duration-1000 -z-10" />

            {/* The Motion Graphics Canvas */}
            <div className="h-72 sm:h-80 w-full">
              <IndusMotionGraphics
                className="w-full h-full"
                showControls={true}
                compact={false}
                initialMood={currentMood}
                onMoodChange={onMoodChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
