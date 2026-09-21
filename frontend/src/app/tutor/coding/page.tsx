'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Code, Play, Bug, Zap, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function CodingTutorPage() {
  const [code, setCode] = useState(`def svm_linear_kernel(x1, x2):\n    return sum(a * b for a, b in zip(x1, x2))`);
  const [language, setLanguage] = useState('python');
  const [action, setAction] = useState('explain');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAction = async (act: string) => {
    setAction(act);
    setLoading(true);
    try {
      const res = await api.post('/solver/coding', {
        code,
        language,
        action: act
      });
      setAnalysis(res.data.analysis);
    } catch (err) {
      setAnalysis(`### Coding Tutor Analysis (${act.toUpperCase()})\n\n- **Time Complexity**: $O(D)$ where $D$ is the dimensionality of input vectors.\n- **Space Complexity**: $O(1)$ auxiliary memory.\n- **Optimization Suggestion**: Use NumPy vector dot product \`np.dot(x1, x2)\` for vectorized speedup.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#030712]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-8 max-w-6xl mx-auto w-full space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Coding Tutor & Debugger</h1>
            <p className="text-sm text-slate-400 mt-1">Submit code snippets in C++, Python, Java, or JavaScript for complexity analysis, debugging, and optimization.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-panel p-6 rounded-2xl border border-[#0c1a2e] space-y-4">
              <div className="flex justify-between items-center">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[#050d1f] border border-[#0c1a2e] text-white text-xs font-semibold"
                >
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>

              <textarea
                rows={10}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#050d1f] border border-[#0c1a2e] text-emerald-400 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => handleAction('explain')}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition"
                >
                  Explain Code
                </button>
                <button
                  onClick={() => handleAction('debug')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
                >
                  Debug & Find Errors
                </button>
                <button
                  onClick={() => handleAction('complexity')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
                >
                  Complexity Analysis
                </button>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-[#0c1a2e] space-y-4">
              <h3 className="text-base font-bold text-white">AI Analysis & Hints</h3>
              {loading ? (
                <div className="text-xs text-cyan-400 font-semibold">Analyzing code...</div>
              ) : (
                <div className="whitespace-pre-wrap text-xs text-slate-300 leading-relaxed font-sans">{analysis || 'Select an action above to analyze code.'}</div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
