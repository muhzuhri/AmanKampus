import React from 'react';
import { Shield, Activity, FileText, Code, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white pt-16 pb-10 relative z-10 w-full">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16 mb-12">
        <div className="col-span-1 md:col-span-2 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">AmanKampus</span>
          </div>
          <p className="text-slate-500 text-sm max-w-md leading-relaxed">
            Membangun ruang aman digital untuk mahasiswa. Kami berfokus melindungi mereka yang memegang keberanian untuk berbicara melawan ketidakadilan institusional.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-center gap-3">
              <Activity className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Mendukung SDG 3</div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">Kesehatan Mental & Kesejahteraan</div>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center gap-3">
              <FileText className="w-5 h-5 text-slate-600 shrink-0" />
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Mendukung SDG 16</div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">Kelembagaan yang Tangguh</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Navigasi</h4>
          <ul className="space-y-3 text-sm text-slate-600">
            <li><Link href="/" className="hover:text-teal-700 transition-colors font-medium">Beranda Sistem</Link></li>
            <li><Link href="/report" className="hover:text-teal-700 transition-colors font-medium">Buat Laporan</Link></li>
            <li><Link href="/track" className="hover:text-teal-700 transition-colors font-medium">Tracker Anonim</Link></li>
            <li><a href="#" className="hover:text-teal-700 transition-colors font-medium">Transparansi Open Source</a></li>
          </ul>
        </div>

        <div className="space-y-5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Legal & Privasi</h4>
          <ul className="space-y-3 text-sm text-slate-600">
            <li><a href="#" className="hover:text-teal-700 transition-colors font-medium">Kebijakan Privasi</a></li>
            <li><a href="#" className="hover:text-teal-700 transition-colors font-medium">Syarat Layanan</a></li>
            <li><a href="#" className="hover:text-teal-700 transition-colors font-medium">Enkripsi Zero-Knowledge</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-medium">
        <p>© 2026 AmanKampus Initiative. All data remains client-owned.</p>
        <div className="flex items-center gap-4">
          <a href="#" className="flex items-center gap-1.5 hover:text-slate-700 transition-colors">
            <Code className="w-3.5 h-3.5" />
            Source Code
          </a>
          <button className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 transition-colors px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" />
            Tutup Tab Darurat
          </button>
        </div>
      </div>
    </footer>
  );
}
