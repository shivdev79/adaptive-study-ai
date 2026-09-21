'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { GraduationCap, Users, BookOpen, BarChart3, AlertTriangle, Plus } from 'lucide-react';
import { api } from '@/lib/api';

export default function TeacherPage() {
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    api.get('/teacher/courses')
      .then(res => setCourses(res.data))
      .catch(() => {
        setCourses([
          {
            course_id: 1,
            name: 'Machine Learning (CS229)',
            subject: 'Computer Science',
            enrolled_students: 28,
            quiz_attempts_count: 54,
            average_class_score: 74.2,
            weakest_class_topic: 'Support Vector Machines (SVM)'
          }
        ]);
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-[#030712]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Teacher & Instructor Portal</h1>
            <p className="text-sm text-slate-400 mt-1">Aggregated class analytics, weak concept detection across students, and question bank management.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-[#0c1a2e] space-y-2">
              <span className="text-xs font-semibold text-slate-400">Total Enrolled Students</span>
              <h3 className="text-3xl font-extrabold text-white">28</h3>
              <p className="text-xs text-emerald-400">24 active this week</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-[#0c1a2e] space-y-2">
              <span className="text-xs font-semibold text-slate-400">Class Average Score</span>
              <h3 className="text-3xl font-extrabold text-white">74.2%</h3>
              <p className="text-xs text-cyan-400">Based on 54 quiz attempts</p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-[#0c1a2e] space-y-2">
              <span className="text-xs font-semibold text-slate-400">Class Weak Concept</span>
              <h3 className="text-xl font-bold text-amber-400">SVM Kernel Methods</h3>
              <p className="text-xs text-slate-400">Recommended for next lecture review</p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-[#0c1a2e] space-y-4">
            <h3 className="text-lg font-bold text-white">Managed Class Courses</h3>
            <div className="space-y-3">
              {courses.map((c, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#050d1f] border border-[#0c1a2e] flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{c.name}</h4>
                    <p className="text-xs text-slate-400">{c.enrolled_students} Students • Average Score: {c.average_class_score}%</p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Weak Topic: {c.weakest_class_topic}
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
