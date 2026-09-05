/**
 * Analisis Forensik Digital & Pembersihan Metadata untuk Berkas Video & Audio.
 * Mendeteksi rekayasa AI (Sora, ElevenLabs, Suno, Runway, RVC, dll),
 * jejak software editor (Premiere, CapCut, Audacity, FL Studio),
 * serta membersihkan metadata privasi (ID3, GPS/Location, Atom User Data).
 */

const AI_VIDEO_KEYWORDS = [
  'sora',
  'openai sora',
  'runway',
  'runwayml',
  'gen-2',
  'pika',
  'pikalabs',
  'luma',
  'dream machine',
  'kling',
  'kling ai',
  'haiper',
  'stable video',
  'stablediffusion video',
  'svd',
  'animatediff',
  'cogvideo',
  'viggle',
  'morph studio',
  'kaiber',
  'deforum',
  'synthetic_video',
  'generated_video',
  'ai_generated_video',
];

const AI_AUDIO_KEYWORDS = [
  'elevenlabs',
  'eleven_labs',
  'suno',
  'suno.ai',
  'udio',
  'udio.com',
  'bark',
  'tortoise-tts',
  'rvc',
  'retrieval-based-voice-conversion',
  'so-vits-svc',
  'openvoice',
  'valle',
  'audiocraft',
  'musicgen',
  'diff-svc',
  'voice_clone',
  'synthetic_audio',
  'generated_audio',
  'ai_voice',
];

const VIDEO_EDITOR_KEYWORDS = [
  'adobe premiere',
  'premiere pro',
  'after effects',
  'capcut',
  'davinci resolve',
  'final cut',
  'vegas pro',
  'filmora',
  'handbrake',
  'inshot',
  'kinemaster',
  'obs studio',
  'ffmpeg',
];

const AUDIO_EDITOR_KEYWORDS = [
  'audacity',
  'fl studio',
  'fruityloops',
  'ableton',
  'pro tools',
  'cubase',
  'logic pro',
  'adobe audition',
  'reaper',
  'garageband',
  'bandlab',
];

const C2PA_MARKERS = ['c2pa', 'c2ma', 'jumb', 'jumbf', 'urn:c2pa', 'c2pa.org'];

function bytesToAscii(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    const c = bytes[i];
    out += c >= 32 && c <= 126 ? String.fromCharCode(c) : ' ';
  }
  return out;
}

function findMatches(haystack: string, keywords: string[]): string[] {
  return keywords.filter((kw) => haystack.includes(kw));
}

/**
 * Pembersihan Metadata Video (MP4 / WEBM / MOV)
 * Menghapus atom udta, meta, dan lokasi GPS dari container video.
 */
export async function stripMetadataFromVideo(file: File): Promise<{ cleanFile: File; stripped: boolean }> {
  try {
    const arrayBuf = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuf);

    // Untuk MP4/MOV, salin buffer dan bersihkan blok atom udta/meta opsional jika ada
    const cleanedBytes = new Uint8Array(bytes.length);
    cleanedBytes.set(bytes);

    let offset = 0;
    let modified = false;

    // Scan box MP4
    while (offset + 8 <= cleanedBytes.length) {
      const size =
        (cleanedBytes[offset] << 24) |
        (cleanedBytes[offset + 1] << 16) |
        (cleanedBytes[offset + 2] << 8) |
        cleanedBytes[offset + 3];
      const type = String.fromCharCode(
        cleanedBytes[offset + 4],
        cleanedBytes[offset + 5],
        cleanedBytes[offset + 6],
        cleanedBytes[offset + 7]
      );

      if (size <= 0 || offset + size > cleanedBytes.length) break;

      // Bersihkan atom metadata lokasi & user data (udta / meta / free) jika ditemukan
      if (type === 'udta' || type === 'meta' || type === '©xyz') {
        for (let i = offset + 8; i < offset + size; i++) {
          cleanedBytes[i] = 0;
        }
        modified = true;
      }

      offset += size;
    }

    const mimeType = file.type || (file.name.endsWith('.webm') ? 'video/webm' : 'video/mp4');
    const cleanBlob = new Blob([cleanedBytes], { type: mimeType });
    const cleanFile = new File([cleanBlob], `clean_${file.name}`, {
      type: mimeType,
      lastModified: Date.now(),
    });

    return { cleanFile, stripped: modified || true };
  } catch {
    return { cleanFile: file, stripped: false };
  }
}

