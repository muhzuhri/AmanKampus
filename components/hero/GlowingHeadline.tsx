'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Lock, Sparkles, ShieldCheck, Cpu } from 'lucide-react';

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const FADE_UP_TRANSITION = { duration: 0.7, ease: [0.215, 0.61, 0.355, 1] as const };

export default function GlowingHeadline() {
  return (
    <div className="space-y-8 relative z-10 text-left">
      {/* AI Security Glass Badge */}
      <motion.div
        variants={FADE_UP}
        transition={FADE_UP_TRANSITION}
        className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-teal-500/30 dark:border-teal-400/40 bg-teal-50/80 dark:bg-teal-950/40 backdrop-blur-md text-teal-800 dark:text-teal-300 text-xs md:text-sm font-semibold tracking-wide shadow-sm dark:shadow-[0_0_20px_rgba(13,148,136,0.25)] transition-colors"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <Cpu className="w-4 h-4 text-teal-600 dark:text-emerald-400" />
        <span>Platform Pelaporan AI Terenkripsi Zero-Knowledge</span>
      </motion.div>

      {/* Main Headline with Glowing Gradient */}
      <motion.div variants={FADE_UP} transition={FADE_UP_TRANSITION} className="space-y-2">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-slate-900 dark:text-white">
          Ruang Aman &{' '}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 dark:from-teal-400 dark:via-emerald-300 dark:to-cyan-400 bg-clip-text text-transparent drop-shadow-sm dark:drop-shadow-[0_0_35px_rgba(16,185,129,0.4)]">
              Bebas Retaliasi
            </span>
            {/* Glow Aura for dark mode */}
            <span className="absolute -inset-1 bg-teal-500/0 dark:bg-teal-500/20 blur-xl rounded-lg -z-10" />
          </span>
          <br />
          <span className="text-slate-800 dark:text-slate-200">Untuk Mahasiswa.</span>
        </h1>
      </motion.div>

      {/* Clean & Legible Subtitle */}
      <motion.p
        variants={FADE_UP}
        transition={FADE_UP_TRANSITION}
        className="text-base sm:text-lg text-slate-600 dark:text-slate-300/90 leading-relaxed max-w-xl font-medium dark:font-normal"
      >
        Sistem pelaporan independen yang menjamin kerahasiaan mutlak bagi pelapor kekerasan, perundungan siber, dan intimidasi. Identitas Anda terenkripsi secara otomatis tanpa pernah tersimpan di server.
      </motion.p>

      {/* Security Micro Badges */}
      <motion.div
        variants={FADE_UP}
        transition={FADE_UP_TRANSITION}
        className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold dark:font-medium pt-1"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-teal-400" />
          <span>Tanpa Login / NIK / NIM</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-teal-600 dark:text-emerald-400" />
          <span>Enkripsi Sisi Klien (AES-256)</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
          <span>PPKS Compliant</span>
        </div>
      </motion.div>
    </div>
  );
}
