import React, { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useStore } from './store/useStore'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { Home } from './pages/Home'
import { Toolkit } from './pages/Toolkit'
import { Arena } from './pages/Arena'
import { Boardroom } from './pages/Boardroom'
import { BadgeToast } from './components/BadgeToast'
import { idbSet } from './lib/storage'

export default function App() {
  const { recordActivity, theme } = useStore()
  const location = useLocation()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    recordActivity()
  }, [recordActivity])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [location.pathname, reduceMotion])

  useEffect(() => {
    const persist = () => {
      const state = useStore.getState()
      void idbSet('progress', {
        xp: state.xp,
        level: state.level,
        levelName: state.levelName,
        streak: state.streak,
        lastActiveDate: state.lastActiveDate,
        unlockedBadges: state.unlockedBadges,
        quizHistory: state.quizHistory,
        caseSubmissions: state.caseSubmissions,
        savedCalcIds: state.savedCalcIds,
        savedInputs: state.savedInputs,
        theme: state.theme,
      }).catch(() => undefined)
    }
    persist()
    return useStore.subscribe(persist)
  }, [])

  return (
    <div className={`app-shell min-h-screen bg-cream font-sans flex flex-col ${location.pathname.startsWith('/arena') ? 'arena-shell' : ''}`}>
      <Navbar />
      <motion.main
        key={location.pathname}
        className="flex-1"
        initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/toolkit" element={<Toolkit />} />
          <Route path="/toolkit/:calcId" element={<Toolkit />} />
          <Route path="/arena" element={<Arena />} />
          <Route path="/boardroom" element={<Boardroom />} />
          <Route path="/boardroom/:caseId" element={<Boardroom />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.main>
      <Footer />
      <BadgeToast />
    </div>
  )
}
