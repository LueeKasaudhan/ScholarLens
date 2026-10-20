import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  ExternalLink,
  Calendar,
  Sparkles,
  Building2,
  CheckCircle,
  GraduationCap,
  Globe2,
  Languages,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { getOpportunity, Opportunity, RankedResult } from '../api';
import { rankCandidates } from '../api/semanticStub';
import { DeadlineBadge } from '../components/DeadlineBadge';
import { getCountryFlag, formatDegreeLevel, formatFundingType, formatProviderType } from '../utils/format';
import { getDeadlineInfo } from '../utils/dates';
import { useBookmarks } from '../context/BookmarkContext';
import { Binary, Layers, Cpu } from 'lucide-react';

export const OpportunityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active student profile from session storage
  const [profileText, setProfileText] = useState<string>(() => {
    try {
      return sessionStorage.getItem('scholar_lens_profile') || '';
    } catch {
      return '';
    }
  });
  const [semanticMatch, setSemanticMatch] = useState<RankedResult | null>(null);

  // Preserve previous search filter query params when navigating back
  const backToResultsUrl = `/${location.search}`;

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    getOpportunity(id)
      .then((data) => {
        if (!isMounted) return;
        if (data) {
          setOpportunity(data);
        } else {
          setError('Opportunity not found or has been archived.');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error(err);
        setError('Failed to load opportunity details.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (opportunity && profileText.trim()) {
      const results = rankCandidates(profileText, [opportunity]);
      if (results.length > 0) {
        setSemanticMatch(results[0]);
      }
    } else {
      setSemanticMatch(null);
    }
  }, [opportunity, profileText]);

  const [isTesterOpen, setIsTesterOpen] = useState(false);
  const [quickInput, setQuickInput] = useState('');

  const handleApplyQuickProfile = (text: string) => {
    setProfileText(text);
    try {
      sessionStorage.setItem('scholar_lens_profile', text);
    } catch {
      // ignore
    }
    setIsTesterOpen(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-6 w-32 bg-stone-200 dark:bg-stone-800 rounded" />
        <div className="h-10 w-3/4 bg-stone-200 dark:bg-stone-800 rounded" />
        <div className="h-48 bg-stone-100 dark:bg-stone-900 rounded-2xl" />
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-stone-400 mx-auto" />
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
          {error || 'Program Not Found'}
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          This opportunity may be deactivated or the link is expired.
        </p>
        <Link
          to={backToResultsUrl}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to opportunities
        </Link>
      </div>
    );
  }

  const bookmarked = isBookmarked(opportunity.id);
  const fundingStyle = formatFundingType(opportunity.funding_type);
  const deadlineInfo = getDeadlineInfo(opportunity.application_deadline);
  const countryFlag = getCountryFlag(opportunity.host_country);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link + Bookmark bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          to={backToResultsUrl}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to filtered results</span>
        </Link>

        <button
          type="button"
          onClick={() => toggleBookmark(opportunity.id)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-medium transition-colors ${
            bookmarked
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
              : 'bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
          }`}
          aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this opportunity'}
        >
          <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-emerald-700 dark:fill-emerald-400' : ''}`} />
          <span>{bookmarked ? 'Saved to Bookmarks' : 'Bookmark Award'}</span>
        </button>
      </div>

      {/* Hero Header Card */}
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-xs space-y-4 mb-8">
        <div className="flex flex-wrap items-center gap-2">
          {/* Country */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-medium text-xs">
            <span className="text-base">{countryFlag}</span>
            <span>{opportunity.host_country}</span>
          </span>

          {/* Funding Badge */}
          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${fundingStyle.badgeClass}`}>
            {fundingStyle.label}
          </span>

          {/* Tier Badge */}
          {opportunity.popularity_tier === 'long_tail' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <Sparkles className="w-3.5 h-3.5" />
              Long-Tail Opportunity
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
              Marquee / Well-Known Grant
            </span>
          )}
        </div>

        <h1 className="font-serif-title text-2xl sm:text-3xl md:text-4xl text-stone-900 dark:text-stone-50 font-semibold leading-tight">
          {opportunity.title}
        </h1>

        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-stone-600 dark:text-stone-400 pt-1 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-stone-400" />
            <span className="font-medium text-stone-800 dark:text-stone-200">{opportunity.provider_name}</span>
            <span className="text-stone-400">({formatProviderType(opportunity.provider_type)})</span>
          </div>
          {opportunity.host_institution && (
            <div className="flex items-center gap-1.5 text-stone-500">
              <span>•</span>
              <span>Host: <strong>{opportunity.host_institution}</strong></span>
            </div>
          )}
        </div>

        {/* CTA to External Official Page */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <DeadlineBadge deadline={opportunity.application_deadline} />
            {opportunity.application_deadline && deadlineInfo.daysRemaining !== null && (
              <span className="text-xs text-stone-500 dark:text-stone-400">
                ({deadlineInfo.daysRemaining > 0 ? `${deadlineInfo.daysRemaining} days remaining` : 'Deadline passed'})
              </span>
            )}
          </div>

          <a
            href={opportunity.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl font-medium text-sm hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors shadow-xs"
          >
            <span>Open Official Application Page</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Cosine Similarity Profile Fit Section */}
      {semanticMatch && (
        <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/40 p-6 shadow-xs space-y-4 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="font-bold text-base sm:text-lg">
                Cosine Similarity Match: {Math.round(semanticMatch.similarity * 100)}% Profile Fit
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold">
                cos(θ) = {semanticMatch.similarity.toFixed(3)}
              </span>
              <button
                type="button"
                onClick={() => setIsTesterOpen(!isTesterOpen)}
                className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-medium"
              >
                {isTesterOpen ? 'Close Tester' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-emerald-200/60 dark:bg-emerald-900/60 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-600 dark:bg-emerald-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(10, Math.round(semanticMatch.similarity * 100)))}%` }}
            />
          </div>

          <p className="text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 font-medium leading-relaxed">
            {semanticMatch.explanation}
          </p>

          {/* Vector Math & Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-white/80 dark:bg-stone-900/80 border border-emerald-200 dark:border-emerald-900/60">
              <div className="flex items-center gap-1.5 text-stone-500 text-[11px] mb-1">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>Field of Study Fit</span>
              </div>
              <div className="text-base font-bold text-stone-900 dark:text-stone-100">
                {Math.round(semanticMatch.dimension_scores.field_similarity * 100)}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/80 dark:bg-stone-900/80 border border-emerald-200 dark:border-emerald-900/60">
              <div className="flex items-center gap-1.5 text-stone-500 text-[11px] mb-1">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                <span>Technical Skills Fit</span>
              </div>
              <div className="text-base font-bold text-stone-900 dark:text-stone-100">
                {Math.round(semanticMatch.dimension_scores.skills_similarity * 100)}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/80 dark:bg-stone-900/80 border border-emerald-200 dark:border-emerald-900/60">
              <div className="flex items-center gap-1.5 text-stone-500 text-[11px] mb-1">
                <Binary className="w-3.5 h-3.5 text-emerald-600" />
                <span>Vector Dot Product</span>
              </div>
              <div className="text-base font-bold text-stone-900 dark:text-stone-100 font-mono">
                {semanticMatch.dot_product.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Overlapping Keyphrases */}
          {semanticMatch.matched_terms.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-semibold text-stone-600 dark:text-stone-400 text-[11px]">
                Overlapping Concepts:
              </span>
              {semanticMatch.matched_terms.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-md bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 font-mono text-[11px] border border-emerald-200 dark:border-emerald-800"
                >
                  +{t}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick profile tester drawer if toggled or if no profile is active */}
      {(!semanticMatch || isTesterOpen) && (
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 p-4 sm:p-5 mb-8 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs sm:text-sm text-stone-800 dark:text-stone-200 flex items-center gap-2">
              <Binary className="w-4 h-4 text-emerald-600" />
              <span>Test Your Background Against This Award</span>
            </span>
            <button
              type="button"
              onClick={() => handleApplyQuickProfile('Final-year B.Tech in Computer Engineering from Pune University (8.4 CGPA). Focus in embedded systems, RTOS, C++, robotics.')}
              className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-medium"
            >
              Insert sample
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="e.g., B.Tech in CSE, deep learning, PyTorch, computer vision, 8.8 CGPA..."
              className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <button
              type="button"
              onClick={() => handleApplyQuickProfile(quickInput)}
              disabled={!quickInput.trim()}
              className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 disabled:opacity-50 transition-colors"
            >
              Calculate Fit
            </button>
          </div>
        </div>
      )}

      {/* Structured Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Funding & Eligibility (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          {/* Funding Section */}
          <section className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-3">
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              Funding &amp; Financial Support
            </h2>
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 space-y-2">
              <div className="text-base font-semibold text-stone-900 dark:text-stone-100">
                {opportunity.funding_summary}
              </div>
              {opportunity.funding_amount_note && (
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                  {opportunity.funding_amount_note}
                </p>
              )}
            </div>
          </section>

          {/* Eligibility Section */}
          <section className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-4">
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              Candidate Eligibility
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-900 dark:text-stone-100 block">
                    Indian Applicants Eligible:
                  </span>
                  <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm">
                    {opportunity.indian_applicants_eligible
                      ? 'Yes. Verified open to Indian passport holders.'
                      : 'Special bilateral restrictions apply.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <GraduationCap className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-900 dark:text-stone-100 block">
                    Academic Background &amp; Minimum GPA:
                  </span>
                  <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm">
                    {opportunity.min_gpa_note || 'Evaluated holistically on coursework and research potential.'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300 text-xs sm:text-sm leading-relaxed border border-stone-200/60 dark:border-stone-800">
                <span className="font-semibold block mb-1 text-stone-900 dark:text-stone-100">
                  Criteria Summary:
                </span>
                {opportunity.eligibility_summary}
              </div>
            </div>
          </section>

          {/* Language & Deadlines Detail */}
          <section className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-3">
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              Language &amp; Deadlines
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-stone-800 dark:text-stone-200">
                  <Languages className="w-4 h-4 text-stone-500" />
                  Language Requirements
                </div>
                <p className="text-stone-600 dark:text-stone-400">
                  {opportunity.language_requirements || 'English instruction certificate or standard TOEFL/IELTS.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/60 dark:border-stone-800 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-stone-800 dark:text-stone-200">
                  <Clock className="w-4 h-4 text-stone-500" />
                  Application Timetable
                </div>
                <p className="text-stone-600 dark:text-stone-400">
                  {opportunity.deadline_note || (opportunity.application_deadline ? `Deadline: ${opportunity.application_deadline}` : 'Rolling evaluation cycles.')}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Taxonomy, Tags & Verification */}
        <div className="space-y-6">
          {/* Degree & Fields */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-4">
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
              Fields of Study
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {opportunity.fields_of_study.map((field) => (
                <span
                  key={field}
                  className="px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-mono font-medium"
                >
                  {field}
                </span>
              ))}
            </div>

            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm pt-2 border-t border-stone-100 dark:border-stone-800">
              Degree Level
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">
              {formatDegreeLevel(opportunity.degree_level)}
            </p>

            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm pt-2 border-t border-stone-100 dark:border-stone-800">
              Keywords &amp; Tags
            </h3>
            <div className="flex flex-wrap gap-1">
              {opportunity.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded text-[11px] bg-stone-50 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Verification Badge & Advisory */}
          <div className="bg-stone-100/70 dark:bg-stone-900/60 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Manual Verification Record
            </div>
            <p className="text-stone-500 dark:text-stone-400">
              Curated by:
              <strong className="block text-stone-800 dark:text-stone-200 mt-0.5">
                {opportunity.curated_by}
              </strong>
            </p>
            <p className="text-stone-500 dark:text-stone-400 pt-1">
              Last audited by our editorial staff on:
              <strong className="block text-stone-800 dark:text-stone-200 mt-0.5">
                {opportunity.verified_on}
              </strong>
            </p>
            <p className="text-[11px] text-stone-400 dark:text-stone-500 pt-2 border-t border-stone-200 dark:border-stone-800 leading-normal">
              Always consult the host university's official admissions circular before making visa or flight commitments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
