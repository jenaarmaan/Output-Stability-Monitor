import { StabilityClass } from '../types';

/**
 * Preprocess text for similarity analysis
 */
const tokenize = (text: string): string[] => {
  return text.toLowerCase().match(/\w+/g) || [];
};

const getVector = (tokens: string[]): Record<string, number> => {
  const vector: Record<string, number> = {};
  tokens.forEach(token => {
    vector[token] = (vector[token] || 0) + 1;
  });
  return vector;
};

/**
 * Cosine Similarity (Vector-based)
 */
export const calculateSimilarity = (s1: string, s2: string): number => {
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;

  const v1 = getVector(tokenize(s1));
  const v2 = getVector(tokenize(s2));

  const words = new Set([...Object.keys(v1), ...Object.keys(v2)]);
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  words.forEach(word => {
    const val1 = v1[word] || 0;
    const val2 = v2[word] || 0;
    dotProduct += val1 * val2;
    mag1 += val1 * val1;
    mag2 += val2 * val2;
  });

  const magnitude = Math.sqrt(mag1) * Math.sqrt(mag2);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
};

export const getStabilityClass = (score: number): StabilityClass => {
  if (score > 0.9) return { label: 'Rock Solid', color: 'var(--success)' };
  if (score > 0.7) return { label: 'Stable', color: 'var(--primary)' };
  if (score > 0.4) return { label: 'Variable', color: 'var(--warning)' };
  return { label: 'Volatile', color: 'var(--danger)' };
};

/**
 * Mock generator for LLM results
 */
import { VARIANCE_MESSAGES } from '../constants/models';

export const generateMockResult = (prompt, index) => {
  if (prompt.toLowerCase().includes('fact')) {
    return VARIANCE_MESSAGES[index % VARIANCE_MESSAGES.length];
  }
  return `Response iteration ${index + 1} for: ${prompt.substring(0, 20)}... 
  This is a simulated ${index % 2 === 0 ? 'slightly different' : 'consistent'} output to demonstrate the stability analyzer.`;
};
