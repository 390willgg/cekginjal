import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase, getDeviceId } from './supabase'
import type { Screen, FormData, HistoryItem } from './types'
import { blank, fmtDate, derive } from './lib/derive'
import { RS_DATA } from './data/rsData'
import { ARTICLES_DATA } from './data/articlesData'
import { TopBar } from './components/TopBar'
import { Landing } from './components/Landing'
import { FormScreen } from './components/FormScreen'
import { ResultScreen } from './components/ResultScreen'
import { HistoryScreen } from './components/HistoryScreen'
import { RekoScreen } from './components/RekoScreen'
import { RsModal } from './components/RsModal'
import { ArticleModal } from './components/ArticleModal'
import styles from './App.module.css'

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [step, setStep] = useState(1)
  const [data, setData] = useState<FormData>(blank())
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [provinsi, setProvinsi] = useState('')
  const [openArticleId, setOpenArticleId] = useState<number | null>(null)
  const [openRsId, setOpenRsId] = useState<number | null>(null)

  useEffect(() => {
    try {
      const r = localStorage.getItem('cekginjal_history_v1')
      if (r) setHistory(JSON.parse(r))
    } catch {}
    try {
      const rp = localStorage.getItem('cekginjal_provinsi')
      if (rp) setProvinsi(rp)
    } catch {}
    if (supabase) {
      getDeviceId().then(deviceId => {
        if (!deviceId) return
        supabase!.from('history').select('item').order('created_at', { ascending: false }).then(({ data, error }) => {
          if (error || !data) return
          const remote: HistoryItem[] = data.map(row => row.item as HistoryItem)
          setHistory(remote)
          persist(remote)
        })
      })
    }
  }, [])

  function persist(h: HistoryItem[]) {
    try { localStorage.setItem('cekginjal_history_v1', JSON.stringify(h)) } catch {}
  }

  function onProvinsi(p: string) {
    setProvinsi(p)
    try { localStorage.setItem('cekginjal_provinsi', p) } catch {}
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
    if (supabase) {
      getDeviceId().then(deviceId => {
        if (!deviceId) return
        supabase!.from('history').insert({ id: item.id, device_id: deviceId, item }).then(() => {})
      })
    }
    const h = [item, ...history]
    persist(h)
    setHistory(h)
    setScreen('history')
  }

  return (
    <div className={styles.app}>
      <TopBar onHome={() => setScreen('landing')} onReko={() => setScreen('reko')} onHistory={() => setScreen('history')} />
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {screen === 'landing' && <Landing onStart={goStart} onHistory={() => setScreen('history')} />}
          {screen === 'form' && (
            <FormScreen data={data} step={step} onField={onField} onPick={onPick} onNext={onNext} onPrev={onPrev} />
          )}
          {screen === 'result' && (
            <ResultScreen data={data} provinsi={provinsi} onSave={saveResult} onStart={goStart} onOpenRs={setOpenRsId} onOpenArticle={setOpenArticleId} />
          )}
          {screen === 'history' && (
            <HistoryScreen
              history={history}
              onStart={goStart}
              onViewItem={id => { const it = history.find(x => x.id === id); if (it) { setData({ ...it.data }); setScreen('result') } }}
              onDeleteItem={id => { const h = history.filter(x => x.id !== id); persist(h); setHistory(h); supabase?.from('history').delete().eq('id', id).then(() => {}) }}
            />
          )}
          {screen === 'reko' && (
            <RekoScreen provinsi={provinsi} onProvinsi={onProvinsi} onOpenRs={setOpenRsId} onOpenArticle={setOpenArticleId} />
          )}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        {openRsId !== null && (() => {
          const rs = RS_DATA.find(r => r.id === openRsId)
          return rs ? <RsModal rs={rs} onClose={() => setOpenRsId(null)} /> : null
        })()}
        {openArticleId !== null && (() => {
          const article = ARTICLES_DATA.find(a => a.id === openArticleId)
          return article ? <ArticleModal article={article} onClose={() => setOpenArticleId(null)} /> : null
        })()}
      </AnimatePresence>
    </div>
  )
}
