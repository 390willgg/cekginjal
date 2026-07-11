import styles from "./Landing.module.css";

const LANDING_STEPS = [
  {
    no: "01",
    title: "Identitas pasien",
    desc: "Nama (opsional / anonim), umur, jenis kelamin",
  },
  {
    no: "02",
    title: "Antropometri & IMT",
    desc: "Tinggi & berat → kategori kurus / normal / kegemukan / obesitas",
  },
  {
    no: "03",
    title: "Gula darah + tanggal",
    desc: "Hasil pengecekan beserta tanggal untuk menilai keyakinan data",
  },
  {
    no: "04",
    title: "Tekanan darah + tanggal",
    desc: "Sistolik / diastolik beserta tanggal pengukuran",
  },
  {
    no: "05",
    title: "Riwayat penyakit",
    desc: "Diabetes (tipe 1 / 2), hipertensi, dan lainnya",
  },
  {
    no: "06",
    title: "Aktivitas fisik",
    desc: "Tingkat aktivitas: rendah, sedang, atau berat",
  },
];

export function Landing({
  onStart,
  onHistory,
}: {
  onStart: () => void;
  onHistory: () => void;
}) {
  return (
    <div className={styles.page}>
      <div className={styles.kicker}>
        Alat bantu skrining · Kader & Petugas
      </div>
      <h1 className={styles.title}>
        Skrining Risiko Penyakit Ginjal Kronis
      </h1>
      <div className={styles.infoBox}>
        <div className={styles.infoIcon}>⚠️</div>
        <div className={styles.infoText}>
          <b>Apa itu CKD?</b> Penyakit Ginjal Kronis (Chronic Kidney Disease)
          adalah penurunan fungsi ginjal secara bertahap. CKD dijuluki{" "}
          <b className={styles.infoStrong}>"silent killer"</b> karena
          gejalanya sering baru terasa setelah kerusakan ginjal sudah parah —
          skrining rutin adalah cara utama mendeteksinya sejak dini.
        </div>
      </div>
      <p className={styles.subtitle}>
        Catat data antropometri, gula darah, tekanan darah, dan riwayat penyakit
        pasien. Sistem menghitung estimasi risiko CKD beserta{" "}
        <b className={styles.subtitleStrong}>tingkat keyakinan data</b> — semakin
        lama tanggal pengecekan, semakin rendah keyakinan hasilnya.
      </p>
      <div className={styles.stepsCard}>
        {LANDING_STEPS.map((st) => (
          <div key={st.no} className={styles.stepRow}>
            <div className={styles.stepNo}>{st.no}</div>
            <div className={styles.stepBody}>
              <div className={styles.stepTitle}>{st.title}</div>
              <div className={styles.stepDesc}>{st.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.actions}>
        <button onClick={onStart} className={styles.primaryBtn}>
          Mulai Skrining Baru →
        </button>
        <button onClick={onHistory} className={styles.secondaryBtn}>
          Lihat Riwayat
        </button>
      </div>
      <p className={styles.disclaimer}>
        Hasil bersifat estimasi skrining untuk membantu pengambilan keputusan
        rujukan — <b>bukan diagnosis</b>. Konfirmasi selalu dengan pemeriksaan
        klinis (eGFR, urinalisis) oleh tenaga medis.
      </p>
    </div>
  );
}
