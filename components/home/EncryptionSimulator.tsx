'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { ShieldCheck, Lock } from 'lucide-react';

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 }
};

const FADE_UP_TRANSITION = { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const };

const generateCipher = (text: string) => {
  if (!text) return '';
  const buffer = Array.from(text).map(c => c.charCodeAt(0).toString(16)).join('');
  return `enc_v1_${buffer}_x${text.length}ab92`;
};

export default function EncryptionSimulator() {
  const [simInput, setSimInput] = useState('');

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={FADE_UP}
      transition={FADE_UP_TRANSITION}
      className="relative max-w-5xl mx-auto"
    >
      <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="w-14 h-14 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Simulator Enkripsi Bukti Data</h2>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed">
            Cobalah mensimulasikan bagaimana teks laporan Anda diubah menjadi data kriptografi rahasia yang tidak dapat dipecahkan tanpa kunci khusus.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-stretch bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-100">
          <div className="space-y-3 flex flex-col">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Input Pesan Simulasi</label>
            <textarea
              rows={5}
              value={simInput}
              onChange={(e) => setSimInput(e.target.value)}
              placeholder="Ketik contoh isi laporan di sini..."
              className="w-full flex-1 bg-white border border-slate-200 rounded-xl p-4 text-slate-800 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all resize-none text-sm placeholder:text-slate-400 font-sans"
            />
          </div>
          <div className="space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Hasil Enkripsi (AES-256 Mock)</label>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Secure
              </span>
            </div>
            <div className="flex-1 bg-slate-900 rounded-xl p-4 border border-slate-800 font-mono text-xs text-emerald-400 break-all overflow-y-auto min-h-[120px] flex items-center leading-relaxed">
              {simInput ? (
                <motion.div
                  key={simInput}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="whitespace-pre-wrap"
                >
                  {generateCipher(simInput).repeat(2) + "7f8b9a2c"}
                </motion.div>
              ) : (
                <span className="text-slate-600 italic font-sans">Hasil enkripsi matematika akan tampil di sini saat Anda mengetik...</span>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {simInput && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col sm:flex-row items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl p-5 gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-3 rounded-xl border border-emerald-200">
                  <Lock className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <span className="block text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-0.5">Token Pelacakan Terbuat</span>
                  <span className="font-mono text-emerald-700 font-bold tracking-widest text-lg">AK-{(simInput.length * 937) % 9000 + 1000}-SEC</span>
                </div>
              </div>
              <span className="text-xs text-emerald-600 font-medium text-center sm:text-right max-w-[220px]">
                Simpan token ini untuk memantau progres tanpa identitas.
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
