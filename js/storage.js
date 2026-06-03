// Nyimpen poin reward (kumpul lintas sési) + voucher nu geus ditebus.

const POIN_KEY = "sunda_poin";
const VOUCHER_KEY = "sunda_voucher";
const NAMA_KEY = "sunda_nama";

export function getPoin() {
  return parseInt(localStorage.getItem(POIN_KEY) || "0", 10);
}

export function tambahPoin(jumlah) {
  const baru = getPoin() + jumlah;
  localStorage.setItem(POIN_KEY, String(baru));
  return baru;
}

export function kurangPoin(jumlah) {
  const baru = Math.max(0, getPoin() - jumlah);
  localStorage.setItem(POIN_KEY, String(baru));
  return baru;
}

export function getNama() {
  return localStorage.getItem(NAMA_KEY) || "";
}

export function setNama(nama) {
  localStorage.setItem(NAMA_KEY, nama);
}

export function getVoucher() {
  try {
    return JSON.parse(localStorage.getItem(VOUCHER_KEY) || "[]");
  } catch {
    return [];
  }
}

export function tambahVoucher(voucher) {
  const list = getVoucher();
  list.unshift(voucher);
  localStorage.setItem(VOUCHER_KEY, JSON.stringify(list));
  return list;
}
