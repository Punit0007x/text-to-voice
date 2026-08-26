// Audio utilities for high-fidelity playback, Web Audio API analysis, and WAV handling

export function base64ToBlob(base64: string, mimeType = "audio/wav"): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

export function base64ToAudioUrl(base64: string, mimeType = "audio/wav"): string {
  const blob = base64ToBlob(base64, mimeType);
  return URL.createObjectURL(blob);
}

export function downloadWav(base64: string, filename = "indian-female-voice.wav"): void {
  const blob = base64ToBlob(base64, "audio/wav");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function estimateSpeechDuration(text: string, speed = 1.0): number {
  if (!text || !text.trim()) return 0;
  const wordCount = text.trim().split(/\s+/).length;
  // Average speaking rate: ~140 words per minute for clear Indian English
  const durationMinutes = wordCount / (140 * speed);
  return Math.max(1, Math.round(durationMinutes * 60));
}

// Browser Web Speech API Indian Voice Finder & Player
export function getBrowserIndianVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  return voices.filter(
    (v) =>
      v.lang.includes("en-IN") ||
      v.lang.includes("hi-IN") ||
      v.name.toLowerCase().includes("india") ||
      v.name.toLowerCase().includes("heera") ||
      v.name.toLowerCase().includes("neerja") ||
      v.name.toLowerCase().includes("veena") ||
      v.name.toLowerCase().includes("priya") ||
      v.name.toLowerCase().includes("raveena")
  );
}

export function speakWithBrowserVoice(
  text: string,
  speed = 1.0,
  onEnd?: () => void,
  onError?: (err: unknown) => void
): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    throw new Error("Web Speech API is not supported in this browser.");
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = speed;
  utterance.pitch = 1.05; // Slightly higher feminine pitch

  const voices = window.speechSynthesis.getVoices();
  // Look for Indian English female voice first
  const indianFemaleVoice = voices.find(
    (v) =>
      (v.lang === "en-IN" || v.lang === "hi-IN" || v.name.toLowerCase().includes("india")) &&
      (v.name.toLowerCase().includes("female") ||
        v.name.toLowerCase().includes("heera") ||
        v.name.toLowerCase().includes("neerja") ||
        v.name.toLowerCase().includes("veena") ||
        v.name.toLowerCase().includes("priya") ||
        v.name.toLowerCase().includes("google हिन्दी") ||
        v.name.toLowerCase().includes("zira") === false)
  );

  if (indianFemaleVoice) {
    utterance.voice = indianFemaleVoice;
  } else {
    // Fallback to any en-IN or hi-IN voice
    const anyIndian = voices.find((v) => v.lang.startsWith("en-IN") || v.lang.startsWith("hi"));
    if (anyIndian) utterance.voice = anyIndian;
  }

  if (onEnd) utterance.onend = onEnd;
  if (onError) utterance.onerror = onError;

  window.speechSynthesis.speak(utterance);
}
