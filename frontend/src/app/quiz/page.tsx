'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';
import { BrainCircuit, CheckCircle2, XCircle, Clock, AlertTriangle, AlertCircle, Upload, ArrowRight, RefreshCw, Award } from 'lucide-react';
import { api, formatErrorMessage } from '@/lib/api';

function getActiveCourseId(): number {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('studymind_active_course');
    if (saved) {
      try {
        return JSON.parse(saved).id || 1;
      } catch (e) {}
    }
  }
  return 1;
}

function QuizContent() {
  const searchParams = useSearchParams();
  const filterType = searchParams.get('type');
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    generateQuiz();

    const handleCourseChange = () => generateQuiz();
    window.addEventListener('active_course_changed', handleCourseChange);
    return () => window.removeEventListener('active_course_changed', handleCourseChange);
  }, [searchParams]);

  const generateQuiz = () => {
    setLoading(true);
    setResults(null);
    setAnswers({});
    setErrorMsg('');

    const courseId = getActiveCourseId();

    api.post('/quizzes/generate', {
      course_id: courseId,
      quiz_type: filterType === 'mcq' ? 'mcq_only' : filterType === 'descriptive' ? 'descriptive' : 'adaptive',
      total_questions: 4,
      difficulty: 'medium'
    })
      .then(res => setQuiz(res.data))
      .catch((err) => {
        console.error('Quiz generation error:', err);
        setQuiz(null);
        setErrorMsg(formatErrorMessage(err.response?.data?.detail, 'Failed to generate quiz. Please verify your uploaded PDF and Groq API Key settings.'));
      })
      .finally(() => setLoading(false));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setLoading(true);

    const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
      question_id: parseInt(qId),
      student_response: val
    }));

    try {
      const res = await api.post(`/quizzes/${quiz.id}/submit`, {
        quiz_id: quiz.id,
        answers: formattedAnswers,
        time_taken_seconds: 120
      });
      setResults(res.data);
    } catch (err: any) {
      console.error('Submission failed:', err);
      alert('Quiz evaluation failed. Please verify your connection or Groq API Key settings.');
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                {filterType === 'mcq' ? '📝 Generated MCQs' : filterType === 'descriptive' ? '✍️ Short & Long Answer Questions' : 'Adaptive Assessment Engine'}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                {filterType === 'mcq'
                  ? 'Multiple Choice Questions generated directly from your uploaded study materials.'
                  : filterType === 'descriptive'
                  ? 'Short and long answer questions with AI semantic evaluation grounded in your uploaded PDF/PPT.'
                  : 'AI-generated questions tailored to your detected weak concepts & uploaded course materials.'}
              </p>
            </div>
            <button
              onClick={generateQuiz}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-[#050d1f] border border-[#0c1a2e] text-slate-300 font-semibold text-xs hover:bg-slate-800 transition flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Generate Fresh Questions</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <Link
                href="/settings"
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] transition shrink-0"
              >
                Configure Groq Key in Settings
              </Link>
            </div>
          )}

          {/* Results Summary if Submitted */}
          {results && (
            <div className="glass-panel p-8 rounded-2xl border border-cyan-500/25 space-y-6">
              <div className="flex items-center justify-between border-b border-[#0c1a2e] pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-extrabold text-2xl">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Quiz Completed!</h2>
                    <p className="text-xs text-slate-400">Score: {results.score_percentage}% ({results.correct_count}/{results.total_questions} Correct)</p>
                  </div>
                </div>

                <span className="px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-bold border border-emerald-500/20">
                  Mastery Updated +12%
                </span>
              </div>

              {/* Feedback list */}
              <div className="space-y-4">
                {results.answers_feedback.map((f: any, idx: number) => (
                  <div key={idx} className="p-5 rounded-xl bg-[#050d1f] border border-[#0c1a2e] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">Question {idx + 1} Evaluation</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${f.is_correct ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {f.is_correct ? 'Correct' : 'Needs Review'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-medium">{f.feedback}</p>

                    {f.missing_concepts && f.missing_concepts.length > 0 && (
                      <div className="text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                        <strong>Missing Concepts:</strong> {f.missing_concepts.join(', ')}
                      </div>
                    )}

                    <div className="text-xs text-slate-400 pt-2 border-t border-[#0c1a2e]/60">
                      <strong className="text-cyan-400">Model Answer:</strong> {f.model_answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Quiz Form */}
          {quiz && !results && (
            <div className="space-y-6">
              {quiz.questions.map((q: any, idx: number) => (
                <div key={q.id} className="glass-panel p-6 rounded-2xl border border-[#0c1a2e] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Question {idx + 1} ({q.difficulty})</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">{q.question_type}</span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-relaxed">{q.prompt}</h3>

                  {q.question_type === 'mcq' && q.options ? (
                    <div className="space-y-2 pt-2">
                      {q.options.map((opt: string, oIdx: number) => (
                        <label
                          key={oIdx}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm cursor-pointer transition ${
                            answers[q.id] === opt
                              ? 'bg-cyan-600/20 border-indigo-500 text-white'
                              : 'bg-[#050d1f] border-[#0c1a2e] text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q_${q.id}`}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={() => setAnswers({ ...answers, [q.id]: opt })}
                            className="hidden"
                          />
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${answers[q.id] === opt ? 'border-indigo-400 bg-cyan-500' : 'border-slate-600'}`}>
                            {answers[q.id] === opt && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      rows={3}
                      placeholder="Type your explanation here..."
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      className="w-full p-4 rounded-xl bg-[#050d1f] border border-[#0c1a2e] text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  )}
                </div>
              ))}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-base transition shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2"
              >
                {loading ? 'Evaluating Answers...' : 'Submit Quiz for AI Evaluation'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {!quiz && !loading && !results && (
            <div className="glass-panel p-12 rounded-2xl border border-[#0c1a2e] text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Questions Generated for this Subject Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Upload your study material PDF or PPT file in the <strong>Upload Study Material</strong> page. Groq AI will analyze the full textual content and generate questions grounded strictly in your document.
              </p>
              <Link
                href="/documents"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Study Material PDF / PPT</span>
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030712] text-slate-400 p-8">Loading Quiz...</div>}>
      <QuizContent />
    </Suspense>
  );
}
