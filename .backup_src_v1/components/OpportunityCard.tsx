import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  Sparkles,
  Building2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Binary,
  Layers,
  Cpu,
  GraduationCap
} from 'lucide-react';
import { Opportunity, RankedResult } from '../api/types';
import { DeadlineBadge } from './DeadlineBadge';
import { getCountryFlag, formatFundingType } from '../utils/format';
import { useBookmarks } from '../context/BookmarkContext';
import { getUniversityBackdrop } from '../utils/universityBackdrops';

interface OpportunityCardProps {
  opportunity: Opportunity;
  similarityScore?: number;
  semanticResult?: RankedResult;
  viewMode?: 'grid' | 'list';
  searchQueryParam?: string;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  similarityScore,
  semanticResult,
  viewMode = 'grid',
  searchQueryParam = ''
}) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(opportunity.id);
  const [showMathDetails, setShowMathDetails] = useState(false);

  const fundingStyle = formatFundingType(opportunity.funding_type);
  const countryFlag = getCountryFlag(opportunity.host_country);

  // Link destination preserves current filter queries
  const detailLink = `/opportunity/${opportunity.id}${searchQueryParam ? `?${searchQueryParam}` : ''}`;

  const effectiveScore = semanticResult?.similarity ?? similarityScore;
  const matchPercentage = effectiveScore !== undefined ? Math.round(effectiveScore * 100) : null;

  // Confidence styling for Cosine Similarity
  const getMatchBadgeStyle = (pct: number) => {
    if (pct >= 75) {
      return {
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800',
        bar: 'bg-emerald-600 dark:bg-emerald-500',
        label: 'Very High Fit'
      };
    }
    if (pct >= 55) {
      return {
        badge: 'bg-teal-50 text-teal-800 border-teal-300 dark:bg-teal-950/70 dark:text-teal-300 dark:border-teal-800',
        bar: 'bg-teal-600 dark:bg-teal-500',
        label: 'Strong Fit'
      };
    }
    if (pct >= 35) {
      return {
        badge: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800',
        bar: 'bg-amber-600 dark:bg-amber-500',
        label: 'Moderate Fit'
      };
    }
    return {
      badge: 'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700',
      bar: 'bg-stone-400 dark:bg-stone-500',
      label: 'Partial Fit'
    };
  };

  const matchStyle = matchPercentage !== null ? getMatchBadgeStyle(matchPercentage) : null;

  return (
    <article
      className={`group relative rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900/95 p-5 overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.012] hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-400 dark:hover:border-amber-500/80 flex flex-col justify-between cursor-pointer ${
        effectiveScore && effectiveScore > 0.4 ? 'ring-1 ring-amber-400/30 dark:ring-amber-500/20 shadow-2xs' : ''
      } ${
        viewMode === 'list' ? 'sm:flex-row sm:items-center sm:gap-6' : 'h-full'
      }`}
    >
      {/* 
        University Campus Blurry Backdrop:
        - Only shows when mouse is hovered over the card (opacity-0 by default, group-hover:opacity-100)
        - Otherwise stays in the exact same clean state as right now
        - Features subtle scale zoom animation on hover (scale-100 group-hover:scale-110)
        - Blurry university architecture (colonnades, library arches, towers, trees) distinctly visible
      */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-400 ease-out overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 bg-cover bg-center transform scale-100 group-hover:scale-110 transition-transform duration-700 ease-out blur-[3px] opacity-55 dark:opacity-45"
          style={{ backgroundImage: `url("${getUniversityBackdrop(opportunity)}")` }}
        />
        {/* Soft gradient wash preserving bottom badge legibility while letting top campus architecture glow */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/40 to-white/10 dark:from-stone-900/95 dark:via-stone-900/40 dark:to-stone-900/10" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10 dark:from-amber-500/15 dark:to-indigo-500/15" />
      </div>

      {/* Top golden shimmer accent bar that appears on selection hover */}
      <div
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        aria-hidden="true"
      />

      <div className={`relative z-10 space-y-3 ${viewMode === 'list' ? 'sm:flex-1' : ''}`}>
        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {/* Country */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium">
              <span className="text-sm">{countryFlag}</span>
              <span>{opportunity.host_country}</span>
            </span>

            {/* Degree */}
            <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[11px] font-medium">
              {opportunity.degree_level === 'masters'
                ? "Master's"
                : opportunity.degree_level === 'phd'
                ? 'PhD'
                : 'MSc / PhD'}
            </span>

            {/* Funding Badge */}
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${fundingStyle.badgeClass}`}>
              {fundingStyle.label}
            </span>

            {/* Long Tail Badge */}
            {opportunity.popularity_tier === 'long_tail' ? (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800">
                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Long-Tail Award
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[11px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-500 rounded-md">
                Marquee Program
              </span>
            )}
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleBookmark(opportunity.id);
            }}
            className={`p-1.5 rounded-lg border transition-colors ${
              bookmarked
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                : 'bg-stone-50 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
            }`}
            aria-label={bookmarked ? 'Remove from saved' : 'Save opportunity'}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark this award'}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-emerald-700 dark:fill-emerald-400' : ''}`} />
          </button>
        </div>

        {/* Semantic Cosine Similarity Bar & Output */}
        {matchPercentage !== null && matchStyle && (
          <div className="pt-1.5 pb-0.5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-stone-700 dark:text-stone-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Cosine Similarity Match</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full border ${matchStyle.badge}`}>
                  {matchPercentage}% ({matchStyle.label})
                </span>
              </div>
            </div>

            {/* Meter Bar */}
            <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden shadow-inner">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${matchStyle.bar}`}
                style={{ width: `${Math.min(100, Math.max(8, matchPercentage))}%` }}
              />
            </div>

            {/* Top Matched Terms Pills */}
            {semanticResult?.matched_terms && semanticResult.matched_terms.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1">
                <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mr-1">
                  Vector Overlap:
                </span>
                {semanticResult.matched_terms.slice(0, 4).map((term) => (
                  <span
                    key={term}
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900"
                  >
                    +{term}
                  </span>
                ))}
              </div>
            )}

            {/* Interactive Toggle for Mathematical Vector Breakdown */}
            {semanticResult && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowMathDetails(!showMathDetails)}
                  className="text-[11px] text-stone-500 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium inline-flex items-center gap-1 transition-colors"
                >
                  <Binary className="w-3.5 h-3.5" />
                  <span>{showMathDetails ? 'Hide Cosine Vector Math' : 'Inspect Cosine Vector Math'}</span>
                  {showMathDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {/* Expanded Mathematical Vector Breakdown */}
                {showMathDetails && (
                  <div className="mt-2 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 text-xs space-y-2.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-[11px] border-b border-stone-200 dark:border-stone-700 pb-1.5">
                      <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">
                        cos(θ) = (q · d) / (||q|| * ||d||)
                      </span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        = {semanticResult.similarity.toFixed(3)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-stone-600 dark:text-stone-400">
                      <div className="p-1.5 rounded bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                        <div className="text-stone-400">q · d (Dot)</div>
                        <div className="font-bold text-stone-800 dark:text-stone-200">{semanticResult.dot_product.toFixed(2)}</div>
                      </div>
                      <div className="p-1.5 rounded bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                        <div className="text-stone-400">||q|| (Query)</div>
                        <div className="font-bold text-stone-800 dark:text-stone-200">{semanticResult.query_norm.toFixed(2)}</div>
                      </div>
                      <div className="p-1.5 rounded bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                        <div className="text-stone-400">||d|| (Doc)</div>
                        <div className="font-bold text-stone-800 dark:text-stone-200">{semanticResult.doc_norm.toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Dimensional Alignments */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                        Dimensional Alignment:
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div className="flex flex-col">
                          <span className="text-stone-500 text-[10px] flex items-center gap-1">
                            <Layers className="w-3 h-3" /> Field Fit
                          </span>
                          <span className="font-bold text-stone-800 dark:text-stone-200">
                            {Math.round(semanticResult.dimension_scores.field_similarity * 100)}%
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-stone-500 text-[10px] flex items-center gap-1">
                            <Cpu className="w-3 h-3" /> Skills Fit
                          </span>
                          <span className="font-bold text-stone-800 dark:text-stone-200">
                            {Math.round(semanticResult.dimension_scores.skills_similarity * 100)}%
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-stone-500 text-[10px] flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" /> Eligibility
                          </span>
                          <span className="font-bold text-stone-800 dark:text-stone-200">
                            {Math.round(semanticResult.dimension_scores.eligibility_fit * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Term Contributions */}
                    {semanticResult.top_contributions.length > 0 && (
                      <div className="pt-1 border-t border-stone-200 dark:border-stone-700/60">
                        <div className="text-[10px] font-semibold text-stone-500 mb-1">
                          Top Dot-Product Contributors:
                        </div>
                        <div className="space-y-1">
                          {semanticResult.top_contributions.slice(0, 3).map((item) => (
                            <div key={item.term} className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-stone-700 dark:text-stone-300">
                                {item.term}
                              </span>
                              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                                {item.contribution_percent}% of dot product
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-[11px] text-stone-600 dark:text-stone-400 italic pt-1 border-t border-stone-200 dark:border-stone-700/60">
                      {semanticResult.explanation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <div>
          <Link
            to={detailLink}
            className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-50 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors line-clamp-2 leading-snug"
          >
            {opportunity.title}
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mt-1">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{opportunity.provider_name}</span>
            {opportunity.host_institution && opportunity.host_institution !== opportunity.provider_name && (
              <span className="hidden sm:inline text-stone-400">
                • {opportunity.host_institution}
              </span>
            )}
          </div>
        </div>

        {/* Funding Summary Quote */}
        <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 font-medium bg-stone-50 dark:bg-stone-800/40 p-2.5 rounded-lg border border-stone-200/60 dark:border-stone-800">
          💰 {opportunity.funding_summary}
        </p>

        {/* Tags / Fields of study */}
        <div className="flex flex-wrap gap-1 text-[11px]">
          {opportunity.fields_of_study.slice(0, 3).map((field) => (
            <span
              key={field}
              className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-mono text-[10px]"
            >
              {field}
            </span>
          ))}
          {opportunity.fields_of_study.length > 3 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] text-stone-400 font-mono">
              +{opportunity.fields_of_study.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Footer / Action row */}
      <div
        className={`relative z-10 pt-3 mt-3 border-t border-stone-100/90 dark:border-stone-800/80 flex items-center justify-between gap-3 ${
          viewMode === 'list' ? 'sm:flex-col sm:items-end sm:justify-center sm:border-t-0 sm:pt-0 sm:mt-0' : ''
        }`}
      >
        <DeadlineBadge deadline={opportunity.application_deadline} />

        <Link
          to={detailLink}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
        >
          <span>View details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </article>
  );
};
