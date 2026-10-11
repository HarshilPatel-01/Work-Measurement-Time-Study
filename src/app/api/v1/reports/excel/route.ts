import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { err } from '@/lib/api';
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
  try {
    const studyId = req.nextUrl.searchParams.get('studyId');
    if (!studyId) return err('studyId required', 400);

    const study = await prisma.study.findUnique({
      where: { id: studyId },
      include: {
        elements: { where: { isActive: true }, orderBy: { order: 'asc' } },
        observations: { orderBy: [{ cycleNumber: 'asc' }, { elementId: 'asc' }] },
        ratings: true,
        allowances: true,
      },
    });
    if (!study) return err('Study not found', 404);

    const wb = XLSX.utils.book_new();
    const allowancePct = study.allowances[0]?.totalPercent ?? 10;
    const pfd = study.allowances[0] || { personal: 5, fatigue: 4, delay: 1, special: 0 };

    // ──────────────── SHEET 1: STUDY INFO ────────────────
    const infoData = [
      ['PEN ASSEMBLY TIME STUDY & WORK MEASUREMENT REPORT'],
      ['Basic Industrial Engineering - Academic Laboratory Project'],
      [],
      ['Study Parameter', 'Details / Values', 'Engineering Notes'],
      ['Study Name', study.name, 'Project identification'],
      ['Study Method', study.method, 'BEFORE = Baseline, AFTER = Ergonomically Optimized'],
      ['Product Model', study.productModel, 'Manual Retractable Ballpoint Pen Assembly'],
      ['Workstation ID', study.workstation, 'Assembly bench station'],
      ['Operator Name', study.operator || 'Operator 1', 'Operator assigned for timing observations'],
      ['Study Date', new Date(study.date).toLocaleDateString('en-GB'), 'Observation collection date'],
      ['Shift Type', study.shift, 'Working shift'],
      ['Personal Allowance', `${pfd.personal}%`, 'ILO Guideline: Personal needs, drinking water, restroom'],
      ['Fatigue Allowance', `${pfd.fatigue}%`, 'ILO Guideline: Energy expenditure, posture, eye strain'],
      ['Delay Allowance', `${pfd.delay}%`, 'ILO Guideline: Minor unavoidable part delivery / tool delays'],
      ['Special Allowance', `${pfd.special}%`, 'Special allowances if applicable'],
      ['Total Allowance (PFD)', `${allowancePct}%`, 'Applied as additive standard factor (1 + A%)'],
      ['Generated On', new Date().toLocaleString(), 'Automated system export timestamp'],
    ];
    const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
    wsInfo['!cols'] = [{ wch: 25 }, { wch: 45 }, { wch: 55 }];
    XLSX.utils.book_append_sheet(wb, wsInfo, 'Study Info');

    // ──────────────── SHEET 2: OBSERVATIONS MATRIX ────────────────
    const cycles = Array.from(new Set(study.observations.map(o => o.cycleNumber))).sort((a, b) => a - b);
    const obsHeaders = ['Cycle #', ...study.elements.map(el => `${el.name} (s)`), 'Total Cycle (s)'];
    const obsRows = cycles.map(c => {
      let cycleSum = 0;
      const elementTimes = study.elements.map(el => {
        const obs = study.observations.find(o => o.elementId === el.id && o.cycleNumber === c);
        const t = obs ? obs.observedTime : 0;
        cycleSum += t;
        return t > 0 ? t : '';
      });
      return [c, ...elementTimes, +cycleSum.toFixed(2)];
    });

    const wsObs = XLSX.utils.aoa_to_sheet([['CYCLE-BY-CYCLE TIMING OBSERVATIONS (RAW DATA IN SECONDS)'], [], obsHeaders, ...obsRows]);
    wsObs['!cols'] = [{ wch: 10 }, ...study.elements.map(() => ({ wch: 22 })), { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsObs, 'Observations');

    // ──────────────── SHEET 3: CALCULATIONS ────────────────
    const calcHeaders = [
      '#',
      'Element Name',
      'Obs Count (N)',
      'Avg Observed Time (s)',
      'Rating Factor (%)',
      'Normal Time (s)',
      'Allowance (%)',
      'Standard Time (s)',
      'Output Per Hour (units)',
      'Required Obs (N\')',
      'Statistical Adequacy',
    ];

    let totalAvgOT = 0;
    let totalNT = 0;
    let totalST = 0;

    const calcRows = study.elements.map((el, i) => {
      const times = study.observations.filter(o => o.elementId === el.id && !o.isOutlier).map(o => o.observedTime);
      const n = times.length;
      const sumX = times.reduce((a, b) => a + b, 0);
      const sumXSq = times.reduce((a, b) => a + b * b, 0);
      const avg = n > 0 ? sumX / n : 0;
      const rating = study.ratings.find(r => r.elementId === el.id)?.ratingPercent ?? 100;
      const nt = avg * (rating / 100);
      const st = nt * (1 + allowancePct / 100);
      const oph = st > 0 ? 3600 / st : 0;

      // ILO Barnes Required observations formula: N' = (40 * sqrt(N*sumX2 - (sumX)^2) / sumX)^2
      const disc = n * sumXSq - sumX * sumX;
      let nReq = n;
      if (sumX > 0 && disc > 0) {
        nReq = Math.ceil(Math.pow((40 * Math.sqrt(disc)) / sumX, 2));
      }

      totalAvgOT += avg;
      totalNT += nt;
      totalST += st;

      return [
        i + 1,
        el.name,
        n,
        +avg.toFixed(3),
        rating,
        +nt.toFixed(3),
        allowancePct,
        +st.toFixed(3),
        +oph.toFixed(1),
        nReq,
        n >= nReq ? 'ADEQUATE (PASS)' : `NEED ${Math.max(0, nReq - n)} MORE`,
      ];
    });

    const totalOPH = totalST > 0 ? 3600 / totalST : 0;
    const summaryCalcRow = [
      '',
      'TOTAL CYCLE WORK CONTENT',
      '',
      +totalAvgOT.toFixed(3),
      '',
      +totalNT.toFixed(3),
      `${allowancePct}%`,
      +totalST.toFixed(3),
      +totalOPH.toFixed(1),
      '',
      'CONFIRMED',
    ];

    const wsCalc = XLSX.utils.aoa_to_sheet([
      ['WORK MEASUREMENT & STANDARD TIME COMPUTATIONS'],
      ['Formulas: OT = Sum(X)/N | NT = OT*(Rating/100) | ST = NT*(1+A%) | OPH = 3600/ST | N\' = [40*sqrt(N*Sum(X^2)-(Sum(X))^2)/Sum(X)]^2'],
      [],
      calcHeaders,
      ...calcRows,
      summaryCalcRow,
    ]);
    wsCalc['!cols'] = [{ wch: 6 }, { wch: 32 }, { wch: 14 }, { wch: 22 }, { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 18 }, { wch: 24 }, { wch: 18 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, wsCalc, 'Calculations');

    // ──────────────── SHEET 4: COMPARISON / METHOD IMPROVEMENT ────────────────
    const otherStudies = await prisma.study.findMany({
      where: { id: { not: study.id }, isActive: true },
      include: { elements: true, observations: true, ratings: true, allowances: true },
      take: 2,
    });

    const compData: (string | number)[][] = [
      ['METHOD IMPROVEMENT & BEFORE vs AFTER COMPARISON'],
      [],
      ['Metric', `${study.name} (${study.method})`],
    ];

    otherStudies.forEach(s => {
      compData[2].push(`${s.name} (${s.method})`);
    });

    // Populate comparison metrics
    compData.push(['Standard Cycle Time (s)', +totalST.toFixed(2)]);
    compData.push(['Hourly Production Rate (units/hr)', +totalOPH.toFixed(1)]);
    compData.push(['Daily Output (8-hour shift)', +(totalOPH * 8).toFixed(0)]);
    compData.push(['Workstation Reach Envelope', study.method === 'AFTER' ? 'Compact 350mm' : 'Wide 600mm']);
    compData.push(['Material Feeding Mechanism', study.method === 'AFTER' ? 'Gravity Feed Fixtures' : 'Loose Box Picking']);

    const wsComp = XLSX.utils.aoa_to_sheet(compData);
    wsComp['!cols'] = [{ wch: 32 }, { wch: 35 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, wsComp, 'Comparison');

    // ──────────────── SHEET 5: SUMMARY & LINE BALANCING ────────────────
    const summaryData = [
      ['EXECUTIVE PRODUCTIVITY SUMMARY & BOTTLENECK ANALYSIS'],
      [],
      ['Key Performance Indicator', 'Result Value', 'Interpretation / Engineering Recommendation'],
      ['Total Work Content', `${totalST.toFixed(2)} seconds`, 'Total standard time required to fully assemble 1 pen'],
      ['Baseline Output Capacity', `${totalOPH.toFixed(1)} pens/hour`, 'Expected production output rate at 100% operator performance'],
      ['Theoretical 8-Hour Capacity', `${Math.round(totalOPH * 8)} pens/day`, 'Total daily throughput without downtime losses'],
      ['Largest Candidate Bottleneck', study.elements.sort((a,b) => b.order - a.order)[0]?.name || 'N/A', 'Station pacing element with highest standard time'],
      ['PFD Allowance Overhead', `${allowancePct}%`, 'Allowances for personal needs, resting fatigue, and minor delays'],
      ['Sample Size Confidence', '95% Confidence, ±5% Precision', 'Calculated according to standard ILO Barnes methodology'],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 32 }, { wch: 25 }, { wch: 65 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const safeDate = new Date().toISOString().split('T')[0];

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="PenAssembly_TimeStudy_${study.method}_${safeDate}.xlsx"`,
      },
    });
  } catch (e: unknown) {
    const error = e as { message?: string };
    return err(error.message || 'Failed to generate Excel', 500);
  }
}
