import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ARENA_QUESTIONS, ARENA_CATEGORIES, LEVEL_TIERS, ALL_BADGES } from '../lib/arena-data';
import { Question, QuizCategory, QuizDifficulty } from '../types';
import { 
  Trophy, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight, 
  RotateCcw, 
  Award,
  HelpCircle,
  Zap,
  BarChart2,
  Calendar
} from 'lucide-react';

export const Arena: React.FC = () => {
  const { 
    xp, 
    level, 
    levelName, 
    streak, 
    saveQuizResult, 
    unlockedBadges, 
    quizHistory,
    newLevelUnlocked,
    clearLevelAlert
  } = useStore();

  // Arena configuration state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [gameMode, setGameMode] = useState<'quick' | 'subject' | 'time' | 'daily' | 'endless'>('subject');
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty>('beginner');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [timedMode, setTimedMode] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('finsoul-sound') !== 'off'; } catch { return true; }
  });

  // Active quiz session state
  const [inQuiz, setInQuiz] = useState<boolean>(false);
  const [paused, setPaused] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  
  // Current question answer inputs
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [numericalInput, setNumericalInput] = useState<string>('');
  const [blankInput, setBlankInput] = useState<string>('');
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({}); // pairId -> selectedRight
  const [activeLeftSelect, setActiveLeftSelect] = useState<string | null>(null);

  // Question resolution
  const [answeredState, setAnsweredState] = useState<{
    submitted: boolean;
    isCorrect: boolean;
    earnedXp: number;
    explanation: string;
  } | null>(null);

  // Quiz Results tracking
  const [userAnswers, setUserAnswers] = useState<Array<{
    question: Question;
    givenAnswer: string;
    isCorrect: boolean;
    earnedXp: number;
  }>>([]);

  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<{ correct: number; total: number; xp: number; accuracy: number }>({ correct: 0, total: 0, xp: 0, accuracy: 0 });

  // Question Timer
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [timeAttackLeft, setTimeAttackLeft] = useState(60);
  const [questionSeconds, setQuestionSeconds] = useState(30);
  const [startedAt, setStartedAt] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [personalBest, setPersonalBest] = useState<number>(() => {
    try { return Number(localStorage.getItem('finsoul-arena-best') || 0); } catch { return 0; }
  });
  const todayKey = new Date().toISOString().slice(0, 10);
  const dailyComplete = (() => { try { return localStorage.getItem('finsoul-daily-complete') === todayKey; } catch { return false; } })();
  useEffect(() => {
    if (!newLevelUnlocked) return;
    const timeout = window.setTimeout(clearLevelAlert, 4600);
    return () => window.clearTimeout(timeout);
  }, [newLevelUnlocked, clearLevelAlert]);
  const subjectRecords = ARENA_CATEGORIES.map((category) => {
    const sessions = quizHistory.filter((record) => record.category === category);
    const questions = sessions.reduce((sum, record) => sum + record.totalQuestions, 0);
    const correct = sessions.reduce((sum, record) => sum + record.score, 0);
    return { category, sessions: sessions.length, accuracy: questions ? Math.round((correct / questions) * 100) : 0 };
  }).filter((record) => record.sessions > 0).sort((a, b) => b.sessions - a.sessions).slice(0, 4);
  useEffect(() => {
    if (!inQuiz || paused || answeredState?.submitted || !timedMode || quizFinished || gameMode === 'time') return;
    if (timeLeft <= 0) {
      handleSubmitAnswer(true); // time-out submit
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [inQuiz, paused, timeLeft, answeredState, timedMode, quizFinished, gameMode]);
  useEffect(() => {
    if (!inQuiz || paused || gameMode !== 'time' || quizFinished) return;
    if (timeAttackLeft <= 0) {
      finishRun();
      return;
    }
    const timer = window.setInterval(() => setTimeAttackLeft((remaining) => remaining - 1), 1000);
    return () => window.clearInterval(timer);
  }, [inQuiz, paused, gameMode, timeAttackLeft, quizFinished]);

  // Start new quiz
  const handleStartQuiz = (isDaily: boolean = false) => {
    let pool = [...ARENA_QUESTIONS];

    if (!isDaily) {
      if (selectedCategory !== 'All') {
        pool = pool.filter(q => q.category === selectedCategory);
      }
      pool = pool.filter(q => q.difficulty === selectedDifficulty);
    }

    // Shuffle
    const mode = isDaily ? 'daily' : gameMode;
    const requestedCount = mode === 'quick' || mode === 'daily' ? 5 : mode === 'endless' ? 15 : mode === 'time' ? 10 : questionCount;
    const duration = 30;
    if (mode === 'quick' || mode === 'daily' || mode === 'time' || mode === 'endless') {
      pool = [...ARENA_QUESTIONS];
      if (mode !== 'daily' && mode !== 'quick') pool = pool.filter(q => q.difficulty === selectedDifficulty || mode === 'endless');
    }
    if (!pool.length) pool = [...ARENA_QUESTIONS];
    const count = Math.min(requestedCount, pool.length);
    let shuffled = pool.sort(() => Math.random() - 0.5).slice(0, count);
    if (mode === 'endless') shuffled = shuffled.map((question, index) => ({ ...question, difficulty: index < 5 ? 'beginner' : index < 10 ? 'intermediate' : 'advanced' }));
    setQuestionSeconds(duration);
    setElapsedSeconds(0);
    setStartedAt(Date.now());
    setActiveQuestions(shuffled);
    setCurrentIdx(0);
    setUserAnswers([]);
    setQuizFinished(false);
    setAnsweredState(null);
    resetQuestionInputs();
    setTimeLeft(duration);
    setTimeAttackLeft(60);
    setTimedMode(mode !== 'subject' || timedMode);
    setPaused(false);
    setInQuiz(true);
  };

  const resetQuestionInputs = () => {
    setSelectedOption(null);
    setNumericalInput('');
    setBlankInput('');
    setMatchedPairs({});
    setActiveLeftSelect(null);
  };

  // Evaluate & submit answer
  const handleSubmitAnswer = (isTimeout: boolean = false) => {
    if (answeredState?.submitted) return;
    const q = activeQuestions[currentIdx];
    let isCorrect = false;
    let givenStr = '';

    if (isTimeout) {
      givenStr = 'Time Expired';
      isCorrect = false;
    } else if (q.type === 'mcq' || q.type === 'boolean' || q.type === 'scenario') {
      givenStr = selectedOption || '';
      isCorrect = selectedOption?.trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
    } else if (q.type === 'numerical') {
      givenStr = numericalInput.trim();
      const numGiven = Number(numericalInput);
      const expected = Number(q.correctAnswer);
      const tol = q.tolerance ?? 0.02;
      isCorrect = !isNaN(numGiven) && Math.abs(numGiven - expected) <= Math.abs(expected) * tol;
    } else if (q.type === 'blank') {
      givenStr = blankInput.trim();
      isCorrect = blankInput.trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
    } else if (q.type === 'match') {
      givenStr = 'Matched';
      if (q.pairs) {
        isCorrect = q.pairs.every(p => matchedPairs[p.id] === p.right);
      }
    }

    // XP calculation
    let earnedXp = 0;
    if (soundEnabled) playFeedbackTone(isCorrect);
    if (isCorrect) {
      const base = q.difficulty === 'beginner' ? 10 : q.difficulty === 'intermediate' ? 20 : 35;
      earnedXp = base + (timedMode && (gameMode === 'time' ? timeAttackLeft > 30 : timeLeft > questionSeconds / 2) ? 10 : 0);
    }

    setAnsweredState({
      submitted: true,
      isCorrect,
      earnedXp,
      explanation: q.explanation
    });

    setUserAnswers(prev => [...prev, { question: q, givenAnswer: givenStr, isCorrect, earnedXp }]);
  };

  const finishRun = (answers = userAnswers) => {
    if (!answers.length) {
      setInQuiz(false);
      setPaused(false);
      return;
    }
    const total = answers.length;
    const correct = answers.filter(answer => answer.isCorrect).length;
    const completedDaily = gameMode === 'daily' && total === activeQuestions.length;
    const totalXp = answers.reduce((earned, answer) => earned + answer.earnedXp, 0) + (completedDaily ? 25 : 0);
    const accuracy = Math.round((correct / total) * 100);
    const duration = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    setElapsedSeconds(duration);
    if (correct > personalBest) {
      setPersonalBest(correct);
      try { localStorage.setItem('finsoul-arena-best', String(correct)); } catch { /* optional local record */ }
    }
    if (completedDaily) { try { localStorage.setItem('finsoul-daily-complete', todayKey); } catch { /* optional daily marker */ } }
    setFinalScore({ correct, total, xp: totalXp, accuracy });
    setQuizFinished(true);
    setInQuiz(false);
    setPaused(false);
    if (soundEnabled && accuracy >= 80) playFeedbackTone(true);
    saveQuizResult({
      category: (gameMode === 'daily' ? 'Daily Challenge' : selectedCategory === 'All' ? 'Mixed' : selectedCategory) as QuizCategory,
      difficulty: selectedDifficulty,
      score: correct,
      totalQuestions: total,
      accuracy,
      xpEarned: totalXp,
      timeSpentSeconds: duration
    });
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < activeQuestions.length) {
      setCurrentIdx(prev => prev + 1);
      setAnsweredState(null);
      resetQuestionInputs();
      setTimeLeft(questionSeconds);
    } else if (gameMode === 'endless' || gameMode === 'time') {
      const nextIndex = activeQuestions.length;
      const nextQuestion = ARENA_QUESTIONS[Math.floor(Math.random() * ARENA_QUESTIONS.length)];
      const difficulty = gameMode === 'time' ? selectedDifficulty : nextIndex < 5 ? 'beginner' : nextIndex < 10 ? 'intermediate' : 'advanced';
      setActiveQuestions((questions) => [...questions, { ...nextQuestion, difficulty }]);
      setCurrentIdx(nextIndex);
      setAnsweredState(null);
      resetQuestionInputs();
      setTimeLeft(questionSeconds);
    } else {
      finishRun();
    }
  };

  const currentQ = activeQuestions[currentIdx];
  const openEndedRun = gameMode === 'time' || gameMode === 'endless';
  const questionProgress = openEndedRun ? ((currentIdx % 10) + 1) / 10 : (currentIdx + 1) / activeQuestions.length;

  return (
    <div className="arena-screen max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {newLevelUnlocked && <div className="arena-level-up" role="status"><span>LEVEL UP</span><strong>{levelName}</strong><small>Level {level} reached</small><button type="button" onClick={clearLevelAlert}>Continue</button></div>}
      <div className="arena-control-row">
        <span>LEVEL {level} <span aria-hidden="true">/</span> {levelName} <span aria-hidden="true">/</span> {xp} XP</span>
        <button onClick={() => setSoundEnabled((enabled) => { const next = !enabled; try { localStorage.setItem('finsoul-sound', next ? 'on' : 'off'); } catch { /* keep the session preference */ } return next; })} aria-pressed={soundEnabled}>
          Sound {soundEnabled ? 'on' : 'off'}
        </button>
      </div>
      
      {/* 1. LOBBY VIEW */}
      {!inQuiz && !quizFinished && (
        <div className="space-y-8 animate-in fade-in-50 duration-200">
          
          {/* Header & Stats Banner */}
          <div className="bg-gradient-to-r from-navy via-navy to-navy-light text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="arena-kicker">SOLO COMPETITION / SEASON 01</span>
              <h1 className="arena-title">ARENA<span>.</span></h1>
              <p className="text-xs sm:text-sm text-gray-300 max-w-md">
                Test your financial instinct. Build your record.
              </p>
            </div>

            {/* Quick Progression Card */}
            <div className="arena-progression-panel bg-navy-card/80 border border-slate-700 rounded-2xl p-4 flex items-center space-x-6">
              <div className="text-center"><span className="text-xs text-subtext block">STREAK</span><span className="text-xl font-extrabold text-finsoul">{streak}<small>d</small></span></div>
              <div className="h-8 w-px bg-slate-700" />
              <div className="text-center">
                <span className="text-xs text-subtext block">LEVEL</span>
                <span className="text-base font-extrabold text-white block">Lvl {level}</span>
                <span className="text-[10px] text-amber-400 font-bold">{levelName}</span>
              </div>
              <div className="h-8 w-px bg-slate-700" />
              <div className="text-center"><span className="text-xs text-subtext block">BEST RUN</span><span className="text-xl font-extrabold text-white">{personalBest || '—'}</span></div>
              <div className="h-8 w-px bg-slate-700" />
              <div className="text-center">
                <span className="text-xs text-subtext block">Total XP</span>
                <span className="text-xl font-extrabold text-white">{xp}</span>
              </div>
              <div className="arena-level-progress"><div><span>LEVEL PROGRESS</span><span>{xp} / {(LEVEL_TIERS.find((tier) => tier.level === level)?.maxXp ?? xp)} XP</span></div><span className="arena-level-track"><i style={{ width: `${Math.min(100, ((xp - (LEVEL_TIERS.find((tier) => tier.level === level)?.minXp ?? 0)) / ((LEVEL_TIERS.find((tier) => tier.level === level)?.maxXp ?? xp + 1) - (LEVEL_TIERS.find((tier) => tier.level === level)?.minXp ?? 0))) * 100)}%` }} /></span></div>
            </div>
          </div>

          <section className="arena-modes" aria-labelledby="arena-modes-title">
            <div className="arena-section-heading"><div><span className="arena-kicker">CHOOSE YOUR FORMAT</span><h2 id="arena-modes-title">Select a mode</h2></div><span>01 — 05</span></div>
            <div className="arena-mode-grid">
              {([
                ['quick', 'Quick play', '5 mixed questions', 'FAST / 02 MIN'],
                ['subject', 'Subject challenge', 'Choose a discipline', 'FOCUSED / YOUR PACE'],
                ['time', 'Time attack', '10 questions · 12s each', 'TIMED / HIGH PRESSURE'],
                ['daily', 'Daily challenge', 'A fresh set every day', dailyComplete ? 'COMPLETED TODAY' : 'BONUS XP'],
                ['endless', 'Endless', '15 questions · rising stakes', 'SURVIVAL / PERSONAL BEST'],
              ] as const).map(([mode, title, detail, meta], index) => (
                <button key={mode} type="button" onClick={() => setGameMode(mode)} aria-pressed={gameMode === mode} className={`arena-mode ${gameMode === mode ? 'is-selected' : ''}`}>
                  <span className="arena-mode-index">0{index + 1}</span><span className="arena-mode-title">{title}</span><span className="arena-mode-detail">{detail}</span><span className="arena-mode-meta">{meta}</span>
                </button>
              ))}
            </div>
            <div className="arena-mode-action">
              {gameMode === 'subject' && <label>Subject <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}><option>All</option>{ARENA_CATEGORIES.map(category => <option key={category}>{category}</option>)}</select></label>}
              <button className="arena-launch" disabled={gameMode === 'daily' && dailyComplete} onClick={() => handleStartQuiz(gameMode === 'daily')}>
              {gameMode === 'daily' && dailyComplete ? 'Daily challenge complete' : `Launch ${gameMode === 'time' ? 'time attack' : gameMode === 'daily' ? 'daily challenge' : gameMode === 'endless' ? 'endless run' : gameMode === 'quick' ? 'quick play' : 'subject challenge'}`}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Daily Challenge Banner */}
          <div className="hidden bg-gradient-to-r from-finsoul/10 via-amber-50 to-cream border border-finsoul/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-finsoul text-white flex items-center justify-center font-extrabold shadow-sm">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-navy">Daily Finance Challenge</h2>
                <p className="text-xs text-subtext">5 mixed questions • 1.5x XP Boost • Keeps your {streak}-day streak alive</p>
              </div>
            </div>
            <button
              onClick={() => handleStartQuiz(true)}
              className="px-5 py-2.5 rounded-xl bg-finsoul hover:bg-finsoul-dark text-white font-extrabold text-xs shadow transition-all flex items-center space-x-1.5 whitespace-nowrap"
            >
              <Calendar className="w-4 h-4" />
              <span>Start Daily Challenge</span>
            </button>
          </div>

          {subjectRecords.length > 0 && <section className="arena-records" aria-labelledby="arena-records-title">
            <div className="arena-section-heading"><div><span className="arena-kicker">PERFORMANCE LOG</span><h2 id="arena-records-title">Subject records</h2></div><span>RECENT RUNS</span></div>
            <div className="arena-record-list">{subjectRecords.map((record) => <div key={record.category}><span>{record.category}</span><span>{record.accuracy}% <small>accuracy</small></span><span>{record.sessions} <small>runs</small></span></div>)}</div>
          </section>}

          {/* Quiz Customization Panel */}
          <div className="bg-white border border-borderCol rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-sm font-extrabold text-navy uppercase tracking-wider border-b border-gray-100 pb-2">
              Session settings
            </h2>

            {/* Category Selector */}
            <div className="space-y-2 arena-legacy-category">
              <label className="text-xs font-bold text-navy block">Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['All', ...ARENA_CATEGORIES].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`p-2.5 rounded-xl text-xs font-bold text-left border transition-all ${
                      selectedCategory === cat
                        ? 'border-finsoul bg-finsoul-light text-finsoul-dark shadow-sm'
                        : 'border-borderCol hover:border-gray-300 text-subtext'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-navy block">Difficulty Tier</label>
              <div className="grid grid-cols-3 gap-3">
                {(['beginner', 'intermediate', 'advanced'] as QuizDifficulty[]).map(diff => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`py-2.5 rounded-xl text-xs font-bold capitalize border transition-all ${
                      selectedDifficulty === diff
                        ? 'border-navy bg-navy text-white shadow-sm'
                        : 'border-borderCol hover:border-gray-300 text-subtext'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Options Bar (Questions & Timer) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-navy block">Number of Questions</label>
                <div className="flex gap-2">
                  {[5, 10, 15].map(num => (
                    <button
                      key={num}
                      onClick={() => setQuestionCount(num)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border ${
                        questionCount === num ? 'border-finsoul bg-finsoul text-white' : 'border-borderCol text-subtext'
                      }`}
                    >
                      {num} Qs
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-navy block">Timed Challenge (30s per Q)</label>
                <button
                  onClick={() => setTimedMode(!timedMode)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-between ${
                    timedMode ? 'border-brandGreen bg-brandGreen/10 text-brandGreen' : 'border-borderCol text-subtext'
                  }`}
                >
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    {timedMode ? 'Timer Active (+Speed XP)' : 'Untimed Practice Mode'}
                  </span>
                  <span>{timedMode ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={() => handleStartQuiz(false)}
              className="arena-hidden-legacy-start w-full py-3.5 rounded-xl bg-finsoul hover:bg-finsoul-dark text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <span>Launch Practice Quiz</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Unlocked Badges Showcase */}
          <div className="bg-white border border-borderCol rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-navy uppercase tracking-wider flex items-center justify-between">
              <span>Your Achievements & Badges</span>
              <span className="text-xs font-bold text-finsoul">
                {Object.keys(unlockedBadges).length} / {ALL_BADGES.length} Unlocked
              </span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ALL_BADGES.map(badge => {
                const isUnlocked = !!unlockedBadges[badge.id];
                return (
                  <div
                    key={badge.id}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isUnlocked
                        ? 'border-amber-300 bg-amber-50/50 text-navy shadow-sm'
                        : 'border-borderCol/60 bg-cream-dark/30 text-subtext opacity-50'
                    }`}
                  >
                <div className="badge-state-label">{isUnlocked ? 'UNLOCKED' : 'LOCKED'}</div>
                    <div className="font-extrabold text-xs truncate">{badge.name}</div>
                    <div className="text-[10px] text-subtext line-clamp-2 mt-0.5">{badge.description}</div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* 2. ACTIVE QUIZ RUNNER INTERFACE */}
      {inQuiz && currentQ && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          
          {/* Top Progress & Timer Bar */}
          <div className="bg-white border border-borderCol rounded-2xl p-4 shadow-sm flex items-center justify-between arena-question-header">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold text-navy">
                {openEndedRun ? `Question ${currentIdx + 1}` : `Question ${currentIdx + 1} of ${activeQuestions.length}`}
              </span>
              <span className="text-subtext">•</span>
                <span className="text-[11px] font-bold text-finsoul uppercase bg-finsoul-light px-2 py-0.5 rounded">
                {currentQ.category}
              </span>
            </div>

            <div className="arena-run-controls"><button type="button" onClick={() => setPaused(!paused)}>{paused ? 'Resume' : 'Pause'}</button><button type="button" onClick={() => finishRun()}>Exit run</button></div>

            {timedMode && (
              <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                (gameMode === 'time' ? timeAttackLeft : timeLeft) <= 10 ? 'bg-brandRed/10 text-brandRed animate-pulse' : 'bg-cream text-navy'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{gameMode === 'time' ? timeAttackLeft : timeLeft}s</span>
                <span className="arena-countdown-meter" aria-hidden="true"><span style={{ width: `${Math.max(0, ((gameMode === 'time' ? timeAttackLeft : timeLeft) / (gameMode === 'time' ? 60 : questionSeconds)) * 100)}%` }} /></span>
              </div>
            )}
          </div>
          <div className="arena-question-progress" role="progressbar" aria-label="Quiz progress" aria-valuemin={0} aria-valuemax={openEndedRun ? 10 : activeQuestions.length} aria-valuenow={openEndedRun ? (currentIdx % 10) + 1 : currentIdx + 1}>
            <span style={{ width: `${questionProgress * 100}%` }} />
          </div>

          {/* Question Card */}
          <div key={currentQ.id} className={`bg-white border border-borderCol rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 ${paused ? 'arena-is-paused' : 'arena-question-enter'}`}>
            {paused && <div className="arena-pause-overlay"><span>RUN PAUSED</span><button type="button" onClick={() => setPaused(false)}>Resume run</button></div>}
            
            {/* Scenario Context (if present) */}
            {currentQ.scenario && (
              <div className="p-4 rounded-xl bg-cream border border-borderCol/80 text-xs sm:text-sm text-subtext leading-relaxed">
                <span className="font-bold text-navy block mb-1">Scenario Background:</span>
                {currentQ.scenario}
              </div>
            )}

            {/* Question Prompt */}
            <h2 className="text-lg sm:text-xl font-extrabold text-navy leading-snug">
              {currentQ.prompt}
            </h2>

            {/* DYNAMIC ANSWER INPUTS BY QUESTION TYPE */}
            <div className="space-y-3 pt-2">
              
              {/* Type: MCQ, Boolean, or Scenario */}
              {(currentQ.type === 'mcq' || currentQ.type === 'boolean' || currentQ.type === 'scenario') && currentQ.options && (
                <div className="space-y-2.5">
                  {currentQ.options.map((opt, i) => {
                    const isSelected = selectedOption === opt;
                    const showResult = answeredState?.submitted;
                    const isCorrect = opt.trim().toLowerCase() === String(currentQ.correctAnswer).trim().toLowerCase();

                    let style = "border-borderCol hover:border-finsoul text-navy bg-white";
                    if (isSelected) style = "border-finsoul bg-finsoul-light text-finsoul-dark font-bold";
                    if (showResult) {
                      if (isCorrect) style = "border-brandGreen bg-brandGreen-light text-brandGreen font-bold";
                      else if (isSelected && !isCorrect) style = "border-brandRed bg-brandRed-light text-brandRed font-bold";
                    }

                    return (
                      <button
                        key={i}
                        disabled={showResult}
                        onClick={() => setSelectedOption(opt)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between ${style}`}
                      >
                        <span>{opt}</span>
                        {showResult && isCorrect && <CheckCircle2 className="w-4 h-4 text-brandGreen" />}
                        {showResult && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-brandRed" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Type: Numerical Calculation */}
              {currentQ.type === 'numerical' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-subtext">Enter your calculated numerical answer:</label>
                  <input
                    type="number"
                    step="any"
                    disabled={answeredState?.submitted}
                    placeholder="e.g. 15000 or 12.5"
                    value={numericalInput}
                    onChange={e => setNumericalInput(e.target.value)}
                    className="w-full p-3 bg-cream border border-borderCol rounded-xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-finsoul"
                  />
                  {answeredState?.submitted && (
                    <div className="text-xs font-bold pt-1">
                      Expected Answer: <span className="text-brandGreen">{currentQ.correctAnswer}</span> (±{( (currentQ.tolerance ?? 0.02) * 100)}% tolerance allowed)
                    </div>
                  )}
                </div>
              )}

              {/* Type: Fill in the Blank */}
              {currentQ.type === 'blank' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-subtext">Type the missing financial term:</label>
                  <input
                    type="text"
                    disabled={answeredState?.submitted}
                    placeholder="Your answer..."
                    value={blankInput}
                    onChange={e => setBlankInput(e.target.value)}
                    className="w-full p-3 bg-cream border border-borderCol rounded-xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-finsoul"
                  />
                  {answeredState?.submitted && (
                    <div className="text-xs font-bold pt-1">
                      Expected Term: <span className="text-brandGreen">{currentQ.correctAnswer}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Type: Matching Questions */}
              {currentQ.type === 'match' && currentQ.pairs && (
                <div className="space-y-3">
                  <p className="text-xs text-subtext">Select an item on the left, then click its matching pair on the right:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Left Column */}
                    <div className="space-y-2">
                      {currentQ.pairs.map(p => (
                        <button
                          key={p.id}
                          disabled={answeredState?.submitted}
                          onClick={() => setActiveLeftSelect(p.id)}
                          className={`w-full p-2.5 rounded-lg border text-xs font-bold text-left transition-all ${
                            activeLeftSelect === p.id
                              ? 'border-finsoul bg-finsoul-light text-finsoul-dark'
                              : matchedPairs[p.id]
                              ? 'border-brandGreen bg-brandGreen/10 text-navy'
                              : 'border-borderCol text-navy'
                          }`}
                        >
                          <div>{p.left}</div>
                          {matchedPairs[p.id] && (
                            <div className="text-[10px] text-brandGreen font-normal mt-0.5">Matched → {matchedPairs[p.id]}</div>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Right Column Options */}
                    <div className="space-y-2">
                      {currentQ.pairs.map(p => (
                        <button
                          key={p.id}
                          disabled={answeredState?.submitted || !activeLeftSelect}
                          onClick={() => {
                            if (activeLeftSelect) {
                              setMatchedPairs({ ...matchedPairs, [activeLeftSelect]: p.right });
                              setActiveLeftSelect(null);
                            }
                          }}
                          className="w-full p-2.5 rounded-lg border border-borderCol hover:border-finsoul text-xs font-medium text-left text-subtext hover:text-navy transition-all"
                        >
                          {p.right}
                        </button>
                      ))}
                    </div>

                  </div>
                </div>
              )}

            </div>

            {/* Answer Feedback Banner (revealed after submission) */}
            {answeredState && (
              <div className={`p-4 rounded-xl border space-y-2 animate-in fade-in-50 ${
                answeredState.isCorrect 
                  ? 'bg-brandGreen-light border-brandGreen/30 text-navy' 
                  : 'bg-brandRed-light border-brandRed/30 text-navy'
              }`}>
                <div className="flex items-center space-x-2">
                  {answeredState.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-brandGreen" />
                      <span className="font-extrabold text-brandGreen text-sm">Correct Answer! (+{answeredState.earnedXp} XP)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-brandRed" />
                      <span className="font-extrabold text-brandRed text-sm">Incorrect Solution</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-subtext leading-relaxed">
                  <span className="font-bold text-navy">Explanation: </span>
                  {answeredState.explanation}
                </p>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-2 flex justify-end">
              {!answeredState?.submitted ? (
                <button
                  onClick={() => handleSubmitAnswer(false)}
                  className="px-6 py-3 rounded-xl bg-finsoul hover:bg-finsoul-dark text-white font-extrabold text-sm shadow transition-all"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 rounded-xl bg-navy hover:bg-navy-light text-white font-extrabold text-sm shadow transition-all flex items-center space-x-1.5"
                >
                  <span>{currentIdx + 1 < activeQuestions.length ? 'Next Question' : 'View Final Results'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 3. FINAL RESULTS SCREEN */}
      {quizFinished && (
        <div className="space-y-8 animate-in fade-in-50 duration-200">
          
          <div className="bg-navy text-white rounded-3xl p-8 shadow-xl text-center space-y-4">
            <span className="text-xs font-extrabold uppercase text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full">
              Quiz Completed
            </span>

            <div className="text-5xl sm:text-6xl font-extrabold text-finsoul">
              {finalScore.correct} / {finalScore.total}
            </div>

            <p className="text-gray-300 text-sm max-w-md mx-auto">
              <span className="font-bold text-white">{finalScore.accuracy}% accuracy</span> <span className="font-bold text-amber-400 xp-reward">+{finalScore.xp} XP</span> earned at Level {level}.
            </p>
            <div className="arena-result-stats"><span>{finalScore.total - finalScore.correct}<small>Incorrect</small></span><span>{elapsedSeconds}s<small>Time taken</small></span><span>{Math.max(personalBest, finalScore.correct)}<small>Personal best</small></span></div>
            {Object.keys(unlockedBadges).length > 0 && <p className="arena-unlocks">{Object.keys(unlockedBadges).length} achievements earned</p>}

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => gameMode === 'daily' ? setQuizFinished(false) : handleStartQuiz(false)}
                className="px-5 py-2.5 rounded-xl bg-finsoul hover:bg-finsoul-dark text-white font-extrabold text-xs shadow transition-all flex items-center space-x-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{gameMode === 'daily' ? 'Back to Arena' : 'Play Another Quiz'}</span>
              </button>
              <button
                onClick={() => setQuizFinished(false)}
                className="px-5 py-2.5 rounded-xl bg-navy-light hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all"
              >
                Back to Arena Lobby
              </button>
            </div>
          </div>

          {/* Full Question Review */}
          <div className="bg-white border border-borderCol rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-navy uppercase tracking-wider border-b border-gray-100 pb-2">
              Performance Breakdown & Answer Review
            </h3>

            <div className="space-y-4">
              {userAnswers.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-cream border border-borderCol space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-xs text-navy">Q{idx + 1}: {item.question.prompt}</span>
                    {item.isCorrect ? (
                      <span className="text-brandGreen font-bold text-xs flex items-center"><CheckCircle2 className="w-4 h-4 mr-1" /> Correct</span>
                    ) : (
                      <span className="text-brandRed font-bold text-xs flex items-center"><XCircle className="w-4 h-4 mr-1" /> Incorrect</span>
                    )}
                  </div>
                  <div className="text-xs text-subtext">
                    <span>Your Answer: </span>
                    <span className={item.isCorrect ? 'text-brandGreen font-bold' : 'text-brandRed font-bold'}>{item.givenAnswer || 'None'}</span>
                    {!item.isCorrect && (
                      <span className="ml-3 text-navy font-bold">Correct: {String(item.question.correctAnswer)}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 pt-1 border-t border-gray-200">
                    {item.question.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

function playFeedbackTone(correct: boolean) {
  const AudioContextConstructor = window.AudioContext;
  if (!AudioContextConstructor) return;
  try {
    const context = new AudioContextConstructor();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(correct ? 660 : 220, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(correct ? 880 : 165, context.currentTime + 0.12);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.16);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.17);
    oscillator.onended = () => { void context.close(); };
  } catch {
    // Audio is an optional enhancement; quiz progression never depends on it.
  }
}
