'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { ChevronRight, ShieldAlert, KeyRound } from 'lucide-react';
import Link from 'next/link';

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0 },
};

const FADE_UP_TRANSITION = { duration: 0.7, ease: [0.215, 0.61, 0.355, 1] as const };

export default function GlassmorphismCTA() {
  return (
    <motion.div
      variants={FADE_UP}
      transition={FADE_UP_TRANSITION}
      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2 relative z-10"
    >
      {/* Primary Glowing Glassmorphism CTA Button */}
      <motion.div
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="relative group rounded-2xl"
      >
        {/* Animated Glow Border Backdrop */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 rounded-2xl blur-md opacity-50 dark:opacity-80 group-hover:opacity-100 transition duration-500 group-hover:duration-200 animate-pulse" />

        <Link
          href="/report"
          className="relative flex items-center justify-center gap-3 bg-teal-600 hover:bg-teal-700 dark:bg-teal-600/90 dark:hover:bg-teal-500 text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 backdrop-blur-xl border border-teal-400/40 shadow-lg shadow-teal-600/20 dark:shadow-[0_10px_30px_rgba(13,148,136,0.4)] text-base"
        >
          <ShieldAlert className="w-5 h-5 text-teal-100 group-hover:rotate-12 transition-transform duration-300" />
          <span>Mulai Pelaporan Aman</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
        </Link>
      </motion.div>

      {/* Secondary Glassmorphism CTA Button */}
      <motion.div
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="relative rounded-2xl"
      >
        <Link
          href="/track"
          className="relative flex items-center justify-center gap-2.5 bg-white/80 hover:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-800/80 text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white font-semibold px-7 py-4 rounded-2xl transition-all duration-300 backdrop-blur-xl border border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-500/80 shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] text-base"
        >
          <KeyRound className="w-4 h-4 text-teal-600 dark:text-emerald-400" />
          <span>Cek Status Token</span>
        </Link>
      </motion.div>
    </motion.div>
  );
}
