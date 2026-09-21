'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Upload, FileText, CheckCircle2, Loader2, AlertCircle, Sparkles, Layers, BookOpen, ArrowRight } from 'lucide-react';
import { api, formatErrorMessage } from '@/lib/api';
import Link from 'next/link';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [pipelineState, setPipelineState] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadedCourse, setUploadedCourse] = useState<any>(null);
  const [activeCourseId, setActiveCourseId] = useState<number>(0);

  const fetchDocs = (courseId?: number) => {
    const cId = courseId || activeCourseId;
    if (!cId) return;

    api.get(`/documents/course/${cId}`)
      .then(res => setDocuments(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    const savedCourse = localStorage.getItem('studymind_active_course');
    if (savedCourse) {
      try {
        const parsed = JSON.parse(savedCourse);
        setActiveCourseId(parsed.id);
        fetchDocs(parsed.id);
      } catch (e) {}
    }

    const handleCourseChange = () => {
      const updated = localStorage.getItem('studymind_active_course');
      if (updated) {
        try {
          const parsed = JSON.parse(updated);
          setActiveCourseId(parsed.id);
          fetchDocs(parsed.id);
        } catch (e) {}
      }
    };

    window.addEventListener('active_course_changed', handleCourseChange);
    return () => window.removeEventListener('active_course_changed', handleCourseChange);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg('');
    setUploadedCourse(null);
    setPipelineState('Uploading document file...');

    const formData = new FormData();
    formData.append('course_id', String(activeCourseId || 0));
    formData.append('file', file);

    try {
      setPipelineState('Extracting text & slide contents...');
      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const docData = res.data;
      const newCourseId = docData.course_id;

      if (docData.doc_metadata && docData.doc_metadata.course_name) {
        const newCourse = {
          id: newCourseId,
          name: docData.doc_metadata.course_name,
          subject: docData.doc_metadata.subject || 'Uploaded Subject'
        };
        setUploadedCourse(newCourse);
        localStorage.setItem('studymind_active_course', JSON.stringify(newCourse));
        window.dispatchEvent(new Event('active_course_changed'));
        setActiveCourseId(newCourseId);
      }

      setPipelineState('Processing document chunks, auto-generating MCQs, short/long answer questions & flashcards...');
      fetchDocs(newCourseId);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(formatErrorMessage(err.response?.data?.detail, 'Failed to upload document. Please try again.'));
    } finally {
      setUploading(false);
      setPipelineState('');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#030712]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Upload Study Material & PPT</h1>
            <p className="text-sm text-slate-400 mt-1">Upload your syllabus, lecture slides (PPTX), textbooks, or PDFs. The entire application layout, MCQs, and tutor context will dynamically adapt to your uploaded subject.</p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Upload Dropzone */}
          <div className="glass-panel p-10 rounded-3xl border-2 border-dashed border-indigo-500/40 text-center relative hover:border-indigo-500/80 transition group shadow-2xl">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.docx,.pptx,.ppt,.txt"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mx-auto mb-4 border border-cyan-500/25 group-hover:scale-110 transition">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Click or Drag & Drop PPT, PDF, DOCX Files Here</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">Supports PowerPoint presentations (.pptx), PDFs, Word documents (.docx), and text files.</p>
            
            <button className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition pointer-events-none">
              Select Study Material File
            </button>
          </div>

          {/* Processing Status Banner */}
          {uploading && (
            <div className="p-6 rounded-2xl bg-cyan-600/10 border border-cyan-500/25 flex items-center gap-4 animate-pulse">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white">Ingesting Study Material</h4>
                <p className="text-xs text-cyan-300 mt-0.5">{pipelineState}</p>
              </div>
            </div>
          )}

          {/* Upload Success & Adaptation Callout */}
          {uploadedCourse && (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">Course Adapted to "{uploadedCourse.name}"!</h4>
                  <p className="text-xs text-emerald-300">
                    Your entire dashboard, RAG Tutor, MCQs, short/long answer questions, and flashcards now dynamically reflect <strong>{uploadedCourse.name}</strong>.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/quiz?type=mcq"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition shadow"
                >
                  📝 Generate MCQs for {uploadedCourse.name}
                </Link>
                <Link
                  href="/quiz?type=descriptive"
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition"
                >
                  ✍️ Generate Short/Long Answer Questions
                </Link>
                <Link
                  href="/tutor"
                  className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-500 transition shadow"
                >
                  💬 Chat With {uploadedCourse.name} Syllabus
                </Link>
              </div>
            </div>
          )}

          {/* Ingested Documents List */}
          <div className="glass-panel p-6 rounded-2xl border border-[#0c1a2e] space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Ingested Course Materials</h3>

            {documents.length > 0 ? (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-4 rounded-xl bg-[#050d1f] border border-[#0c1a2e] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 text-cyan-400 flex items-center justify-center font-bold uppercase text-xs">
                        {doc.file_type}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{doc.title}</h4>
                        <p className="text-xs text-slate-400">{Math.round((doc.file_size_bytes || 1024) / 1024)} KB • {doc.chunk_count || 12} Chunks Indexed</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ready for RAG & Quizzes
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                No documents uploaded for this course yet. Upload a PPT, PDF, or DOCX above to build your study system!
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
