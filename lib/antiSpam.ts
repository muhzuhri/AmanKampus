/**
 * Modul Proteksi Bot, Anti-Spam & Rate Limiting untuk Formulir Pelaporan Anonim
 */

const SUBMISSION_COOLDOWN_MS = 60 * 1000; // Cooldown 60 detik antar laporan dari perangkat yang sama
const MAX_ATTEMPTS_PER_HOUR = 5;

export interface AntiSpamCheckResult {
  allowed: boolean;
  message?: string;
  cooldownSeconds?: number;
}

/**
 * Memeriksa Rate-Limiting berbasis LocalStorage untuk mencegah spam otomatis dari bot/script
 */
export function checkSubmissionRateLimit(): AntiSpamCheckResult {
  if (typeof window === 'undefined') return { allowed: true };

  const lastSubmitTimeStr = localStorage.getItem('ak_last_submission_time');
  const attemptsStr = localStorage.getItem('ak_submission_attempts');

  const now = Date.now();

  if (lastSubmitTimeStr) {
    const lastSubmitTime = parseInt(lastSubmitTimeStr, 10);
    const timePassed = now - lastSubmitTime;

    if (timePassed < SUBMISSION_COOLDOWN_MS) {
      const remainingSeconds = Math.ceil((SUBMISSION_COOLDOWN_MS - timePassed) / 1000);
      return {
        allowed: false,
        message: `Terlalu banyak percobaaan. Harap tunggu ${remainingSeconds} detik sebelum mengirimkan laporan baru untuk mencegah spam.`,
        cooldownSeconds: remainingSeconds,
      };
    }
  }

  let attempts: { timestamp: number }[] = [];
  if (attemptsStr) {
    try {
      attempts = JSON.parse(attemptsStr);
      // Filter percobaan dalam 1 jam terakhir
      attempts = attempts.filter((a) => now - a.timestamp < 3600 * 1000);
    } catch {
      attempts = [];
    }
  }

  if (attempts.length >= MAX_ATTEMPTS_PER_HOUR) {
    return {
      allowed: false,
      message: 'Batas maksimum laporan (5 laporan/jam) dari perangkat ini tercapai. Harap tunggu beberapa saat.',
    };
  }

  return { allowed: true };
}

/**
 * Mencatat pengiriman laporan baru untuk memperbarui rate-limit
 */
export function recordSubmission(): void {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  localStorage.setItem('ak_last_submission_time', now.toString());

  const attemptsStr = localStorage.getItem('ak_submission_attempts');
  let attempts: { timestamp: number }[] = [];
  if (attemptsStr) {
    try {
      attempts = JSON.parse(attemptsStr);
      attempts = attempts.filter((a) => now - a.timestamp < 3600 * 1000);
    } catch {
      attempts = [];
    }
  }
  attempts.push({ timestamp: now });
  localStorage.setItem('ak_submission_attempts', JSON.stringify(attempts));
}

/**
 * Tantangan Matematika / Nonce Sederhana untuk Verifikasi Manusia (Anti-Bot Challenge)
 */
export function generateHumanChallenge(): { problem: string; answer: number } {
  const num1 = Math.floor(Math.random() * 8) + 2;
  const num2 = Math.floor(Math.random() * 8) + 1;
  return {
    problem: `Berapa ${num1} + ${num2}?`,
    answer: num1 + num2,
  };
}
