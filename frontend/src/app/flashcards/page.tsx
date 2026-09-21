'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Layers, RotateCcw, CheckCircle2, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

export default function FlashcardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [courseId, setCourseId] = useState<number>(0);
  const [courseName, setCourseName] = useState<string>('');

  useEffect(() => {
    // Load active course from localStorage
    const saved = localStorage.getItem('studymind_active_course');
    let cId = 0;
    let cName = '';
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        cId = parsed.id || 0;
        cName = parsed.name || '';
      } catch (e) {}
    }
    if (!cId) {
      // Fallback: fetch all courses and pick first
      api.get('/courses').then(res => {
        const courses = res.data;
        if (courses && courses.length > 0) {
          cId = courses[0].id;
          cName = courses[0].name;
          setCourseId(cId);
          setCourseName(cName);
          fetchCards(cId);
        }
      });
      return;
    }
    setCourseId(cId);
    setCourseName(cName);
    fetchCards(cId);

    const handleCourseChange = () => {
      const updated = localStorage.getItem('studymind_active_course');
      if (updated) {
        try {
          const parsed = JSON.parse(updated);
          setCourseId(parsed.id);
          setCourseName(parsed.name || '');
          fetchCards(parsed.id);
          setCurrentIndex(0);
          setFlipped(false);
        } catch (e) {}
      }
    };
    window.addEventListener('active_course_changed', handleCourseChange);
    return () => window.removeEventListener('active_course_changed', handleCourseChange);
  }, []);

  const fetchCards = (cId?: number) => {
    const id = cId || courseId;
    if (!id) return;
    api.get(`/flashcards/due/course/${id}`)
      .then(res => setCards(res.data))
      .catch(() => {
        setCards([]);
      });
  };

  const handleRating = async (rating: string) => {
    if (cards.length === 0) return;
    const currentCard = cards[currentIndex];

    try {
      await api.post(`/flashcards/${currentCard.id}/review`, { rating });
    } catch (err) {
      console.error(err);
    }

    setFlipped(false);
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      fetchCards();
      setCurrentIndex(0);
    }
  };

  const current = cards[currentIndex];

  return (
    <div className="flex min-h-screen bg-[#030712]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-8 max-w-4xl mx-auto w-full space-y-8 flex flex-col items-center">
          <div className="w-full text-center">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Spaced Repetition Flashcards</h1>
            {courseName && (
              <p className="text-xs font-semibold text-cyan-400 mt-1">📚 {courseName}</p>
            )}
            <p className="text-sm text-slate-400 mt-1">SuperMemo (SM-2) algorithm calculates review intervals to lock concepts into long-term memory.</p>
          </div>

          {current ? (
            <div className="w-full max-w-xl space-y-6">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Card {currentIndex + 1} of {cards.length} Due</span>
                <span className="text-cyan-400 font-semibold">{current.interval_days} Day Interval</span>
              </div>

              {/* Card Container */}
              <div
                onClick={() => setFlipped(!flipped)}
                className="w-full min-h-[300px] glass-panel p-8 rounded-3xl border border-cyan-500/25 flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-300 hover:border-indigo-500/60 shadow-2xl relative"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  {flipped ? 'Answer / Back' : 'Question / Front (Click to Flip)'}
                </span>

                <div className="my-auto px-4">
                  <h3 className="text-xl font-bold text-white leading-relaxed">
                    {flipped ? current.back : current.front}
                  </h3>
                </div>

                <p className="text-xs text-slate-500">Tap card to toggle flip</p>
              </div>

              {/* SM-2 Rating Buttons */}
              {flipped && (
                <div className="grid grid-cols-4 gap-3 pt-2">
                  <button
                    onClick={() => handleRating('again')}
                    className="py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs transition"
                  >
                    Again (&lt;1d)
                  </button>
                  <button
                    onClick={() => handleRating('hard')}
                    className="py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold text-xs transition"
                  >
                    Hard (1d)
                  </button>
                  <button
                    onClick={() => handleRating('good')}
                    className="py-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 text-cyan-400 font-bold text-xs transition"
                  >
                    Good (3d)
                  </button>
                  <button
                    onClick={() => handleRating('easy')}
                    className="py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs transition"
                  >
                    Easy (6d)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center glass-panel p-12 rounded-3xl max-w-md w-full space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-xl font-bold text-white">All Due Cards Reviewed!</h3>
              <p className="text-xs text-slate-400">Great work! You have completed all scheduled flashcards for today.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
