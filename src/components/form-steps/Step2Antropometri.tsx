import type { FormData } from "../../types";
import { derive } from "../../lib/derive";
import { labelStyle, inputBase } from "./shared";
import styles from "./Step2Antropometri.module.css";

export function Step2Antropometri({
  data,
  onField,
}: {
  data: FormData;
  onField: (field: keyof FormData, value: string | boolean) => void;
}) {
  const der = derive(data);
  return (
    <div>
      <h2 className={styles.title}>Antropometri & IMT</h2>
      <p className={styles.subtitle}>
        Indeks Massa Tubuh dihitung otomatis dari tinggi & berat badan.
      </p>
      <div className={styles.row}>
        <div className={styles.col}>
          <div className={labelStyle}>Tinggi badan</div>
          <div className={styles.inputWrap}>
            <input
              type="number"
              inputMode="decimal"
              value={data.tinggi}
              onChange={(e) => onField("tinggi", e.target.value)}
              placeholder="0"
              className={`${inputBase} ${styles.tinggiInput}`}
            />
            <span className={styles.unit}>cm</span>
          </div>
        </div>
        <div className={styles.col}>
          <div className={labelStyle}>Berat badan</div>
          <div className={styles.inputWrap}>
            <input
              type="number"
              inputMode="decimal"
              value={data.berat}
              onChange={(e) => onField("berat", e.target.value)}
              placeholder="0"
              className={`${inputBase} ${styles.beratInput}`}
            />
            <span className={styles.unit}>kg</span>
          </div>
        </div>
      </div>
      {der.bmiShow ? (
        <div className={styles.bmiCard}>
          <div className={styles.bmiHeader}>
            <div>
              <div className={styles.bmiKicker}>Indeks Massa Tubuh</div>
              <div className={styles.bmiValue}>{der.bmi}</div>
            </div>
            <div className={styles.bmiBadge} style={{ background: der.bmiColor }}>
              {der.bmiCat}
            </div>
          </div>
          <div className={styles.bmiTrack}>
            <div
              className={styles.bmiMarker}
              style={{ left: `${der.bmiPos}%` }}
            />
          </div>
          <div className={styles.bmiLegend}>
            <span>Kurus</span>
            <span>Normal</span>
            <span>Gemuk</span>
            <span>Obesitas</span>
          </div>
        </div>
      ) : (
        <div className={styles.emptyCard}>
          Isi tinggi & berat untuk melihat IMT
        </div>
      )}
    </div>
  );
}
