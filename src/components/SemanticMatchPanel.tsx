import React, { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Brain,
  XCircle,
  HelpCircle,
  Sliders,
  Binary,
  Cpu,
  BarChart3
} from 'lucide-react';
import { SemanticEngineStats } from '../api/types';

interface SemanticMatchPanelProps {
  onMatch: (backgroundText: string, options?: { rankAllDatabase?: boolean; minThreshold?: number }) => void;
  onClear: () => void;
  isMatchingActive: boolean;
  isRankingLoading: boolean;
  candidateCount: number;
  totalDatabaseCount: number;
  stats?: SemanticEngineStats | null;
  minThreshold: number;
  onThresholdChange: (threshold: number) => void;
  onOpenDistributionModal?: () => void;
}

export function shouldShowLowCandidateSubsetWarning(count: number, isMatchRequested: boolean): boolean {
  return isMatchRequested && count > 0 && count < 5;
}

export const SAMPLE_PROFILES = [
  {
    label: 'Robotics & Embedded Systems',
    desc: 'B.Tech Pune Univ (8.4 CGPA) • C++, RTOS, ROS & microcontrollers',
    text: 'Final-year B.Tech in Computer & Electronics Engineering from Pune University (8.4 CGPA). Completed projects in embedded Linux and real-time RTOS sensor networks. Proficient in C, C++, and Python with coursework in computer architecture, distributed systems, and robotics control systems. Seeking research opportunities in autonomous systems and IoT sensors.'
  },
  {
    label: 'Artificial Intelligence & Vision',
    desc: 'B.Tech IIT Delhi (8.9 CGPA) • PyTorch, Transformer models & CV',
    text: 'B.Tech in Computer Science from IIT Delhi (8.9 CGPA). Research background in deep learning, computer vision, and transformer models. Published a paper on unsupervised representation learning. Proficient in PyTorch, Python, and CUDA with interest in multimodal AI, neural graphics, and European lab fellowships.'
  },
  {
    label: 'VLSI & Chip Design',
    desc: 'B.E. BITS Pilani (8.3 CGPA) • Verilog, FPGA & Digital ICs',
    text: 'Electronics and Instrumentation graduate from BITS Pilani (8.3 CGPA). Specialized in digital VLSI design, FPGA prototyping, and ASIC verification using SystemVerilog and Synopsys EDA tools. Interested in semiconductor research chairs and microelectronics masters programs in Germany or Belgium.'
  },
  {
    label: 'Bioinformatics & Genomics',
    desc: 'B.Tech Biotech (8.2 CGPA) • Computational biology & NGS data',
    text: 'B.Tech in Biotechnology and Bioinformatics from Anna University (8.2 CGPA). Practical experience analyzing next-generation sequencing (NGS) data with Python, R, and Nextflow. Completed internship in cancer genomics. Seeking funded technical masters in computational biology or biomedical data science.'
  },
  {
    label: 'Cybersecurity & Systems',
    desc: 'B.Tech NIT Trichy (8.6 CGPA) • Rust, Cryptography & Networks',
    text: 'Computer Science graduate from NIT Trichy (8.6 CGPA). Strong background in network security, applied cryptography, and systems programming in Rust and Go. Active participant in CTF competitions with knowledge of zero-knowledge proofs and cloud infrastructure security.'
  }
];

