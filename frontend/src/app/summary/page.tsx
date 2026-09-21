'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import { 
  FileText, 
  Sparkles, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  Copy, 
  Check, 
  Loader2, 
  Download,
  Lightbulb,
  Award,
  AlertCircle,
  Upload,
  RefreshCw
} from 'lucide-react';

interface Course {
  id: number;
  name: string;
  subject: string;
}

interface DocumentItem {
  id: number;
  title: string;
  course_id: number;
  file_type: string;
  chunk_count?: number;
}

interface SummarySection {
  section_title: string;
  key_concepts: string[];
  summary_bullets: string[];
  important_formulas_or_definitions?: string[];
}

interface SummaryData {
  document_id: number;
  document_title: string;
  executive_summary: string;
  key_topics: string[];
  sections: SummarySection[];
  exam_takeaways: string[];
}

export default function SummaryPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [selectedDocTitle, setSelectedDocTitle] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    try {
      const coursesRes = await api.get('/courses');
      const loadedCourses: Course[] = coursesRes.data;
      setCourses(loadedCourses);

      if (loadedCourses.length === 0) return;

      // Find first course that has documents with content
      for (const course of loadedCourses) {
        const docsRes = await api.get(`/documents/course/${course.id}`);
        const docs: DocumentItem[] = docsRes.data;
        const docsWithContent = docs.filter(d => (d.chunk_count || 0) > 0);
        
        if (docsWithContent.length > 0) {
          setSelectedCourseId(course.id);
          setDocuments(docs);
          setSelectedDocId(docsWithContent[0].id);
          setSelectedDocTitle(docsWithContent[0].title);
          generateSummary(docsWithContent[0].id);
          return;
        }
      }

      // Fallback: use first course/doc even if no chunks yet
      const firstCourse = loadedCourses[0];
      setSelectedCourseId(firstCourse.id);
      const docsRes = await api.get(`/documents/course/${firstCourse.id}`);
      const docs: DocumentItem[] = docsRes.data;
      setDocuments(docs);
      if (docs.length > 0) {
        setSelectedDocId(docs[0].id);
        setSelectedDocTitle(docs[0].title);
        generateSummary(docs[0].id);
      }
    } catch (err) {
      console.error('Error initializing summary page:', err);
    }
  };

  const fetchDocuments = async (courseId: number) => {
    try {
      const res = await api.get(`/documents/course/${courseId}`);
      const data: DocumentItem[] = res.data;
      setDocuments(data);
      if (data.length > 0) {
        const firstWithChunks = data.find(d => (d.chunk_count || 0) > 0) || data[0];
        setSelectedDocId(firstWithChunks.id);
        setSelectedDocTitle(firstWithChunks.title);
        generateSummary(firstWithChunks.id);
      } else {
        setSelectedDocId(null);
        setSelectedDocTitle('');
        setSummaryData(null);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = Number(e.target.value);
    setSelectedCourseId(cid);
    setSummaryData(null);
    fetchDocuments(cid);
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const did = Number(e.target.value);
    const doc = documents.find(d => d.id === did);
    setSelectedDocId(did);
    setSelectedDocTitle(doc?.title || '');
    generateSummary(did);
  };

  const generateSummary = async (docId: number) => {
    setLoading(true);
    setErrorMsg(null);
    setSummaryData(null);
    try {
      const groqKey = localStorage.getItem('studymind_groq_key') || localStorage.getItem('studymind_llm_key') || '';
      const res = await api.get(`/summary/document/${docId}`, {
        headers: groqKey ? { 'x-groq-api-key': groqKey } : {}
      });
      setSummaryData(res.data);
    } catch (err: any) {
      console.error('Error generating summary:', err);
      const detail = err?.response?.data?.detail;
      setErrorMsg(detail || 'Failed to generate document summary. Please ensure a document is uploaded for this course.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summaryData) return;
    const text = [
      `DOCUMENT SUMMARY: ${summaryData.document_title}`,
      '',
      `EXECUTIVE SUMMARY:`,
      summaryData.executive_summary,
      '',
      `KEY TOPICS:`,
      summaryData.key_topics.join(', '),
      '',
      `SECTIONS:`,
      ...summaryData.sections.map((s, i) => [
        `${i + 1}. ${s.section_title}`,
        ...(s.key_concepts || []).map(c => `   Concept: ${c}`),
        ...(s.summary_bullets || []).map(b => `   • ${b}`),
        ...(s.important_formulas_or_definitions || []).map(f => `   Formula: ${f}`),
      ].join('\n')),
      '',
      `HIGH-PRIORITY EXAM TAKEAWAYS:`,
      ...(summaryData.exam_takeaways || []).map(t => `✔ ${t}`),
    ].join('\n');
      
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    if (!summaryData) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow pop-ups to download the PDF report.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Summary Report — ${summaryData.document_title}</title>
        <meta charset="UTF-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 40px;
            color: #1e293b;
            line-height: 1.7;
            background: #fff;
          }
          .page-header {
            border-bottom: 3px solid #6366f1;
            padding-bottom: 20px;
            margin-bottom: 28px;
          }
          .brand-line {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #6366f1;
            font-weight: 700;
            margin-bottom: 6px;
          }
          .doc-title {
            font-size: 26px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 4px;
          }
          .doc-type-badge {
            display: inline-block;
            background: #e0e7ff;
            color: #3730a3;
            padding: 3px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          .date-line {
            font-size: 12px;
            color: #64748b;
            margin-top: 6px;
          }

          .executive-box {
            background: linear-gradient(135deg, #eef2ff 0%, #f0f4ff 100%);
            border: 1px solid #c7d2fe;
            border-radius: 10px;
            padding: 18px;
            margin-bottom: 28px;
          }
          .executive-box h3 {
            color: #4338ca;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
          }
          .executive-box p {
            color: #1e293b;
            font-size: 14px;
          }

          .topics-row {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 28px;
          }
          .topic-tag {
            background: #ede9fe;
            color: #5b21b6;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }

          .section-heading {
            font-size: 18px;
            font-weight: 700;
            color: #0f172a;
            margin: 24px 0 14px;
            padding-bottom: 6px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .section-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 18px;
            margin-bottom: 18px;
            page-break-inside: avoid;
          }
          .section-num {
            display: inline-flex;
            width: 24px;
            height: 24px;
            background: #6366f1;
            color: white;
            border-radius: 50%;
            font-size: 12px;
            font-weight: 800;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-right: 10px;
          }
          .section-title {
            font-size: 15px;
            font-weight: 700;
            color: #1e293b;
          }
          .section-title-row {
            display: flex;
            align-items: flex-start;
            margin-bottom: 10px;
          }
          .concept-row {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 12px;
            margin-left: 34px;
          }
          .concept-tag {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 3px 10px;
            border-radius: 6px;
            font-size: 11px;
            color: #475569;
          }
          .bullets {
            margin-left: 34px;
            padding-left: 16px;
          }
          .bullets li {
            font-size: 13px;
            color: #334155;
            margin-bottom: 6px;
          }
          .formula-box {
            margin-left: 34px;
            margin-top: 12px;
            background: #faf5ff;
            border-left: 4px solid #a855f7;
            border-radius: 0 8px 8px 0;
            padding: 12px 14px;
          }
          .formula-box h5 {
            color: #7e22ce;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }
          .formula-box li {
            font-size: 12px;
            font-family: 'Courier New', monospace;
            color: #581c87;
            margin-bottom: 4px;
          }

          .takeaways-section {
            background: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-radius: 10px;
            padding: 18px;
            margin-top: 24px;
            page-break-inside: avoid;
          }
          .takeaways-section h3 {
            color: #065f46;
            font-size: 15px;
            font-weight: 700;
            margin-bottom: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .takeaway-item {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 10px;
          }
          .takeaway-checkmark {
            color: #059669;
            font-size: 16px;
            flex-shrink: 0;
            margin-top: 1px;
          }
          .takeaway-item p {
            font-size: 13px;
            color: #065f46;
          }

          .footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
          }

          @media print {
            body { margin: 24px; }
            .section-card, .takeaways-section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="page-header">
          <div class="brand-line">StudyMind AI — AI-Powered Study Summary Report</div>
          <div class="doc-title">${summaryData.document_title}</div>
          <div>
            <span class="doc-type-badge">${
              (summaryData.document_title.endsWith('.ppt') || summaryData.document_title.endsWith('.pptx'))
                ? 'PowerPoint Presentation'
                : 'Study Document'
            }</span>
          </div>
          <div class="date-line">Generated via Groq AI Engine &nbsp;|&nbsp; ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>

        <div class="executive-box">
          <h3>📋 Executive Summary</h3>
          <p>${summaryData.executive_summary}</p>
        </div>

        ${summaryData.key_topics && summaryData.key_topics.length > 0 ? `
          <div>
            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Key Topics Covered</div>
            <div class="topics-row">
              ${summaryData.key_topics.map(t => `<span class="topic-tag">#${t}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        <div class="section-heading">
          📑 Section & Slide Breakdown
          <span style="font-size: 12px; font-weight: 400; color: #64748b;">(${summaryData.sections.length} sections extracted)</span>
        </div>

        ${summaryData.sections.map((sec, i) => `
          <div class="section-card">
            <div class="section-title-row">
              <span class="section-num">${i + 1}</span>
              <span class="section-title">${sec.section_title}</span>
            </div>
            ${(sec.key_concepts || []).length > 0 ? `
              <div class="concept-row">
                ${sec.key_concepts.map(c => `<span class="concept-tag">${c}</span>`).join('')}
              </div>
            ` : ''}
            <ul class="bullets">
              ${(sec.summary_bullets || []).map(b => `<li>${b}</li>`).join('')}
            </ul>
            ${(sec.important_formulas_or_definitions || []).length > 0 ? `
              <div class="formula-box">
                <h5>💡 Key Formulas / Definitions</h5>
                <ul>
                  ${sec.important_formulas_or_definitions!.map(f => `<li>• ${f}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `).join('')}

        ${summaryData.exam_takeaways && summaryData.exam_takeaways.length > 0 ? `
          <div class="takeaways-section">
            <h3>🏆 High-Priority Exam Takeaways</h3>
            ${summaryData.exam_takeaways.map(t => `
              <div class="takeaway-item">
                <span class="takeaway-checkmark">✔</span>
                <p>${t}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="footer">
          This document was auto-generated by StudyMind AI using Groq AI engine. Content is grounded in the uploaded study material.
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="flex h-screen bg-[#030712] text-slate-100 font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header Bar */}
        <header className="px-8 py-5 bg-[#050d1f]/60 border-b border-[#0c1a2e] flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 text-white shadow-lg shadow-cyan-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Section & PPT Summary
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-semibold border border-cyan-500/25 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Groq AI
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedDocTitle ? `Reading: ${selectedDocTitle}` : 'Select a course and document to generate a summary'}
              </p>
            </div>
          </div>

          {/* Selectors + Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {courses.length > 0 && (
              <div className="flex items-center gap-2 bg-[#050d1f] border border-[#0c1a2e] rounded-xl px-3 py-1.5">
                <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
                <select
                  value={selectedCourseId || ''}
                  onChange={handleCourseChange}
                  className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer max-w-[160px]"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id} className="bg-[#050d1f] text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {documents.length > 0 && (
              <div className="flex items-center gap-2 bg-[#050d1f] border border-[#0c1a2e] rounded-xl px-3 py-1.5">
                <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                <select
                  value={selectedDocId || ''}
                  onChange={handleDocChange}
                  className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer max-w-[180px]"
                >
                  {documents.map(d => (
                    <option key={d.id} value={d.id} className="bg-[#050d1f] text-white">
                      {d.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedDocId && (
              <button
                onClick={() => generateSummary(selectedDocId)}
                disabled={loading}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {loading ? 'Generating...' : 'Generate Summary'}
              </button>
            )}
          </div>
        </header>

        {/* Main Content */}
        <div className="p-8 max-w-5xl mx-auto w-full space-y-8">
          {/* Loading State */}
          {loading && (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-5 bg-[#050d1f]/40 rounded-2xl border border-[#0c1a2e]">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-cyan-600/20 border border-cyan-500/25 flex items-center justify-center animate-pulse">
                  <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
                </div>
                <Sparkles className="w-5 h-5 text-cyan-400 absolute -top-2 -right-2 animate-bounce" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Analyzing Presentation...</h3>
                <p className="text-sm text-slate-400 max-w-sm mt-1">Reading all slides, extracting concepts, formulas and key topics via Groq AI.</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {errorMsg && !loading && (
            <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-300 mb-1">Could Not Generate Summary</h4>
                <p className="text-sm text-red-400/80">{errorMsg}</p>
                {selectedDocId && (
                  <button
                    onClick={() => generateSummary(selectedDocId)}
                    className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all border border-red-500/30"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retry
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !summaryData && !errorMsg && (
            <div className="py-24 text-center bg-[#050d1f]/30 rounded-2xl border border-[#0c1a2e]/80 space-y-4">
              <Layers className="w-14 h-14 text-slate-600 mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-white">No Document Uploaded Yet</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                  Upload a PowerPoint (.ppt / .pptx) or PDF from the Upload section to generate a section-by-section AI summary.
                </p>
              </div>
              <Link
                href="/documents"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 transition-all"
              >
                <Upload className="w-4 h-4" /> Upload Study Material
              </Link>
            </div>
          )}

          {/* Summary Result */}
          {/* Summary Result */}
          {!loading && summaryData && (
            <div className="space-y-8">
              {/* Document Banner + Actions */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-cyan-500/20 shadow-2xl">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/25">
                      {(summaryData.document_title || '').endsWith('.ppt') || (summaryData.document_title || '').endsWith('.pptx')
                        ? '📊 PowerPoint Presentation'
                        : '📄 Study Document'}
                    </span>
                    <h2 className="text-2xl font-extrabold text-white tracking-tight mt-2">{summaryData.document_title || 'Document Summary'}</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {(summaryData.sections || []).length} sections extracted &bull; {(summaryData.key_topics || []).length} key topics
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all"
                    >
                      <Download className="w-4 h-4" /> Download PDF Report
                    </button>
                  </div>
                </div>

                {/* Executive Summary Card */}
                <div className="mt-5 p-5 rounded-xl bg-[#030712]/60 border border-[#0c1a2e]">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4" /> Executive Summary
                  </h4>
                  <p className="text-sm text-slate-200 leading-relaxed">{summaryData.executive_summary || 'No summary generated yet.'}</p>
                </div>

                {/* Key Topics Row */}
                {summaryData.key_topics && summaryData.key_topics.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 shrink-0">Topics covered:</span>
                    {summaryData.key_topics.map((topic, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 font-medium">
                        #{topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Section Breakdown */}
              {(summaryData.sections || []).length > 0 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-cyan-400" /> Section & Slide Breakdown
                    </h3>
                    <span className="text-xs text-slate-500">{(summaryData.sections || []).length} sections</span>
                  </div>

                  {(summaryData.sections || []).map((section, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-[#050d1f]/70 border border-[#0c1a2e] hover:border-slate-700 transition-colors">
                      {/* Section header */}
                      <h4 className="text-sm font-bold text-white flex items-center gap-2.5 mb-3">
                        <span className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 text-xs flex items-center justify-center font-extrabold border border-cyan-500/25 shrink-0">
                          {idx + 1}
                        </span>
                        {section.section_title || `Section ${idx + 1}`}
                      </h4>

                      {/* Key Concepts */}
                      {section.key_concepts && section.key_concepts.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pl-9 mb-3">
                          {section.key_concepts.map((concept, cIdx) => (
                            <span key={cIdx} className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-[#0c1a2e]">
                              {concept}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Bullets */}
                      <ul className="pl-9 space-y-1.5 text-sm text-slate-300 leading-relaxed list-disc list-outside">
                        {(section.summary_bullets || []).map((bullet, bIdx) => (
                          <li key={bIdx}>{bullet}</li>
                        ))}
                      </ul>

                      {/* Formulas/Definitions */}
                      {section.important_formulas_or_definitions && section.important_formulas_or_definitions.length > 0 && (
                        <div className="ml-9 mt-4 p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20">
                          <h5 className="font-bold text-cyan-300 text-xs flex items-center gap-1.5 mb-2">
                            <Lightbulb className="w-3.5 h-3.5 text-cyan-400" /> Key Formulas / Definitions
                          </h5>
                          <ul className="space-y-1">
                            {section.important_formulas_or_definitions.map((item, fIdx) => (
                              <li key={fIdx} className="font-mono text-xs text-cyan-200">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Exam Takeaways */}
              {summaryData.exam_takeaways && summaryData.exam_takeaways.length > 0 && (
                <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5" /> High-Priority Exam Takeaways
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {summaryData.exam_takeaways.map((takeaway, tIdx) => (
                      <div key={tIdx} className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/30 text-sm text-emerald-200 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{takeaway}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
