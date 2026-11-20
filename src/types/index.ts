export type NavigationTab = 'home' | 'toolkit' | 'arena' | 'boardroom';

// --- Toolkit Types ---
export type FieldKind = 'number' | 'select' | 'list';

export interface Field {
  key: string;
  label: string;
  def: string;
  unit?: string;
  hint?: string;
  kind?: FieldKind;
  options?: [string, string][];
}

export interface Metric {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface ChartPoint {
  x: number | string;
  y: number;
  label?: string;
  secondary?: number;
}

export interface CalculationResult {
  headline: string;
  label: string;
  metrics?: [string, string][];
  steps: string[];
  interpretation?: string;
  note?: string;
  error?: string;
  chart?: {
    title: string;
    points: ChartPoint[];
    xLabel: string;
    yLabel: string;
  };
}

export interface Calculator {
  id: string;
  cat:
    | 'Time Value of Money'
    | 'Investment Analysis'
    | 'Loans & Financing'
    | 'Corporate Finance'
    | 'Financial & Accounting Ratios'
    | 'Cost & Management Accounting';
  name: string;
  desc: string;
  fields: Field[];
  run: (values: Record<string, any>) => CalculationResult;
}

// --- Arena Types ---
export type QuestionType = 'mcq' | 'numerical' | 'boolean' | 'blank' | 'match' | 'scenario';
export type QuizDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type QuizCategory =
  | 'Corporate Finance'
  | 'Financial Accounting'
  | 'Management Accounting'
  | 'Cost Accounting'
  | 'Financial Management'
  | 'Capital Budgeting'
  | 'Financial Ratios'
  | 'Time Value of Money'
  | 'Working Capital Management'
  | 'Investment Analysis'
  | 'Financial Statement Analysis'
  | 'Business Finance';

export interface MatchPair {
  id: string;
  left: string;
  right: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  category: QuizCategory;
  difficulty: QuizDifficulty;
  prompt: string;
  scenario?: string;
  options?: string[]; // for mcq, boolean, scenario
  correctAnswer: string | number; // exact match or number
  tolerance?: number; // for numerical (e.g. 0.02 for ±2%)
  pairs?: MatchPair[]; // for matching questions
  explanation: string;
  formula?: string;
}

export interface QuizResultRecord {
  id: string;
  date: string;
  category: QuizCategory | 'Mixed' | 'Daily Challenge';
  difficulty: QuizDifficulty;
  score: number;
  totalQuestions: number;
  accuracy: number;
  xpEarned: number;
  timeSpentSeconds: number;
}

// --- Gamification & Badges ---
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'quiz' | 'streak' | 'toolkit' | 'boardroom' | 'mastery';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  unlockedAt?: string;
}

export interface LevelInfo {
  level: number;
  name: string;
  minXp: number;
  maxXp: number;
}

// --- Boardroom Types ---
export interface DataSheetItem {
  label: string;
  value: string;
  unit?: string;
  note?: string;
}

export interface DataSheetSection {
  title: string;
  items: DataSheetItem[];
}

export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  impactSummary: string;
  isBestChoice: boolean;
  scoreContribution: number;
  feedback: string;
}

export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  category: string;
  difficulty: QuizDifficulty;
  estimatedMinutes: number;
  executiveSummary: string;
  companyBackground: string;
  situation: string;
  dataSheets: DataSheetSection[];
  calculationChallenge: {
    label: string;
    unit: string;
    expectedValue: number;
    tolerancePct: number;
    formula: string;
    hint: string;
    stepSolution: string;
  };
  decisionPrompt: string;
  options: DecisionOption[];
  modelSolution: {
    cfoVerdict: string;
    strategicAnalysis: string[];
    lessonsLearned: string[];
  };
}

export interface CaseSubmission {
  caseId: string;
  score: number;
  numericGiven: number;
  numericCorrect: boolean;
  selectedOptionId: string;
  decisionCorrect: boolean;
  xpEarned: number;
  submittedAt: string;
}
