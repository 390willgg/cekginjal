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
    <div onClick={onClose} className={styles.overlay}>
      <div onClick={(e) => e.stopPropagation()} className={styles.card}>
        <button onClick={onClose} className={styles.closeBtn}>
          ×
        </button>
        <div className={styles.topik}>{article.topik}</div>
        <h2 className={styles.title}>{article.judul}</h2>
        <div className={styles.body}>{article.isi}</div>
        <div className={styles.footer}>
          Ditulis oleh tim edukasi CekGinjal berdasarkan pengetahuan medis umum.
        </div>
      </div>
    </div>
  );
}
