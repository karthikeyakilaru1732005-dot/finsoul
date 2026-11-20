import { Question, Badge, LevelInfo, QuizCategory } from '../types';

export const LEVEL_TIERS: LevelInfo[] = [
  { level: 1, name: 'Finance Rookie', minXp: 0, maxXp: 200 },
  { level: 2, name: 'Number Navigator', minXp: 200, maxXp: 500 },
  { level: 3, name: 'Accounting Explorer', minXp: 500, maxXp: 1000 },
  { level: 4, name: 'Finance Strategist', minXp: 1000, maxXp: 1800 },
  { level: 5, name: 'Corporate Finance Pro', minXp: 1800, maxXp: 3000 },
  { level: 6, name: 'CFO Mindset', minXp: 3000, maxXp: 5000 },
  { level: 7, name: 'Finance Legend', minXp: 5000, maxXp: 999999 }
];

export const ALL_BADGES: Badge[] = [
  { id: 'first_quiz', name: 'First Quiz Completed', description: 'Complete your first practice quiz in the Arena.', icon: '', category: 'quiz', rarity: 'Common' },
  { id: 'perfect_score', name: 'Flawless Accuracy', description: 'Score 100% on a quiz with 5 or more questions.', icon: '', category: 'quiz', rarity: 'Rare' },
  { id: 'math_wizard', name: 'Numerical Master', description: 'Correctly solve 5 numerical calculation questions in the Arena.', icon: '', category: 'quiz', rarity: 'Rare' },
  { id: 'streak_3', name: '3-Day Momentum', description: 'Practice finance concepts 3 days in a row.', icon: '', category: 'streak', rarity: 'Common' },
  { id: 'streak_7', name: 'Seven-Day Streak', description: 'Maintain a 7-day daily learning streak.', icon: '', category: 'streak', rarity: 'Rare' },
  { id: 'streak_30', name: 'Monthly Consistency', description: 'Study uninterrupted for 30 consecutive days.', icon: '', category: 'streak', rarity: 'Legendary' },
  { id: 'boardroom_starter', name: 'First Boardroom Case', description: 'Successfully solve and submit your first CFO case study.', icon: '', category: 'boardroom', rarity: 'Common' },
  { id: 'cfo_strategist', name: 'Boardroom Master', description: 'Earn top scores across 5 corporate decision cases.', icon: '', category: 'boardroom', rarity: 'Epic' },
  { id: 'dupont_detective', name: 'DuPont Specialist', description: 'Master ROE decomposition and asset turnover problems.', icon: '', category: 'mastery', rarity: 'Rare' },
  { id: 'wacc_guru', name: 'Cost of Capital Ace', description: 'Accurately solve advanced WACC and CAPM beta hurdles.', icon: '', category: 'mastery', rarity: 'Rare' },
  { id: 'toolkit_power', name: 'Toolkit Explorer', description: 'Use and export calculations from 5 different financial tools.', icon: '', category: 'toolkit', rarity: 'Common' },
  { id: 'speed_solver', name: 'Fast Thinker', description: 'Answer 5 questions under 10 seconds each with 100% accuracy.', icon: '', category: 'quiz', rarity: 'Epic' }
];

export const ARENA_CATEGORIES: QuizCategory[] = [
  'Corporate Finance',
  'Financial Accounting',
  'Management Accounting',
  'Cost Accounting',
  'Financial Management',
  'Capital Budgeting',
  'Financial Ratios',
  'Time Value of Money',
  'Working Capital Management',
  'Investment Analysis',
  'Financial Statement Analysis',
  'Business Finance',
];

