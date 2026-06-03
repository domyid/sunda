// Pengontrol utama aplikasi: ngatur layar, ngahubungkeun téma, ujian, poin, toko, jeung share.

import { THEMES, applyTheme, getSavedTheme } from "./themes.js";
import { buatQuiz, jawab, lanjut, soalAyeuna } from "./quiz.js";
import {
  getPoin, tambahPoin, kurangPoin,
  getNama, setNama, getVoucher, tambahVoucher,
} from "./storage.js";
import { buatPesanWA, shareKeWA } from "./share.js";
import {
  ucapkeun, eureunUcap, warmVoices,
  setAktif as setSoraAktif, isAktif as soraAktif,
  soraBener, soraSalah,
} from "./audio.js";

// ---- Katalog hadiah ----
const HADIAH = [
  { id: "snack", emoji: "🍪", nama: "Snack pilihan", harga: 50 },
  { id: "screen", emoji: "📺", nama: "Screen time 30 menit", harga: 100 },
  { id: "film", emoji: "🎬", nama: "Pilih film lalajo bareng", harga: 150 },
  { id: "eskrim", emoji: "🍦", nama: "Jajan és krim", harga: 200 },
  { id: "mainan", emoji: "🧸", nama: "Mainan kejutan", harga: 350 },
];

const $ = (id) => document.getElementById(id);
let quiz = null;
let temaAktif = null;
let jumlahSoal = 20; // 0 = kabéh
let teksUcapAyeuna = "";

// ---------- Navigasi layar ----------
const SCREENS = ["screenTema", "screenKelas", "screenQuiz", "screenHasil", "screenToko"];
function tampil(id) {
  SCREENS.forEach((s) => $(s).classList.toggle("hidden", s !== id));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updatePoinPill() {
  $("poinTotal").textContent = getPoin();
}

// ---------- Toast ----------
let toastTimer = null;
function toast(teks) {
  const t = $("toast");
  t.textContent = teks;
  t.classList.remove("hidden");
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.classList.add("hidden"), 300);
  }, 1500);
}

// ---------- Layar 1: Téma ----------
function renderTema() {
  const grid = $("temaGrid");
  grid.innerHTML = "";
  Object.values(THEMES).forEach((t) => {
    const card = document.createElement("button");
    card.className = "tema-card";
    card.dataset.tema = t.id;
    card.innerHTML = `
      <div class="tema-mascots">${t.mascots.join(" ")}</div>
      <div class="tema-nama">${t.nama}</div>
      <div class="tema-desc">${t.deskripsi}</div>
      <span class="tema-pilih">Pilih ini ✓</span>`;
    card.addEventListener("mouseenter", () => previewTema(t.id));
    card.addEventListener("click", () => pilihTema(t.id));
    grid.appendChild(card);
  });
}

function previewTema(id) {
  temaAktif = applyTheme(id);
  updatePoinPill();
}

function pilihTema(id) {
  temaAktif = applyTheme(id);
  $("inputNama").value = getNama();
  tampil("screenKelas");
}

// ---------- Layar 2: Kelas ----------
function mulaiUjian(kelas) {
  const nama = $("inputNama").value.trim();
  setNama(nama);
  quiz = buatQuiz(kelas, { jumlah: jumlahSoal });
  tampil("screenQuiz");
  renderSoal();
}

// ---------- Layar 3: Ujian ----------
function renderSoal() {
  const s = soalAyeuna(quiz);
  const nomor = quiz.idx + 1;

  $("quizNomor").textContent = `Soal ${nomor}/${quiz.total}`;
  $("quizPoin").textContent = quiz.poin;
  $("progressBar").style.width = `${(quiz.idx / quiz.total) * 100}%`;

  const bacaanBox = $("bacaanBox");
  if (s.bacaan) {
    bacaanBox.innerHTML = `<span class="bacaan-label">📖 Baca heula:</span> ${s.bacaan}`;
    bacaanBox.classList.remove("hidden");
  } else {
    bacaanBox.classList.add("hidden");
  }

  const gambarBox = $("gambarBox");
  if (s.gambar) {
    gambarBox.textContent = s.gambar;
    gambarBox.classList.remove("hidden");
  } else {
    gambarBox.classList.add("hidden");
  }

  $("soalTeks").innerHTML = `<span class="topik-tag">${s.topik}</span>${s.soal}`;

  const list = $("pilihanList");
  list.innerHTML = "";
  const labels = ["A", "B", "C", "D"];
  s.pilihanAcak.forEach((pil, i) => {
    const btn = document.createElement("button");
    btn.className = "pilihan-btn";
    btn.innerHTML = `<span class="pilihan-label">${labels[i]}</span><span class="pilihan-teks">${pil}</span>`;
    btn.addEventListener("click", () => pilihJawaban(i, btn));
    list.appendChild(btn);
  });

  // Téks pikeun dibacakeun nyaring (soal + pilihan).
  teksUcapAyeuna =
    (s.bacaan ? s.bacaan + ". " : "") +
    s.soal + ". " +
    s.pilihanAcak.map((p, i) => `${labels[i]}. ${p}`).join(". ");

  $("feedback").classList.add("hidden");
  ucapkeun(teksUcapAyeuna); // otomatis maca soal
}

