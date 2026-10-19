import React from 'react';
import { X } from 'lucide-react';
import { SearchFilters, FundingType } from '../api/types';
import { formatFundingType } from '../utils/format';

interface FilterChipsProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onClearAll: () => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  onChange,
  onClearAll
}) => {
  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  // Query
  if (filters.query) {
    chips.push({
      key: `query-${filters.query}`,
      label: `Keyword: "${filters.query}"`,
      onRemove: () => onChange({ ...filters, query: undefined })
    });
  }

  // Long-tail only off (user deliberately included well-known)
  if (filters.long_tail_only === false) {
    chips.push({
      key: 'all-tiers',
      label: 'Including Well-Known Awards (DAAD, etc.)',
      onRemove: () => onChange({ ...filters, long_tail_only: true })
    });
  }

  // Countries
  if (filters.host_countries && filters.host_countries.length > 0) {
    filters.host_countries.forEach((country) => {
      chips.push({
        key: `country-${country}`,
        label: `Country: ${country}`,
        onRemove: () =>
          onChange({
            ...filters,
            host_countries: filters.host_countries?.filter((c) => c !== country)
          })
      });
    });
  }

  // Degree Level
  if (filters.degree_level) {
    const label =
      filters.degree_level === 'masters'
        ? "Degree: Master's"
        : filters.degree_level === 'phd'
        ? 'Degree: PhD'
        : 'Degree: Master/PhD';
    chips.push({
      key: `degree-${filters.degree_level}`,
      label,
      onRemove: () => onChange({ ...filters, degree_level: undefined })
    });
  }

  // Funding Types
  if (filters.funding_types && filters.funding_types.length > 0) {
    filters.funding_types.forEach((ft) => {
      chips.push({
        key: `funding-${ft}`,
        label: formatFundingType(ft as FundingType).label,
        onRemove: () =>
          onChange({
            ...filters,
            funding_types: filters.funding_types?.filter((t) => t !== ft)
          })
      });
    });
  }

  // Fields of Study
  if (filters.fields_of_study && filters.fields_of_study.length > 0) {
    filters.fields_of_study.forEach((field) => {
      chips.push({
        key: `field-${field}`,
        label: field,
        onRemove: () =>
          onChange({
            ...filters,
            fields_of_study: filters.fields_of_study?.filter((f) => f !== field)
          })
      });
    });
  }

  // Deadline before
  if (filters.deadline_before) {
    chips.push({
      key: `deadline-${filters.deadline_before}`,
      label: `Before ${filters.deadline_before}`,
      onRemove: () => onChange({ ...filters, deadline_before: undefined })
    });
  }

  // Rolling excluded
  if (filters.include_rolling === false) {
    chips.push({
      key: 'rolling-off',
      label: 'Excluding Rolling',
      onRemove: () => onChange({ ...filters, include_rolling: true })
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 py-1 text-xs">
      <span className="text-stone-500 dark:text-stone-400 font-medium mr-1">Active:</span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-200/70 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-medium border border-stone-300/80 dark:border-stone-700 hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors"
        >
          {chip.label}
          <button
            onClick={chip.onRemove}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-100 rounded-full focus:outline-none"
            aria-label={`Remove filter ${chip.label}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline ml-1"
      >
        Clear all
      </button>
    </div>
  );
};
