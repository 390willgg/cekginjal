import { AnimatePresence, motion } from 'framer-motion'
import type { FormData } from '../types'
import { Step1Identitas } from './form-steps/Step1Identitas'
import { Step2Antropometri } from './form-steps/Step2Antropometri'
import { Step3GulaDarah } from './form-steps/Step3GulaDarah'
import { Step4TekananDarah } from './form-steps/Step4TekananDarah'
import { Step5Riwayat } from './form-steps/Step5Riwayat'
import { Step6Aktivitas } from './form-steps/Step6Aktivitas'
import styles from './FormScreen.module.css'

const STEP_LABELS: Record<number, string> = {
  1: 'Identitas', 2: 'Antropometri', 3: 'Gula Darah',
  4: 'Tekanan Darah', 5: 'Riwayat Penyakit', 6: 'Aktivitas Fisik',
}

export function FormScreen({ data, step, onField, onPick, onNext, onPrev }: {
  data: FormData; step: number
  onField: (field: keyof FormData, value: string | boolean) => void
  onPick: (field: keyof FormData, value: string) => void
  onNext: () => void; onPrev: () => void
}) {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.step}>Langkah {step} dari 6</div>
        <div className={styles.label}>{STEP_LABELS[step]}</div>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${step / 6 * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className={styles.card}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {step === 1 && <Step1Identitas data={data} onField={onField} onPick={onPick} />}
          {step === 2 && <Step2Antropometri data={data} onField={onField} />}
          {step === 3 && <Step3GulaDarah data={data} onField={onField} onPick={onPick} />}
          {step === 4 && <Step4TekananDarah data={data} onField={onField} />}
          {step === 5 && <Step5Riwayat data={data} onField={onField} onPick={onPick} />}
          {step === 6 && <Step6Aktivitas data={data} onPick={onPick} />}
        </motion.div>
      </AnimatePresence>

      <div className={styles.actions}>
        <motion.button whileTap={{ scale: 0.96 }} onClick={onPrev} className={styles.backBtn}>← Kembali</motion.button>
        <motion.button whileTap={{ scale: 0.96 }} onClick={onNext} className={styles.nextBtn}>
          {step < 6 ? 'Lanjut →' : 'Lihat Hasil Skrining →'}
        </motion.button>
      </div>
    </div>
  )
}
