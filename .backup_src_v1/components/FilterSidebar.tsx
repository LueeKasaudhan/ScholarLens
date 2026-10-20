import React, { useState, useId } from 'react';
import {
  RotateCcw,
  Sparkles,
  Info,
  Calendar,
  Globe2,
  GraduationCap,
  Banknote,
  Cpu,
  X
} from 'lucide-react';
import { DegreeLevel, FundingType, SearchFilters } from '../api/types';
import { getCountryFlag } from '../utils/format';

interface FilterSidebarProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onReset: () => void;
  availableCountries: string[];
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const COMMON_FIELDS = [
  'Embedded Systems',
  'Robotics',
  'VLSI',
  'Machine Learning',
  'Cybersecurity',
  'Systems Programming',
  'Distributed Systems',
  'Computer Vision',
  'Quantum Computing',
  'Data Science',
  'Computer Science'
];

const FUNDING_OPTIONS: { id: FundingType; label: string }[] = [
  { id: 'full', label: 'Full Funding (Tuition + Stipend)' },
  { id: 'partial', label: 'Partial Funding / Reduction' },
  { id: 'tuition_waiver', label: '100% Tuition Waiver' },
  { id: 'stipend_only', label: 'Living Stipend / Salary' },
  { id: 'travel_grant', label: 'Travel / Research Grant' }
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onChange,
  onReset,
  availableCountries,
  isOpenMobile = false,
  onCloseMobile
}) => {
  const [countrySearch, setCountrySearch] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const countryInputId = useId();
  const deadlineInputId = useId();

  const filteredCountries = availableCountries.filter((c) =>
    c.toLowerCase().includes(countrySearch.toLowerCase().trim())
  );

  const handleCountryToggle = (country: string) => {
    const current = filters.host_countries || [];
    const updated = current.includes(country)
      ? current.filter((c) => c !== country)
      : [...current, country];
    onChange({ ...filters, host_countries: updated });
  };

  const handleFundingToggle = (funding: FundingType) => {
    const current = filters.funding_types || [];
    const updated = current.includes(funding)
      ? current.filter((f) => f !== funding)
      : [...current, funding];
    onChange({ ...filters, funding_types: updated });
  };

  const handleFieldToggle = (field: string) => {
    const current = filters.fields_of_study || [];
    const updated = current.includes(field)
      ? current.filter((f) => f !== field)
      : [...current, field];
    onChange({ ...filters, fields_of_study: updated });
  };

  const hasActiveFilters = Boolean(
    (filters.host_countries && filters.host_countries.length > 0) ||
    filters.degree_level ||
    (filters.funding_types && filters.funding_types.length > 0) ||
    (filters.fields_of_study && filters.fields_of_study.length > 0) ||
    filters.deadline_before ||
    filters.include_rolling === false ||
    filters.long_tail_only === false
  );

  const sidebarContent = (
    <div className="space-y-6 text-sm">
      {/* Header with Title and Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
        <h2 className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <span>Filters</span>
        </h2>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 flex items-center gap-1 font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset all
          </button>
        )}
      </div>

      {/* CORE THESIS: Long-tail only toggle (Default True) */}
      <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <label
              htmlFor="long-tail-toggle"
              className="font-semibold text-stone-900 dark:text-stone-100 cursor-pointer select-none text-xs sm:text-sm"
            >
              Long-Tail Only
            </label>
            <div className="relative inline-block">
              <button
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-emerald-600 dark:text-emerald-400 p-0.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                aria-label="What is Long-Tail Only?"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
              {showTooltip && (
                <div className="absolute left-0 bottom-full mb-2 w-64 p-2.5 bg-stone-900 dark:bg-stone-800 text-stone-100 text-xs rounded-lg shadow-xl z-50 pointer-events-none leading-relaxed border border-stone-700">
                  <p className="font-semibold text-emerald-400 mb-1">Why Long-Tail Only?</p>
                  Existing search engines bias toward the famous marquee programs (DAAD, Fulbright, Chevening, Erasmus Mundus). Turning this on hides them and surfaces genuine, high-value university &amp; institute scholarships with far better odds.
                </div>
              )}
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            id="long-tail-toggle"
            role="switch"
            aria-checked={filters.long_tail_only ?? true}
            onClick={() =>
              onChange({
                ...filters,
                long_tail_only: !(filters.long_tail_only ?? true)
              })
            }
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
              (filters.long_tail_only ?? true) ? 'bg-emerald-700' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                (filters.long_tail_only ?? true) ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-1 leading-normal">
          {(filters.long_tail_only ?? true)
            ? 'Filtering out top 4 marquee grants. Showing high-odds university & institute awards.'
            : 'Showing all opportunities (including DAAD, Chevening, Fulbright, Erasmus).'}
        </p>
      </div>

      {/* Host Countries (Searchable multi-select) */}
      <div className="space-y-2">
        <label htmlFor={countryInputId} className="font-semibold text-stone-800 dark:text-stone-200 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Globe2 className="w-4 h-4 text-stone-500" />
            Host Country
          </span>
          {filters.host_countries && filters.host_countries.length > 0 && (
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              {filters.host_countries.length} selected
            </span>
          )}
        </label>
        <input
          id={countryInputId}
          type="text"
          value={countrySearch}
          onChange={(e) => setCountrySearch(e.target.value)}
          placeholder="Filter countries..."
          className="w-full px-2.5 py-1.5 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
        <div className="max-h-36 overflow-y-auto space-y-1 pr-1 pt-1 text-xs">
          {filteredCountries.map((country) => {
            const isChecked = filters.host_countries?.includes(country) || false;
            return (
              <label
                key={country}
                className="flex items-center gap-2 p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleCountryToggle(country)}
                  className="rounded border-stone-300 dark:border-stone-600 text-emerald-700 focus:ring-emerald-600 h-3.5 w-3.5"
                />
                <span className="text-sm">{getCountryFlag(country)}</span>
                <span className="text-stone-700 dark:text-stone-300 flex-1 truncate">
                  {country}
                </span>
              </label>
            );
          })}
          {filteredCountries.length === 0 && (
            <p className="text-stone-400 text-xs py-1">No matching country.</p>
          )}
        </div>
      </div>

      {/* Degree Level */}
      <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
        <label className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-stone-500" />
          Target Degree
        </label>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {[
            { id: undefined, label: 'All Degrees' },
            { id: 'masters', label: "Master's Only" },
            { id: 'masters_or_phd', label: "MSc + PhD Track" },
            { id: 'phd', label: 'PhD' }
          ].map((item) => {
            const isSelected = filters.degree_level === item.id;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() =>
                  onChange({ ...filters, degree_level: item.id as DegreeLevel | undefined })
                }
                className={`py-1.5 px-2 rounded-md text-center transition-colors font-medium border ${
                  isSelected
                    ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100'
                    : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Funding Types (Checkboxes) */}
      <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
        <label className="font-semibold text-stone-800 dark:text-stone-200 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Banknote className="w-4 h-4 text-stone-500" />
            Funding Structure
          </span>
          {filters.funding_types && filters.funding_types.length > 0 && (
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              {filters.funding_types.length} selected
            </span>
          )}
        </label>
        <div className="space-y-1.5 text-xs">
          {FUNDING_OPTIONS.map((f) => {
            const isChecked = filters.funding_types?.includes(f.id) || false;
            return (
              <label
                key={f.id}
                className="flex items-center gap-2 p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleFundingToggle(f.id)}
                  className="rounded border-stone-300 dark:border-stone-600 text-emerald-700 focus:ring-emerald-600 h-3.5 w-3.5"
                />
                <span className="text-stone-700 dark:text-stone-300 leading-snug">
                  {f.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Fields of Study (Multi-select Chips) */}
      <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
        <label className="font-semibold text-stone-800 dark:text-stone-200 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-stone-500" />
            Technical Disciplines
          </span>
          {filters.fields_of_study && filters.fields_of_study.length > 0 && (
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              {filters.fields_of_study.length} active
            </span>
          )}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_FIELDS.map((field) => {
            const isSelected = filters.fields_of_study?.includes(field) || false;
            return (
              <button
                key={field}
                type="button"
                onClick={() => handleFieldToggle(field)}
                className={`text-[11px] font-medium px-2 py-1 rounded-md transition-colors border ${
                  isSelected
                    ? 'bg-emerald-700 text-stone-50 border-emerald-800'
                    : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                {field}
              </button>
            );
          })}
        </div>
      </div>

      {/* Deadlines & Rolling */}
      <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
        <label htmlFor={deadlineInputId} className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-stone-500" />
          Deadline Before
        </label>
        <input
          id={deadlineInputId}
          type="date"
          value={filters.deadline_before || ''}
          onChange={(e) =>
            onChange({
              ...filters,
              deadline_before: e.target.value || undefined
            })
          }
          className="w-full px-2.5 py-1.5 text-xs rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />

        {/* Include Rolling Toggle */}
        <label className="flex items-center gap-2 pt-1 text-xs cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.include_rolling ?? true}
            onChange={(e) =>
              onChange({
                ...filters,
                include_rolling: e.target.checked
              })
            }
            className="rounded border-stone-300 dark:border-stone-600 text-emerald-700 focus:ring-emerald-600 h-3.5 w-3.5"
          />
          <span className="text-stone-700 dark:text-stone-300">
            Include rolling deadlines
          </span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 self-start sticky top-20 bg-stone-50 dark:bg-stone-900/60 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-stone-900/60 backdrop-blur-xs flex justify-end"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-80 max-w-full bg-stone-50 dark:bg-stone-950 h-full p-5 overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 mb-4">
              <span className="font-bold text-stone-900 dark:text-stone-100">Filter Search</span>
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-md text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1">{sidebarContent}</div>
            <div className="pt-4 border-t border-stone-200 dark:border-stone-800 mt-4">
              <button
                onClick={onCloseMobile}
                className="w-full py-2.5 px-4 bg-emerald-700 text-white rounded-lg font-medium text-sm hover:bg-emerald-800 transition-colors"
              >
                Apply &amp; Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
