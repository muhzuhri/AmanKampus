"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Paperclip,
  CheckCircle,
  ShieldCheck,
  AlertTriangle,
  Download,
  Check,
  XCircle,
  ChevronDown,
  ChevronUp,
  Inbox,
  Clock,
  Sparkles,
  FileText,
  Trash2,
  X,
} from "lucide-react";
import {
  type Report,
  type CaseStatus,
  type EvidenceVerificationStatus,
  type Evidence,
} from "@/lib/types";
import {
  formatDateID,
  formatBytes,
  STATUS_STYLES,
  ALL_STATUSES,
  STATUS_ICONS,
  handleDownloadEvidence,
} from "@/lib/adminUtils";

import AdminDeleteConfirmModal from "./AdminDeleteConfirmModal";

interface AdminInboxTabProps {
  reports: Report[];
  filteredReports: Report[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  completionFilter: "semua" | "selesai" | "belum";
  setCompletionFilter: (filter: "semua" | "selesai" | "belum") => void;
  onSelectReport: (report: Report) => void;
  onUpdateStatus: (report: Report, newStatus: CaseStatus) => void;
  onVerifyEvidence: (
    report: Report,
    evidenceId: string,
    status: EvidenceVerificationStatus,
    note: string,
  ) => void;
  onDeleteReport: (report: Report) => void;
  allCategories: string[];
}

export default function AdminInboxTab({
  reports,
  filteredReports,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  completionFilter,
  setCompletionFilter,
  onSelectReport,
  onUpdateStatus,
  onVerifyEvidence,
  onDeleteReport,
  allCategories,
}: AdminInboxTabProps) {
  const [expandedEvidenceIds, setExpandedEvidenceIds] = useState<Set<string>>(
    new Set(),
  );
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);

  const toggleExpandEvidence = (caseId: string) => {
    const newSet = new Set(expandedEvidenceIds);
    if (newSet.has(caseId)) newSet.delete(caseId);
    else newSet.add(caseId);
    setExpandedEvidenceIds(newSet);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Control Bar */}
      <div className="bg-white dark:bg-[#163432] p-4 rounded-2xl border border-stone-200 dark:border-teal-900 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="flex-1 flex items-center bg-stone-50 dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-teal-900 px-3 py-2">
            <Search className="w-4 h-4 text-stone-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari Case ID, Token Anonim, Kronologi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 px-2"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-teal-900 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 outline-none cursor-pointer"
          >
            <option value="Semua Status">
              Semua Status ({reports.length})
            </option>
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-teal-900 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 outline-none cursor-pointer"
          >
            <option value="Semua Kategori">Semua Kategori</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sub-Filter (Selesai vs Belum Selesai) */}
        <div className="flex items-center justify-between border-t border-stone-100 dark:border-stone-800/80 pt-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-teal-500" />
            <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">
              Filter Penanganan:
            </span>
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-900/80 p-0.5 rounded-lg border border-stone-200 dark:border-stone-800 ml-1">
              <button
                type="button"
                onClick={() => setCompletionFilter("semua")}
                className={`px-3 py-2 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                  completionFilter === "semua"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                }`}
              >
                Semua ({reports.length})
              </button>
              <button
                type="button"
                onClick={() => setCompletionFilter("belum")}
                className={`px-3 py-2 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                  completionFilter === "belum"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                }`}
              >
                Belum Selesai (
                {reports.filter((r) => r.status !== "Selesai").length})
              </button>
              <button
                type="button"
                onClick={() => setCompletionFilter("selesai")}
                className={`px-3 py-2 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                  completionFilter === "selesai"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                }`}
              >
                Selesai ({reports.filter((r) => r.status === "Selesai").length})
              </button>
            </div>
          </div>

          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
            Menampilkan{" "}
            <strong className="text-teal-600 dark:text-teal-400 font-bold">
              {filteredReports.length}
            </strong>{" "}
            dari {reports.length} kasus
          </span>
        </div>
      </div>

      {/* Case List Data Table */}
      {filteredReports.length === 0 ? (
        <div className="bg-white dark:bg-[#163432] border border-stone-200 dark:border-teal-900 border-dashed rounded-2xl p-10 text-center space-y-3">
          <Inbox className="w-10 h-10 text-stone-400 mx-auto" />
          <h4 className="font-bold text-stone-700 dark:text-stone-300">
            Tidak ada laporan yang cocok
          </h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Coba sesuaikan kata kunci pencarian atau reset filter status dan
            kategori di atas.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#163432] rounded-2xl border border-stone-200 dark:border-teal-900 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50/80 dark:bg-stone-900/60 border-b border-stone-200 dark:border-teal-900/60 text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Case ID</th>
                  <th className="py-3.5 px-4">Token Anonim</th>
                  <th className="py-3.5 px-4">Kategori Kasus</th>
                  <th className="py-3.5 px-4">Waktu Diterima</th>
                  <th className="py-3.5 px-4">Status Kasus</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-teal-900/40">
                {filteredReports.map((report) => (
                  <tr
                    key={report.caseId}
                    className="hover:bg-stone-50/80 dark:hover:bg-teal-950/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-600 dark:text-teal-400 whitespace-nowrap">
                      <span className="bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-900">
                        {report.caseId}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-stone-700 dark:text-stone-300 whitespace-nowrap">
                      {report.anonymousToken}
                    </td>

                    <td className="py-3.5 px-4 text-stone-800 dark:text-stone-200 font-medium">
                      <span className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] font-semibold">
                        {report.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-stone-600 dark:text-stone-300 font-medium whitespace-nowrap">
                      {formatDateID(report.receivedAt)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={report.status}
                        onChange={(e) =>
                          onUpdateStatus(report, e.target.value as CaseStatus)
                        }
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border outline-none cursor-pointer ${STATUS_STYLES[report.status] || ""}`}
                      >
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Tombol Periksa */}
                        <button
                          type="button"
                          onClick={() => onSelectReport(report)}
                          className="px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Periksa</span>
                        </button>

                        {/* Tombol Hapus — Memicu Pop Up Konfirmasi Modal */}
                        <button
                          type="button"
                          onClick={() => setReportToDelete(report)}
                          className="px-3.5 py-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200/80 dark:border-red-900/80 text-xs font-medium transition-all inline-flex items-center gap-1.5 cursor-pointer"
                          title="Hapus kasus ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pop Up Modal Konfirmasi Hapus Kasus */}
      <AdminDeleteConfirmModal
        report={reportToDelete}
        isOpen={!!reportToDelete}
        onClose={() => setReportToDelete(null)}
        onConfirmDelete={onDeleteReport}
      />
    </div>
  );
}
