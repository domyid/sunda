// Logika ujian: ngokolakeun kaayaan soal, ngacak pilihan, ngitung skor.

import { getSoal } from "./questions.js";

const POIN_PER_BENAR = 10;
const BONUS_RUNTUYAN = 5; // bonus mun 3 bener berturut-turut

// Ngacak urutan array (Fisher–Yates) tanpa ngarobah aslina.
function acak(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buatQuiz(kelas, { jumlah = 0 } = {}) {
  const asli = getSoal(kelas);
  let soalDipilih = acak(asli);
  if (jumlah > 0) soalDipilih = soalDipilih.slice(0, jumlah);

  // Tiap soal: acak pilihan, catet di mana jawaban bener kapindahkeun.
  const soal = soalDipilih.map((s) => {
    const labelBener = s.pilihan[s.jawaban];
    const pilihanAcak = acak(s.pilihan);
    return {
      ...s,
      pilihanAcak,
      jawabanAcak: pilihanAcak.indexOf(labelBener),
      labelBener,
    };
  });

  return {
    kelas,
    soal,
    total: soal.length,
    idx: 0,
    benar: 0,
    poin: 0,
    runtuyan: 0,
    jawaban: [], // { soalIdx, pilihIdx, leres }
    salahList: [],
  };
}

// Catet jawaban pikeun soal ayeuna. Mulangkeun { leres, poinDidapat }.
export function jawab(quiz, pilihIdx) {
  const s = quiz.soal[quiz.idx];
  const leres = pilihIdx === s.jawabanAcak;
  let poinDidapat = 0;

  if (leres) {
    quiz.benar += 1;
    quiz.runtuyan += 1;
    poinDidapat = POIN_PER_BENAR;
    if (quiz.runtuyan > 0 && quiz.runtuyan % 3 === 0) {
      poinDidapat += BONUS_RUNTUYAN;
    }
    quiz.poin += poinDidapat;
  } else {
    quiz.runtuyan = 0;
    quiz.salahList.push({
      soal: s.soal,
      jawabanAnak: s.pilihanAcak[pilihIdx],
      jawabanBener: s.labelBener,
      catatan: s.catatan || "",
    });
  }

  quiz.jawaban.push({ soalIdx: quiz.idx, pilihIdx, leres });
  return { leres, poinDidapat };
}

export function lanjut(quiz) {
  quiz.idx += 1;
  return quiz.idx < quiz.total;
}

export function soalAyeuna(quiz) {
  return quiz.soal[quiz.idx];
}
