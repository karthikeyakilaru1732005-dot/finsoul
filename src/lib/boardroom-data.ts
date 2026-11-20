import { CaseStudy } from '../types';

export const BOARDROOM_CASES: CaseStudy[] = [
  // --------------------------------------------------------------------------
  // CASE 1: Capital Budgeting — Machinery Replacement
  // --------------------------------------------------------------------------
  {
    id: 'case-1',
    slug: 'machinery-replacement',
    title: 'Titan Precision: Automated CNC Overhaul',
    category: 'Capital Budgeting',
    difficulty: 'intermediate',
    estimatedMinutes: 12,
    executiveSummary: 'Determine whether Titan Precision should retire an aging lathe and deploy a ₹12,00,000 automated CNC system based on incremental discounted cash flows.',
    companyBackground: 'Titan Precision is a Tier-2 automotive parts manufacturer experiencing an 18% spike in component rejection rates due to worn hydraulic machinery.',
    situation: 'Plant operations propose replacing Lathe #4 with an automated German CNC cell. The new system costs ₹12,00,000, has a 5-year working life with zero salvage value, and reduces scrap & labor costs by ₹3,80,000 annually. The company discount rate is 11%, and tax is 25%. Straight-line depreciation applies.',
    dataSheets: [
      {
        title: 'Capital Expenditure & Timeline',
        items: [
          { label: 'Initial Outlay (t=0)', value: '₹12,00,000' },
          { label: 'Asset Economic Life', value: '5 Years' },
          { label: 'Terminal Salvage Value', value: '₹0' },
          { label: 'Depreciation Method', value: 'Straight-line (₹2,40,000 / yr)' }
        ]
      },
      {
        title: 'Operating Savings & Parameters',
        items: [
          { label: 'Annual Operating Pre-Tax Savings', value: '₹3,80,000' },
          { label: 'Annual Depreciation Expense', value: '₹2,40,000' },
          { label: 'Corporate Tax Rate', value: '25%' },
          { label: 'Weighted Average Cost of Capital (WACC)', value: '11%' }
        ]
      }
    ],
    calculationChallenge: {
      label: 'Annual Operating Cash Flow (OCF)',
      unit: '₹',
      expectedValue: 345000,
      tolerancePct: 2,
      formula: 'OCF = (Pre-tax Savings - Depr) * (1 - Tax) + Depr',
      hint: 'Taxable operating savings = ₹3,80,000 - ₹2,40,000 = ₹1,40,000. Add back non-cash depreciation.',
      stepSolution: '1. Net Operating Profit After Tax = (₹3,80,000 - ₹2,40,000) * (1 - 0.25) = ₹1,40,000 * 0.75 = ₹1,05,000.\n2. Operating Cash Flow = ₹1,05,000 + ₹2,40,000 = ₹3,45,000 / year.'
    },
    decisionPrompt: 'Based on the Net Present Value of this automated cell (PV of ₹3,45,000/yr at 11% for 5 yrs ≈ ₹12,75,085 minus ₹12,00,000 outlay = +₹75,085), what is your executive recommendation?',
    options: [
      {
        id: 'opt-invest',
        title: 'Approve Capital Expenditure Immediately',
        description: 'Authorize the ₹12,00,000 deployment since NPV > 0 and IRR exceeds the 11% hurdle rate.',
        impactSummary: 'Creates ₹75,085 in net shareholder value; mitigates quality defect penalties.',
        isBestChoice: true,
        scoreContribution: 50,
        feedback: 'Excellent CFO judgment. Positive NPV projects expand enterprise value. The tax depreciation shield significantly protects cash flows.'
      },
      {
        id: 'opt-reject',
        title: 'Reject Due to Simple Payback Exceeding 3 Years',
        description: 'Decline because recovering ₹12,00,000 takes approximately 3.48 years, violating conservative 3-year limits.',
        impactSummary: 'Avoids capital outlay but exposes firm to continuing rejection penalties.',
        isBestChoice: false,
        scoreContribution: 10,
        feedback: 'Flawed rationale. Rejecting based solely on an arbitrary simple payback rule ignores positive NPV and the time value of money.'
      },
      {
        id: 'opt-repair',
        title: 'Patch Existing Hydraulic Lathe for Another Year',
        description: 'Spend ₹1,50,000 on temporary hydraulic seals and postpone capital spending.',
        impactSummary: 'Saves immediate capex, but defect rates remain above customer tolerance.',
        isBestChoice: false,
        scoreContribution: 15,
        feedback: 'Sub-optimal. Sunk-cost trap. Continuing to patch unreliable machinery preserves high scrap rates and damages customer retention.'
      }
    ],
    modelSolution: {
      cfoVerdict: 'PROCEED WITH CAPEX. Positive NPV (+₹75,085) and IRR of 13.5% exceed the 11% corporate discount rate.',
      strategicAnalysis: [
        'Annual after-tax cash inflow is ₹3,45,000, bolstered by a ₹60,000 annual tax shield from depreciation.',
        'The 5-year annuity factor at 11% is 3.6959. Present value of inflows = ₹3,45,000 * 3.6959 = ₹12,75,085.',
        'Net Present Value = ₹12,75,085 - ₹12,00,000 = +₹75,085. The project adds tangible wealth.'
      ],
      lessonsLearned: [
        'Always evaluate capital budgeting through discounted cash flows, not accounting net income.',
        'Depreciation is non-cash, but its tax shield generates very real cash inflows.'
      ]
    }
  },

  // --------------------------------------------------------------------------
  // CASE 2: Investment Evaluation — Capital Rationing
  // --------------------------------------------------------------------------
  {
    id: 'case-2',
    slug: 'capital-rationing',
    title: 'Aura Logistics: Capital Allocation Under Rationing',
    category: 'Investment Evaluation',
    difficulty: 'advanced',
    estimatedMinutes: 15,
    executiveSummary: 'Select the optimal mix of projects for Aura Logistics within an enforced ₹1,50,00,000 capex budget to maximize total shareholder wealth.',
    companyBackground: 'Aura Logistics has four promising greenfield expansion opportunities across India but faces an institutional debt covenant capping capital expenditures at ₹1,50,00,000 this fiscal year.',
    situation: 'Project Alpha (Warehousing): Capex ₹80L, NPV ₹24L (PI 1.30).\nProject Beta (Cold Chain): Capex ₹60L, NPV ₹21L (PI 1.35).\nProject Gamma (EV Fleet): Capex ₹70L, NPV ₹21L (PI 1.30).\nProject Delta (Fulfillment Hub): Capex ₹30L, NPV ₹12L (PI 1.40). Projects are indivisible.',
    dataSheets: [
      {
        title: 'Project Pipeline Metrics',
        items: [
          { label: 'Project Alpha (Warehousing)', value: 'Capex: ₹80L | NPV: ₹24L | PI: 1.30' },
          { label: 'Project Beta (Cold Chain)', value: 'Capex: ₹60L | NPV: ₹21L | PI: 1.35' },
          { label: 'Project Gamma (EV Fleet)', value: 'Capex: ₹70L | NPV: ₹21L | PI: 1.30' },
          { label: 'Project Delta (Fulfillment Hub)', value: 'Capex: ₹30L | NPV: ₹12L | PI: 1.40' }
        ]
      },
      {
        title: 'Constraint Parameters',
        items: [
          { label: 'Available Budget Ceiling', value: '₹1,50,00,000 (₹150 Lakhs)' },
          { label: 'Project Divisibility', value: 'Strictly Indivisible (All or nothing)' }
        ]
      }
    ],
    calculationChallenge: {
      label: 'Maximum Possible Total NPV under ₹150L Budget',
      unit: '₹ Lakhs',
      expectedValue: 45,
      tolerancePct: 1,
      formula: 'Enumerate all feasible indivisible project combinations and select the bundle with the highest total NPV.',
      hint: 'Compare feasible bundles: Alpha + Beta costs 140L for 45L NPV; Alpha + Gamma costs 150L for 45L NPV; Beta + Gamma costs 130L for 42L NPV. Check whether any other feasible bundle exceeds 45L.',
      stepSolution: 'Feasible packages:\n- Alpha (80L) + Beta (60L) = 140L spent -> Total NPV = ₹45 Lakhs.\n- Alpha (80L) + Gamma (70L) = 150L spent -> Total NPV = ₹45 Lakhs.\n- Beta (60L) + Delta (30L) = 90L spent -> Total NPV = ₹33 Lakhs.\nMax achievable NPV within ₹150L budget = ₹45 Lakhs.'
    },
    decisionPrompt: 'Which project bundle should Aura Logistics approve to maximize shareholder wealth without breaching covenants?',
    options: [
      {
        id: 'opt-alpha-beta',
        title: 'Portfolio 1: Alpha (₹80L) + Beta (₹60L)',
        description: 'Invest ₹140 Lakhs total, retaining ₹10L cash buffer and locking in ₹45 Lakhs of total NPV.',
        impactSummary: 'Maximized NPV (₹45 Lakhs) with an unspent ₹10L liquidity safety buffer.',
        isBestChoice: true,
        scoreContribution: 50,
        feedback: 'Correct strategic optimization. Under capital rationing with indivisible assets, choose the bundle that delivers the highest combined absolute NPV.'
      },
      {
        id: 'opt-delta-highest-pi',
        title: 'Select Delta first due to highest PI (1.40) + Beta (60L)',
        description: 'Take Delta (30L) + Beta (60L) = 90L total. Leaves ₹60L unspent because Alpha and Gamma are too large.',
        impactSummary: 'Yields only ₹33 Lakhs in total NPV, leaving substantial borrowing capacity wasted.',
        isBestChoice: false,
        scoreContribution: 15,
        feedback: 'PI ranking fails when projects are indivisible and significant budget would sit idle.'
      },
      {
        id: 'opt-breach-all',
        title: 'Fund Beta + Gamma + Delta (₹160 Lakhs) via short-term credit',
        description: 'Breach the ₹150L debt covenant by ₹10 Lakhs to capture ₹54 Lakhs total NPV.',
        impactSummary: 'Severe risk of triggering loan acceleration and creditor penalties.',
        isBestChoice: false,
        scoreContribution: 5,
        feedback: 'Dangerous CFO mistake. Covenant breaches trigger loan recalls and insolvency risk.'
      }
    ],
    modelSolution: {
      cfoVerdict: 'SELECT ALPHA + BETA (or ALPHA + GAMMA). Total investment ₹1,40,00,000; Total NPV added: ₹45,00,000.',
      strategicAnalysis: [
        'The Profitability Index (PI) ranks projects by efficiency per rupee, but when capital is lumpy/indivisible, knapsack optimization dictates finding the highest aggregate NPV.',
        'Selecting Delta (PI 1.40) leaves ₹60L unspent, generating only ₹33L total NPV.',
        'Combining Alpha + Beta exhausts ₹140L and produces ₹45 Lakhs of net wealth.'
      ],
      lessonsLearned: [
        'Profitability Index works best for divisible projects. For discrete capital allocations, aggregate portfolio NPV is king.',
        'Never violate institutional covenants for minor incremental returns.'
      ]
    }
  },

  // --------------------------------------------------------------------------
  // CASE 3: Business Expansion — Regional Hub DCF
  // --------------------------------------------------------------------------
  {
    id: 'case-3',
    slug: 'regional-expansion',
    title: 'BlueHorizon Retail: Southern Corridor Expansion',
    category: 'Business Expansion',
    difficulty: 'intermediate',
    estimatedMinutes: 12,
    executiveSummary: 'Evaluate a ₹2.5 Crore retail expansion into Bengaluru and Chennai using discounted cash flow analysis.',
    companyBackground: 'BlueHorizon Retail operates 24 successful lifestyle apparel stores in Western India and is evaluating a 3-store cluster in Southern India.',
    situation: 'Upfront store fitout and leasehold improvements require ₹2,50,00,000. Expected free cash flows are ₹60,00,000 (Yr 1), ₹85,00,000 (Yr 2), ₹1,10,00,000 (Yr 3), and ₹1,20,00,000 (Yr 4). At the end of Year 4, the lease terminates with recoverable working capital of ₹30,00,000. WACC is 12%.',
    dataSheets: [
      {
        title: 'Investment Outlay & Free Cash Flows',
        items: [
          { label: 'Initial Outlay (t=0)', value: '₹2,50,00,000' },
          { label: 'Year 1 Free Cash Flow', value: '₹60,00,000' },
          { label: 'Year 2 Free Cash Flow', value: '₹85,00,000' },
          { label: 'Year 3 Free Cash Flow', value: '₹1,10,00,000' },
          { label: 'Year 4 Free Cash Flow + Recovery', value: '₹1,50,00,000 (₹120L + ₹30L)' }
        ]
      },
      {
        title: 'Corporate Hurdle Rate',
        items: [
          { label: 'Cost of Equity', value: '15%' },
          { label: 'Cost of Debt (after-tax)', value: '7.5%' },
          { label: 'Blended WACC', value: '12.0%' }
        ]
      }
    ],
    calculationChallenge: {
      label: 'Net Present Value of Southern Expansion',
      unit: '₹',
      expectedValue: 4495615,
      tolerancePct: 3,
      formula: 'NPV = (60L/1.12) + (85L/1.12^2) + (110L/1.12^3) + (150L/1.12^4) - 250L',
      hint: 'Discount Year 1 by 1.12, Year 2 by 1.2544, Year 3 by 1.4049, and Year 4 by 1.5735. Subtract ₹2,50,00,000.',
      stepSolution: 'PV of Year 1: ₹53,57,143\nPV of Year 2: ₹67,76,148\nPV of Year 3: ₹78,29,598\nPV of Year 4: ₹95,32,726\nGross PV = ₹2,94,95,615\nNPV = ₹2,94,95,615 - ₹2,50,00,000 = +₹44,95,615'
    },
    decisionPrompt: 'Should BlueHorizon Retail commit ₹2.5 Crore to this Southern corridor expansion?',
    options: [
      {
        id: 'opt-proceed-expansion',
        title: 'Approve Expansion Project',
        description: 'Execute the project. NPV is substantially positive (+₹45 Lakhs), delivering a 19.1% IRR vs 12% WACC.',
        impactSummary: 'Expands geographic brand footprint while creating ₹45 Lakhs in net equity value.',
        isBestChoice: true,
        scoreContribution: 50,
        feedback: 'Correct. Clear corporate value creation with a healthy margin of safety above the 12% WACC.'
      },
      {
        id: 'opt-postpone',
        title: 'Delay by 12 Months to Build Cash Reserves',
        description: 'Postpone expansion to avoid borrowing.',
        impactSummary: 'Allows competitors to secure prime retail real estate in target malls.',
        isBestChoice: false,
        scoreContribution: 15,
        feedback: 'Unnecessary delay. Cost of capital already factors debt risk. Delaying surrenders market first-mover advantage.'
      }
    ],
    modelSolution: {
      cfoVerdict: 'APPROVE THE EXPANSION. NPV equals +₹44,95,615 with an internal rate of return exceeding 19%.',
      strategicAnalysis: [
        'The project breaks even in approximately 2.9 years on a discounted basis.',
        'Terminal recovery of working capital adds ₹19L in present value, mitigating downside risk.'
      ],
      lessonsLearned: [
        'Cluster expansion spreads regional marketing and distribution overheads across multiple stores.'
      ]
    }
  },

  // --------------------------------------------------------------------------
  // CASE 4: Make-or-Buy Decision — Component Outsourcing
  // --------------------------------------------------------------------------
  {
    id: 'case-4',
    slug: 'component-outsourcing',
    title: 'Electra Motors: Battery Enclosure Make-or-Buy',
    category: 'Make-or-Buy Decision',
    difficulty: 'intermediate',
    estimatedMinutes: 10,
    executiveSummary: 'Determine whether to manufacture 50,000 EV battery casing units internally or outsource to an external specialist supplier.',
    companyBackground: 'Electra Motors manufactures electric 2-wheelers. Rapid demand growth requires 50,000 aluminum battery housings annually.',
    situation: 'Internal Cost per unit: Direct Materials ₹320, Direct Labor ₹180, Variable Overhead ₹80, Allocated General Fixed Overhead ₹140 (Total: ₹720/unit). A certified vendor offers the identical housing at ₹620/unit. However, internal fixed overhead of ₹140/unit will continue regardless of whether the part is made or bought.',
    dataSheets: [
      {
        title: 'Current In-House Unit Economics',
        items: [
          { label: 'Direct Materials', value: '₹320 / unit' },
          { label: 'Direct Labor', value: '₹180 / unit' },
          { label: 'Variable Overhead', value: '₹80 / unit' },
          { label: 'Allocated Fixed Overhead (Unavoidable)', value: '₹140 / unit' },
          { label: 'Total Accounting Cost', value: '₹720 / unit' }
        ]
      },
      {
        title: 'Vendor Quotation',
        items: [
          { label: 'Supplier Quoted Price', value: '₹620 / unit' },
          { label: 'Annual Required Volume', value: '50,000 units' }
        ]
      }
    ],
    calculationChallenge: {
      label: 'Relevant Incremental Cost to Make Internally',
      unit: '₹',
      expectedValue: 580,
      tolerancePct: 1,
      formula: 'Relevant Cost to Make = Direct Materials + Direct Labor + Variable Overhead',
      hint: 'Ignore allocated fixed overhead (₹140) because it is sunk and will persist either way.',
      stepSolution: 'Relevant In-House Cost = ₹320 + ₹180 + ₹80 = ₹580 per unit.\nVendor Price = ₹620 per unit.\nCost advantage of making in-house = ₹620 - ₹580 = ₹40 per unit (₹20,00,000 savings/yr).'
    },
    decisionPrompt: 'Should Electra Motors outsource the battery enclosure to the vendor at ₹620 or continue making it internally?',
    options: [
      {
        id: 'opt-keep-inhouse',
        title: 'Continue Making In-House at Relevant Cost of ₹580',
        description: 'Reject the vendor offer. Relevant in-house cost is ₹580 vs supplier ₹620, saving ₹20,00,000 annually.',
        impactSummary: 'Protects gross margins and maintains direct control over quality and proprietary tooling.',
        isBestChoice: true,
        scoreContribution: 50,
        feedback: 'Masterful managerial accounting. Allocated fixed costs continue regardless. Comparing vendor price (₹620) to relevant cost (₹580) reveals in-house is ₹40/unit cheaper.'
      },
      {
        id: 'opt-outsource',
        title: 'Outsource to Vendor at ₹620 to "Save" ₹100/unit',
        description: 'Accept vendor quotation because ₹620 is lower than full accounting cost of ₹720.',
        impactSummary: 'Incurs net corporate cash losses of ₹20,00,000 per year.',
        isBestChoice: false,
        scoreContribution: 10,
        feedback: 'Classic cost-allocation error! The ₹140 fixed overhead remains, meaning total cost under outsourcing becomes ₹620 + ₹140 = ₹760/unit, destroying ₹20 Lakhs in cash.'
      }
    ],
    modelSolution: {
      cfoVerdict: 'RETAIN IN-HOUSE PRODUCTION. Relevant marginal cost is ₹580/unit versus ₹620 external price.',
      strategicAnalysis: [
        'Total Cost to Make: 50,000 * (₹320 + ₹180 + ₹80) = ₹2,90,00,000.',
        'Total Cost to Buy: (50,000 * ₹620) + (50,000 * ₹140 unavoidable fixed costs) = ₹3,80,00,000.',
        'Outsourcing costs Electra an additional ₹20,00,000 in cold hard cash every year.'
      ],
      lessonsLearned: [
        'Only future costs that differ between alternatives are relevant for managerial decisions.',
        'Allocated corporate overheads must never be treated as savings unless facilities are shut down.'
      ]
    }
  },

  // --------------------------------------------------------------------------
  // CASE 5: Pricing Strategy — Margin vs. Penetration
  // --------------------------------------------------------------------------
  {
    id: 'case-5',
    slug: 'pricing-strategy',
    title: 'Nova Beverages: Premium vs. Volume Penetration',
    category: 'Pricing Decisions',
    difficulty: 'intermediate',
    estimatedMinutes: 10,
    executiveSummary: 'Determine the revenue and total contribution-maximizing pricing structure for a functional energy drink.',
    companyBackground: 'Nova Beverages is launching "VoltMax", a natural electrolyte drink. Production variable cost is ₹35 per can; fixed marketing budget is ₹60,00,000.',
    situation: 'Market research identifies two viable pricing paths:\nStrategy A (Premium): Retail at ₹90/can. Estimated annual volume: 2,00,000 cans.\nStrategy B (Mass Penetration): Retail at ₹65/can. Estimated annual volume: 4,50,000 cans.',
    dataSheets: [
      {
        title: 'Cost Structure',
        items: [
          { label: 'Unit Variable Cost (COGS + packaging)', value: '₹35 / can' },
          { label: 'Annual Fixed Marketing & Distribution', value: '₹60,00,000' }
        ]
      },
      {
        title: 'Market Demand Scenarios',
        items: [
          { label: 'Strategy A (Premium)', value: 'Price: ₹90 | Expected Volume: 2,00,000 cans' },
          { label: 'Strategy B (Mass Penetration)', value: 'Price: ₹65 | Expected Volume: 4,50,000 cans' }
        ]
      }
    ],
    calculationChallenge: {
      label: 'Total Contribution Margin under Strategy B (Mass Penetration)',
      unit: '₹',
      expectedValue: 13500000,
      tolerancePct: 1,
      formula: 'Total Contribution = Volume * (Selling Price - Variable Cost)',
      hint: 'CM per can = ₹65 - ₹35 = ₹30. Multiply by 4,50,000 cans.',
      stepSolution: 'Strategy A Total Contribution = 2,00,000 * (₹90 - ₹35) = 2,00,000 * ₹55 = ₹1,10,00,000.\nStrategy B Total Contribution = 4,50,000 * (₹65 - ₹35) = 4,50,000 * ₹30 = ₹1,35,00,000.\nNet Profit Strategy B: ₹1,35,00,000 - ₹60,00,000 = ₹75,00,000 vs Strategy A ₹50,00,000.'
    },
    decisionPrompt: 'Which pricing strategy generates higher operating profit (EBIT) after covering fixed overheads?',
    options: [
      {
        id: 'opt-penetration',
        title: 'Strategy B: Penetration Pricing at ₹65',
        description: 'Capture mass volume. Generates ₹1,35,00,000 contribution and ₹75,00,000 EBIT (₹25L higher than Strategy A).',
        impactSummary: 'Higher operating profit and faster retail shelf presence.',
        isBestChoice: true,
        scoreContribution: 50,
        feedback: 'Correct. Despite a lower unit margin (₹30 vs ₹55), the 125% volume expansion delivers ₹25 Lakhs more in bottom-line operating profit.'
      },
      {
        id: 'opt-premium',
        title: 'Strategy A: Premium Pricing at ₹90',
        description: 'Prioritize gross margin percentage (61% vs 46%).',
        impactSummary: 'High unit margin, but sacrifices ₹25 Lakhs in annual profit.',
        isBestChoice: false,
        scoreContribution: 20,
        feedback: 'A common mistake: focusing on margin percentage instead of absolute rupee contribution. Strategy B leaves ₹25L more cash in the bank.'
      }
    ],
    modelSolution: {
      cfoVerdict: 'EXECUTE STRATEGY B (PENETRATION). Generates ₹75 Lakhs EBIT versus ₹50 Lakhs under Strategy A.',
      strategicAnalysis: [
        'Strategy A: 2,00,000 * ₹55 = ₹1,10,00,000 contribution - ₹60,00,000 fixed = ₹50,00,000 EBIT.',
        'Strategy B: 4,50,000 * ₹30 = ₹1,35,00,000 contribution - ₹60,00,000 fixed = ₹75,00,000 EBIT.',
        'High sales velocity also creates economies of scale in future procurement.'
      ],
      lessonsLearned: [
        'Companies bank rupees, not percentages. Maximizing total rupee contribution is the true objective.'
      ]
    }
  },

  // --------------------------------------------------------------------------
  // CASE 6: Working Capital Management — Liquidity Crisis
  // --------------------------------------------------------------------------
  {
    id: 'case-6',
    slug: 'liquidity-crisis',
    title: 'Apex Consumer Goods: Resolving the Working Capital Squeeze',
    category: 'Working Capital Management',
    difficulty: 'intermediate',
    estimatedMinutes: 12,
    executiveSummary: 'Shorten Apex Consumer Goods cash conversion cycle from 85 days to release ₹3.5 Crore in trapped cash without emergency debt.',
    companyBackground: 'Apex Consumer Goods achieved 40% year-on-year sales growth to ₹36.5 Crore, but suppliers are threatening delivery stops due to overdue payments.',
    situation: 'Annual Sales: ₹36.5 Crore (₹10 Lakhs/day). Cost of Goods Sold: ₹25.55 Crore (₹7 Lakhs/day).\nDays Inventory Outstanding (DIO): 65 days.\nDays Sales Outstanding (DSO): 50 days.\nDays Payables Outstanding (DPO): 30 days.\nCash Conversion Cycle = 65 + 50 - 30 = 85 days.\nCash tied up in CCC = 85 days.',
    dataSheets: [
      {
        title: 'Operational Cycle Breakdown',
        items: [
          { label: 'Annual Revenue (Credit)', value: '₹36,50,00,000 (₹10,00,000 / day)' },
          { label: 'Annual Cost of Sales', value: '₹25,55,00,000 (₹7,00,000 / day)' },
          { label: 'DIO (Inventory Turnover in Days)', value: '65 Days' },
          { label: 'DSO (Debtor Collection Days)', value: '50 Days' },
          { label: 'DPO (Creditor Payment Days)', value: '30 Days' }
        ]
      }
    ],
    calculationChallenge: {
      label: 'Cash Released by Cutting DSO by 15 Days (from 50 to 35)',
      unit: '₹',
      expectedValue: 15000000,
      tolerancePct: 1,
      formula: 'Cash Released = Reduction in DSO * Daily Sales = 15 days * ₹10,00,000/day',
      hint: 'Daily credit sales = ₹36,50,00,000 / 365 days = ₹10,00,000.',
      stepSolution: 'Daily Sales = ₹36.5 Cr / 365 = ₹10,00,000/day.\n15-day DSO reduction releases 15 * ₹10,00,000 = ₹1,50,00,000 (₹1.5 Crore) directly into the checking account.'
    },
    decisionPrompt: 'What combined working capital intervention permanently resolves the liquidity squeeze without bank loans?',
    options: [
      {
        id: 'opt-rebalance-cycle',
        title: 'Enforce 35-day DSO + Negotiate 45-day DPO + Cut DIO to 50 days',
        description: 'Offer a 1.5% prompt-pay discount to cut DSO to 35 days, negotiate DPO to 45 days, and optimize inventory to 50 days.',
        impactSummary: 'Reduces CCC from 85 to 40 days, unlocking ₹3.55 Crore in liquid cash immediately.',
        isBestChoice: true,
        scoreContribution: 50,
        feedback: 'Brilliant corporate treasury execution. Shortening CCC from 85 to 40 days eliminates the entire cash squeeze without borrowing at 14% interest.'
      },
      {
        id: 'opt-borrow-od',
        title: 'Draw Down ₹4 Crore on Bank Overdraft at 13.5%',
        description: 'Fund working capital expansion with bank debt while leaving operations unchanged.',
        impactSummary: 'Adds ₹54 Lakhs in annual interest cost and increases insolvency risk.',
        isBestChoice: false,
        scoreContribution: 10,
        feedback: 'Treats the symptom, not the cause. The business will burn through the credit line as growth accelerates.'
      }
    ],
    modelSolution: {
      cfoVerdict: 'RESTRUCTURE WORKING CAPITAL CYCLE. Shortening CCC from 85 to 40 days unlocks ₹3.55 Crore in permanent liquidity.',
      strategicAnalysis: [
        'Receivables reduction: 15 days * ₹10L/day = ₹1,50,00,000 cash released.',
        'Inventory reduction: 15 days * ₹7L/day = ₹1,05,00,000 cash released.',
        'Payables extension: 15 days * ₹7L/day = ₹1,05,00,000 cash preserved.',
        'Total cash released = ₹3,60,00,000 without taking on ₹1 of debt.'
      ],
      lessonsLearned: [
        'Working capital efficiency directly substitutes for external bank financing.'
      ]
    }
  },

  // --------------------------------------------------------------------------
  // CASE 7: Budgeting & Forecasting — Quarterly Cash Budget
  // --------------------------------------------------------------------------
  {
    id: 'case-7',
    slug: 'quarterly-cash-budget',
    title: 'Solaria Solar: Q3 Cash Shortfall Forecasting',
    category: 'Budgeting & Forecasting',
    difficulty: 'advanced',
    estimatedMinutes: 15,
    executiveSummary: 'Identify an impending Month 2 cash deficit in a seasonal solar installation rollout and secure bridge credit before an operational default.',
    companyBackground: 'Solaria Solar installs commercial rooftop panels. Contracts have a 60-day milestone payment lag, but suppliers require cash within 15 days.',
    situation: 'Opening Cash (Month 1): ₹25,00,000.\nMonth 1: Collections ₹40,00,000 | Outflows ₹50,00,000 (Net: -₹10L).\nMonth 2: Collections ₹30,00,000 | Capex & Outflows ₹75,00,000 (Net: -₹45L).\nMonth 3: Collections ₹90,00,000 | Outflows ₹45,00,000 (Net: +₹45L).\nMinimum required cash buffer: ₹10,00,000.',
    dataSheets: [
      {
        title: 'Projected Monthly Inflows & Outflows',
        items: [
          { label: 'Month 1 Inflows / Outflows', value: 'In: ₹40L | Out: ₹50L (Closing: ₹15L)' },
          { label: 'Month 2 Inflows / Outflows', value: 'In: ₹30L | Out: ₹75L (Deficit projected)' },
          { label: 'Month 3 Inflows / Outflows', value: 'In: ₹90L | Out: ₹45L (Surplus projected)' }
        ]
      }
    ],
    calculationChallenge: {
      label: 'Closing Cash Balance at End of Month 2 (Before Financing)',
      unit: '₹',
      expectedValue: -3000000,
      tolerancePct: 1,
      formula: 'Closing M2 = Opening M1 (₹25L) + Net M1 (-₹10L) + Net M2 (-₹45L)',
      hint: 'Month 1 closes with ₹25L - ₹10L = ₹15L. Month 2 net cash flow is -₹45L.',
      stepSolution: 'Month 1 Closing Cash = ₹25,00,000 - ₹10,00,000 = ₹15,00,000.\nMonth 2 Cash Flow = ₹30,00,000 - ₹75,00,000 = -₹45,00,000.\nMonth 2 Closing Cash = ₹15,00,000 - ₹45,00,000 = -₹30,00,000 (₹30 Lakh Deficit).'
    },
    decisionPrompt: 'How should Solaria Solar finance this temporary Month 2 deficit of ₹30L (plus ₹10L liquidity buffer = ₹40L)?',
    options: [
      {
        id: 'opt-secure-bridge',
        title: 'Arrange a ₹40 Lakh Pre-Approved 60-Day Revolving Bridge Facility',
        description: 'Secure bank credit in Month 1 to cover the Month 2 trough, fully repaying it in Month 3 when ₹90L milestone collections arrive.',
        impactSummary: 'Maintains project schedule with negligible interest expense (~₹50,000).',
        isBestChoice: true,
        scoreContribution: 50,
        feedback: 'Proactive treasury forecasting. Arranging bridge finance when cash is positive secures low interest rates and avoids supplier panic.'
      },
      {
        id: 'opt-halt-installations',
        title: 'Halt Month 2 Installations until Month 1 Receivables Clear',
        description: 'Pause field operations to conserve cash.',
        impactSummary: 'Triggers customer milestone penalty clauses and destroys installation efficiency.',
        isBestChoice: false,
        scoreContribution: 10,
        feedback: 'Unacceptable operational stoppage. Stopping construction triggers breach-of-contract penalties.'
      }
    ],
    modelSolution: {
      cfoVerdict: 'PROACTIVELY SECURE ₹40L BRIDGE FINANCING. Month 2 experiences a ₹30L shortfall, fully reversed by Month 3 surplus.',
      strategicAnalysis: [
        'Month 1 closing: ₹15 Lakhs.',
        'Month 2 closing: -₹30 Lakhs (Total required with ₹10L buffer = ₹40 Lakhs).',
        'Month 3 closing after ₹90L inflows: +₹20 Lakhs net surplus after repaying facility.'
      ],
      lessonsLearned: [
        'Profitable businesses fail when timing mismatches between receivables and payables exhaust liquidity.'
      ]
    }
  },

  // --------------------------------------------------------------------------
  // CASE 8: Cash-Flow Management — Earnings Quality
  // --------------------------------------------------------------------------
  {
    id: 'case-8',
    slug: 'earnings-quality',
    title: 'Veritas Health: Investigating the Profit vs. Cash Divergence',
    category: 'Cash-Flow Management',
    difficulty: 'advanced',
    estimatedMinutes: 15,
    executiveSummary: 'Audit the alarming divergence between Veritas Health reporting ₹8 Crore Net Income while posting negative Operating Cash Flow.',
    companyBackground: 'Veritas Health distributes diagnostics hardware to private clinics. Market analysts cheered a 50% jump in Net Income to ₹8.2 Crore, but the treasury account balance dropped by ₹3.8 Crore.',
    situation: 'P&L shows Revenue ₹60 Crore, Net Income ₹8.2 Crore.\nCash Flow Statement reveals: Net Income ₹8.2 Cr, Depreciation +₹1.8 Cr, Increase in Accounts Receivable -₹11.5 Cr, Increase in Finished Inventory -₹3.2 Cr, Increase in Payables +₹0.9 Cr.\nOperating Cash Flow = ₹8.2 + ₹1.8 - ₹11.5 - ₹3.2 + ₹0.9 = -₹3.8 Crore.',
    dataSheets: [
      {
        title: 'Income Statement vs. Cash Flow Items',
        items: [
          { label: 'Reported Net Income', value: '₹8,20,00,000' },
          { label: 'Non-Cash Depreciation Add-back', value: '+₹1,80,00,000' },
          { label: 'Uncollected Accounts Receivable Surge', value: '-₹11,50,00,000' },
          { label: 'Inventory Buildup', value: '-₹3,20,00,000' },
          { label: 'Supplier Trade Credit Expansion', value: '+₹90,00,000' },
          { label: 'Actual Operating Cash Flow (CFO)', value: '-₹3,80,00,000' }
        ]
      }
    ],
    calculationChallenge: {
      label: 'Cash Flow to Net Income Conversion Ratio (CFO / Net Income)',
      unit: '%',
      expectedValue: -46.34,
      tolerancePct: 2,
      formula: 'Ratio = (Operating Cash Flow / Net Income) * 100',
      hint: '(-₹3.8 Cr / ₹8.2 Cr) * 100.',
      stepSolution: 'Conversion Ratio = -₹3,80,00,000 / ₹8,20,00,000 = -46.34%.\nA healthy company maintains a ratio >= +100%.'
    },
    decisionPrompt: 'What structural financial problem is this divergence signaling to the Board?',
    options: [
      {
        id: 'opt-channel-stuffing',
        title: 'Channel Stuffing & Aggressive Revenue Recognition',
        description: 'Sales teams are shipping unordered equipment and offering 120-day terms to inflate booked accounting revenues.',
        impactSummary: 'Reveals poor earnings quality, impending bad debt write-offs, and critical liquidity drain.',
        isBestChoice: true,
        scoreContribution: 50,
        feedback: 'Spot-on forensic analysis. When receivables surge far faster than revenues, sales are uncollected paper profits that mask real operational drag.'
      },
      {
        id: 'opt-healthy-growth',
        title: 'Standard Working Capital Investment during Rapid Growth',
        description: 'Dismiss the divergence as a natural temporary consequence of high growth.',
        impactSummary: 'Ignores systemic credit risk and accelerates cash insolvency.',
        isBestChoice: false,
        scoreContribution: 10,
        feedback: 'Fatal oversight. Negative operating cash flow alongside peak accounting profit is the classic precursor to corporate restructuring.'
      }
    ],
    modelSolution: {
      cfoVerdict: 'IMMEDIATELY REVISE CREDIT POLICIES. Earnings quality is compromised by ₹11.5 Cr in uncollected receivables.',
      strategicAnalysis: [
        'Revenue grew by 20%, but Receivables grew by 95%, indicating sales are being recognized before customers actually accept or pay.',
        'Operating Cash Flow (-₹3.8 Cr) is the true indicator of solvency; paper profit cannot pay suppliers or payroll.'
      ],
      lessonsLearned: [
        'Revenue is vanity, profit is sanity, but cash is reality.'
      ]
    }
  },

  // --------------------------------------------------------------------------
  // CASE 9: Risk & Return — Hurdle Rates & CAPM
  // --------------------------------------------------------------------------
  {
    id: 'case-9',
    slug: 'hurdle-rate-capm',
    title: 'OmniCorp: Divisional WACC & Hurdle Rate Misallocation',
    category: 'Risk and Return Analysis',
    difficulty: 'advanced',
    estimatedMinutes: 12,
    executiveSummary: 'Stop OmniCorp from using a single 12% company-wide hurdle rate that starves low-risk utilities while overfunding risky tech bets.',
    companyBackground: 'OmniCorp is a conglomerate operating two divisions: Traditional Water Utilities (Beta 0.65) and Quantum Cyber AI (Beta 1.60).',
    situation: 'Corporate HQ uses a single corporate WACC of 12.0% for all proposals. Water Utilities submitted a project yielding 10.5% (rejected). Cyber AI submitted a project yielding 13.5% (approved).\nMarket parameters: Rf = 6.0%, Rm - Rf = 6.0%, Debt is negligible.',
    dataSheets: [
      {
        title: 'CAPM Divisional Parameters',
        items: [
          { label: 'Risk-Free Rate (Rf)', value: '6.0%' },
          { label: 'Equity Market Risk Premium (Rm - Rf)', value: '6.0%' },
          { label: 'Division A: Water Utilities Beta', value: '0.65' },
          { label: 'Division B: Cyber AI Beta', value: '1.60' },
          { label: 'Current Blended Corporate Hurdle Rate', value: '12.0%' }
        ]
      }
    ],
    calculationChallenge: {
      label: 'True CAPM Hurdle Rate for Water Utilities (Div A)',
      unit: '%',
      expectedValue: 9.9,
      tolerancePct: 1,
      formula: 'Ke = Rf + Beta * (Rm - Rf) = 6.0% + 0.65 * 6.0%',
      hint: '6.0% + (0.65 * 6.0%) = 6.0% + 3.9%.',
      stepSolution: 'Water Utilities Hurdle = 6.0% + 0.65 * 6.0% = 9.90%.\nCyber AI Hurdle = 6.0% + 1.60 * 6.0% = 15.60%.'
    },
    decisionPrompt: 'Why is using a single 12.0% corporate hurdle rate actively destroying shareholder value for OmniCorp?',
    options: [
      {
        id: 'opt-two-tier-hurdle',
        title: 'It rejects safe value-adding utility projects (10.5% > 9.9%) and approves value-destroying tech projects (13.5% < 15.6%)',
        description: 'Establish division-specific hurdle rates: 9.9% for Utilities and 15.6% for Cyber AI.',
        impactSummary: 'Eliminates systemic risk cross-subsidization and aligns project returns with risk.',
        isBestChoice: true,
        scoreContribution: 50,
        feedback: 'Mastery of financial risk theory. The single 12% rate rejected an accretive project (10.5% return vs 9.9% cost) and accepted an uncompensated risky project (13.5% return vs 15.6% cost).'
      },
      {
        id: 'opt-keep-single',
        title: 'Maintain the single 12% rate for administrative simplicity',
        description: 'Keep one rate to avoid inter-divisional friction.',
        impactSummary: 'Slowly concentrates the conglomerate in unprofitable high-risk ventures.',
        isBestChoice: false,
        scoreContribution: 10,
        feedback: 'Disastrous corporate policy. Causes the firm to over-invest in high-risk projects that fail to earn their true cost of capital.'
      }
    ],
    modelSolution: {
      cfoVerdict: 'MANDATE DIVISIONAL WACCs. Water Utilities hurdle is 9.9%; Cyber AI hurdle is 15.6%.',
      strategicAnalysis: [
        'Water Project: Return 10.5% > Cost of Capital 9.9%. Value added: +0.60%.',
        'Cyber Project: Return 13.5% < Cost of Capital 15.6%. Value destroyed: -2.10%.',
        'A single hurdle rate subsidizes high-beta ventures at the expense of defensive cash generators.'
      ],
      lessonsLearned: [
        'Discount rates must reflect the specific risk of the project or division, never the parent company blended average.'
      ]
    }
  },

  // --------------------------------------------------------------------------
  // CASE 10: Financial Performance — DuPont Decomposition
  // --------------------------------------------------------------------------
  {
    id: 'case-10',
    slug: 'dupont-turnaround',
    title: 'Meridian vs. Vantage: Unmasking the ROE Drivers',
    category: 'Financial Performance Analysis',
    difficulty: 'intermediate',
    estimatedMinutes: 12,
    executiveSummary: 'Deconstruct Return on Equity for two rival healthcare firms to expose whether high returns stem from operational superiority or dangerous debt leverage.',
    companyBackground: 'Meridian Pharma and Vantage Labs both report an identical 24.0% Return on Equity (ROE). Investors treat them as identical peers.',
    situation: 'Meridian Pharma: Net Margin 12.0%, Asset Turnover 1.0x, Equity Multiplier 2.0x (ROE = 12% * 1.0 * 2.0 = 24.0%).\nVantage Labs: Net Margin 4.0%, Asset Turnover 1.2x, Equity Multiplier 5.0x (ROE = 4% * 1.2 * 5.0 = 24.0%).',
    dataSheets: [
      {
        title: 'DuPont Breakdown Comparison',
        items: [
          { label: 'Meridian Net Profit Margin', value: '12.0%' },
          { label: 'Meridian Asset Turnover', value: '1.0x' },
          { label: 'Meridian Equity Multiplier (Assets/Equity)', value: '2.0x (50% Debt Ratio)' },
          { label: 'Vantage Net Profit Margin', value: '4.0%' },
          { label: 'Vantage Asset Turnover', value: '1.2x' },
          { label: 'Vantage Equity Multiplier (Assets/Equity)', value: '5.0x (80% Debt Ratio)' }
        ]
      }
    ],
    calculationChallenge: {
      label: 'Return on Assets (ROA) of Meridian Pharma',
      unit: '%',
      expectedValue: 12,
      tolerancePct: 1,
      formula: 'ROA = Net Margin * Asset Turnover = 12.0% * 1.0',
      hint: 'Multiply Net Margin by Asset Turnover.',
      stepSolution: 'Meridian ROA = 12.0% * 1.0x = 12.0%.\nVantage ROA = 4.0% * 1.2x = 4.8%.'
    },
    decisionPrompt: 'As Chief Investment Officer, which company represents a higher quality, resilient long-term investment?',
    options: [
      {
        id: 'opt-invest-meridian',
        title: 'Invest in Meridian Pharma (Organic Pricing Power)',
        description: 'Meridian generates high ROE through strong net margins (12%) and conservative debt (2.0x leverage), whereas Vantage relies on extreme 5.0x leverage to mask weak 4% margins.',
        impactSummary: 'Superior defensibility during industry downturns; minimal bankruptcy exposure.',
        isBestChoice: true,
        scoreContribution: 50,
        feedback: 'Flawless DuPont diagnosis. Vantage is a financial house of cards: its 24% ROE is manufactured via 80% debt leverage on weak 4% profit margins.'
      },
      {
        id: 'opt-invest-vantage',
        title: 'Invest in Vantage Labs due to superior Asset Turnover (1.2x)',
        description: 'Vantage sweats its assets 20% faster than Meridian.',
        impactSummary: 'Ignores solvency risk from 5.0x leverage.',
        isBestChoice: false,
        scoreContribution: 15,
        feedback: 'Dangerous myopia. A modest asset turnover advantage does not compensate for 5x leverage and razor-thin margins.'
      }
    ],
    modelSolution: {
      cfoVerdict: 'MERIDIAN PHARMA IS VASTLY SUPERIOR. 12% ROA vs Vantage 4.8% ROA proves structural operating dominance.',
      strategicAnalysis: [
        'If operating margins drop by 3% across the sector:',
        'Meridian margin drops from 12% to 9% -> ROE remains healthy at 18%.',
        'Vantage margin drops from 4% to 1% -> ROE collapses from 24% to 6%, triggering debt covenant defaults.'
      ],
      lessonsLearned: [
        'Never look at ROE in isolation. DuPont decomposition reveals whether returns come from pricing power, asset productivity, or financial debt risk.'
      ]
    }
  },
  {
    id: 'case-11',
    slug: 'northline-cost',
    title: 'Northline Components: Idle-Capacity Cost',
    category: 'Cost Management',
    difficulty: 'intermediate',
    estimatedMinutes: 18,
    executiveSummary: 'A plant with spare capacity must decide whether a one-off export order priced below full cost still covers relevant cost.',
    companyBackground: 'Northline Components machines brackets for domestic OEMs. One line is running at 70% of practical capacity. Depreciation and factory rent will continue whether the export order is accepted.',
    situation: 'An overseas buyer wants 4,000 brackets at ₹420 each. Full absorption cost is ₹460. Direct material is ₹180, direct labour ₹90, variable overhead ₹70. Avoidable packing for the export run is ₹40,000. No extra fixed cost is incurred and no regular customer is displaced.',
    dataSheets: [
      {
        title: 'Unit Cost Build-Up',
        items: [
          { label: 'Direct material', value: '180', unit: '₹' },
          { label: 'Direct labour', value: '90', unit: '₹' },
          { label: 'Variable overhead', value: '70', unit: '₹' },
          { label: 'Allocated fixed overhead', value: '120', unit: '₹' },
          { label: 'Export packing (total)', value: '40000', unit: '₹' },
          { label: 'Order size', value: '4000', unit: 'units' },
          { label: 'Offer price', value: '420', unit: '₹' }
        ]
      }
    ],
    calculationChallenge: {
      label: 'Relevant cost per unit for the export order',
      unit: '₹',
      expectedValue: 350,
      tolerancePct: 1,
      formula: 'Relevant unit cost = DM + DL + VOH + packing / units',
      hint: 'Drop allocated fixed overhead. Spread the ₹40,000 packing cost over 4,000 units.',
      stepSolution: 'Variable cost = 180 + 90 + 70 = ₹340. Packing = 40,000 / 4,000 = ₹10. Relevant cost = ₹350. Offer price ₹420 exceeds relevant cost by ₹70.'
    },
    decisionPrompt: 'Should Northline accept the export order?',
    options: [
      {
        id: 'opt-accept-relevant',
        title: 'Accept: price covers relevant cost and spare capacity',
        description: 'Allocated rent and depreciation do not change. The order contributes ₹70 per unit after packing.',
        impactSummary: 'Incremental profit of ₹2,80,000.',
        isBestChoice: true,
        scoreContribution: 50,
        feedback: 'Correct. Full cost of ₹460 includes unavoidable overhead. On relevant cost the order is profitable.'
      },
      {
        id: 'opt-reject-full',
        title: 'Reject because ₹420 is below the ₹460 full cost',
        description: 'Any price under absorption cost reduces reported profit.',
        impactSummary: 'Leaves the line idle and forgoes contribution.',
        isBestChoice: false,
        scoreContribution: 10,
        feedback: 'Full cost is the wrong test when capacity is idle and fixed overhead continues.'
      },
      {
        id: 'opt-raise-price',
        title: 'Accept only if the buyer pays ₹460',
        description: 'Hold out for full cost even though the buyer will walk away.',
        impactSummary: 'Likely lost order and zero contribution.',
        isBestChoice: false,
        scoreContribution: 15,
        feedback: 'A higher price would be welcome, but refusing ₹420 when relevant cost is ₹350 destroys value.'
      }
    ],
    modelSolution: {
      cfoVerdict: 'ACCEPT THE ORDER. Relevant cost is ₹350 against a ₹420 price.',
      strategicAnalysis: [
        'Contribution after packing = (420 − 350) × 4,000 = ₹2,80,000.',
        'Check that the order does not set a permanent price expectation with domestic OEMs.',
        'If accepting the order would displace regular sales, the opportunity cost of lost contribution must be added back.'
      ],
      lessonsLearned: [
        'Idle-capacity pricing uses relevant cost, not fully absorbed unit cost.',
        'Allocated fixed costs that do not change are irrelevant.'
      ]
    }
  },
  {
    id: 'case-12',
    slug: 'harbor-margin',
    title: 'Harbor Foods: Margin versus Volume',
    category: 'Profitability Analysis',
    difficulty: 'intermediate',
    estimatedMinutes: 16,
    executiveSummary: 'A packaged-foods brand can cut price to gain volume or hold price and protect margin. Fixed costs do not change in the relevant range.',
    companyBackground: 'Harbor Foods sells a ready-meal at ₹200. Variable cost is ₹120. Annual fixed costs are ₹48,00,000. Current volume is 90,000 units.',
    situation: 'Marketing proposes a price of ₹180, expected to lift volume to 1,30,000 units. The plant can handle that volume without extra fixed cost. Management wants the option with the higher operating profit.',
    dataSheets: [
      {
        title: 'Price Scenarios',
        items: [
          { label: 'Current price', value: '200', unit: '₹' },
          { label: 'Proposed price', value: '180', unit: '₹' },
          { label: 'Variable cost', value: '120', unit: '₹' },
          { label: 'Fixed costs', value: '4800000', unit: '₹' },
          { label: 'Current volume', value: '90000', unit: 'units' },
          { label: 'Expected volume at ₹180', value: '130000', unit: 'units' }
        ]
      }
    ],
    calculationChallenge: {
      label: 'Operating profit at the proposed ₹180 price',
      unit: '₹',
      expectedValue: 3000000,
      tolerancePct: 1,
      formula: 'Profit = (Price − Variable cost) × Volume − Fixed costs',
      hint: 'Contribution at ₹180 is ₹60. Multiply by 1,30,000 and subtract ₹48,00,000.',
      stepSolution: 'Current profit = (80 × 90,000) − 48,00,000 = ₹24,00,000. Proposed profit = (60 × 1,30,000) − 48,00,000 = ₹30,00,000.'
    },
    decisionPrompt: 'Which pricing plan should Harbor adopt for the coming year?',
    options: [
      {
        id: 'opt-cut-price',
        title: 'Cut price to ₹180 and take the volume',
        description: 'Operating profit rises from ₹24 lakh to ₹30 lakh even though unit margin falls.',
        impactSummary: 'Higher total contribution despite a thinner unit margin.',
        isBestChoice: true,
        scoreContribution: 50,
        feedback: 'Correct. Profit is contribution minus fixed cost. The volume gain more than offsets the ₹20 cut in unit contribution.'
      },
      {
        id: 'opt-hold-price',
        title: 'Hold ₹200 because the unit margin is higher',
        description: '₹80 contribution looks safer than ₹60.',
        impactSummary: 'Leaves ₹6 lakh of profit on the table.',
        isBestChoice: false,
        scoreContribution: 15,
        feedback: 'Unit margin is not the objective. Total operating profit is higher at the lower price.'
      }
    ],
    modelSolution: {
      cfoVerdict: 'ADOPT ₹180. Expected operating profit is ₹30,00,000 versus ₹24,00,000.',
      strategicAnalysis: [
        'Confirm the 1,30,000 unit forecast before locking a price that is hard to raise later.',
        'Watch whether the discount trains customers to wait for promotions.',
        'Fixed costs are unchanged, so the decision turns only on total contribution.'
      ],
      lessonsLearned: [
        'A lower margin can still be the more profitable plan when volume rises enough.',
        'Compare total profit, not contribution per unit in isolation.'
      ]
    }
  }
];
