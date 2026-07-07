import type { FormData, RsItem } from "../types";
import { PROVINCES, RS_DATA } from "../data/rsData";
import { ARTICLES_DATA } from "../data/articlesData";

export { PROVINCES };

export function blank(): FormData {
  return {
    nama: "",
    anonim: false,
    umur: "",
    gender: "",
    tinggi: "",
    berat: "",
    gdValue: "",
    gdType: "puasa",
    gdDate: "",
    sys: "",
    dia: "",
    bpDate: "",
    diabetes: false,
    dmType: "tipe2",
    hipertensi: false,
    keluarga: false,
    jantung: false,
    aktivitas: "",
  };
}

export function fmtDate(d: Date) {
  const m = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`;
}

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildReko(provinsi: string) {
  const articlePool = provinsi ? ARTICLES_DATA : shuffleArr(ARTICLES_DATA);
  const rekoSubtitle = provinsi
    ? `Cari Puskesmas/FKTP terdekat atau paket MCU ginjal bersubsidi sesuai domisili Anda (${provinsi}) di bawah ini.`
    : "Pilih provinsi Anda untuk melihat rekomendasi paket MCU ginjal yang sesuai domisili.";
  const rsList: RsItem[] = provinsi
    ? RS_DATA.filter((r) => r.provinsi === provinsi)
    : shuffleArr(RS_DATA);
  return { articleCards: articlePool.slice(0, 6), rekoSubtitle, rsList };
}

function validity(dateStr: string) {
  if (!dateStr) return { score: null, label: "Belum diisi", color: "#9AABA5" };
  const dt = new Date(dateStr);
  const days = Math.floor((Date.now() - dt.getTime()) / 86400000);
  if (days < 0)
    return { score: 0.6, label: "Tanggal di masa depan?", color: "#C77A0A" };
  if (days <= 90)
    return { score: 1, label: "≤ 3 bln · valid penuh", color: "#1A8754" };
  if (days <= 180)
    return { score: 0.7, label: "3–6 bln · keyakinan turun", color: "#C77A0A" };
  if (days <= 365)
    return {
      score: 0.45,
      label: "6–12 bln · keyakinan rendah",
      color: "#C77A0A",
    };
  return { score: 0.2, label: "> 12 bln · sangat rendah", color: "#C5453B" };
}

export function derive(d: FormData) {
  const t = parseFloat(d.tinggi),
    b = parseFloat(d.berat),
    umur = parseFloat(d.umur);

  // BMI
  let bmiShow = false,
    bmiHide = true,
    bmi = "–",
    bmiCat = "–",
    bmiColor = "#9AABA5",
    bmiPos = 0;
  if (t > 0 && b > 0) {
    const m = t / 100;
    const bmiVal = b / (m * m);
    bmi = bmiVal.toFixed(1);
    bmiShow = true;
    bmiHide = false;
    bmiPos = Math.max(2, Math.min(98, ((bmiVal - 15) / 20) * 100));
    if (bmiVal < 18.5) {
      bmiCat = "Kurus";
      bmiColor = "#C77A0A";
    } else if (bmiVal < 25) {
      bmiCat = "Normal";
      bmiColor = "#1A8754";
    } else if (bmiVal < 30) {
      bmiCat = "Kegemukan";
      bmiColor = "#C77A0A";
    } else {
      bmiCat = "Obesitas";
      bmiColor = "#C5453B";
    }
  }

  // Blood sugar
  const gd = parseFloat(d.gdValue);
  let gdCat = "–",
    gdColor = "#9AABA5";
  if (gd > 0) {
    if (d.gdType === "puasa") {
      if (gd < 100) {
        gdCat = "Normal";
        gdColor = "#1A8754";
      } else if (gd < 126) {
        gdCat = "Pra-diabetes";
        gdColor = "#C77A0A";
      } else {
        gdCat = "Tinggi";
        gdColor = "#C5453B";
      }
    } else {
      if (gd < 140) {
        gdCat = "Normal";
        gdColor = "#1A8754";
      } else if (gd < 200) {
        gdCat = "Waspada";
        gdColor = "#C77A0A";
      } else {
        gdCat = "Tinggi";
        gdColor = "#C5453B";
      }
    }
  }
  const gv = validity(d.gdDate);

  // Blood pressure
  const sys = parseFloat(d.sys),
    dia = parseFloat(d.dia);
  let bpCat = "–",
    bpColor = "#9AABA5";
  if (sys > 0 || dia > 0) {
    if (sys > 180 || dia > 120) {
      bpCat = "Krisis Hipertensi";
      bpColor = "#C5453B";
    } else if (sys >= 140 || dia >= 90) {
      bpCat = "Hipertensi Tingkat 2";
      bpColor = "#C5453B";
    } else if (sys >= 130 || dia >= 80) {
      bpCat = "Hipertensi Tingkat 1";
      bpColor = "#C77A0A";
    } else if (sys >= 120 && dia < 80) {
      bpCat = "Prahipertensi";
      bpColor = "#C77A0A";
    } else if (sys < 120 && dia < 80) {
      bpCat = "Normal";
      bpColor = "#1A8754";
    } else if (sys < 90 || dia < 60) {
      bpCat = "Hipotensi";
      bpColor = "#9AABA5";
    } else {
      bpCat = "Normal";
      bpColor = "#1A8754";
    }
  }
  const bv = validity(d.bpDate);

  // Risk factors
  const f: { label: string; pts: number }[] = [];
  if (umur >= 60) f.push({ label: "Usia ≥ 60 tahun", pts: 12 });
  else if (umur >= 45) f.push({ label: "Usia 45–59 tahun", pts: 6 });
  if (bmiCat === "Obesitas") f.push({ label: "Obesitas (IMT)", pts: 10 });
  else if (bmiCat === "Kegemukan") f.push({ label: "Kegemukan (IMT)", pts: 5 });
  if (d.diabetes) {
    if (d.dmType === "tipe1")
      f.push({ label: "Riwayat Diabetes Tipe 1", pts: 28 });
    else f.push({ label: "Riwayat Diabetes Tipe 2", pts: 16 });
  }
  if (d.hipertensi) f.push({ label: "Riwayat Hipertensi", pts: 18 });
  if (gdCat === "Tinggi") f.push({ label: "Gula darah tinggi", pts: 14 });
  else if (gdCat === "Pra-diabetes" || gdCat === "Waspada")
    f.push({ label: "Gula darah di atas normal", pts: 7 });
  if (bpCat === "Krisis Hipertensi" || bpCat === "Hipertensi Tingkat 2")
    f.push({ label: "Tekanan darah tinggi", pts: 14 });
  else if (bpCat === "Hipertensi Tingkat 1" || bpCat === "Prahipertensi")
    f.push({ label: "Tekanan darah meningkat", pts: 7 });
  if (d.keluarga)
    f.push({ label: "Riwayat keluarga penyakit ginjal", pts: 10 });
  if (d.jantung) f.push({ label: "Riwayat penyakit jantung", pts: 8 });
  if (d.aktivitas === "rendah")
    f.push({ label: "Aktivitas fisik rendah", pts: 8 });

  const raw = f.reduce((a, x) => a + x.pts, 0);
  const riskPct = Math.min(100, Math.round(raw));
  const riskMarkerLeft = Math.max(3, Math.min(97, riskPct)) + "%";
  let riskCat = "",
    riskColor = "",
    riskBg = "";
  if (riskPct < 25) {
    riskCat = "Rendah";
    riskColor = "#1A8754";
    riskBg = "#E7F4ED";
  } else if (riskPct < 50) {
    riskCat = "Sedang";
    riskColor = "#C77A0A";
    riskBg = "#FBF1E2";
  } else {
    riskCat = "Tinggi";
    riskColor = "#C5453B";
    riskBg = "#FBEAE8";
  }

  // Kidney age
  let kidneyAgeShow = false,
    realAge = 0,
    kidneyAge = 0,
    kidneyAgeColor = "#9AABA5",
    kidneyAgeText = "";
  if (umur > 0) {
    let off = Math.round((riskPct - 15) * 0.32);
    if (off < -5) off = -5;
    kidneyAge = Math.max(1, Math.round(umur + off));
    realAge = Math.round(umur);
    kidneyAgeShow = true;
    if (off <= 0) {
      kidneyAgeColor = "#1A8754";
      kidneyAgeText =
        "setara atau lebih muda dari usia Anda — kondisi ginjal tergolong terjaga. Pertahankan gaya hidup sehat.";
    } else if (off <= 10) {
      kidneyAgeColor = "#C77A0A";
      kidneyAgeText = `sekitar ${off} tahun lebih tua dari usia Anda. Mulai perbaiki gaya hidup untuk menjaganya.`;
    } else {
      kidneyAgeColor = "#C5453B";
      kidneyAgeText = `sekitar ${off} tahun lebih tua dari usia Anda. Perlu perhatian khusus & pemeriksaan lanjutan.`;
    }
  }

  // Confidence
  const scores: number[] = [];
  if (d.gdDate && gv.score !== null) scores.push(gv.score);
  if (d.bpDate && bv.score !== null) scores.push(bv.score);
  const conf = scores.length
    ? scores.reduce((a, x) => a + x, 0) / scores.length
    : null;
  const confidencePct = conf === null ? 0 : Math.round(conf * 100);
  let confidenceLabel = "",
    confidenceColor = "";
  if (conf === null) {
    confidenceLabel = "Data pengukuran belum diisi";
    confidenceColor = "#9AABA5";
  } else if (conf >= 0.85) {
    confidenceLabel = "Keyakinan tinggi — data terbaru";
    confidenceColor = "#1A8754";
  } else if (conf >= 0.6) {
    confidenceLabel = "Keyakinan sedang — sebagian data mulai lama";
    confidenceColor = "#C77A0A";
  } else {
    confidenceLabel = "Keyakinan rendah — data sudah lama";
    confidenceColor = "#C5453B";
  }

  const isSehat =
    riskCat === "Rendah" &&
    bmiCat === "Normal" &&
    (gdCat === "Normal" || gdCat === "–") &&
    (bpCat === "Normal" || bpCat === "–") &&
    !d.diabetes &&
    !d.hipertensi &&
    !d.keluarga &&
    !d.jantung;

  // Rekomendasi
  const rekomendasi: string[] = [];
  if (riskCat === "Tinggi")
    rekomendasi.push(
      "Rujuk ke dokter/puskesmas untuk pemeriksaan fungsi ginjal (eGFR & urinalisis).",
    );
  else if (riskCat === "Sedang") {
    rekomendasi.push(
      "Lakukan pemeriksaan lanjutan dan kendalikan faktor risiko.",
    );
    rekomendasi.push("Ulangi skrining dalam 3 bulan.");
  } else if (isSehat) {
    rekomendasi.push("✅ Hasil tergolong sehat — pertahankan kondisi ini.");
    rekomendasi.push(
      "Lanjutkan pola hidup sehat & aktivitas fisik yang sudah baik.",
    );
    rekomendasi.push(
      "Lakukan medical check-up rutin tiap 6–12 bulan untuk memantau fungsi ginjal.",
    );
    rekomendasi.push("Cek tekanan darah & gula darah minimal sekali setahun.");
  } else {
    rekomendasi.push("Risiko rendah. Pertahankan pola hidup sehat.");
    rekomendasi.push("Skrining ulang tiap 6–12 bulan.");
  }
  if (conf !== null && conf < 0.6)
    rekomendasi.push(
      "⚠ Perbarui hasil gula darah / tekanan darah terbaru agar kesimpulan lebih akurat.",
    );
  if (conf === null)
    rekomendasi.push(
      "⚠ Lengkapi data gula darah & tekanan darah beserta tanggalnya.",
    );

  // Edukasi
  const edukasi: string[] = [];
  edukasi.push(
    "Perbanyak aktivitas fisik — olahraga ringan minimal 3x seminggu, sekitar 30 menit per sesi.",
  );
  edukasi.push(
    "Minum air putih yang cukup, sekitar 8 gelas (±2 liter) per hari.",
  );
  edukasi.push("Kurangi konsumsi garam, gula, dan makanan olahan berlebihan.");
  if (d.diabetes)
    edukasi.push(
      "Kontrol gula darah secara rutin dan patuhi pengobatan diabetes.",
    );
  if (d.hipertensi)
    edukasi.push(
      "Pantau tekanan darah berkala dan batasi garam < 1 sendok teh per hari.",
    );
  if (d.diabetes || d.hipertensi)
    edukasi.push(
      "Lakukan skrining fungsi ginjal lebih sering, mis. tiap 3 bulan, sesuai riwayat penyakit.",
    );
  else
    edukasi.push(
      "Lakukan skrining kesehatan berkala sesuai anjuran petugas (tiap 6–12 bulan).",
    );
  if (d.aktivitas === "rendah")
    edukasi.push(
      "Tingkatkan gerak harian: kurangi duduk lama, perbanyak jalan kaki dan peregangan.",
    );
  edukasi.push(
    "Hindari merokok serta penggunaan obat pereda nyeri berlebihan tanpa anjuran dokter.",
  );
  if (isSehat) {
    edukasi.push(
      "Pertahankan berat badan ideal (IMT 18,5–24,9) yang sudah Anda capai.",
    );
    edukasi.push(
      "Perbanyak sayur & buah, serta jaga porsi makan tetap seimbang.",
    );
    edukasi.push(
      "Tidur cukup 7–8 jam dan kelola stres agar tekanan darah tetap stabil.",
    );
    edukasi.push(
      "Konsistensi adalah kunci — menjaga kebiasaan sehat melindungi ginjal jangka panjang.",
    );
  }

  const rUmur = umur > 0 ? `${d.umur} th` : "–";
  const riw: string[] = [];
  if (d.diabetes) riw.push(d.dmType === "tipe1" ? "DM Tipe 1" : "DM Tipe 2");
  if (d.hipertensi) riw.push("Hipertensi");
  const riwayatLabel = riw.length ? riw.join(" · ") : "Tanpa riwayat";

  return {
    bmiShow,
    bmiHide,
    bmi,
    bmiCat,
    bmiColor,
    bmiPos,
    gdCat,
    gdColor,
    gdValShow: !!d.gdDate,
    gdValLabel: gv.label,
    gdValColor: gv.color,
    bpCat,
    bpColor,
    bpValShow: !!d.bpDate,
    bpValLabel: bv.label,
    bpValColor: bv.color,
    factors: f.map((x) => ({ label: x.label, pts: "+" + x.pts })),
    factorsEmpty: f.length === 0,
    riskPct,
    riskMarkerLeft,
    riskCat,
    riskColor,
    riskBg,
    kidneyAgeShow,
    realAge,
    kidneyAge,
    kidneyAgeColor,
    kidneyAgeText,
    confidencePct,
    confidenceLabel,
    confidenceColor,
    rekomendasi,
    edukasi,
    rUmur,
    riwayatLabel,
  };
}
