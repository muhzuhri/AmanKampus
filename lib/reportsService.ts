import { type Report, type CaseStatus, type Message, type AuditLog, type Evidence, MOCK_REPORTS } from './types';

// Helper to check if Supabase is properly configured in environment variables
export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const isConfigured =
    Boolean(url) &&
    Boolean(key) &&
    !url.includes('your-supabase-project') &&
    !key.includes('your-supabase-anon-key');

  return { url, key, isConfigured };
}

// Fetch helper with AbortController timeout to prevent long hanging requests
async function fetchWithTimeout(resource: string, options: RequestInit = {}, timeoutMs: number = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

// Shared headers for all Supabase REST calls
function supabaseHeaders(key: string): Record<string, string> {
  return {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Tell PostgREST to skip response content-negotiation overhead
    'Accept-Profile': 'public',
  };
}

// Transform DB JSON row to frontend Report object
function dbRowToReport(row: any): Report {
  return {
    caseId: row.case_id || row.caseId,
    anonymousToken: row.anonymous_token || row.anonymousToken,
    category: row.category,
    incidentTime: row.incident_time || row.incidentTime || undefined,
    involvedParties: row.involved_parties || row.involvedParties || undefined,
    targetFaculty: row.target_faculty || row.targetFaculty || undefined,
    chronology: row.chronology,
    evidences: Array.isArray(row.evidences) ? row.evidences : [],
    messages: Array.isArray(row.messages) ? row.messages : [],
    auditLogs: Array.isArray(row.audit_logs) ? row.audit_logs : [],
    status: (row.status as CaseStatus) || 'Laporan Diterima',
    receivedAt: row.received_at || row.receivedAt || new Date().toISOString(),
    isAnonymous: row.is_anonymous ?? row.isAnonymous ?? true,
    abuseFlags: Array.isArray(row.abuse_flags) ? row.abuse_flags : row.abuseFlags || undefined,
  };
}

// Transform frontend Report object to DB JSON row
function reportToDbRow(report: Report) {
  return {
    case_id: report.caseId,
    anonymous_token: report.anonymousToken,
    category: report.category,
    incident_time: report.incidentTime || null,
    involved_parties: report.involvedParties || null,
    target_faculty: report.targetFaculty || null,
    chronology: report.chronology,
    evidences: report.evidences || [],
    messages: report.messages || [],
    audit_logs: report.auditLogs || [],
    status: report.status,
    received_at: report.receivedAt,
    is_anonymous: report.isAnonymous,
    abuse_flags: report.abuseFlags || [],
  };
}

/**
 * Helper: Ambil laporan lokal dari LocalStorage.
 * Hanya memuat MOCK_REPORTS jika includeMocks === true (misal saat offline/fallback).
 */
export function getLocalReports(includeMocks: boolean = false): Report[] {
  let localReports: Report[] = [];
  if (typeof window !== 'undefined') {
    const savedStr = localStorage.getItem('aman_kampus_reports');
    if (savedStr) {
      try {
        const parsed = JSON.parse(savedStr);
        if (Array.isArray(parsed)) localReports = parsed;
      } catch (e) {
        console.warn('Failed to parse local reports:', e);
      }
    }
  }

  const reportMap = new Map<string, Report>();
  if (includeMocks) {
    MOCK_REPORTS.forEach((r) => reportMap.set(r.caseId, r));
  }
  localReports.forEach((r) => {
    if (r.caseId && r.anonymousToken) reportMap.set(r.caseId, r);
  });

  return Array.from(reportMap.values()).sort(
    (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
  );
}

/**
 * 1. Simpan Laporan Baru ke Supabase & LocalStorage
 */
export async function saveReportToDatabase(report: Report): Promise<{ success: boolean; error?: string }> {
  // Always update local storage first as local mirror
  try {
    const savedStr = typeof window !== 'undefined' ? localStorage.getItem('aman_kampus_reports') : null;
    const existing: Report[] = savedStr ? JSON.parse(savedStr) : [];
    const filtered = existing.filter((r) => r.caseId !== report.caseId);
    filtered.unshift(report);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aman_kampus_reports', JSON.stringify(filtered));
    }
  } catch (e) {
    console.warn('LocalStorage save error (likely quota):', e);
  }

  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    console.warn('Supabase URL / Key belum dikonfigurasi di .env.local. Laporan tersimpan di LocalStorage browser.');
    return { success: true };
  }

  try {
    const response = await fetchWithTimeout(`${url}/rest/v1/reports`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(reportToDbRow(report)),
    }, 4000);

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gagal mengirim ke Supabase REST API:', errText);
      return { success: false, error: errText };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Network Error saat menyimpan ke Supabase:', err);
    return { success: false, error: err?.message || 'Gagal koneksi ke database' };
  }
}