function pilihJawaban(i, btn) {
  // Konci sadaya tombol
  const tombol = [...$("pilihanList").children];
  tombol.forEach((b) => (b.disabled = true));

  const s = soalAyeuna(quiz);
  const { leres, poinDidapat } = jawab(quiz, i);

  eureunUcap();
  if (leres) soraBener(); else soraSalah();

  btn.classList.add(leres ? "benar" : "salah");
  if (!leres) {
    tombol[s.jawabanAcak].classList.add("benar"); // tuduhkeun nu bener
  }

  $("quizPoin").textContent = quiz.poin;

  // Feedback
  const fb = $("feedback");
  $("feedbackEmoji").textContent = leres ? "🎉" : "💡";
  if (leres) {
    $("feedbackTeks").innerHTML = `<strong>Leres pisan!</strong> +${poinDidapat} poin ⭐` +
      (quiz.runtuyan > 0 && quiz.runtuyan % 3 === 0 ? "<br>🔥 Bonus runtuyan!" : "");
    toast(`+${poinDidapat} poin ⭐`);
  } else {
    $("feedbackTeks").innerHTML = `Acan leres. Nu bener: <strong>${s.labelBener}</strong>.` +
      (s.catatan ? `<br><span class="catatan">💡 ${s.catatan}</span>` : "");
  }
  $("btnLanjut").textContent = quiz.idx + 1 < quiz.total ? "Lanjut →" : "Tingali Hasil 🏁";
  fb.classList.remove("hidden");
}

function kaLanjut() {
  eureunUcap();
  if (lanjut(quiz)) {
    renderSoal();
  } else {
    selesaiUjian();
  }
}

// ---------- Layar 4: Hasil ----------
function selesaiUjian() {
  const persen = Math.round((quiz.benar / quiz.total) * 100);
  tambahPoin(quiz.poin);
  updatePoinPill();

  let judul, medali;
  if (persen === 100) { judul = "SAMPURNA! 🌟"; medali = "🏆"; }
  else if (persen >= 80) { judul = "Hébat pisan!"; medali = "🥇"; }
  else if (persen >= 60) { judul = "Sae, terus diajar!"; medali = "🥈"; }
  else { judul = "Tong hilap diajar deui nya!"; medali = "🥉"; }

  $("medali").textContent = medali;
  $("hasilJudul").textContent = judul;
  $("hasilBenar").textContent = quiz.benar;
  $("hasilTotal").textContent = quiz.total;
  $("hasilPersen").textContent = `${persen}%`;
  $("hasilPoin").textContent = quiz.poin;

  // Evaluasi jawaban salah
  const box = $("evaluasiBox");
  if (quiz.salahList.length === 0) {
    box.innerHTML = `<div class="evaluasi-mantap">🎉 Sadaya jawaban LERES! Mantap pisan! 🎉</div>`;
  } else {
    box.innerHTML = `<h3>📝 Diajar deui yu, ieu jawaban nu bener:</h3>` +
      quiz.salahList.map((s, i) => `
        <div class="eval-item">
          <div class="eval-soal">${i + 1}. ${s.soal}</div>
          <div class="eval-salah">❌ Jawaban hidep: ${s.jawabanAnak}</div>
          <div class="eval-bener">✅ Nu leres: <strong>${s.jawabanBener}</strong></div>
          ${s.catatan ? `<div class="eval-catatan">💡 ${s.catatan}</div>` : ""}
        </div>`).join("");
  }

  if (persen >= 80) tebarConfetti();
  tampil("screenHasil");
}

