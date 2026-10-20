import React from 'react';
import { X, Sparkles, BarChart2, Binary, ExternalLink, Layers, CheckCircle2 } from 'lucide-react';
import { RankedResult, Opportunity, SemanticEngineStats } from '../api/types';
import { Link } from 'react-router-dom';

interface VectorDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: RankedResult[];
  opportunities: Opportunity[];
  stats: SemanticEngineStats | null;
  backgroundText: string;
}

export const VectorDistributionModal: React.FC<VectorDistributionModalProps> = ({
  isOpen,
  onClose,
  results,
  opportunities,
  stats,
  backgroundText
}) => {
  if (!isOpen) return null;

  // Map opportunity IDs to objects
  const oppMap = new Map<string, Opportunity>();
  opportunities.forEach((o) => oppMap.set(o.id, o));

  // Compute distribution buckets
  const buckets = [
    { label: '80% - 100% (Exceptional Match)', min: 0.8, max: 1.0, color: 'bg-emerald-600', count: 0 },
    { label: '60% - 79% (Strong Alignment)', min: 0.6, max: 0.8, color: 'bg-teal-600', count: 0 },
    { label: '40% - 59% (Moderate Alignment)', min: 0.4, max: 0.6, color: 'bg-amber-500', count: 0 },
    { label: '20% - 39% (Partial Overlap)', min: 0.2, max: 0.4, color: 'bg-stone-400', count: 0 },
    { label: '0% - 19% (Low / Disjoint)', min: 0.0, max: 0.2, color: 'bg-stone-300 dark:bg-stone-700', count: 0 }
  ];

  for (const r of results) {
    for (const b of buckets) {
      if (r.similarity >= b.min && (b.max === 1.0 ? r.similarity <= b.max : r.similarity < b.max)) {
        b.count += 1;
        break;
      }
    }
  }

  const maxBucketCount = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Semantic Engine Inspection
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-50 font-serif-title">
              Cosine Similarity Vector Space Distribution
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              Inspection of dot products and cosine angles between your background query vector and the {results.length} catalog opportunities.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vector Math Formula Card */}
        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-stone-800 dark:text-stone-200">
            <span className="flex items-center gap-1.5">
              <Binary className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              cos(θ) = (q · d) / (||q|| * ||d||)
            </span>
            <span className="text-emerald-700 dark:text-emerald-400">
              Evaluated {results.length} Candidates
            </span>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            Every scholarship opportunity is transformed into a sparse multi-dimensional vector weighted by inverse document frequency (IDF) with boosts on fields of study and technical tags. The angle θ measures conceptual alignment independent of document length.
          </p>
        </div>

        {/* Score Distribution Chart */}
        <div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-600" />
            <span>Score Distribution Across Opportunity Catalog</span>
          </h3>

          <div className="space-y-2.5">
            {buckets.map((b) => {
              const pctOfMax = (b.count / maxBucketCount) * 100;
              const pctOfTotal = results.length > 0 ? Math.round((b.count / results.length) * 100) : 0;
              return (
                <div key={b.label} className="text-xs space-y-1">
                  <div className="flex items-center justify-between text-stone-700 dark:text-stone-300 font-medium">
                    <span>{b.label}</span>
                    <span className="font-mono text-stone-500">
                      {b.count} awards ({pctOfTotal}%)
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full ${b.color} transition-all duration-500`}
                      style={{ width: `${Math.max(b.count > 0 ? 4 : 0, pctOfMax)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 8 Ranked Matches Table */}
        <div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Top Ranked Semantic Matches</span>
          </h3>

          <div className="divide-y divide-stone-200 dark:divide-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
            {results.slice(0, 8).map((r, idx) => {
              const opp = oppMap.get(r.id);
              if (!opp) return null;
              return (
                <div key={r.id} className="p-3 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <Link
                        to={`/opportunity/${opp.id}`}
                        onClick={onClose}
                        className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100 hover:text-emerald-700 dark:hover:text-emerald-400 truncate block"
                      >
                        {opp.title}
                      </Link>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-500 mt-1 pl-7">
                      <span>{opp.provider_name}</span>
                      <span>•</span>
                      <span>{opp.host_country}</span>
                      {r.matched_terms.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-emerald-700 dark:text-emerald-400">
                            Overlaps: {r.matched_terms.slice(0, 3).join(', ')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-400">
                      {Math.round(r.similarity * 100)}%
                    </div>
                    <div className="text-[10px] font-mono text-stone-400">
                      cos(θ)={r.similarity.toFixed(3)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-stone-200 dark:border-stone-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
