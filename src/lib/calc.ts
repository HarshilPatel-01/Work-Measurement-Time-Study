/**
 * Core Time Study and Work Measurement Calculation Library
 * Designed for Industrial Engineering: Pen Assembly Productivity Improvement
 * References: ILO Introduction to Work Study (4th Ed.), Barnes Motion and Time Study (7th Ed.)
 */

export interface ObservationData {
  elementId: string;
  times: number[];
}

export interface RatingData {
  elementId: string;
  ratingPercent: number; // e.g. 100 = 100% normal pace
}

export interface AllowanceData {
  personal: number; // e.g. 5%
  fatigue: number;  // e.g. 4%
  delay: number;    // e.g. 1%
  special: number;  // e.g. 0%
  formula?: 'ADDITIVE' | 'MULTIPLICATIVE';
}

export interface ElementResult {
  elementId: string;
  n: number;
  sumX: number;
  sumXSquared: number;
  avgObservedTime: number; // OT
  stdDeviation: number;
  variance: number;
  coefficientOfVariation: number;
  confidenceIntervalLow: number;
  confidenceIntervalHigh: number;
  ratingPercent: number;
  normalTime: number;      // NT
  allowancePercent: number;
  standardTime: number;    // ST
  requiredObservations: number; // N'
  isSufficient: boolean;
  efficiencyPercent: number;
  outlierIndices: number[];
  isOutlier: boolean[];
}

export interface LineBalanceResult {
  taktTime: number;
  numWorkstations: number;
  balanceEfficiency: number;
  balanceDelay: number;
  stations: {
    stationId: number;
    elements: string[];
    totalTime: number;
    idleTime: number;
  }[];
}

export interface ImprovementResult {
  beforeStandardTime: number;
  afterStandardTime: number;
  timeSavedSeconds: number;
  improvementPercent: number;
  beforeOutputPerHour: number;
  afterOutputPerHour: number;
  additionalOutputPerHour: number;
  additionalOutputPercent: number;
  efficiencyGainPercent: number;
}

/**
 * 1. Observed time = Average of cycle times = Sum(X) / N
 */
export function avgObservedTime(times: number[]): number {
  if (!times || times.length === 0) return 0;
  const sum = times.reduce((a, b) => a + b, 0);
  return sum / times.length;
}

/**
 * Sample standard deviation s = sqrt( Sum((X - mean)^2) / (N - 1) )
 */
export function standardDeviation(times: number[]): number {
  if (!times || times.length < 2) return 0;
  const mean = avgObservedTime(times);
  const sumSquares = times.reduce((acc, t) => acc + Math.pow(t - mean, 2), 0);
  return Math.sqrt(sumSquares / (times.length - 1));
}

/**
 * Coefficient of Variation CV = (s / mean) * 100
 */
export function coefficientOfVariation(times: number[]): number {
  const avg = avgObservedTime(times);
  if (avg <= 0) return 0;
  return (standardDeviation(times) / avg) * 100;
}

/**
 * 95% Confidence Interval for Mean (z = 1.96)
 */
export function confidenceInterval(times: number[]): [number, number] {
  const avg = avgObservedTime(times);
  const n = times.length;
  if (n === 0) return [0, 0];
  const se = standardDeviation(times) / Math.sqrt(n);
  const z = 1.96;
  return [Math.max(0, avg - z * se), avg + z * se];
}

/**
 * 2. Normal Time = Observed Time * (Rating Factor / 100)
 */
export function normalTime(observedTime: number, ratingPercent: number): number {
  if (observedTime <= 0 || ratingPercent <= 0) return 0;
  return observedTime * (ratingPercent / 100);
}

/**
 * 3. Standard Time = Normal Time * (1 + Allowance % / 100) [Additive formula]
 */
export function standardTime(
  normalTimeVal: number,
  allowancePercent: number,
  formula: 'ADDITIVE' | 'MULTIPLICATIVE' = 'ADDITIVE'
): number {
  if (normalTimeVal <= 0) return 0;
  if (formula === 'MULTIPLICATIVE') {
    const denom = 1 - allowancePercent / 100;
    return denom > 0 ? normalTimeVal / denom : normalTimeVal;
  }
  return normalTimeVal * (1 + Math.max(0, allowancePercent) / 100);
}

