'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, ArrowRight, Lock, Mail, User, Sparkles, Shield } from 'lucide-react';
import { api, formatErrorMessage } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState('student');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/register', {
        full_name: fullName,
        email,
        password,
        role
      });
      localStorage.setItem('studymind_token', res.data.access_token);
      localStorage.setItem('studymind_user', JSON.stringify(res.data));
      router.push('/dashboard');
    } catch (err: any) {
      setError(formatErrorMessage(err.response?.data?.detail, 'Registration failed. Please check your information.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: '#030712' }}
    >
      {/* ── Ambient Glow & Grid ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 65%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 65%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(34,211,238,0.025) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(34,211,238,0.025) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* ── Floating Badges ── */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {['Free Account', 'Instant RAG Setup', 'Unlimited Quizzes'].map(label => (
            <span key={label}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide"
              style={{
                background: 'rgba(34,211,238,0.06)',
                border: '1px solid rgba(34,211,238,0.14)',
                color: '#22d3ee',
              }}
            >
              ✦ {label}
            </span>
          ))}
        </div>

        {/* ── Glass Card ── */}
        <div
          className="p-8 rounded-2xl"
          style={{
            background: 'rgba(5,13,31,0.90)',
            border: '1px solid rgba(34,211,238,0.12)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(34,211,238,0.05), inset 0 1px 0 rgba(34,211,238,0.06)',
          }}
        >
          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #0891b2 0%, #22d3ee 50%, #7c3aed 100%)',
                boxShadow: '0 0 28px rgba(34,211,238,0.50)',
              }}
            >
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-black text-white tracking-tight">
                StudyMind
                <span
                  className="ml-2 text-xs px-2 py-0.5 rounded font-black"
                  style={{ background: 'rgba(34,211,238,0.12)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.25)' }}
                >
                  AI
                </span>
              </div>
              <p className="text-xs font-medium mt-0.5" style={{ color: '#1e4d63' }}>
                Adaptive Intelligence Study Platform
              </p>
            </div>
          </div>

          <h2 className="text-xl font-black text-white mb-1">Create Account</h2>
          <p className="text-sm mb-6" style={{ color: '#1e4d63' }}>
            Join StudyMind AI to unlock AI-powered learning.
          </p>

          {error && (
            <div
              className="mb-5 p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2"
              style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', color: '#f87171' }}
            >
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: '#22d3ee' }}>
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3" style={{ color: '#1e4d63' }} />
                <input
                  type="text" required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-white text-sm transition-all"
                  style={{
                    background: '#030712',
                    border: '1px solid rgba(34,211,238,0.12)',
                    outline: 'none',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(34,211,238,0.45)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(34,211,238,0.12)')}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: '#22d3ee' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3" style={{ color: '#1e4d63' }} />
                <input
                  type="email" required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="alex@stanford.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-white text-sm transition-all"
                  style={{
                    background: '#030712',
                    border: '1px solid rgba(34,211,238,0.12)',
                    outline: 'none',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(34,211,238,0.45)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(34,211,238,0.12)')}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: '#22d3ee' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3" style={{ color: '#1e4d63' }} />
                <input
                  type="password" required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-white text-sm transition-all"
                  style={{
                    background: '#030712',
                    border: '1px solid rgba(34,211,238,0.12)',
                    outline: 'none',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(34,211,238,0.45)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(34,211,238,0.12)')}
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-bold mb-2" style={{ color: '#22d3ee' }}>
                Account Role
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 absolute left-3.5 top-3" style={{ color: '#1e4d63' }} />
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-white text-sm transition-all appearance-none"
                  style={{
                    background: '#030712',
                    border: '1px solid rgba(34,211,238,0.12)',
                    outline: 'none',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(34,211,238,0.45)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(34,211,238,0.12)')}
                >
                  <option value="student" style={{ background: '#050d1f', color: '#fff' }}>Student</option>
                  <option value="teacher" style={{ background: '#050d1f', color: '#fff' }}>Teacher / Instructor</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 mt-2"
              style={{
                background: loading
                  ? '#0e2b38'
                  : 'linear-gradient(135deg, #0891b2 0%, #22d3ee 50%, #7c3aed 100%)',
                boxShadow: loading ? 'none' : '0 8px 30px rgba(34,211,238,0.35)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Creating Account...
                </span>
              ) : (
                <>
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs" style={{ color: '#1e4d63' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-bold hover:underline" style={{ color: '#22d3ee' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
