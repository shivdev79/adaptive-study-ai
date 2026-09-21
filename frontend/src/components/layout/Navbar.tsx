'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, Flame, BookOpen, Menu } from 'lucide-react';
import { api } from '@/lib/api';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const [userName, setUserName] = useState('Alex Mercer');
  const [streakDays, setStreakDays] = useState(5);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [notifOpen, setNotifOpen] = useState(false);

  const syncActiveCourse = () => {
    api.get('/courses').then(res => {
      if (res.data?.length > 0) {
        setCourses(res.data);
        const saved = localStorage.getItem('studymind_active_course');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const found = res.data.find((c: any) => c.id === parsed.id);
            if (found) { setSelectedCourse(found); return; }
          } catch (e) {}
        }
        const latest = res.data[res.data.length - 1];
        setSelectedCourse(latest);
        localStorage.setItem('studymind_active_course', JSON.stringify(latest));
      }
    }).catch(() => {});
  };

  useEffect(() => {
    api.get('/auth/me').then(res => setUserName(res.data.full_name)).catch(() => {});
    syncActiveCourse();
    window.addEventListener('active_course_changed', syncActiveCourse);
    return () => window.removeEventListener('active_course_changed', syncActiveCourse);
  }, []);

  const handleSelectCourse = (courseId: number) => {
    const found = courses.find(c => c.id === courseId);
    if (found) {
      setSelectedCourse(found);
      localStorage.setItem('studymind_active_course', JSON.stringify(found));
      window.dispatchEvent(new Event('active_course_changed'));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('studymind_token');
    localStorage.removeItem('studymind_active_course');
    router.push('/login');
  };

  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <header
      className="h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20"
      style={{
        background: 'rgba(5,13,31,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(34,211,238,0.07)',
        boxShadow: '0 1px 40px rgba(0,0,0,0.4)',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          onClick={() => window.dispatchEvent(new Event('toggle_mobile_sidebar'))}
          className="md:hidden p-2 rounded-xl text-cyan-400 border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10"
          aria-label="Open Mobile Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* ── Course Selector ── */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 md:px-3.5 md:py-2 rounded-xl text-xs"
          style={{
            background: 'rgba(34,211,238,0.04)',
            border: '1px solid rgba(34,211,238,0.10)',
          }}
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: '#22d3ee' }} />
          <span className="hidden sm:inline font-medium" style={{ color: '#1e4d63' }}>Course:</span>
          {courses.length > 0 ? (
            <select
              value={selectedCourse?.id || ''}
              onChange={e => handleSelectCourse(Number(e.target.value))}
              className="bg-transparent font-bold focus:outline-none cursor-pointer max-w-[120px] sm:max-w-[200px] truncate text-xs"
              style={{ color: '#e2f8ff' }}
            >
              {courses.map(c => (
                <option key={c.id} value={c.id} style={{ background: '#050d1f', color: '#e2f8ff' }}>
                  {c.name} ({c.subject})
                </option>
              ))}
            </select>
          ) : (
            <span className="font-semibold text-[11px] sm:text-xs" style={{ color: '#22d3ee' }}>Upload PPT/PDF</span>
          )}
        </div>
      </div>

      {/* ── Right Controls ── */}
      <div className="flex items-center gap-3">

        {/* Streak */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold"
          style={{
            background: 'linear-gradient(135deg, rgba(234,88,12,0.10), rgba(251,146,60,0.08))',
            border: '1px solid rgba(251,146,60,0.18)',
            color: '#fb923c',
          }}
        >
          <Flame className="w-3.5 h-3.5 text-orange-400 animate-bounce" />
          <span>{streakDays}<span className="hidden sm:inline"> Day Streak</span></span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-xl transition-all relative"
            style={{ background: 'rgba(34,211,238,0.04)', border: '1px solid rgba(34,211,238,0.10)', color: '#38627a' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#22d3ee'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,211,238,0.25)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#38627a'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,211,238,0.10)'; }}
          >
            <Bell className="w-4 h-4" />
            <span
              className="absolute top-1 right-1 w-2 h-2 rounded-full"
              style={{ background: '#22d3ee', boxShadow: '0 0 6px rgba(34,211,238,0.8)' }}
            />
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-7" style={{ background: 'rgba(34,211,238,0.08)' }} />

        {/* User Avatar */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white"
            style={{
              background: 'linear-gradient(135deg, #0891b2, #22d3ee 50%, #7c3aed)',
              boxShadow: '0 0 16px rgba(34,211,238,0.35)',
            }}
          >
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-white leading-none">{userName}</p>
            <p className="text-[10px] leading-tight mt-0.5" style={{ color: '#1e4d63' }}>Student</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-lg transition-all"
            style={{ color: '#1e4d63' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f87171'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#1e4d63'; }}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
