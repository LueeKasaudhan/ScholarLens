import test from 'node:test';
import assert from 'node:assert/strict';
import { getDeadlineInfo } from '../src/utils/dates';
import { computeDeterministicMatch, rankCandidates } from '../src/api/semanticStub';
import { shouldShowLowCandidateSubsetWarning } from '../src/components/SemanticMatchPanel';
import { INITIAL_MOCK_OPPORTUNITIES } from '../src/api/mockData';
import { searchOpportunities, getOpportunity } from '../src/api/readApi';
import { addBookmark, removeBookmark, listBookmarks, getClientId } from '../src/api/bookmarkApi';
import { adminCreateOpportunity, adminSetActive, adminUpdateOpportunity } from '../src/api/adminApi';

test('getDeadlineInfo correctly classifies rolling deadlines', () => {
  const info = getDeadlineInfo(null);
  assert.equal(info.status, 'rolling');
  assert.equal(info.daysRemaining, null);
  assert.equal(info.label, 'Rolling Deadline');
});

test('getDeadlineInfo correctly classifies closed deadlines', () => {
  const refDate = new Date('2026-10-19T12:00:00Z');
  const info = getDeadlineInfo('2026-09-01', refDate);
  assert.equal(info.status, 'closed');
  assert.ok(info.daysRemaining !== null && info.daysRemaining < 0);
  assert.equal(info.label, 'Closed');
});

test('getDeadlineInfo correctly classifies urgent deadlines (< 14 days)', () => {
  const refDate = new Date('2026-10-19T12:00:00Z');
  const info = getDeadlineInfo('2026-10-25', refDate);
  assert.equal(info.status, 'urgent');
  assert.ok(info.daysRemaining !== null && info.daysRemaining < 14);
});

test('getDeadlineInfo correctly classifies soon deadlines (< 45 days)', () => {
  const refDate = new Date('2026-10-19T12:00:00Z');
  const info = getDeadlineInfo('2026-11-20', refDate);
  assert.equal(info.status, 'soon');
  assert.ok(info.daysRemaining !== null && info.daysRemaining >= 14 && info.daysRemaining < 45);
});

test('shouldShowLowCandidateSubsetWarning triggers only when active and count is 1..4', () => {
  assert.equal(shouldShowLowCandidateSubsetWarning(0, true), false);
  assert.equal(shouldShowLowCandidateSubsetWarning(3, true), true);
  assert.equal(shouldShowLowCandidateSubsetWarning(5, true), false);
  assert.equal(shouldShowLowCandidateSubsetWarning(3, false), false);
});

test('computeDeterministicMatch returns bounded values between 0 and 1', () => {
  const opp = INITIAL_MOCK_OPPORTUNITIES[0];
  const score = computeDeterministicMatch('embedded robotics C++ microcontrollers', opp);
  assert.ok(score >= 0 && score <= 1.0, `Score ${score} out of bounds`);
});

test('rankCandidates orders candidate list descending by similarity', () => {
  const candidates = INITIAL_MOCK_OPPORTUNITIES.slice(0, 5);
  const ranked = rankCandidates('embedded systems photonics VLSI hardware', candidates);
  assert.equal(ranked.length, candidates.length);
  for (let i = 0; i < ranked.length - 1; i++) {
    assert.ok(ranked[i].similarity >= ranked[i + 1].similarity);
  }
});

test('readApi searchOpportunities applies long_tail_only and returns active items', async () => {
  const results = await searchOpportunities({ long_tail_only: true });
  assert.ok(results.length > 0);
  for (const r of results) {
    assert.equal(r.popularity_tier, 'long_tail');
    assert.equal(r.is_active, true);
  }
});

test('bookmarkApi scopes bookmarks by clientId and tracks hydration', async () => {
  const cid = getClientId();
  assert.ok(cid && cid.length > 0);

  const testOppId = 'opp-lt-003';
  await addBookmark(testOppId);

  const bookmarks = await listBookmarks();
  const match = bookmarks.find((b) => b.opportunity_id === testOppId);
  assert.ok(match, 'Added bookmark should be present in listBookmarks()');
  assert.equal(match.is_available, true);
  assert.equal(match.client_id, cid);

  await removeBookmark(testOppId);
  const afterRemove = await listBookmarks();
  assert.equal(afterRemove.some((b) => b.opportunity_id === testOppId), false);
});

test('adminApi allows opportunity mutations and soft delete toggles', async () => {
  const created = await adminCreateOpportunity({
    title: 'Test Fellowship in AI Architecture',
    provider_name: 'Test Tech Institute',
    provider_type: 'university',
    host_country: 'Sweden',
    host_institution: 'Test University',
    degree_level: 'masters',
    funding_type: 'full',
    funding_summary: 'Full tuition + stipend',
    funding_amount_note: null,
    fields_of_study: ['Artificial Intelligence'],
    eligibility_summary: 'B.Tech in CSE',
    indian_applicants_eligible: true,
    min_gpa_note: null,
    language_requirements: null,
    application_deadline: '2027-01-01',
    deadline_note: null,
    official_url: 'https://example.com/test-fellowship',
    tags: ['AI'],
    popularity_tier: 'long_tail',
    curated_by: 'Test Curator'
  });

  assert.ok(created.id.startsWith('opp-custom-'));
  assert.equal(created.curated_by, 'Test Curator');

  // Soft delete it
  await adminSetActive(created.id, false);

  // Verify that readApi no longer returns this inactive opportunity in public search
  const publicResults = await searchOpportunities({ query: 'Test Fellowship in AI Architecture' });
  assert.equal(publicResults.some((o) => o.id === created.id), false);
});

test('Cosine Similarity algorithm computes strictly bounded similarity in [0, 1] with dot product and norms', () => {
  const opp = INITIAL_MOCK_OPPORTUNITIES[0];
  const candidates = [opp];
  const query = 'optics photonics quantum sensors laser engineering physics';
  const ranked = rankCandidates(query, candidates);

  assert.equal(ranked.length, 1);
  const result = ranked[0];
  assert.ok(result.similarity >= 0 && result.similarity <= 1.0, `Similarity ${result.similarity} out of bounds`);
  assert.ok(result.query_norm > 0, 'Query norm must be positive');
  assert.ok(result.doc_norm > 0, 'Doc norm must be positive');
  assert.ok(result.dot_product >= 0, 'Dot product must be non-negative');
  assert.ok(result.matched_terms.length > 0, 'Must have matched terms');
  assert.ok(result.top_contributions.length > 0, 'Must have top term contributions');
  assert.ok(result.explanation.length > 0, 'Must provide explainable output');
});

test('Cosine Similarity algorithm returns 0 for completely disjoint orthogonal text', () => {
  const opp = INITIAL_MOCK_OPPORTUNITIES[0];
  const candidates = [opp];
  const disjointQuery = 'xyzabc qwerty uiopasdfgh jklzxcvbnm';
  const ranked = rankCandidates(disjointQuery, candidates);

  assert.equal(ranked.length, 1);
  assert.equal(ranked[0].similarity, 0);
  assert.equal(ranked[0].dot_product, 0);
  assert.equal(ranked[0].matched_terms.length, 0);
});
