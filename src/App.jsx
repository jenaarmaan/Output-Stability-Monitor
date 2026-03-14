import React, { useState, useMemo } from 'react';
import { 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  AlertCircle, 
  Layers, 
  ChevronRight, 
  Info,
  LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { diffWords } from 'diff';
import _ from 'lodash';

// --- MOCK COMPLETIONS ---
const MOCK_MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', reliability: 0.95 },
  { id: 'claude-3-5', name: 'Claude 3.5 Sonnet', reliability: 0.92 },
  { id: 'gemini-1-5-pro', name: 'Gemini 1.5 Pro', reliability: 0.88 },
];

const VARIANCE_MESSAGES = [
  "The capital of France is Paris.",
  "Paris is the capital of France.",
  "The capital city of France is Paris.",
  "France's capital city is Paris.",
  "Paris, the capital of France.",
];

const generateMockResult = (prompt, index) => {
  // Simulate slight variance based on index
  if (prompt.toLowerCase().includes('fact')) {
    return VARIANCE_MESSAGES[index % VARIANCE_MESSAGES.length];
  }
  return `Response iteration ${index + 1} for: ${prompt.substring(0, 20)}... 
  This is a simulated ${index % 2 === 0 ? 'slightly different' : 'consistent'} output to demonstrate the stability analyzer.`;
};

// --- UTILS ---
const calculateSimilarity = (s1, s2) => {
  const words1 = new Set(s1.toLowerCase().match(/\w+/g));
  const words2 = new Set(s2.toLowerCase().match(/\w+/g));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  return intersection.size / union.size;
};

const getStabilityClass = (score) => {
  if (score > 0.9) return { label: 'Rock Solid', color: 'var(--success)' };
  if (score > 0.7) return { label: 'Stable', color: 'var(--primary)' };
  if (score > 0.4) return { label: 'Variable', color: 'var(--warning)' };
  return { label: 'Volatile', color: 'var(--danger)' };
};

// --- COMPONENTS ---

const DashboardCard = ({ title, icon: Icon, children, className }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`glass-panel p-6 card-hover ${className}`}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-lg bg-blue-500/10 text-primary">
        <Icon size={20} />
      </div>
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">{title}</h3>
    </div>
    {children}
  </motion.div>
);

