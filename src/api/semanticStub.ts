// STUB: replaces real all-MiniLM-L6-v2 cosine similarity (NumPy, computed server-side). Do not treat these scores as real.

import { Opportunity, RankedResult } from './types';

/**
 * Extracts normalized tokens from a string for keyword overlap matching.
 * Ignores common English stop words and punctuation.
 */
function tokenize(text: string): Set<string> {
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
    'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
    'will', 'with', 'i', 'my', 'me', 'we', 'our', 'you', 'your', 'have', 'had',
    'do', 'did', 'does', 'or', 'so', 'if', 'this', 'but', 'not', 'what', 'who'
  ]);

  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9+#_]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w))
  );
}

/**
 * Computes a pseudo-semantic keyword-overlap score between user background text
 * and an opportunity's textual features, bounded strictly between 0.00 and 1.00.
 */
export function computeDeterministicMatch(
  backgroundText: string,
  opportunity: Opportunity
): number {
  if (!backgroundText.trim()) {
    return 0;
  }

  const queryTokens = tokenize(backgroundText);
  if (queryTokens.size === 0) return 0.15;

  // Build target corpus with different weights
  const titleTokens = tokenize(opportunity.title);
  const fieldsTokens = tokenize(opportunity.fields_of_study.join(' '));
  const tagsTokens = tokenize(opportunity.tags.join(' '));
  const summaryTokens = tokenize(opportunity.eligibility_summary + ' ' + (opportunity.funding_summary || ''));

  let matches = 0;
  let weightedMatches = 0;

  for (const token of queryTokens) {
    let matchedInOpp = false;

    if (fieldsTokens.has(token)) {
      weightedMatches += 3.0; // High value for study field overlap
      matchedInOpp = true;
    }
    if (tagsTokens.has(token)) {
      weightedMatches += 2.5; // High value for tags
      matchedInOpp = true;
    }
    if (titleTokens.has(token)) {
      weightedMatches += 2.0; // Moderate weight for title
      matchedInOpp = true;
    }
    if (summaryTokens.has(token)) {
      weightedMatches += 1.0; // Base weight for eligibility/summary
      matchedInOpp = true;
    }

    if (matchedInOpp) {
      matches += 1;
    }
  }

  // Jaccard-like baseline plus weighted saturation curve
  const overlapRatio = matches / Math.max(queryTokens.size, 1);
  const rawScore = 0.25 * overlapRatio + 0.75 * (1 - Math.exp(-weightedMatches / 10));

  // Add deterministic seed jitter based on opportunity id and query length
  // to ensure reproducible, smooth differentiation even with few exact matches
  let charSum = 0;
  for (let i = 0; i < opportunity.id.length; i++) {
    charSum += opportunity.id.charCodeAt(i);
  }
  const jitter = ((charSum % 17) / 100) * 0.15; // small positive baseline boost up to 0.15

  // Ensure result stays cleanly in [0.10, 0.98] range when text is provided
  const combined = Math.min(0.98, Math.max(0.12, rawScore * 0.85 + jitter));
  return Math.round(combined * 100) / 100;
}

/**
 * Deterministic semantic ranker for candidate opportunity IDs.
 * Returns RankedResult[] sorted descending by similarity.
 */
export function rankCandidates(
  backgroundText: string,
  candidateOpportunities: Opportunity[]
): RankedResult[] {
  const ranked: RankedResult[] = candidateOpportunities.map((opp) => ({
    id: opp.id,
    similarity: computeDeterministicMatch(backgroundText, opp)
  }));

  // Sort descending by similarity score
  ranked.sort((a, b) => b.similarity - a.similarity);
  return ranked;
}
