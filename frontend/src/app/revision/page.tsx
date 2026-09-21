'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { RotateCcw, BookOpen, Sparkles, Layers, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RevisionPage() {
  return (
    <div className="flex min-h-screen bg-[#030712]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-8 max-w-6xl mx-auto w-full space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Revision Center</h1>
            <p className="text-sm text-slate-400 mt-1">Consolidated hub for overdue flashcards, key formulas, core definitions, and weak topics.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-[#0c1a2e] space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" /> Overdue Flashcards
              </h3>
              <p className="text-xs text-slate-400">12 flashcards are due for spaced repetition today.</p>
              <Link href="/flashcards" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold hover:bg-cyan-500 transition">
                <span>Start Review</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-[#0c1a2e] space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" /> Mistakes Vault
              </h3>
              <p className="text-xs text-slate-400">2 recurring errors need review before exam day.</p>
              <Link href="/mistakes" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition">
                <span>Open Vault</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
