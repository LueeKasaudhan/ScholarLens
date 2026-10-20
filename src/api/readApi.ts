import { getAllOpportunitiesInternal, simulateLatency } from './store';
import { rankCandidates } from './semanticStub';
import { Opportunity, RankedResult, SearchFilters } from './types';

/**
 * MODULE: readApi.ts
 * ROLE: main_reader (PostgreSQL Read-Only Replica Role)
 *
 * Provides read-only access to published opportunities and deterministic semantic matching.
 * STRICT ENFORCEMENT: Contains ZERO write, mutation, or update functions.
 */

/**
 * FUTURE BACKEND CONTRACT:
 * Role: main_reader
 * GET /api/opportunities/search
 * Query Parameters:
 *   - q: string
 *   - host_countries: string (comma-separated)
 *   - degree_level: 'masters' | 'phd' | 'masters_or_phd'
 *   - funding_types: string (comma-separated)
 *   - fields_of_study: string (comma-separated)
 *   - deadline_before: ISO date string
 *   - include_rolling: boolean
 *   - long_tail_only: boolean (default: true)
 *   - sort_by: 'deadline' | 'recently_verified' | 'relevance'
 * Returns: Opportunity[]
 */
export async function searchOpportunities(filters: SearchFilters = {}): Promise<Opportunity[]> {
  await simulateLatency();

  const longTailOnly = filters.long_tail_only ?? true;
  const includeRolling = filters.include_rolling ?? true;
  const nowStr = new Date().toISOString().split('T')[0];

  const allOpportunities = getAllOpportunitiesInternal();
  let results = allOpportunities.filter((opp) => opp.is_active);

  // Filter: Long-Tail Only (Default True)
  if (longTailOnly) {
    results = results.filter((opp) => opp.popularity_tier === 'long_tail');
  }

  // Filter: Free text query over title, provider, fields, tags, summary
  if (filters.query && filters.query.trim()) {
    const q = filters.query.toLowerCase().trim();
    results = results.filter((opp) => {
      const titleMatch = opp.title.toLowerCase().includes(q);
      const providerMatch = opp.provider_name.toLowerCase().includes(q);
      const hostMatch = (opp.host_institution || '').toLowerCase().includes(q);
      const countryMatch = opp.host_country.toLowerCase().includes(q);
      const fieldsMatch = opp.fields_of_study.some((f) => f.toLowerCase().includes(q));
      const tagsMatch = opp.tags.some((t) => t.toLowerCase().includes(q));
      const summaryMatch = opp.eligibility_summary.toLowerCase().includes(q);
      return titleMatch || providerMatch || hostMatch || countryMatch || fieldsMatch || tagsMatch || summaryMatch;
    });
  }

  // Filter: Host Countries
  if (filters.host_countries && filters.host_countries.length > 0) {
    const selectedCountries = new Set(filters.host_countries.map((c) => c.toLowerCase()));
    results = results.filter((opp) => selectedCountries.has(opp.host_country.toLowerCase()));
  }

  // Filter: Degree Level
  if (filters.degree_level) {
    results = results.filter((opp) => {
      if (opp.degree_level === 'masters_or_phd') return true;
      return opp.degree_level === filters.degree_level;
    });
  }

  // Filter: Funding Types
  if (filters.funding_types && filters.funding_types.length > 0) {
    const selectedFunding = new Set(filters.funding_types);
    results = results.filter((opp) => selectedFunding.has(opp.funding_type));
  }

  // Filter: Fields of Study
  if (filters.fields_of_study && filters.fields_of_study.length > 0) {
    results = results.filter((opp) =>
      filters.fields_of_study!.some((filterField) =>
        opp.fields_of_study.some((oppField) =>
          oppField.toLowerCase().includes(filterField.toLowerCase())
        )
      )
    );
  }

  // Filter: Rolling Deadlines
  if (!includeRolling) {
    results = results.filter((opp) => opp.application_deadline !== null);
  }

  // Filter: Deadline Before
  if (filters.deadline_before) {
    results = results.filter((opp) => {
      if (!opp.application_deadline) return includeRolling;
      return opp.application_deadline <= filters.deadline_before!;
    });
  }

  // Sort Results
  const sortBy = filters.sort_by || 'deadline';
  results.sort((a, b) => {
    if (sortBy === 'recently_verified') {
      return new Date(b.verified_on).getTime() - new Date(a.verified_on).getTime();
    }

    if (sortBy === 'deadline') {
      const aDeadline = a.application_deadline;
      const bDeadline = b.application_deadline;

      const aIsPast = aDeadline !== null && aDeadline < nowStr;
      const bIsPast = bDeadline !== null && bDeadline < nowStr;

      if (aIsPast !== bIsPast) {
        return aIsPast ? 1 : -1;
      }

      if (aDeadline === null && bDeadline === null) return 0;
      if (aDeadline === null) return 1;
      if (bDeadline === null) return -1;

      return aDeadline.localeCompare(bDeadline);
    }

    return 0; // relevance preserves caller ordering
  });

  return results;
}

/**
 * FUTURE BACKEND CONTRACT:
 * Role: main_reader
 * GET /api/opportunities/{id}
 * Path Parameters:
 *   - id: string
 * Returns: Opportunity | null (404 on backend)
 */
export async function getOpportunity(id: string): Promise<Opportunity | null> {
  await simulateLatency();
  const all = getAllOpportunitiesInternal();
  const opp = all.find((item) => item.id === id);
  if (!opp) return null;
  return opp;
}

/**
 * FUTURE BACKEND CONTRACT:
 * Role: main_reader
 * POST /api/semantic/rank
 * Headers: Content-Type: application/json
 * Request Body:
 *   {
 *     "background_text": string,
 *     "candidate_ids": string[]
 *   }
 * Returns: RankedResult[]
 */
export async function rankBySemanticMatch(
  backgroundText: string,
  candidateIds?: string[]
): Promise<RankedResult[]> {
  await simulateLatency();

  const all = getAllOpportunitiesInternal();
  let candidates: Opportunity[];
  if (candidateIds && candidateIds.length > 0) {
    const idSet = new Set(candidateIds);
    candidates = all.filter((opp) => idSet.has(opp.id));
  } else {
    // If no candidate subset specified, rank all active opportunities
    candidates = all.filter((opp) => opp.is_active);
  }

  return rankCandidates(backgroundText, candidates);
}

export { getSemanticEngineStats } from './semanticStub';
