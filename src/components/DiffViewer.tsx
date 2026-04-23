import React, { useState, useEffect, useRef } from 'react';
import { DiffPart } from '../types';

interface DiffViewerProps {
  text1: string;
  text2: string;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ text1, text2 }) => {
  const [diff, setDiff] = useState<DiffPart[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    setIsProcessing(true);
    
    // Create worker
    const worker = new Worker(new URL('../utils/diffWorker.js', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<DiffPart[]>) => {
      setDiff(e.data);
      setIsProcessing(false);
    };

    worker.postMessage({ text1, text2 });

    return () => {
      worker.terminate();
    };
  }, [text1, text2]);

  if (isProcessing) {
    return (
      <div className="p-8 flex items-center justify-center text-text-secondary animate-pulse">
        Computing differences...
      </div>
    );
  }

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

export default DiffViewer;
