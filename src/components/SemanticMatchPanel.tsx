import React, { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Brain,
  XCircle,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface SemanticMatchPanelProps {
  onMatch: (backgroundText: string) => void;
  onClear: () => void;
  isMatchingActive: boolean;
  isRankingLoading: boolean;
  candidateCount: number;
}

/**
 * TODO: Known open product design question regarding semantic ranking on small candidate subsets:
 * When candidate set < 5, ranking precision diminishes and scores may feel artificial.
 * Currently handled by showing a non-blocking informative banner advising users to loosen filters.
 */
export function shouldShowLowCandidateSubsetWarning(count: number, isMatchRequested: boolean): boolean {
  return isMatchRequested && count > 0 && count < 5;
}

const SAMPLE_BACKGROUND =
  "Final-year B.Tech in Computer Engineering from Pune University (8.3 CGPA). Completed projects in embedded Linux and real-time RTOS sensor networks. Proficient in C, C++, and Python with coursework in computer architecture, distributed systems, and basic deep learning. Interested in IoT or robotics systems research.";

export const SemanticMatchPanel: React.FC<SemanticMatchPanelProps> = ({
  onMatch,
  onClear,
  isMatchingActive,
  isRankingLoading,
  candidateCount
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const maxChars = 2000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onMatch(text.trim());
  };

  const handleClear = () => {
    setText('');
    onClear();
  };

  const handleInsertSample = () => {
    setText(SAMPLE_BACKGROUND);
  };

  const showLowCandidateWarning = shouldShowLowCandidateSubsetWarning(
    candidateCount,
    isMatchingActive
  );

  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-100/60 dark:bg-stone-900/40 overflow-hidden transition-all duration-200">
      {/* Header bar / Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 sm:px-5 flex items-center justify-between hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-700/10 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                Match me to my background
              </span>
              {isMatchingActive && (
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full border border-emerald-300 dark:border-emerald-800">
                  Active Match
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 hidden sm:block">
              Paste your degree, thesis topic, or tech stack to re-rank filtered awards by semantic alignment.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-stone-500">
          <span className="text-xs font-medium hidden md:inline">
            {isOpen ? 'Collapse' : isMatchingActive ? 'Edit profile' : 'Open matcher'}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Low Candidate Subset Warning (Non-blocking) */}
      {showLowCandidateWarning && (
        <div className="mx-4 sm:mx-5 mb-2 px-3 py-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-lg flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            Few results match your filters ({candidateCount} remaining), so ranking is less informative. Consider loosening filters for stronger semantic comparison.
          </span>
        </div>
      )}

      {/* Expanded Body */}
      {isOpen && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 border-t border-stone-200 dark:border-stone-800 space-y-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <span className="flex items-center gap-1 font-medium text-stone-700 dark:text-stone-300">
                <HelpCircle className="w-3.5 h-3.5" />
                Paste text only — we don't parse CVs or PDFs
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleInsertSample}
                  className="text-emerald-700 dark:text-emerald-400 hover:underline font-medium"
                >
                  Insert sample profile
                </button>
                <span>•</span>
                <span className={text.length > maxChars ? 'text-rose-600 font-bold' : ''}>
                  {text.length} / {maxChars}
                </span>
              </div>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, maxChars))}
              rows={4}
              placeholder="e.g., Final-year B.Tech in Computer Engineering from Pune University (8.3 CGPA). Completed projects in embedded Linux and real-time RTOS sensor networks. Proficient in C, C++, and Python..."
              className="w-full p-3 text-xs sm:text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 leading-relaxed shadow-xs"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={!text.trim() || isRankingLoading}
                  className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-medium text-xs sm:text-sm hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  {isRankingLoading ? 'Ranking filtered awards...' : 'Find best matches'}
                </button>

                {isMatchingActive && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-3 py-2 rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Clear match
                  </button>
                )}
              </div>

              <p className="text-[11px] text-stone-400 dark:text-stone-500 italic">
                Demo scores are simulated. The real version uses sentence embeddings.
              </p>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
