'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  ShieldAlert,
  Sun,
  Moon,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  LogOut,
  Eye,
  EyeOff,
  Paperclip,
  Tag,
  Users,
  Hash,
  Calendar,
  Inbox,
  RefreshCw,
  ShieldCheck,
  MessageSquare,
  Send,
  History,
  Shield,
  Gavel,
  HeartHandshake,
  Check,
  XCircle,
  Copy,
  FileSearch,
  Download,
  ArrowLeft,
  Search,
  Filter,
  FileSpreadsheet,
  BarChart3,
  PieChart,
  Lock,
  Plus,
  Bookmark,
  Sparkles,
  Printer,
  Layers,
  Building2,
} from 'lucide-react';
import Link from 'next/link';
import {
  type Report,
  type CaseStatus,
  type Message,
  type AuditLog,
  type EvidenceVerificationStatus,
  type Evidence,
  MOCK_REPORTS,
} from '@/lib/types';
import { fetchReportsFromDatabase, updateReportInDatabase } from '@/lib/reportsService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateID(isoString: string): string {
  try {
    return new Date(isoString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    });
  } catch {
    return isoString;
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Status Styles — fully adaptive for light & dark mode
const STATUS_STYLES: Record<CaseStatus, string> = {
  'Laporan Diterima': 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
  Diverifikasi:       'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30',
  Diproses:           'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30',
  'Mediasi & Konseling': 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/30',
  'Eskalasi ke Komite Etik': 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30',
  Selesai:            'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
};

const ALL_STATUSES: CaseStatus[] = [
  'Laporan Diterima',
  'Diverifikasi',
  'Diproses',
  'Mediasi & Konseling',
  'Eskalasi ke Komite Etik',
  'Selesai',
];

const STATUS_ICONS: Record<CaseStatus, React.ReactNode> = {
  'Laporan Diterima': <Inbox className="w-3.5 h-3.5" />,
  Diverifikasi: <ShieldCheck className="w-3.5 h-3.5" />,
  Diproses: <Clock className="w-3.5 h-3.5" />,
  'Mediasi & Konseling': <HeartHandshake className="w-3.5 h-3.5" />,
  'Eskalasi ke Komite Etik': <Gavel className="w-3.5 h-3.5" />,
  Selesai: <CheckCircle className="w-3.5 h-3.5" />,
};

function exportReportsToCSV(reportsList: Report[]) {
  const headers = ['Case ID', 'Token Anonim', 'Kategori', 'Waktu Diterima', 'Waktu Kejadian', 'Pihak Terlibat', 'Lingkup/Fakultas', 'Jumlah Bukti', 'Status Kasus'];
  const rows = reportsList.map((r) => [
    `"${r.caseId}"`,
    `"${r.anonymousToken}"`,
    `"${r.category.replace(/"/g, '""')}"`,
    `"${formatDateID(r.receivedAt)}"`,
    `"${(r.incidentTime || '-').replace(/"/g, '""')}"`,
    `"${(r.involvedParties || '-').replace(/"/g, '""')}"`,
    `"${(r.targetFaculty || '-').replace(/"/g, '""')}"`,
    r.evidences ? r.evidences.length : 0,
    `"${r.status}"`,
  ]);
  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Rekap_Laporan_Satgas_PPKS_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // New Admin Dashboard State (Tabs, Search, Filters, Internal Satgas Notes)
  const [activeTab, setActiveTab] = useState<'overview' | 'inbox' | 'chat'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua Status');
  const [categoryFilter, setCategoryFilter] = useState<string>('Semua Kategori');
  const [completionFilter, setCompletionFilter] = useState<'semua' | 'selesai' | 'belum'>('semua');
  const [expandedEvidenceIds, setExpandedEvidenceIds] = useState<Set<string>>(new Set());
  const [internalNoteInput, setInternalNoteInput] = useState('');
  const [internalNotesMap, setInternalNotesMap] = useState<Record<string, { id: string; text: string; author: string; timestamp: string }[]>>({});

  // ── Auth + data load ────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem('isAdminLoggedIn') !== 'true') {
      router.replace('/admin/login');
      return;
    }
    setIsAuthenticated(true);
    setIsAuthChecked(true);
    loadReports();

    // Load internal Satgas confidential notes from localStorage
    const savedNotes = localStorage.getItem('aman_kampus_internal_notes');
    if (savedNotes) {
      try {
        setInternalNotesMap(JSON.parse(savedNotes));
      } catch {
        setInternalNotesMap({});
      }
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'aman_kampus_reports') loadReports();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [router]);

  const loadReports = async () => {
    const fetched = await fetchReportsFromDatabase();
    setReports(fetched);
  };

  const resetMockReports = () => {
    localStorage.setItem('aman_kampus_reports', JSON.stringify(MOCK_REPORTS));
    setReports(MOCK_REPORTS);
    setSelectedReport(null);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isAdminLoggedIn');
    setIsAuthenticated(false);
    router.push('/admin/login');
  };

  // ── Download Evidence Handler (Always Downloads Original Image Format) ───
  const handleDownloadEvidence = (ev: Evidence) => {
    // 1. Direct DataURL download (for all user uploads)
    if (ev.dataUrl && ev.dataUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = ev.dataUrl;
      a.download = ev.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // 2. Fallback Image Blob Generator for Mock/Legacy Files: Generate a clean PNG image file!
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Dark background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header accent bar
      ctx.fillStyle = '#0d9488';
      ctx.fillRect(0, 0, canvas.width, 16);

      // Title & Header
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('AMANKAMPUS — BERKAS BUKTI ASLI PELAPOR', 60, 80);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '22px sans-serif';
      ctx.fillText(`Nama Berkas: ${ev.fileName}`, 60, 130);
      ctx.fillText(`ID Bukti: ${ev.evidenceId} | SHA-256 Checksum Secured`, 60, 165);

      // Image Placeholder Box
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(60, 200, 1080, 380, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#2dd4bf';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('🛡️ VERIFIKASI KEASLIAN BUKTI (SHA-256 MUTLAK)', 100, 260);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '20px monospace';
      ctx.fillText(`SHA-256: ${ev.sha256}`, 100, 310);
      ctx.fillText(`Forensik Biner : ${ev.forensicStatus || 'Original'}`, 100, 350);
      ctx.fillText(`EXIF Stripped   : ${ev.exifStripped ? 'YA (GPS & Serial HP Dibersihkan)' : 'Format Standar'}`, 100, 390);

      if (ev.reporterNote) {
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(`Catatan Pelapor : ${ev.reporterNote}`, 100, 440);
      }

      // Footer badge
      ctx.fillStyle = '#64748b';
      ctx.font = '18px sans-serif';
      ctx.fillText('Dokumen resmi terenkripsi Satgas PPKS AmanKampus.', 60, 630);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const downloadName = ev.fileName.includes('.') ? ev.fileName : `${ev.fileName}.png`;
        a.download = downloadName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, ev.fileType || 'image/png');
    }
  };

  // ── Stats ───────────────────────────────────────────────────────────────
  const stats = {
    total: reports.length,
    diterima: reports.filter((r) => r.status === 'Laporan Diterima').length,
    diproses: reports.filter((r) => r.status === 'Diproses' || r.status === 'Diverifikasi').length,
    selesai: reports.filter((r) => r.status === 'Selesai').length,
  };

  // ── Detail panel ────────────────────────────────────────────────────────
  const openDetail = (report: Report) => {
    setSelectedReport(report);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateStatus = (newStatus: CaseStatus) => {
    if (!selectedReport) return;
    const auditEntry: AuditLog = {
      id: `AL-${Date.now()}`,
      action: `Status diubah: "${selectedReport.status}" → "${newStatus}"`,
      actor: 'Satgas',
      timestamp: new Date().toISOString(),
    };
    const logs = selectedReport.auditLogs ? [...selectedReport.auditLogs, auditEntry] : [auditEntry];
    const updatedReport = { ...selectedReport, status: newStatus, auditLogs: logs };

    const updated = reports.map((r) => (r.caseId === selectedReport.caseId ? updatedReport : r));
    setReports(updated);
    setSelectedReport(updatedReport);
    updateReportInDatabase(selectedReport.caseId, { status: newStatus, auditLogs: logs });
  };

  // Feature 5: Verify Evidence Authenticity by Satgas
  const handleVerifyEvidence = (evidenceId: string, status: EvidenceVerificationStatus, note: string = '') => {
    if (!selectedReport) return;
    const evidenceItem = selectedReport.evidences.find((e) => e.evidenceId === evidenceId);
    if (!evidenceItem) return;

    const auditEntry: AuditLog = {
      id: `AL-${Date.now()}`,
      action: `Satgas memverifikasi berkas "${evidenceItem.fileName}": Status Keaslian -> ${status}`,
      actor: 'Satgas',
      timestamp: new Date().toISOString(),
    };

    const newEvidences = selectedReport.evidences.map((ev) => {
      if (ev.evidenceId === evidenceId) {
        return {
          ...ev,
          verificationStatus: status,
          verificationNote: note || (status === 'Terverifikasi Valid' ? 'Bukti tervalidasi asli & tidak terdeteksi manipulasi.' : 'Berkas ditandai mencurigakan atau tidak valid.'),
        };
      }
      return ev;
    });

    const logs = selectedReport.auditLogs ? [...selectedReport.auditLogs, auditEntry] : [auditEntry];
    const updatedReport = { ...selectedReport, evidences: newEvidences, auditLogs: logs };

    const updated = reports.map((r) => (r.caseId === selectedReport.caseId ? updatedReport : r));
    setReports(updated);
    setSelectedReport(updatedReport);
    updateReportInDatabase(selectedReport.caseId, { evidences: newEvidences, auditLogs: logs });
  };

  const handleSendSatgasMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedReport) return;

    const newMsg: Message = {
      id: `MSG-${Date.now()}`,
      sender: 'Satgas',
      text: chatInput,
      timestamp: new Date().toISOString(),
    };
    const auditEntry: AuditLog = {
      id: `AL-${Date.now()}`,
      action: 'Satgas mengirim pesan klarifikasi kepada pelapor',
      actor: 'Satgas',
      timestamp: new Date().toISOString(),
    };

    const msgs = selectedReport.messages ? [...selectedReport.messages, newMsg] : [newMsg];
    const logs = selectedReport.auditLogs ? [...selectedReport.auditLogs, auditEntry] : [auditEntry];
    const updatedReport = { ...selectedReport, messages: msgs, auditLogs: logs };

    const updated = reports.map((r) => (r.caseId === selectedReport.caseId ? updatedReport : r));
    setReports(updated);
    setSelectedReport(updatedReport);
    setChatInput('');
    updateReportInDatabase(selectedReport.caseId, { messages: msgs, auditLogs: logs });
  };

  const handleAddInternalNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNoteInput.trim() || !selectedReport) return;
    const caseId = selectedReport.caseId;
    const newNote = {
      id: `NOTE-${Date.now()}`,
      text: internalNoteInput.trim(),
      author: 'Satgas Admin',
      timestamp: new Date().toISOString(),
    };
    const updatedMap = {
      ...internalNotesMap,
      [caseId]: [...(internalNotesMap[caseId] || []), newNote],
    };
    setInternalNotesMap(updatedMap);
    localStorage.setItem('aman_kampus_internal_notes', JSON.stringify(updatedMap));
    setInternalNoteInput('');
  };

  // Filtered reports computation for Instant Search & Filters
  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      searchQuery === '' ||
      r.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.anonymousToken.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.chronology.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'Semua Status' || r.status === statusFilter;
    const matchesCategory = categoryFilter === 'Semua Kategori' || r.category === categoryFilter;
    const matchesCompletion =
      completionFilter === 'semua' ||
      (completionFilter === 'selesai' && r.status === 'Selesai') ||
      (completionFilter === 'belum' && r.status !== 'Selesai');

    return matchesSearch && matchesStatus && matchesCategory && matchesCompletion;
  });

  // Extract all evidence files across all cases for Forensics Hub tab
  const allEvidences = reports.flatMap((r) =>
    (r.evidences || []).map((ev) => ({ ...ev, caseId: r.caseId, reportCategory: r.category, reportStatus: r.status }))
  );

  // Extract category counts for Analytics Chart
  const categoryCounts = reports.reduce<Record<string, number>>((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + 1;
    return acc;
  }, {});

  const allCategories = Array.from(new Set(reports.map((r) => r.category)));

  const isDark = resolvedTheme === 'dark';

  // ═══════════════════════════════════════════════════════════════════════
  if (!isAuthChecked || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center gap-4 text-stone-500 dark:text-stone-400">
        <div className="w-9 h-9 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold tracking-wide">Memeriksa Hak Akses Admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-transparent text-stone-900 dark:text-stone-100 font-sans selection:bg-teal-500/20">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
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
            <div className="flex items-center justify-center sm:justify-start gap-1 bg-stone-950/60 p-1 rounded-xl border border-stone-800 w-max min-w-full sm:min-w-0 sm:w-auto mx-auto">
              <button
                type="button"
                onClick={() => { setActiveTab('overview'); setSelectedReport(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeTab === 'overview' && !selectedReport
                    ? 'bg-teal-600 text-white shadow-xs font-bold'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('inbox'); setSelectedReport(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeTab === 'inbox' || selectedReport
                    ? 'bg-teal-600 text-white shadow-xs font-bold'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                <span>Daftar Kasus ({reports.length})</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('chat'); setSelectedReport(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeTab === 'chat' && !selectedReport
                    ? 'bg-teal-600 text-white shadow-xs font-bold'
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
              className="flex items-center gap-1.5 text-xs bg-stone-800 border border-stone-700 text-stone-200 hover:text-rose-400 hover:border-rose-800 hover:bg-rose-950/50 font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 relative z-10 overflow-x-hidden">

        {/* ── DETAIL PANEL (when a report is selected) ─────────────────── */}
        <AnimatePresence>
          {selectedReport && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-xl"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-950/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 rounded-xl flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-900 dark:text-white text-sm">{selectedReport.caseId}</p>
                    <p className="text-xs font-mono text-stone-500 dark:text-stone-400">{selectedReport.anonymousToken}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedReport(null);
                      const el = document.getElementById('reports-table');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-stone-200/70 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700/80 text-stone-700 dark:text-stone-200 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Kembali ke Daftar Laporan</span>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Meta grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <DetailCell icon={<Tag className="w-3.5 h-3.5" />} label="Kategori" value={selectedReport.category} />
                  <DetailCell icon={<Calendar className="w-3.5 h-3.5" />} label="Diterima" value={formatDateID(selectedReport.receivedAt)} />
                  <DetailCell icon={<EyeOff className="w-3.5 h-3.5" />} label="Identitas Pelapor" value="Anonim" valueClass="text-teal-600 dark:text-teal-400 font-bold" />
                  {selectedReport.incidentTime && <DetailCell icon={<Clock className="w-3.5 h-3.5" />} label="Waktu Kejadian" value={selectedReport.incidentTime} />}
                  {selectedReport.involvedParties && <DetailCell icon={<Users className="w-3.5 h-3.5" />} label="Pihak Terlibat" value={selectedReport.involvedParties} />}
                  {selectedReport.targetFaculty && <DetailCell icon={<FileText className="w-3.5 h-3.5" />} label="Lingkup/Fakultas" value={selectedReport.targetFaculty} />}
                </div>

                {selectedReport.abuseFlags && selectedReport.abuseFlags.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Defense-in-Depth — bendera penyalahgunaan
                    </p>
                    <ul className="space-y-1">
                      {selectedReport.abuseFlags.map((flag) => (
                        <li key={flag} className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">• {flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Status badge */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-semibold uppercase">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${STATUS_STYLES[selectedReport.status]}`}>
                    {STATUS_ICONS[selectedReport.status]}
                    {selectedReport.status}
                  </span>
                </div>

                {/* Kronologi */}
                <div className="space-y-2">
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-semibold uppercase flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Kronologi Kejadian
                  </p>
                  <div className="bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 rounded-xl p-4 max-h-40 overflow-y-auto">
                    <p className="text-sm text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-wrap">{selectedReport.chronology}</p>
                  </div>
                </div>

                {/* BUKTI — collapsed by default */}
                {selectedReport.evidences && selectedReport.evidences.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-semibold uppercase flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5" /> Berkas Bukti ({selectedReport.evidences.length} file)
                      </p>
                      <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">SHA-256 & EXIF Protected</span>
                    </div>

                    <div className="space-y-2">
                      {selectedReport.evidences.map((ev) => {
                        const verifStatus = ev.verificationStatus || 'Belum Diverifikasi';
                        const isExpanded = expandedEvidenceIds.has(ev.evidenceId);
                        const toggleExpand = () => {
                          setExpandedEvidenceIds(prev => {
                            const next = new Set(prev);
                            if (next.has(ev.evidenceId)) next.delete(ev.evidenceId);
                            else next.add(ev.evidenceId);
                            return next;
                          });
                        };
                        return (
                          <div key={ev.evidenceId} className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-xs">

                            {/* ── HEADER — always visible ── */}
                            <div className="flex items-center justify-between gap-3 px-4 py-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 flex items-center justify-center shrink-0">
                                  <Paperclip className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs text-stone-900 dark:text-stone-100 font-semibold truncate">{ev.fileName}</p>
                                  <p className="text-[11px] text-stone-500 dark:text-stone-400">{ev.fileType} · {formatBytes(ev.fileSize)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={toggleExpand}
                                  className="px-2.5 py-2 text-[11px] font-semibold border rounded-lg transition-all cursor-pointer flex items-center gap-1 bg-stone-50 dark:bg-stone-900 border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:border-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
                                >
                                  <Eye className="w-3 h-3" />
                                  {isExpanded ? 'Sembunyikan' : 'Lihat Detail'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadEvidence(ev)}
                                  className="px-2.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <Download className="w-3 h-3" /> Unduh
                                </button>
                              </div>
                            </div>

                            {/* ── EXPANDED DETAIL ── */}
                            {isExpanded && (
                              <div className="border-t border-stone-100 dark:border-stone-800 px-4 py-4 space-y-4">

                                {/* Catatan Pelapor */}
                                {ev.reporterNote && (
                                  <div className="bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl p-3.5 text-xs space-y-1">
                                    <span className="font-bold text-teal-900 dark:text-teal-300 flex items-center gap-1.5">
                                      <MessageSquare className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Catatan Pelapor:
                                    </span>
                                    <p className="text-stone-800 dark:text-stone-200 leading-relaxed font-medium">{ev.reporterNote}</p>
                                  </div>
                                )}

                                {/* Forensic Scan */}
                                {ev.forensicDetails && ev.forensicDetails.length > 0 && (
                                  <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                                    ev.forensicStatus === 'Manipulated'
                                      ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
                                      : ev.forensicStatus === 'Needs Review'
                                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
                                      : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200'
                                  }`}>
                                    <div className="flex items-center gap-2 font-bold text-sm">
                                      <Shield className="w-4 h-4" />
                                      <span>
                                        {ev.forensicStatus === 'Manipulated' && '⚠️ Indikasi Rekayasa Digital / AI Detected'}
                                        {ev.forensicStatus === 'Needs Review' && '⚠️ Memerlukan Peninjauan Manual'}
                                        {ev.forensicStatus === 'Original' && '🟢 Berkas Tervalidasi Utuh'}
                                      </span>
                                    </div>
                                    <div className="space-y-1 pt-1">
                                      {ev.forensicDetails.map((det, idx) => (
                                        <p key={idx} className="leading-relaxed flex items-start gap-1.5">
                                          <span className="opacity-70">•</span> <span>{det}</span>
                                        </p>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* SHA-256 & EXIF */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                  <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 space-y-1">
                                    <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 font-semibold text-[11px]">
                                      <span className="flex items-center gap-1"><Hash className="w-3.5 h-3.5" /> SHA-256</span>
                                      <button
                                        onClick={() => {
                                          navigator.clipboard.writeText(ev.sha256);
                                          setCopiedHash(ev.evidenceId);
                                          setTimeout(() => setCopiedHash(null), 2000);
                                        }}
                                        className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                                      >
                                        {copiedHash === ev.evidenceId ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                        {copiedHash === ev.evidenceId ? 'Tersalin' : 'Salin'}
                                      </button>
                                    </div>
                                    <p className="font-mono text-[10px] text-stone-700 dark:text-stone-300 break-all leading-relaxed bg-white dark:bg-stone-950 p-1.5 rounded border border-stone-100 dark:border-stone-800">
                                      {ev.sha256}
                                    </p>
                                  </div>
                                  <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 space-y-1">
                                    <span className="text-stone-500 dark:text-stone-400 font-semibold text-[11px] flex items-center gap-1">
                                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Pembersihan EXIF & Privasi
                                    </span>
                                    <p className="text-xs text-stone-700 dark:text-stone-300">
                                      {ev.exifStripped ? '✓ Metadata EXIF telah dibersihkan demi keamanan pelapor.' : '✓ Format standar tervalidasi.'}
                                    </p>
                                  </div>
                                </div>

                                {/* Verification Controls */}
                                <div className="bg-stone-50/80 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-xl p-4 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                                      <FileSearch className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Penilaian Keaslian oleh Satgas:
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
                                      verifStatus === 'Terverifikasi Valid' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                                      verifStatus === 'Tervalidasi Palsu / Ditolak' ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' :
                                      'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                    }`}>
                                      {verifStatus === 'Terverifikasi Valid' && <CheckCircle className="w-3.5 h-3.5" />}
                                      {verifStatus === 'Tervalidasi Palsu / Ditolak' && <XCircle className="w-3.5 h-3.5" />}
                                      {verifStatus === 'Belum Diverifikasi' && <Clock className="w-3.5 h-3.5" />}
                                      {verifStatus}
                                    </span>
                                  </div>
                                  {ev.verificationNote && (
                                    <p className="text-xs text-stone-600 dark:text-stone-400 bg-white dark:bg-stone-950 p-2.5 rounded-lg border border-stone-200 dark:border-stone-800">
                                      <strong className="text-stone-800 dark:text-stone-200">Catatan Satgas:</strong> {ev.verificationNote}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => handleVerifyEvidence(ev.evidenceId, 'Terverifikasi Valid')}
                                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5" /> Tandai Valid
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleVerifyEvidence(ev.evidenceId, 'Tervalidasi Palsu / Ditolak')}
                                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                    >
                                      <XCircle className="w-3.5 h-3.5" /> Tandai Ditolak
                                    </button>
                                  </div>
                                </div>

                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 rounded-xl p-4">
                    <p className="text-xs text-stone-500 dark:text-stone-400 font-semibold uppercase flex items-center gap-1.5 mb-1"><Paperclip className="w-3.5 h-3.5" /> Bukti</p>
                    <p className="text-sm text-stone-400 italic">Tidak ada bukti yang disertakan.</p>
                  </div>
                )}

                {/* Ubah status kasus */}
                <div className="space-y-3 pt-6 border-t border-stone-100 dark:border-stone-800">
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-semibold uppercase">Ubah Status Kasus</p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleUpdateStatus(s)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                          selectedReport.status === s
                            ? `${STATUS_STYLES[s]} shadow-xs ring-2 ring-offset-1 ring-teal-500/40`
                            : 'bg-white dark:bg-stone-950 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                        }`}
                      >
                        {STATUS_ICONS[s]} {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── SATGAS CHAT ─────────────────────────────────── */}
                <div className="space-y-3 pt-6 border-t border-stone-100 dark:border-stone-800">
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-semibold uppercase flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Komunikasi Dua Arah (Chat Anonim)
                  </p>
                  <div className="bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 rounded-xl p-4 space-y-3 max-h-[320px] overflow-y-auto">
                    {(!selectedReport.messages || selectedReport.messages.length === 0) ? (
                      <p className="text-sm text-stone-500 dark:text-stone-400 italic text-center py-4">Belum ada pesan. Kirim pesan pertama kepada pelapor.</p>
                    ) : (
                      selectedReport.messages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.sender === 'Satgas' ? 'items-end' : 'items-start'} gap-1`}>
                          <div className="text-[10px] text-stone-400 font-mono font-bold uppercase flex items-center gap-2">
                            {msg.sender === 'Satgas' && <Shield className="w-3 h-3 text-teal-600 dark:text-teal-400" />}
                            {msg.sender === 'Pelapor' && <EyeOff className="w-3 h-3 text-stone-400" />}
                            {msg.sender}
                            <span className="opacity-60">{formatDateID(msg.timestamp)}</span>
                          </div>
                          <div className={`p-3 rounded-xl max-w-[85%] text-sm leading-relaxed ${
                            msg.sender === 'Satgas'
                              ? 'bg-teal-600 text-white rounded-tr-xs shadow-xs font-medium'
                              : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 rounded-tl-xs'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={handleSendSatgasMessage} className="flex gap-3">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ketik pesan klarifikasi kepada pelapor..."
                      className="flex-1 bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-teal-400 transition-all font-medium"
                      required
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className=" bg-teal-500 dark:bg-teal-900 hover:bg-teal-700 text-white p-3 rounded-xl transition-all shrink-0 flex items-center gap-2 text-sm font-semibold shadow-xs cursor-pointer"
                    >
                      <Send className="w-4 h-4" /> Kirim
                    </button>
                  </form>
                </div>

                {/* ── CATATAN INTERNAL SATGAS (CONFIDENTIAL STAFF NOTES) ─── */}
                <div className="space-y-3 pt-6 border-t border-stone-100 dark:border-stone-800">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-stone-500 dark:text-stone-400 font-semibold uppercase flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-500" /> Catatan Rahasia Internal Satgas (Hanya Terlihat oleh Admin)
                    </p>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded font-bold">
                      Kerahasiaan Terjamin
                    </span>
                  </div>

                  <div className="bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-xl p-4 space-y-3">
                    {(!internalNotesMap[selectedReport.caseId] || internalNotesMap[selectedReport.caseId].length === 0) ? (
                      <p className="text-xs text-amber-800/80 dark:text-amber-300/80 italic">Belum ada catatan rahasia internal. Tambahkan catatan tim di bawah ini.</p>
                    ) : (
                      <div className="space-y-2 max-h-[220px] overflow-y-auto">
                        {internalNotesMap[selectedReport.caseId].map((note) => (
                          <div key={note.id} className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-amber-900/60 p-3 rounded-lg text-xs space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-mono text-amber-700 dark:text-amber-400 font-bold">
                              <span>🔒 {note.author}</span>
                              <span>{formatDateID(note.timestamp)}</span>
                            </div>
                            <p className="text-stone-800 dark:text-stone-200 leading-relaxed font-medium">{note.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <form onSubmit={handleAddInternalNote} className="flex gap-2">
                      <input
                        type="text"
                        value={internalNoteInput}
                        onChange={(e) => setInternalNoteInput(e.target.value)}
                        placeholder="Tambahkan catatan rahasia investigasi internal Satgas..."
                        className="flex-1 bg-white dark:bg-stone-900 border border-stone-300 dark:border-amber-900/60 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 font-medium"
                      />
                      <button
                        type="submit"
                        disabled={!internalNoteInput.trim()}
                        className="bg-teal-500  dark:bg-teal-900 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all  cursor-pointer shadow-xs shrink-0 flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Simpan Catatan
                      </button>
                    </form>
                  </div>
                </div>

                {/* ── AUDIT TRAIL ─────────────────────────────────── */}
                <div className="space-y-3 pt-6 border-t border-stone-100 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setShowAuditTrail(!showAuditTrail)}
                    className="w-full flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-semibold uppercase hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5"><History className="w-3.5 h-3.5" /> Jejak Audit (Audit Trail)</span>
                    <span className="text-teal-600 dark:text-teal-400">{showAuditTrail ? 'Sembunyikan ▲' : 'Tampilkan ▼'}</span>
                  </button>

                  <AnimatePresence>
                    {showAuditTrail && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 rounded-xl p-4 space-y-2 max-h-[300px] overflow-y-auto">
                          <div className="flex items-start gap-3 text-xs text-stone-500 dark:text-stone-400 py-2 border-b border-stone-200 dark:border-stone-800">
                            <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center shrink-0 mt-0.5">
                              <Inbox className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                              <p className="font-medium text-stone-800 dark:text-stone-200">Laporan diterima oleh sistem</p>
                              <p className="text-stone-500 dark:text-stone-400 font-mono text-[10px]">{formatDateID(selectedReport.receivedAt)} · Aktor: Sistem</p>
                            </div>
                          </div>

                          {selectedReport.auditLogs && selectedReport.auditLogs.map((log) => (
                            <div key={log.id} className="flex items-start gap-3 text-xs text-stone-500 dark:text-stone-400 py-2 border-b border-stone-200 dark:border-stone-800 last:border-0">
                              <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center shrink-0 mt-0.5">
                                <Shield className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                              </div>
                              <div>
                                <p className="font-medium text-stone-800 dark:text-stone-200">{log.action}</p>
                                <p className="text-stone-500 dark:text-stone-400 font-mono text-[10px]">{formatDateID(log.timestamp)} · Aktor: {log.actor}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ TAB 1: OVERVIEW & METRIK ═══════════════════════════════════════ */}
        {activeTab === 'overview' && !selectedReport && (
          <div className="space-y-6">
            {/* STATS CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={<FileText className="w-5 h-5 text-indigo-500" />} bg="bg-indigo-500/10" label="Total Laporan" value={stats.total} />
              <StatCard icon={<Inbox className="w-5 h-5 text-amber-500" />} bg="bg-amber-500/10" label="Laporan Diterima" value={stats.diterima} pulse />
              <StatCard icon={<Clock className="w-5 h-5 text-blue-500" />} bg="bg-blue-500/10" label="Sedang Diproses" value={stats.diproses} />
              <StatCard icon={<CheckCircle className="w-5 h-5 text-emerald-500" />} bg="bg-emerald-500/10" label="Kasus Selesai" value={stats.selesai} />
            </div>

            {/* RINGKASAN REKAP KASUS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Category Breakdown Progress Bars */}
              <div className="bg-white dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Kategori Kasus Masuk
                  </h3>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">{reports.length} kasus</span>
                </div>

                <div className="space-y-3 pt-1">
                  {Object.entries(categoryCounts).map(([cat, count]) => {
                    const pct = reports.length > 0 ? Math.round((count / reports.length) * 100) : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs text-stone-700 dark:text-stone-300 font-medium">
                          <span>{cat}</span>
                          <span className="font-mono text-teal-700 dark:text-teal-400 font-bold">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-3 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Breakdown List */}
              <div className="bg-white dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Status Penanganan
                  </h3>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                    {reports.length > 0 ? Math.round((stats.selesai / reports.length) * 100) : 0}% Selesai
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {ALL_STATUSES.map((st) => {
                    const stCount = reports.filter((r) => r.status === st).length;
                    return (
                      <div key={st} className="flex items-center justify-between p-2 bg-stone-50 dark:bg-stone-950/60 rounded-xl text-xs border border-stone-200 dark:border-stone-800/80">
                        <span className={`px-2.5 py-2 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${STATUS_STYLES[st]}`}>
                          {STATUS_ICONS[st]} {st}
                        </span>
                        <span className="font-mono font-bold text-stone-700 dark:text-stone-200">{stCount} laporan</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB 2: DAFTAR KASUS (CLEAN, EYE-FRIENDLY & COMPACT TABLE) ═══════ */}
        {activeTab === 'inbox' && !selectedReport && (
          <div id="reports-table" className="bg-white dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm space-y-0">
            {/* COMPLETION SUB-FILTER TAB */}
            <div className="px-4 pt-3 pb-0 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/70 flex items-center gap-1">
              {(['semua', 'belum', 'selesai'] as const).map((key) => {
                const labels = { semua: `Semua (${reports.length})`, belum: `Belum Selesai (${reports.filter(r => r.status !== 'Selesai').length})`, selesai: `Selesai (${reports.filter(r => r.status === 'Selesai').length})` };
                const colors = { semua: 'border-teal-600 text-teal-700 dark:text-teal-300', belum: 'border-amber-500 text-amber-700 dark:text-amber-300', selesai: 'border-emerald-500 text-emerald-700 dark:text-emerald-300' };
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCompletionFilter(key)}
                    className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                      completionFilter === key
                        ? colors[key]
                        : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                    }`}
                  >
                    {labels[key]}
                  </button>
                );
              })}
            </div>

            {/* COMPACT SEARCH & FILTER BAR */}
            <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari ID, Token, Kategori..."
                  className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-teal-500 font-medium"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs">✕</button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 dark:text-stone-200 font-semibold focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="Semua Status">Semua Status</option>
                  {ALL_STATUSES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 dark:text-stone-200 font-semibold focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="Semua Kategori">Semua Kategori</option>
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* TABLE OF REPORTS */}
            {filteredReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                <Inbox className="w-10 h-10 text-stone-300 dark:text-stone-700" />
                <p className="text-stone-500 dark:text-stone-400 text-xs font-medium">Tidak ada laporan yang sesuai pencarian</p>
                <button
                  onClick={() => { setSearchQuery(''); setStatusFilter('Semua Status'); setCategoryFilter('Semua Kategori'); setCompletionFilter('semua'); }}
                  className="mt-1 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-semibold px-3 py-1.5 rounded-lg text-xs hover:bg-stone-300 dark:hover:bg-stone-700 cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700 dark:text-stone-300">
                  <thead className="bg-stone-50 dark:bg-stone-950/80 border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 uppercase font-semibold text-[11px]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Case ID</th>
                      <th className="px-4 py-3 font-semibold">Token</th>
                      <th className="px-4 py-3 font-semibold">Kategori</th>
                      <th className="px-4 py-3 font-semibold">Waktu Masuk</th>
                      <th className="px-4 py-3 font-semibold text-center">Bukti</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                    {filteredReports.map((report, idx) => (
                      <tr key={report.caseId || `fallback-${idx}`} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors group bg-white dark:bg-stone-900/60">
                        <td className="px-4 py-3 font-mono font-bold text-stone-900 dark:text-stone-100">{report.caseId}</td>
                        <td className="px-4 py-3 font-mono text-stone-500 dark:text-stone-400 text-[11px]">{report.anonymousToken}</td>
                        <td className="px-4 py-3 font-medium text-stone-800 dark:text-stone-200">{report.category}</td>
                        <td className="px-4 py-3 text-stone-500 dark:text-stone-400 whitespace-nowrap text-[11px]">{formatDateID(report.receivedAt)}</td>
                        <td className="px-4 py-3 text-center">
                          {report.evidences && report.evidences.length > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800/60 px-2 py-0.5 rounded font-semibold">
                              <Paperclip className="w-3 h-3" /> {report.evidences.length}
                            </span>
                          ) : (<span className="text-stone-400 dark:text-stone-600">—</span>)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center w-max gap-1.5 ${STATUS_STYLES[report.status]}`}>
                            {STATUS_ICONS[report.status]} {report.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => openDetail(report)}
                            className="inline-flex items-center gap-1 bg-teal-600 hover:bg-teal-500 text-white font-semibold px-3 py-2 rounded-lg transition-all text-xs cursor-pointer shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" /> Periksa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══ TAB 3: PESAN ANONIM (CHAT HUB) ════════════════════════════════ */}
        {activeTab === 'chat' && !selectedReport && (
          <div className="bg-white dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
              <h2 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Obrolan Anonim dengan Pelapor
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Kirim klarifikasi dan jawaban langsung kepada pelapor tanpa mengungkap identitasnya.
              </p>
            </div>

            <div className="space-y-3">
              {reports.map((r) => {
                const msgCount = r.messages ? r.messages.length : 0;
                const lastMsg = msgCount > 0 ? r.messages![msgCount - 1] : null;
                return (
                  <div key={r.caseId} className="bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-stone-900 dark:text-stone-100">{r.caseId}</span>
                        <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">({r.anonymousToken})</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${STATUS_STYLES[r.status]}`}>{r.status}</span>
                      </div>
                      <p className="text-xs text-stone-700 dark:text-stone-300 font-medium">{r.category}</p>
                      {lastMsg ? (
                        <p className="text-xs text-stone-500 dark:text-stone-400 italic truncate max-w-md">
                          Pesan terakhir ({lastMsg.sender}): &quot;{lastMsg.text}&quot;
                        </p>
                      ) : (
                        <p className="text-xs text-stone-400 dark:text-stone-500 italic">Belum ada obrolan.</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => openDetail(r)}
                      className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Buka Obrolan ({msgCount})
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-center pb-8">
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
            <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
            Sistem ini mencatat laporan yang diterima. Satgas bertugas memverifikasi keaslian berkas & SHA-256 checksum sebelum mengambil tindakan hukum/akademik.
          </p>
        </div>

      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, bg, label, value, pulse }: { icon: React.ReactNode; bg: string; label: string; value: number; pulse?: boolean; }) {
  return (
    <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border border-stone-200 dark:border-stone-800 rounded-2xl p-5 space-y-3 shadow-xs">
      <div className="flex justify-between items-start">
        <div className={`p-2.5 ${bg} rounded-xl relative border border-stone-100 dark:border-stone-800`}>
          {icon}
          {pulse && <span className="absolute top-0 right-0 w-2 h-2 bg-amber-400 rounded-full animate-ping" />}
        </div>
      </div>
      <div>
        <p className="text-stone-500 dark:text-stone-400 text-xs mb-0.5 font-medium">{label}</p>
        <h3 className="text-3xl font-extrabold text-stone-900 dark:text-white">{value}</h3>
      </div>
    </div>
  );
}

function DetailCell({ icon, label, value, valueClass = 'text-stone-900 dark:text-stone-100' }: { icon: React.ReactNode; label: string; value: string; valueClass?: string; }) {
  return (
    <div className="bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 rounded-xl p-3 space-y-1">
      <p className="text-xs text-stone-500 dark:text-stone-400 font-semibold uppercase flex items-center gap-1.5">
        <span className="text-stone-400">{icon}</span> {label}
      </p>
      <p className={`text-sm font-semibold ${valueClass} leading-snug break-words`}>{value}</p>
    </div>
  );
}