/**
 * 2. Ambil Semua Laporan untuk Dasbor Admin (Murni dari Supabase bila terisi, fallback ke Local/Sample agar tidak pernah kosong)
 */
export async function fetchReportsFromDatabase(): Promise<Report[]> {
  const { url, key, isConfigured } = getSupabaseConfig();

  if (isConfigured) {
    try {
      const response = await fetchWithTimeout(
        `${url}/rest/v1/reports?select=*&order=received_at.desc`,
        { method: 'GET', headers: supabaseHeaders(key) },
        8000
      );

      if (response.ok) {
        const rows = await response.json();
        if (Array.isArray(rows) && rows.length > 0) {
          return rows.map(dbRowToReport);
        }
        // Tabel masih kosong — kembalikan array kosong (bukan mock)
        return [];
      } else {
        console.warn('Supabase fetch error:', response.status, response.statusText);
      }
    } catch (err) {
      console.warn('Koneksi ke Supabase lambat/gagal:', err);
    }
  }

  // Fallback bila Supabase belum dikonfigurasi atau bermasalah
  return getLocalReports(false);
}

/**
 * Single-request replacement for Promise.all([checkSupabaseStatus(), fetchReportsFromDatabase()]).
 * Melakukan SATU HTTP request ke Supabase dan mengembalikan data sekaligus status koneksi DB.
 * Ini mengeliminasi request duplikat checkSupabaseStatus() yang sebelumnya selalu dijalankan paralel.
 */
export async function fetchReportsWithStatus(): Promise<{
  reports: Report[];
  status: SupabaseStatusInfo;
}> {
  const { url, key, isConfigured } = getSupabaseConfig();

  if (!isConfigured) {
    return {
      reports: getLocalReports(false),
      status: {
        isConfigured: false,
        connected: false,
        count: 0,
        url,
        error: 'URL / Anon Key Supabase belum dikonfigurasi di .env.local',
      },
    };
  }

  try {
    const response = await fetchWithTimeout(
      `${url}/rest/v1/reports?select=*&order=received_at.desc`,
      { method: 'GET', headers: supabaseHeaders(key) },
      8000
    );

    if (!response.ok) {
      const errText = await response.text();
      return {
        reports: getLocalReports(false),
        status: {
          isConfigured: true,
          connected: false,
          count: 0,
          url,
          error: `Supabase error (${response.status}): ${errText}`,
        },
      };
    }

    const rows = await response.json();
    const reports = Array.isArray(rows) ? rows.map(dbRowToReport) : [];
    return {
      reports,
      status: {
        isConfigured: true,
        connected: true,
        count: reports.length,
        url,
      },
    };
  } catch (err: any) {
    const isTimeout = err?.name === 'AbortError';
    return {
      reports: getLocalReports(false),
      status: {
        isConfigured: true,
        connected: false,
        count: 0,
        url,
        error: isTimeout
          ? 'Koneksi ke Supabase timeout (>8s)'
          : err?.message || 'Gagal terhubung ke jaringan Supabase',
      },
    };
  }
}

/**
 * Check connectivity and report count on Supabase
 */
export type SupabaseStatusInfo = {
  isConfigured: boolean;
  connected: boolean;
  count: number;
  error?: string;
  url?: string;
};

export async function checkSupabaseStatus(): Promise<SupabaseStatusInfo> {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return {
      isConfigured: false,
      connected: false,
      count: 0,
      url,
      error: 'URL / Anon Key Supabase belum dikonfigurasi di .env.local',
    };
  }

  try {
    const response = await fetchWithTimeout(`${url}/rest/v1/reports?select=case_id`, {
      method: 'GET',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
    }, 3000);

    if (!response.ok) {
      const errText = await response.text();
      return {
        isConfigured: true,
        connected: false,
        count: 0,
        url,
        error: `Supabase merespons error (${response.status}): ${errText}`,
      };
    }

    const rows = await response.json();
    const count = Array.isArray(rows) ? rows.length : 0;
    return {
      isConfigured: true,
      connected: true,
      count,
      url,
    };
  } catch (err: any) {
    return {
      isConfigured: true,
      connected: false,
      count: 0,
      url,
      error: err?.name === 'AbortError' ? 'Koneksi ke Supabase timeout (>3s)' : (err?.message || 'Gagal terhubung ke jaringan Supabase'),
    };
  }
}

/**
 * 3. Seed / Sinkronkan data sampel ke Supabase (Bila tabel Supabase masih kosong)
 */
