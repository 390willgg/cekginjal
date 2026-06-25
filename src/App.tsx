import { useState, useEffect } from 'react'
import { SHEETS_URL } from './config'

// ─── types ───────────────────────────────────────────────────────────────────

type Screen = 'landing' | 'form' | 'result' | 'history'
type Gender = 'L' | 'P' | ''
type GdType = 'puasa' | 'sewaktu'
type DmType = 'tipe1' | 'tipe2'
type Aktivitas = 'rendah' | 'sedang' | 'berat' | ''

interface FormData {
  nama: string
  anonim: boolean
  umur: string
  gender: Gender
  tinggi: string
  berat: string
  gdValue: string
  gdType: GdType
  gdDate: string
  sys: string
  dia: string
  bpDate: string
  diabetes: boolean
  dmType: DmType
  hipertensi: boolean
  keluarga: boolean
  jantung: boolean
  aktivitas: Aktivitas
}

interface HistoryItem {
  id: number
  nama: string
  tanggalLabel: string
  umur: string
  riskPct: number
  riskCat: string
  riskColor: string
  confidencePct: number
  data: FormData
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function blank(): FormData {
  return {
    nama: '', anonim: false, umur: '', gender: '',
    tinggi: '', berat: '',
    gdValue: '', gdType: 'puasa', gdDate: '',
    sys: '', dia: '', bpDate: '',
    diabetes: false, dmType: 'tipe2',
    hipertensi: false, keluarga: false, jantung: false,
    aktivitas: '',
  }
}

function fmtDate(d: Date) {
  const m = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`
}

function validity(dateStr: string) {
  if (!dateStr) return { score: null, label: 'Belum diisi', color: '#9AABA5' }
  const dt = new Date(dateStr)
  const days = Math.floor((Date.now() - dt.getTime()) / 86400000)
  if (days < 0) return { score: 0.6, label: 'Tanggal di masa depan?', color: '#C77A0A' }
  if (days <= 90) return { score: 1, label: '≤ 3 bln · valid penuh', color: '#1A8754' }
  if (days <= 180) return { score: 0.7, label: '3–6 bln · keyakinan turun', color: '#C77A0A' }
  if (days <= 365) return { score: 0.45, label: '6–12 bln · keyakinan rendah', color: '#C77A0A' }
  return { score: 0.2, label: '> 12 bln · sangat rendah', color: '#C5453B' }
}

function derive(d: FormData) {
  const t = parseFloat(d.tinggi), b = parseFloat(d.berat), umur = parseFloat(d.umur)

  // BMI
  let bmiShow = false, bmiHide = true, bmi = '–', bmiCat = '–', bmiColor = '#9AABA5', bmiPos = 0
  if (t > 0 && b > 0) {
    const m = t / 100; const bmiVal = b / (m * m)
    bmi = bmiVal.toFixed(1); bmiShow = true; bmiHide = false
    bmiPos = Math.max(2, Math.min(98, (bmiVal - 15) / 20 * 100))
    if (bmiVal < 18.5) { bmiCat = 'Kurus'; bmiColor = '#C77A0A' }
    else if (bmiVal < 25) { bmiCat = 'Normal'; bmiColor = '#1A8754' }
    else if (bmiVal < 30) { bmiCat = 'Kegemukan'; bmiColor = '#C77A0A' }
    else { bmiCat = 'Obesitas'; bmiColor = '#C5453B' }
  }

  // Blood sugar
  const gd = parseFloat(d.gdValue); let gdCat = '–', gdColor = '#9AABA5'
  if (gd > 0) {
    if (d.gdType === 'puasa') {
      if (gd < 100) { gdCat = 'Normal'; gdColor = '#1A8754' }
      else if (gd < 126) { gdCat = 'Pra-diabetes'; gdColor = '#C77A0A' }
      else { gdCat = 'Tinggi'; gdColor = '#C5453B' }
    } else {
      if (gd < 140) { gdCat = 'Normal'; gdColor = '#1A8754' }
      else if (gd < 200) { gdCat = 'Waspada'; gdColor = '#C77A0A' }
      else { gdCat = 'Tinggi'; gdColor = '#C5453B' }
    }
  }
  const gv = validity(d.gdDate)

  // Blood pressure
  const sys = parseFloat(d.sys), dia = parseFloat(d.dia); let bpCat = '–', bpColor = '#9AABA5'
  if (sys > 0 || dia > 0) {
    if (sys >= 140 || dia >= 90) { bpCat = 'Hipertensi'; bpColor = '#C5453B' }
    else if (sys >= 120 || dia >= 80) { bpCat = 'Pra-hipertensi'; bpColor = '#C77A0A' }
    else { bpCat = 'Normal'; bpColor = '#1A8754' }
  }
  const bv = validity(d.bpDate)

  // Risk factors
  const f: { label: string; pts: number }[] = []
  if (umur >= 60) f.push({ label: 'Usia ≥ 60 tahun', pts: 12 })
  else if (umur >= 45) f.push({ label: 'Usia 45–59 tahun', pts: 6 })
  if (bmiCat === 'Obesitas') f.push({ label: 'Obesitas (IMT)', pts: 10 })
  else if (bmiCat === 'Kegemukan') f.push({ label: 'Kegemukan (IMT)', pts: 5 })
  if (d.diabetes) {
    if (d.dmType === 'tipe1') f.push({ label: 'Riwayat Diabetes Tipe 1', pts: 28 })
    else f.push({ label: 'Riwayat Diabetes Tipe 2', pts: 16 })
  }
  if (d.hipertensi) f.push({ label: 'Riwayat Hipertensi', pts: 18 })
  if (gdCat === 'Tinggi') f.push({ label: 'Gula darah tinggi', pts: 14 })
  else if (gdCat === 'Pra-diabetes' || gdCat === 'Waspada') f.push({ label: 'Gula darah di atas normal', pts: 7 })
  if (bpCat === 'Hipertensi') f.push({ label: 'Tekanan darah tinggi', pts: 14 })
  else if (bpCat === 'Pra-hipertensi') f.push({ label: 'Tekanan darah meningkat', pts: 7 })
  if (d.keluarga) f.push({ label: 'Riwayat keluarga penyakit ginjal', pts: 10 })
  if (d.jantung) f.push({ label: 'Riwayat penyakit jantung', pts: 8 })
  if (d.aktivitas === 'rendah') f.push({ label: 'Aktivitas fisik rendah', pts: 8 })

  const raw = f.reduce((a, x) => a + x.pts, 0)
  const riskPct = Math.min(100, Math.round(raw))
  const riskMarkerLeft = Math.max(3, Math.min(97, riskPct)) + '%'
  let riskCat = '', riskColor = '', riskBg = ''
  if (riskPct < 25) { riskCat = 'Rendah'; riskColor = '#1A8754'; riskBg = '#E7F4ED' }
  else if (riskPct < 50) { riskCat = 'Sedang'; riskColor = '#C77A0A'; riskBg = '#FBF1E2' }
  else { riskCat = 'Tinggi'; riskColor = '#C5453B'; riskBg = '#FBEAE8' }

  // Kidney age
  let kidneyAgeShow = false, realAge = 0, kidneyAge = 0, kidneyAgeColor = '#9AABA5', kidneyAgeText = ''
  if (umur > 0) {
    let off = Math.round((riskPct - 15) * 0.32); if (off < -5) off = -5
    kidneyAge = Math.max(1, Math.round(umur + off))
    realAge = Math.round(umur); kidneyAgeShow = true
    if (off <= 0) { kidneyAgeColor = '#1A8754'; kidneyAgeText = 'setara atau lebih muda dari usia Anda — kondisi ginjal tergolong terjaga. Pertahankan gaya hidup sehat.' }
    else if (off <= 10) { kidneyAgeColor = '#C77A0A'; kidneyAgeText = `sekitar ${off} tahun lebih tua dari usia Anda. Mulai perbaiki gaya hidup untuk menjaganya.` }
    else { kidneyAgeColor = '#C5453B'; kidneyAgeText = `sekitar ${off} tahun lebih tua dari usia Anda. Perlu perhatian khusus & pemeriksaan lanjutan.` }
  }

  // Confidence
  const scores: number[] = []
  if (d.gdDate && gv.score !== null) scores.push(gv.score)
  if (d.bpDate && bv.score !== null) scores.push(bv.score)
  const conf = scores.length ? scores.reduce((a, x) => a + x, 0) / scores.length : null
  const confidencePct = conf === null ? 0 : Math.round(conf * 100)
  let confidenceLabel = '', confidenceColor = ''
  if (conf === null) { confidenceLabel = 'Data pengukuran belum diisi'; confidenceColor = '#9AABA5' }
  else if (conf >= 0.85) { confidenceLabel = 'Keyakinan tinggi — data terbaru'; confidenceColor = '#1A8754' }
  else if (conf >= 0.6) { confidenceLabel = 'Keyakinan sedang — sebagian data mulai lama'; confidenceColor = '#C77A0A' }
  else { confidenceLabel = 'Keyakinan rendah — data sudah lama'; confidenceColor = '#C5453B' }

  const isSehat = riskCat === 'Rendah' && bmiCat === 'Normal' &&
    (gdCat === 'Normal' || gdCat === '–') && (bpCat === 'Normal' || bpCat === '–') &&
    !d.diabetes && !d.hipertensi && !d.keluarga && !d.jantung

  // Rekomendasi
  const rekomendasi: string[] = []
  if (riskCat === 'Tinggi') rekomendasi.push('Rujuk ke dokter/puskesmas untuk pemeriksaan fungsi ginjal (eGFR & urinalisis).')
  else if (riskCat === 'Sedang') {
    rekomendasi.push('Lakukan pemeriksaan lanjutan dan kendalikan faktor risiko.')
    rekomendasi.push('Ulangi skrining dalam 3 bulan.')
  } else if (isSehat) {
    rekomendasi.push('✅ Hasil tergolong sehat — pertahankan kondisi ini.')
    rekomendasi.push('Lanjutkan pola hidup sehat & aktivitas fisik yang sudah baik.')
    rekomendasi.push('Lakukan medical check-up rutin tiap 6–12 bulan untuk memantau fungsi ginjal.')
    rekomendasi.push('Cek tekanan darah & gula darah minimal sekali setahun.')
  } else {
    rekomendasi.push('Risiko rendah. Pertahankan pola hidup sehat.')
    rekomendasi.push('Skrining ulang tiap 6–12 bulan.')
  }
  if (conf !== null && conf < 0.6) rekomendasi.push('⚠ Perbarui hasil gula darah / tekanan darah terbaru agar kesimpulan lebih akurat.')
  if (conf === null) rekomendasi.push('⚠ Lengkapi data gula darah & tekanan darah beserta tanggalnya.')

  // Edukasi
  const edukasi: string[] = []
  edukasi.push('Perbanyak aktivitas fisik — olahraga ringan minimal 3x seminggu, sekitar 30 menit per sesi.')
  edukasi.push('Minum air putih yang cukup, sekitar 8 gelas (±2 liter) per hari.')
  edukasi.push('Kurangi konsumsi garam, gula, dan makanan olahan berlebihan.')
  if (d.diabetes) edukasi.push('Kontrol gula darah secara rutin dan patuhi pengobatan diabetes.')
  if (d.hipertensi) edukasi.push('Pantau tekanan darah berkala dan batasi garam < 1 sendok teh per hari.')
  if (d.diabetes || d.hipertensi) edukasi.push('Lakukan skrining fungsi ginjal lebih sering, mis. tiap 3 bulan, sesuai riwayat penyakit.')
  else edukasi.push('Lakukan skrining kesehatan berkala sesuai anjuran petugas (tiap 6–12 bulan).')
  if (d.aktivitas === 'rendah') edukasi.push('Tingkatkan gerak harian: kurangi duduk lama, perbanyak jalan kaki dan peregangan.')
  edukasi.push('Hindari merokok serta penggunaan obat pereda nyeri berlebihan tanpa anjuran dokter.')
  if (isSehat) {
    edukasi.push('Pertahankan berat badan ideal (IMT 18,5–24,9) yang sudah Anda capai.')
    edukasi.push('Perbanyak sayur & buah, serta jaga porsi makan tetap seimbang.')
    edukasi.push('Tidur cukup 7–8 jam dan kelola stres agar tekanan darah tetap stabil.')
    edukasi.push('Konsistensi adalah kunci — menjaga kebiasaan sehat melindungi ginjal jangka panjang.')
  }

  const rUmur = umur > 0 ? `${d.umur} th` : '–'
  const riw: string[] = []
  if (d.diabetes) riw.push(d.dmType === 'tipe1' ? 'DM Tipe 1' : 'DM Tipe 2')
  if (d.hipertensi) riw.push('Hipertensi')
  const riwayatLabel = riw.length ? riw.join(' · ') : 'Tanpa riwayat'

  return {
    bmiShow, bmiHide, bmi, bmiCat, bmiColor, bmiPos,
    gdCat, gdColor, gdValShow: !!d.gdDate, gdValLabel: gv.label, gdValColor: gv.color,
    bpCat, bpColor, bpValShow: !!d.bpDate, bpValLabel: bv.label, bpValColor: bv.color,
    factors: f.map(x => ({ label: x.label, pts: '+' + x.pts })), factorsEmpty: f.length === 0,
    riskPct, riskMarkerLeft, riskCat, riskColor, riskBg,
    kidneyAgeShow, realAge, kidneyAge, kidneyAgeColor, kidneyAgeText,
    confidencePct, confidenceLabel, confidenceColor,
    rekomendasi, edukasi,
    rUmur, riwayatLabel,
  }
}

// ─── sub-components ───────────────────────────────────────────────────────────

function TopBar({ onHome, onHistory }: { onHome: () => void; onHistory: () => void }) {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #E0E9E6' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '13px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div onClick={onHome} style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer' }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: '#0F766E', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(15,118,110,0.28)' }}>
            <div style={{ width: 13, height: 18, background: '#fff', borderRadius: '50% 50% 50% 50% / 38% 38% 62% 62%' }} />
          </div>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em' }}>CekGinjal</div>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: '0.14em', color: '#7C9088', textTransform: 'uppercase' }}>Skrining CKD</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onHome} style={{ background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#4B635C', cursor: 'pointer', padding: '8px 12px', borderRadius: 9 }}>Beranda</button>
          <button onClick={onHistory} style={{ background: 'none', border: '1.5px solid #CFE0DB', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#0F766E', cursor: 'pointer', padding: '8px 14px', borderRadius: 9 }}>Riwayat</button>
        </div>
      </div>
    </div>
  )
}

const LANDING_STEPS = [
  { no: '01', title: 'Identitas pasien', desc: 'Nama (opsional / anonim), umur, jenis kelamin' },
  { no: '02', title: 'Antropometri & IMT', desc: 'Tinggi & berat → kategori kurus / normal / kegemukan / obesitas' },
  { no: '03', title: 'Gula darah + tanggal', desc: 'Hasil pengecekan beserta tanggal untuk menilai keyakinan data' },
  { no: '04', title: 'Tekanan darah + tanggal', desc: 'Sistolik / diastolik beserta tanggal pengukuran' },
  { no: '05', title: 'Riwayat penyakit', desc: 'Diabetes (tipe 1 / 2), hipertensi, dan lainnya' },
  { no: '06', title: 'Aktivitas fisik', desc: 'Tingkat aktivitas: rendah, sedang, atau berat' },
]

function Landing({ onStart, onHistory }: { onStart: () => void; onHistory: () => void }) {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '42px 20px 64px', animation: 'fadeUp .4s ease' }}>
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#0F766E', fontWeight: 600 }}>Alat bantu skrining · Kader & Petugas</div>
      <h1 style={{ marginTop: 14, fontSize: 38, lineHeight: 1.08, fontWeight: 800, letterSpacing: '-0.025em', maxWidth: '15ch' }}>Skrining Risiko Penyakit Ginjal Kronis</h1>
      <p style={{ marginTop: 16, fontSize: 16.5, lineHeight: 1.6, color: '#4B635C', maxWidth: '54ch' }}>
        Catat data antropometri, gula darah, tekanan darah, dan riwayat penyakit pasien. Sistem menghitung estimasi risiko CKD beserta <b style={{ color: '#16312B' }}>tingkat keyakinan data</b> — semakin lama tanggal pengecekan, semakin rendah keyakinan hasilnya.
      </p>
      <div style={{ marginTop: 28, background: '#fff', border: '1px solid #E1EAE7', borderRadius: 18, padding: 8 }}>
        {LANDING_STEPS.map(st => (
          <div key={st.no} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '15px 14px', borderRadius: 12 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, fontWeight: 600, color: '#0F766E', width: 26, flex: 'none' }}>{st.no}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15.5, fontWeight: 700 }}>{st.title}</div>
              <div style={{ fontSize: 13.5, color: '#6B817A', marginTop: 2 }}>{st.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 26, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <button onClick={onStart} style={{ background: '#0F766E', color: '#fff', border: 'none', borderRadius: 13, padding: '16px 26px', fontFamily: 'inherit', fontSize: 15.5, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(15,118,110,0.25)' }}>Mulai Skrining Baru →</button>
        <button onClick={onHistory} style={{ background: '#fff', color: '#0F766E', border: '1.5px solid #CFE0DB', borderRadius: 13, padding: '16px 24px', fontFamily: 'inherit', fontSize: 15.5, fontWeight: 700, cursor: 'pointer' }}>Lihat Riwayat</button>
      </div>
      <p style={{ marginTop: 30, fontSize: 12.5, lineHeight: 1.55, color: '#8A9D97', borderTop: '1px solid #E1EAE7', paddingTop: 18 }}>
        Hasil bersifat estimasi skrining untuk membantu pengambilan keputusan rujukan — <b>bukan diagnosis</b>. Konfirmasi selalu dengan pemeriksaan klinis (eGFR, urinalisis) oleh tenaga medis.
      </p>
    </div>
  )
}

const STEP_LABELS: Record<number, string> = {
  1: 'Identitas', 2: 'Antropometri', 3: 'Gula Darah',
  4: 'Tekanan Darah', 5: 'Riwayat Penyakit', 6: 'Aktivitas Fisik',
}

function seg(active: boolean): React.CSSProperties {
  return {
    flex: 1, textAlign: 'center', padding: '11px 8px', border: '1.5px solid',
    borderRadius: 11, fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', transition: 'all .15s',
    background: active ? '#0F766E' : '#fff',
    color: active ? '#fff' : '#48605A',
    borderColor: active ? '#0F766E' : '#DCE6E2',
  }
}

function actCard(active: boolean): React.CSSProperties {
  return {
    width: '100%', textAlign: 'left', display: 'block', padding: '15px 16px',
    border: `1.5px solid ${active ? '#0F766E' : '#DCE6E2'}`,
    borderRadius: 13, background: active ? '#F0F8F6' : '#fff',
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
  }
}

function FormScreen({ data, step, onField, onPick, onNext, onPrev }: {
  data: FormData; step: number
  onField: (field: keyof FormData, value: string | boolean) => void
  onPick: (field: keyof FormData, value: string) => void
  onNext: () => void; onPrev: () => void
}) {
  const der = derive(data)
  const inputBase: React.CSSProperties = { width: '100%', border: '1.5px solid #DCE6E2', borderRadius: 12, fontFamily: 'inherit', fontSize: 16, color: '#16312B', background: '#fff', outline: 'none' }
  const mono = "'IBM Plex Mono',monospace"
  const labelStyle: React.CSSProperties = { fontFamily: mono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5A726B', fontWeight: 500, marginBottom: 7 }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '26px 20px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 9 }}>
        <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0F766E', fontWeight: 600 }}>Langkah {step} dari 6</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#16312B' }}>{STEP_LABELS[step]}</div>
      </div>
      <div style={{ height: 6, background: '#DCE7E3', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${step / 6 * 100}%`, background: '#0F766E', borderRadius: 99, transition: 'width .3s ease' }} />
      </div>

      <div key={step} style={{ marginTop: 24, background: '#fff', border: '1px solid #E1EAE7', borderRadius: 18, padding: '26px 22px', animation: 'fadeUp .3s ease' }}>

        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.02em' }}>Identitas pasien</h2>
            <p style={{ fontSize: 14, color: '#6B817A', marginTop: 5 }}>Data dasar pasien. Aktifkan anonim bila tidak ingin mencatat nama.</p>
            <label style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: 22, padding: '13px 15px', border: '1.5px solid #E1EAE7', borderRadius: 13, cursor: 'pointer', background: '#F7FAF9' }}>
              <input type="checkbox" checked={data.anonim} onChange={e => onField('anonim', e.target.checked)} style={{ width: 19, height: 19, accentColor: '#0F766E', cursor: 'pointer' }} />
              <span style={{ fontSize: 14.5, fontWeight: 600, color: '#2C443E' }}>Pasien anonim (kode dibuat otomatis)</span>
            </label>
            {!data.anonim && (
              <div style={{ marginTop: 18 }}>
                <div style={labelStyle}>Nama pasien</div>
                <input type="text" value={data.nama} onChange={e => onField('nama', e.target.value)} placeholder="Tulis nama lengkap" style={{ ...inputBase, padding: '13px 14px' }} />
              </div>
            )}
            <div style={{ display: 'flex', gap: 14, marginTop: 18, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 130 }}>
                <div style={labelStyle}>Umur</div>
                <div style={{ position: 'relative' }}>
                  <input type="number" inputMode="numeric" value={data.umur} onChange={e => onField('umur', e.target.value)} placeholder="0" style={{ ...inputBase, padding: '13px 46px 13px 14px' }} />
                  <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: mono, fontSize: 13, color: '#9AABA5' }}>th</span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={labelStyle}>Jenis kelamin</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => onPick('gender', 'L')} style={seg(data.gender === 'L')}>Laki-laki</button>
                  <button onClick={() => onPick('gender', 'P')} style={seg(data.gender === 'P')}>Perempuan</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.02em' }}>Antropometri & IMT</h2>
            <p style={{ fontSize: 14, color: '#6B817A', marginTop: 5 }}>Indeks Massa Tubuh dihitung otomatis dari tinggi & berat badan.</p>
            <div style={{ display: 'flex', gap: 14, marginTop: 22, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={labelStyle}>Tinggi badan</div>
                <div style={{ position: 'relative' }}>
                  <input type="number" inputMode="decimal" value={data.tinggi} onChange={e => onField('tinggi', e.target.value)} placeholder="0" style={{ ...inputBase, padding: '13px 52px 13px 14px' }} />
                  <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: mono, fontSize: 13, color: '#9AABA5' }}>cm</span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={labelStyle}>Berat badan</div>
                <div style={{ position: 'relative' }}>
                  <input type="number" inputMode="decimal" value={data.berat} onChange={e => onField('berat', e.target.value)} placeholder="0" style={{ ...inputBase, padding: '13px 46px 13px 14px' }} />
                  <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: mono, fontSize: 13, color: '#9AABA5' }}>kg</span>
                </div>
              </div>
            </div>
            {der.bmiShow ? (
              <div style={{ marginTop: 22, background: '#F7FAF9', border: '1px solid #E4EDEA', borderRadius: 14, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7C9088' }}>Indeks Massa Tubuh</div>
                    <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1, marginTop: 5 }}>{der.bmi}</div>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, padding: '7px 14px', borderRadius: 99, color: '#fff', background: der.bmiColor }}>{der.bmiCat}</div>
                </div>
                <div style={{ position: 'relative', marginTop: 18, height: 8, borderRadius: 99, background: 'linear-gradient(90deg,#E0A93B 0 17.5%,#2FAE6B 17.5% 50%,#E0A93B 50% 75%,#D9645A 75% 100%)' }}>
                  <div style={{ position: 'absolute', top: '50%', left: `${der.bmiPos}%`, transform: 'translate(-50%,-50%)', width: 6, height: 18, background: '#fff', border: '2px solid #16312B', borderRadius: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.25)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, fontFamily: mono, fontSize: 10, color: '#9AABA5' }}>
                  <span>Kurus</span><span>Normal</span><span>Gemuk</span><span>Obesitas</span>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 22, background: '#F7FAF9', border: '1px dashed #D5E0DC', borderRadius: 14, padding: 20, textAlign: 'center', fontSize: 13.5, color: '#8A9D97' }}>Isi tinggi & berat untuk melihat IMT</div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.02em' }}>Gula darah</h2>
            <p style={{ fontSize: 14, color: '#6B817A', marginTop: 5 }}>Masukkan hasil & tanggal pengecekan. Tanggal yang lama menurunkan keyakinan hasil.</p>
            <div style={{ marginTop: 22 }}>
              <div style={labelStyle}>Jenis pemeriksaan</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => onPick('gdType', 'puasa')} style={seg(data.gdType === 'puasa')}>Gula darah puasa</button>
                <button onClick={() => onPick('gdType', 'sewaktu')} style={seg(data.gdType === 'sewaktu')}>Gula darah sewaktu</button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 18, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 150 }}>
                <div style={labelStyle}>Hasil</div>
                <div style={{ position: 'relative' }}>
                  <input type="number" inputMode="decimal" value={data.gdValue} onChange={e => onField('gdValue', e.target.value)} placeholder="0" style={{ ...inputBase, padding: '13px 64px 13px 14px' }} />
                  <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: mono, fontSize: 12, color: '#9AABA5' }}>mg/dL</span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 150 }}>
                <div style={labelStyle}>Tanggal cek</div>
                <input type="date" value={data.gdDate} onChange={e => onField('gdDate', e.target.value)} style={{ ...inputBase, padding: '12px 14px', fontSize: 15 }} />
              </div>
            </div>
            {der.gdValShow && (
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, background: '#F7FAF9', border: '1px solid #E4EDEA', borderRadius: 11, padding: '12px 14px' }}>
                <div style={{ width: 9, height: 9, borderRadius: 99, flex: 'none', background: der.gdValColor }} />
                <div style={{ fontSize: 13, color: '#4B635C' }}>Keyakinan data: <b style={{ color: '#16312B' }}>{der.gdValLabel}</b></div>
                <div style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 700, color: der.gdColor }}>{der.gdCat}</div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.02em' }}>Tekanan darah</h2>
            <p style={{ fontSize: 14, color: '#6B817A', marginTop: 5 }}>Masukkan sistolik / diastolik & tanggal pengukuran.</p>
            <div style={{ marginTop: 16, background: '#F2F7F6', border: '1px solid #DCEAE6', borderRadius: 12, padding: '13px 15px', fontSize: 13, lineHeight: 1.6, color: '#4B635C' }}>
              <b style={{ color: '#16312B' }}>Sistolik</b> = angka <b>depan</b> (tekanan saat jantung memompa). <b style={{ color: '#16312B' }}>Diastolik</b> = angka <b>belakang</b> (saat jantung beristirahat).
              <div style={{ marginTop: 7 }}>Contoh penulisan <b style={{ color: '#0F766E' }}>120/80 mmHg</b> → sistolik <b style={{ color: '#0F766E' }}>120</b>, diastolik <b style={{ color: '#0F766E' }}>80</b>.</div>
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 18, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={labelStyle}>Sistolik <span style={{ textTransform: 'none', letterSpacing: 0, color: '#9AABA5' }}>(angka depan)</span></div>
                <div style={{ position: 'relative' }}>
                  <input type="number" inputMode="numeric" value={data.sys} onChange={e => onField('sys', e.target.value)} placeholder="0" style={{ ...inputBase, padding: '13px 58px 13px 14px' }} />
                  <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: mono, fontSize: 12, color: '#9AABA5' }}>mmHg</span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={labelStyle}>Diastolik <span style={{ textTransform: 'none', letterSpacing: 0, color: '#9AABA5' }}>(angka belakang)</span></div>
                <div style={{ position: 'relative' }}>
                  <input type="number" inputMode="numeric" value={data.dia} onChange={e => onField('dia', e.target.value)} placeholder="0" style={{ ...inputBase, padding: '13px 58px 13px 14px' }} />
                  <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: mono, fontSize: 12, color: '#9AABA5' }}>mmHg</span>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 18 }}>
              <div style={labelStyle}>Tanggal ukur</div>
              <input type="date" value={data.bpDate} onChange={e => onField('bpDate', e.target.value)} style={{ ...inputBase, padding: '12px 14px', fontSize: 15 }} />
            </div>
            {der.bpValShow && (
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, background: '#F7FAF9', border: '1px solid #E4EDEA', borderRadius: 11, padding: '12px 14px' }}>
                <div style={{ width: 9, height: 9, borderRadius: 99, flex: 'none', background: der.bpValColor }} />
                <div style={{ fontSize: 13, color: '#4B635C' }}>Keyakinan data: <b style={{ color: '#16312B' }}>{der.bpValLabel}</b></div>
                <div style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 700, color: der.bpColor }}>{der.bpCat}</div>
              </div>
            )}
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.02em' }}>Riwayat penyakit</h2>
            <p style={{ fontSize: 14, color: '#6B817A', marginTop: 5 }}>Pilih riwayat yang dimiliki pasien.</p>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 11 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '15px 16px', border: '1.5px solid #E1EAE7', borderRadius: 13, cursor: 'pointer', background: '#fff' }}>
                <input type="checkbox" checked={data.diabetes} onChange={e => onField('diabetes', e.target.checked)} style={{ width: 20, height: 20, accentColor: '#0F766E', cursor: 'pointer', flex: 'none' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#2C443E' }}>Diabetes melitus</div>
                  <div style={{ fontSize: 12.5, color: '#7C9088' }}>Tipe 1 berkontribusi lebih besar pada risiko CKD daripada Tipe 2</div>
                </div>
              </label>
              {data.diabetes && (
                <div style={{ margin: '-4px 0 4px 16px', paddingLeft: 16, borderLeft: '2px solid #DCE7E3' }}>
                  <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5A726B', fontWeight: 500, marginBottom: 7 }}>Tipe diabetes</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => onPick('dmType', 'tipe1')} style={seg(data.dmType === 'tipe1')}>Tipe 1</button>
                    <button onClick={() => onPick('dmType', 'tipe2')} style={seg(data.dmType === 'tipe2')}>Tipe 2</button>
                  </div>
                </div>
              )}
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '15px 16px', border: '1.5px solid #E1EAE7', borderRadius: 13, cursor: 'pointer', background: '#fff' }}>
                <input type="checkbox" checked={data.hipertensi} onChange={e => onField('hipertensi', e.target.checked)} style={{ width: 20, height: 20, accentColor: '#0F766E', cursor: 'pointer', flex: 'none' }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: '#2C443E' }}>Hipertensi</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '15px 16px', border: '1.5px solid #E1EAE7', borderRadius: 13, cursor: 'pointer', background: '#fff' }}>
                <input type="checkbox" checked={data.keluarga} onChange={e => onField('keluarga', e.target.checked)} style={{ width: 20, height: 20, accentColor: '#0F766E', cursor: 'pointer', flex: 'none' }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: '#2C443E' }}>Riwayat keluarga penyakit ginjal</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '15px 16px', border: '1.5px solid #E1EAE7', borderRadius: 13, cursor: 'pointer', background: '#fff' }}>
                <input type="checkbox" checked={data.jantung} onChange={e => onField('jantung', e.target.checked)} style={{ width: 20, height: 20, accentColor: '#0F766E', cursor: 'pointer', flex: 'none' }} />
                <span style={{ fontSize: 15, fontWeight: 700, color: '#2C443E' }}>Riwayat penyakit jantung</span>
              </label>
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <h2 style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.02em' }}>Aktivitas fisik</h2>
            <p style={{ fontSize: 14, color: '#6B817A', marginTop: 5 }}>Pilih tingkat aktivitas fisik pasien dalam seminggu.</p>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 11 }}>
              {([
                { value: 'rendah', label: 'Rendah · Sedentari', badge: '< 60 mnt/mgg', desc: 'Hampir tidak berolahraga. Contoh: kerja duduk seharian, jarang jalan kaki, banyak rebahan.' },
                { value: 'sedang', label: 'Sedang · Aktif', badge: '75–150 mnt/mgg', desc: 'Olahraga ringan–sedang teratur. Contoh: jalan cepat / bersepeda santai ±30 menit, 3–5x seminggu.' },
                { value: 'berat', label: 'Berat · Sangat aktif', badge: '> 150 mnt/mgg', desc: 'Olahraga intensitas tinggi rutin. Contoh: lari, gym, atau olahraga kompetitif hampir tiap hari.' },
              ] as const).map(a => (
                <button key={a.value} onClick={() => onPick('aktivitas', a.value)} style={actCard(data.aktivitas === a.value)}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 700, color: '#2C443E' }}>{a.label}</div>
                    <div style={{ fontFamily: mono, fontSize: 11, fontWeight: 600, color: '#0F766E', background: '#E3F0ED', padding: '3px 9px', borderRadius: 99, flex: 'none' }}>{a.badge}</div>
                  </div>
                  <div style={{ fontSize: 12.5, color: '#7C9088', marginTop: 5, lineHeight: 1.5 }}>{a.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      <div style={{ marginTop: 18, display: 'flex', gap: 12 }}>
        <button onClick={onPrev} style={{ background: '#fff', color: '#4B635C', border: '1.5px solid #D6E2DE', borderRadius: 13, padding: '15px 22px', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>← Kembali</button>
        <button onClick={onNext} style={{ flex: 1, background: '#0F766E', color: '#fff', border: 'none', borderRadius: 13, padding: '15px 22px', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(15,118,110,0.22)' }}>
          {step < 6 ? 'Lanjut →' : 'Lihat Hasil Skrining →'}
        </button>
      </div>
    </div>
  )
}

function ResultScreen({ data, onSave, onStart }: { data: FormData; onSave: () => void; onStart: () => void }) {
  const der = derive(data)
  const mono = "'IBM Plex Mono',monospace"
  const patientName = data.anonim ? 'Pasien Anonim' : (data.nama.trim() || 'Tanpa nama')
  const todayStr = fmtDate(new Date())

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '26px 20px 80px', animation: 'fadeUp .4s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>{patientName}</div>
          <div style={{ fontSize: 13, color: '#7C9088', marginTop: 2 }}>{der.rUmur} · Skrining {todayStr}</div>
        </div>
      </div>

      {/* risk */}
      <div style={{ marginTop: 18, background: der.riskBg, border: '1px solid rgba(0,0,0,0.05)', borderRadius: 20, padding: 24 }}>
        <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5A726B', fontWeight: 600 }}>Estimasi risiko CKD</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginTop: 8 }}>
          <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.9, color: der.riskColor }}>
            {der.riskPct}<span style={{ fontSize: 30 }}>%</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, padding: '8px 16px', borderRadius: 99, color: '#fff', background: der.riskColor, marginBottom: 8 }}>Risiko {der.riskCat}</div>
        </div>
        <div style={{ position: 'relative', marginTop: 20, height: 12, borderRadius: 99, background: 'linear-gradient(90deg,#2FAE6B 0 25%,#E0A93B 25% 50%,#D9645A 50% 100%)' }}>
          <div style={{ position: 'absolute', top: '50%', left: der.riskMarkerLeft, transform: 'translate(-50%,-50%)', width: 8, height: 24, background: '#fff', border: '2.5px solid #16312B', borderRadius: 5, boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: mono, fontSize: 10, color: '#7C9088' }}>
          <span>Rendah</span><span>Sedang</span><span>Tinggi</span>
        </div>
      </div>

      {/* kidney age */}
      {der.kidneyAgeShow && (
        <div style={{ marginTop: 14, background: '#fff', border: '1px solid #E1EAE7', borderRadius: 16, padding: 20 }}>
          <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A726B', fontWeight: 600 }}>Perkiraan usia ginjal</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 14 }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 12, color: '#7C9088' }}>Usia Anda</div>
              <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05, color: '#16312B' }}>{der.realAge}<span style={{ fontSize: 15, color: '#9AABA5', fontWeight: 600 }}> th</span></div>
            </div>
            <div style={{ fontSize: 24, color: '#C2D2CD', flex: 'none' }}>→</div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 12, color: '#7C9088' }}>Usia ginjal diperkirakan</div>
              <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.05, color: der.kidneyAgeColor }}>{der.kidneyAge}<span style={{ fontSize: 15, fontWeight: 600, opacity: 0.6 }}> th</span></div>
            </div>
          </div>
          <div style={{ marginTop: 14, fontSize: 13.5, color: '#4B635C', lineHeight: 1.55, background: '#F7FAF9', borderRadius: 11, padding: '12px 14px' }}>
            Dengan usia <b style={{ color: '#16312B' }}>{der.realAge} tahun</b>, kondisi kesehatan ginjal Anda diperkirakan <b style={{ color: der.kidneyAgeColor }}>{der.kidneyAgeText}</b>
          </div>
        </div>
      )}

      {/* confidence */}
      <div style={{ marginTop: 14, background: '#fff', border: '1px solid #E1EAE7', borderRadius: 16, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A726B', fontWeight: 600 }}>Tingkat keyakinan data</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: der.confidenceColor }}>{der.confidencePct}%</div>
        </div>
        <div style={{ marginTop: 12, height: 9, borderRadius: 99, background: '#ECF1EF', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${der.confidencePct}%`, background: der.confidenceColor, borderRadius: 99, transition: 'width .4s ease' }} />
        </div>
        <div style={{ marginTop: 10, fontSize: 13, color: '#4B635C', lineHeight: 1.5 }}>
          <b style={{ color: der.confidenceColor }}>{der.confidenceLabel}.</b> Semakin lama tanggal pengecekan gula darah / tekanan darah, semakin rendah keyakinan terhadap kesimpulan risiko ini.
        </div>
      </div>

      {/* factors */}
      <div style={{ marginTop: 14, background: '#fff', border: '1px solid #E1EAE7', borderRadius: 16, padding: 20 }}>
        <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A726B', fontWeight: 600, marginBottom: 6 }}>Faktor risiko terdeteksi</div>
        {der.factorsEmpty ? (
          <div style={{ fontSize: 14, color: '#1A8754', padding: '8px 0' }}>Tidak ada faktor risiko mayor terdeteksi.</div>
        ) : der.factors.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: '1px solid #F0F4F2' }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: '#2C443E' }}>{f.label}</div>
            <div style={{ fontFamily: mono, fontSize: 13, fontWeight: 600, color: '#C5453B' }}>{f.pts}</div>
          </div>
        ))}
      </div>

      {/* recap */}
      <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
        {[
          { label: 'IMT', value: der.bmi, sub: der.bmiCat, color: der.bmiColor },
          { label: 'Gula darah', value: `${data.gdValue || '–'}`, sub: der.gdCat, color: der.gdColor, unit: ' mg/dL' },
          { label: 'Tekanan darah', value: `${data.sys || '–'}/${data.dia || '–'}`, sub: der.bpCat, color: der.bpColor },
          { label: 'Usia', value: der.rUmur, sub: der.riwayatLabel, color: '#7C9088' },
        ].map((item, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid #E1EAE7', borderRadius: 14, padding: 16 }}>
            <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7C9088' }}>{item.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{item.value}{item.unit && <span style={{ fontSize: 12, color: '#9AABA5', fontWeight: 500 }}>{item.unit}</span>}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: item.color, marginTop: 2 }}>{item.sub}</div>
          </div>
        ))}
      </div>

      {/* rekomendasi */}
      <div style={{ marginTop: 14, background: '#0F766E', borderRadius: 16, padding: 20, color: '#fff' }}>
        <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A8D6CF', fontWeight: 600, marginBottom: 10 }}>Rekomendasi tindak lanjut</div>
        {der.rekomendasi.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: '6px 0', fontSize: 14.5, lineHeight: 1.5 }}>
            <span style={{ color: '#A8D6CF' }}>›</span><span>{r}</span>
          </div>
        ))}
      </div>

      {/* edukasi */}
      <div style={{ marginTop: 14, background: '#fff', border: '1px solid #E1EAE7', borderRadius: 16, padding: 20 }}>
        <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A726B', fontWeight: 600, marginBottom: 12 }}>Edukasi & gaya hidup</div>
        {der.edukasi.map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '9px 0', borderBottom: '1px solid #F0F4F2' }}>
            <div style={{ width: 18, height: 18, borderRadius: 99, background: '#E3F0ED', color: '#0F766E', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, marginTop: 1 }}>✓</div>
            <div style={{ fontSize: 14, lineHeight: 1.5, color: '#2C443E' }}>{e}</div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 16, fontSize: 12, lineHeight: 1.55, color: '#8A9D97' }}>Estimasi skrining — bukan diagnosis. Keputusan klinis tetap memerlukan pemeriksaan fungsi ginjal oleh tenaga medis.</p>

      <div style={{ marginTop: 18, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={onSave} style={{ flex: 1, minWidth: 160, background: '#0F766E', color: '#fff', border: 'none', borderRadius: 13, padding: '15px 22px', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(15,118,110,0.22)' }}>Simpan ke Riwayat</button>
        <button onClick={onStart} style={{ background: '#fff', color: '#0F766E', border: '1.5px solid #CFE0DB', borderRadius: 13, padding: '15px 22px', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Skrining Baru</button>
      </div>
    </div>
  )
}

function HistoryScreen({ history, onStart, onViewItem, onDeleteItem }: {
  history: HistoryItem[]; onStart: () => void
  onViewItem: (id: number) => void; onDeleteItem: (id: number) => void
}) {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px 80px', animation: 'fadeUp .4s ease' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>Riwayat Skrining</h1>
      <p style={{ fontSize: 14.5, color: '#6B817A', marginTop: 5 }}>Data tersimpan di perangkat ini.</p>
      {history.length === 0 ? (
        <div style={{ marginTop: 28, background: '#fff', border: '1px dashed #D5E0DC', borderRadius: 18, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#4B635C' }}>Belum ada riwayat</div>
          <div style={{ fontSize: 13.5, color: '#8A9D97', marginTop: 5 }}>Selesaikan skrining lalu simpan untuk melihatnya di sini.</div>
          <button onClick={onStart} style={{ marginTop: 18, background: '#0F766E', color: '#fff', border: 'none', borderRadius: 12, padding: '13px 22px', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 700, cursor: 'pointer' }}>Mulai Skrining Baru</button>
        </div>
      ) : (
        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {history.map(h => (
            <div key={h.id} onClick={() => onViewItem(h.id)} style={{ background: '#fff', border: '1px solid #E1EAE7', borderRadius: 15, padding: '16px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', background: h.riskColor }}>
                <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>{h.riskPct}</div>
                <div style={{ fontSize: 8, fontWeight: 600, opacity: 0.85 }}>PCT</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15.5, fontWeight: 700, color: '#16312B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.nama}</div>
                <div style={{ fontSize: 12.5, color: '#7C9088', marginTop: 2 }}>{h.umur} · {h.tanggalLabel} · keyakinan {h.confidencePct}%</div>
              </div>
              <div style={{ textAlign: 'right', flex: 'none' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: h.riskColor }}>{h.riskCat}</div>
                <button onClick={e => { e.stopPropagation(); onDeleteItem(h.id) }} style={{ marginTop: 4, background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 11, color: '#B0BFBA', cursor: 'pointer', padding: 2 }}>Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [step, setStep] = useState(1)
  const [data, setData] = useState<FormData>(blank())
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    try {
      const r = localStorage.getItem('cekginjal_history_v1')
      if (r) setHistory(JSON.parse(r))
    } catch {}
  }, [])

  function persist(h: HistoryItem[]) {
    try { localStorage.setItem('cekginjal_history_v1', JSON.stringify(h)) } catch {}
  }

  function onField(field: keyof FormData, value: string | boolean) {
    setData(d => ({ ...d, [field]: value }))
  }

  function onPick(field: keyof FormData, value: string) {
    setData(d => ({ ...d, [field]: value }))
  }

  function goStart() { setScreen('form'); setStep(1); setData(blank()) }

  function onNext() {
    if (step < 6) setStep(s => s + 1)
    else setScreen('result')
  }

  function onPrev() {
    if (step > 1) setStep(s => s - 1)
    else setScreen('landing')
  }

  function saveResult() {
    const der = derive(data)
    const code = 'ANON-' + Math.random().toString(36).slice(2, 6).toUpperCase()
    const nama = data.anonim ? code : (data.nama.trim() || 'Tanpa nama')
    const item: HistoryItem = {
      id: Date.now(),
      nama,
      tanggalLabel: fmtDate(new Date()),
      umur: der.rUmur,
      riskPct: der.riskPct,
      riskCat: der.riskCat,
      riskColor: der.riskColor,
      confidencePct: der.confidencePct,
      data: { ...data },
    }
    if (SHEETS_URL) {
      fetch(SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggal: fmtDate(new Date()),
          nama,
          umur: data.umur,
          gender: data.gender,
          tinggi: data.tinggi,
          berat: data.berat,
          bmi: der.bmi,
          bmiCat: der.bmiCat,
          gdValue: data.gdValue,
          gdType: data.gdType,
          gdDate: data.gdDate,
          gdCat: der.gdCat,
          sys: data.sys,
          dia: data.dia,
          bpDate: data.bpDate,
          bpCat: der.bpCat,
          diabetes: data.diabetes,
          dmType: data.dmType,
          hipertensi: data.hipertensi,
          keluarga: data.keluarga,
          jantung: data.jantung,
          aktivitas: data.aktivitas,
          riskPct: der.riskPct,
          riskCat: der.riskCat,
          confidencePct: der.confidencePct,
        }),
      }).catch(() => {})
    }
    const h = [item, ...history]
    persist(h)
    setHistory(h)
    setScreen('history')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#EEF3F1', fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", color: '#16312B' }}>
      <TopBar onHome={() => setScreen('landing')} onHistory={() => setScreen('history')} />
      {screen === 'landing' && <Landing onStart={goStart} onHistory={() => setScreen('history')} />}
      {screen === 'form' && (
        <FormScreen data={data} step={step} onField={onField} onPick={onPick} onNext={onNext} onPrev={onPrev} />
      )}
      {screen === 'result' && (
        <ResultScreen data={data} onSave={saveResult} onStart={goStart} />
      )}
      {screen === 'history' && (
        <HistoryScreen
          history={history}
          onStart={goStart}
          onViewItem={id => { const it = history.find(x => x.id === id); if (it) { setData({ ...it.data }); setScreen('result') } }}
          onDeleteItem={id => { const h = history.filter(x => x.id !== id); persist(h); setHistory(h) }}
        />
      )}
    </div>
  )
}
