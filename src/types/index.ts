export interface Model {
  id: string;
  name: string;
  reliability: number;
}

export interface StabilityConfig {
  prompt: string;
  iterations: number;
  model: string;
  temperature: number;
  apiKey?: string;
}

export interface StabilityClass {
  label: string;
  color: string;
}

export interface StabilityResult {
  responses: string[];
  similarityMatrix: number[][];
  avgStability: number;
  stabilityClass: StabilityClass;
  timestamp: string;
  config: {
    model: string;
    temperature: number;
    iterations: number;
  };
}

export interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
}
