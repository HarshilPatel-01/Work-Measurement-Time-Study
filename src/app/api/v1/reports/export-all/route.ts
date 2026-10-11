import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { err } from '@/lib/api';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const studies = await prisma.study.findMany({
      where: { isActive: true },
      include: {
        elements: { where: { isActive: true }, orderBy: { order: 'asc' } },
        observations: { orderBy: [{ cycleNumber: 'asc' }, { elementId: 'asc' }] },
        ratings: true,
        allowances: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!studies || studies.length === 0) {
      return err('No studies available to export', 404);
    }

    const wb = XLSX.utils.book_new();

    // ──────────────── OVERVIEW SHEET ────────────────
    const overviewHeaders = [
      'Study Name',
      'Method',
      'Product Model',
      'Workstation',
      'Operator',
      'Date',
      'Elements Count',
      'Cycles Recorded',
      'Total Standard Time (s)',
      'Output / Hour (units)',
      'Allowance %',
    ];

    const overviewRows = studies.map(s => {
      const allowancePct = s.allowances[0]?.totalPercent ?? 10;
      let totalST = 0;
      s.elements.forEach(el => {
        const times = s.observations.filter(o => o.elementId === el.id && !o.isOutlier).map(o => o.observedTime);
        const avg = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
        const rating = s.ratings.find(r => r.elementId === el.id)?.ratingPercent ?? 100;
        const nt = avg * (rating / 100);
        const st = nt * (1 + allowancePct / 100);
        totalST += st;
      });
      const oph = totalST > 0 ? 3600 / totalST : 0;
      const cyclesCount = Array.from(new Set(s.observations.map(o => o.cycleNumber))).length;

      return [
        s.name,
        s.method,
        s.productModel,
        s.workstation,
        s.operator || 'Operator 1',
        new Date(s.date).toLocaleDateString('en-GB'),
        s.elements.length,
        cyclesCount,
        +totalST.toFixed(2),
        +oph.toFixed(1),
        `${allowancePct}%`,
      ];
    });

    const wsOverview = XLSX.utils.aoa_to_sheet([
      ['ALL TIME STUDIES MASTER REPOSITORY - INDUSTRIAL ENGINEERING'],
      [],
      overviewHeaders,
      ...overviewRows,
    ]);
    wsOverview['!cols'] = [
      { wch: 35 }, { wch: 12 }, { wch: 25 }, { wch: 25 }, { wch: 20 },
      { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 22 }, { wch: 20 }, { wch: 14 },
    ];
    XLSX.utils.book_append_sheet(wb, wsOverview, 'All Studies Overview');

    // Add sheets for up to 5 most recent studies
    studies.slice(0, 5).forEach((s, idx) => {
      const sheetName = `${idx + 1}. ${s.method} - ${s.name.substring(0, 15)}`.replace(/[\\/?*[\]]/g, '');
      const allowancePct = s.allowances[0]?.totalPercent ?? 10;

      const elementData = s.elements.map((el, i) => {
        const times = s.observations.filter(o => o.elementId === el.id && !o.isOutlier).map(o => o.observedTime);
        const avg = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
        const rating = s.ratings.find(r => r.elementId === el.id)?.ratingPercent ?? 100;
        const nt = avg * (rating / 100);
        const st = nt * (1 + allowancePct / 100);
        const oph = st > 0 ? 3600 / st : 0;
        return [i + 1, el.name, times.length, +avg.toFixed(2), rating, +nt.toFixed(2), +st.toFixed(2), +oph.toFixed(1)];
      });

      const wsStudy = XLSX.utils.aoa_to_sheet([
        [`Study: ${s.name} (${s.method})`],
        [`Operator: ${s.operator || 'Operator 1'} | Workstation: ${s.workstation} | Shift: ${s.shift} | Date: ${new Date(s.date).toLocaleDateString()}`],
        [],
        ['#', 'Element', 'Obs', 'Avg OT (s)', 'Rating %', 'NT (s)', 'ST (s)', 'Output/hr'],
        ...elementData,
      ]);
      wsStudy['!cols'] = [{ wch: 6 }, { wch: 30 }, { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsStudy, sheetName);
    });

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const safeDate = new Date().toISOString().split('T')[0];

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="PenAssembly_AllStudies_Master_${safeDate}.xlsx"`,
      },
    });
  } catch (e: unknown) {
    const error = e as { message?: string };
    return err(error.message || 'Failed to export all studies', 500);
  }
}

