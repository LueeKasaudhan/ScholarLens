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
    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-100/60 dark:bg-stone-900/40 overflow-hidden transition-all duration-200 shadow-xs">
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
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                Semantic Profile Matcher
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                <Binary className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Cosine Similarity Engine
              </span>
              {isMatchingActive && (
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full border border-emerald-300 dark:border-emerald-800 animate-pulse">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 hidden sm:block">
              Paste your degree, research interests, or tech stack. Vectorizes your background and calculates mathematical cosine angles against all catalog opportunities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-stone-500">
          <span className="text-xs font-medium hidden md:inline">
            {isOpen ? 'Collapse' : isMatchingActive ? 'Adjust Profile & Stats' : 'Open Matcher'}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Body */}
      {isOpen && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-2 border-t border-stone-200 dark:border-stone-800 space-y-4">
          {/* Preset Profile Pills */}
          <div>
            <div className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>Or click a sample student profile:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PROFILES.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleSelectPreset(p.text)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors text-left font-medium shadow-2xs"
                  title={p.desc}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <span className="flex items-center gap-1 font-medium text-stone-700 dark:text-stone-300">
                <HelpCircle className="w-3.5 h-3.5" />
                Input text directly (SOP excerpt, resume summary, thesis abstract)
              </span>
              <div className="flex items-center gap-2">
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
              className="w-full p-3 text-xs sm:text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 leading-relaxed shadow-xs"
            />

            {/* Scope & Threshold Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 text-xs">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700 dark:text-stone-300">
                  <input
                    type="checkbox"
                    checked={rankAllDatabase}
                    onChange={(e) => setRankAllDatabase(e.target.checked)}
                    className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span>Rank across all {totalDatabaseCount} catalog opportunities (override filters)</span>
                </label>
              </div>

              {/* Threshold Filter */}
              <div className="flex items-center gap-2">
                <span className="text-stone-500 font-medium">Min Cosine Match:</span>
                <div className="flex items-center gap-1">
                  {[0, 0.4, 0.6, 0.75].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => onThresholdChange(t)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                        minThreshold === t
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                      }`}
                    >
                      {t === 0 ? 'All' : `≥${Math.round(t * 100)}%`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={!text.trim() || isRankingLoading}
                  className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-medium text-xs sm:text-sm hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  {isRankingLoading ? 'Computing Cosine Vectors...' : 'Calculate Cosine Matches'}
                </button>

                {isMatchingActive && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-3 py-2 rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Reset Match
                  </button>
                )}

                {isMatchingActive && onOpenDistributionModal && (
                  <button
                    type="button"
                    onClick={onOpenDistributionModal}
                    className="px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>View Vector Distribution</span>
                  </button>
                )}
              </div>

              <div className="text-[11px] font-mono text-stone-500 dark:text-stone-400 bg-stone-200/50 dark:bg-stone-800/50 px-2 py-1 rounded">
                cos(θ) = (q · d) / (||q|| * ||d||)
              </div>
            </div>
          </form>

          {/* Active Semantic Vector Space Telemetry */}
          {isMatchingActive && stats && (
            <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-emerald-200 dark:border-emerald-900/60 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  Semantic Vector Space Results
                </span>
                <span className="text-[11px] font-mono font-normal text-stone-500">
                  Computed in {stats.execution_time_ms}ms
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800">
                  <div className="text-[10px] text-stone-500 uppercase">Evaluated</div>
                  <div className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                    {stats.candidates_evaluated} Opportunities
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800">
                  <div className="text-[10px] text-stone-500 uppercase">Top Cosine Fit</div>
                  <div className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                    {Math.round(stats.top_match_score * 100)}%
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800">
                  <div className="text-[10px] text-stone-500 uppercase">Avg Cosine Fit</div>
                  <div className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                    {Math.round(stats.avg_match_score * 100)}%
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800">
                  <div className="text-[10px] text-stone-500 uppercase">Dimensions</div>
                  <div className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                    {stats.vocabulary_size} Terms
                  </div>
                </div>
              </div>

              {/* Extracted Tokens */}
              {stats.query_tokens.length > 0 && (
                <div className="pt-1.5 flex flex-wrap items-center gap-1 text-[11px]">
                  <span className="text-[10px] font-semibold text-stone-500 uppercase mr-1">
                    Extracted Profile Vectors:
                  </span>
                  {stats.query_tokens.map((token) => (
                    <span
                      key={token}
                      className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] border border-emerald-200 dark:border-emerald-900"
                    >
                      {token.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
