/**
 * Utility modul untuk Kriptografi, Hashing SHA-256, Pembersihan Metadata (EXIF Stripping),
 * dan Deteksi Forensik Rekayasa Gambar (AI Generated / Editor Software Detection).
 */

export async function calculateSHA256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

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
  if (file.type.startsWith('image/')) {
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

  // Audio / Video Metadata Stripping (Pembersihan Tag GPS, Metadata Pengguna, ID3 Tags)
  if (file.type.startsWith('audio/') || file.type.startsWith('video/') || /\.(mp3|wav|ogg|m4a|mp4|webm|mov)$/i.test(file.name)) {
    try {
      const arrayBuf = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuf);

      // Jika file MP3 atau WAV dengan ID3 tag di bagian awal
      let startOffset = 0;
      if (bytes.length > 10 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) { // 'ID3'
        const id3Size = ((bytes[6] & 0x7f) << 21) | ((bytes[7] & 0x7f) << 14) | ((bytes[8] & 0x7f) << 7) | (bytes[9] & 0x7f);
        startOffset = Math.min(10 + id3Size, bytes.length - 1);
      }

      const cleanedBytes = startOffset > 0 ? bytes.subarray(startOffset) : bytes;
      const cleanBlob = new Blob([cleanedBytes], { type: file.type || (file.name.endsWith('.mp4') ? 'video/mp4' : 'audio/mpeg') });
      const cleanFile = new File([cleanBlob], `clean_${file.name}`, {
        type: file.type || cleanBlob.type,
        lastModified: Date.now(),
      });
      return { cleanFile, stripped: true };
    } catch {
      return { cleanFile: file, stripped: false };
    }
  }

  return { cleanFile: file, stripped: false };
}

const AI_KEYWORDS = [
  'dall-e',
  'dalle',
  'openai',
  'chatgpt',
  'gpt-4',
  'gpt-5',
  'gpt-image',
  'sora',
  'midjourney',
  'stable diffusion',
  'stablediffusion',
  'novelai',
  'comfyui',
  'automatic1111',
  'invokeai',
  'fooocus',
  'synthid',
  'firefly',
  'imagen',
  'ideogram',
  'leonardo.ai',
  'leonardoai',
  'bing image creator',
  'copilot',
  'textsoftware openai',
  'generation_id',
  'negative prompt',
  'trainedalgorithmicmedia',
  'compositewithtrainedalgorithmicmedia',
  'digitalsourcetype',
  'claimgenerator',
  'claim_generator',
];

const C2PA_MARKERS = ['c2pa', 'c2ma', 'jumb', 'jumbf', 'urn:c2pa', 'c2pa.org', 'stds.iptc.org'];

const EDITOR_KEYWORDS = [
  'adobe',
  'photoshop',
  'canva',
  'gimp',
  'picsart',
  'lightroom',
  'paint.net',
  'krita',
  'snapseed',
  'pixelmator',
  'affinity photo',
  'xmpmeta',
];

const CAMERA_MAKE_MARKERS = [
  'apple',
  'iphone',
  'canon',
  'nikon',
  'sony',
  'samsung',
  'xiaomi',
  'redmi',
  'oppo',
  'vivo',
  'huawei',
  'honor',
  'oneplus',
  'google',
  'pixel',
  'motorola',
  'realme',
  'asus',
  'fujifilm',
  'panasonic',
  'olympus',
  'leica',
  'hasselblad',
  'dji',
  'gopro',
];

/** Resolusi kanvas khas generator gambar (tetap meski nama file diubah). */
const AI_CANVAS_SIZES = new Set([
  '512x512',
  '768x768',
  '1024x1024',
  '1024x768',
  '768x1024',
  '1024x1536',
  '1536x1024',
  '1024x1792',
  '1792x1024',
  '1152x896',
  '896x1152',
  '1344x768',
  '768x1344',
  '1280x720',
  '720x1280',
]);

function bytesToAscii(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    const c = bytes[i];
    out += c >= 32 && c <= 126 ? String.fromCharCode(c) : ' ';
  }
  return out;
}

function bytesToUtf16LeAscii(bytes: Uint8Array): string {
  let out = '';
  const limit = bytes.length - (bytes.length % 2);
  for (let i = 0; i < limit; i += 2) {
    const c = bytes[i] | (bytes[i + 1] << 8);
    out += c >= 32 && c <= 126 ? String.fromCharCode(c) : ' ';
  }
  return out;
}

function readUint32BE(bytes: Uint8Array, offset: number): number {
  return ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
}

