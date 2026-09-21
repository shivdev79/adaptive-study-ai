'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { BookOpen, Plus, Calendar, Target, Clock, GraduationCap, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: 'Computer Science',
    description: '',
    target_score: 90,
    daily_study_time_minutes: 120,
    difficulty: 'Medium',
    semester: 'Fall 2026'
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    api.get('/courses')
      .then(res => setCourses(res.data))
      .catch(() => {});
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/courses', formData);
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#030712]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Enrolled Courses</h1>
              <p className="text-sm text-slate-400 mt-1">Manage your active academic courses, syllabi, and study goals.</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition shadow-lg shadow-cyan-500/25 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Course</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((c) => (
              <div key={c.id} className="glass-panel p-6 rounded-2xl border border-[#0c1a2e] flex flex-col justify-between glass-panel-hover">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20">
                      {c.subject}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{c.semester || 'Fall 2026'}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{c.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-6">{c.description || 'Comprehensive study course.'}</p>

                  <div className="space-y-2 text-xs text-slate-300 border-t border-[#0c1a2e] pt-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Target className="w-3.5 h-3.5 text-cyan-400" /> Target Score:
                      </span>
                      <span className="font-bold text-white">{c.target_score}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" /> Daily Target:
                      </span>
                      <span className="font-bold text-white">{c.daily_study_time_minutes} mins</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> Mastery:
                      </span>
                      <span className="font-bold text-emerald-400">{c.overall_mastery || 50}%</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/documents"
                  className="w-full py-2.5 rounded-xl bg-[#050d1f] hover:bg-slate-800 border border-[#0c1a2e] text-center text-xs font-semibold text-cyan-400 flex items-center justify-center gap-1 transition"
                >
                  <span>Upload Documents & Syllabi</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-panel p-8 rounded-2xl max-w-lg w-full space-y-4 border border-[#0c1a2e]">
                <h3 className="text-xl font-bold text-white">Create New Study Course</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Course Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Operating Systems (CS140)"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#050d1f] border border-[#0c1a2e] text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#050d1f] border border-[#0c1a2e] text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                    <textarea
                      rows={2}
                      placeholder="Course objectives and covered modules..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#050d1f] border border-[#0c1a2e] text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-2.5 rounded-xl bg-[#050d1f] hover:bg-slate-800 text-slate-300 font-semibold text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25"
                    >
                      Create Course
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
