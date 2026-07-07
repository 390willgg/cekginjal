import type { FormData } from "../../types";
import { derive } from "../../lib/derive";
import { labelStyle, inputBase } from "./shared";
import styles from "./Step4TekananDarah.module.css";

export function Step4TekananDarah({
  data,
  onField,
}: {
  data: FormData;
  onField: (field: keyof FormData, value: string | boolean) => void;
}) {
  const der = derive(data);
  return (
    <div>
      <h2 className={styles.title}>Tekanan darah</h2>
      <p className={styles.subtitle}>
        Masukkan sistolik / diastolik & tanggal pengukuran.
      </p>
      <div className={styles.infoBox}>
        <b className={styles.infoStrong}>Sistolik</b> = angka <b>depan</b>{" "}
        (tekanan saat jantung memompa).{" "}
        <b className={styles.infoStrong}>Diastolik</b> = angka <b>belakang</b>{" "}
        (saat jantung beristirahat).
        <div className={styles.example}>
          Contoh penulisan <b className={styles.exampleValue}>120/80 mmHg</b> →
          sistolik <b className={styles.exampleValue}>120</b>, diastolik{" "}
          <b className={styles.exampleValue}>80</b>.
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          <div className={labelStyle}>
            Sistolik <span className={styles.labelHint}>(angka depan)</span>
          </div>
          <div className={styles.inputWrap}>
            <input
              type="number"
              inputMode="numeric"
              value={data.sys}
              onChange={(e) => onField("sys", e.target.value)}
              placeholder="0"
              className={`${inputBase} ${styles.bpInput}`}
            />
            <span className={styles.unit}>mmHg</span>
          </div>
        </div>
        <div className={styles.col}>
          <div className={labelStyle}>
            Diastolik <span className={styles.labelHint}>(angka belakang)</span>
          </div>
          <div className={styles.inputWrap}>
            <input
              type="number"
              inputMode="numeric"
              value={data.dia}
              onChange={(e) => onField("dia", e.target.value)}
              placeholder="0"
              className={`${inputBase} ${styles.bpInput}`}
            />
            <span className={styles.unit}>mmHg</span>
          </div>
        </div>
      </div>
      <div className={styles.dateSection}>
        <div className={labelStyle}>Tanggal ukur</div>
        <input
          type="date"
          value={data.bpDate}
          onChange={(e) => onField("bpDate", e.target.value)}
          className={`${inputBase} ${styles.dateInput}`}
        />
      </div>
      {der.bpValShow && (
        <div className={styles.confidence}>
          <div className={styles.dot} style={{ background: der.bpValColor }} />
          <div className={styles.confidenceText}>
            Keyakinan data:{" "}
            <b className={styles.confidenceStrong}>{der.bpValLabel}</b>
          </div>
          <div className={styles.cat} style={{ color: der.bpColor }}>
            {der.bpCat}
          </div>
        </div>
      )}
    </div>
  );
}
