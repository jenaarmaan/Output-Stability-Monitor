import { useState, useEffect } from 'react';
import { calculateSimilarity, getStabilityClass } from '../utils/stability';
import { fetchLLMResponse } from '../services/llm';
import { StabilityResult, StabilityConfig } from '../types';

const STORAGE_KEY = 'stability_monitor_results';

export const useStabilityAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [results, setResults] = useState<StabilityResult | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  // Persist results
  useEffect(() => {
    if (results) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    }
  }, [results]);

  const analyzeStability = async (config: StabilityConfig) => {
    const { prompt, iterations, model, temperature, apiKey } = config;
    if (!prompt.trim()) return;
    
    setIsAnalyzing(true);
    setResults(null);

    try {
      // Run iterations in parallel
      const fetchPromises = Array.from({ length: iterations }, () => 
        fetchLLMResponse(model, prompt, { temperature, apiKey })
      );
      
      const responses = await Promise.all(fetchPromises);
      
      // Calculate similarities
      const similarityMatrix: number[][] = [];
      let totalScore = 0;
      let count = 0;

      for (let i = 0; i < responses.length; i++) {
        similarityMatrix[i] = [];
        for (let j = 0; j < responses.length; j++) {
          const score = i === j ? 1 : calculateSimilarity(responses[i], responses[j]);
          similarityMatrix[i][j] = score;
          if (i < j) {
            totalScore += score;
            count++;
          }
        }
      }

      const avgStability = count > 0 ? totalScore / count : 1;

      setResults({
        responses,
        similarityMatrix,
        avgStability,
        stabilityClass: getStabilityClass(avgStability),
        timestamp: new Date().toLocaleTimeString(),
        config: { model, temperature, iterations }
      });
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearResults = () => {
    setResults(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    isAnalyzing,
    results,
    analyzeStability,
    clearResults,
    setResults
  };
};
