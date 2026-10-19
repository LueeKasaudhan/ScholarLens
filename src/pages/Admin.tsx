import React, { useEffect, useState } from 'react';
import {
  adminListOpportunities,
  adminCreateOpportunity,
  adminUpdateOpportunity,
  adminSetActive
} from '../api/adminApi';
import {
  Opportunity,
  OpportunityInput,
  DegreeLevel,
  FundingType
} from '../api/types';
import { Lock, LogOut, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

// Hardcoded demo password for local prototype testing.
// LABEL: demo only, real auth is server-side
const DEMO_ADMIN_PASSWORD = 'admin';

const DEFAULT_FORM_VALUES: OpportunityInput = {
  title: '',
  provider_name: '',
  provider_type: 'university',
  host_country: '',
  host_institution: '',
  degree_level: 'masters',
  funding_type: 'full',
  funding_summary: '',
  funding_amount_note: '',
  fields_of_study: [],
  eligibility_summary: '',
  indian_applicants_eligible: true,
  min_gpa_note: '',
  language_requirements: '',
  application_deadline: '',
  deadline_note: '',
  official_url: 'https://example.com/scholarship',
  tags: [],
  popularity_tier: 'long_tail',
  curated_by: 'ScholarLens Editorial Team',
  verified_on: new Date().toISOString().split('T')[0],
  is_active: true
};

export const Admin: React.FC = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('scholarlens_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Opportunities Management State
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState<OpportunityInput>(DEFAULT_FORM_VALUES);
  const [fieldsText, setFieldsText] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await adminListOpportunities();
      setOpportunities(data);
    } catch (e) {
      console.error(e);
      setStatusMessage('Failed to load opportunities from adminApi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === DEMO_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError(null);
      try {
        sessionStorage.setItem('scholarlens_admin_auth', 'true');
      } catch {
        // Ignored
      }
    } else {
      setAuthError('Invalid password. Hint: use "admin" (demo only, real auth is server-side)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('scholarlens_admin_auth');
    } catch {
      // Ignored
    }
  };

  const handleStartAdd = () => {
    setEditingId(null);
    setFormData({
      ...DEFAULT_FORM_VALUES,
      verified_on: new Date().toISOString().split('T')[0]
    });
    setFieldsText('Computer Science, Systems');
    setTagsText('Research, University');
    setShowForm(true);
    setStatusMessage(null);
    setUrlError(null);
  };

  const handleStartEdit = (opp: Opportunity) => {
    setEditingId(opp.id);
    setFormData({
      title: opp.title,
      provider_name: opp.provider_name,
      provider_type: opp.provider_type,
      host_country: opp.host_country,
      host_institution: opp.host_institution || '',
      degree_level: opp.degree_level,
      funding_type: opp.funding_type,
      funding_summary: opp.funding_summary,
      funding_amount_note: opp.funding_amount_note || '',
      fields_of_study: opp.fields_of_study,
      eligibility_summary: opp.eligibility_summary,
      indian_applicants_eligible: opp.indian_applicants_eligible,
      min_gpa_note: opp.min_gpa_note || '',
      language_requirements: opp.language_requirements || '',
      application_deadline: opp.application_deadline || '',
      deadline_note: opp.deadline_note || '',
      official_url: opp.official_url,
      tags: opp.tags,
      popularity_tier: opp.popularity_tier,
      curated_by: opp.curated_by || 'ScholarLens Editorial Team',
      verified_on: opp.verified_on || new Date().toISOString().split('T')[0],
      is_active: opp.is_active
    });
    setFieldsText(opp.fields_of_study.join(', '));
    setTagsText(opp.tags.join(', '));
    setShowForm(true);
    setStatusMessage(null);
    setUrlError(null);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await adminSetActive(id, !currentStatus);
      setOpportunities((prev) =>
        prev.map((o) => (o.id === id ? { ...o, is_active: !currentStatus } : o))
      );
      setStatusMessage(`Soft-delete toggled: ${id} is now ${!currentStatus ? 'Active' : 'Inactive (Archived)'}.`);
    } catch (e) {
      console.error(e);
      setStatusMessage('Failed to update active state via adminApi');
    }
  };

  const isValidUrl = (urlStr: string): boolean => {
    try {
      const parsed = new URL(urlStr);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    // URL format check
    if (!isValidUrl(formData.official_url)) {
      setUrlError('Please enter a valid URL starting with http:// or https://');
      return;
    }
    setUrlError(null);

    try {
      const payload: OpportunityInput = {
        ...formData,
        fields_of_study: fieldsText.split(',').map((s) => s.trim()).filter(Boolean),
        tags: tagsText.split(',').map((s) => s.trim()).filter(Boolean),
        application_deadline: formData.application_deadline?.trim() ? formData.application_deadline : null,
        host_institution: formData.host_institution?.trim() ? formData.host_institution : null,
        min_gpa_note: formData.min_gpa_note?.trim() ? formData.min_gpa_note : null,
        language_requirements: formData.language_requirements?.trim() ? formData.language_requirements : null,
        deadline_note: formData.deadline_note?.trim() ? formData.deadline_note : null,
        funding_amount_note: formData.funding_amount_note?.trim() ? formData.funding_amount_note : null,
        curated_by: formData.curated_by?.trim() ? formData.curated_by : 'ScholarLens Editorial Team',
        verified_on: formData.verified_on?.trim() ? formData.verified_on : new Date().toISOString().split('T')[0]
      };

      if (editingId) {
        const updated = await adminUpdateOpportunity(editingId, payload);
        setOpportunities((prev) => prev.map((o) => (o.id === editingId ? updated : o)));
        setStatusMessage(`Successfully updated "${updated.title}" via adminApi.`);
      } else {
        const created = await adminCreateOpportunity(payload);
        setOpportunities((prev) => [created, ...prev]);
        setStatusMessage(`Successfully created "${created.title}" via adminApi.`);
      }

      setShowForm(false);
      setEditingId(null);
    } catch (e) {
      console.error(e);
      setStatusMessage('Error saving opportunity via adminApi');
    }
  };

  // --- Mock Login Gate ---
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="p-6 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 rounded-xl shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-stone-900 dark:text-stone-100">
            <Lock className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h1 className="text-lg font-bold">Admin Portal</h1>
          </div>

          <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-lg text-xs text-stone-600 dark:text-stone-300 space-y-1 font-mono">
            <div className="text-amber-800 dark:text-amber-300 font-bold">
              [demo only, real auth is server-side]
            </div>
            <div>Database Role: <span className="text-emerald-700 dark:text-emerald-400 font-bold">main_admin</span></div>
            <div>Demo Password: <span className="bg-stone-200 dark:bg-stone-700 px-1 py-0.5 rounded font-bold">admin</span></div>
          </div>

          {authError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-stone-700 dark:text-stone-300">
                Password
              </label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter admin password..."
                className="w-full px-3 py-2 text-xs border border-stone-300 dark:border-stone-700 rounded-lg bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Sign In to Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- Authenticated Admin Panel ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-stone-200 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              Opportunity Management
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded border border-amber-300 dark:border-amber-800">
              Role: main_admin
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Admin (V1 — demo only, real auth is server-side, in-memory mock repository) • Total records: {opportunities.length}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/opportunities.json"
            download="scholarlens_opportunities_112.json"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 text-xs font-semibold rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shadow-xs"
            title="Download complete 112 opportunities database in JSON format"
          >
            <span>Export JSON ({opportunities.length})</span>
          </a>

          {!showForm && (
            <button
              type="button"
              onClick={handleStartAdd}
              className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-semibold rounded hover:bg-emerald-800 transition-colors"
            >
              + Add Opportunity
            </button>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-xs font-medium rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-4 p-2.5 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200 text-xs rounded border border-emerald-300 dark:border-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Comprehensive Form Covering EVERY Field in Opportunity */}
      {showForm && (
        <div className="mb-8 p-5 border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 rounded-lg shadow-xs">
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-4 pb-2 border-b border-stone-200 dark:border-stone-800">
            {editingId ? `Edit Opportunity [${editingId}]` : 'Create New Opportunity'}
          </h2>

          <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Program or fellowship title"
                  className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Provider Name *</label>
                <input
                  type="text"
                  required
                  value={formData.provider_name}
                  onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
                  placeholder="e.g., Max Planck Society"
                  className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Provider Type *</label>
                <select
                  value={formData.provider_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      provider_type: e.target.value as OpportunityInput['provider_type']
                    })
                  }
                  className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                >
                  <option value="university">University</option>
                  <option value="foundation">Foundation</option>
                  <option value="government">Government</option>
                  <option value="corporate">Corporate</option>
                  <option value="ngo">NGO</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Host Country *</label>
                <input
                  type="text"
                  required
                  value={formData.host_country}
                  onChange={(e) => setFormData({ ...formData, host_country: e.target.value })}
                  placeholder="e.g., Germany, Netherlands, Sweden"
                  className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Host Institution (optional)</label>
                <input
                  type="text"
                  value={formData.host_institution || ''}
                  onChange={(e) => setFormData({ ...formData, host_institution: e.target.value })}
                  placeholder="e.g., TU Munich, ETH Zurich"
                  className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Degree Level *</label>
                <select
                  value={formData.degree_level}
                  onChange={(e) =>
                    setFormData({ ...formData, degree_level: e.target.value as DegreeLevel })
                  }
                  className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                >
                  <option value="masters">Master&apos;s</option>
                  <option value="phd">PhD</option>
                  <option value="masters_or_phd">Master&apos;s or PhD</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Funding Type *</label>
                <select
                  value={formData.funding_type}
                  onChange={(e) =>
                    setFormData({ ...formData, funding_type: e.target.value as FundingType })
                  }
                  className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                >
                  <option value="full">Full (Tuition + Stipend)</option>
                  <option value="partial">Partial Funding</option>
                  <option value="tuition_waiver">Tuition Waiver</option>
                  <option value="stipend_only">Stipend Only</option>
                  <option value="travel_grant">Travel Grant</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Popularity Tier * (Anti-Bias)</label>
                <select
                  value={formData.popularity_tier}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      popularity_tier: e.target.value as 'long_tail' | 'well_known'
                    })
                  }
                  className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                >
                  <option value="long_tail">long_tail (Promoted lesser-known award)</option>
                  <option value="well_known">well_known (DAAD/Chevening marquee)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Curated By *</label>
                <input
                  type="text"
                  required
                  value={formData.curated_by || ''}
                  onChange={(e) => setFormData({ ...formData, curated_by: e.target.value })}
                  placeholder="e.g., ScholarLens Editorial Desk"
                  className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Verified On * (ISO Date)</label>
                <input
                  type="date"
                  required
                  value={formData.verified_on || ''}
                  onChange={(e) => setFormData({ ...formData, verified_on: e.target.value })}
                  className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Funding Summary *</label>
              <input
                type="text"
                required
                placeholder="e.g., Full tuition waiver + €934/month living stipend"
                value={formData.funding_summary}
                onChange={(e) => setFormData({ ...formData, funding_summary: e.target.value })}
                className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Funding Amount Note (optional)</label>
              <input
                type="text"
                value={formData.funding_amount_note || ''}
                onChange={(e) => setFormData({ ...formData, funding_amount_note: e.target.value })}
                placeholder="e.g., Sponsored by industry partner; renewable on academic standing."
                className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Fields of Study * (comma-separated tags)</label>
              <input
                type="text"
                required
                value={fieldsText}
                onChange={(e) => setFieldsText(e.target.value)}
                placeholder="Computer Science, Embedded Systems, Robotics"
                className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Tags (comma-separated tags)</label>
              <input
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="Hardware, Low Cost, Nordic, Full Tuition"
                className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Eligibility Summary *</label>
              <textarea
                required
                rows={2}
                value={formData.eligibility_summary}
                onChange={(e) => setFormData({ ...formData, eligibility_summary: e.target.value })}
                placeholder="Describe candidate qualification prerequisites and university background"
                className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Min GPA Note (optional)</label>
                <input
                  type="text"
                  value={formData.min_gpa_note || ''}
                  onChange={(e) => setFormData({ ...formData, min_gpa_note: e.target.value })}
                  placeholder="e.g., 8.0/10 CGPA or First Class Honours"
                  className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Language Requirements (optional)</label>
                <input
                  type="text"
                  value={formData.language_requirements || ''}
                  onChange={(e) => setFormData({ ...formData, language_requirements: e.target.value })}
                  placeholder="e.g., IELTS 6.5 or TOEFL 90"
                  className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Application Deadline (ISO date, optional: leave empty for rolling)
                </label>
                <input
                  type="date"
                  value={formData.application_deadline || ''}
                  onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                  className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Deadline Note (optional)</label>
                <input
                  type="text"
                  value={formData.deadline_note || ''}
                  onChange={(e) => setFormData({ ...formData, deadline_note: e.target.value })}
                  placeholder="e.g., Winter intake round 1"
                  className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Official URL * (must be valid http/https)</label>
              <input
                type="url"
                required
                value={formData.official_url}
                onChange={(e) => {
                  setFormData({ ...formData, official_url: e.target.value });
                  setUrlError(null);
                }}
                placeholder="https://example.com/scholarship-details"
                className="w-full p-2 border border-stone-300 dark:border-stone-700 rounded bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              />
              {urlError && <p className="text-rose-600 text-xs mt-1">{urlError}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.indian_applicants_eligible}
                  onChange={(e) => setFormData({ ...formData, indian_applicants_eligible: e.target.checked })}
                  className="rounded text-emerald-700"
                />
                <span className="font-semibold">Indian applicants eligible</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.is_active ?? true}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-emerald-700"
                />
                <span className="font-semibold">Active (Uncheck to soft-delete / hide from public search)</span>
              </label>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 text-white rounded font-semibold hover:bg-emerald-800"
              >
                {editingId ? 'Save Changes via adminApi' : 'Create Record via adminApi'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 border border-stone-300 dark:border-stone-700 rounded text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Opportunities Table with Soft Delete Toggle */}
      <div className="border border-stone-300 dark:border-stone-700 rounded-lg overflow-x-auto bg-white dark:bg-stone-900 shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-stone-100 dark:bg-stone-800 border-b border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold">
              <th className="p-2.5">Title</th>
              <th className="p-2.5">Provider</th>
              <th className="p-2.5">Country</th>
              <th className="p-2.5">Deadline</th>
              <th className="p-2.5">Tier</th>
              <th className="p-2.5">Curator</th>
              <th className="p-2.5">Active Status (Soft Delete)</th>
              <th className="p-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="p-4 text-center text-stone-400">
                  Loading opportunities via adminApi...
                </td>
              </tr>
            ) : opportunities.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center text-stone-400">
                  No records found.
                </td>
              </tr>
            ) : (
              opportunities.map((opp) => (
                <tr
                  key={opp.id}
                  className={`hover:bg-stone-50 dark:hover:bg-stone-800/40 ${
                    !opp.is_active ? 'opacity-50 bg-stone-100/50 dark:bg-stone-900/50' : ''
                  }`}
                >
                  <td className="p-2.5 font-medium max-w-xs truncate text-stone-900 dark:text-stone-100" title={opp.title}>
                    {opp.title}
                  </td>
                  <td className="p-2.5 text-stone-600 dark:text-stone-400 max-w-[140px] truncate">
                    {opp.provider_name}
                  </td>
                  <td className="p-2.5">{opp.host_country}</td>
                  <td className="p-2.5 font-mono text-[11px]">
                    {opp.application_deadline || 'Rolling'}
                  </td>
                  <td className="p-2.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        opp.popularity_tier === 'long_tail'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                      }`}
                    >
                      {opp.popularity_tier}
                    </span>
                  </td>
                  <td className="p-2.5 text-stone-500 max-w-[120px] truncate" title={opp.curated_by}>
                    {opp.curated_by}
                  </td>
                  <td className="p-2.5">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(opp.id, opp.is_active)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        opp.is_active
                          ? 'bg-green-50 text-green-700 border-green-300 dark:bg-green-950/70 dark:text-green-300 dark:border-green-800'
                          : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800'
                      }`}
                      title="Click to toggle soft delete status"
                    >
                      {opp.is_active ? 'Active' : 'Inactive (Soft Deleted)'}
                    </button>
                  </td>
                  <td className="p-2.5 text-right whitespace-nowrap space-x-2">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(opp)}
                      className="px-2 py-1 text-[11px] font-medium border border-stone-300 dark:border-stone-700 rounded hover:bg-stone-200 dark:hover:bg-stone-800"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
