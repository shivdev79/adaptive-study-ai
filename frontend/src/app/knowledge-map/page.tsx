'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Network, Brain, AlertTriangle, ArrowRight, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

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

export default function KnowledgeMapPage() {
  const [graphData, setGraphData] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const fetchGraph = () => {
    const courseId = getActiveCourseId();
    api.get(`/knowledge-graph/${courseId}`)
      .then(res => {
        setGraphData(res.data);
        if (res.data.nodes && res.data.nodes.length > 0) {
          setSelectedNode(res.data.nodes[0]);
        }
      })
      .catch(() => {
        const fallback = {
          nodes: [
            { id: 'topic_1', label: 'Core Principles & Formulations', mastery_score: 85.0, description: 'Foundational concepts extracted from uploaded study materials.', status: 'strong' },
            { id: 'topic_2', label: 'Boundary Conditions & Theorems', mastery_score: 48.0, description: 'Analytical constraints, slack variables, and governing proofs.', status: 'weak' },
            { id: 'topic_3', label: 'Module Evaluation & Practice', mastery_score: 72.0, description: 'Problem-solving methods and systematic derivations.', status: 'medium' }
          ],
          edges: [
            { id: 'e1', source: 'topic_1', target: 'topic_2', relationship: 'prerequisite' }
          ]
        };
        setGraphData(fallback);
        setSelectedNode(fallback.nodes[0]);
      });
  };

  useEffect(() => {
    fetchGraph();
    const handleCourseChange = () => fetchGraph();
    window.addEventListener('active_course_changed', handleCourseChange);
    return () => window.removeEventListener('active_course_changed', handleCourseChange);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#030712]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Interactive Course Knowledge Graph</h1>
            <p className="text-sm text-slate-400 mt-1">Explore module hierarchies, prerequisite relationships, and concept mastery scores for your active course.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Visual Nodes Canvas */}
            <div className="lg:col-span-2 glass-panel p-8 rounded-2xl border border-[#0c1a2e] flex flex-col justify-between min-h-[500px] relative overflow-hidden">
              <div className="flex items-center justify-between mb-6 z-10">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Network className="w-4 h-4 text-cyan-400" />
                  Concept Graph Visualizer
                </span>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> &gt;75% Strong</span>
                  <span className="flex items-center gap-1 text-amber-400"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 60-75% Review</span>
                  <span className="flex items-center gap-1 text-rose-400"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> &lt;60% Weak</span>
                </div>
              </div>

              {/* Node Layout Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-auto z-10">
                {graphData?.nodes.map((node: any) => {
                  const isSelected = selectedNode?.id === node.id;
                  const score = node.mastery_score;
                  let colorClass = 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10';
                  if (score < 60) colorClass = 'border-rose-500/40 text-rose-400 bg-rose-500/10';
                  else if (score < 75) colorClass = 'border-amber-500/40 text-amber-400 bg-amber-500/10';

                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`p-5 rounded-2xl border text-left transition-all duration-200 relative ${colorClass} ${
                        isSelected ? 'ring-2 ring-indigo-500 shadow-xl scale-105 bg-[#050d1f]' : 'hover:scale-102'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider opacity-80">Module Node</span>
                        <span className="text-xs font-extrabold">{score}%</span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-tight mb-1">{node.label}</h4>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-slate-500 text-center mt-6 z-10">Click any node to inspect mastery breakdown & recommendations.</p>
            </div>

            {/* Selected Node Details Side Card */}
            <div className="glass-panel p-6 rounded-2xl border border-[#0c1a2e] space-y-6">
              {selectedNode ? (
                <>
                  <div>
                    <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20">
                      Module Details
                    </span>
                    <h3 className="text-xl font-bold text-white mt-2 mb-1">{selectedNode.label}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{selectedNode.description}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#050d1f] border border-[#0c1a2e] space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Current Mastery:</span>
                      <span className="font-extrabold text-white">{selectedNode.mastery_score}%</span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          selectedNode.mastery_score < 60 ? 'bg-rose-500' : selectedNode.mastery_score < 75 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${selectedNode.mastery_score}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Link
                      href="/tutor"
                      className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25"
                    >
                      <Brain className="w-4 h-4" />
                      <span>Ask AI Tutor About {selectedNode.label}</span>
                    </Link>

                    <Link
                      href="/quiz"
                      className="w-full py-3 rounded-xl bg-[#050d1f] hover:bg-slate-800 border border-[#0c1a2e] text-slate-300 font-semibold text-xs transition flex items-center justify-center gap-2"
                    >
                      <span>Take Diagnostic Quiz</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center text-slate-500 py-12">Select a node from the map to view details.</div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
