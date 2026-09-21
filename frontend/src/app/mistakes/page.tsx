'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { AlertTriangle, CheckCircle2, RefreshCw, XCircle, BookOpen } from 'lucide-react';
import { api } from '@/lib/api';

function getActiveCourseId(): number {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('studymind_active_course');
    if (saved) {
      try { return JSON.parse(saved).id || 1; } catch (e) {}
    }
  }
  return 1;
}

export default function MistakesPage() {
  const [mistakes, setMistakes] = useState<any[]>([]);

  useEffect(() => {
    fetchMistakes();
    const handleCourseChange = () => fetchMistakes();
    window.addEventListener('active_course_changed', handleCourseChange);
    return () => window.removeEventListener('active_course_changed', handleCourseChange);
  }, []);

  const fetchMistakes = () => {
    const courseId = getActiveCourseId();
    api.get(`/mistakes/course/${courseId}`)
      .then(res => setMistakes(res.data))
      .catch(() => {
        setMistakes([]);
      });
  };

  const handleResolve = async (id: number) => {
    try {
      await api.post(`/mistakes/${id}/resolve`);
      fetchMistakes();
    } catch (err) {
      setMistakes(prev => prev.map(m => m.id === id ? { ...m, resolution_status: 'resolved' } : m));
    }
  };

  return (
    <div className="flex min-h-screen bg-[#030712]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-8 max-w-6xl mx-auto w-full space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Mistakes Vault & Memory</h1>
            <p className="text-sm text-slate-400 mt-1">StudyMind AI remembers your recurring errors to reinforce weak concepts before exam day.</p>
          </div>

          <div className="space-y-4">
            {mistakes.length > 0 ? (
              mistakes.map((m) => (
                <div key={m.id} className="glass-panel p-6 rounded-2xl border border-[#0c1a2e] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20">
                      {m.topic_name}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${m.resolution_status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {m.resolution_status === 'resolved' ? 'Resolved' : 'Needs Revision'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white mb-2">{m.question_text}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 text-rose-300">
                        <strong className="block mb-1 text-rose-400">Your Answer:</strong>
                        {m.student_answer}
                      </div>
                      <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-300">
                        <strong className="block mb-1 text-emerald-400">Correct Reference Answer:</strong>
                        {m.correct_answer}
                      </div>
                    </div>
                  </div>

                  {m.resolution_status !== 'resolved' && (
                    <button
                      onClick={() => handleResolve(m.id)}
                      className="px-4 py-2 rounded-xl bg-[#050d1f] hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Mark as Mastered & Resolved</span>
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="glass-panel p-12 rounded-2xl border border-[#0c1a2e] text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-white">No Unresolved Mistakes!</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  You have no recorded mistakes for this subject. Take quizzes or practice questions generated from your PDF to track your weak areas.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
