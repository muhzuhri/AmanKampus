'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Lock,
  Scale,
  MessageSquareWarning,
  UserX,
  FileText
} from 'lucide-react';
import Link from 'next/link';

interface ViolationItem {
  id: string;
  number: string;
  category: string;
  shortTag: string;
  legalBasis: string;
  icon: React.ReactNode;
  characteristics: string[];
}

const VIOLATIONS_SUMMARY: ViolationItem[] = [
  {
    id: 'cyberbullying',
    number: '01',
    category: 'Perundungan Siber (Cyberbullying)',
    shortTag: 'Siber & Medsos',
    legalBasis: 'Permendikbud No. 30/2021 & UU ITE',
    icon: <MessageSquareWarning className="w-5 h-5 text-indigo-500" />,
    characteristics: [
      'Pesan intimidasi/ancaman terus-menerus di obrolan digital',
      'Grup khusus untuk mengolok-olok atau mengisolasi korban',
      'Penyebaran hoaks merusak reputasi civitas akademika',
      'Kampanye ujaran kebencian di media sosial'
    ],
  },
  {
    id: 'doxing',
    number: '02',
    category: 'Doxing & Pelanggaran Privasi Digital',
    shortTag: 'Privasi Digital',
    legalBasis: 'UU Perlindungan Data Pribadi No. 27/2022',
    icon: <UserX className="w-5 h-5 text-rose-500" />,
    characteristics: [
      'Penyebaran alamat rumah, nomor HP, atau NIK tanpa izin',
      'Publikasi jadwal kuliah & lokasi real-time untuk teror',
      'Pengunggahan foto/dokumen identitas tanpa persetujuan',
      'Eksploitasi data pribadi untuk intimidasi'
    ],
  },
  {
    id: 'sexual-harassment',
    number: '03',
    category: 'Pelecehan & Kekerasan Seksual',
    shortTag: 'Kekerasan Seksual',
    legalBasis: 'UU TPKS No. 12/2022 & Permendikbud 30/2021',
    icon: <ShieldAlert className="w-5 h-5 text-teal-500" />,
    characteristics: [
      'Siulan/catcalling dan ucapan tidak senonoh di area kampus',
      'Komentar bernada seksual di media sosial / grup WhatsApp',
      'Sentuhan atau kontak fisik tanpa persetujuan (non-consensual)',
      'Ancaman penyebaran materi intim berbasis elektronik (KSBE)'
    ],
  },
  {
    id: 'academic-intimidation',
    number: '04',
    category: 'Intimidasi & Penyalahgunaan Wewenang',
    shortTag: 'Etik & Akademik',
    legalBasis: 'Kode Etik Civitas & Peraturan Senat',
    icon: <Scale className="w-5 h-5 text-amber-500" />,
    characteristics: [
      'Ancaman penahanan nilai / skripsi demi kepentingan pribadi',
      'Pemaksaan tugas di luar kewajiban akademik oleh penguasa wewenang',
      'Penyalahgunaan posisi organisasi untuk menekan mahasiswa',
      'Diskriminasi dan pembalasan atas hak melapor (retaliasi)'
    ],
  },
];

export default function ViolationsCatalogSection() {
  const [expandedId, setExpandedId] = useState<string | null>('cyberbullying');

  return (
    <section className="relative z-10 space-y-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 px-3.5 py-1 rounded-full text-xs font-bold text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Katalog Ringkas Pelanggaran</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Kenali Bentuk & Ciri-Ciri Pelanggaran
          </h2>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Ringkasan kategori kekerasan digital & akademik di lingkungan kampus beserta indikator utama untuk perlindungan bersama.
          </p>
        </div>

        <Link
          href="/education"
          className="inline-flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 transition-colors group cursor-pointer shrink-0"
        >
          <span>Lihat Edukasi Selengkapnya</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* LINE-BASED NON-BOX DESIGN CATALOG */}
      <div className="relative pl-3 md:pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-4">
        {VIOLATIONS_SUMMARY.map((item) => {
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className="relative group transition-all duration-300"
            >
              {/* Timeline Connector Line Dot */}
              <div
                className={`absolute -left-[19px] md:-left-[31px] top-6 w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                  isExpanded
                    ? 'bg-teal-500 border-teal-400 ring-4 ring-teal-500/20 scale-125'
                    : 'bg-slate-300 dark:bg-slate-700 border-slate-100 dark:border-slate-900 group-hover:bg-teal-400'
                }`}
              />

              {/* Linear Row Container (Line style with subtle hover slide) */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className={`py-5 px-5 md:px-7 rounded-2xl transition-all duration-300 cursor-pointer relative overflow-hidden ${
                  isExpanded
                    ? 'bg-slate-100/90 dark:bg-slate-900/90 border-l-4 border-l-teal-500 shadow-md'
                    : 'bg-white/40 dark:bg-slate-950/40 hover:bg-slate-100/60 dark:hover:bg-slate-900/50 border-l-2 border-l-transparent hover:border-l-teal-400/50'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="font-mono text-sm md:text-base font-bold text-slate-400 dark:text-slate-600 shrink-0">
                      [{item.number}]
                    </span>

                    <div className="p-2 rounded-xl bg-slate-200/50 dark:bg-slate-800/60 shrink-0">
                      {item.icon}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white truncate">
                          {item.category}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                          {item.shortTag}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden sm:inline-block text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {item.characteristics.length} Ciri Utama
                    </span>
                    <ChevronRight
                      className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                        isExpanded ? 'rotate-90 text-teal-500' : 'group-hover:translate-x-0.5'
                      }`}
                    />
                  </div>
                </div>

                {/* Characteristics Expansion List */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-slate-800/80 space-y-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                          Ciri-Ciri & Indikator Utama:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {item.characteristics.map((char, cIdx) => (
                            <div
                              key={cIdx}
                              className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                              <span className="leading-relaxed font-medium">{char}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-teal-500" />
                            Landasan Hukum: <strong className="text-slate-700 dark:text-slate-300">{item.legalBasis}</strong>
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
