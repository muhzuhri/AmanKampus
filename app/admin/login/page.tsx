'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff, ShieldAlert, LogIn, ArrowLeft, ShieldCheck, Sparkles, KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const DEMO_USER = 'admin';
const DEMO_PASS = 'satgas2026';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
      router.replace('/admin');
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  const loginAndRedirect = () => {
    sessionStorage.setItem('isAdminLoggedIn', 'true');
    router.push('/admin');
  };

  const handleFillDemo = () => {
    setUsername(DEMO_USER);
    setPassword(DEMO_PASS);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (username === DEMO_USER && password === DEMO_PASS) {
        loginAndRedirect();
      } else {
        setError('Username atau password salah. Gunakan kredensial demo Satgas.');
        setIsLoading(false);
      }
    }, 1000);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#060913] flex flex-col items-center justify-center gap-4 text-slate-400">
        <div className="w-9 h-9 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold tracking-wide text-slate-400">Memeriksa Hak Akses Admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col justify-between px-4 py-8 relative overflow-hidden selection:bg-teal-500/30">
      
      {/* Background Ambient Glows & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-gradient-to-br from-teal-500/15 via-indigo-600/15 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-teal-600/10 blur-[130px] pointer-events-none" />

      {/* Top Bar Navigation */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 rounded-xl px-4 py-2.5 transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-teal-400" />
          <span>Kembali ke Beranda Utama</span>
        </Link>

        <div className="hidden sm:flex items-center gap-2 bg-teal-950/40 border border-teal-800/50 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-teal-300">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>Satgas PPKS Dedicated Portal</span>
        </div>
      </div>

      {/* Main Login Card Container */}
      <div className="my-auto py-12 flex justify-center items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Header Badge & Title */}
          <div className="text-center mb-8 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-600 via-teal-500 to-indigo-500 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(13,148,136,0.35)] ring-4 ring-teal-500/10">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Portal Internal Satgas
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
                Autentikasi Aman Verifikasi Kasus PPKS AmanKampus
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800/80 p-6 sm:p-8 shadow-2xl space-y-6">
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Input */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Username / Email Internal
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Kata Sandi (Password)
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-11 pr-12 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                    title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-rose-400 text-xs font-semibold bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 flex items-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_25px_rgba(13,148,136,0.35)] hover:shadow-[0_0_35px_rgba(13,148,136,0.5)] flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Memverifikasi Hak Akses...
                  </span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Masuk ke Dasbor Satgas
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Fill Card */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 text-center space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-teal-400" /> Akses Mode Demo:
                </span>
                <span className="text-[11px] font-mono text-teal-400 font-bold bg-teal-950/60 border border-teal-800/60 px-2 py-0.5 rounded-md">
                  Satgas 2026
                </span>
              </div>

              <div className="text-xs text-slate-400 text-left bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 font-mono space-y-1">
                <p>Username: <strong className="text-slate-200">admin</strong></p>
                <p>Password: <strong className="text-slate-200">satgas2026</strong></p>
              </div>

              <button
                type="button"
                onClick={handleFillDemo}
                className="w-full bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 font-semibold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                Isi Otomatis Kredensial Demo
              </button>
            </div>

          </div>
        </motion.div>
      </div>

      {/* Bottom Footer Note */}
      <div className="relative z-10 text-center py-2 text-xs text-slate-500 font-medium">
        <p>AmanKampus &mdash; Platform Keamanan & Forensik Digital Satgas PPKS</p>
      </div>

    </div>
  );
}
