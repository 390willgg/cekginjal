import { useEffect } from "react";
import { motion } from "framer-motion";
import type { RsItem } from "../types";
import styles from "./RsModal.module.css";

export function RsModal({ rs, onClose }: { rs: RsItem; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      onClick={onClose}
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className={styles.card}
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className={styles.closeBtn}
        >
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
      </motion.div>
    </motion.div>
  );
}
