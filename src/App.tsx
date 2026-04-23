import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  AlertCircle, 
  Layers, 
  ChevronRight, 
  Info,
  LayoutDashboard,
  Trash2,
  Download,
  Settings2
} from 'lucide-react';
import { motion } from 'framer-motion';

// Hooks & Utils
import { useStabilityAnalysis } from './hooks/useStabilityAnalysis';
import { MOCK_MODELS } from './constants/models';

// Components
import DashboardCard from './components/DashboardCard';
import DiffViewer from './components/DiffViewer';

export default function App() {
  const [prompt, setPrompt] = useState<string>('');
  const [iterations, setIterations] = useState<number>(3);
  const [model, setModel] = useState<string>(MOCK_MODELS[0].id);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [selectedPair, setSelectedPair] = useState<[number, number]>([0, 1]);
  
  const { isAnalyzing, results, analyzeStability, clearResults } = useStabilityAnalysis();

  const handleAnalyze = () => {
    analyzeStability({
      prompt,
      iterations,
      model,
      temperature,
    });
  };

  const handleExport = () => {
    if (!results) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "stability_report.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="relative min-h-screen selection:bg-primary/30">
      <div className="mesh-gradient" />
      
      <div className="container mx-auto py-12 px-6">
        {/* Header */}
        <header className="flex flex-col items-center text-center mb-20">
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-panel mb-8 border-primary/20"
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase text-primary">Stability Engine v2.0</span>
          </motion.div>
          
          <motion.h1 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="title-hero"
          >
            Output Stability <span className="text-gradient">Monitor</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-text-muted text-xl max-w-3xl leading-relaxed"
          >
            Advanced diagnostic suite for quantifying LLM non-determinism. 
            Identify semantic drift and optimize prompt reliability with vector-based analysis.
          </motion.p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            <motion.div 
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="glass-panel p-8"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Settings2 size={24} />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Diagnostic Config</h2>
              </div>
              
              <div className="space-y-6">
                <div className="input-group">
                  <label>Test Prompt</label>
                  <textarea 
                    rows={6}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter system instructions or user prompt..."
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="input-group">
                    <label>Iterations ({iterations})</label>
                    <input 
                      type="range" 
                      min={2} 
                      max={5} 
                      value={iterations}
                      onChange={(e) => setIterations(parseInt(e.target.value))}
                    />
                  </div>
                  <div className="input-group">
                    <label>Temp ({temperature})</label>
                    <input 
                      type="range" 
                      min={0} 
                      max={1} 
                      step={0.1}
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Model Infrastructure</label>
                  <select 
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  >
                    {MOCK_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>

                <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !prompt}
                  className="btn-primary w-full py-4 mt-4"
                >
                  {isAnalyzing ? (
                    <>
                      <RotateCcw className="animate-spin" size={20} />
                      Analyzing Vectors...
                    </>
                  ) : (
                    <>
                      <Play fill="currentColor" size={20} />
                      Initialize Test
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {results && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-3 pt-4 border-t border-white/5"
                    >
                      <button onClick={handleExport} className="flex-1 p-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm flex items-center justify-center gap-2 transition-all">
                        <Download size={16} /> Export
                      </button>
                      <button onClick={clearResults} className="p-3 rounded-xl bg-danger/10 hover:bg-danger/20 text-danger text-sm flex items-center justify-center gap-2 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div 
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-panel p-6 bg-primary/5 border-primary/10"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/20 text-primary mt-1">
                  <Info size={18} />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Vector Analysis</h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    We use multi-dimensional cosine similarity to measure semantic variance across iterations. 
                  </p>
                </div>
              </div>
            </motion.div>
          </aside>

          {/* Main Display */}
          <main className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="glass-panel h-full flex flex-col items-center justify-center p-20 text-center min-h-[600px]"
                >
                  <div className="relative w-32 h-32 mb-10">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <div className="absolute inset-4 border-4 border-secondary/20 rounded-full" />
                    <div className="absolute inset-4 border-4 border-secondary border-b-transparent rounded-full animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4 tracking-tight">Synthesizing Samples</h2>
                  <p className="text-text-muted text-lg max-w-md">Running {iterations} parallel diagnostic requests and computing similarity matrices...</p>
                </motion.div>
              ) : results ? (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <DashboardCard title="Stability Score" icon={ShieldCheck}>
                      <div className="flex items-center gap-8">
                        <div className="relative w-32 h-32">
                          <svg className="w-full h-full -rotate-90">
                            <circle cx="64" cy="64" r="58" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                            <motion.circle 
                              cx="64" cy="64" r="58" fill="transparent" 
                              stroke={results.stabilityClass.color} 
                              strokeWidth="12" 
                              strokeLinecap="round"
                              strokeDasharray={364}
                              initial={{ strokeDashoffset: 364 }}
                              animate={{ strokeDashoffset: 364 - (results.avgStability * 364) }}
                              transition={{ duration: 2, ease: "circOut" }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold">{(results.avgStability * 100).toFixed(0)}<span className="text-sm opacity-50">%</span></span>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-2xl font-bold mb-1" style={{ color: results.stabilityClass.color }}>
                            {results.stabilityClass.label}
                          </h4>
                          <p className="text-text-muted font-medium uppercase tracking-widest text-xs">
                            Reliability Metric
                          </p>
                        </div>
                      </div>
                    </DashboardCard>

                    <DashboardCard title="System Metrics" icon={AlertCircle}>
                      <div className="space-y-6 pt-2">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                            <span className="text-text-muted">Semantic Consistency</span>
                            <span className="text-primary">{(results.avgStability * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${results.avgStability * 100}%` }}
                              className="h-full bg-primary"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-sm font-medium text-text-muted">Diagnostic Timestamp</span>
                          <span className="text-sm font-mono text-primary">{results.timestamp}</span>
                        </div>
                      </div>
                    </DashboardCard>
                  </div>

                  <DashboardCard title="Peer Similarity Matrix" icon={Layers}>
                    <div 
                      className="matrix-grid mt-6" 
                      style={{ '--iterations': results.responses.length + 1 } as any}
                    >
                      <div />
                      {results.responses.map((_, i) => (
                        <div key={i} className="text-center text-[10px] font-bold text-text-muted uppercase py-2">Run {i+1}</div>
                      ))}
                      
                      {results.similarityMatrix.map((row, i) => (
                        <React.Fragment key={i}>
                          <div className="flex items-center justify-end pr-4 text-[10px] font-bold text-text-muted uppercase">Run {i+1}</div>
                          {row.map((val, j) => (
                            <motion.div 
                              key={j}
                              whileHover={{ scale: 1.05 }}
                              onClick={() => setSelectedPair([i, j])}
                              className={`matrix-cell ${selectedPair[0] === i && selectedPair[1] === j ? 'ring-2 ring-primary ring-offset-4 ring-offset-bg-deep' : ''}`}
                              style={{ 
                                background: val === 1 ? 'rgba(255,255,255,0.05)' : `rgba(var(--primary-rgb), ${val * 0.9})`,
                                color: val > 0.6 ? '#000' : '#fff'
                              }}
                            >
                              {(val * 100).toFixed(0)}
                            </motion.div>
                          ))}
                        </React.Fragment>
                      ))}
                    </div>
                  </DashboardCard>

                  <DashboardCard 
                    title={`Vector Diff: Sample ${selectedPair[0]+1} vs ${selectedPair[1]+1}`} 
                    icon={ChevronRight}
                  >
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-text-muted uppercase mb-2">
                        <span>Semantic Comparison Engine</span>
                        <span className="text-primary">Cosine Score: {results.similarityMatrix[selectedPair[0]][selectedPair[1]].toFixed(4)}</span>
                      </div>
                      <DiffViewer 
                        text1={results.responses[selectedPair[0]]} 
                        text2={results.responses[selectedPair[1]]} 
                      />
                    </div>
                  </DashboardCard>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-panel h-full flex flex-col items-center justify-center p-20 text-center min-h-[600px] border-dashed border-white/10"
                >
                  <div className="p-8 rounded-full bg-white/5 text-white/20 mb-10 scale-150 border border-white/5">
                    <LayoutDashboard size={48} />
                  </div>
                  <h3 className="text-4xl font-bold mb-4 tracking-tight">Awaiting Initialization</h3>
                  <p className="text-text-muted text-lg max-w-sm leading-relaxed">
                    The stability diagnostics suite is idle. Configure your parameters and initialize the vector analysis.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>

        <footer className="mt-32 border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-text-muted">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase tracking-widest border border-success/20">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Engine Online
            </div>
            <span className="opacity-50">Day 03 / 50 • Neural Architect Suite</span>
          </div>
          <div className="flex gap-8 font-medium">
            <a href="#" className="hover:text-primary transition-colors">Documentation</a>
            <a href="#" className="hover:text-primary transition-colors">System Status</a>
            <a href="#" className="hover:text-primary transition-colors">Vector Specs</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