export const ARENA_QUESTIONS: Question[] = [
  // -------------------------------------------------------------
  // TIME VALUE OF MONEY
  // -------------------------------------------------------------
  {
    id: 'tvm-1',
    type: 'mcq',
    category: 'Time Value of Money',
    difficulty: 'beginner',
    prompt: 'You deposit ₹10,000 in a fixed deposit paying 10% annual interest compounded annually. What is the value after 3 years?',
    options: ['₹13,000', '₹13,310', '₹12,100', '₹14,000'],
    correctAnswer: '₹13,310',
    explanation: 'FV = PV * (1 + r)^n = 10,000 * (1.10)^3 = 10,000 * 1.331 = ₹13,310. Compounding adds ₹310 more than simple interest.'
  },
  {
    id: 'tvm-2',
    type: 'numerical',
    category: 'Time Value of Money',
    difficulty: 'intermediate',
    prompt: 'Calculate the present value of ₹1,33,100 receivable in 3 years if the discount rate is 10% compounded annually.',
    correctAnswer: 100000,
    tolerance: 0.01,
    explanation: 'PV = FV / (1 + r)^n = ₹1,33,100 / (1.10)^3 = ₹1,33,100 / 1.331 = ₹1,00,000.'
  },
  {
    id: 'tvm-3',
    type: 'boolean',
    category: 'Time Value of Money',
    difficulty: 'beginner',
    prompt: 'True or False: An Annuity Due of equal payment size and duration always has a higher present value than an Ordinary Annuity at the same positive interest rate.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'True. In an Annuity Due, all payments occur at the beginning of each period, earning one extra period of interest: PV(Due) = PV(Ordinary) * (1 + r).'
  },
  {
    id: 'tvm-4',
    type: 'blank',
    category: 'Time Value of Money',
    difficulty: 'intermediate',
    prompt: 'According to the Rule of 72, money growing at an annual compound rate of 9% will double in approximately _____ years.',
    correctAnswer: '8',
    explanation: '72 / 9 = 8 years. The Rule of 72 is a handy mental shortcut for doubling time.'
  },
  {
    id: 'tvm-5',
    type: 'numerical',
    category: 'Time Value of Money',
    difficulty: 'advanced',
    prompt: 'A perpetual bond pays ₹6,000 annually forever. If your required rate of return is 8%, what is the present value of this perpetuity in rupees?',
    correctAnswer: 75000,
    tolerance: 0.01,
    explanation: 'PV = C / r = ₹6,000 / 0.08 = ₹75,000.'
  },

  // -------------------------------------------------------------
  // CORPORATE FINANCE
  // -------------------------------------------------------------
  {
    id: 'cf-1',
    type: 'mcq',
    category: 'Corporate Finance',
    difficulty: 'intermediate',
    prompt: 'Under the Capital Asset Pricing Model (CAPM), if the Risk-Free rate is 6%, Market Return is 14%, and a firm’s Beta is 1.25, what is its Cost of Equity?',
    options: ['16.0%', '15.0%', '17.5%', '14.0%'],
    correctAnswer: '16.0%',
    explanation: 'Ke = Rf + β * (Rm - Rf) = 6% + 1.25 * (14% - 6%) = 6% + 1.25 * 8% = 6% + 10% = 16.0%.'
  },
  {
    id: 'cf-2',
    type: 'numerical',
    category: 'Corporate Finance',
    difficulty: 'advanced',
    prompt: 'A company has ₹60 Lakhs Equity and ₹40 Lakhs Debt. Cost of equity is 15%, pre-tax cost of debt is 10%, and the tax rate is 30%. Compute the WACC in percentage (e.g. 11.8).',
    correctAnswer: 11.8,
    tolerance: 0.02,
    explanation: 'After-tax cost of debt = 10% * (1 - 0.30) = 7.0%. WACC = (0.60 * 15%) + (0.40 * 7%) = 9.0% + 2.8% = 11.8%.'
  },
  {
    id: 'cf-3',
    type: 'match',
    category: 'Corporate Finance',
    difficulty: 'intermediate',
    prompt: 'Match each leverage metric with its exact financial definition:',
    correctAnswer: 'matched',
    pairs: [
      { id: 'p1', left: 'Degree of Operating Leverage (DOL)', right: 'Contribution ÷ Operating Profit (EBIT)' },
      { id: 'p2', left: 'Degree of Financial Leverage (DFL)', right: 'EBIT ÷ Earnings Before Tax (EBT)' },
      { id: 'p3', left: 'Degree of Combined Leverage (DCL)', right: 'Contribution ÷ EBT (or DOL × DFL)' }
    ],
    explanation: 'DOL measures operating risk from fixed costs; DFL measures financial risk from debt interest; DCL captures the combined effect from sales to EPS.'
  },
  {
    id: 'cf-4',
    type: 'scenario',
    category: 'Corporate Finance',
    difficulty: 'advanced',
    scenario: 'Apex Corp sells units at ₹200 with ₹120 variable cost. Total fixed costs are ₹4,80,000 annually. The company currently sells 8,000 units.',
    prompt: 'What is Apex Corp’s Margin of Safety in percentage?',
    options: ['25.0%', '40.0%', '33.3%', '50.0%'],
    correctAnswer: '25.0%',
    explanation: 'Contribution/unit = ₹200 - ₹120 = ₹80. Break-even units = ₹4,80,000 / ₹80 = 6,000 units. Margin of Safety = (8,000 - 6,000) / 8,000 = 2,000 / 8,000 = 25.0%.'
  },

  // -------------------------------------------------------------
  // INVESTMENT ANALYSIS (CAPITAL BUDGETING)
  // -------------------------------------------------------------
  {
    id: 'inv-1',
    type: 'mcq',
    category: 'Investment Analysis',
    difficulty: 'beginner',
    prompt: 'When evaluating two mutually exclusive projects of differing scales, which decision metric is theoretically superior?',
    options: ['Net Present Value (NPV)', 'Internal Rate of Return (IRR)', 'Simple Payback Period', 'Accounting Rate of Return'],
    correctAnswer: 'Net Present Value (NPV)',
    explanation: 'NPV directly measures absolute rupee wealth created for shareholders. IRR can produce misleading rankings when project scales differ.'
  },
  {
    id: 'inv-2',
    type: 'numerical',
    category: 'Investment Analysis',
    difficulty: 'intermediate',
    prompt: 'An investment of ₹1,00,000 produces equal annual inflows of ₹30,000 for 4 years. What is the Simple Payback Period in years (e.g. 3.33)?',
    correctAnswer: 3.33,
    tolerance: 0.02,
    explanation: 'Payback = Initial Outlay / Annual Cash Inflow = ₹1,00,000 / ₹30,000 = 3.33 years (3 years and 4 months).'
  },
  {
    id: 'inv-3',
    type: 'boolean',
    category: 'Investment Analysis',
    difficulty: 'beginner',
    prompt: 'True or False: If a project has an NPV strictly greater than zero, its Internal Rate of Return (IRR) is guaranteed to be higher than the discount rate.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'True. For standard projects with an initial outflow followed by inflows, positive NPV implies the rate of return exceeds the cost of capital.'
  },
  {
    id: 'inv-4',
    type: 'mcq',
    category: 'Investment Analysis',
    difficulty: 'intermediate',
    prompt: 'A project costs ₹50,00,000 and the present value of future cash inflows discounted at WACC is ₹65,00,000. What is the Profitability Index (PI)?',
    options: ['1.30', '1.15', '0.77', '1.50'],
    correctAnswer: '1.30',
    explanation: 'PI = PV of Inflows / Initial Outlay = ₹65,00,000 / ₹50,00,000 = 1.30. A PI > 1.0 confirms positive value addition.'
  },

  // -------------------------------------------------------------
  // FINANCIAL RATIOS & STATEMENT ANALYSIS
  // -------------------------------------------------------------
  {
    id: 'ratio-1',
    type: 'mcq',
    category: 'Financial Ratios',
    difficulty: 'beginner',
    prompt: 'Which asset is explicitly excluded from Current Assets when calculating the Quick Ratio (Acid Test)?',
    options: ['Inventory', 'Cash & Equivalents', 'Accounts Receivable', 'Short-term Marketable Securities'],
    correctAnswer: 'Inventory',
    explanation: 'Quick Ratio = (Current Assets - Inventory) / Current Liabilities. Inventory is excluded because it cannot be converted to cash immediately without discount.'
  },
  {
    id: 'ratio-2',
    type: 'numerical',
    category: 'Financial Ratios',
    difficulty: 'intermediate',
    prompt: 'A firm has Current Assets of ₹6,00,000, Inventory of ₹2,00,000, and Current Liabilities of ₹2,50,000. What is its Quick Ratio (e.g. 1.6)?',
    correctAnswer: 1.6,
    tolerance: 0.02,
    explanation: 'Quick Assets = ₹6,00,000 - ₹2,00,000 = ₹4,00,000. Quick Ratio = ₹4,00,000 / ₹2,50,000 = 1.60x.'
  },
  {
    id: 'ratio-3',
    type: 'match',
    category: 'Financial Ratios',
    difficulty: 'intermediate',
    prompt: 'Match the 3 DuPont pillars with what they evaluate:',
    correctAnswer: 'matched',
    pairs: [
      { id: 'd1', left: 'Net Profit Margin (NI / Sales)', right: 'Operating & Pricing Efficiency' },
      { id: 'd2', left: 'Asset Turnover (Sales / Assets)', right: 'Asset Productivity & Utilization' },
      { id: 'd3', left: 'Equity Multiplier (Assets / Equity)', right: 'Financial Leverage & Debt Reliance' }
    ],
    explanation: 'DuPont breaks ROE into three drivers: Profitability, Efficiency, and Financial Leverage.'
  },
  {
    id: 'ratio-4',
    type: 'scenario',
    category: 'Financial Ratios',
    difficulty: 'advanced',
    scenario: 'Company X has Net Income of ₹1,80,000, Sales Revenue of ₹18,00,000, Total Assets of ₹12,00,000, and Equity of ₹6,00,000.',
    prompt: 'What is Company X’s Return on Equity (ROE) using DuPont decomposition?',
    options: ['30.0%', '24.0%', '15.0%', '36.0%'],
    correctAnswer: '30.0%',
    explanation: 'Net Margin = 1.8L / 18L = 10%. Asset Turnover = 18L / 12L = 1.5x. Equity Multiplier = 12L / 6L = 2.0x. ROE = 10% * 1.5 * 2.0 = 30.0%.'
  },

  // -------------------------------------------------------------
  // WORKING CAPITAL MANAGEMENT
  // -------------------------------------------------------------
  {
    id: 'wc-1',
    type: 'numerical',
    category: 'Working Capital Management',
    difficulty: 'beginner',
    prompt: 'If a company has Days Inventory (DIO) = 60 days, Days Receivables (DSO) = 45 days, and Days Payables (DPO) = 35 days, what is its Cash Conversion Cycle (CCC) in days?',
    correctAnswer: 70,
    tolerance: 0,
    explanation: 'CCC = DIO + DSO - DPO = 60 + 45 - 35 = 70 days.'
  },
  {
    id: 'wc-2',
    type: 'blank',
    category: 'Working Capital Management',
    difficulty: 'intermediate',
    prompt: 'Working capital is defined as Current Assets minus Current ______________.',
    correctAnswer: 'liabilities',
    explanation: 'Net Working Capital = Current Assets - Current Liabilities. Positive working capital provides an operating solvency buffer.'
  },
  {
    id: 'wc-3',
    type: 'mcq',
    category: 'Working Capital Management',
    difficulty: 'intermediate',
    prompt: 'Which managerial action will reliably SHORTEN the Cash Conversion Cycle?',
    options: [
      'Accelerating customer collections by offering early payment discounts',
      'Holding larger safety buffer stocks of raw materials',
      'Paying supplier invoices immediately in cash on day 1',
      'Extending customer payment terms from 30 to 60 days'
    ],
    correctAnswer: 'Accelerating customer collections by offering early payment discounts',
    explanation: 'Faster collections lower DSO, reducing the total cycle time before cash returns to the company account.'
  },

  // -------------------------------------------------------------
  // ACCOUNTING FOR MANAGERS
  // -------------------------------------------------------------
  {
    id: 'acc-1',
    type: 'boolean',
    category: 'Management Accounting',
    difficulty: 'beginner',
    prompt: 'True or False: Sunk costs are historical expenditures that cannot be recovered and therefore must be ignored in forward-looking managerial decisions.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'True. Sunk costs are past events that do not change regardless of the decision made today.'
  },
  {
    id: 'acc-2',
    type: 'mcq',
    category: 'Management Accounting',
    difficulty: 'intermediate',
    prompt: 'A company allocates ₹1,00,000 of general corporate headquarter rent to a loss-making department. If the department is closed, this rent cost will continue. Is this rent cost relevant for the shutdown decision?',
    options: [
      'No, because it is an unavoidable allocated cost',
      'Yes, because it reduces departmental accounting profit',
      'Yes, all fixed costs are relevant',
      'No, only variable costs can be recorded'
    ],
    correctAnswer: 'No, because it is an unavoidable allocated cost',
    explanation: 'Unavoidable costs that persist under both choices are irrelevant. Closing the department will not eliminate the rent expense.'
  },
  {
    id: 'fa-1',
    type: 'mcq',
    category: 'Financial Accounting',
    difficulty: 'beginner',
    prompt: 'Which statement reports the financial position of a business at a single date?',
    options: ['Income statement', 'Balance sheet', 'Cash flow statement', 'Statement of changes in equity only'],
    correctAnswer: 'Balance sheet',
    explanation: 'The balance sheet is a snapshot of assets, liabilities, and equity on a specific date. The income statement covers a period.'
  },
  {
    id: 'fa-2',
    type: 'boolean',
    category: 'Financial Accounting',
    difficulty: 'intermediate',
    prompt: 'True or False: Accrual accounting recognises revenue when cash is collected, even if the goods have not been delivered.',
    options: ['True', 'False'],
    correctAnswer: 'False',
    explanation: 'False. Accrual accounting recognises revenue when it is earned, which is generally when control of the goods or service passes, not merely when cash arrives.'
  },
  {
    id: 'ca-1',
    type: 'numerical',
    category: 'Cost Accounting',
    difficulty: 'intermediate',
    prompt: 'Fixed costs are ₹2,40,000. Selling price is ₹80 and variable cost is ₹50. How many units are needed to break even?',
    correctAnswer: 8000,
    tolerance: 0.01,
    formula: 'Break-even units = Fixed costs / (Price − Variable cost)',
    explanation: 'Contribution margin = 80 − 50 = ₹30. Break-even = 2,40,000 / 30 = 8,000 units.'
  },
  {
    id: 'ca-2',
    type: 'blank',
    category: 'Cost Accounting',
    difficulty: 'beginner',
    prompt: 'Costs that change in total in direct proportion to activity are called _____ costs.',
    correctAnswer: 'variable',
    explanation: 'Variable costs move with volume. Fixed costs stay constant in total over the relevant range.'
  },
  {
    id: 'fm-1',
    type: 'mcq',
    category: 'Financial Management',
    difficulty: 'beginner',
    prompt: 'The primary financial objective of a commercial company, in standard corporate-finance teaching, is to:',
    options: [
      'Maximise shareholder wealth',
      'Maximise accounting profit in the current quarter only',
      'Minimise the current ratio',
      'Maximise the debt ratio'
    ],
    correctAnswer: 'Maximise shareholder wealth',
    explanation: 'Financial management aims at shareholder wealth, which reflects the present value of expected cash flows, not a single period of accounting profit.'
  },
  {
    id: 'fm-2',
    type: 'boolean',
    category: 'Financial Management',
    difficulty: 'intermediate',
    prompt: 'True or False: The agency problem arises because managers may pursue personal goals that differ from owners’ goals.',
    options: ['True', 'False'],
    correctAnswer: 'True',
    explanation: 'True. Separation of ownership and control creates agency conflict. Incentives, governance, and monitoring are the usual responses.'
  },
  {
    id: 'cb-1',
    type: 'numerical',
    category: 'Capital Budgeting',
    difficulty: 'intermediate',
    prompt: 'A project needs ₹1,00,000 now and returns ₹60,000 at the end of year 1 and ₹60,000 at the end of year 2. Discount rate is 10%. What is the NPV in rupees, rounded to the nearest rupee?',
    correctAnswer: 4132,
    tolerance: 0.02,
    formula: 'NPV = −100000 + 60000/1.10 + 60000/1.10^2',
    explanation: 'PV1 = 54,545. PV2 = 49,587. NPV = −100,000 + 54,545 + 49,587 = ₹4,132. Accept because NPV is positive.'
  },
  {
    id: 'cb-2',
    type: 'mcq',
    category: 'Capital Budgeting',
    difficulty: 'beginner',
    prompt: 'A conventional project should be accepted when:',
    options: ['NPV is positive', 'Payback is longer than the project life', 'IRR is below the cost of capital', 'The accounting rate of return is negative'],
    correctAnswer: 'NPV is positive',
    explanation: 'A positive NPV means the project earns more than the required return and adds value. IRR should exceed the cost of capital for the same accept decision on a conventional project.'
  },
  {
    id: 'fsa-1',
    type: 'mcq',
    category: 'Financial Statement Analysis',
    difficulty: 'intermediate',
    prompt: 'Two firms report the same ROE. Firm A has a higher net margin and lower leverage than Firm B. Which reading is sound?',
    options: [
      'Firm A’s return is more dependent on operating profitability',
      'The firms are identical investments',
      'Firm B must have a higher ROA',
      'ROE cannot be decomposed'
    ],
    correctAnswer: 'Firm A’s return is more dependent on operating profitability',
    explanation: 'DuPont splits ROE into margin, turnover, and leverage. Equal ROE can hide very different risk. Higher margin and lower leverage points to operating strength rather than debt amplification.'
  },
  {
    id: 'fsa-2',
    type: 'blank',
    category: 'Financial Statement Analysis',
    difficulty: 'beginner',
    prompt: 'A common-size income statement expresses each line as a percentage of _____.',
    correctAnswer: 'sales',
    explanation: 'Common-size income statements use revenue as the base so margins can be compared across years and companies.'
  },
  {
    id: 'bf-1',
    type: 'scenario',
    category: 'Business Finance',
    difficulty: 'advanced',
    scenario: 'A retailer can fund a festive inventory build with a 90-day bank loan at 14% or by stretching supplier credit and losing a 2% cash discount on 30-day terms.',
    prompt: 'Which financing choice is usually cheaper if the cash-discount terms are 2/10 net 30?',
    options: [
      'Take the cash discount and use the bank only for any residual gap',
      'Always skip the discount because 2% looks small',
      'Stretch payables with no cost',
      'Issue new equity for a 90-day inventory need'
    ],
    correctAnswer: 'Take the cash discount and use the bank only for any residual gap',
    explanation: 'Forgoing 2/10 net 30 costs about 2/98 × 365/20 ≈ 37% annualised, which is far above a 14% bank line. Take the discount when bank finance is available.'
  },
  {
    id: 'bf-2',
    type: 'boolean',
    category: 'Business Finance',
    difficulty: 'beginner',
    prompt: 'True or False: Trade credit is free whenever a supplier does not charge explicit interest.',
    options: ['True', 'False'],
    correctAnswer: 'False',
    explanation: 'False. Forgoing an early-payment discount is an implicit financing cost, and stretched credit can damage supply terms.'
  }
];
