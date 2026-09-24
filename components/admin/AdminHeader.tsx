'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  ShieldAlert,
  Sun,
  Moon,
  LogOut,
  RefreshCw,
  BarChart3,
  Inbox,
  MessageSquare,
  FileSpreadsheet,
} from 'lucide-react';
import { type Report } from '@/lib/types';

interface AdminHeaderProps {
  activeTab: 'overview' | 'inbox' | 'chat';
  setActiveTab: (tab: 'overview' | 'inbox' | 'chat') => void;
  reportsCount: number;
  selectedReport: Report | null;
  setSelectedReport: (report: Report | null) => void;
  loadReports: () => void;
  handleLogout: () => void;
  onExportCSV: () => void;
  mounted: boolean;
}

export default function AdminHeader({
  activeTab,
  setActiveTab,
  reportsCount,
  selectedReport,
  setSelectedReport,
  loadReports,
  handleLogout,
  onExportCSV,
  mounted,
}: AdminHeaderProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <header className="sticky top-0 z-40 bg-teal-950/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-800 dark:border-teal-900/50 shadow-md text-white max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Top Row on Mobile: Logo & Title on Left, Action Buttons on Right */}
        <div className="flex items-center justify-between w-full md:w-auto shrink-0 gap-3">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="p-1 rounded-lg hover:bg-stone-800 transition-colors text-stone-300 hover:text-white">
              <ShieldAlert className="w-5 h-5 text-teal-400" />
            </Link>
            <div>
              <h1 className="font-bold tracking-tight text-white text-xs sm:text-base leading-tight">
                Dasbor Satgas PPKS
              </h1>
              <p className="text-[10px] text-teal-400 font-medium hidden sm:block leading-tight">
                Portal Internal Verifikasi Laporan
              </p>
            </div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0 md:hidden">
            <button
              onClick={loadReports}
              className="p-1.5 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              title="Muat ulang laporan"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {mounted && (
              <button
                type="button"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="p-1.5 rounded-lg border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-amber-200" />}
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs bg-stone-800 border border-stone-700 text-stone-200 hover:text-rose-400 hover:border-rose-800 hover:bg-rose-950/50 font-semibold px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Keluar"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Responsive & Horizontal Scrollable on Mobile) */}
        <div className="w-full md:w-auto overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center justify-center sm:justify-start gap-5 p-1 rounded-xl border border-stone-800 w-max min-w-full sm:min-w-0 sm:w-auto mx-auto">
            <button
              type="button"
              onClick={() => { setActiveTab('overview'); setSelectedReport(null); }}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'overview' && !selectedReport
                  ? 'bg-teal-700 text-white shadow-xs font-bold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('inbox'); setSelectedReport(null); }}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'inbox' || selectedReport
                  ? 'bg-teal-700 text-white shadow-xs font-bold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Daftar Kasus</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('chat'); setSelectedReport(null); }}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'chat' && !selectedReport
                  ? 'bg-teal-700 text-white shadow-xs font-bold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
              <span>Pesan Anonim</span>
            </button>
          </div>
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          
          <button
            onClick={loadReports}
            className="p-1.5 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            title="Muat ulang laporan"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="p-1.5 rounded-lg border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-amber-200" />}
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs bg-stone-800 border border-stone-700 text-stone-200 hover:text-rose-400 hover:border-rose-800 hover:bg-rose-950/50 font-medium px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
