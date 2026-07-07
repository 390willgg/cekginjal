import type { FormData } from "../../types";
import { seg } from "./shared";
import styles from "./Step5Riwayat.module.css";

export function Step5Riwayat({
  data,
  onField,
  onPick,
}: {
  data: FormData;
  onField: (field: keyof FormData, value: string | boolean) => void;
  onPick: (field: keyof FormData, value: string) => void;
}) {
  return (
    <div>
      <h2 className={styles.title}>Riwayat penyakit</h2>
      <p className={styles.subtitle}>Pilih riwayat yang dimiliki pasien.</p>
      <div className={styles.list}>
        <label className={styles.item}>
          <input
            type="checkbox"
            checked={data.diabetes}
            onChange={(e) => onField("diabetes", e.target.checked)}
            className={styles.checkbox}
          />
          <div className={styles.body}>
            <div className={styles.itemTitle}>Diabetes melitus</div>
            <div className={styles.itemDesc}>
              Tipe 1 berkontribusi lebih besar pada risiko CKD daripada Tipe 2
            </div>
          </div>
        </label>
        {data.diabetes && (
          <div className={styles.subSection}>
            <div className={styles.subKicker}>Tipe diabetes</div>
            <div className={styles.subRow}>
              <button
                onClick={() => onPick("dmType", "tipe1")}
                className={seg(data.dmType === "tipe1")}
              >
                Tipe 1
              </button>
              <button
                onClick={() => onPick("dmType", "tipe2")}
                className={seg(data.dmType === "tipe2")}
              >
                Tipe 2
              </button>
            </div>
          </div>
        )}
        <label className={styles.item}>
          <input
            type="checkbox"
            checked={data.hipertensi}
            onChange={(e) => onField("hipertensi", e.target.checked)}
            className={styles.checkbox}
          />
          <span className={styles.itemLabel}>Hipertensi</span>
        </label>
        <label className={styles.item}>
          <input
            type="checkbox"
            checked={data.keluarga}
            onChange={(e) => onField("keluarga", e.target.checked)}
            className={styles.checkbox}
          />
          <span className={styles.itemLabel}>
            Riwayat keluarga penyakit ginjal
          </span>
        </label>
        <label className={styles.item}>
          <input
            type="checkbox"
            checked={data.jantung}
            onChange={(e) => onField("jantung", e.target.checked)}
            className={styles.checkbox}
          />
          <span className={styles.itemLabel}>Riwayat penyakit jantung</span>
        </label>
      </div>
    </div>
  );
}
