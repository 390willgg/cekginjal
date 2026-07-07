import type { FormData } from '../../types'
import { actCard } from './shared'
import styles from './Step6Aktivitas.module.css'

const OPTIONS = [
  { value: 'rendah', label: 'Rendah · Sedentari', badge: '< 60 mnt/mgg', desc: 'Hampir tidak berolahraga. Contoh: kerja duduk seharian, jarang jalan kaki, banyak rebahan.' },
  { value: 'sedang', label: 'Sedang · Aktif', badge: '75–150 mnt/mgg', desc: 'Olahraga ringan–sedang teratur. Contoh: jalan cepat / bersepeda santai ±30 menit, 3–5x seminggu.' },
  { value: 'berat', label: 'Berat · Sangat aktif', badge: '> 150 mnt/mgg', desc: 'Olahraga intensitas tinggi rutin. Contoh: lari, gym, atau olahraga kompetitif hampir tiap hari.' },
] as const

export function Step6Aktivitas({ data, onPick }: {
  data: FormData
  onPick: (field: keyof FormData, value: string) => void
}) {
  return (
    <div>
      <h2 className={styles.title}>Aktivitas fisik</h2>
      <p className={styles.subtitle}>Pilih tingkat aktivitas fisik pasien dalam seminggu.</p>
      <div className={styles.list}>
        {OPTIONS.map(a => (
          <button key={a.value} onClick={() => onPick('aktivitas', a.value)} className={actCard(data.aktivitas === a.value)}>
            <div className={styles.row}>
              <div className={styles.label}>{a.label}</div>
              <div className={styles.badge}>{a.badge}</div>
            </div>
            <div className={styles.desc}>{a.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