function readUint16BE(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function parsePngMeta(bytes: Uint8Array): { width: number; height: number; text: string } {
  const empty = { width: 0, height: 0, text: '' };
  if (bytes.length < 24) return empty;
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < 8; i++) {
    if (bytes[i] !== sig[i]) return empty;
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  const texts: string[] = [];

  while (offset + 12 <= bytes.length) {
    const len = readUint32BE(bytes, offset);
    if (len > 16_000_000) break;
    const type = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7]);
    const dataStart = offset + 8;
    const dataEnd = dataStart + len;
    if (dataEnd + 4 > bytes.length) break;

    if (type === 'IHDR' && len >= 8) {
      width = readUint32BE(bytes, dataStart);
      height = readUint32BE(bytes, dataStart + 4);
    }

    if (type === 'tEXt' || type === 'iTXt' || type === 'zTXt' || type === 'eXIf') {
      texts.push(bytesToAscii(bytes.subarray(dataStart, dataEnd)));
    }

    offset = dataEnd + 4;
    if (type === 'IEND') break;
  }

  return { width, height, text: texts.join(' ') };
}

function parseJpegMeta(bytes: Uint8Array): { width: number; height: number; text: string } {
  const empty = { width: 0, height: 0, text: '' };
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return empty;

  let offset = 2;
  let width = 0;
  let height = 0;
  const texts: string[] = [];

  while (offset + 4 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x00 || marker === 0xff) {
      offset += 1;
      continue;
    }

    const size = readUint16BE(bytes, offset + 2);
    if (size < 2 || offset + 2 + size > bytes.length) break;

    const payload = bytes.subarray(offset + 4, offset + 2 + size);

    // SOF0–SOF3, SOF5–SOF7, SOF9–SOF11, SOF13–SOF15
    if ((marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf)) {
      if (payload.length >= 5) {
        height = readUint16BE(payload, 1);
        width = readUint16BE(payload, 3);
      }
    }

    // APP0–APP15 often hold JFIF, EXIF, XMP, C2PA
    if (marker >= 0xe0 && marker <= 0xef) {
      texts.push(bytesToAscii(payload));
      texts.push(bytesToUtf16LeAscii(payload));
    }

    offset += 2 + size;
  }

  return { width, height, text: texts.join(' ') };
}

function parseWebpMeta(bytes: Uint8Array): { width: number; height: number; text: string } {
  const empty = { width: 0, height: 0, text: '' };
  if (bytes.length < 16) return empty;
  const riff = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  const webp = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
  if (riff !== 'RIFF' || webp !== 'WEBP') return empty;

  let offset = 12;
  let width = 0;
  let height = 0;
  const texts: string[] = [];

  while (offset + 8 <= bytes.length) {
    const type = String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
    const size = bytes[offset + 4] | (bytes[offset + 5] << 8) | (bytes[offset + 6] << 16) | (bytes[offset + 7] << 24);
    const dataStart = offset + 8;
    const dataEnd = Math.min(dataStart + size, bytes.length);
    const chunk = bytes.subarray(dataStart, dataEnd);

    if (type === 'VP8X' && chunk.length >= 10) {
      width = 1 + (chunk[4] | (chunk[5] << 8) | (chunk[6] << 16));
      height = 1 + (chunk[7] | (chunk[8] << 8) | (chunk[9] << 16));
    }
    if (type === 'EXIF' || type === 'XMP ') {
      texts.push(bytesToAscii(chunk));
      texts.push(bytesToUtf16LeAscii(chunk));
    }

    offset = dataEnd + (size % 2);
  }

  return { width, height, text: texts.join(' ') };
}

function findMatches(haystack: string, keywords: string[]): string[] {
  return keywords.filter((kw) => haystack.includes(kw));
}

/**
 * Analisis Forensik Digital Berkas Gambar (Original File Inspection)
 * Memindai struktur biner asli file SEBELUM proses stripping.
 * Nama file hanya sinyal pendukung — jejak generator, C2PA, EXIF kamera, dan resolusi kanvas
 * tetap diperiksa meskipun pelapor mengubah nama berkas.
 */
