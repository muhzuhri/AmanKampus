'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  FileCheck,
  EyeOff,
  Cpu,
  UserCheck,
  Scale,
  ArrowRight,
  Shield,
  Fingerprint,
  CheckCircle,
  FileSearch,
  MessageSquare,
  Sparkles,
  Zap,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';

export default function TrustAndSecuritySection() {
  const [activeTab, setActiveTab] = useState<'flow' | 'security' | 'antiTamper'>('flow');

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="relative z-10 space-y-16">
      {/* SECTION HEADER */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
        className="text-center space-y-4 max-w-3xl mx-auto"
      >
        <motion.div variants={childVariants} className="inline-flex items-center gap-2 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/80 px-4 py-1.5 rounded-full shadow-xs">
          <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span className="text-xs font-bold text-teal-800 dark:text-teal-300 tracking-wider uppercase">Jaminan Keamanan & Integritas System</span>
        </motion.div>

        <motion.h2 variants={childVariants} className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Mengapa Anda Dapat Merekam Laporan Tanpa Keraguan?
        </motion.h2>

        <motion.p variants={childVariants} className="text-slate-600 dark:text-slate-300 text-base md:text-lg leading-relaxed">
          AmanKampus dibangun di atas fondasi <strong className="text-teal-600 dark:text-teal-400 font-semibold">Zero-Knowledge Architecture</strong> dan Kriptografi SHA-256. Kami menjamin privasi korban 100% terlindungi sekaligus mencegah rekayasa bukti dan tuduhan palsu.
        </motion.p>
      </motion.div>

      {/* PERSUASIVE NARRATIVE BANNER */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-slate-900 to-indigo-950 border border-teal-500/30 rounded-3xl p-8 md:p-12 shadow-2xl text-white"
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 bg-teal-400/10 border border-teal-400/30 rounded-lg px-3 py-1 text-xs font-mono text-teal-300">
              <Lock className="w-3.5 h-3.5" /> Proteksi Ganda: Anonimitas Korban & Akurasi Bukti
            </div>
            <h3 className="text-2xl md:text-4xl font-bold tracking-tight text-white leading-tight">
              Bukan Tempat Persekusi Publik, Tapi Portal Resmi Penanganan Kasus
            </h3>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Banyak korban enggan melapor karena takut identitasnya bocor, dan banyak instansi ragu karena takut aduan dijadikan alat saling menjatuhkan. <strong className="text-teal-300">AmanKampus memecahkan kedua masalah tersebut sekaligus:</strong>
            </p>
            <ul className="space-y-2 text-xs md:text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><strong>Bagi Pelapor:</strong> Identitas (Nama/NIM/IP) tidak dicatat atau disimpan di server mana pun.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                <span><strong>Bagi Verifikasi Kasus:</strong> Setiap file terhitung nilai SHA-256 Hash mutlak & dipindai forensik digital.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                <span><strong>Bagi Proses Hukum/Etik:</strong> Tidak dipublikasikan ke umum. Hanya diulas oleh Satgas PPKS resmi.</span>
              </li>
            </ul>
          </div>

          {/* Side Graphic Card */}
          <div className="lg:col-span-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4 shadow-inner">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold font-mono text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4" /> Proof-of-Authenticity
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                Cryptographic Secured
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-white/5 space-y-1">
                <p className="text-slate-400 text-[10px]">VERIFIKASI INTEGRITAS FILE</p>
                <p className="text-teal-300 font-bold break-all">SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-950/70 p-2.5 rounded-lg border border-white/5">
                  <p className="text-slate-400 text-[10px]">EXIF PRIVACY</p>
                  <p className="text-emerald-400 font-bold">✓ Location Stripped</p>
                </div>
                <div className="bg-slate-950/70 p-2.5 rounded-lg border border-white/5">
                  <p className="text-slate-400 text-[10px]">FORENSIC SCORE</p>
                  <p className="text-teal-300 font-bold">✓ Native Capture</p>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic text-center pt-1">
              "Setiap byte data dilindungi oleh enkripsi otomatis tingkat militer."
            </p>
          </div>
        </div>
      </motion.div>

      {/* INTERACTIVE NAVIGATION TABS */}
      <div className="flex justify-center">
        <div className="bg-slate-200/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-300/80 dark:border-slate-700/80 inline-flex gap-1">
          <button
            onClick={() => setActiveTab('flow')}
            className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'flow'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" /> Alur Penggunaan Platform
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'security'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" /> Detail Keamanan Privasi
          </button>
          <button
            onClick={() => setActiveTab('antiTamper')}
            className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'antiTamper'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileSearch className="w-4 h-4" /> Validasi Anti-Fitnah & Bukti
          </button>
        </div>
      </div>

      {/* TAB CONTENT CARDS */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

        {/* TAB 1: ALUR PENGGUNAAN */}
        {activeTab === 'flow' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StepCard
              num="01"
              title="Akses & Relaksasi"
              desc="Masuk tanpa perlu login/daftar. Tersedia modul relaksasi penenang cemas sebelum pelaporan."
              icon={<EyeOff className="w-6 h-6 text-teal-600 dark:text-teal-400" />}
            />
            <StepCard
              num="02"
              title="Pengisian & Enkripsi"
              desc="Isi kronologi. Foto/berkas dibersihkan dari EXIF lokasi & dihitung SHA-256 Hash di browser."
              icon={<Cpu className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
            />
            <StepCard
              num="03"
              title="Terima Token Unik"
              desc="Sistem menerbitkan Token Anonim (misal: AK-2026-X9K2P). Simpan token sebagai kunci tunggal."
              icon={<Fingerprint className="w-6 h-6 text-amber-600 dark:text-amber-400" />}
            />
            <StepCard
              num="04"
              title="Pelacakan & Chat"
              desc="Gunakan token di menu /track untuk melihat progres Satgas & melakukan pesan klarifikasi."
              icon={<MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
            />
          </div>
        )}

        {/* TAB 2: DETAIL KEAMANAN */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              title="Zero-Knowledge Architecture"
              desc="Server tidak mencatat alamat IP, identitas akun, NIK, atau cookie pelacak. Identitas Anda benar-benar anonim."
              icon={<EyeOff className="w-6 h-6 text-teal-600 dark:text-teal-400" />}
            />
            <FeatureCard
              title="Client-Side AES-256 Encryption"
              desc="Informasi sensitif disandikan di dalam browser Anda sebelum dikirimkan ke jaringan internet."
              icon={<Lock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
            />
            <FeatureCard
              title="Anti-Spam & Bot Rate-Limiting"
              desc="Dilengkapi tantangan kalkulasi manusia & pembatasan frekuensi untuk mencegah serangan bot otomatis."
              icon={<Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />}
            />
          </div>
        )}

        {/* TAB 3: VALIDASI ANTI-FITNAH */}
        {activeTab === 'antiTamper' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              title="SHA-256 Immutability Checksum"
              desc="Mencetak sidik jari kriptografi unik file bukti. Perubahan 1 piksel pun akan merusak hash dan terdeteksi."
              icon={<FileCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
            />
            <FeatureCard
              title="Pembersihan Metadata EXIF"
              desc="Menghapus tag lokasi GPS & tipe kamera dari foto bukti agar pelapor tidak dapat dilacak oleh pihak lain."
              icon={<UserCheck className="w-6 h-6 text-teal-600 dark:text-teal-400" />}
            />
            <FeatureCard
              title="Triangulasi Verifikasi Satgas"
              desc="Kasus tidak diproses dari 1 aduan saja. Satgas memverifikasi keaslian file & klaim saksi sebelum tindakan."
              icon={<Scale className="w-6 h-6 text-rose-600 dark:text-rose-400" />}
            />
          </div>
        )}

      </motion.div>

      {/* CTA FOOTER */}
      {/* <div className="pt-6 flex justify-center">
        <Link
          href="/report"
          className="group relative inline-flex items-center gap-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-xl shadow-teal-600/30 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <Shield className="w-5 h-5 text-teal-200" />
          <span>Mulai Buat Laporan Anonim Terenkripsi</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div> */}
    </section>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepCard({ num, title, desc, icon }: { num: string; title: string; desc: string; icon: React.ReactNode; }) {
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-sm hover:border-teal-500/50 transition-all">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50">
          {icon}
        </div>
        <span className="font-mono text-2xl font-black text-slate-300 dark:text-slate-700">{num}</span>
      </div>
      <div className="space-y-1.5">
        <h4 className="font-bold text-slate-900 dark:text-white text-base">{title}</h4>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function FeatureCard({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode; }) {
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-7 space-y-4 shadow-sm hover:border-teal-500/50 transition-all">
      <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950 rounded-xl flex items-center justify-center border border-teal-200 dark:border-teal-800">
        {icon}
      </div>
      <div className="space-y-2">
        <h4 className="font-bold text-slate-900 dark:text-white text-lg">{title}</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