/**
 * 4. Output Per Hour = 3600 / Standard Time (in seconds)
 */
export function outputPerHour(stdTimeSeconds: number): number {
  if (stdTimeSeconds <= 0) return 0;
  return 3600 / stdTimeSeconds;
}

/**
 * 5. Efficiency % = (Standard Time / Actual Time) * 100
 */
export function efficiencyPercent(standardTimeSec: number, actualTimeSec: number): number {
  if (actualTimeSec <= 0 || standardTimeSec <= 0) return 0;
  return (standardTimeSec / actualTimeSec) * 100;
}

/**
 * 6. Sample size check (cycles needed for 95% confidence, +/- 5% precision)
 * ILO / Barnes Formula: N' = [ (40 * sqrt(N*Sum(X^2) - (Sum(X))^2)) / Sum(X) ]^2
 */
export function requiredObservations(times: number[]): number {
  const n = times.length;
  if (n === 0) return 0;
  const sumX = times.reduce((a, b) => a + b, 0);
  const sumXSq = times.reduce((a, b) => a + b * b, 0);

  const discriminant = n * sumXSq - sumX * sumX;
  if (discriminant <= 0 || sumX === 0) return n;

  const nPrime = Math.pow((40 * Math.sqrt(discriminant)) / sumX, 2);
  return Math.max(1, Math.ceil(nPrime));
}

/**
 * 7. Productivity % = (Output / Input) * 100
 */
export function productivityPercent(output: number, input: number): number {
  if (input <= 0) return 0;
  return (output / input) * 100;
}

/**
 * Detect outliers using Tukey's IQR Method (1.5 * IQR)
 */
export function detectOutliers(times: number[]): boolean[] {
  if (times.length < 4) return times.map(() => false);
  const sorted = [...times].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;
  return times.map(t => t < lower || t > upper);
}

/**
 * Westinghouse Performance Rating
 * Base 1.0 (100%) + Skill + Effort + Conditions + Consistency
 */
export function westinghouseRating(
  skill = 0.0,
  effort = 0.0,
  conditions = 0.0,
  consistency = 0.0
): number {
  return Math.round((1 + skill + effort + conditions + consistency) * 100);
}

/**
 * Compute total PFD allowance sum
 */
export function calculatePFD(personal = 5, fatigue = 4, delay = 1, special = 0): number {
  return personal + fatigue + delay + special;
}

/**
 * Calculate full element results
 */
export function calculateElementResult(
  elementId: string,
  allTimes: number[],
  ratingPercent: number,
  allowance: AllowanceData
): ElementResult {
  const outliers = detectOutliers(allTimes);
  const validTimes = allTimes.filter((_, i) => !outliers[i]);
  const times = validTimes.length > 0 ? validTimes : allTimes;

  const n = times.length;
  const sumX = times.reduce((a, b) => a + b, 0);
  const sumXSq = times.reduce((a, b) => a + b * b, 0);
  const avg = avgObservedTime(times);
  const sd = standardDeviation(times);
  const cv = coefficientOfVariation(times);
  const [ciLow, ciHigh] = confidenceInterval(times);
  const nReq = requiredObservations(times);

  const totalAllowance = calculatePFD(allowance.personal, allowance.fatigue, allowance.delay, allowance.special);
  const nt = normalTime(avg, ratingPercent);
  const st = standardTime(nt, totalAllowance, allowance.formula || 'ADDITIVE');
  const eff = efficiencyPercent(st, avg);

  return {
    elementId,
    n,
    sumX,
    sumXSquared: sumXSq,
    avgObservedTime: avg,
    stdDeviation: sd,
    variance: sd * sd,
    coefficientOfVariation: cv,
    confidenceIntervalLow: ciLow,
    confidenceIntervalHigh: ciHigh,
    ratingPercent,
    normalTime: nt,
    allowancePercent: totalAllowance,
    standardTime: st,
    requiredObservations: nReq,
    isSufficient: n >= nReq,
    efficiencyPercent: eff,
    outlierIndices: allTimes.map((_, i) => i).filter(i => outliers[i]),
    isOutlier: outliers,
  };
}

