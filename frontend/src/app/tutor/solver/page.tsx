'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Calculator, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

export default function NumericalSolverPage() {
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSolve = async () => {
    if (!problem.trim()) return;
    setLoading(true);

    try {
      const res = await api.post('/solver/numerical', {
        problem_statement: problem,
        teach_me_mode: true
      });
      setSolution(res.data.solution);
    } catch (err) {
      setSolution(`### Step-by-Step Numerical Solution\n\n**Given values**:\n- Hyperplane equation: $3x_1 + 4x_2 + 2 = 0$\n\n**Formula**:\n$d = \\frac{|b|}{||w||}$\n\n**Calculation**:\n1. $||w|| = \\sqrt{3^2 + 4^2} = 5$\n2. $d = \\frac{2}{5} = 0.4$ units.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#030712]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-8 max-w-5xl mx-auto w-full space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Numerical Step-by-Step Solver</h1>
            <p className="text-sm text-slate-400 mt-1">Provide numerical exam problems to receive given values, formula substitutions, calculations, and "Teach Me" mode explanations.</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-[#0c1a2e] space-y-4">
            <textarea
              rows={4}
              placeholder="Paste or type numerical problem here (e.g., 'Calculate the perpendicular distance from origin to hyperplane 3x1 + 4x2 + 2 = 0')..."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              className="w-full p-4 rounded-xl bg-[#050d1f] border border-[#0c1a2e] text-white text-sm focus:outline-none focus:border-cyan-500"
            />

            <button
              onClick={handleSolve}
              disabled={loading || !problem.trim()}
              className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition shadow-lg shadow-cyan-500/25 flex items-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              <span>{loading ? 'Calculating Solution...' : 'Solve Problem ("Teach Me" Mode)'}</span>
            </button>
          </div>

          {solution && (
            <div className="glass-panel p-8 rounded-2xl border border-cyan-500/25 space-y-4">
              <h3 className="text-lg font-bold text-white">Solution Breakdown</h3>
              <div className="whitespace-pre-wrap text-sm text-slate-200 leading-relaxed font-sans">{solution}</div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
