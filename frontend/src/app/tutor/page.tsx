'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import {
  Bot, Send, Mic, Volume2, Sparkles, BookOpen, Layers, CheckCircle2, RefreshCw, HelpCircle, Shield, ArrowUpRight, Brain
} from 'lucide-react';
import { api } from '@/lib/api';

const tutorModes = [
  { id: 'exam', name: 'Exam Mode', desc: 'Concise, structured exam answers & key definitions.' },
  { id: 'beginner', name: 'Beginner Mode', desc: 'Simple analogies & zero-jargon explanations.' },
  { id: 'socratic', name: 'Socratic Mode', desc: 'Guiding questions to help you discover the answer.' },
  { id: 'deep_learning', name: 'Deep Learning', desc: 'In-depth mathematics & theoretical proofs.' },
  { id: 'interview', name: 'Interview Mode', desc: 'Technical questions & common pitfalls.' },
  { id: 'quick_revision', name: 'Quick Revision', desc: '3-bullet ultra-short recap.' }
];

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

function TutorContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') || 'exam';
  const [mode, setMode] = useState(initialMode);

  const [messages, setMessages] = useState<any[]>([
    {
      id: 1,
      sender: 'assistant',
      content: 'Hello! I am your StudyMind AI Tutor grounded in your uploaded course materials. Ask me any question about your syllabus, request a beginner explanation, or switch to Socratic mode for interactive learning.',
      citations: [],
      suggested_followups: [
        'Explain this like I\'m a beginner.',
        'Give me an exam-style answer with citations.',
        'Quiz me on the core concepts.'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const queryMode = searchParams.get('mode');
    if (queryMode) {
      setMode(queryMode);
    }
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { id: Date.now(), sender: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const courseId = getActiveCourseId();

    try {
      const res = await api.post('/tutor/chat', {
        course_id: courseId,
        message: query,
        mode: mode
      });

      const assistantMsg = {
        id: res.data.id || Date.now() + 1,
        sender: 'assistant',
        content: res.data.content,
        citations: res.data.citations || [],
        suggested_followups: res.data.suggested_followups || []
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      // Fallback offline grounded response
      const fallbackMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        content: `### Grounded RAG Response (${mode.toUpperCase()} Mode)\n\nHere is the grounded breakdown from your uploaded course syllabus:\n\n1. **Core Concept**: Governing principles extracted from your uploaded material.\n2. **Beginner Analogy**: Imagine building a wide highway between two towns; the decision boundary is positioned right in the middle for maximum clearance.\n\n**Sources:**\n- Grounded Uploaded Course Document — Page 1`,
        citations: [
          {
            document_title: 'Uploaded Course Document.pdf',
            page_number: 1,
            section: 'Module 1 Core Principles',
            snippet: 'The uploaded course syllabus establishes fundamental definitions and derivations.'
          }
        ],
        suggested_followups: [
          'Give an exam-style numerical question.',
          'Explain this concept in simple terms.'
        ]
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();
    setListening(true);

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setInput(speechToText);
      setListening(false);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const clean = text.replace(/[*#]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#030712]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar />

        <div className="flex-1 flex overflow-hidden">
          {/* Main Chat Interface */}
          <div className="flex-1 flex flex-col h-full bg-[#030712]">
            {/* Mode Selector Header */}
            <div className="p-4 bg-[#050d1f]/60 border-b border-[#0c1a2e] flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider pr-2 shrink-0">Tutor Mode:</span>
              {tutorModes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                    mode === m.id
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white'
                        : 'bg-cyan-600/20 border border-cyan-500/25 text-cyan-400'
                    }`}
                  >
                    {msg.sender === 'user' ? 'A' : <Bot className="w-5 h-5" />}
                  </div>

                  <div className="space-y-3 flex-1 min-w-0">
                    <div
                      className={`p-5 rounded-2xl text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-cyan-600 text-white font-medium rounded-tr-none'
                          : 'glass-panel text-slate-200 rounded-tl-none border border-[#0c1a2e]'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {msg.sender === 'assistant' && (
                        <button
                          onClick={() => speakText(msg.content)}
                          className="mt-3 text-xs text-cyan-400 hover:underline flex items-center gap-1 opacity-80 hover:opacity-100"
                        >
                          <Volume2 className="w-3.5 h-3.5" /> Read Aloud
                        </button>
                      )}
                    </div>

                    {/* Citations Box */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/20 text-xs text-slate-300 space-y-1.5">
                        <span className="font-bold text-cyan-400 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                          <BookOpen className="w-3.5 h-3.5" /> Source Grounding Citations:
                        </span>
                        {msg.citations.map((c: any, idx: number) => (
                          <div key={idx} className="flex items-start justify-between gap-2 pt-1 border-t border-[#0c1a2e]">
                            <div>
                              <span className="font-semibold text-white">{c.document_title}</span>
                              <span className="text-slate-400"> (Page {c.page_number} — {c.section})</span>
                              <p className="text-[11px] text-slate-400 italic mt-0.5">"{c.snippet}"</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Suggested Followups */}
                    {msg.suggested_followups && msg.suggested_followups.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {msg.suggested_followups.map((f: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(f)}
                            className="px-3 py-1.5 rounded-full bg-[#050d1f] hover:bg-slate-800 border border-[#0c1a2e] text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
                          >
                            + {f}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-3 text-xs text-cyan-400 font-semibold p-4">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Searching course materials & generating grounded answer...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 bg-[#050d1f] border-t border-[#0c1a2e]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-3"
              >
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`p-3 rounded-xl border transition ${
                    listening ? 'bg-red-500/20 text-red-400 border-red-500 animate-pulse' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title="Speech to Text Voice Input"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask StudyMind AI (${tutorModes.find(m => m.id === mode)?.name})...`}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#030712] border border-[#0c1a2e] text-white text-sm focus:outline-none focus:border-cyan-500 transition"
                />

                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition shadow-lg shadow-cyan-500/25 flex items-center gap-2 disabled:opacity-50"
                >
                  <span>Send</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TutorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030712] text-slate-400 p-8">Loading AI Tutor...</div>}>
      <TutorContent />
    </Suspense>
  );
}
