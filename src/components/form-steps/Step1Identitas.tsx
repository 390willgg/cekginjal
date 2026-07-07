import type { FormData } from "../../types";
import { seg, labelStyle, inputBase } from "./shared";
import styles from "./Step1Identitas.module.css";

export function Step1Identitas({
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
      <h2 className={styles.title}>Identitas pasien</h2>
      <p className={styles.subtitle}>
        Data dasar pasien. Aktifkan anonim bila tidak ingin mencatat nama.
      </p>
      <label className={styles.anonimLabel}>
        <input
          type="checkbox"
          checked={data.anonim}
          onChange={(e) => onField("anonim", e.target.checked)}
          className={styles.checkbox}
        />
        <span className={styles.anonimText}>
          Pasien anonim (kode dibuat otomatis)
        </span>
      </label>
      {!data.anonim && (
        <div className={styles.namaWrap}>
          <div className={labelStyle}>Nama pasien</div>
          <input
            type="text"
            value={data.nama}
            onChange={(e) => onField("nama", e.target.value)}
            placeholder="Tulis nama lengkap"
            className={`${inputBase} ${styles.namaInput}`}
          />
        </div>
      )}
      <div className={styles.row}>
        <div className={styles.col}>
          <div className={labelStyle}>Umur</div>
          <div className={styles.inputWrap}>
            <input
              type="number"
              inputMode="numeric"
              value={data.umur}
              onChange={(e) => onField("umur", e.target.value)}
              placeholder="0"
              className={`${inputBase} ${styles.umurInput}`}
            />
            <span className={styles.unit}>th</span>
          </div>
        </div>
        <div className={styles.colWide}>
          <div className={labelStyle}>Jenis kelamin</div>
          <div className={styles.genderRow}>
            <button
              onClick={() => onPick("gender", "L")}
              className={seg(data.gender === "L")}
            >
              Laki-laki
            </button>
            <button
              onClick={() => onPick("gender", "P")}
              className={seg(data.gender === "P")}
            >
              Perempuan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
