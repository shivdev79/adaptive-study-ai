'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { BarChart3, TrendingUp, Target, Award, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { api } from '@/lib/api';

const accuracyData = [
  { topic: 'Regression', accuracy: 88 },
  { topic: 'SVM', accuracy: 52 },
  { topic: 'Trees', accuracy: 75 },
  { topic: 'Clustering', accuracy: 80 },
  { topic: 'PCA', accuracy: 60 },
];

export default function AnalyticsPage() {
  const [readiness, setReadiness] = useState<any>(null);

  useEffect(() => {
    api.get('/analytics/readiness/1')
      .then(res => setReadiness(res.data))
      .catch(() => {
        setReadiness({
          overall_readiness: 78.5,
          status: 'Good Standing',
          components: [
            { name: 'Overall Concept Mastery', score: 63.0, description: 'Calculated from quiz accuracy & recency across topics.' },
            { name: 'Quiz Performance', score: 75.0, description: 'Average score across timed adaptive quiz attempts.' },
            { name: 'PYQ Coverage', score: 78.0, description: 'Historical exam coverage based on uploaded paper analysis.' },
            { name: 'Recall & Memory Retain', score: 82.0, description: 'Spaced repetition retention rate from flashcard reviews.' }
          ]
        });
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-[#030712]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Analytics & Exam Readiness Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">Real-time internal readiness metrics derived from your adaptive learning performance.</p>
          </div>

          {/* Readiness Top Banner */}
          <div className="glass-panel p-8 rounded-2xl border border-cyan-500/25 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-extrabold text-3xl border border-cyan-500/25">
                {readiness?.overall_readiness || 78.5}%
              </div>
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Exam Readiness Indicator</span>
                <h2 className="text-2xl font-bold text-white">{readiness?.status || 'Good Standing'}</h2>
                <p className="text-xs text-slate-400 mt-1">Internal readiness calculation combining mastery, quiz scores, PYQ coverage, and recall.</p>
              </div>
            </div>

            <span className="px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
              On Track for Target 92%
            </span>
          </div>

          {/* Components Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {readiness?.components.map((c: any, idx: number) => (
              <div key={idx} className="glass-panel p-5 rounded-xl border border-[#0c1a2e] space-y-2">
                <span className="text-xs font-semibold text-slate-400">{c.name}</span>
                <h3 className="text-2xl font-extrabold text-white">{c.score}%</h3>
                <p className="text-[11px] text-slate-500 leading-tight">{c.description}</p>
              </div>
            ))}
          </div>

          {/* Accuracy Breakdown Bar Chart */}
          <div className="glass-panel p-6 rounded-2xl border border-[#0c1a2e] space-y-4">
            <h3 className="text-lg font-bold text-white">Topic Accuracy Breakdown</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accuracyData}>
                  <XAxis dataKey="topic" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  <Bar dataKey="accuracy" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
