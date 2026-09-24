-- ============================================================================
-- AMANKAMPUS SUPABASE DATABASE SCHEMA SETUP
-- Jalankan skrip ini di Supabase Dashboard -> SQL Editor -> Run
-- ============================================================================

-- 1. Buat Tabel 'reports'
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id TEXT NOT NULL UNIQUE,
    anonymous_token TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    incident_time TEXT,
    involved_parties TEXT,
    target_faculty TEXT,
    chronology TEXT NOT NULL,
    evidences JSONB DEFAULT '[]'::jsonb,
    messages JSONB DEFAULT '[]'::jsonb,
    audit_logs JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'Laporan Diterima',
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_anonymous BOOLEAN DEFAULT true,
    abuse_flags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan Keamanan RLS (Row Level Security)

-- Kebijakan 1: Siapapun (Publik & Anonim) dapat mengirimkan laporan baru (INSERT)
DROP POLICY IF EXISTS "Allow public insert to reports" ON public.reports;
CREATE POLICY "Allow public insert to reports"
ON public.reports
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Kebijakan 2: Siapapun (Pelapor untuk Lacak & Admin) dapat membaca laporan (SELECT)
DROP POLICY IF EXISTS "Allow public read of reports" ON public.reports;
CREATE POLICY "Allow public read of reports"
ON public.reports
FOR SELECT
TO anon, authenticated
USING (true);

-- Kebijakan 3: Siapapun (Admin & Pelapor untuk Chat) dapat mengunggah pembaruan status / pesan (UPDATE)
DROP POLICY IF EXISTS "Allow public update of reports" ON public.reports;
CREATE POLICY "Allow public update of reports"
ON public.reports
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Indexing untuk pencarian cepat berdasarkan token anonim & case_id
CREATE INDEX IF NOT EXISTS idx_reports_anonymous_token ON public.reports(anonymous_token);
CREATE INDEX IF NOT EXISTS idx_reports_case_id ON public.reports(case_id);
CREATE INDEX IF NOT EXISTS idx_reports_received_at ON public.reports(received_at DESC);
