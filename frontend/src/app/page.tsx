import React from 'react';
import Link from 'next/link';
import { Sparkles, Brain, BookOpen, Target, CheckCircle2, ArrowRight, Shield, Zap, RefreshCw, BarChart } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-[#0c1a2e] bg-[#030712]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-400 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">StudyMind <span className="text-cyan-400">AI</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white transition">
            Log In
          </Link>
          <Link href="/register" className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white shadow-lg shadow-cyan-500/25 transition">
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-24 text-center max-w-5xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-8">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Next-Generation Adaptive AI Study Platform</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mb-6">
          Turn Course Materials Into Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-300 to-violet-400">Personal AI Teacher</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Upload syllabi, notes, textbooks, and past exam papers. StudyMind AI builds a searchable RAG knowledge base, diagnoses knowledge gaps, generates adaptive quizzes, and dynamically updates your study plan.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/register" className="px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-cyan-500 via-cyan-400 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white shadow-xl shadow-cyan-500/25 transition flex items-center gap-2">
            <span>Start Learning Now</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/dashboard" className="px-8 py-4 rounded-xl text-base font-bold bg-[#050d1f] border border-[#0c1a2e] hover:bg-slate-800 text-slate-200 transition">
            Explore Demo Flow
          </Link>
        </div>
      </section>

      {/* Core Adaptive Loop Diagram */}
      <section className="px-6 py-16 bg-[#050d1f]/40 border-y border-slate-900">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">Core Differentiator</h2>
          <h3 className="text-3xl font-bold text-white mb-12">The Continuous Adaptive Learning Loop</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-5 rounded-xl glass-panel">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm mb-3">1</div>
              <h4 className="font-bold text-white text-base mb-1">Document Ingestion</h4>
              <p className="text-xs text-slate-400">PDFs, PPTs, notes chunked and mapped into vector index.</p>
            </div>
            <div className="p-5 rounded-xl glass-panel">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm mb-3">2</div>
              <h4 className="font-bold text-white text-base mb-1">Grounded RAG Tutor</h4>
              <p className="text-xs text-slate-400">AI tutoring with precise page-level source citations.</p>
            </div>
            <div className="p-5 rounded-xl glass-panel">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm mb-3">3</div>
              <h4 className="font-bold text-white text-base mb-1">Adaptive Quizzes</h4>
              <p className="text-xs text-slate-400">Semantic answer evaluation & weak topic memory tracking.</p>
            </div>
            <div className="p-5 rounded-xl glass-panel">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm mb-3">4</div>
              <h4 className="font-bold text-white text-base mb-1">Mastery & Crash Plan</h4>
              <p className="text-xs text-slate-400">Explainable 0-100 mastery & 2-Hour Crash schedule.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto px-8 py-8 border-t border-slate-900 text-center text-xs text-slate-500">
        © 2026 StudyMind AI. Built with Next.js, FastAPI, and Grounded RAG Architecture.
      </footer>
    </div>
  );
}
