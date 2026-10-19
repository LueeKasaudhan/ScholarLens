export type DegreeLevel = 'masters' | 'phd' | 'masters_or_phd';
export type FundingType = 'full' | 'partial' | 'tuition_waiver' | 'stipend_only' | 'travel_grant';

export interface Opportunity {
  id: string;                    // uuid-like string
  title: string;
  provider_name: string;         // university / foundation / government body
  provider_type: 'university' | 'government' | 'foundation' | 'corporate' | 'ngo';
  host_country: string;
  host_institution: string | null;
  degree_level: DegreeLevel;
  funding_type: FundingType;
  funding_summary: string;       // e.g. "Full tuition + €1,200/month stipend"
  funding_amount_note: string | null;
  fields_of_study: string[];     // e.g. ["Computer Science", "Embedded Systems"]
  eligibility_summary: string;
  indian_applicants_eligible: boolean;
  min_gpa_note: string | null;
  language_requirements: string | null;
  application_deadline: string | null;   // ISO date, null = rolling
  deadline_note: string | null;
  official_url: string;
  tags: string[];
  popularity_tier: 'long_tail' | 'well_known';  // used for the anti-popularity-bias UI
  curated_by: string;            // Editorial curator attribution
  verified_on: string;           // ISO date of manual verification
  is_active: boolean;            // soft delete
  created_at: string;
  updated_at: string;
}

export interface SearchFilters {
  query?: string;                // free text over title/provider/tags
  host_countries?: string[];
  degree_level?: DegreeLevel;
  funding_types?: FundingType[];
  fields_of_study?: string[];
  deadline_before?: string;      // ISO date
  include_rolling?: boolean;
  long_tail_only?: boolean;      // default TRUE
  sort_by?: 'deadline' | 'recently_verified' | 'relevance';
}

export interface RankedResult {
  id: string;
  similarity: number;
}

export interface OpportunityInput {
  title: string;
  provider_name: string;
  provider_type: 'university' | 'government' | 'foundation' | 'corporate' | 'ngo';
  host_country: string;
  host_institution: string | null;
  degree_level: DegreeLevel;
  funding_type: FundingType;
  funding_summary: string;
  funding_amount_note: string | null;
  fields_of_study: string[];
  eligibility_summary: string;
  indian_applicants_eligible: boolean;
  min_gpa_note: string | null;
  language_requirements: string | null;
  application_deadline: string | null;
  deadline_note: string | null;
  official_url: string;
  tags: string[];
  popularity_tier: 'long_tail' | 'well_known';
  curated_by?: string;
  verified_on?: string;
  is_active?: boolean;
}

export interface BookmarkRecord {
  client_id: string;
  opportunity_id: string;
  created_at: string;
}

export interface HydratedBookmark {
  client_id: string;
  opportunity_id: string;
  created_at: string;
  opportunity: Opportunity | null;
  is_available: boolean;
}
