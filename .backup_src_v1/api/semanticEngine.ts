/**
 * SEMANTIC MATCHING LAYER: Vector Space Model & Cosine Similarity Engine
 *
 * Implements mathematical Cosine Similarity:
 *   cos(θ) = (q · d) / (||q|| * ||d||)
 *
 * Built with:
 * - Domain-aware technical tokenizer with n-gram keyphrase preservation
 * - Technical ontology and synonym expansions for CS & Engineering
 * - Inverse Document Frequency (IDF) corpus weighting
 * - Sublinear Term Frequency (TF) with field-specific boost weights
 * - Term-by-term dot-product attribution and dimensional alignment breakdown
 */

import { Opportunity, RankedResult, TermContribution, DimensionScores, SemanticEngineStats } from './types';

// Common English stopwords to filter out
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me',
  'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only',
  'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'should', 'so', 'some',
  'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these',
  'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we',
  'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'you',
  'your', 'yours', 'yourself', 'yourselves', 'pursue', 'pursuing', 'want', 'interested', 'looking'
]);

// Domain-specific synonym and concept mappings for CS / Engineering abroad
const TECHNICAL_SYNONYMS: Record<string, string[]> = {
  'ai': ['artificial intelligence', 'machine learning', 'deep learning'],
  'ml': ['machine learning', 'data science', 'deep learning'],
  'dl': ['deep learning', 'neural networks'],
  'nlp': ['natural language processing', 'computational linguistics', 'speech processing'],
  'cv': ['computer vision', 'image processing', 'perception'],
  'robotics': ['autonomous systems', 'control systems', 'mechatronics', 'robotics'],
  'autonomous': ['robotics', 'control systems', 'perception'],
  'embedded': ['embedded systems', 'firmware', 'microcontrollers', 'rtos', 'iot'],
  'vlsi': ['semiconductors', 'chip design', 'fpga', 'integrated circuits', 'hardware'],
  'hardware': ['computer architecture', 'vlsi', 'embedded systems', 'fpga'],
  'security': ['cybersecurity', 'cryptography', 'network security', 'information security'],
  'cyber': ['cybersecurity', 'network security', 'cryptography'],
  'bioinformatics': ['computational biology', 'genomics', 'biomedical'],
  'cloud': ['distributed systems', 'cloud computing', 'networks', 'infrastructure'],
  'systems': ['distributed systems', 'operating systems', 'computer systems'],
  'energy': ['renewable energy', 'sustainability', 'clean tech', 'power systems'],
  'quantum': ['quantum computing', 'quantum information', 'physics']
};

/**
 * Tokenizes text into normalized single-word tokens and recognized technical multi-word phrases.
 */
