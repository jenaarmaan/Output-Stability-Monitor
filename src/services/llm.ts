/**
 * LLM Service for handling multiple providers
 */

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export const fetchLLMResponse = async (
  provider: string, 
  prompt: string, 
  options: { temperature?: number; apiKey?: string } = {}
): Promise<string> => {
  const { temperature = 0.7, apiKey } = options;

  // If no API Key, use mock
  if (!apiKey) {
    await delay(1000 + Math.random() * 1000);
    return `[MOCK ${provider.toUpperCase()}] Response for: ${prompt.substring(0, 30)}... (Temp: ${temperature})`;
  }

  // Real implementation placeholder
  // In a real production app, this would call a backend proxy
  // to avoid exposing API keys on the frontend.
  try {
    const response = await fetch('/api/llm-proxy', {
      method: 'POST',
      body: JSON.stringify({ provider, prompt, temperature }),
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }
    });
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('LLM Fetch Error:', error);
    throw new Error(`Failed to fetch from ${provider}`);
  }
};
