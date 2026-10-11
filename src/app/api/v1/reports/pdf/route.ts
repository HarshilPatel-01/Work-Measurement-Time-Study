import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { err } from '@/lib/api';
import { jsPDF } from 'jspdf';

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

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const allowancePct = study.allowances[0]?.totalPercent ?? 10;
    const pageW = doc.internal.pageSize.getWidth();

    // ──────────────── COVER / HEADER SECTION ────────────────
    doc.setFillColor(15, 23, 42); // Deep navy #0F172A
    doc.rect(0, 0, pageW, 70, 'F');

    // Title & Badge
    doc.setTextColor(129, 140, 248); // Indigo #818CF8
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('BASIC INDUSTRIAL ENGINEERING · WORK MEASUREMENT', pageW / 2, 22, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('TIME STUDY & WORK MEASUREMENT REPORT', pageW / 2, 34, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(226, 232, 240);
    doc.setFont('helvetica', 'normal');
    doc.text(`Subject: ${study.name}`, pageW / 2, 44, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Topic: Productivity Improvement in Manual Pen Assembly | Method: ${study.method}`, pageW / 2, 53, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`, pageW / 2, 60, { align: 'center' });

    // ──────────────── STUDY METADATA BOX ────────────────
    let y = 80;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, y, pageW - 30, 28, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, y, pageW - 30, 28, 3, 3, 'S');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);

    const meta = [
      { label: 'Product Model', val: study.productModel },
      { label: 'Workstation', val: study.workstation },
      { label: 'Operator', val: study.operator || 'Operator 1' },
      { label: 'Shift', val: study.shift },
      { label: 'Allowance Applied', val: `${allowancePct}% (PFD)` },
      { label: 'Cycles Recorded', val: `${Array.from(new Set(study.observations.map(o => o.cycleNumber))).length} cycles` },
    ];

    meta.forEach((m, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const posX = 20 + col * 60;
      const posY = y + 9 + row * 11;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`${m.label}:`, posX, posY);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${m.val}`, posX + 28, posY);
    });

    // ──────────────── FORMULAS REFERENCE BLOCK ────────────────
    y = 115;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('1. Industrial Engineering Work Measurement Formulas', 15, y);

    y += 5;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(15, y, pageW - 30, 22, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('courier', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text('• Observed Time (OT) = (Sum of cycle times) / N', 18, y + 5);
    doc.text('• Normal Time (NT)   = Observed Time x (Rating Factor % / 100)', 18, y + 10);
    doc.text('• Standard Time (ST) = Normal Time x (1 + Allowance % / 100)', 18, y + 15);
    doc.text('• Output Per Hour    = 3600 / Total Standard Time (seconds)', 105, y + 5);
    doc.text('• Efficiency %       = (Standard Time / Actual Cycle Time) x 100', 105, y + 10);
    doc.text("• ILO Sample Size N' = [(40 x sqrt(N*Sum(X^2) - (Sum(X))^2)) / Sum(X)]^2", 105, y + 15);

    // ──────────────── OBSERVATIONS & RESULTS TABLE ────────────────
    y = 148;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('2. Pen Assembly Elements Breakdown & Standard Time Calculations', 15, y);

    y += 5;
    const headers = ['#', 'Pen Element Name', 'Obs (N)', 'Avg OT (s)', 'Rating %', 'NT (s)', 'ST (s)', 'Output/hr'];
    const colWidths = [8, 62, 14, 20, 18, 18, 18, 22];

    doc.setFillColor(79, 70, 229); // Accent Indigo #4F46E5
    doc.rect(15, y, pageW - 30, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');

    let x = 15;
    headers.forEach((h, i) => {
      doc.text(h, x + 2, y + 5.5);
      x += colWidths[i];
    });

    y += 8;
    let totalOT = 0;
    let totalNT = 0;
    let totalST = 0;

    study.elements.forEach((el, index) => {
      const times = study.observations.filter(o => o.elementId === el.id && !o.isOutlier).map(o => o.observedTime);
      const count = times.length;
      const avg = count > 0 ? times.reduce((a, b) => a + b, 0) / count : 0;
      const rating = study.ratings.find(r => r.elementId === el.id)?.ratingPercent ?? 100;
      const nt = avg * (rating / 100);
      const st = nt * (1 + allowancePct / 100);
      const oph = st > 0 ? 3600 / st : 0;

      totalOT += avg;
      totalNT += nt;
      totalST += st;

      doc.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 252);
      doc.rect(15, y, pageW - 30, 6.5, 'F');
      doc.setDrawColor(241, 245, 249);
      doc.line(15, y + 6.5, pageW - 15, y + 6.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      doc.setTextColor(30, 41, 59);

      let rowX = 15;
      const row = [
        `${index + 1}`,
        el.name.length > 32 ? el.name.substring(0, 30) + '..' : el.name,
        `${count}`,
        avg.toFixed(2),
        `${rating}%`,
        nt.toFixed(2),
        st.toFixed(2),
        oph.toFixed(1),
      ];

      row.forEach((cell, ci) => {
        doc.text(cell, rowX + 2, y + 4.5);
        rowX += colWidths[ci];
      });

      y += 6.5;
    });

    // ──────────────── SUMMARY ROW ────────────────
    doc.setFillColor(241, 245, 249);
    doc.rect(15, y, pageW - 30, 7.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('TOTAL CYCLE WORK CONTENT', 17, y + 5);
    doc.text(`${totalOT.toFixed(2)}s`, 15 + colWidths[0] + colWidths[1] + colWidths[2] + 2, y + 5);
    doc.text(`${totalNT.toFixed(2)}s`, 15 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + 2, y + 5);
    doc.text(`${totalST.toFixed(2)}s`, 15 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + 2, y + 5);
    const overallOPH = totalST > 0 ? 3600 / totalST : 0;
    doc.text(`${overallOPH.toFixed(1)} u/hr`, 15 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5] + colWidths[6] + 2, y + 5);

    // ──────────────── SUMMARY KPI CARDS ────────────────
    y += 14;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Key Production Metrics & Bottleneck Analysis', 15, y);

    y += 5;
    const cards = [
      { title: 'Standard Cycle Time', value: `${totalST.toFixed(2)} sec`, note: `With ${allowancePct}% allowance` },
      { title: 'Hourly Assembly Capacity', value: `${overallOPH.toFixed(1)} units/hr`, note: `${(overallOPH * 8).toFixed(0)} units / 8-hr shift` },
      { title: 'Observed Baseline (OT)', value: `${totalOT.toFixed(2)} sec`, note: 'Sum of raw element times' },
      { title: 'Average Pace Rating', value: `${(study.ratings.reduce((a, b) => a + b.ratingPercent, 0) / (study.ratings.length || 1)).toFixed(0)}%`, note: 'Westinghouse Standard' },
    ];

    cards.forEach((c, idx) => {
      const cx = 15 + idx * 45.5;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(cx, y, 43, 20, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(cx, y, 43, 20, 2, 2, 'S');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(c.title, cx + 3, y + 5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(c.value, cx + 3, y + 11.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(79, 70, 229);
      doc.text(c.note, cx + 3, y + 16.5);
    });

    // ──────────────── FOOTER ────────────────
    const pageCount = doc.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 285, pageW - 15, 285);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('Industrial Engineering Time Study System · Manual Pen Assembly Project', 15, 290);
      doc.text(`Page ${p} of ${pageCount}`, pageW - 15, 290, { align: 'right' });
    }

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    const safeDate = new Date().toISOString().split('T')[0];
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="PenAssembly_TimeStudy_${study.method}_${safeDate}.pdf"`,
      },
    });
  } catch (e: unknown) {
    const error = e as { message?: string };
    return err(error.message || 'Failed to generate PDF', 500);
  }
}