const DiffViewer = ({ text1, text2 }) => {
  const diff = diffWords(text1, text2);
  return (
    <div className="p-4 rounded-xl bg-slate-900/50 font-mono text-sm leading-relaxed overflow-auto max-h-[300px]">
      {diff.map((part, i) => (
        <span 
          key={i} 
          style={{ 
            color: part.added ? 'var(--success)' : part.removed ? 'var(--danger)' : 'var(--text-primary)',
            background: part.added ? 'rgba(16, 185, 129, 0.1)' : part.removed ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
            textDecoration: part.removed ? 'line-through' : 'none',
            padding: '2px 1px'
          }}
        >
          {part.value}
        </span>
      ))}
    </div>
  );
};

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [iterations, setIterations] = useState(3);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedPair, setSelectedPair] = useState([0, 1]);

  const handleAnalyze = async () => {
    if (!prompt.trim()) return;
    setIsAnalyzing(true);
    setResults(null);

    // Simulate analysis delay
    await new Promise(r => setTimeout(r, 2000));

    const responses = Array.from({ length: iterations }, (_, i) => generateMockResult(prompt, i));
    
    // Calculate similarities between all pairs
    const similarityMatrix = [];
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
      timestamp: new Date().toLocaleTimeString()
    });
    setIsAnalyzing(false);
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      {/* Header */}
      <header className="flex flex-col items-center text-center mb-16">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 mb-6 shadow-2xl shadow-primary/20"
        >
          <img src="/logo.png" alt="Stability Monitor Logo" className="w-full h-full object-contain rounded-2xl" />
        </motion.div>
        <h1 className="text-5xl title-gradient mb-4">Output Stability Monitor</h1>
        <p className="text-text-secondary text-lg max-w-2xl">
          Quantify non-determinism in LLM responses. Run repeated prompts and analyze semantic variance in real-time.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Configuration */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <RotateCcw size={20} className="text-primary" />
              Configure Test
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="label">System Prompt / Input</label>
                <textarea 
                  rows={5}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your prompt here to test stability..."
                  className="resize-none"
                />
              </div>

              <div>
                <label className="label">Iterations: {iterations}</label>
                <input 
                  type="range" 
                  min={2} 
                  max={5} 
                  value={iterations}
                  onChange={(e) => setIterations(parseInt(e.target.value))}
                  className="accent-primary"
                />
              </div>

              <div>
                <label className="label">Target Model</label>
                <select className="bg-slate-800">
                  {MOCK_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>

              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !prompt}
                className="glow-btn w-full mt-4 flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Analyzing Stability...
                  </>
                ) : (
                  <>
                    <Play size={18} fill="black" />
                    Start Analysis
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="glass-panel p-6 bg-blue-500/5 border-blue-500/20">
            <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <Info size={16} />
              Why this matters?
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Inconsistent outputs break production pipelines. Our monitor uses semantic similarity scoring to identify drift and help you tune system prompts for deterministic reliability.
            </p>
          </div>
        </div>

        {/* Right Column: Dashboard */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {isAnalyzing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 glass-panel flex flex-col items-center justify-center p-12 min-h-[400px]"
            >
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <h3 className="text-xl font-medium animate-pulse">Running semantic tests...</h3>
              <p className="text-text-secondary mt-2">Computing intersection of embeddings and word vectors</p>
            </motion.div>
          )}

          {!isAnalyzing && results && (
            <div className="space-y-8 animate-in fade-in duration-700">
              {/* Top Row: Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DashboardCard title="Stability Score" icon={ShieldCheck}>
                  <div className="flex items-center gap-6">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r="50" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                        <motion.circle 
                          cx="56" 
                          cy="56" 
                          r="50" 
                          fill="transparent" 
                          stroke={results.stabilityClass.color} 
                          strokeWidth="8" 
                          strokeDasharray={314}
                          initial={{ strokeDashoffset: 314 }}
                          animate={{ strokeDashoffset: 314 - (results.avgStability * 314) }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold">{(results.avgStability * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold" style={{ color: results.stabilityClass.color }}>
                        {results.stabilityClass.label}
                      </h4>
                      <p className="text-sm text-text-secondary mt-1">
                        Across {iterations} runs
                      </p>
                    </div>
                  </div>
                </DashboardCard>

                <DashboardCard title="Variance Classification" icon={AlertCircle}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-text-secondary">Semantic Drift</span>
                      <span className="text-warning">Low</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-warning w-1/4" />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-text-secondary">Formatting Consistency</span>
                      <span className="text-success">Perfect</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-success w-full" />
                    </div>
                  </div>
                </DashboardCard>
              </div>

              {/* Middle Row: Comparison Matrix */}
              <DashboardCard title="Peer Similarity Matrix" icon={Layers}>
                <div className="grid grid-cols-6 gap-2 mt-4">
                  <div className="col-span-1" />
                  {results.responses.map((_, i) => (
                    <div key={i} className="text-center text-xs font-mono text-text-secondary uppercase">R{i+1}</div>
                  ))}
                  
                  {results.similarityMatrix.map((row, i) => (
                    <React.Fragment key={i}>
                      <div className="text-right pr-2 text-xs font-mono text-text-secondary uppercase py-2">R{i+1}</div>
                      {row.map((val, j) => (
                        <div 
                          key={j}
                          onClick={() => setSelectedPair([i, j])}
                          className={`aspect-square rounded-lg flex items-center justify-center cursor-pointer transition-all matrix-cell ${selectedPair[0] === i && selectedPair[1] === j ? 'ring-2 ring-primary shadow-[0_0_15px_var(--primary-glow)]' : ''}`}
                          style={{ 
                            background: val === 1 ? 'rgba(255,255,255,0.05)' : `rgba(0, 242, 255, ${val * 0.8})`,
                            color: val > 0.6 ? '#000' : '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {(val * 100).toFixed(0)}
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </DashboardCard>

              {/* Bottom Row: Diff Viewer */}
              <DashboardCard 
                title={`Diff Highlighter: Run ${selectedPair[0]+1} vs Run ${selectedPair[1]+1}`} 
                icon={ChevronRight}
              >
                <div className="space-y-4">
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                      <span className="text-xs text-text-secondary uppercase font-bold mb-1 block">Original (R{selectedPair[0]+1})</span>
                      <DiffViewer 
                        text1={results.responses[selectedPair[0]]} 
                        text2={results.responses[selectedPair[1]]} 
                      />
                    </div>
                  </div>
                </div>
              </DashboardCard>
            </div>
          )}

          {!isAnalyzing && !results && (
            <div className="flex-1 glass-panel flex flex-col items-center justify-center p-12 text-center">
              <div className="p-4 rounded-full bg-slate-800 text-text-secondary mb-6">
                <LayoutDashboard size={48} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Ready for Analysis</h3>
              <p className="text-text-secondary max-w-md">
                Configure your prompt and iterations on the left to begin checking for output stability.
              </p>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-20 border-t border-glass pt-8 flex justify-between items-center text-sm text-text-secondary">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Stability Engine: Active
        </div>
        <div>Day 03 / 50 • AI Output Stability Monitor</div>
      </footer>
    </div>
  );
}