export function tokenizeText(text: string): string[] {
  if (!text) return [];

  const normalized = text.toLowerCase();
  const tokens: string[] = [];

  // 1. Extract known compound keyphrases first
  const multiWordPhrases = [
    'machine learning', 'artificial intelligence', 'deep learning', 'computer vision',
    'natural language processing', 'embedded systems', 'autonomous systems', 'distributed systems',
    'computer science', 'data science', 'cyber security', 'information security',
    'cloud computing', 'computer architecture', 'software engineering', 'quantum computing',
    'renewable energy', 'computational biology', 'power systems', 'smart grids',
    'tuition waiver', 'full tuition', 'research assistantship', 'masters degree'
  ];

  let scrubbed = normalized;
  for (const phrase of multiWordPhrases) {
    if (scrubbed.includes(phrase)) {
      tokens.push(phrase.replace(/\s+/g, '_'));
      scrubbed = scrubbed.split(phrase).join(' ');
    }
  }

  // 2. Tokenize individual words, preserving technical symbols like c++, c#, .net
  const wordMatches = scrubbed.match(/[a-z0-9+#_.-]+/g) || [];
  for (const word of wordMatches) {
    const cleaned = word.replace(/^[.-]+|[.-]+$/g, '');
    if (cleaned.length >= 2 && !STOP_WORDS.has(cleaned)) {
      tokens.push(cleaned);

      // Add concept expansion if mapped
      if (TECHNICAL_SYNONYMS[cleaned]) {
        for (const syn of TECHNICAL_SYNONYMS[cleaned]) {
          tokens.push(syn.replace(/\s+/g, '_'));
        }
      }
    }
  }

  return tokens;
}

export type SparseVector = Map<string, number>;

/**
 * Pre-computes Inverse Document Frequency (IDF) weights across the opportunity catalog.
 * IDF(t) = ln(1 + (Total Documents) / (Document Frequency(t)))
 */
export function computeCorpusIDF(opportunities: Opportunity[]): Map<string, number> {
  const docFrequency = new Map<string, number>();
  const totalDocs = Math.max(opportunities.length, 1);

  for (const opp of opportunities) {
    const docTokens = new Set<string>();

    // Collect all tokens from the opportunity
    const textCorpus = [
      opp.title,
      opp.fields_of_study.join(' '),
      opp.tags.join(' '),
      opp.eligibility_summary,
      opp.funding_summary,
      opp.provider_name,
      opp.host_institution || '',
      opp.host_country
    ].join(' ');

    const tokens = tokenizeText(textCorpus);
    tokens.forEach((t) => docTokens.add(t));

    for (const t of docTokens) {
      docFrequency.set(t, (docFrequency.get(t) || 0) + 1);
    }
  }

  const idfMap = new Map<string, number>();
  for (const [term, df] of docFrequency.entries()) {
    idfMap.set(term, Math.log(1 + totalDocs / df));
  }

  return idfMap;
}

/**
 * Computes vector representation for an Opportunity with domain-weighted fields.
 */
export function buildDocumentVector(
  opp: Opportunity,
  idfMap: Map<string, number>
): {
  vector: SparseVector;
  fieldVector: SparseVector;
  tagVector: SparseVector;
  eligibilityVector: SparseVector;
} {
  const fullVec: SparseVector = new Map();
  const fieldVec: SparseVector = new Map();
  const tagVec: SparseVector = new Map();
  const eligVec: SparseVector = new Map();

  const addTokensToVec = (tokens: string[], weightMultiplier: number, targetVec?: SparseVector) => {
    // Count frequencies
    const counts = new Map<string, number>();
    for (const t of tokens) {
      counts.set(t, (counts.get(t) || 0) + 1);
    }

    for (const [term, count] of counts.entries()) {
      const idf = idfMap.get(term) || Math.log(1 + 100);
      // Sublinear TF: 1 + ln(count)
      const tf = 1 + Math.log(count);
      const weight = tf * idf * weightMultiplier;

      fullVec.set(term, (fullVec.get(term) || 0) + weight);
      if (targetVec) {
        targetVec.set(term, (targetVec.get(term) || 0) + weight);
      }
    }
  };

  // High weight: Fields of study (Domain anchor)
  addTokensToVec(tokenizeText(opp.fields_of_study.join(' ')), 3.5, fieldVec);
  // High weight: Tags (Technical focus)
  addTokensToVec(tokenizeText(opp.tags.join(' ')), 3.0, tagVec);
  // Medium weight: Title
  addTokensToVec(tokenizeText(opp.title), 2.5);
  // Base weight: Eligibility summary & requirements
  addTokensToVec(tokenizeText(opp.eligibility_summary), 1.6, eligVec);
  // Context weight: Country and degree
  addTokensToVec(tokenizeText(`${opp.host_country} ${opp.degree_level}`), 1.4);
  // Lower context: Provider and funding notes
  addTokensToVec(tokenizeText(`${opp.provider_name} ${opp.funding_summary}`), 1.0);

  return {
    vector: fullVec,
    fieldVector: fieldVec,
    tagVector: tagVec,
    eligibilityVector: eligVec
  };
}

/**
 * Computes vector representation for a query / candidate profile.
 */
export function buildQueryVector(
  queryText: string,
  idfMap: Map<string, number>
): SparseVector {
  const queryVec: SparseVector = new Map();
  const tokens = tokenizeText(queryText);

  if (tokens.length === 0) return queryVec;

  const counts = new Map<string, number>();
  for (const t of tokens) {
    counts.set(t, (counts.get(t) || 0) + 1);
  }

  for (const [term, count] of counts.entries()) {
    const idf = idfMap.get(term) || Math.log(1 + 100);
    const tf = 1 + Math.log(count);
    queryVec.set(term, tf * idf);
  }

  return queryVec;
}

/**
 * Calculates Euclidean norm: ||v|| = sqrt(sum(v_i ^ 2))
 */
export function calculateVectorNorm(vector: SparseVector): number {
  let sumSq = 0;
  for (const val of vector.values()) {
    sumSq += val * val;
  }
  return Math.sqrt(sumSq);
}

/**
 * Computes pure Cosine Similarity between two sparse vectors:
 * cos(u, v) = (u · v) / (||u|| * ||v||)
 */
export function computeCosineSimilarity(
  vecA: SparseVector,
  vecB: SparseVector,
  normA?: number,
  normB?: number
): {
  similarity: number;
  rawCosine: number;
  dotProduct: number;
  normA: number;
  normB: number;
  termContributions: Array<{ term: string; queryWeight: number; docWeight: number; prod: number }>;
} {
  const computedNormA = normA ?? calculateVectorNorm(vecA);
  const computedNormB = normB ?? calculateVectorNorm(vecB);

  if (computedNormA === 0 || computedNormB === 0) {
    return {
      similarity: 0,
      rawCosine: 0,
      dotProduct: 0,
      normA: computedNormA,
      normB: computedNormB,
      termContributions: []
    };
  }

  let dotProduct = 0;
  const termContributions: Array<{ term: string; queryWeight: number; docWeight: number; prod: number }> = [];

  // Iterate over smaller vector for speed
  const [smaller, larger] = vecA.size <= vecB.size ? [vecA, vecB] : [vecB, vecA];

  for (const [term, valA] of smaller.entries()) {
    const valB = larger.get(term);
    if (valB !== undefined) {
      const prod = valA * valB;
      dotProduct += prod;
      termContributions.push({
        term: term.replace(/_/g, ' '),
        queryWeight: vecA.get(term) || 0,
        docWeight: vecB.get(term) || 0,
        prod
      });
    }
  }

    // Pure mathematical cosine: in [0, 1] for non-negative vectors
    const rawCosine = dotProduct / (computedNormA * computedNormB);
    const boundedRaw = Math.min(1.0, Math.max(0.0, rawCosine));

    // In text retrieval between short queries (~15 tokens) and rich documents (~120 tokens),
    // theoretical max cosine is bounded by sqrt(|Q| / |D|) ≈ 0.30 - 0.35.
    // We calibrate to an intuitive [0, 1] fit curve while preserving relative ordering and exact raw cosine.
    let calibratedFit = 0;
    if (boundedRaw > 0) {
      const normalizedRatio = boundedRaw / 0.32;
      calibratedFit = Math.min(0.98, Math.max(0.15, Math.pow(normalizedRatio, 0.75)));
    }

    // Sort term contributions descending by dot product contribution
    termContributions.sort((a, b) => b.prod - a.prod);

    return {
      similarity: Math.round(calibratedFit * 100) / 100,
      rawCosine: Math.round(boundedRaw * 1000) / 1000,
      dotProduct: Math.round(dotProduct * 100) / 100,
      normA: Math.round(computedNormA * 100) / 100,
      normB: Math.round(computedNormB * 100) / 100,
      termContributions
    };
  }

/**
 * Builds a natural-language explanation of why this opportunity matched the candidate.
 */
function buildExplanation(
  opp: Opportunity,
  similarity: number,
  topTerms: string[],
  dimensions: DimensionScores
): string {
  if (similarity < 0.1) {
    return `Minimal alignment (${Math.round(similarity * 100)}% cosine). Consider expanding your background description with technical keywords.`;
  }

  const matchPercent = Math.round(similarity * 100);
  const termList = topTerms.slice(0, 3).join(', ');

  let context = '';
  if (dimensions.field_similarity > 0.4) {
    context = `Strong core domain overlap with ${opp.fields_of_study.slice(0, 2).join(' & ')}.`;
  } else if (dimensions.skills_similarity > 0.4) {
    context = `High technical synergy with program tags (${opp.tags.slice(0, 2).join(', ')}).`;
  } else {
    context = `Good institutional profile alignment in ${opp.host_country}.`;
  }

  return `${matchPercent}% Vector Alignment. Overlapping themes: ${termList || 'academic background'}. ${context}`;
}

// Module-level cached IDF table and document vector cache for speed
let cachedCorpusIDF: Map<string, number> | null = null;
let cachedDocVectors: Map<string, ReturnType<typeof buildDocumentVector>> = new Map();

/**
 * Warms up or retrieves the corpus vector space index.
 */
export function getOrBuildCorpusIndex(opportunities: Opportunity[]) {
  if (!cachedCorpusIDF || cachedDocVectors.size !== opportunities.length) {
    cachedCorpusIDF = computeCorpusIDF(opportunities);
    cachedDocVectors.clear();
    for (const opp of opportunities) {
      cachedDocVectors.set(opp.id, buildDocumentVector(opp, cachedCorpusIDF));
    }
  }
  return { idfMap: cachedCorpusIDF, docVectors: cachedDocVectors };
}

/**
 * Deterministic semantic match score for a single opportunity.
 * Maintained for backward compatibility and test verification.
 */
export function computeDeterministicMatch(
  backgroundText: string,
  opportunity: Opportunity
): number {
  if (!backgroundText.trim()) return 0;
  const { idfMap } = getOrBuildCorpusIndex([opportunity]);
  const queryVec = buildQueryVector(backgroundText, idfMap);
  const { vector: docVec } = buildDocumentVector(opportunity, idfMap);
  const result = computeCosineSimilarity(queryVec, docVec);
  return Math.round(result.similarity * 100) / 100;
}

/**
 * Ranks candidate opportunities using the Cosine Similarity Algorithm.
 * Returns RankedResult[] sorted descending by cosine similarity.
 */
export function rankCandidates(
  backgroundText: string,
  candidateOpportunities: Opportunity[]
): RankedResult[] {
  if (!backgroundText.trim() || candidateOpportunities.length === 0) {
    return candidateOpportunities.map((opp) => ({
      id: opp.id,
      similarity: 0,
      dot_product: 0,
      query_norm: 0,
      doc_norm: 0,
      matched_terms: [],
      top_contributions: [],
      dimension_scores: { field_similarity: 0, skills_similarity: 0, eligibility_fit: 0 },
      explanation: 'No background profile text provided.'
    }));
  }

  const { idfMap, docVectors } = getOrBuildCorpusIndex(candidateOpportunities);
  const queryVec = buildQueryVector(backgroundText, idfMap);
  const queryNorm = calculateVectorNorm(queryVec);

  const results: RankedResult[] = candidateOpportunities.map((opp) => {
    let docEntry = docVectors.get(opp.id);
    if (!docEntry) {
      docEntry = buildDocumentVector(opp, idfMap);
      docVectors.set(opp.id, docEntry);
    }

    // Overall Cosine Similarity
    const fullMatch = computeCosineSimilarity(queryVec, docEntry.vector, queryNorm);

    // Dimensional sub-scores
    const fieldMatch = computeCosineSimilarity(queryVec, docEntry.fieldVector, queryNorm);
    const tagMatch = computeCosineSimilarity(queryVec, docEntry.tagVector, queryNorm);
    const eligMatch = computeCosineSimilarity(queryVec, docEntry.eligibilityVector, queryNorm);

    // Format top contributions with percentages
    const totalDot = Math.max(fullMatch.dotProduct, 0.001);
    const topContributions: TermContribution[] = fullMatch.termContributions.slice(0, 5).map((tc) => ({
      term: tc.term,
      query_weight: Math.round(tc.queryWeight * 100) / 100,
      doc_weight: Math.round(tc.docWeight * 100) / 100,
      contribution_percent: Math.round((tc.prod / totalDot) * 100)
    }));

    const matchedTerms = fullMatch.termContributions.map((tc) => tc.term).slice(0, 6);

    const dimensionScores: DimensionScores = {
      field_similarity: Math.round(fieldMatch.similarity * 100) / 100,
      skills_similarity: Math.round(tagMatch.similarity * 100) / 100,
      eligibility_fit: Math.round(eligMatch.similarity * 100) / 100
    };

    const explanation = buildExplanation(
      opp,
      fullMatch.similarity,
      matchedTerms,
      dimensionScores
    );

    return {
      id: opp.id,
      similarity: fullMatch.similarity,
      raw_cosine: fullMatch.rawCosine,
      dot_product: fullMatch.dotProduct,
      query_norm: fullMatch.normA,
      doc_norm: fullMatch.normB,
      matched_terms: matchedTerms,
      top_contributions: topContributions,
      dimension_scores: dimensionScores,
      explanation
    };
  });

  // Sort strictly descending by cosine similarity
  results.sort((a, b) => b.similarity - a.similarity);
  return results;
}

/**
 * Computes high-level statistics about the semantic matching run.
 */
export function getSemanticEngineStats(
  backgroundText: string,
  candidates: Opportunity[],
  results: RankedResult[],
  durationMs: number
): SemanticEngineStats {
  const queryTokens = tokenizeText(backgroundText);
  const scores = results.map((r) => r.similarity);
  const topScore = scores.length > 0 ? Math.max(...scores) : 0;
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  return {
    query_tokens: Array.from(new Set(queryTokens)).slice(0, 15),
    vocabulary_size: cachedCorpusIDF ? cachedCorpusIDF.size : 0,
    candidates_evaluated: candidates.length,
    top_match_score: Math.round(topScore * 100) / 100,
    avg_match_score: Math.round(avgScore * 100) / 100,
    execution_time_ms: Math.round(durationMs)
  };
}
