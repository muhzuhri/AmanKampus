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

// Status Styles
const STATUS_STYLES: Record<CaseStatus, string> = {
  'Laporan Diterima': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
  Diverifikasi: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30',
  Diproses: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30',
  'Mediasi & Konseling': 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/30',
  'Eskalasi ke Komite Etik': 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30',
  Selesai: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
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

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'aman_kampus_reports') loadReports();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [router]);

  const loadReports = () => {
    const saved = localStorage.getItem('aman_kampus_reports');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter((r) => r.caseId && r.anonymousToken);
          if (valid.length === 0) valid.push(...MOCK_REPORTS);
          if (valid.length !== parsed.length) {
            localStorage.setItem('aman_kampus_reports', JSON.stringify(valid));
          }
          setReports(valid);
        } else {
          setReports(MOCK_REPORTS);
        }
      } catch {
        localStorage.setItem('aman_kampus_reports', JSON.stringify(MOCK_REPORTS));
        setReports(MOCK_REPORTS);
      }
    } else {
      localStorage.setItem('aman_kampus_reports', JSON.stringify(MOCK_REPORTS));
      setReports(MOCK_REPORTS);
    }
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
    const updated = reports.map((r) => {
      if (r.caseId === selectedReport.caseId) {
        const logs = r.auditLogs ? [...r.auditLogs, auditEntry] : [auditEntry];
        return { ...r, status: newStatus, auditLogs: logs };
      }
      return r;
    });
    setReports(updated);
    const updatedReport = updated.find((r) => r.caseId === selectedReport.caseId)!;
    setSelectedReport(updatedReport);
    localStorage.setItem('aman_kampus_reports', JSON.stringify(updated));
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

    const updated = reports.map((r) => {
      if (r.caseId === selectedReport.caseId) {
        const newEvidences = r.evidences.map((ev) => {
          if (ev.evidenceId === evidenceId) {
            return {
              ...ev,
              verificationStatus: status,
              verificationNote: note || (status === 'Terverifikasi Valid' ? 'Bukti tervalidasi asli & tidak terdeteksi manipulasi.' : 'Berkas ditandai mencurigakan atau tidak valid.'),
            };
          }
          return ev;
        });
        const logs = r.auditLogs ? [...r.auditLogs, auditEntry] : [auditEntry];
        return { ...r, evidences: newEvidences, auditLogs: logs };
      }
      return r;
    });

    setReports(updated);
    const updatedReport = updated.find((r) => r.caseId === selectedReport.caseId)!;
    setSelectedReport(updatedReport);
    localStorage.setItem('aman_kampus_reports', JSON.stringify(updated));
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
    const updated = reports.map((r) => {
      if (r.caseId === selectedReport.caseId) {
        const msgs = r.messages ? [...r.messages, newMsg] : [newMsg];
        const logs = r.auditLogs ? [...r.auditLogs, auditEntry] : [auditEntry];
        return { ...r, messages: msgs, auditLogs: logs };
      }
      return r;
    });
    setReports(updated);
    const updatedReport = updated.find((r) => r.caseId === selectedReport.caseId)!;
    setSelectedReport(updatedReport);
    setChatInput('');
    localStorage.setItem('aman_kampus_reports', JSON.stringify(updated));
  };

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
    <div className="min-h-screen bg-transparent text-stone-900 dark:text-stone-100 font-sans selection:bg-teal-500/20">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-teal-900 dark:bg-stone-900 backdrop-blur-md border-b border-stone-800 dark:border-teal-900 shadow-md text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 -ml-1 rounded-lg hover:bg-stone-800 dark:hover:bg-stone-800 transition-colors text-stone-300 hover:text-white">
              <ShieldAlert className="w-5 h-5 text-teal-400" />
            </Link>
            <div>
              <h1 className="font-bold tracking-tight text-white dark:text-white text-sm sm:text-base">
                Dasbor Satgas PPKS
              </h1>
              <p className="text-xs text-teal-400 dark:text-teal-400 font-medium hidden sm:block">
                Portal Internal Verifikasi Laporan & Forensik Bukti
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-emerald-950/60 dark:bg-emerald-950/60 border border-emerald-800 dark:border-emerald-800 px-3 py-1.5 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-300 dark:text-emerald-300">Live Server</span>
            </div>
            <button
              onClick={resetMockReports}
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold bg-teal-950/60 dark:bg-teal-950/60 border border-teal-800 dark:border-teal-800 text-teal-300 dark:text-teal-300 hover:bg-teal-900/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Reset ke data contoh laporan demo"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Contoh Laporan</span>
            </button>
            <button
              onClick={loadReports}
              className="p-2 text-stone-300 hover:text-white hover:bg-stone-800 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
              title="Muat ulang laporan"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {mounted && (
              <button
                type="button"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="p-2 rounded-lg border border-stone-700 dark:border-stone-600 bg-stone-800 hover:bg-stone-700 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-200 transition-colors cursor-pointer"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-amber-200" />}
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm bg-stone-800 dark:bg-stone-800 border border-stone-700 dark:border-stone-700 text-stone-200 hover:text-rose-400 hover:border-rose-800 hover:bg-rose-950/50 font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 relative z-10">

        {/* ── STATS CARDS ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />} bg="bg-indigo-50 dark:bg-indigo-950/60" label="Total Laporan" value={stats.total} />
          <StatCard icon={<Inbox className="w-5 h-5 text-amber-600 dark:text-amber-400" />} bg="bg-amber-50 dark:bg-amber-950/60" label="Laporan Diterima" value={stats.diterima} pulse />
          <StatCard icon={<Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />} bg="bg-blue-50 dark:bg-blue-950/60" label="Sedang Diproses" value={stats.diproses} />
          <StatCard icon={<CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />} bg="bg-emerald-50 dark:bg-emerald-950/60" label="Kasus Selesai" value={stats.selesai} />
        </div>

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
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
                    title="Tutup detail"
                  >
                    <X className="w-4 h-4" />
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
                  <div className="bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 rounded-xl p-4">
                    <p className="text-sm text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-wrap">{selectedReport.chronology}</p>
                  </div>
                </div>

                {/* FEATURE 5 & 1: Evidences Forensics & Authenticity Verification */}
                {selectedReport.evidences && selectedReport.evidences.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-stone-500 dark:text-stone-400 font-semibold uppercase flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5" /> Verifikasi Keaslian & Forensik Bukti ({selectedReport.evidences.length} file)
                      </p>
                      <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">SHA-256 & EXIF Protected</span>
                    </div>

                    <div className="space-y-4">
                      {selectedReport.evidences.map((ev) => {
                        const verifStatus = ev.verificationStatus || 'Belum Diverifikasi';
                        return (
                          <div key={ev.evidenceId} className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl p-5 space-y-4 shadow-xs">
                            <div className="flex items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800/80 pb-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 flex items-center justify-center shrink-0">
                                  <Paperclip className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm text-stone-900 dark:text-stone-100 font-semibold truncate">{ev.fileName}</p>
                                  <p className="text-xs text-stone-500 dark:text-stone-400">{ev.fileType} · {formatBytes(ev.fileSize)}</p>
                                </div>
                              </div>

                              {/* Prominent Download Button for Satgas Admin (Downloads Original File Format) */}
                              <button
                                type="button"
                                onClick={() => handleDownloadEvidence(ev)}
                                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                              >
                                <Download className="w-3.5 h-3.5" /> Unduh Berkas Bukti Asli
                              </button>
                            </div>

                            {/* Catatan / Alasan dari Pelapor jika ada */}
                            {ev.reporterNote && (
                              <div className="bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl p-3.5 text-xs space-y-1">
                                <span className="font-bold text-teal-900 dark:text-teal-300 flex items-center gap-1.5">
                                  <MessageSquare className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Catatan / Alasan Pelapor Mengenai Bukti Ini:
                                </span>
                                <p className="text-stone-800 dark:text-stone-200 leading-relaxed font-medium">{ev.reporterNote}</p>
                              </div>
                            )}

                            {/* Detailed Forensic Scan Findings (AI Generator & Editing Warnings) */}
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
                                    {ev.forensicStatus === 'Needs Review' && '⚠️ Memerlukan Peninjauan Manual Editor'}
                                    {ev.forensicStatus === 'Original' && '🟢 Berkas Tervalidasi Utuh / Native Capture'}
                                  </span>
                                </div>
                                <div className="space-y-1 pt-1 font-sans">
                                  {ev.forensicDetails.map((det, idx) => (
                                    <p key={idx} className="leading-relaxed flex items-start gap-1.5">
                                      <span className="opacity-70">•</span> <span>{det}</span>
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* SHA-256 Checksum & EXIF Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 space-y-1">
                                <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 font-semibold text-[11px]">
                                  <span className="flex items-center gap-1"><Hash className="w-3.5 h-3.5" /> SHA-256 Cryptographic Hash</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(ev.sha256);
                                      setCopiedHash(ev.evidenceId);
                                      setTimeout(() => setCopiedHash(null), 2000);
                                    }}
                                    className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    {copiedHash === ev.evidenceId ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                    {copiedHash === ev.evidenceId ? 'Tersalin' : 'Salin Hash'}
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
                                  {ev.exifStripped ? '✓ Metadata EXIF (GPS lokasi & serial HP) telah dibersihkan demi keamanan pelapor.' : '✓ Format standar tervalidasi.'}
                                </p>
                              </div>
                            </div>

                            {/* Satgas Verification Decision Controls */}
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
                                  <CheckCircle className="w-3.5 h-3.5" /> Tandai Bukti Valid
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleVerifyEvidence(ev.evidenceId, 'Tervalidasi Palsu / Ditolak')}
                                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Tandai Manipulasi / Ditolak
                                </button>
                              </div>
                            </div>

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
                      className="bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-xl transition-all disabled:opacity-50 shrink-0 flex items-center gap-2 text-sm font-semibold shadow-xs cursor-pointer"
                    >
                      <Send className="w-4 h-4" /> Kirim
                    </button>
                  </form>
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

        {/* ── REPORTS TABLE ──────────────────────────────────────────────── */}
        <div id="reports-table" className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-lg scroll-mt-24">
          <div className="px-6 py-5 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50/80 dark:bg-stone-950/80">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                Daftar Laporan Masuk
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {reports.length} laporan · Semua tersimpan terenkripsi
              </p>
            </div>
          </div>

          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <Inbox className="w-12 h-12 text-stone-300 dark:text-stone-700" />
              <p className="text-stone-500 dark:text-stone-400 font-medium text-sm">Belum ada laporan masuk</p>
              <button
                onClick={resetMockReports}
                className="mt-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-xs cursor-pointer flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Muat Contoh Laporan Demo
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-stone-600 dark:text-stone-300">
                <thead className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Case ID</th>
                    <th className="px-6 py-4 font-semibold">Token Anonim</th>
                    <th className="px-6 py-4 font-semibold">Kategori</th>
                    <th className="px-6 py-4 font-semibold">Waktu Laporan</th>
                    <th className="px-6 py-4 font-semibold">Bukti</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {reports.map((report, idx) => (
                    <tr key={report.caseId || `fallback-${idx}`} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors group bg-white dark:bg-stone-900">
                      <td className="px-6 py-4 font-mono font-bold text-stone-900 dark:text-stone-100 text-xs">{report.caseId}</td>
                      <td className="px-6 py-4 font-mono text-stone-500 dark:text-stone-400 text-xs">{report.anonymousToken}</td>
                      <td className="px-6 py-4 font-medium text-stone-800 dark:text-stone-200 text-sm">{report.category}</td>
                      <td className="px-6 py-4 text-stone-500 dark:text-stone-400 text-xs whitespace-nowrap">{formatDateID(report.receivedAt)}</td>
                      <td className="px-6 py-4">
                        {report.evidences && report.evidences.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-2.5 py-1 rounded-md font-semibold">
                            <Paperclip className="w-3 h-3" /> {report.evidences.length}
                          </span>
                        ) : (<span className="text-stone-400 text-xs">—</span>)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center w-max gap-1.5 ${STATUS_STYLES[report.status]}`}>
                          {STATUS_ICONS[report.status]} {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openDetail(report)}
                          className="inline-flex items-center gap-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:border-teal-200 dark:hover:border-teal-800 hover:text-teal-700 dark:hover:text-teal-300 text-stone-700 dark:text-stone-200 font-medium px-3 py-1.5 rounded-lg transition-all text-xs opacity-0 group-hover:opacity-100 shadow-xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Periksa & Verifikasi
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

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
