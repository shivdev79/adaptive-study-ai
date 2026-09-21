'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, FileText, Brain, BrainCircuit,
  Network, AlertTriangle, FileSearch, Calendar, Layers, RotateCcw,
  BarChart3, Calculator, Code, GraduationCap, Settings, Zap,
  Upload, MessageSquare, PenTool
} from 'lucide-react';

const C = {
  primary:     '#22d3ee',
  primaryDim:  'rgba(34,211,238,0.10)',
  primaryBord: 'rgba(34,211,238,0.22)',
  primaryGlow: '0 0 16px rgba(34,211,238,0.15)',
  violet:      '#a78bfa',
  violetDim:   'rgba(167,139,250,0.08)',
  bg:          '#030712',
  panel:       '#050d1f',
  border:      'rgba(34,211,238,0.07)',
  textDim:     '#1e4d63',
  textMid:     '#38627a',
};

const navSections = [
  {
    title: 'MAIN',
    items: [
      { name: 'Dashboard',    href: '/dashboard',         icon: LayoutDashboard },
      { name: 'Courses',      href: '/courses',           icon: BookOpen },
    ]
  },
  {
    title: 'STUDY MATERIAL',
    items: [
      { name: '📄 Upload Study Material',   href: '/documents',          icon: Upload,        badge: 'PPT/PDF' },
      { name: '📖 Document Summary',        href: '/summary',            icon: FileText,      pulse: true },
      { name: '💬 Chat With Syllabus',      href: '/tutor',              icon: MessageSquare, pulse: true },
      { name: '🧠 Explain Like Beginner',   href: '/tutor?mode=beginner',icon: Brain },
    ]
  },
  {
    title: 'QUIZZES & ASSESSMENT',
    items: [
      { name: '📝 Generate MCQs',        href: '/quiz', icon: BrainCircuit },
      { name: '✍️ Short / Long Answers', href: '/quiz', icon: PenTool },
    ]
  },
  {
    title: 'INSIGHTS',
    items: [
      { name: '📊 Analyze PYQs',           href: '/pyq-analysis',  icon: FileSearch },
      { name: '🎯 Weak Topics',            href: '/mistakes',      icon: AlertTriangle },
      { name: '📈 Knowledge Graph',        href: '/knowledge-map', icon: Network },
      { name: '📊 Analytics & Readiness',  href: '/analytics',     icon: BarChart3 },
    ]
  },
  {
    title: 'TIMETABLE & REVISION',
    items: [
      { name: '📅 Study Planner',       href: '/planner',   icon: Calendar },
      { name: '🔄 Spaced Repetition',   href: '/flashcards',icon: Layers },
      { name: '🔄 Revision Center',     href: '/revision',  icon: RotateCcw },
    ]
  },
  {
    title: 'SOLVERS',
    items: [
      { name: '🔢 Numerical Solver',  href: '/tutor/solver', icon: Calculator },
      { name: '💻 Coding Tutor',      href: '/tutor/coding', icon: Code },
      { name: '🎓 Teacher Portal',    href: '/teacher',      icon: GraduationCap },
    ]
  }
] as const;

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const handleToggle = () => setMobileOpen(prev => !prev);
    const handleClose = () => setMobileOpen(false);

    window.addEventListener('toggle_mobile_sidebar', handleToggle);
    window.addEventListener('close_mobile_sidebar', handleClose);
    return () => {
      window.removeEventListener('toggle_mobile_sidebar', handleToggle);
      window.removeEventListener('close_mobile_sidebar', handleClose);
    };
  }, []);

  // Close mobile sidebar on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sidebarContent = (
    <div className="flex flex-col h-full w-64 select-none">
      {/* ── Brand ── */}
      <div className="p-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #0891b2 0%, #22d3ee 50%, #7c3aed 100%)',
              boxShadow: '0 0 20px rgba(34,211,238,0.45)',
            }}
          >
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-[17px] text-white tracking-tight flex items-center gap-1.5">
              StudyMind
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-black tracking-wider"
                style={{ background: 'rgba(34,211,238,0.12)', color: C.primary, border: `1px solid rgba(34,211,238,0.25)` }}
              >
                AI
              </span>
            </h1>
            <p className="text-[10px] font-medium" style={{ color: C.textMid }}>Adaptive Learning Engine</p>
          </div>
        </div>
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* ── Navigation ── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-0.5">
            <p
              className="px-3 text-[9px] font-black tracking-[0.18em] uppercase mb-2"
              style={{ color: C.textDim }}
            >
              {section.title}
            </p>
            {section.items.map((item: any) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname?.startsWith(item.href.split('?')[0]));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all duration-150 group"
                  style={isActive ? {
                    background: C.primaryDim,
                    border: `1px solid ${C.primaryBord}`,
                    color: C.primary,
                    boxShadow: C.primaryGlow,
                  } : {
                    color: '#3b6376',
                    border: '1px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = '#7dd3fc';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(34,211,238,0.05)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = '#3b6376';
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }
                  }}
                >
                  <Icon
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: isActive ? C.primary : '#1e4d63' }}
                  />
                  <span className="truncate">{item.name}</span>
                  {item.badge && (
                    <span
                      className="ml-auto text-[9px] px-1.5 py-0.5 rounded font-black tracking-wide"
                      style={{ background: 'rgba(34,211,238,0.10)', color: C.primary, border: `1px solid rgba(34,211,238,0.18)` }}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.pulse && (
                    <span
                      className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ background: C.primary, boxShadow: `0 0 6px ${C.primary}` }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <div className="p-3" style={{ borderTop: `1px solid ${C.border}` }}>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-semibold transition-all"
          style={{ color: '#1e4d63' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = '#7dd3fc';
            (e.currentTarget as HTMLElement).style.background = 'rgba(34,211,238,0.05)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = '#1e4d63';
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          <Settings className="w-4 h-4" style={{ color: '#1e4d63' }} />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden md:flex w-64 flex-col h-screen sticky top-0 z-30 shrink-0 select-none"
        style={{
          background: `linear-gradient(180deg, #050d1f 0%, #030712 100%)`,
          borderRight: `1px solid ${C.border}`,
        }}
      >
        {sidebarContent}
      </aside>

      {/* ── Mobile Drawer Overlay ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer Panel */}
          <aside
            className="relative w-72 max-w-[80vw] h-full flex flex-col z-10 shadow-2xl transition-transform"
            style={{
              background: `linear-gradient(180deg, #050d1f 0%, #030712 100%)`,
              borderRight: `1px solid ${C.border}`,
            }}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
