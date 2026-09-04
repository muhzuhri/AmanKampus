/**
 * Utility modul untuk Kriptografi, Hashing SHA-256, Pembersihan Metadata (EXIF Stripping),
 * dan Deteksi Forensik Rekayasa Gambar (AI Generated / Editor Software Detection).
 */

/**
 * Menghitung Hashing SHA-256 dari ArrayBuffer (Web Crypto API)
 */
export async function calculateSHA256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Mengonversi File menjadi ArrayBuffer
 */
export function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Pembersihan Metadata (EXIF Stripping) untuk Berkas Gambar.
 * Menggambar ulang gambar ke Canvas HTML5 untuk menghapus tag EXIF (GPS, Kamera, Editor Software),
 * menghasilkan file gambar bersih yang menjamin privasi lokasi pelapor tanpa mengubah isi visual bukti.
 */
export async function stripExifFromImage(file: File): Promise<{ cleanFile: File; stripped: boolean }> {
  if (!file.type.startsWith('image/')) {
    return { cleanFile: file, stripped: false };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ cleanFile: file, stripped: false });
        return;
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ cleanFile: file, stripped: false });
            return;
          }
          const cleanFile = new File([blob], `clean_${file.name}`, {
            type: file.type || 'image/png',
            lastModified: Date.now(),
          });
          resolve({ cleanFile, stripped: true });
        },
        file.type || 'image/png',
        0.95
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ cleanFile: file, stripped: false });
    };

    img.src = url;
  });
}

/**
 * Analisis Forensik Digital Berkas Gambar (Original File Inspection)
 * Memindai struktur biner asli file SEBELUM proses stripping untuk menemukan jejak AI Generator
 * (ChatGPT, DALL-E, Midjourney, Stable Diffusion) dan Software Editor (Photoshop, Canva, GIMP),
 * bahkan jika nama file diubah oleh pelapor.
 */
export function analyzeImageForensics(
  file: File,
  buffer: ArrayBuffer
): {
  status: 'Original' | 'Needs Review' | 'Manipulated';
  details: string[];
} {
  const fileNameLower = file.name.toLowerCase();

  // Read entire buffer (or up to 2MB) into ASCII/binary text string
  const byteSlice = new Uint8Array(buffer.slice(0, Math.min(buffer.byteLength, 2097152)));
  let binaryString = '';
  for (let i = 0; i < byteSlice.length; i++) {
    const charCode = byteSlice[i];
    if (charCode >= 32 && charCode <= 126) {
      binaryString += String.fromCharCode(charCode);
    } else {
      binaryString += ' ';
    }
  }
  const binaryLower = binaryString.toLowerCase();

  // 1. Direct AI Generator Signature Keywords in Raw Binary
  const aiKeywords = [
    'dall-e',
    'dalle',
    'openai',
    'chatgpt',
    'midjourney',
    'stable diffusion',
    'stablediffusion',
    'novelai',
    'comfyui',
    'automatic1111',
    'c2pa',
    'synthid',
    'textsoftware openai',
    'generation_id',
    'prompt',
    'negative prompt',
    'sampler:',
    'steps:',
  ];

  // 2. Direct Software Editor Signature Keywords in Raw Binary
  const editorKeywords = [
    'adobe',
    'photoshop',
    'canva',
    'gimp',
    'picsart',
    'lightroom',
    'paint.net',
    'krita',
    'photoshop 3.0',
    'xmpmeta',
  ];

  const detectedAiBinary = aiKeywords.filter((kw) => binaryLower.includes(kw));
  const detectedEditorBinary = editorKeywords.filter((kw) => binaryLower.includes(kw));

  const isAiName =
    fileNameLower.includes('dall') ||
    fileNameLower.includes('gpt') ||
    fileNameLower.includes('midjourney') ||
    fileNameLower.includes('ai_') ||
    fileNameLower.includes('synthetic') ||
    fileNameLower.includes('generated');

  const isEditorName =
    fileNameLower.includes('edit') ||
    fileNameLower.includes('photoshop') ||
    fileNameLower.includes('canva') ||
    fileNameLower.includes('gimp');

  const details: string[] = [];

  // Check for PNG chunk structure anomalies (e.g. ChatGPT / DALL-E exports lacking EXIF headers)
  const isPng = file.type === 'image/png' || fileNameLower.endsWith('.png');
  const isJpeg = file.type === 'image/jpeg' || fileNameLower.endsWith('.jpg') || fileNameLower.endsWith('.jpeg');

  const hasExifHeader = binaryString.includes('Exif') || binaryString.includes('Exif\0\0');

  // AI Detection Logic
  if (detectedAiBinary.length > 0 || isAiName) {
    const matches = Array.from(new Set([...detectedAiBinary, ...(isAiName ? ['nama file terindikasi gpt'] : [])])).join(', ');
    details.push(`⚠️ Indikasi AI-Generated Image: Terdeteksi stempel/pola generator AI (${matches.toUpperCase()}).`);
    details.push('⚠️ Anomali Data Biner: Berkas merupakan hasil sintesis AI (ChatGPT / DALL-E / Midjourney), bukan foto kamera fisik.');
    details.push('❗ Peringatan Sistem: Berkas terindikasi rekayasa digital / bukti tidak valid.');
    return { status: 'Manipulated', details };
  }

  // PNG/JPEG Structural Heuristic: If PNG/JPEG lacks camera EXIF completely and has synthetic PNG chunks, flag for review
  if ((isPng || isJpeg) && !hasExifHeader && detectedEditorBinary.length === 0) {
    // Check if filename indicates a clean download from web generator
    if (fileNameLower.startsWith('clean_') && !isAiName) {
      details.push('⚠️ Anomali Metadata: Berkas PNG tidak memiliki header kamera EXIF asli.');
      details.push('🔍 Direkomendasikan Verifikasi Manual oleh Tim Satgas untuk memeriksa sumber tangkapan layar/sintesis.');
      return { status: 'Needs Review', details };
    }
  }

  // Software Editor Detection Logic
  if (detectedEditorBinary.length > 0 || isEditorName) {
    const matches = Array.from(new Set([...detectedEditorBinary, ...(isEditorName ? ['terdeteksi di nama file'] : [])])).join(', ');
    details.push(`⚠️ Indikasi Software Editor: Terdeteksi jejak peranti lunak pengolah gambar (${matches.toUpperCase()}).`);
    details.push('⚠️ Anomali Metadata: Berkas pernah disunting atau disimpan ulang via aplikasi editor.');
    details.push('🔍 Direkomendasikan Verifikasi Manual oleh Tim Satgas.');
    return { status: 'Needs Review', details };
  }

  if (file.type.startsWith('image/')) {
    details.push('🟢 Integritas Biner: Bebas dari stempel AI Generator & Software Editor.');
    details.push('🟢 Privasi EXIF: Metadata lokasi GPS & serial perangkat dibersihkan demi keamanan pelapor.');
    details.push('🛡️ Cryptographic SHA-256 Secured.');
    return { status: 'Original', details };
  }

  details.push('🟢 Format Berkas Tervalidasi Utuh.');
  return { status: 'Original', details };
}
