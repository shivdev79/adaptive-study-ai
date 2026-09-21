import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'StudyMind AI — Adaptive AI Study Platform',
  description: 'Production-quality adaptive learning platform with grounded RAG, AI tutoring, adaptive quizzes, mastery engine, spaced repetition, and personalized study planner.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#030712] text-slate-100 antialiased selection:bg-cyan-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
