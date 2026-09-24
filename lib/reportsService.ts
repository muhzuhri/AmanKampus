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
    const response = await fetch(`${url}/rest/v1/reports`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(reportToDbRow(report)),
    });

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
 * 2. Ambil Semua Laporan untuk Dasbor Admin (Murni dari Supabase bila terkonfigurasi)
 */
export async function fetchReportsFromDatabase(): Promise<Report[]> {
  const { url, key, isConfigured } = getSupabaseConfig();

  if (isConfigured) {
    try {
      const response = await fetch(`${url}/rest/v1/reports?select=*&order=received_at.desc`, {
        method: 'GET',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const rows = await response.json();
        if (Array.isArray(rows)) {
          // Apabila Supabase terkonfigurasi, kembalikan 100% data dari Supabase DB
          return rows.map(dbRowToReport);
        }
      } else {
        console.warn('Supabase fetch error:', await response.text());
      }
    } catch (err) {
      console.warn('Koneksi ke Supabase gagal, beralih ke LocalStorage fallback:', err);
    }
  }

  // Fallback HANYA bila Supabase belum dikonfigurasi atau tidak terhubung
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
  MOCK_REPORTS.forEach((r) => reportMap.set(r.caseId, r));
  localReports.forEach((r) => {
    if (r.caseId && r.anonymousToken) reportMap.set(r.caseId, r);
  });

  return Array.from(reportMap.values()).sort(
    (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
  );
}

/**
 * 3. Seed data sampel ke Supabase (Bila tabel Supabase masih kosong)
 */
export async function seedMockReportsToSupabase(): Promise<{ success: boolean; count: number; error?: string }> {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return { success: false, count: 0, error: 'Supabase belum dikonfigurasi' };

  try {
    const rows = MOCK_REPORTS.map(reportToDbRow);
    const response = await fetch(`${url}/rest/v1/reports`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=ignore-duplicates,return=representation',
      },
      body: JSON.stringify(rows),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, count: 0, error: errText };
    }

    const inserted = await response.json();
    return { success: true, count: Array.isArray(inserted) ? inserted.length : MOCK_REPORTS.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Error seeding DB' };
  }
}

/**
 * 4. Ambil Laporan Tunggal berdasarkan Token Anonim (untuk /track)
 */
export async function fetchReportByTokenFromDatabase(token: string): Promise<Report | null> {
  const cleanToken = token.trim().toUpperCase();
  const { url, key, isConfigured } = getSupabaseConfig();

  if (isConfigured) {
    try {
      const response = await fetch(
        `${url}/rest/v1/reports?anonymous_token=eq.${encodeURIComponent(cleanToken)}&select=*`,
        {
          method: 'GET',
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const rows = await response.json();
        if (Array.isArray(rows) && rows.length > 0) {
          return dbRowToReport(rows[0]);
        }
      }
    } catch (err) {
      console.warn('Supabase fetch single report failed, checking local:', err);
    }
  }

  // Fallback to local storage & mock reports
  if (typeof window !== 'undefined') {
    const savedStr = localStorage.getItem('aman_kampus_reports');
    if (savedStr) {
      try {
        const parsed: Report[] = JSON.parse(savedStr);
        const match = parsed.find((r) => r.anonymousToken.toUpperCase() === cleanToken);
        if (match) return match;
      } catch (e) {}
    }
  }

  const mockMatch = MOCK_REPORTS.find((r) => r.anonymousToken.toUpperCase() === cleanToken);
  return mockMatch || null;
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

    const response = await fetch(`${url}/rest/v1/reports?case_id=eq.${encodeURIComponent(caseId)}`, {
      method: 'PATCH',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(patchBody),
    });

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