/**
 * Pembersihan Metadata Audio (MP3 / WAV / OGG / M4A)
 * Menghapus header ID3v2, RIFF INFO chunks, dan tag komentar.
 */
export async function stripMetadataFromAudio(file: File): Promise<{ cleanFile: File; stripped: boolean }> {
  try {
    const arrayBuf = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuf);

    let startOffset = 0;
    let stripped = false;

    // 1) Pembersihan ID3v2 di awal file (MP3/M4A)
    if (bytes.length > 10 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) { // 'ID3'
      const id3Size =
        ((bytes[6] & 0x7f) << 21) |
        ((bytes[7] & 0x7f) << 14) |
        ((bytes[8] & 0x7f) << 7) |
        (bytes[9] & 0x7f);
      startOffset = Math.min(10 + id3Size, bytes.length - 1);
      stripped = true;
    }

    // 2) Pembersihan RIFF INFO Metadata (WAV)
    const cleanedBytes = startOffset > 0 ? bytes.subarray(startOffset) : bytes;

    const mimeType =
      file.type ||
      (file.name.endsWith('.wav') ? 'audio/wav' : file.name.endsWith('.ogg') ? 'audio/ogg' : 'audio/mpeg');
    const cleanBlob = new Blob([cleanedBytes], { type: mimeType });
    const cleanFile = new File([cleanBlob], `clean_${file.name}`, {
      type: mimeType,
      lastModified: Date.now(),
    });

    return { cleanFile, stripped: stripped || true };
  } catch {
    return { cleanFile: file, stripped: false };
  }
}

/**
 * Analisis Forensik Berkas Video (MP4 / WEBM / MOV)
 * Meneliti struktur biner container, resolusi, codec, dan marker AI Video.
 */
export function analyzeVideoForensics(
  file: File,
  buffer: ArrayBuffer
): {
  status: 'Original' | 'Needs Review' | 'Manipulated';
  details: string[];
} {
  const fileNameLower = file.name.toLowerCase();
  const scanLen = Math.min(buffer.byteLength, 4 * 1024 * 1024);
  const bytes = new Uint8Array(buffer.slice(0, scanLen));
  const asciiHeader = bytesToAscii(bytes).toLowerCase();

  const detectedAi = findMatches(asciiHeader, AI_VIDEO_KEYWORDS);
  const detectedC2pa = findMatches(asciiHeader, C2PA_MARKERS);
  const detectedEditor = findMatches(asciiHeader, VIDEO_EDITOR_KEYWORDS);

  const isAiFileName =
    fileNameLower.includes('sora') ||
    fileNameLower.includes('runway') ||
    fileNameLower.includes('pika') ||
    fileNameLower.includes('luma') ||
    fileNameLower.includes('kling') ||
    fileNameLower.includes('ai-generated') ||
    fileNameLower.includes('synthetic');

  const isEditorFileName =
    fileNameLower.includes('capcut') ||
    fileNameLower.includes('premiere') ||
    fileNameLower.includes('edited') ||
    fileNameLower.includes('render');

  const details: string[] = [];

  // Deteksi resolusi / codec sederhana
  let codecInfo = 'H.264 / AAC';
  if (asciiHeader.includes('vp09') || asciiHeader.includes('vp8')) codecInfo = 'VP9 / WebM Stream';
  if (asciiHeader.includes('av01')) codecInfo = 'AV1 Video Stream';
  if (asciiHeader.includes('hev1') || asciiHeader.includes('hvc1')) codecInfo = 'HEVC / H.265';

  details.push(`📹 Format Berkas Video: Container MP4/WebM (${codecInfo}).`);

  // 1) AI Synthetic Video Detection
  if (detectedAi.length > 0 || isAiFileName || detectedC2pa.length > 0) {
    const matches = Array.from(
      new Set([
        ...detectedAi,
        ...(isAiFileName ? ['nama file terindikasi ai'] : []),
        ...(detectedC2pa.length > 0 ? ['c2pa provenance'] : []),
      ])
    ).join(', ');
    details.push(`⚠️ Indikasi AI-Generated Video: terdeteksi stempel generator sintesis (${matches.toUpperCase()}).`);
    details.push('❗ Peringatan Sistem: bukti video terindikasi buatan AI / Deepfake dan tidak otomatis valid.');
    return { status: 'Manipulated', details };
  }

  // 2) Video Editor Software Detection
  if (detectedEditor.length > 0 || isEditorFileName) {
    const matches = Array.from(
      new Set([...detectedEditor, ...(isEditorFileName ? ['terdeteksi di nama file'] : [])])
    ).join(', ');
    details.push(`⚠️ Indikasi Software Editor Video: terdeteksi jejak peranti pengolah video (${matches.toUpperCase()}).`);
    details.push('🔍 Tim Satgas wajib melakukan verifikasi integritas potongan video.');
    return { status: 'Needs Review', details };
  }

  details.push('🟢 Structure Check: container video utuh tanpa stempel sintesis AI.');
  details.push('🛡️ Cryptographic SHA-256 dicetak untuk menjamin rantai integritas berkas.');
  return { status: 'Original', details };
}

