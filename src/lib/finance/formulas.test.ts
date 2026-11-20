import { describe, expect, it } from 'vitest';
import {
  annuityDueFV,
  annuityDuePV,
  breakEvenUnits,
  cagr,
  cashConversionCycle,
  cashRatio,
  compoundInterest,
  contributionMarginRatio,
  costOfEquityCAPM,
  currentRatio,
  debtRatio,
  debtToEquity,
  degreeOfCombinedLeverage,
  degreeOfFinancialLeverage,
  degreeOfOperatingLeverage,
  discountedPayback,
  effectiveAnnualRate,
  emi,
  futureValue,
  grossMargin,
  inventoryTurnover,
  irr,
  makeOrBuy,
  marginOfSafetyRatio,
  netMargin,
  npv,
  operatingCycle,
  operatingMargin,
  ordinaryAnnuityFV,
  ordinaryAnnuityPV,
  payablesTurnover,
  paybackPeriod,
  presentValue,
  quickRatio,
  receivablesTurnover,
  roa,
  roe,
  simpleInterest,
  targetProfitUnits,
  wacc,
  workingCapital,
} from './formulas';

describe('time value of money', () => {
  it('discounts a future sum', () => {
    expect(presentValue(13310, 0.1, 3)).toBeCloseTo(10000, 2);
  });

  it('compounds a present sum', () => {
    expect(futureValue(10000, 0.1, 3)).toBeCloseTo(13310, 2);
  });

  it('computes simple interest', () => {
    expect(simpleInterest(10000, 0.1, 3)).toBeCloseTo(3000, 6);
  });

  it('computes compound interest with monthly compounding', () => {
    expect(compoundInterest(100000, 0.12, 1, 12)).toBeCloseTo(12682.5, 0);
  });

  it('computes effective annual rate', () => {
    expect(effectiveAnnualRate(0.12, 12)).toBeCloseTo(0.126825, 5);
  });

  it('values an ordinary annuity', () => {
    expect(ordinaryAnnuityPV(10000, 0.1, 3)).toBeCloseTo(24868.52, 1);
    expect(ordinaryAnnuityFV(10000, 0.1, 3)).toBeCloseTo(33100, 1);
  });

  it('values an annuity due one period higher than ordinary', () => {
    expect(annuityDuePV(10000, 0.1, 3)).toBeCloseTo(ordinaryAnnuityPV(10000, 0.1, 3) * 1.1, 2);
    expect(annuityDueFV(10000, 0.1, 3)).toBeCloseTo(ordinaryAnnuityFV(10000, 0.1, 3) * 1.1, 2);
  });

  it('computes CAGR', () => {
    expect(cagr(100000, 161051, 5)).toBeCloseTo(0.1, 3);
  });
});

describe('investment analysis', () => {
  const flows = [-100000, 60000, 60000];

  it('computes NPV', () => {
    expect(npv(0.1, flows)).toBeCloseTo(4132.23, 0);
  });

  it('finds IRR near the zero-NPV rate', () => {
    const rate = irr(flows);
    expect(rate).not.toBeNull();
    expect(npv(rate!, flows)).toBeCloseTo(0, 0);
    expect(rate!).toBeGreaterThan(0.13);
    expect(rate!).toBeLessThan(0.14);
  });

  it('interpolates payback and discounted payback', () => {
    expect(paybackPeriod([-100, 40, 40, 40])).toBeCloseTo(2.5, 5);
    const discounted = discountedPayback(0.1, [-100, 60, 60]);
    expect(discounted).not.toBeNull();
    expect(discounted!).toBeGreaterThan(1.8);
    expect(discounted!).toBeLessThan(2);
  });
});

describe('loans and corporate finance', () => {
  it('computes EMI', () => {
    expect(emi(100000, 0.12, 12)).toBeCloseTo(8884.88, 1);
  });

  it('computes CAPM and WACC', () => {
    expect(costOfEquityCAPM(0.06, 1.25, 0.14)).toBeCloseTo(0.16, 6);
    expect(wacc(60, 40, 0.15, 0.1, 0.3)).toBeCloseTo(0.118, 6);
  });

  it('computes operating, financial, and combined leverage', () => {
    expect(degreeOfOperatingLeverage(200, 80)).toBeCloseTo(2.5, 6);
    expect(degreeOfFinancialLeverage(80, 20)).toBeCloseTo(80 / 60, 6);
    expect(degreeOfCombinedLeverage(200, 80, 20)).toBeCloseTo(2.5 * (80 / 60), 6);
  });
});

describe('ratios and cost accounting', () => {
  it('computes liquidity and leverage ratios', () => {
    expect(currentRatio(450, 200)).toBeCloseTo(2.25, 6);
    expect(quickRatio(450, 150, 200)).toBeCloseTo(1.5, 6);
    expect(cashRatio(90, 200)).toBeCloseTo(0.45, 6);
    expect(debtToEquity(40, 60)).toBeCloseTo(2 / 3, 6);
    expect(debtRatio(40, 100)).toBeCloseTo(0.4, 6);
    expect(workingCapital(450, 200)).toBe(250);
  });

  it('computes margins, returns, and turnovers', () => {
    expect(grossMargin(100, 60)).toBeCloseTo(0.4, 6);
    expect(operatingMargin(20, 100)).toBeCloseTo(0.2, 6);
    expect(netMargin(12, 100)).toBeCloseTo(0.12, 6);
    expect(roa(12, 100)).toBeCloseTo(0.12, 6);
    expect(roe(12, 50)).toBeCloseTo(0.24, 6);
    expect(inventoryTurnover(600, 100)).toBeCloseTo(6, 6);
    expect(receivablesTurnover(365, 50)).toBeCloseTo(7.3, 6);
    expect(payablesTurnover(240, 40)).toBeCloseTo(6, 6);
  });

  it('computes operating cycle and cash conversion cycle', () => {
    expect(operatingCycle(55, 42)).toBe(97);
    expect(cashConversionCycle(55, 42, 30)).toBe(67);
  });

  it('computes break-even, margin of safety, and target profit', () => {
    expect(breakEvenUnits(300000, 150, 90)).toBeCloseTo(5000, 6);
    expect(contributionMarginRatio(150, 90)).toBeCloseTo(0.4, 6);
    expect(marginOfSafetyRatio(7000 * 150, 5000 * 150)).toBeCloseTo(2 / 7, 6);
    expect(targetProfitUnits(300000, 120000, 150, 90)).toBeCloseTo(7000, 6);
  });

  it('compares make and buy on relevant cost', () => {
    const result = makeOrBuy({
      units: 1000,
      directMaterial: 200,
      directLabor: 150,
      variableOverhead: 80,
      avoidableFixed: 50000,
      opportunityCost: 20000,
      purchasePrice: 520,
    });
    expect(result.makeTotal).toBe(200 * 1000 + 150 * 1000 + 80 * 1000 + 50000 + 20000);
    expect(result.buyTotal).toBe(520000);
    expect(result.advantage).toBe('make');
  });
});
