'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import {
  Sparkles,
  Brain,
  Target,
  Flame,
  Layers,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  BookOpen,
  Calendar,
  Upload,
  MessageSquare,
  FileSearch,
  PenTool,
  RotateCcw,
  Plus,
  Zap,
  HelpCircle
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { api } from '@/lib/api';

const masteryTrendData = [
  { day: 'Mon', mastery: 42 },
  { day: 'Tue', mastery: 48 },
  { day: 'Wed', mastery: 51 },
  { day: 'Thu', mastery: 55 },
  { day: 'Fri', mastery: 58 },
  { day: 'Sat', mastery: 61 },
  { day: 'Sun', mastery: 63 },
];

const coreFeaturesHub = [
  {
    icon: Upload,
    title: '📄 Upload Study Material',
    description: 'Upload PPTs, PDFs, notes, textbooks, and past papers to build your RAG knowledge base.',
    href: '/documents',
    color: 'from-cyan-500/20 to-cyan-600/10 text-cyan-400 border-cyan-500/25'
  },
  {
    icon: MessageSquare,
    title: '🔎 RAG Question Answering',
    description: 'Ask AI tutor any question grounded strictly in your uploaded course materials with citations.',
    href: '/tutor',
    color: 'from-violet-500/20 to-violet-600/10 text-violet-400 border-violet-500/25'
  },
  {
    icon: Brain,
    title: '🧠 "Explain Like I\'m Beginner"',
    description: 'Break down complex formulas and theories using simple analogies and plain English.',
    href: '/tutor?mode=beginner',
    color: 'from-cyan-500/20 to-violet-600/10 text-cyan-300 border-cyan-500/30'
  },
  {
    icon: Sparkles,
    title: '📝 Generate MCQs from Material',
    description: 'Instantly generate diagnostic multiple-choice questions from your uploaded PPTs/PDFs.',
    href: '/quiz?type=mcq',
    color: 'from-emerald-500/20 to-teal-600/10 text-emerald-400 border-emerald-500/30'
  },
  {
    icon: PenTool,
    title: '✍️ Short & Long Answer Questions',
    description: 'Write freeform conceptual & mathematical answers evaluated semantically by AI.',
    href: '/quiz?type=descriptive',
    color: 'from-cyan-500/20 to-cyan-600/10 text-cyan-400 border-cyan-500/30'
  },
  {
    icon: FileSearch,
    title: '📊 Analyze PYQs & Exam Topics',
    description: 'Identify high-frequency historical exam topics and search past year questions.',
    href: '/pyq-analysis',
    color: 'from-violet-500/20 to-cyan-600/10 text-violet-400 border-violet-500/30'
  },
  {
    icon: AlertTriangle,
    title: '🎯 Detect Weak Topics',
    description: 'Track recurring mistakes and prerequisite gaps automatically from quiz performance.',
    href: '/mistakes',
    color: 'from-rose-500/20 to-rose-600/10 text-rose-400 border-rose-500/25'
  },
  {
    icon: Calendar,
    title: '📅 Personalized Timetable',
    description: 'Generate adaptive study schedules or trigger a minute-by-minute 2-Hour Crash Mode.',
    href: '/planner',
    color: 'from-cyan-500/20 to-cyan-600/10 text-cyan-400 border-cyan-500/30'
  },
  {
    icon: Layers,
    title: '🔄 Spaced Repetition Revision',
    description: 'SuperMemo (SM-2) flashcards to review overdue concepts before you forget them.',
    href: '/flashcards',
    color: 'from-violet-500/20 to-violet-600/10 text-violet-400 border-violet-500/30'
  },
  {
    icon: BookOpen,
    title: '💬 Chat With Entire Syllabus',
    description: 'Converse with your whole course curriculum in Exam, Socratic, or Interview modes.',
    href: '/tutor',
    color: 'from-teal-500/20 to-teal-600/10 text-teal-400 border-teal-500/30'
  },
];

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeCourse, setActiveCourse] = useState<any>(null);

  const syncActiveCourse = () => {
    const saved = localStorage.getItem('studymind_active_course');
    if (saved) {
      try {
        setActiveCourse(JSON.parse(saved));
      } catch (e) {}
    }
  };

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(res => setDashboardData(res.data))
      .catch(() => {
        setDashboardData({
          user_name: 'Student',
          greeting: 'Welcome',
          overall_mastery: 0.0,
          exam_readiness: 0.0,
          streak_days: 1,
          flashcards_due_today: 0,
          weak_topics_count: 0,
          next_recommended_activity: 'Upload PDF Study Material',
          next_recommended_topic: 'Uploaded Course Concepts'
        });
      });

    syncActiveCourse();
    window.addEventListener('active_course_changed', syncActiveCourse);
    return () => window.removeEventListener('active_course_changed', syncActiveCourse);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#030712]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Top Material Upload & Hero Banner */}
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden border border-cyan-500/25 shadow-2xl">
            <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Adaptive Subject: {activeCourse ? activeCourse.name : 'Upload Your PPT / PDF'}</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Welcome, <span className="text-cyan-400">{dashboardData?.user_name || 'Alex'}</span>. Upload your PPTs & notes to adapt the layout.
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Upload course PPTs, PDFs, or previous year papers. StudyMind AI instantly extracts text, builds a grounded RAG knowledge base, generates MCQs, short/long answers, flashcards, and updates your personalized study schedule for <strong>{activeCourse ? activeCourse.name : 'your uploaded subject'}</strong>.
                </p>
              </div>

              {/* Upload Drop Button Box */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-cyan-500/25 flex flex-col items-center text-center shrink-0 max-w-xs shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3 border border-cyan-500/25">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Upload Study Material</h4>
                <p className="text-[11px] text-slate-400 mb-4">Supports PPT, PPTX, PDF, DOCX & TXT</p>
                
                <Link
                  href="/documents"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload PPT / PDF Now</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Core Features & Sub-Bars Hub Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Core Features Hub</h2>
                <p className="text-xs text-slate-400">Direct sub-bars access to all 10 StudyMind AI modules.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {coreFeaturesHub.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <Link
                    key={idx}
                    href={feat.href}
                    className={`glass-panel p-4 rounded-2xl border bg-gradient-to-b ${feat.color} hover:scale-102 transition-all duration-200 flex flex-col justify-between space-y-3 glass-panel-hover`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-[#030712]/60 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white mb-1 leading-snug">{feat.title}</h3>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">{feat.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass-panel p-5 rounded-xl border border-[#0c1a2e] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Overall Mastery</p>
                <h3 className="text-2xl font-extrabold text-white">{dashboardData?.overall_mastery || 63}%</h3>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                  <TrendingUp className="w-3 h-3" /> +15% Growth
                </span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-[#0c1a2e] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center shrink-0">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Exam Readiness Index</p>
                <h3 className="text-2xl font-extrabold text-white">{dashboardData?.exam_readiness || 78.5}%</h3>
                <span className="text-[11px] text-cyan-400 font-semibold mt-0.5 block">Good Standing</span>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-[#0c1a2e] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Revision Due</p>
                <h3 className="text-2xl font-extrabold text-white">{dashboardData?.flashcards_due_today || 12} Cards</h3>
                <Link href="/flashcards" className="text-[11px] text-amber-400 font-semibold hover:underline mt-0.5 block">
                  Review Flashcards →
                </Link>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-[#0c1a2e] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Weak Concepts</p>
                <h3 className="text-2xl font-extrabold text-white">{dashboardData?.weak_topics_count || 2} Topics</h3>
                <Link href="/mistakes" className="text-[11px] text-rose-400 font-semibold hover:underline mt-0.5 block">
                  Mistakes Vault →
                </Link>
              </div>
            </div>
          </div>

          {/* Progress Chart & Schedule Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="glass-panel p-6 rounded-2xl border border-[#0c1a2e]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">Course Mastery Progress</h3>
                    <p className="text-xs text-slate-400">Subject: {activeCourse ? activeCourse.name : 'Uploaded Material'}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    +15% Growth
                  </span>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={masteryTrendData}>
                      <defs>
                        <linearGradient id="colorMastery" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#050d1f', borderColor: 'rgba(34,211,238,0.2)', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ color: '#22d3ee' }}
                      />
                      <Area type="monotone" dataKey="mastery" stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#colorMastery)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right Column: Weak Topics & Quick Action Link */}
            <div className="space-y-8">
              <div className="glass-panel p-6 rounded-2xl border border-[#0c1a2e]">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Detected Weak Concepts
                </h3>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-bold text-white">{activeCourse ? `${activeCourse.name} Core Principles` : 'Kernel Trick & Feature Mapping'}</h4>
                      <span className="text-xs font-extrabold text-rose-400">48% Mastery</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                      Reason: 2 repeated mistakes in quiz attempt.
                    </p>
                    <Link
                      href="/tutor?mode=socratic"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:underline"
                    >
                      <span>Ask Socratic Tutor</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
