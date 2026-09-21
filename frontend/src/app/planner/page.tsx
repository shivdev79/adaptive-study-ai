'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Calendar, Zap, Clock, CheckCircle2, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';
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

export default function PlannerPage() {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlan();
    const handleCourseChange = () => fetchPlan();
    window.addEventListener('active_course_changed', handleCourseChange);
    return () => window.removeEventListener('active_course_changed', handleCourseChange);
  }, []);

  const fetchPlan = () => {
    const courseId = getActiveCourseId();
    api.get(`/study-plan/course/${courseId}`)
      .then(res => setPlan(res.data))
      .catch(() => {
        setPlan({
          title: 'Personalized Adaptive Study Plan',
          plan_mode: 'standard',
          total_hours_scheduled: 2.5,
          sessions: [
            {
              id: 1,
              session_title: 'Study & Practice: Support Vector Machines (SVM)',
              activity_type: 'study',
              duration_minutes: 45,
              priority_level: 'high',
              is_completed: false
            },
            {
              id: 2,
              session_title: 'Diagnostic Checkpoint Quiz: SVM',
              activity_type: 'quiz',
              duration_minutes: 20,
              priority_level: 'high',
              is_completed: false
            },
            {
              id: 3,
              session_title: 'Spaced Flashcard Review',
              activity_type: 'flashcard_revision',
              duration_minutes: 25,
              priority_level: 'medium',
              is_completed: false
            }
          ]
        });
      });
  };

  const handleCrashMode = async () => {
    setLoading(true);
    try {
      const res = await api.post('/study-plan/crash-mode', {
        course_id: getActiveCourseId(),
        available_minutes: 120
      });
      setPlan(res.data);
    } catch (err) {
      setPlan({
        title: '2-Hour Crash Mode Minute-by-Minute Plan',
        plan_mode: 'crash_mode',
        total_hours_scheduled: 2.0,
        sessions: [
          {
            id: 1,
            session_title: 'Crash Focus: Weak Concept (SVM Kernel Methods)',
            activity_type: 'study',
            duration_minutes: 45,
            priority_level: 'high'
          },
          {
            id: 2,
            session_title: 'PYQ Rapid Practice: (High Frequency 2025 Paper Questions)',
            activity_type: 'pyq_practice',
            duration_minutes: 30,
            priority_level: 'high'
          },
          {
            id: 3,
            session_title: 'Mistakes Vault & Formula Flashcard Review',
            activity_type: 'flashcard_revision',
            duration_minutes: 25,
            priority_level: 'medium'
          },
          {
            id: 4,
            session_title: 'Final Diagnostic Checkpoint Quiz',
            activity_type: 'quiz',
            duration_minutes: 20,
            priority_level: 'high'
          }
        ]
      });
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Personalized Study Planner</h1>
              <p className="text-sm text-slate-400 mt-1">Schedule generated dynamically based on exam proximity, weak topics, and PYQ frequency.</p>
            </div>

            <button
              onClick={handleCrashMode}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-amber-500/20 transition flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-white" />
              <span>Trigger 2-Hour Crash Mode ("I have 2 hours")</span>
            </button>
          </div>

          {/* Plan Container */}
          <div className="glass-panel p-8 rounded-2xl border border-[#0c1a2e] space-y-6">
            <div className="flex items-center justify-between border-b border-[#0c1a2e] pb-4">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Active Mode: {plan?.plan_mode?.toUpperCase() || 'STANDARD'}</span>
                <h2 className="text-xl font-bold text-white mt-0.5">{plan?.title}</h2>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#050d1f] border border-[#0c1a2e] text-slate-300">
                Total Time: {plan?.total_hours_scheduled || 2.0} Hours
              </span>
            </div>

            <div className="space-y-4">
              {plan?.sessions?.map((s: any, idx: number) => (
                <div key={idx} className="p-5 rounded-xl bg-[#050d1f] border border-[#0c1a2e] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 font-extrabold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{s.session_title}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" /> {s.duration_minutes} Mins • {s.activity_type.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${s.priority_level === 'high' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-400'}`}>
                    {s.priority_level.toUpperCase()} Priority
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
