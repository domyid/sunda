// Nyieun pesen WhatsApp: skor + evaluasi jawaban nu salah (jeung jawaban bener).

export function buatPesanWA({ nama, kelas, benar, total, poin, salahList }) {
  const persen = Math.round((benar / total) * 100);
  let pesan = `*Hasil Ujian Bahasa Sunda* 📚✨\n`;
  pesan += `Nami: ${nama || "(teu diisi)"}\n`;
  pesan += `Kelas: ${kelas} SD\n`;
  pesan += `Skor: ${benar}/${total} (${persen}%)\n`;
  pesan += `Poin kahontal: ⭐ ${poin} poin\n`;

  if (salahList.length === 0) {
    pesan += `\n🎉 Mantap pisan! Sadaya jawaban LEURES! 🎉`;
  } else {
    pesan += `\n*Évaluasi jawaban nu kedah diulik deui:*\n`;
    salahList.forEach((s, i) => {
      pesan += `\n${i + 1}. ${s.soal}\n`;
      pesan += `   ❌ Jawaban anjeun: ${s.jawabanAnak}\n`;
      pesan += `   ✅ Anu leres: ${s.jawabanBener}\n`;
      if (s.catatan) pesan += `   💡 ${s.catatan}\n`;
    });
  }
  pesan += `\nHayu diajar deui ngarah tambah pinter! 💪`;
  return pesan;
}

export function shareKeWA(pesan) {
  const url = `https://wa.me/?text=${encodeURIComponent(pesan)}`;
  window.open(url, "_blank");
}
