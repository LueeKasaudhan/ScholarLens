import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Sparkles, Building2, ArrowRight } from 'lucide-react';
import { Opportunity } from '../api/types';
import { DeadlineBadge } from './DeadlineBadge';
import { getCountryFlag, formatDegreeLevel, formatFundingType } from '../utils/format';
import { useBookmarks } from '../context/BookmarkContext';

interface OpportunityCardProps {
  opportunity: Opportunity;
  similarityScore?: number;
  viewMode?: 'grid' | 'list';
  searchQueryParam?: string;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  similarityScore,
  viewMode = 'grid',
  searchQueryParam = ''
}) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(opportunity.id);

  const fundingStyle = formatFundingType(opportunity.funding_type);
  const countryFlag = getCountryFlag(opportunity.host_country);

  // Link destination preserves current filter queries
  const detailLink = `/opportunity/${opportunity.id}${searchQueryParam ? `?${searchQueryParam}` : ''}`;

  const matchPercentage = similarityScore !== undefined ? Math.round(similarityScore * 100) : null;

  return (
    <article
      className={`group relative rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-white dark:bg-stone-900 p-5 transition-all duration-200 hover:shadow-md hover:border-stone-300 dark:hover:border-stone-700 flex flex-col justify-between ${
        viewMode === 'list' ? 'sm:flex-row sm:items-center sm:gap-6' : 'h-full'
      }`}
    >
      <div className={`space-y-3 ${viewMode === 'list' ? 'sm:flex-1' : ''}`}>
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

        {/* Semantic Match Percentage Bar (if active) */}
        {matchPercentage !== null && (
          <div className="pt-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-stone-600 dark:text-stone-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Semantic Profile Fit
              </span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                {matchPercentage}% Match
              </span>
            </div>
            <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 dark:bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(10, matchPercentage))}%` }}
              />
            </div>
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
        className={`pt-3 mt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between gap-3 ${
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
