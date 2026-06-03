// Dua téma karakter favorit. Tiap téma ngeset CSS variabel + maskot (emoji).
// Henteu maké gambar berhak cipta — ngandelkeun warna, bentuk, jeung emoji.

export const THEMES = {
  kuromi: {
    id: "kuromi",
    nama: "Kuromi & Keroppi",
    mascots: ["😈", "💜", "🐸", "💚"],
    deskripsi: "Ungu nakal jeung héjo seger!",
    vars: {
      "--bg-1": "#2a1a3e",
      "--bg-2": "#3d2a5c",
      "--card": "#ffffff",
      "--primary": "#7b2fb5",
      "--primary-soft": "#e9d5ff",
      "--accent": "#4caf50",
      "--accent-soft": "#d7f5d9",
      "--text": "#2a1a3e",
      "--text-soft": "#6b5b7e",
      "--correct": "#39b54a",
      "--wrong": "#e8458b",
      "--star": "#ffcd3c",
      "--btn-text": "#ffffff",
    },
  },
  cinnamoroll: {
    id: "cinnamoroll",
    nama: "Cinnamoroll & Pochacco",
    mascots: ["☁️", "💙", "🐶", "🤍"],
    deskripsi: "Biru langit nu lembut jeung ngabelebet!",
    vars: {
      "--bg-1": "#bfe6ff",
      "--bg-2": "#e7f6ff",
      "--card": "#ffffff",
      "--primary": "#3aa0e3",
      "--primary-soft": "#d6efff",
      "--accent": "#ff9ec4",
      "--accent-soft": "#ffe3ef",
      "--text": "#27506e",
      "--text-soft": "#6b8aa3",
      "--correct": "#39b54a",
      "--wrong": "#ef5da8",
      "--star": "#ffcd3c",
      "--btn-text": "#ffffff",
    },
  },
};

const STORAGE_KEY = "sunda_tema";

export function applyTheme(themeId) {
  const theme = THEMES[themeId] || THEMES.kuromi;
  const root = document.documentElement;
  for (const [key, val] of Object.entries(theme.vars)) {
    root.style.setProperty(key, val);
  }
  document.body.dataset.theme = theme.id;
  localStorage.setItem(STORAGE_KEY, theme.id);
  return theme;
}

export function getSavedTheme() {
  return localStorage.getItem(STORAGE_KEY);
}
