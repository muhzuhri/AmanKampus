'use client';

import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Activity, Lock, ShieldCheck, Terminal, CheckCircle2 } from 'lucide-react';

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: { opacity: 1, y: 0 },
};

const FADE_UP_TRANSITION = { duration: 0.8, ease: [0.215, 0.61, 0.355, 1] as const };

const generateCipher = (text: string) => {
  if (!text) return '';
  const buffer = Array.from(text).map((c) => c.charCodeAt(0).toString(16)).join('');
  return `enc_v2_ai_${buffer}_x${text.length}ff99a0`;
};

export default function AntiGravityCard() {
  const [heroInput, setHeroInput] = useState('');

  return (
    <motion.div
      variants={FADE_UP}
      transition={FADE_UP_TRANSITION}
      className="relative z-10 w-full"
    >
      {/* Micro Floating Motion Effect Wrapper */}
      <motion.div
        animate={{
          y: [-5, 5, -5],
          rotate: [-0.3, 0.3, -0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative"
      >
        {/* Glow Backlight */}
        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 via-emerald-500/20 to-indigo-500/20 dark:from-teal-500/30 dark:via-purple-500/20 dark:to-emerald-500/30 rounded-3xl blur-2xl opacity-75" />

        {/* Glassmorphism Card Container */}
        <div className="relative rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-950/70 backdrop-blur-2xl p-6 sm:p-8 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-6 transition-colors duration-300">
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 text-teal-700 dark:text-teal-400">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span>Enkripsi Kriptografis AI Live</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Transformasi Sandi Zero-Knowledge</p>
              </div>
            </div>
            <span className="text-[10px] font-mono tracking-wider uppercase bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40 px-3 py-1 rounded-full font-bold shadow-xs">
              Client-Side
            </span>
          </div>

          {/* Interactive Form Controls */}
          <div className="space-y-4">
            {/* Input Box */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5 tracking-wider uppercase">
                <Terminal className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Simulasi Pesan Rahasia</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={heroInput}
                  onChange={(e) => setHeroInput(e.target.value)}
                  placeholder="Ketik rahasia di sini untuk menguji enkripsi..."
                  className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/70 focus:border-teal-500 dark:focus:border-teal-400 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all font-mono text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Encrypted Output Display */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 flex items-center justify-between tracking-wider uppercase">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-teal-600 dark:text-emerald-400" />
                  <span>Sandi Terenkripsi (Hash AES-256)</span>
                </span>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono">Immutable</span>
              </label>
              <div className="w-full bg-slate-900 dark:bg-[#050911] border border-slate-800 dark:border-teal-900/50 rounded-xl px-4 py-4 text-emerald-400 font-mono text-xs break-all min-h-[64px] shadow-inner flex items-center leading-relaxed relative overflow-hidden">
                {heroInput ? (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative z-10"
                  >
                    {generateCipher(heroInput)}
                  </motion.span>
                ) : (
                  <span className="text-slate-500 dark:text-slate-600 italic font-sans text-xs">
                    Ketik teks di atas untuk melihat proses transformasi enkripsi otomatis...
                  </span>
                )}
                {/* Subtle matrix scanline glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-500/5 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Footer Security Badges */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Kunci Dekripsi: Hanya Di HP/Laptop Anda
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> 100% Anonim
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