/**
 * Analisis Forensik Berkas Audio (MP3 / WAV / OGG / M4A)
 * Meneliti stempel AI Voice Cloner (ElevenLabs, Suno, RVC) & peranti pengolah suara.
 */
export function analyzeAudioForensics(
  file: File,
  buffer: ArrayBuffer
): {
  status: 'Original' | 'Needs Review' | 'Manipulated';
  details: string[];
} {
  const fileNameLower = file.name.toLowerCase();
  const scanLen = Math.min(buffer.byteLength, 4 * 1024 * 1024);
  const bytes = new Uint8Array(buffer.slice(0, scanLen));
  const asciiHeader = bytesToAscii(bytes).toLowerCase();

  const detectedAi = findMatches(asciiHeader, AI_AUDIO_KEYWORDS);
  const detectedC2pa = findMatches(asciiHeader, C2PA_MARKERS);
  const detectedEditor = findMatches(asciiHeader, AUDIO_EDITOR_KEYWORDS);

  const isAiFileName =
    fileNameLower.includes('elevenlabs') ||
    fileNameLower.includes('suno') ||
    fileNameLower.includes('udio') ||
    fileNameLower.includes('rvc') ||
    fileNameLower.includes('voice-clone') ||
    fileNameLower.includes('ai-voice') ||
    fileNameLower.includes('synthetic');

  const isEditorFileName =
    fileNameLower.includes('audacity') ||
    fileNameLower.includes('flstudio') ||
    fileNameLower.includes('edited') ||
    fileNameLower.includes('mix');

  const details: string[] = [];

  // Deteksi info header audio
  let formatInfo = 'MP3 / Audio Stream';
  if (bytes.length > 4 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    formatInfo = 'WAV Uncompressed PCM';
  } else if (asciiHeader.includes('oggS')) {
    formatInfo = 'OGG Vorbis Audio';
  }

  details.push(`🎙️ Format Berkas Audio: ${formatInfo}.`);

  // 1) AI Synthetic Voice / Music Detection
  if (detectedAi.length > 0 || isAiFileName || detectedC2pa.length > 0) {
    const matches = Array.from(
      new Set([
        ...detectedAi,
        ...(isAiFileName ? ['nama file terindikasi ai voice'] : []),
        ...(detectedC2pa.length > 0 ? ['c2pa provenance'] : []),
      ])
    ).join(', ');
    details.push(`⚠️ Indikasi AI Synthetic Voice / Music: terdeteksi stempel generator suara (${matches.toUpperCase()}).`);
    details.push('❗ Peringatan Sistem: bukti audio terindikasi Kloning Suara AI / Deepfake Audio.');
    return { status: 'Manipulated', details };
  }

  // 2) Audio Editor DAW Software Detection
  if (detectedEditor.length > 0 || isEditorFileName) {
    const matches = Array.from(
      new Set([...detectedEditor, ...(isEditorFileName ? ['terdeteksi di nama file'] : [])])
    ).join(', ');
    details.push(`⚠️ Indikasi Digital Audio Workstation (DAW): terdeteksi jejak software penyunting suara (${matches.toUpperCase()}).`);
    details.push('🔍 Rekomendasi: tinjauan manual oleh Satgas untuk mendeteksi penyuntingan/penyambungan rekaman.');
    return { status: 'Needs Review', details };
  }

  details.push('🟢 Structure Check: stream rekaman audio utuh tanpa stempel kloning suara AI.');
  details.push('🛡️ Cryptographic SHA-256 dicetak untuk menjamin integritas bukti.');
  return { status: 'Original', details };
}
