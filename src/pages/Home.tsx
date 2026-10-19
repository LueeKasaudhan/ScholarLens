import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  LayoutGrid,
  List,
  SlidersHorizontal,
  RotateCcw,
  AlertOctagon,
  ArrowUpDown,
  Search,
  Sparkles
} from 'lucide-react';
import {
  searchOpportunities,
  rankBySemanticMatch,
  Opportunity,
  SearchFilters,
  RankedResult,
  DegreeLevel,
  FundingType
} from '../api';
import { SearchBar } from '../components/SearchBar';
import { FilterSidebar } from '../components/FilterSidebar';
import { FilterChips } from '../components/FilterChips';
import { SemanticMatchPanel } from '../components/SemanticMatchPanel';
import { OpportunityCard } from '../components/OpportunityCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useDebounce } from '../hooks/useDebounce';

export const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Helper to initialize filters from URL parameters
  const initialFilters: SearchFilters = useMemo(() => {
    const q = searchParams.get('q') || undefined;
    const countries = searchParams.get('countries')?.split(',').filter(Boolean) || undefined;
    const degree = (searchParams.get('degree') as DegreeLevel) || undefined;
    const funding = (searchParams.get('funding')?.split(',').filter(Boolean) as FundingType[]) || undefined;
    const fields = searchParams.get('fields')?.split(',').filter(Boolean) || undefined;
    const deadline = searchParams.get('deadline') || undefined;
    const rollingParam = searchParams.get('rolling');
    const includeRolling = rollingParam !== null ? rollingParam === 'true' : true;
    const longTailParam = searchParams.get('long_tail');
    const longTailOnly = longTailParam !== null ? longTailParam === 'true' : true;
    const sortBy = (searchParams.get('sort') as SearchFilters['sort_by']) || 'deadline';

    return {
      query: q,
      host_countries: countries,
      degree_level: degree,
      funding_types: funding,
      fields_of_study: fields,
      deadline_before: deadline,
      include_rolling: includeRolling,
      long_tail_only: longTailOnly,
      sort_by: sortBy
    };
  }, []);

  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [searchInput, setSearchInput] = useState<string>(initialFilters.query || '');
  const debouncedSearchInput = useDebounce(searchInput, 300);

  // View mode: grid vs list
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Opportunities state
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [totalDatabaseCount, setTotalDatabaseCount] = useState<number>(112);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Semantic matching state
  const [backgroundText, setBackgroundText] = useState<string>('');
  const [similarityMap, setSimilarityMap] = useState<Map<string, number>>(new Map());
  const [isRankingLoading, setIsRankingLoading] = useState(false);

  // Synchronize debounced query input with filters
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      query: debouncedSearchInput.trim() ? debouncedSearchInput.trim() : undefined
    }));
  }, [debouncedSearchInput]);

  // Synchronize filters to URL search params so back button / bookmark links retain state
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.query) params.set('q', filters.query);
    if (filters.host_countries && filters.host_countries.length > 0) {
      params.set('countries', filters.host_countries.join(','));
    }
    if (filters.degree_level) params.set('degree', filters.degree_level);
    if (filters.funding_types && filters.funding_types.length > 0) {
      params.set('funding', filters.funding_types.join(','));
    }
    if (filters.fields_of_study && filters.fields_of_study.length > 0) {
      params.set('fields', filters.fields_of_study.join(','));
    }
    if (filters.deadline_before) params.set('deadline', filters.deadline_before);
    if (filters.include_rolling === false) params.set('rolling', 'false');
    if (filters.long_tail_only === false) params.set('long_tail', 'false');
    if (filters.sort_by && filters.sort_by !== 'deadline') params.set('sort', filters.sort_by);

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Fetch opportunities whenever filters change (excluding relevance sort override)
  const fetchOpportunities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch filtered candidate set
      const results = await searchOpportunities(filters);
      setOpportunities(results);

      // Extract unique countries from unfiltered source when available or current results
      const countries = Array.from(new Set(results.map((r) => r.host_country))).sort();
      if (countries.length > 0) {
        setAvailableCountries((prev) => Array.from(new Set([...prev, ...countries])).sort());
      }

      // 2. If semantic matching background text is active, re-rank this filtered subset
      // CRITICAL PIPELINE RULE: Filters run first, then semantic ranking re-ranks the filtered subset
      if (backgroundText.trim() && results.length > 0) {
        setIsRankingLoading(true);
        const candidateIds = results.map((r) => r.id);
        const ranked: RankedResult[] = await rankBySemanticMatch(backgroundText, candidateIds);

        const scoreMap = new Map<string, number>();
        ranked.forEach((item) => scoreMap.set(item.id, item.similarity));
        setSimilarityMap(scoreMap);

        // If sorted by relevance, order directly by similarity score
        if (filters.sort_by === 'relevance') {
          results.sort((a, b) => {
            const scoreA = scoreMap.get(a.id) ?? 0;
            const scoreB = scoreMap.get(b.id) ?? 0;
            return scoreB - scoreA;
          });
          setOpportunities([...results]);
        }
        setIsRankingLoading(false);
      } else if (!backgroundText.trim()) {
        setSimilarityMap(new Map());
      }
    } catch (err: unknown) {
      console.error(err);
      setError('Failed to fetch opportunities. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [filters, backgroundText]);

  // Initial load to discover all available countries from total pool
  useEffect(() => {
    let isMounted = true;
    searchOpportunities({ long_tail_only: false }).then((all) => {
      if (isMounted) {
        setTotalDatabaseCount(all.length);
        const countries = Array.from(new Set(all.map((o) => o.host_country))).sort();
        setAvailableCountries(countries);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  // Handle semantic match submit
  const handleSemanticMatch = async (text: string) => {
    setBackgroundText(text);
    setIsRankingLoading(true);

    try {
      const candidateIds = opportunities.map((o) => o.id);
      const ranked = await rankBySemanticMatch(text, candidateIds);
      const scoreMap = new Map<string, number>();
      ranked.forEach((item) => scoreMap.set(item.id, item.similarity));
      setSimilarityMap(scoreMap);

      // Automatically switch to relevance sort
      setFilters((prev) => ({ ...prev, sort_by: 'relevance' }));

      // Re-order active opportunities by similarity
      const sorted = [...opportunities].sort((a, b) => {
        const scoreA = scoreMap.get(a.id) ?? 0;
        const scoreB = scoreMap.get(b.id) ?? 0;
        return scoreB - scoreA;
      });
      setOpportunities(sorted);
    } catch (e) {
      console.error('Semantic match error', e);
    } finally {
      setIsRankingLoading(false);
    }
  };

  const handleClearSemanticMatch = () => {
    setBackgroundText('');
    setSimilarityMap(new Map());
    setFilters((prev) => ({ ...prev, sort_by: 'deadline' }));
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setFilters({
      query: undefined,
      host_countries: undefined,
      degree_level: undefined,
      funding_types: undefined,
      fields_of_study: undefined,
      deadline_before: undefined,
      include_rolling: true,
      long_tail_only: true,
      sort_by: 'deadline'
    });
    handleClearSemanticMatch();
  };

  const isSemanticActive = Boolean(backgroundText.trim() && similarityMap.size > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Hero / Page Headline with Editorial Polish */}
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-3 border border-emerald-200 dark:border-emerald-800">
          <Sparkles className="w-3.5 h-3.5" />
          The Long-Tail Discovery Engine
        </div>
        <h1 className="font-serif-title text-3xl sm:text-4xl md:text-5xl text-stone-900 dark:text-stone-50 tracking-tight leading-tight">
          Beyond the Famous Ten.
        </h1>
        <p className="mt-2 text-sm sm:text-base text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed">
          Skip the saturated 1% marquee grants. Discover legitimate, high-funding European &amp; Asian university awards, research chairs, and lab stipends for Indian engineering &amp; CS applicants.
        </p>
      </div>

      {/* Main Search & Control Bar */}
      <div className="mb-4">
        <SearchBar
          value={searchInput}
          onChange={(val) => setSearchInput(val)}
        />
      </div>

      {/* Semantic Matching Collapsible Bar */}
      <div className="mb-6">
        <SemanticMatchPanel
          onMatch={handleSemanticMatch}
          onClear={handleClearSemanticMatch}
          isMatchingActive={isSemanticActive}
          isRankingLoading={isRankingLoading}
          candidateCount={opportunities.length}
        />
      </div>

      {/* Layout Grid: Left Sidebar + Right Results */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Left Filter Sidebar */}
        <FilterSidebar
          filters={filters}
          onChange={setFilters}
          onReset={handleResetFilters}
          availableCountries={availableCountries}
          isOpenMobile={isMobileFilterOpen}
          onCloseMobile={() => setIsMobileFilterOpen(false)}
        />

        {/* Right Main Results Column */}
        <div className="flex-1 w-full min-w-0">
          {/* Active Filter Chips */}
          <div className="mb-3">
            <FilterChips
              filters={filters}
              onChange={setFilters}
              onClearAll={handleResetFilters}
            />
          </div>

          {/* Results Header: Count & Sorting & View Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-stone-200 dark:border-stone-800">
            {/* Live Count */}
            <div
              className="flex items-center gap-2 text-xs sm:text-sm text-stone-700 dark:text-stone-300"
              aria-live="polite"
              aria-atomic="true"
            >
              <span className="font-bold text-stone-900 dark:text-stone-100">
                {isLoading ? 'Updating...' : `Showing ${opportunities.length} of ${totalDatabaseCount}`}
              </span>
              <span>opportunities</span>
              {filters.long_tail_only ?? true ? (
                <span className="hidden sm:inline-block text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  (Long-tail filtered)
                </span>
              ) : null}
            </div>

            {/* Controls: Mobile Filter Button, Sort Dropdown, Grid/List Toggle */}
            <div className="flex items-center gap-2">
              {/* Mobile Filter Drawer Button */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-800 shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 hidden sm:inline" />
                <label htmlFor="sort-select" className="sr-only">
                  Sort Opportunities
                </label>
                <select
                  id="sort-select"
                  value={filters.sort_by || 'deadline'}
                  onChange={(e) => {
                    const newSort = e.target.value as SearchFilters['sort_by'];
                    setFilters((prev) => ({ ...prev, sort_by: newSort }));
                  }}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="deadline">Sort: Deadline (Soonest)</option>
                  <option value="recently_verified">Sort: Recently Verified</option>
                  <option value="relevance" disabled={!isSemanticActive}>
                    Sort: Relevance {isSemanticActive ? '(Semantic)' : '(Paste profile first)'}
                  </option>
                </select>
              </div>

              {/* View Toggle (Grid / List) */}
              <div className="hidden sm:flex items-center border border-stone-200 dark:border-stone-800 rounded-lg p-0.5 bg-stone-100 dark:bg-stone-900">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                  }`}
                  aria-label="Grid view"
                  title="Grid view"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                  }`}
                  aria-label="List view"
                  title="List view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 text-center space-y-3">
              <AlertOctagon className="w-8 h-8 text-rose-600 mx-auto" />
              <p className="font-semibold">{error}</p>
              <button
                type="button"
                onClick={fetchOpportunities}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
              >
                Retry Search
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !error && (
            <LoadingSkeleton count={6} viewMode={viewMode} />
          )}

          {/* Empty State with Suggestions */}
          {!isLoading && !error && opportunities.length === 0 && (
            <div className="p-10 rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-lg">
                  No opportunities match your current filters
                </h3>
                <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-1 leading-relaxed">
                  Try broadening your search criteria. Many long-tail awards span multiple interdisciplinary departments.
                </p>
              </div>

              {/* Suggestions */}
              <div className="bg-stone-50 dark:bg-stone-900/60 p-4 rounded-xl text-xs text-left space-y-2 border border-stone-200/80 dark:border-stone-800">
                <span className="font-semibold text-stone-700 dark:text-stone-300 block">
                  Suggested adjustments:
                </span>
                <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-400">
                  {filters.host_countries && filters.host_countries.length > 0 && (
                    <li>Try removing the country filter to compare awards across Europe and Asia</li>
                  )}
                  {filters.long_tail_only && (
                    <li>Toggle off &quot;Long-tail only&quot; to inspect all programs including DAAD/Chevening</li>
                  )}
                  {filters.deadline_before && (
                    <li>Clear the deadline-before constraint to see spring or rolling intake cycles</li>
                  )}
                  <li>Remove narrow technical sub-disciplines or free-text keywords</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-lg bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 font-semibold text-xs hover:bg-stone-800 transition-colors inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset all filters
              </button>
            </div>
          )}

          {/* Results Grid / List */}
          {!isLoading && !error && opportunities.length > 0 && (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
                  : 'space-y-3'
              }
            >
              {opportunities.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opportunity={opp}
                  similarityScore={similarityMap.get(opp.id)}
                  viewMode={viewMode}
                  searchQueryParam={searchParams.toString()}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