function tebarConfetti() {
  const c = $("confetti");
  c.innerHTML = "";
  const emo = temaAktif ? temaAktif.mascots : ["⭐", "🎉", "💖", "✨"];
  for (let i = 0; i < 28; i++) {
    const span = document.createElement("span");
    span.textContent = emo[i % emo.length];
    span.style.left = `${Math.random() * 100}%`;
    span.style.animationDelay = `${Math.random() * 0.8}s`;
    span.style.fontSize = `${1 + Math.random() * 1.5}rem`;
    c.appendChild(span);
  }
}

// ---------- Layar 5: Toko Hadiah ----------
function renderToko() {
  $("tokoPoin").textContent = getPoin();
  const grid = $("tokoGrid");
  grid.innerHTML = "";
  const poin = getPoin();
  HADIAH.forEach((h) => {
    const cukup = poin >= h.harga;
    const card = document.createElement("div");
    card.className = "hadiah-card" + (cukup ? "" : " kurang");
    card.innerHTML = `
      <div class="hadiah-emoji">${h.emoji}</div>
      <div class="hadiah-nama">${h.nama}</div>
      <div class="hadiah-harga">⭐ ${h.harga} poin</div>
      <button class="btn btn-accent btn-tebus" ${cukup ? "" : "disabled"}>
        ${cukup ? "Tukeurkeun" : "Poin kurang"}
      </button>`;
    card.querySelector(".btn-tebus").addEventListener("click", () => tebusHadiah(h));
    grid.appendChild(card);
  });
  renderVoucher();
}

function tebusHadiah(h) {
  if (getPoin() < h.harga) return;
  kurangPoin(h.harga);
  const tgl = new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
  tambahVoucher({ nama: h.nama, emoji: h.emoji, harga: h.harga, tgl });
  updatePoinPill();
  toast(`🎉 Hayu tukeurkeun ${h.nama}!`);
  renderToko();
}

function renderVoucher() {
  const list = getVoucher();
  const wrap = $("voucherWrap");
  const el = $("voucherList");
  if (list.length === 0) {
    wrap.classList.add("hidden");
    return;
  }
  wrap.classList.remove("hidden");
  el.innerHTML = list.map((v) => `
    <div class="voucher">
      <span class="voucher-emoji">${v.emoji}</span>
      <span class="voucher-info"><strong>${v.nama}</strong><br><small>${v.tgl} · ${v.harga} poin</small></span>
      <span class="voucher-cap">LUNAS</span>
    </div>`).join("");
}

// ---------- Share WhatsApp ----------
function shareHasil() {
  const pesan = buatPesanWA({
    nama: getNama(),
    kelas: quiz.kelas,
    benar: quiz.benar,
    total: quiz.total,
    poin: quiz.poin,
    salahList: quiz.salahList,
  });
  shareKeWA(pesan);
}

// ---------- Init ----------
function init() {
  renderTema();
  updatePoinPill();
  warmVoices();

  // Téma awal (preview tina nu kasimpen, tapi tetep mecak layar pilih téma)
  const saved = getSavedTheme();
  temaAktif = applyTheme(saved || "kuromi");

  $("btnGantiTema").addEventListener("click", () => tampil("screenTema"));
  document.querySelectorAll(".jumlah-btn").forEach((b) =>
    b.addEventListener("click", () => {
      jumlahSoal = parseInt(b.dataset.jumlah, 10);
      document.querySelectorAll(".jumlah-btn").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
    })
  );
  document.querySelectorAll(".kelas-btn").forEach((b) =>
    b.addEventListener("click", () => mulaiUjian(parseInt(b.dataset.kelas, 10)))
  );
  $("btnDengekeun").addEventListener("click", () => ucapkeun(teksUcapAyeuna));
  $("soraToggle").addEventListener("click", () => {
    const baru = !soraAktif();
    setSoraAktif(baru);
    $("soraToggle").textContent = baru ? "🔊" : "🔇";
    $("soraToggle").classList.toggle("mati", !baru);
  });
  $("btnLanjut").addEventListener("click", kaLanjut);
  $("btnShareWA").addEventListener("click", shareHasil);
  $("btnToko").addEventListener("click", () => { renderToko(); tampil("screenToko"); });
  $("btnBalikHasil").addEventListener("click", () => tampil("screenHasil"));
  $("btnUlang").addEventListener("click", () => tampil("screenKelas"));
  $("poinPill").addEventListener("click", () => { renderToko(); tampil("screenToko"); });

  tampil("screenTema");
}

init();
