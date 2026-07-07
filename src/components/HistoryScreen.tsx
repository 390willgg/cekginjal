import type { HistoryItem } from "../types";
import styles from "./HistoryScreen.module.css";

export function HistoryScreen({
  history,
  onStart,
  onViewItem,
  onDeleteItem,
}: {
  history: HistoryItem[];
  onStart: () => void;
  onViewItem: (id: number) => void;
  onDeleteItem: (id: number) => void;
}) {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Riwayat Skrining</h1>
      <p className={styles.subtitle}>Data tersimpan di perangkat ini.</p>
      {history.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyTitle}>Belum ada riwayat</div>
          <div className={styles.emptySub}>
            Selesaikan skrining lalu simpan untuk melihatnya di sini.
          </div>
          <button onClick={onStart} className={styles.emptyBtn}>
            Mulai Skrining Baru
          </button>
        </div>
      ) : (
        <div className={styles.list}>
          {history.map((h) => (
            <div
              key={h.id}
              onClick={() => onViewItem(h.id)}
              className={styles.item}
            >
              <div
                className={styles.riskBadge}
                style={{ background: h.riskColor }}
              >
                <div className={styles.riskPct}>{h.riskPct}</div>
                <div className={styles.riskLabel}>PCT</div>
              </div>
              <div className={styles.info}>
                <div className={styles.nama}>{h.nama}</div>
                <div className={styles.meta}>
                  {h.umur} · {h.tanggalLabel} · keyakinan {h.confidencePct}%
                </div>
              </div>
              <div className={styles.right}>
                <div className={styles.riskCat} style={{ color: h.riskColor }}>
                  {h.riskCat}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItem(h.id);
                  }}
                  className={styles.deleteBtn}
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