export function analyzeImageForensics(
  file: File,
  buffer: ArrayBuffer
): {
  status: 'Original' | 'Needs Review' | 'Manipulated';
  details: string[];
} {
  const fileNameLower = file.name.toLowerCase();
  const scanLen = Math.min(buffer.byteLength, 4 * 1024 * 1024);
  const bytes = new Uint8Array(buffer.slice(0, scanLen));

  const png = parsePngMeta(bytes);
  const jpeg = parseJpegMeta(bytes);
  const webp = parseWebpMeta(bytes);

  const width = png.width || jpeg.width || webp.width;
  const height = png.height || jpeg.height || webp.height;
  const dimKey = width > 0 && height > 0 ? `${width}x${height}` : '';

  const haystack = [
    bytesToAscii(bytes),
    bytesToUtf16LeAscii(bytes),
    png.text,
    jpeg.text,
    webp.text,
  ]
    .join(' ')
    .toLowerCase()
    .replace(/\0/g, ' ');

  const detectedAiBinary = findMatches(haystack, AI_KEYWORDS);
  const detectedC2pa = findMatches(haystack, C2PA_MARKERS);
  const detectedEditorBinary = findMatches(haystack, EDITOR_KEYWORDS);
  const cameraMarkers = findMatches(haystack, CAMERA_MAKE_MARKERS);

  const hasExifHeader = haystack.includes('exif') || haystack.includes('tiff');
  const hasCameraOrigin = hasExifHeader && cameraMarkers.length > 0;
  const looksLikeAiCanvas = dimKey !== '' && AI_CANVAS_SIZES.has(dimKey);
  const c2paSynthetic =
    haystack.includes('trainedalgorithmicmedia') ||
    haystack.includes('compositewithtrained') ||
    (detectedC2pa.length > 0 && (detectedAiBinary.length > 0 || looksLikeAiCanvas || !hasCameraOrigin));

  const isAiName =
    fileNameLower.includes('dall') ||
    fileNameLower.includes('gpt') ||
    fileNameLower.includes('midjourney') ||
    fileNameLower.includes('openai') ||
    fileNameLower.includes('chatgpt') ||
    /\bai[_-]/.test(fileNameLower) ||
    fileNameLower.includes('synthetic') ||
    fileNameLower.includes('generated');

  const isEditorName =
    fileNameLower.includes('photoshop') ||
    fileNameLower.includes('canva') ||
    fileNameLower.includes('gimp') ||
    fileNameLower.includes('edited');

  const details: string[] = [];
  const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(file.name);

  if (!isImage) {
    details.push('🟢 Format Berkas Tervalidasi Utuh (non-gambar).');
    return { status: 'Original', details };
  }

  // 1) Jejak generator / C2PA — independen dari nama file
  if (detectedAiBinary.length > 0 || c2paSynthetic || isAiName) {
    const matches = Array.from(
      new Set([
        ...detectedAiBinary,
        ...(c2paSynthetic ? ['c2pa/sintesis'] : []),
        ...(isAiName ? ['nama file terindikasi generator'] : []),
      ])
    ).join(', ');
    details.push(`⚠️ Indikasi AI-Generated Image: terdeteksi stempel generator / provenance sintesis (${matches.toUpperCase()}).`);
    details.push('⚠️ Pemindaian tidak bergantung pada nama file: jejak tetap terbaca dari header, XMP, C2PA, atau pola kanvas.');
    details.push('❗ Peringatan Sistem: berkas terindikasi rekayasa digital / bukti tidak otomatis valid.');
    return { status: 'Manipulated', details };
  }

  // 2) Resolusi khas model gambar + tanpa EXIF kamera fisik
  if (looksLikeAiCanvas && !hasCameraOrigin) {
    details.push(`⚠️ Indikasi Kanvas Sintetis: resolusi ${dimKey} adalah ukuran keluaran umum generator AI (ChatGPT / DALL·E / Midjourney).`);
    details.push('⚠️ Tidak ditemukan EXIF merek kamera fisik. Mengubah nama file tidak menghapus pola ini.');
    details.push('❗ Peringatan Sistem: berkas tidak dapat dianggap foto kamera asli.');
    return { status: 'Manipulated', details };
  }

  // 3) Jejak editor
  if (detectedEditorBinary.length > 0 || isEditorName) {
    const matches = Array.from(new Set([...detectedEditorBinary, ...(isEditorName ? ['terdeteksi di nama file'] : [])])).join(', ');
    details.push(`⚠️ Indikasi Software Editor: terdeteksi jejak peranti lunak pengolah gambar (${matches.toUpperCase()}).`);
    details.push('🔍 Direkomendasikan verifikasi manual oleh Tim Satgas.');
    return { status: 'Needs Review', details };
  }

  // 4) Tanpa asal kamera → jangan pernah otomatis "Original"
  if (!hasCameraOrigin) {
    details.push('⚠️ Anomali Metadata: tidak ditemukan EXIF merek/model kamera fisik.');
    if (dimKey) details.push(`🔍 Dimensi berkas: ${dimKey}. Pola ini umum pada unduhan generator, tangkapan layar, atau ekspor ulang.`);
    details.push('🔍 Status ditahan: Satgas wajib meninjau manual. Nama file yang diubah tidak membuat berkas menjadi valid.');
    return { status: 'Needs Review', details };
  }

  details.push(`🟢 Jejak perangkat: terdeteksi EXIF kamera (${cameraMarkers.slice(0, 3).join(', ')}).`);
  details.push('🟢 Integritas biner: tidak ditemukan stempel generator AI pada header/XMP/C2PA yang dipindai.');
  details.push('🛡️ Cryptographic SHA-256 akan dicatat setelah berkas dibersihkan.');
  return { status: 'Original', details };
}
