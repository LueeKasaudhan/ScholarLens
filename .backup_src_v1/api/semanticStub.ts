// STUB: replaces real all-MiniLM-L6-v2 cosine similarity (NumPy, computed server-side). Do not treat these scores as real.
// Client-side implementation: Mathematical Cosine Similarity Vector Space Engine with TF-IDF and domain keyphrase modeling.

export {
  computeDeterministicMatch,
  rankCandidates,
  tokenizeText,
  computeCorpusIDF,
  buildDocumentVector,
  buildQueryVector,
  calculateVectorNorm,
  computeCosineSimilarity,
  getSemanticEngineStats
} from './semanticEngine';
