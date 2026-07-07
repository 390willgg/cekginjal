import type { RsItem } from "../types";
import styles from "./RsModal.module.css";

export function RsModal({ rs, onClose }: { rs: RsItem; onClose: () => void }) {
  return (
    <div onClick={onClose} className={styles.overlay}>
      <div onClick={(e) => e.stopPropagation()} className={styles.card}>
        <button onClick={onClose} className={styles.closeBtn}>
          ×
        </button>
        <div className={styles.tags}>
          <span className={styles.provinsi}>{rs.provinsi}</span>
          <span className={styles.promo}>Mendatang: {rs.promo}</span>
        </div>
        <h2 className={styles.title}>{rs.nama}</h2>
        <div className={styles.paket}>{rs.paket}</div>
        <div className={styles.details}>
          <div>
            <b>Alamat:</b> {rs.alamat}
          </div>
          <div>
            <b>Kontak:</b> {rs.kontak}
          </div>
          <div>
            <b>Jam MCU:</b> {rs.jam}
          </div>
        </div>
        <p className={styles.disclaimer}>
          Bukan layanan gratis untuk umum — tarif mengikuti ketentuan resmi
          BLU/Kemenkes. Konfirmasikan jadwal & tarif terbaru langsung ke rumah
          sakit.
        </p>
      </div>
    </div>
  );
}
