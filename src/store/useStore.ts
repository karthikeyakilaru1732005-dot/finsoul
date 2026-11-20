import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NavigationTab, Badge, QuizResultRecord, CaseSubmission } from '../types';
import { ALL_BADGES, LEVEL_TIERS } from '../lib/arena-data';

export type ThemeName = 'cream' | 'ink';

interface AppState {
  // Navigation kept for deep links from older sessions
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;

  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  savedInputs: Record<string, Record<string, string>>;
  saveInputs: (id: string, values: Record<string, string>) => void;

  // Selected tool/case
  selectedCalcId: string | null;
  setSelectedCalcId: (id: string | null) => void;
  selectedCaseId: string | null;
  setSelectedCaseId: (id: string | null) => void;

  // Gamification & Progression
  xp: number;
  level: number;
  levelName: string;
  streak: number;
  lastActiveDate: string | null;
  newLevelUnlocked: boolean;
  clearLevelAlert: () => void;

  // Badges & Milestones
  unlockedBadges: Record<string, string>; // badgeId -> timestamp
  newBadgeUnlocked: Badge | null;
  clearBadgeAlert: () => void;

  // History & Storage
  quizHistory: QuizResultRecord[];
  caseSubmissions: Record<string, CaseSubmission>;
  savedCalcIds: string[];
  toggleSaveCalc: (id: string) => void;

  // Actions
  addXp: (amount: number, reason?: string) => void;
  recordActivity: () => void;
  saveQuizResult: (result: Omit<QuizResultRecord, 'id' | 'date'>) => void;
  submitCase: (submission: Omit<CaseSubmission, 'submittedAt'>) => void;
  resetAllProgress: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Default Nav
      activeTab: 'home',
      setActiveTab: (tab) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        set({ activeTab: tab });
      },

      theme: 'cream',
      setTheme: (theme) => set({ theme }),
      savedInputs: {},
      saveInputs: (id, values) => set({ savedInputs: { ...get().savedInputs, [id]: values } }),

      selectedCalcId: null,
      setSelectedCalcId: (id) => set({ selectedCalcId: id }),
      selectedCaseId: null,
      setSelectedCaseId: (id) => set({ selectedCaseId: id }),

      // Initial Progression
      xp: 0,
      level: 1,
      levelName: 'Finance Rookie',
      streak: 1,
      lastActiveDate: null,
      newLevelUnlocked: false,
      clearLevelAlert: () => set({ newLevelUnlocked: false }),

      unlockedBadges: {},
      newBadgeUnlocked: null,
      clearBadgeAlert: () => set({ newBadgeUnlocked: null }),

      quizHistory: [],
      caseSubmissions: {},
      savedCalcIds: ['pv', 'npv', 'emi', 'wacc'],

      toggleSaveCalc: (id) => {
        const current = get().savedCalcIds;
        const exists = current.includes(id);
        const updated = exists ? current.filter(x => x !== id) : [...current, id];
        set({ savedCalcIds: updated });
      },

      addXp: (amount, _reason) => {
        const state = get();
        const newXp = state.xp + amount;
        
        // Find current level tier
        let currentTier = LEVEL_TIERS[0];
        for (const tier of LEVEL_TIERS) {
          if (newXp >= tier.minXp) {
            currentTier = tier;
          }
        }

        const leveledUp = currentTier.level > state.level;

        set({
          xp: newXp,
          level: currentTier.level,
          levelName: currentTier.name,
          newLevelUnlocked: leveledUp ? true : state.newLevelUnlocked
        });

        // Trigger streak check
        get().recordActivity();
      },

      recordActivity: () => {
        const today = new Date().toISOString().split('T')[0];
        const last = get().lastActiveDate;

        if (!last) {
          set({ streak: 1, lastActiveDate: today });
          return;
        }

        if (last === today) return; // already recorded today

        const lastDate = new Date(last);
        const todayDate = new Date(today);
        const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

        let newStreak = get().streak;
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1; // broken streak
        }

        set({ streak: newStreak, lastActiveDate: today });

        // Badge checks for streak
        if (newStreak >= 3 && !get().unlockedBadges['streak_3']) {
          get().unlockedBadges['streak_3'] = new Date().toISOString();
          const b = ALL_BADGES.find(x => x.id === 'streak_3');
          if (b) set({ newBadgeUnlocked: b });
        }
        if (newStreak >= 7 && !get().unlockedBadges['streak_7']) {
          get().unlockedBadges['streak_7'] = new Date().toISOString();
          const b = ALL_BADGES.find(x => x.id === 'streak_7');
          if (b) set({ newBadgeUnlocked: b });
        }
      },

      saveQuizResult: (res) => {
        const id = 'quiz-' + Date.now();
        const date = new Date().toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const record: QuizResultRecord = { ...res, id, date };
        const history = [record, ...get().quizHistory].slice(0, 30);

        set({ quizHistory: history });
        get().addXp(res.xpEarned, 'Quiz Result');

        // Check badges
        const unlocked = { ...get().unlockedBadges };
        if (!unlocked['first_quiz']) {
          unlocked['first_quiz'] = new Date().toISOString();
          const b = ALL_BADGES.find(x => x.id === 'first_quiz');
          set({ unlockedBadges: unlocked, newBadgeUnlocked: b || null });
        }
        if (res.accuracy === 100 && res.totalQuestions >= 5 && !unlocked['perfect_score']) {
          unlocked['perfect_score'] = new Date().toISOString();
          const b = ALL_BADGES.find(x => x.id === 'perfect_score');
          set({ unlockedBadges: unlocked, newBadgeUnlocked: b || null });
        }
      },

      submitCase: (sub) => {
        const caseId = sub.caseId;
        const exists = get().caseSubmissions[caseId];
        const submittedAt = new Date().toISOString();

        const updated = {
          ...get().caseSubmissions,
          [caseId]: { ...sub, submittedAt }
        };

        set({ caseSubmissions: updated });

        // Only award XP on the first attempt
        if (!exists) {
          get().addXp(sub.xpEarned, `Case: ${caseId}`);
        }

        // Badge checks
        const unlocked = { ...get().unlockedBadges };
        if (!unlocked['boardroom_starter']) {
          unlocked['boardroom_starter'] = new Date().toISOString();
          const b = ALL_BADGES.find(x => x.id === 'boardroom_starter');
          set({ unlockedBadges: unlocked, newBadgeUnlocked: b || null });
        }

        const totalCases = Object.keys(updated).length;
        if (totalCases >= 5 && !unlocked['cfo_strategist']) {
          unlocked['cfo_strategist'] = new Date().toISOString();
          const b = ALL_BADGES.find(x => x.id === 'cfo_strategist');
          set({ unlockedBadges: unlocked, newBadgeUnlocked: b || null });
        }
      },

      resetAllProgress: () => {
        set({
          xp: 0,
          level: 1,
          levelName: 'Finance Rookie',
          streak: 1,
          lastActiveDate: null,
          unlockedBadges: {},
          quizHistory: [],
          caseSubmissions: {},
          savedCalcIds: ['pv', 'npv', 'emi', 'wacc'],
          savedInputs: {},
          theme: 'cream',
        });
      }
    }),
    {
      name: 'finsoul_gamified_v2'
    }
  )
);
