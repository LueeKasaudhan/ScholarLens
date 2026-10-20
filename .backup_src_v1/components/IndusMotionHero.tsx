import React, { useState } from 'react';
import {
  Sparkles,
  Maximize2,
  Compass,
  Layers,
  ArrowRight,
  Flame,
  Sun,
  Sunset,
  Moon,
  Info
} from 'lucide-react';
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
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);

  // Warm Indic multilingual greetings reflecting Sarvam Indus cultural depth & slice-of-life warmth
  const greetings = [
    { script: 'नमस्ते', lang: 'Hindi', meaning: 'Welcome' },
    { script: 'வணக்கம்', lang: 'Tamil', meaning: 'Greetings' },
    { script: 'నమస్కారం', lang: 'Telugu', meaning: 'Welcome' },
    { script: 'নমস্কার', lang: 'Bengali', meaning: 'Welcome' },
    { script: 'ನಮಸ್ಕಾರ', lang: 'Kannada', meaning: 'Welcome' }
  ];

  return (
    <>
      <div className="relative mb-8 rounded-3xl overflow-hidden border border-amber-200/70 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/50 via-stone-50/80 to-orange-50/30 dark:from-stone-900/90 dark:via-stone-900/60 dark:to-stone-950 p-6 sm:p-8 lg:p-10 shadow-sm transition-all duration-300">
        {/* Soft background komorebi shimmer overlay */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-amber-300/20 via-orange-300/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-gradient-to-tr from-rose-300/15 via-amber-200/10 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Warm Slice-of-Life Editorial Prose */}
          <div className="lg:col-span-7 space-y-4">
            {/* Top Badge: Multilingual Indic Greeting + Warm Atmospheric Tag */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 font-semibold border border-amber-200 dark:border-amber-800 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Indus Motion &amp; Golden-Hour Architecture</span>
              </span>

              <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100/80 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700/80 text-[11px]">
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {greetings.map((g) => g.script).join(' · ')}
                </span>
              </div>
            </div>

            {/* Main Headline: Warm slice of life feel, literary and encouraging */}
            <h1 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl text-stone-900 dark:text-stone-50 tracking-tight leading-[1.15]">
              Beyond the Famous Ten.
              <span className="block text-amber-700 dark:text-amber-400 italic font-normal mt-1">
                Where your quiet curiosity finds funding.
              </span>
            </h1>

            {/* Subtitle with peaceful, warm slice-of-life prose */}
            <p className="text-stone-700 dark:text-stone-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Skip the hyper-saturated 1% marquee grants. Discover legitimate, full-stipend
              European &amp; Asian university awards, institute fellowships, and technical research chairs —
              matched mathematically with our Cosine Similarity vector engine.
            </p>

            {/* Action Buttons & Motion Trigger */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onSemanticClick}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs sm:text-sm shadow-sm transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Launch Semantic Match</span>
              </button>

              <button
                type="button"
                onClick={onExploreClick}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 font-medium text-xs sm:text-sm shadow-2xs transition-colors"
              >
                <Compass className="w-4 h-4 text-stone-500" />
                <span>Browse {totalCount} Opportunities</span>
              </button>

              <button
                type="button"
                onClick={() => setIsGatewayOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-amber-800 dark:text-amber-300 hover:bg-amber-100/60 dark:hover:bg-amber-950/40 text-xs font-semibold transition-colors"
                title="Expand full-screen interactive Indus Motion Graphics"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full Motion Canvas</span>
              </button>
            </div>

            {/* Trust Metrics in clean editorial format */}
            <div className="pt-4 border-t border-stone-200/80 dark:border-stone-800/80 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-stone-600 dark:text-stone-400 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-stone-900 dark:text-stone-100 tabular-nums">{totalCount}</span>
                <span>Active long-tail awards</span>
              </div>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-amber-700 dark:text-amber-400 tabular-nums">100%</span>
                <span>Cosine vector matched</span>
              </div>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-stone-900 dark:text-stone-100">0</span>
                <span>Tuition debt traps</span>
              </div>
            </div>
          </div>

          {/* Right Column: Sarvam Indus Interactive Motion Graphics Component */}
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

            {/* Micro Caption underneath motion canvas */}
            <p className="mt-2 text-center text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-center gap-1">
              <Info className="w-3 h-3 text-amber-500" />
              <span>
                Sarvam Indus-inspired continuous mandala wave dynamics • Slice-of-life golden hour ambient motes
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Full-Screen Immersive Motion Gateway Modal */}
      {isGatewayOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-md p-4 sm:p-6"
        >
          <div className="relative w-full max-w-5xl h-[85vh] bg-stone-900 rounded-3xl overflow-hidden border border-stone-700 shadow-2xl flex flex-col">
            {/* Top Bar of Modal */}
            <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-900/90 backdrop-blur-md z-30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-100">
                    Indus Motion Graphics &amp; Anime Slice-of-Life Sanctuary
                  </h3>
                  <p className="text-xs text-stone-400">
                    Continuous generative harmonic waves, komorebi sunbeams, and floating dust motes
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsGatewayOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors"
                >
                  Close Gateway
                </button>
              </div>
            </div>

            {/* Immersive Canvas Area */}
            <div className="flex-1 w-full relative">
              <IndusMotionGraphics
                className="w-full h-full rounded-none border-0"
                showControls={true}
                compact={false}
                initialMood={currentMood}
                onMoodChange={onMoodChange}
              />
            </div>

            {/* Bottom info strip */}
            <div className="px-6 py-3 border-t border-stone-800/80 bg-stone-900/95 flex flex-wrap items-center justify-between text-xs text-stone-400 font-mono">
              <span>Interactive Controls: Click canvas for harmonic ripples • Toggle chime sound &amp; lighting moods</span>
              <span className="text-amber-400">ScholarLens × Indus Motion</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
