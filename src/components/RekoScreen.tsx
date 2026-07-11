import { useMemo } from "react";
import { buildReko, PROVINCES } from "../lib/derive";
import { AutoCarousel } from "./AutoCarousel";
import styles from "./RekoScreen.module.css";

export function RekoScreen({
  provinsi,
  onProvinsi,
  onOpenRs,
  onOpenArticle,
  onOpenChat,
}: {
  provinsi: string;
  onProvinsi: (p: string) => void;
  onOpenRs: (id: number) => void;
  onOpenArticle: (id: number) => void;
  onOpenChat: () => void;
}) {
  const reko = useMemo(() => buildReko(provinsi), [provinsi]);
  const chip = (active: boolean) =>
    `${styles.chip} ${active ? styles.chipActive : ""}`;

  return (
    <div className={styles.page}>
      <div className={styles.kicker}>Layanan Resmi Pemerintah</div>
      <h1 className={styles.title}>Cek Kesehatan Ginjal Gratis</h1>
      <p className={styles.subtitle}>{reko.rekoSubtitle}</p>

      <div className={styles.provinsiSection}>
        <div className={styles.sectionKicker}>
          Provinsi domisili Anda (opsional)
        </div>
        <div className={styles.chipRow}>
          <button onClick={() => onProvinsi("")} className={chip(!provinsi)}>
            Belum pilih
          </button>
          {PROVINCES.map((pv) => (
            <button
              key={pv}
              onClick={() => onProvinsi(pv)}
              className={chip(provinsi === pv)}
            >
              {pv}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.rsSection}>
        <div className={styles.sectionTitle}>
          Paket MCU Ginjal Bersubsidi di RS Vertikal Kemenkes
        </div>
        <p className={styles.sectionDesc}>
          RS vertikal milik pemerintah ini tidak gratis untuk umum, tapi
          menyediakan paket Medical Check Up (MCU) dengan tarif resmi
          BLU/Kemenkes — jauh lebih murah dari laboratorium swasta.
        </p>
        {reko.rsList.length === 0 ? (
          <p className={styles.emptyText}>
            Tidak ada paket MCU ginjal bersubsidi di domisili {provinsi}.
          </p>
        ) : (
          <>
            <AutoCarousel>
              {reko.rsList.map((r) => (
                <div
                  key={r.id}
                  onClick={() => onOpenRs(r.id)}
                  className={styles.rsCard}
                >
                  <div className={styles.rsTags}>
                    <span className={styles.rsProvinsi}>{r.provinsi}</span>
                    <span className={styles.rsPromo}>Mendatang: {r.promo}</span>
                  </div>
                  <div className={styles.rsNama}>{r.nama}</div>
                  <div className={styles.rsPaket}>{r.paket}</div>
                  <div className={styles.rsCta}>Lihat detail →</div>
                </div>
              ))}
            </AutoCarousel>
            <p className={styles.rsFootnote}>
              Catatan: RS di atas juga sering mengadakan diskon khusus (hingga
              50%) pada momen Hari Kesehatan Nasional (November) atau HUT rumah
              sakit masing-masing — jadwal pastinya berbeda tiap tahun,
              konfirmasikan langsung ke RS terkait.
            </p>
          </>
        )}
      </div>

      <div onClick={onOpenChat} className={styles.chatCta}>
        <div className={styles.chatCtaIcon}>✦</div>
        <div className={styles.chatCtaBody}>
          <div className={styles.chatCtaKicker}>Edukasi Kesehatan Ginjal</div>
          <div className={styles.chatCtaTitle}>
            Tanya AI soal ginjal, diet, gejala CKD
          </div>
          <div className={styles.chatCtaSub}>
            Chat langsung untuk edukasi yang sesuai pertanyaan Anda
          </div>
        </div>
        <div className={styles.chatCtaArrow}>→</div>
      </div>

      <div className={styles.articleSection}>
        <div className={styles.sectionTitle}>Edukasi Kesehatan Ginjal</div>
        <AutoCarousel>
          {reko.articleCards.map((a) => (
            <div
              key={a.id}
              onClick={() => onOpenArticle(a.id)}
              className={styles.articleCard}
            >
              <div className={styles.articleTopik}>{a.topik}</div>
              <div className={styles.articleJudul}>{a.judul}</div>
              <div className={styles.articleRingkasan}>{a.ringkasan}</div>
              <div className={styles.articleCta}>Baca selengkapnya →</div>
            </div>
          ))}
        </AutoCarousel>
      </div>

      <p className={styles.disclaimer}>
        Data paket MCU disusun dari informasi yang diberikan pengguna. Konten
        edukasi ditulis oleh tim CekGinjal berdasarkan pengetahuan medis umum,
        bukan kutipan artikel berita tertentu. Jadwal/tarif dapat berubah —
        konfirmasikan langsung ke rumah sakit terkait.
      </p>
    </div>
  );
}
