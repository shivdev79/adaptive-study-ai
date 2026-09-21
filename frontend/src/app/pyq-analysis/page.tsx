'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { FileSearch, Search, TrendingUp, BookOpen, Sparkles, HelpCircle, Target } from 'lucide-react';
import { api } from '@/lib/api';

function getActiveCourse(): { id: number; name: string } {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('studymind_active_course');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.id) return parsed;
      } catch (e) {}
    }
  }
  return { id: 1, name: 'Uploaded Subject' };
}

export default function PYQAnalysisPage() {
  const [activeCourse, setActiveCourse] = useState<{ id: number; name: string }>({ id: 1, name: 'Uploaded Subject' });
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pyqResults, setPyqResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalysis = (courseId: number) => {
    setLoading(true);
    api.get(`/pyq/analysis/${courseId}`)
      .then(res => {
        setAnalysisData(res.data);
        setPyqResults(res.data.pyqs || []);
      })
      .catch((err) => {
        console.error('Failed to fetch PYQ analysis:', err);
        setAnalysisData(null);
        setPyqResults([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const current = getActiveCourse();
    setActiveCourse(current);
    fetchAnalysis(current.id);

    const handleCourseChange = () => {
      const updated = getActiveCourse();
      setActiveCourse(updated);
      fetchAnalysis(updated.id);
    };

    window.addEventListener('active_course_changed', handleCourseChange);
    return () => window.removeEventListener('active_course_changed', handleCourseChange);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setPyqResults(analysisData?.pyqs || []);
      return;
    }
    api.get(`/pyq/search/${activeCourse.id}?query=${encodeURIComponent(query)}`)
      .then(res => setPyqResults(res.data))
      .catch(() => setPyqResults([]));
  };

  return (
    <div className="flex min-h-screen bg-[#030712]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/18 text-cyan-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Subject: {analysisData?.course_name || activeCourse.name}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">PDF-Grounded Previous-Year Question (PYQ) Analysis</h1>
            <p className="text-sm text-slate-400 mt-1">
              Analysis of frequently asked topics, repeated concepts, question patterns, and PYQ practice items extracted directly from your uploaded PDF text.
            </p>
          </div>

          {/* Structured Analysis Cards */}
          {analysisData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Frequently Asked Topics */}
              <div className="glass-panel p-6 rounded-2xl border border-cyan-500/25 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>Frequently Asked Topics</span>
                </div>
                {analysisData.frequently_asked_topics && analysisData.frequently_asked_topics.length > 0 ? (
                  <ul className="space-y-2">
                    {analysisData.frequently_asked_topics.map((item: string, idx: number) => (
                      <li key={idx} className="text-xs text-slate-200 bg-slate-900/80 p-2.5 rounded-xl border border-[#0c1a2e] flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">No specific high-frequency topics flagged in the uploaded PDF text.</p>
                )}
              </div>

              {/* Repeated Concepts */}
              <div className="glass-panel p-6 rounded-2xl border border-violet-500/30 space-y-3">
                <div className="flex items-center gap-2 text-violet-400 font-bold text-sm">
                  <Target className="w-4 h-4" />
                  <span>Repeated Core Concepts</span>
                </div>
                {analysisData.repeated_concepts && analysisData.repeated_concepts.length > 0 ? (
                  <ul className="space-y-2">
                    {analysisData.repeated_concepts.map((item: string, idx: number) => (
                      <li key={idx} className="text-xs text-slate-200 bg-slate-900/80 p-2.5 rounded-xl border border-[#0c1a2e] flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">No repeated concepts detected in uploaded PDF text.</p>
                )}
              </div>

              {/* Question & Difficulty Patterns */}
              <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <BookOpen className="w-4 h-4" />
                  <span>Question & Difficulty Patterns</span>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-[#0c1a2e]">
                    <strong className="text-white block mb-1">Difficulty Pattern:</strong>
                    <span>{analysisData.difficulty_patterns || 'Standard distribution based on uploaded study material.'}</span>
                  </div>
                  {analysisData.question_patterns && analysisData.question_patterns.length > 0 && (
                    <div className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-[#0c1a2e] space-y-1">
                      <strong className="text-white block">Observed Patterns:</strong>
                      {analysisData.question_patterns.map((pat: string, idx: number) => (
                        <div key={idx} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                          <span className="text-emerald-400">•</span>
                          <span>{pat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Topic Frequency Chart Card */}
            <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-[#0c1a2e] space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Historical Topic Frequency
              </h3>

              {analysisData?.topic_frequencies && analysisData.topic_frequencies.length > 0 ? (
                <div className="space-y-4 pt-2">
                  {analysisData.topic_frequencies.map((f: any, idx: number) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-white">{f.topic_name}</span>
                        <span className="text-cyan-400">{f.occurrences} Questions ({f.percentage}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#050d1f] overflow-hidden">
                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${f.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  No topic frequencies indexed yet for this subject. Upload a study material PDF to generate PYQ metrics.
                </div>
              )}
            </div>

            {/* PYQ Search & List */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-[#0c1a2e] space-y-6">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                <input
                  type="text"
                  placeholder={`Search grounding questions for ${activeCourse.name}...`}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#050d1f] border border-[#0c1a2e] text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              {pyqResults.length > 0 ? (
                <div className="space-y-4">
                  {pyqResults.map((p) => (
                    <div key={p.id} className="p-5 rounded-xl bg-[#050d1f] border border-[#0c1a2e] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-cyan-400">{p.year} {p.exam_name || 'Exam Question'}</span>
                        <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">{p.marks} Marks • {p.difficulty}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{p.question_text}</h4>
                      <span className="text-[11px] text-slate-400 block pt-1">Topic: {p.topic_name || 'Grounded PDF Concept'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-300">No Previous-Year Questions Found</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Upload a PDF containing previous year exam questions or study material to automatically extract and analyze PYQ patterns for <strong>{activeCourse.name}</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
