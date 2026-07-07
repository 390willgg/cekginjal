import { useMemo } from "react";
import type { FormData } from "../types";
import { derive, buildReko, fmtDate } from "../lib/derive";
import { AutoCarousel } from "./AutoCarousel";
import styles from "./ResultScreen.module.css";

export function ResultScreen({
  data,
  provinsi,
  onSave,
  onStart,
  onOpenRs,
  onOpenArticle,
}: {
  data: FormData;
  provinsi: string;
  onSave: () => void;
  onStart: () => void;
  onOpenRs: (id: number) => void;
  onOpenArticle: (id: number) => void;
}) {
  const der = derive(data);
  const reko = useMemo(() => buildReko(provinsi), [provinsi]);
  const patientName = data.anonim
    ? "Pasien Anonim"
    : data.nama.trim() || "Tanpa nama";
  const todayStr = fmtDate(new Date());

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <div className={styles.patientName}>{patientName}</div>
          <div className={styles.patientMeta}>
            {der.rUmur} · Skrining {todayStr}
          </div>
        </div>
      </div>

      {/* risk */}
      <div className={styles.riskCard} style={{ background: der.riskBg }}>
        <div className={styles.kicker}>Estimasi risiko CKD</div>
        <div className={styles.riskValueRow}>
          <div className={styles.riskPct} style={{ color: der.riskColor }}>
            {der.riskPct}
            <span className={styles.riskPctUnit}>%</span>
          </div>
          <div
            className={styles.riskBadge}
            style={{ background: der.riskColor }}
          >
            Risiko {der.riskCat}
          </div>
        </div>
        <div className={styles.riskTrack}>
          <div
            className={styles.riskMarker}
            style={{ left: der.riskMarkerLeft }}
          />
        </div>
        <div className={styles.riskLegend}>
          <span>Rendah</span>
          <span>Sedang</span>
          <span>Tinggi</span>
        </div>
      </div>

      {/* kidney age */}
      {der.kidneyAgeShow && (
        <div className={styles.card}>
          <div className={styles.kicker}>Perkiraan usia ginjal</div>
          <div className={styles.kidneyAgeRow}>
            <div className={styles.kidneyAgeCol}>
              <div className={styles.kidneyAgeLabel}>Usia Anda</div>
              <div className={styles.kidneyAgeValue}>
                {der.realAge}
                <span className={styles.kidneyAgeUnit}> th</span>
              </div>
            </div>
            <div className={styles.kidneyAgeArrow}>→</div>
            <div className={styles.kidneyAgeCol}>
              <div className={styles.kidneyAgeLabel}>
                Usia ginjal diperkirakan
              </div>
              <div
                className={styles.kidneyAgeValueEst}
                style={{ color: der.kidneyAgeColor }}
              >
                {der.kidneyAge}
                <span className={styles.kidneyAgeUnitEst}> th</span>
              </div>
            </div>
          </div>
          <div className={styles.kidneyAgeNote}>
            Dengan usia <b className={styles.strong16}>{der.realAge} tahun</b>,
            kondisi kesehatan ginjal Anda diperkirakan{" "}
            <b style={{ color: der.kidneyAgeColor }}>{der.kidneyAgeText}</b>
          </div>
        </div>
      )}

      {/* confidence */}
      <div className={styles.card}>
        <div className={styles.confidenceHeader}>
          <div className={styles.kicker}>Tingkat keyakinan data</div>
          <div
            className={styles.confidencePct}
            style={{ color: der.confidenceColor }}
          >
            {der.confidencePct}%
          </div>
        </div>
        <div className={styles.confidenceTrack}>
          <div
            className={styles.confidenceFill}
            style={{
              width: `${der.confidencePct}%`,
              background: der.confidenceColor,
            }}
          />
        </div>
        <div className={styles.confidenceNote}>
          <b style={{ color: der.confidenceColor }}>{der.confidenceLabel}.</b>{" "}
          Semakin lama tanggal pengecekan gula darah / tekanan darah, semakin
          rendah keyakinan terhadap kesimpulan risiko ini.
        </div>
      </div>

      {/* factors */}
      <div className={styles.card}>
        <div className={`${styles.kicker} ${styles.factorsKicker}`}>
          Faktor risiko terdeteksi
        </div>
        {der.factorsEmpty ? (
          <div className={styles.factorsEmpty}>
            Tidak ada faktor risiko mayor terdeteksi.
          </div>
        ) : (
          der.factors.map((f, i) => (
            <div key={i} className={styles.factorRow}>
              <div className={styles.factorLabel}>{f.label}</div>
              <div className={styles.factorPts}>{f.pts}</div>
            </div>
          ))
        )}
      </div>

      {/* recap */}
      <div className={styles.recapGrid}>
        {[
          {
            label: "IMT",
            value: der.bmi,
            sub: der.bmiCat,
            color: der.bmiColor,
          },
          {
            label: "Gula darah",
            value: `${data.gdValue || "–"}`,
            sub: der.gdCat,
            color: der.gdColor,
            unit: " mg/dL",
          },
          {
            label: "Tekanan darah",
            value: `${data.sys || "–"}/${data.dia || "–"}`,
            sub: der.bpCat,
            color: der.bpColor,
          },
          {
            label: "Usia",
            value: der.rUmur,
            sub: der.riwayatLabel,
            color: "#7C9088",
          },
        ].map((item, i) => (
          <div key={i} className={styles.recapCard}>
            <div className={styles.recapLabel}>{item.label}</div>
            <div className={styles.recapValue}>
              {item.value}
              {item.unit && (
                <span className={styles.recapUnit}>{item.unit}</span>
              )}
            </div>
            <div className={styles.recapSub} style={{ color: item.color }}>
              {item.sub}
            </div>
          </div>
        ))}
      </div>

      {/* rekomendasi */}
      <div className={styles.rekomendasiCard}>
        <div className={styles.rekomendasiKicker}>
          Rekomendasi tindak lanjut
        </div>
        {der.rekomendasi.map((r, i) => (
          <div key={i} className={styles.rekomendasiRow}>
            <span className={styles.rekomendasiBullet}>›</span>
            <span>{r}</span>
          </div>
        ))}
      </div>

      {/* edukasi */}
      <div className={styles.card}>
        <div className={`${styles.kicker} ${styles.edukasiKicker}`}>
          Edukasi & gaya hidup
        </div>
        {der.edukasi.map((e, i) => (
          <div key={i} className={styles.edukasiRow}>
            <div className={styles.edukasiCheck}>✓</div>
            <div className={styles.edukasiText}>{e}</div>
          </div>
        ))}
      </div>

      {/* shortcut: MCU packages */}
      <div className={styles.shortcutSection}>
        <div className={styles.shortcutTitle}>
          Paket MCU Ginjal Bersubsidi di RS Vertikal Kemenkes
        </div>
        <AutoCarousel>
          {reko.rsList.slice(0, 4).map((r) => (
            <div
              key={r.id}
              onClick={() => onOpenRs(r.id)}
              className={styles.mcuCard}
            >
              <span className={styles.mcuProvinsi}>{r.provinsi}</span>
              <div className={styles.mcuNama}>{r.nama}</div>
              <div className={styles.mcuPaket}>{r.paket}</div>
              <div className={styles.mcuCta}>Lihat detail →</div>
            </div>
          ))}
        </AutoCarousel>
      </div>

      {/* shortcut: articles */}
      <div className={styles.shortcutSectionSpaced}>
        <div className={styles.shortcutTitle}>Edukasi Kesehatan Ginjal</div>
        <AutoCarousel>
          {reko.articleCards.slice(0, 4).map((a) => (
            <div
              key={a.id}
              onClick={() => onOpenArticle(a.id)}
              className={styles.articleCard}
            >
              <div className={styles.articleTopik}>{a.topik}</div>
              <div className={styles.articleJudul}>{a.judul}</div>
              <div className={styles.articleCta}>Baca selengkapnya →</div>
            </div>
          ))}
        </AutoCarousel>
      </div>

      <p className={styles.footerNote}>
        Estimasi skrining — bukan diagnosis. Keputusan klinis tetap memerlukan
        pemeriksaan fungsi ginjal oleh tenaga medis.
      </p>

      <div className={styles.actions}>
        <button onClick={onSave} className={styles.saveBtn}>
          Simpan ke Riwayat
        </button>
        <button onClick={onStart} className={styles.newBtn}>
          Skrining Baru
        </button>
      </div>
    </div>
  );
}
