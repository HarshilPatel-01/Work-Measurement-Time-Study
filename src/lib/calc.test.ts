import { describe, it, expect } from 'vitest';
import {
  avgObservedTime,
  standardDeviation,
  coefficientOfVariation,
  confidenceInterval,
  requiredObservations,
  normalTime,
  standardTime,
  outputPerHour,
  efficiencyPercent,
  productivityPercent,
  calculatePFD,
  detectOutliers,
  calculateElementResult,
  lineBalanceLCR,
  calculateImprovement,
  westinghouseRating,
  calculatePareto,
} from './calc';

const TEXTBOOK_TIMES = [8.5, 9.0, 8.8, 9.2, 8.6, 9.1, 8.7, 8.9, 9.0, 8.4]; // Barnes Ch. 16

describe('Industrial Engineering Work Measurement Formulas', () => {
  // 1. Observed time = Average of cycle times
  it('1. avgObservedTime calculates correct arithmetic mean', () => {
    const avg = avgObservedTime(TEXTBOOK_TIMES);
    expect(avg).toBeCloseTo(8.82, 2);
    expect(avgObservedTime([])).toBe(0);
  });

  it('standardDeviation calculates correct sample standard deviation', () => {
    const sd = standardDeviation(TEXTBOOK_TIMES);
    expect(sd).toBeCloseTo(0.2658, 2);
    expect(standardDeviation([5])).toBe(0);
  });

  // 2. Normal time = Observed time * (rating factor / 100)
  it('2. normalTime applies rating factor correctly', () => {
    expect(normalTime(10, 100)).toBe(10);
    expect(normalTime(10, 115)).toBe(11.5);
    expect(normalTime(10, 90)).toBe(9.0);
    expect(normalTime(0, 100)).toBe(0);
  });

  // 3. Standard time = Normal time * (1 + allowance %)
  it('3. standardTime applies additive allowance factor correctly', () => {
    const nt = 10;
    const allowance = 12; // 12%
    expect(standardTime(nt, allowance)).toBeCloseTo(11.2, 2);
    expect(standardTime(nt, 0)).toBe(10);
  });

  // 4. Output per hour = 3600 / standard time (in seconds)
  it('4. outputPerHour converts cycle time to units per hour', () => {
    expect(outputPerHour(36)).toBeCloseTo(100, 1);
    expect(outputPerHour(60)).toBeCloseTo(60, 1);
    expect(outputPerHour(12)).toBeCloseTo(300, 1);
    expect(outputPerHour(0)).toBe(0);
  });

  // 5. Efficiency % = (standard time / actual time) * 100
  it('5. efficiencyPercent calculates operator and line efficiency %', () => {
    expect(efficiencyPercent(50, 50)).toBe(100);
    expect(efficiencyPercent(50, 40)).toBe(125); // Faster than standard
    expect(efficiencyPercent(50, 62.5)).toBe(80); // Slower than standard
    expect(efficiencyPercent(0, 50)).toBe(0);
  });

  // 6. Sample size check (cycles needed for 95% confidence, +/- 5%)
  it("6. requiredObservations calculates ILO Barnes N' sample size", () => {
    const nReq = requiredObservations(TEXTBOOK_TIMES);
    expect(nReq).toBeGreaterThan(0);
    expect(nReq).toBeLessThanOrEqual(50);
    expect(requiredObservations([5, 5, 5, 5])).toBe(4);
    expect(requiredObservations([])).toBe(0);
  });

  // 7. Productivity % = (output / input) * 100
  it('7. productivityPercent calculates throughput ratio correctly', () => {
    expect(productivityPercent(100, 100)).toBe(100);
    expect(productivityPercent(150, 100)).toBe(150);
    expect(productivityPercent(80, 100)).toBe(80);
    expect(productivityPercent(100, 0)).toBe(0);
  });

  // 8. PFD Allowance breakdown
  it('8. calculatePFD sums personal, fatigue, and delay allowances', () => {
    expect(calculatePFD(5, 4, 1, 0)).toBe(10);
    expect(calculatePFD(5, 6, 2, 1)).toBe(14);
  });

  // 9. Method improvement Before vs After
  it('9. calculateImprovement determines time saved and % gains', () => {
    const beforeST = 65.0;
    const afterST = 42.0;
    const result = calculateImprovement(beforeST, afterST);

    expect(result.timeSavedSeconds).toBe(23.0);
    expect(result.improvementPercent).toBeCloseTo(35.38, 1);
    expect(result.afterOutputPerHour).toBeGreaterThan(result.beforeOutputPerHour);
  });

  // 10. Westinghouse rating
  it('10. westinghouseRating converts factors to percentage', () => {
    expect(westinghouseRating(0, 0, 0, 0)).toBe(100);
    expect(westinghouseRating(0.06, 0.05, 0.02, 0.01)).toBe(114);
  });

  // 11. Pareto analysis
  it('11. calculatePareto identifies vital few pen assembly elements', () => {
    const elements = [
      { id: '1', name: 'Inspection', standardTime: 10 },
      { id: '2', name: 'Plunger insertion', standardTime: 8 },
      { id: '3', name: 'Nose cone', standardTime: 7 },
      { id: '4', name: 'Spring', standardTime: 3 },
      { id: '5', name: 'Pick barrel', standardTime: 2 },
    ];
    const pareto = calculatePareto(elements);
    expect(pareto[0].name).toBe('Inspection');
    expect(pareto[0].percentage).toBeGreaterThan(30);
    expect(pareto[pareto.length - 1].cumulativePercentage).toBe(100);
  });

  // 12. Line Balancing LCR
  it('12. lineBalanceLCR assigns elements to minimize idle time', () => {
    const elements = [
      { id: 'e1', standardTime: 10 },
      { id: 'e2', standardTime: 8 },
      { id: 'e3', standardTime: 6 },
      { id: 'e4', standardTime: 9 },
      { id: 'e5', standardTime: 7 },
    ];
    const result = lineBalanceLCR(elements, 15);
    expect(result.stations.length).toBeGreaterThanOrEqual(3);
    expect(result.balanceEfficiency).toBeGreaterThan(60);
    expect(result.balanceEfficiency).toBeLessThanOrEqual(100);
  });

  // 13. Statistical validation & outlier detection
  it('13. coefficientOfVariation, confidenceInterval, and detectOutliers operate accurately', () => {
    const cv = coefficientOfVariation(TEXTBOOK_TIMES);
    expect(cv).toBeGreaterThan(0);
    expect(cv).toBeLessThan(10);

    const [ciLow, ciHigh] = confidenceInterval(TEXTBOOK_TIMES);
    const mean = avgObservedTime(TEXTBOOK_TIMES);
    expect(ciLow).toBeLessThan(mean);
    expect(ciHigh).toBeGreaterThan(mean);

    const outliers = detectOutliers([8.5, 8.8, 8.9, 9.1, 99.0]);
    expect(outliers[4]).toBe(true);
    expect(outliers[0]).toBe(false);
  });

  // 14. calculateElementResult end-to-end
  it('14. calculateElementResult generates full standard element statistics', () => {
    const allowance = { personal: 5, fatigue: 4, delay: 1, special: 0 };
    const result = calculateElementResult('el-1', TEXTBOOK_TIMES, 110, allowance);
    expect(result.avgObservedTime).toBeCloseTo(8.79, 1);
    expect(result.normalTime).toBeCloseTo(8.79 * 1.1, 1);
    expect(result.standardTime).toBeCloseTo(8.79 * 1.1 * 1.1, 1);
    expect(result.requiredObservations).toBeGreaterThanOrEqual(1);
  });
});
