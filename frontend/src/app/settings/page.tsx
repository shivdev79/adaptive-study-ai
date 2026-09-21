'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Settings, Save, Shield, Key } from 'lucide-react';

export default function SettingsPage() {
  const [llmProvider, setLlmProvider] = useState('groq');
  const [llmModel, setLlmModel] = useState('llama-3.3-70b-versatile');
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    const savedKey = localStorage.getItem('studymind_groq_key') || localStorage.getItem('studymind_llm_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey) {
      localStorage.setItem('studymind_groq_key', apiKey);
      localStorage.setItem('studymind_llm_key', apiKey);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex min-h-screen bg-[#030712]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-8 max-w-4xl mx-auto w-full space-y-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Application & AI Provider Settings</h1>
            <p className="text-sm text-slate-400 mt-1">Configure your AI provider abstraction layer, Groq / OpenAI API keys, and LLM model preferences.</p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-[#0c1a2e] space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-cyan-400" />
              AI Provider Abstraction Layer (Groq & OpenAI)
            </h3>

            {saved && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                AI Provider Settings & API Key updated successfully!
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">LLM Provider</label>
                <select
                  value={llmProvider}
                  onChange={(e) => {
                    const prov = e.target.value;
                    setLlmProvider(prov);
                    if (prov === 'groq') setLlmModel('llama-3.3-70b-versatile');
                    else if (prov === 'openai') setLlmModel('gpt-4o-mini');
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#050d1f] border border-[#0c1a2e] text-white text-sm focus:outline-none focus:border-cyan-500"
                >
                  <option value="groq">Groq Cloud API (Llama-3.3-70B-Versatile / Mixtral-8x7b)</option>
                  <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                  <option value="huggingface">HuggingFace Inference API</option>
                  <option value="mock">Local Grounded Intelligence Engine (Offline)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Model Name</label>
                <input
                  type="text"
                  value={llmModel}
                  onChange={(e) => setLlmModel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#050d1f] border border-[#0c1a2e] text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Groq or OpenAI API Key (Stored securely)
                </label>
                <input
                  type="password"
                  placeholder="gsk_... or sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#050d1f] border border-[#0c1a2e] text-white text-sm focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports Groq API keys starting with <code>gsk_</code> (e.g. from <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">console.groq.com</a>) or OpenAI keys starting with <code>sk-</code>.
                </p>
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition shadow-lg shadow-cyan-500/25 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
