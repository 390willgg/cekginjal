import type { FormData } from "../../types";
import { derive } from "../../lib/derive";
import { seg, labelStyle, inputBase } from "./shared";
import styles from "./Step3GulaDarah.module.css";

export function Step3GulaDarah({
  data,
  onField,
  onPick,
}: {
  data: FormData;
  onField: (field: keyof FormData, value: string | boolean) => void;
  onPick: (field: keyof FormData, value: string) => void;
}) {
  const der = derive(data);
  return (
    <div>
      <h2 className={styles.title}>Gula darah</h2>
      <p className={styles.subtitle}>
        Masukkan hasil & tanggal pengecekan. Tanggal yang lama menurunkan
        keyakinan hasil.
      </p>
      <div className={styles.section}>
        <div className={labelStyle}>Jenis pemeriksaan</div>
        <div className={styles.typeRow}>
          <button
            onClick={() => onPick("gdType", "puasa")}
            className={seg(data.gdType === "puasa")}
          >
            Gula darah puasa
          </button>
          <button
            onClick={() => onPick("gdType", "sewaktu")}
            className={seg(data.gdType === "sewaktu")}
          >
            Gula darah sewaktu
          </button>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          <div className={labelStyle}>Hasil</div>
          <div className={styles.inputWrap}>
            <input
              type="number"
              inputMode="decimal"
              value={data.gdValue}
              onChange={(e) => onField("gdValue", e.target.value)}
              placeholder="0"
              className={`${inputBase} ${styles.hasilInput}`}
            />
            <span className={styles.unit}>mg/dL</span>
          </div>
        </div>
        <div className={styles.col}>
          <div className={labelStyle}>Tanggal cek</div>
          <input
            type="date"
            aria-label="Tanggal cek"
            value={data.gdDate}
            onChange={(e) => onField("gdDate", e.target.value)}
            className={`${inputBase} ${styles.dateInput}`}
          />
        </div>
      </div>
      {der.gdValShow && (
        <div className={styles.confidence}>
          <div className={styles.dot} style={{ background: der.gdValColor }} />
          <div className={styles.confidenceText}>
            Keyakinan data:{" "}
            <b className={styles.confidenceStrong}>{der.gdValLabel}</b>
          </div>
          <div className={styles.cat} style={{ color: der.gdColor }}>
            {der.gdCat}
          </div>
        </div>
      )}
    </div>
  );
}
