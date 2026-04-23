import { Model } from '../types';

export const MOCK_MODELS: Model[] = [
  { id: 'gpt-4o', name: 'GPT-4o', reliability: 0.95 },
  { id: 'claude-3-5', name: 'Claude 3.5 Sonnet', reliability: 0.92 },
  { id: 'gemini-1-5-pro', name: 'Gemini 1.5 Pro', reliability: 0.88 },
];

export const VARIANCE_MESSAGES = [
  "The capital of France is Paris.",
  "Paris is the capital of France.",
  "The capital city of France is Paris.",
  "France's capital city is Paris.",
  "Paris, the capital of France.",
];