/**
 * Method Improvement: Compare Before vs. After
 */
export function calculateImprovement(
  beforeStdTime: number,
  afterStdTime: number
): ImprovementResult {
  const timeSaved = Math.max(0, beforeStdTime - afterStdTime);
  const improvPct = beforeStdTime > 0 ? (timeSaved / beforeStdTime) * 100 : 0;
  const beforeOPH = outputPerHour(beforeStdTime);
  const afterOPH = outputPerHour(afterStdTime);
  const addlOPH = Math.max(0, afterOPH - beforeOPH);
  const addlOPHPct = beforeOPH > 0 ? (addlOPH / beforeOPH) * 100 : 0;
  const effGain = beforeStdTime > 0 && afterStdTime > 0 ? ((beforeStdTime / afterStdTime) - 1) * 100 : 0;

  return {
    beforeStandardTime: beforeStdTime,
    afterStandardTime: afterStdTime,
    timeSavedSeconds: timeSaved,
    improvementPercent: improvPct,
    beforeOutputPerHour: beforeOPH,
    afterOutputPerHour: afterOPH,
    additionalOutputPerHour: addlOPH,
    additionalOutputPercent: addlOPHPct,
    efficiencyGainPercent: effGain,
  };
}

/**
 * Line Balancing: Largest Candidate Rule (LCR) Heuristic
 */
export function lineBalanceLCR(
  elements: Array<{ id: string; name?: string; standardTime: number }>,
  taktTime: number
): LineBalanceResult {
  const sorted = [...elements].sort((a, b) => b.standardTime - a.standardTime);
  const stations: { stationId: number; elements: string[]; totalTime: number; idleTime: number }[] = [];
  const assigned = new Set<string>();

  while (assigned.size < elements.length) {
    const station = {
      stationId: stations.length + 1,
      elements: [] as string[],
      totalTime: 0,
      idleTime: 0,
    };

    for (const el of sorted) {
      if (!assigned.has(el.id) && station.totalTime + el.standardTime <= taktTime) {
        station.elements.push(el.id);
        station.totalTime += el.standardTime;
        assigned.add(el.id);
      }
    }

    if (station.elements.length === 0) {
      const next = sorted.find(el => !assigned.has(el.id));
      if (next) {
        station.elements.push(next.id);
        station.totalTime = next.standardTime;
        assigned.add(next.id);
      }
    }

    station.idleTime = Math.max(0, taktTime - station.totalTime);
    stations.push(station);
  }

  const totalWorkContent = elements.reduce((s, e) => s + e.standardTime, 0);
  const numStations = Math.max(1, stations.length);
  const efficiency = (totalWorkContent / (numStations * taktTime)) * 100;
  const delay = Math.max(0, 100 - efficiency);

  return {
    taktTime,
    numWorkstations: numStations,
    balanceEfficiency: Math.min(100, efficiency),
    balanceDelay: delay,
    stations,
  };
}

/**
 * Pareto Analysis (80/20 Rule) for Pen Assembly Elements
 */
export function calculatePareto(elements: { id: string; name: string; standardTime: number }[]) {
  const sorted = [...elements].sort((a, b) => b.standardTime - a.standardTime);
  const totalTime = sorted.reduce((sum, e) => sum + e.standardTime, 0);

  let cumulativeTime = 0;
  return sorted.map(el => {
    cumulativeTime += el.standardTime;
    const percentage = totalTime > 0 ? (el.standardTime / totalTime) * 100 : 0;
    const cumulativePercentage = totalTime > 0 ? (cumulativeTime / totalTime) * 100 : 0;
    return {
      id: el.id,
      name: el.name,
      standardTime: el.standardTime,
      percentage: Math.round(percentage * 10) / 10,
      cumulativePercentage: Math.round(cumulativePercentage * 10) / 10,
      isVitalFew: cumulativePercentage <= 80 || (cumulativePercentage - percentage < 80),
    };
  });
}
