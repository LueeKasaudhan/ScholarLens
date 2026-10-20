import { DegreeLevel, FundingType } from '../api/types';

export const COUNTRY_FLAGS: Record<string, string> = {
  'Germany': '🇩🇪',
  'Netherlands': '🇳🇱',
  'Sweden': '🇸🇪',
  'Finland': '🇫🇮',
  'Norway': '🇳🇴',
  'Switzerland': '🇨🇭',
  'Taiwan': '🇹🇼',
  'South Korea': '🇰🇷',
  'Japan': '🇯🇵',
  'Singapore': '🇸🇬',
  'New Zealand': '🇳🇿',
  'Austria': '🇦🇹',
  'Czechia': '🇨🇿',
  'Ireland': '🇮🇪',
  'Spain': '🇪🇸',
  'United Kingdom': '🇬🇧',
  'United States': '🇺🇸',
  'France': '🇫🇷',
  'Canada': '🇨🇦',
  'Australia': '🇦🇺',
  'Denmark': '🇩🇰',
  'Belgium': '🇧🇪',
  'Italy': '🇮🇹'
};

export function getCountryFlag(countryName: string): string {
  return COUNTRY_FLAGS[countryName] || '🌐';
}

export function formatDegreeLevel(level: DegreeLevel): string {
  switch (level) {
    case 'masters':
      return "Master's (MSc / MTech / ME)";
    case 'phd':
      return 'PhD / Doctorate';
    case 'masters_or_phd':
      return "Master's or PhD";
    default:
      return level;
  }
}

export function formatFundingType(type: FundingType): { label: string; badgeClass: string } {
  switch (type) {
    case 'full':
      return {
        label: 'Fully Funded',
        badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
      };
    case 'partial':
      return {
        label: 'Partial Funding',
        badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-300 dark:border-blue-800'
      };
    case 'tuition_waiver':
      return {
        label: 'Tuition Waiver',
        badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-300 dark:border-purple-800'
      };
    case 'stipend_only':
      return {
        label: 'Living Stipend Only',
        badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800'
      };
    case 'travel_grant':
      return {
        label: 'Travel / Research Grant',
        badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300 border-teal-300 dark:border-teal-800'
      };
    default:
      return {
        label: type,
        badgeClass: 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300 border-stone-300'
      };
  }
}

export function formatProviderType(type: string): string {
  switch (type) {
    case 'university':
      return 'University Department';
    case 'foundation':
      return 'Philanthropic Foundation';
    case 'government':
      return 'Government Ministry';
    case 'corporate':
      return 'Industry Consortium';
    case 'ngo':
      return 'Non-Profit / NGO';
    default:
      return type;
  }
}
