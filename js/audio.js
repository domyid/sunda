// Sora: Text-to-Speech (maca soal nyaring) + éfék sora bener/salah.
// Maké Web Speech API bawaan browser — teu peryogi file audio atawa internet.
// Sora Sunda jarang aya, jadi dipilih sora 'su' lamun aya, mun teu aya nganggo 'id-ID'
// (basa Indonésia) anu lafalna pangdeukeutna ka Sunda.

let aktif = true;
let voicePilihan = null;

export function setAktif(v) {
  aktif = v;
  if (!v && "speechSynthesis" in window) window.speechSynthesis.cancel();
}
export function isAktif() {
  return aktif;
}

function adaTTS() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// Pilih sora panghadéna. Sora dimuat asinkron, jadi diulang nepi ka kapanggih.
function pilihVoice() {
  if (voicePilihan) return voicePilihan;
  if (!adaTTS()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null; // can muat -- entong di-cache
  voicePilihan =
    voices.find((v) => /^su/i.test(v.lang)) || // Sunda
    voices.find((v) => /^id/i.test(v.lang)) || // Indonésia
    voices.find((v) => /indones/i.test(v.name)) ||
    null;
  return voicePilihan;
}

export function warmVoices() {
  if (!adaTTS()) return;
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    voicePilihan = null;
    pilihVoice();
  };
}

export function ucapkeun(teks) {
  if (!aktif || !adaTTS()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(teks);
  const v = pilihVoice();
  if (v) {
    u.voice = v;
    u.lang = v.lang;
  } else {
    u.lang = "id-ID";
  }
  u.rate = 0.9; // rada lalaunan ngarah jelas pikeun barudak
  u.pitch = 1.05;
  window.speechSynthesis.speak(u);
}

export function eureunUcap() {
  if (adaTTS()) window.speechSynthesis.cancel();
}

// ---- Éfék sora ngagunakeun WebAudio (taya file) ----
let ctx = null;
function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  return ctx;
}
function beep(freq, mimiti, durasi, tipe = "sine") {
  const c = ac();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = tipe;
  o.frequency.value = freq;
  o.connect(g);
  g.connect(c.destination);
  const t = c.currentTime + mimiti;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + durasi);
  o.start(t);
  o.stop(t + durasi);
}

export function soraBener() {
  if (!aktif) return;
  try { beep(660, 0, 0.13); beep(990, 0.12, 0.2); } catch {}
}
export function soraSalah() {
  if (!aktif) return;
  try { beep(320, 0, 0.18, "square"); beep(200, 0.17, 0.24, "square"); } catch {}
}
