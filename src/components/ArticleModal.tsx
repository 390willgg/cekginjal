import { motion } from "framer-motion";
import type { ArticleItem } from "../types";
import styles from "./ArticleModal.module.css";

export function ArticleModal({
  article,
  onClose,
}: {
  article: ArticleItem;
  onClose: () => void;
}) {
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
        <button onClick={onClose} className={styles.closeBtn} aria-label="Tutup">
          ×
        </button>
        <div className={styles.topik}>{article.topik}</div>
        <h2 className={styles.title}>{article.judul}</h2>
        <div className={styles.body}>{article.isi}</div>
        <div className={styles.footer}>
          Ditulis oleh tim edukasi CekGinjal berdasarkan pengetahuan medis umum.
        </div>
      </motion.div>
    </motion.div>
  );
}
