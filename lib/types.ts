// Shared types for the AmanKampus reporting system

// ─── Status ────────────────────────────────────────────────────────────────

/** Status yang tersedia untuk laporan */
export type CaseStatus =
  | 'Laporan Diterima'  // status awal – dari formulir mahasiswa
  | 'Diverifikasi'      // satgas sudah memverifikasi laporan
  | 'Diproses'          // sedang dalam penyelidikan
  | 'Mediasi & Konseling'  // penanganan secara psikologis/sosial
  | 'Eskalasi ke Komite Etik' // penanganan disipliner kampus
  | 'Selesai';          // kasus ditutup

// ─── Chat & Audit ──────────────────────────────────────────────────────────

export type Message = {
  id: string;
  sender: 'Pelapor' | 'Satgas';
  text: string;
  timestamp: string; // ISO string
};

export type AuditLog = {
  id: string;
  action: string;
  actor: 'Sistem' | 'Satgas' | 'Pelapor';
  timestamp: string; // ISO string
};

// ─── Evidence & Forensics ──────────────────────────────────────────────────

/** Status Verifikasi Bukti oleh Satgas */
export type EvidenceVerificationStatus =
  | 'Belum Diverifikasi'
  | 'Terverifikasi Valid'
  | 'Tervalidasi Palsu / Ditolak';

/** Metadata bukti yang diunggah pelapor */
export type Evidence = {
  /** Identitas unik file bukti */
  evidenceId: string;
  /** Nama asli file */
  fileName: string;
  /** Tipe MIME file */
  fileType: string;
  /** Ukuran file dalam bytes */
  fileSize: number;
  /** SHA-256 hash (hex) dari isi file – untuk verifikasi integritas mutlak */
  sha256: string;
  /** Flag jika EXIF metadata lokasi/perangkat telah dibersihkan demi privasi */
  exifStripped?: boolean;
  /** Data URL (base64) gambar asli / file asli untuk diunduh admin secara utuh */
  dataUrl?: string;
  /** Flag jika file diambil real-time dari kamera */
  isLiveCapture?: boolean;
  /** Status AI Forensic */
  forensicStatus?: 'Original' | 'Needs Review' | 'Manipulated';
  /** Detail forensic (contoh: log EXIF, GPS, SHA256 integrity, dll) */
  forensicDetails?: string[];
  /** Catatan / Alasan tambahan dari Pelapor mengenai berkas bukti */
  reporterNote?: string;
  /** Status keputusan verifikasi keaslian bukti dari Satgas PPKS */
  verificationStatus?: EvidenceVerificationStatus;
  /** Catatan penilaian keaslian bukti oleh Satgas */
  verificationNote?: string;
};

// ─── Report ────────────────────────────────────────────────────────────────

/** Laporan lengkap yang tersimpan di sistem */
export type Report = {
  /** Case ID unik, contoh: CASE-2026-00001 */
  caseId: string;
  /** Token anonim pelapor, contoh: AK-2026-X7K92 */
  anonymousToken: string;

  /** Kategori kasus */
  category: string;
  /** Kronologi kejadian */
  chronology: string;
  /** Waktu kejadian (string ISO atau deskripsi) */
  incidentTime: string;
  /** Pihak yang terlibat (opsional, hanya deskripsi umum) */
  involvedParties?: string;
  /** Lingkup / Fakultas (opsional) */
  targetFaculty?: string;

  /** Daftar bukti yang diunggah */
  evidences: Evidence[];

  /** Pesan komunikasi dua arah */
  messages?: Message[];
  /** Riwayat jejak audit */
  auditLogs?: AuditLog[];

  /** Waktu laporan diterima sistem (ISO string) */
  receivedAt: string;
  /** Status saat ini */
  status: CaseStatus;

  /** Apakah pelapor bersifat anonim (selalu true pada fase ini) */
  isAnonymous: true;
};

// ─── Mock Data ─────────────────────────────────────────────────────────────

export const MOCK_REPORTS: Report[] = [
  {
    caseId: 'CASE-2026-00001',
    anonymousToken: 'AK-2026-X9K2P',
    category: 'Perundungan Verbal',
    chronology:
      'Saya mengalami perundungan verbal di area kantin oleh senior yang mengancam jika saya melaporkan kejadian perploncoan orientasi fakultas.',
    incidentTime: '1 September 2026, sekitar pukul 12.00',
    involvedParties: 'Senior mahasiswa angkatan 2024, lokasi kantin utama',
    targetFaculty: 'Fakultas Teknik',
    evidences: [
      {
        evidenceId: 'EVD-1001',
        fileName: 'tangkapan_layar_chat_ancaman.png',
        fileType: 'image/png',
        fileSize: 450120,
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        exifStripped: true,
        forensicStatus: 'Original',
        forensicDetails: [
          'SHA-256 Hash: Tervalidasi Utuh & Bebas Perubahan Byte',
          'Pembersihan EXIF: Lokasi & Perangkat Dibersihkan',
          'Struktur Berkas: Native Image Format',
        ],
        reporterNote: 'Tangkapan layar chat dari grup angkatan.',
        verificationStatus: 'Terverifikasi Valid',
        verificationNote: 'Tercatat timestamp konsisten dengan laporan saksi pendukung.',
      },
    ],
    receivedAt: '2026-09-02T06:00:00.000Z',
    status: 'Diproses',
    isAnonymous: true,
  },
  {
    caseId: 'CASE-2026-00002',
    anonymousToken: 'AK-2026-B4M1L',
    category: 'Pelecehan Seksual Daring',
    chronology:
      'Menerima pesan tidak pantas dari asisten lab melalui platform komunikasi tidak resmi.',
    incidentTime: '31 Agustus 2026',
    involvedParties: 'Asisten laboratorium (tidak disebutkan nama)',
    targetFaculty: 'Fakultas MIPA',
    evidences: [],
    receivedAt: '2026-09-01T09:30:00.000Z',
    status: 'Laporan Diterima',
    isAnonymous: true,
  },
  {
    caseId: 'CASE-2026-00003',
    anonymousToken: 'AK-2026-T7Q9X',
    category: 'Intimidasi Akademik',
    chronology:
      'Nilai saya diancam akan diturunkan jika tidak mengerjakan tugas kelompok atas nama orang lain.',
    incidentTime: '28 Agustus 2026',
    involvedParties: 'Dosen pengampu mata kuliah tertentu',
    targetFaculty: 'Fakultas Ekonomi',
    evidences: [],
    receivedAt: '2026-08-30T15:00:00.000Z',
    status: 'Selesai',
    isAnonymous: true,
  },
];
