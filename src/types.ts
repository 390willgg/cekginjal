export type Screen = "landing" | "form" | "result" | "history" | "reko";
export type Gender = "L" | "P" | "";
export type GdType = "puasa" | "sewaktu";
export type DmType = "tipe1" | "tipe2";
export type Aktivitas = "rendah" | "sedang" | "berat" | "";

export interface FormData {
  nama: string;
  anonim: boolean;
  umur: string;
  gender: Gender;
  tinggi: string;
  berat: string;
  gdValue: string;
  gdType: GdType;
  gdDate: string;
  sys: string;
  dia: string;
  bpDate: string;
  diabetes: boolean;
  dmType: DmType;
  hipertensi: boolean;
  keluarga: boolean;
  jantung: boolean;
  aktivitas: Aktivitas;
}

export interface HistoryItem {
  id: number;
  nama: string;
  tanggalLabel: string;
  umur: string;
  riskPct: number;
  riskCat: string;
  riskColor: string;
  confidencePct: number;
  data: FormData;
}

export interface RsItem {
  id: number;
  provinsi: string;
  nama: string;
  paket: string;
  alamat: string;
  kontak: string;
  jam: string;
  promo: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export interface ArticleItem {
  id: number;
  topik: string;
  judul: string;
  ringkasan: string;
  isi: string;
}