export async function seedMockReportsToSupabase(reportsToSeed: Report[] = MOCK_REPORTS): Promise<{ success: boolean; count: number; error?: string }> {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return { success: false, count: 0, error: 'Supabase belum dikonfigurasi di .env.local' };

  try {
    const rows = reportsToSeed.map(reportToDbRow);
    const response = await fetchWithTimeout(`${url}/rest/v1/reports`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=ignore-duplicates,return=representation',
      },
      body: JSON.stringify(rows),
    }, 5000);

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, count: 0, error: errText };
    }

    const inserted = await response.json();
    return { success: true, count: Array.isArray(inserted) ? inserted.length : reportsToSeed.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Error seeding DB' };
  }
}

/**
 * 4. Ambil Laporan Tunggal berdasarkan Token Anonim ATAU Case ID (untuk /track) — Respons Instan & Fleksibel
 */
export async function fetchReportByTokenFromDatabase(tokenOrCaseId: string): Promise<Report | null> {
  const cleanInput = tokenOrCaseId.trim().toUpperCase();
  const { url, key, isConfigured } = getSupabaseConfig();

  if (isConfigured) {
    try {
      const response = await fetchWithTimeout(
        `${url}/rest/v1/reports?or=(anonymous_token.ilike.${encodeURIComponent(cleanInput)},case_id.ilike.${encodeURIComponent(cleanInput)})&select=*`,
        {
          method: 'GET',
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
        },
        3000
      );

      if (response.ok) {
        const rows = await response.json();
        if (Array.isArray(rows) && rows.length > 0) {
          return dbRowToReport(rows[0]);
        }
      }
    } catch (err) {
      console.warn('Supabase fetch single report timed out, checking local:', err);
    }
  }

  // Fallback pencarian di local storage & mock reports berdasarkan Token ATAU Case ID
  const localReports = getLocalReports(true);
  const localMatch = localReports.find(
    (r) => r.anonymousToken.toUpperCase() === cleanInput || r.caseId.toUpperCase() === cleanInput
  );

  return localMatch || null;
}

/**
 * 5. Update Status Kasus, Audit Log, Pesan Chat, atau Berkas Bukti ke Database
 */
export async function updateReportInDatabase(
  caseId: string,
  updatedFields: Partial<Report>
): Promise<{ success: boolean; error?: string }> {
  // Update local storage first
  if (typeof window !== 'undefined') {
    try {
      const savedStr = localStorage.getItem('aman_kampus_reports');
      const reports: Report[] = savedStr ? JSON.parse(savedStr) : [...MOCK_REPORTS];
      const idx = reports.findIndex((r) => r.caseId === caseId);
      if (idx !== -1) {
        reports[idx] = { ...reports[idx], ...updatedFields };
        localStorage.setItem('aman_kampus_reports', JSON.stringify(reports));
      }
    } catch (e) {
      console.warn('LocalStorage update failed:', e);
    }
  }

  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return { success: true };
  }

  try {
    const patchBody: Record<string, any> = {};
    if (updatedFields.status !== undefined) patchBody.status = updatedFields.status;
    if (updatedFields.evidences !== undefined) patchBody.evidences = updatedFields.evidences;
    if (updatedFields.messages !== undefined) patchBody.messages = updatedFields.messages;
    if (updatedFields.auditLogs !== undefined) patchBody.audit_logs = updatedFields.auditLogs;
    if (updatedFields.abuseFlags !== undefined) patchBody.abuse_flags = updatedFields.abuseFlags;

    const response = await fetchWithTimeout(`${url}/rest/v1/reports?case_id=eq.${encodeURIComponent(caseId)}`, {
      method: 'PATCH',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(patchBody),
    }, 4000);

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gagal update Supabase REST API:', errText);
      return { success: false, error: errText };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error update DB:', err);
    return { success: false, error: err?.message || 'Error update database' };
  }
}

/**
 * 6. Hapus Laporan dari Supabase & LocalStorage
 */
export async function deleteReportFromDatabase(
  caseId: string
): Promise<{ success: boolean; error?: string }> {
  // Hapus dari localStorage terlebih dahulu
  if (typeof window !== 'undefined') {
    try {
      const savedStr = localStorage.getItem('aman_kampus_reports');
      if (savedStr) {
        const reports: Report[] = JSON.parse(savedStr);
        const filtered = reports.filter((r) => r.caseId !== caseId);
        localStorage.setItem('aman_kampus_reports', JSON.stringify(filtered));
      }
    } catch (e) {
      console.warn('LocalStorage delete failed:', e);
    }
  }

  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return { success: true };
  }

  try {
    const response = await fetchWithTimeout(
      `${url}/rest/v1/reports?case_id=eq.${encodeURIComponent(caseId)}`,
      {
        method: 'DELETE',
        headers: {
          ...supabaseHeaders(key),
          'Prefer': 'return=minimal',
        },
      },
      6000
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gagal menghapus dari Supabase:', errText);
      return { success: false, error: errText };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error delete DB:', err);
    return { success: false, error: err?.message || 'Error menghapus dari database' };
  }
}