export const SemanticMatchPanel: React.FC<SemanticMatchPanelProps> = ({
  onMatch,
  onClear,
  isMatchingActive,
  isRankingLoading,
  candidateCount,
  totalDatabaseCount,
  stats,
  minThreshold,
  onThresholdChange,
  onOpenDistributionModal
}) => {
  const [isOpen, setIsOpen] = useState(isMatchingActive);
  const [text, setText] = useState('');
  const [rankAllDatabase, setRankAllDatabase] = useState(false);
  const maxChars = 2000;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;
    onMatch(text.trim(), { rankAllDatabase, minThreshold });
  };

  const handleClear = () => {
    setText('');
    onClear();
  };

  const handleSelectPreset = (presetText: string) => {
    setText(presetText);
    setIsOpen(true);
  };

  return (
    <div className="rounded-xl border-[1.5px] border-dashed border-stone-300 dark:border-stone-800 bg-[#faf8f5]/90 dark:bg-stone-900/60 overflow-hidden transition-all duration-200 shadow-2xs">
      {/* Header bar / Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 sm:px-5 flex items-center justify-between hover:bg-stone-100/60 dark:hover:bg-stone-800/60 transition-colors text-left cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="size-[32px] border border-dashed border-stone-300 dark:border-stone-700 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 flex items-center justify-center shrink-0">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                Semantic Studio
              </span>
              {isMatchingActive && (
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-stone-900 text-white dark:bg-white dark:text-stone-950">
                  ACTIVE
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 hidden sm:block font-sans">
              Paste your degree, research interests, or tech stack. Vectorizes your background and matches your profile against all catalog opportunities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-stone-500">
          <span className="text-xs font-mono hidden md:inline">
            {isOpen ? 'Collapse' : isMatchingActive ? 'Adjust Profile' : 'Open Studio'}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Body */}
      {isOpen && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-2 border-t border-stone-200 dark:border-stone-800 space-y-4">
          {/* Preset Profile Pills */}
          <div>
            <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5 flex items-center gap-1 font-mono">
              <Cpu className="w-3.5 h-3.5" />
              <span>Click a sample student profile:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PROFILES.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleSelectPreset(p.text)}
                  className="px-2.5 py-1 text-xs border border-dashed border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:border-stone-900 dark:hover:border-stone-100 hover:text-stone-900 dark:hover:text-stone-100 transition-colors text-left font-medium shadow-2xs cursor-pointer font-sans"
                  title={p.desc}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <span className="flex items-center gap-1 font-medium text-stone-700 dark:text-stone-300 font-sans">
                <HelpCircle className="w-3.5 h-3.5" />
                Input text directly (SOP excerpt, resume summary, thesis abstract)
              </span>
              <div className="flex items-center gap-2 font-mono">
                <span className={text.length > maxChars ? 'text-rose-600 font-bold' : ''}>
                  {text.length} / {maxChars} chars
                </span>
              </div>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, maxChars))}
              rows={4}
              placeholder="e.g., Final-year B.Tech in Computer Engineering from Pune University (8.4 CGPA). Completed projects in embedded Linux and real-time RTOS sensor networks. Proficient in C, C++, and Python with coursework in computer architecture, distributed systems, and robotics control systems..."
              className="w-full p-3 text-xs sm:text-sm border border-dashed border-stone-300 dark:border-stone-700 bg-[#faf8f5] dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 leading-relaxed shadow-2xs font-sans"
            />

            {/* Scope & Threshold Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-stone-100/60 dark:bg-stone-800/40 border border-dashed border-stone-300 dark:border-stone-700 text-xs">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700 dark:text-stone-300 font-sans">
                  <input
                    type="checkbox"
                    checked={rankAllDatabase}
                    onChange={(e) => setRankAllDatabase(e.target.checked)}
                    className="rounded border-stone-300 text-stone-900 focus:ring-stone-600 w-4 h-4"
                  />
                  <span>Rank across all {totalDatabaseCount} catalog opportunities (override filters)</span>
                </label>
              </div>

              {/* Threshold Filter: Min match percentage */}
              <div className="flex items-center gap-2">
                <span className="text-stone-500 font-medium font-sans">Min match percentage:</span>
                <div className="flex items-center gap-1">
                  {[0, 0.4, 0.6, 0.75].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => onThresholdChange(t)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-colors cursor-pointer ${
                        minThreshold === t
                          ? 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 shadow-2xs'
                          : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      {t === 0 ? 'All' : `≥${Math.round(t * 100)}%`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons: Find Opportunities */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={!text.trim() || isRankingLoading}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-50 dark:bg-stone-100 dark:hover:bg-white dark:text-stone-900 font-mono text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isRankingLoading ? 'Finding Opportunities...' : 'Find Opportunities'}
                </button>

                {isMatchingActive && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-3 py-2 border border-dashed border-stone-400 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reset Match
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Active Semantic Results */}
          {isMatchingActive && stats && (
            <div className="p-3.5 rounded-lg bg-stone-50/70 dark:bg-stone-900/70 border border-dashed border-stone-300 dark:border-stone-700 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-900 dark:text-stone-100 font-sans">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
                  Results
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-stone-100/70 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800">
                  <div className="text-[10px] text-stone-500 uppercase">Evaluated</div>
                  <div className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                    {stats.candidates_evaluated} Opportunities
                  </div>
                </div>
                <div className="p-2 rounded bg-stone-100/70 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800">
                  <div className="text-[10px] text-stone-500 uppercase">Best Match Percentage</div>
                  <div className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                    {Math.round(stats.top_match_score * 100)}%
                  </div>
                </div>
                <div className="p-2 rounded bg-stone-100/70 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800">
                  <div className="text-[10px] text-stone-500 uppercase">Average Match</div>
                  <div className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                    {Math.round(stats.avg_match_score * 100)}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
