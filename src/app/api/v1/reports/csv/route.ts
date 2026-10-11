import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { err } from '@/lib/api';

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

    const allowancePct = study.allowances[0]?.totalPercent ?? 10;
    const cycles = Array.from(new Set(study.observations.map(o => o.cycleNumber))).sort((a, b) => a - b);

    // Section 1: Metadata
    const lines: string[] = [
      '# PEN ASSEMBLY TIME STUDY RAW DATA EXPORT (CSV)',
      `# Study Name,"${study.name.replace(/"/g, '""')}"`,
      `# Method,${study.method}`,
      `# Product Model,"${study.productModel}"`,
      `# Workstation,"${study.workstation}"`,
      `# Operator,"${study.operator || 'Operator 1'}"`,
      `# Date,${new Date(study.date).toLocaleDateString('en-GB')}`,
      `# Allowance Applied,${allowancePct}%`,
      '',
      '# OBSERVATIONS TABLE (SECONDS)',
    ];

    // Section 2: Observations Header
    const obsHeaders = ['Cycle', ...study.elements.map(el => `"${el.name.replace(/"/g, '""')}"`), 'Cycle Total (s)'];
    lines.push(obsHeaders.join(','));

    // Section 3: Cycle Rows
    cycles.forEach(c => {
      let cycleTotal = 0;
      const elementTimes = study.elements.map(el => {
        const obs = study.observations.find(o => o.elementId === el.id && o.cycleNumber === c);
        const t = obs ? obs.observedTime : 0;
        cycleTotal += t;
        return t > 0 ? t.toFixed(2) : '0.00';
      });
      lines.push([c, ...elementTimes, cycleTotal.toFixed(2)].join(','));
    });

    // Section 4: Element Calculations
    lines.push('');
    lines.push('# SUMMARY CALCULATIONS BY ELEMENT');
    lines.push('Element #,Element Name,Obs Count,Avg OT (s),Rating %,Normal Time (s),Allowance %,Standard Time (s),Output Per Hour');

    let totalST = 0;
    study.elements.forEach((el, i) => {
      const times = study.observations.filter(o => o.elementId === el.id && !o.isOutlier).map(o => o.observedTime);
      const n = times.length;
      const avg = n > 0 ? times.reduce((a, b) => a + b, 0) / n : 0;
      const rating = study.ratings.find(r => r.elementId === el.id)?.ratingPercent ?? 100;
      const nt = avg * (rating / 100);
      const st = nt * (1 + allowancePct / 100);
      const oph = st > 0 ? 3600 / st : 0;
      totalST += st;

      lines.push([
        i + 1,
        `"${el.name.replace(/"/g, '""')}"`,
        n,
        avg.toFixed(3),
        rating,
        nt.toFixed(3),
        allowancePct,
        st.toFixed(3),
        oph.toFixed(1),
      ].join(','));
    });

    const overallOPH = totalST > 0 ? 3600 / totalST : 0;
    lines.push(`Total Cycle Work Content,,,,,,,"${totalST.toFixed(3)} s","${overallOPH.toFixed(1)} u/hr"`);

    const csvContent = lines.join('\r\n');
    const safeDate = new Date().toISOString().split('T')[0];

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="PenAssembly_TimeStudy_${study.method}_${safeDate}.csv"`,
      },
    });
  } catch (e: unknown) {
    const error = e as { message?: string };
    return err(error.message || 'Failed to export CSV', 500);
  }
}
