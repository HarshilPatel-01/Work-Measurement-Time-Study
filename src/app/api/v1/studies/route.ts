import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, err, paginated, parsePagination, sanitize } from '@/lib/api';

const createSchema = z.object({
  name: z.string().min(2).max(200),
  productModel: z.string().min(1).max(100).default('Standard Ballpoint Pen'),
  workstation: z.string().min(1).max(100).default('WS-01 Pen Assembly'),
  operator: z.string().optional().default('Operator 1'),
  date: z.string().optional(),
  shift: z.string().default('General'),
  method: z.enum(['BEFORE', 'AFTER']).default('BEFORE'),
  description: z.string().max(500).optional(),
  targetCycle: z.number().int().min(1).max(200).default(10),
  allowancePercent: z.number().min(0).max(50).default(10),
  elements: z.array(z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    type: z.string().default('MANUAL'),
    order: z.number().int(),
  })).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { page, limit, skip } = parsePagination(req);
    const method = req.nextUrl.searchParams.get('method');
    const shift = req.nextUrl.searchParams.get('shift');
    const search = req.nextUrl.searchParams.get('search');

    const where = {
      ...(method ? { method } : {}),
      ...(shift ? { shift } : {}),
      ...(search ? { name: { contains: search } } : {}),
      isActive: true,
    };

    const [studies, total] = await Promise.all([
      prisma.study.findMany({
        where,
        include: {
          elements: { where: { isActive: true }, orderBy: { order: 'asc' } },
          allowances: true,
          _count: { select: { elements: true, observations: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.study.count({ where }),
    ]);

    return paginated(studies, total, page, limit);
  } catch (e: unknown) {
    const err2 = e as { message?: string };
    return err(err2.message || 'Error fetching studies', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try { body = await req.json(); } catch { return err('Invalid JSON body', 400); }

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return err('Validation failed', 422, parsed.error.flatten());

    const data = parsed.data;

    const study = await prisma.study.create({
      data: {
        name: sanitize(data.name),
        productModel: sanitize(data.productModel),
        workstation: sanitize(data.workstation),
        operator: data.operator ? sanitize(data.operator) : 'Operator 1',
        date: data.date ? new Date(data.date) : new Date(),
        shift: data.shift,
        method: data.method,
        description: data.description ? sanitize(data.description) : undefined,
        targetCycle: data.targetCycle,
      },
    });

    // Default 7 core Pen Assembly elements if not specified
    const elementsToCreate = data.elements && data.elements.length > 0 ? data.elements : [
      { name: 'Pick barrel from bin', description: 'Grasp plastic cylindrical barrel tube', type: 'MANUAL', order: 1 },
      { name: 'Insert ink refill into barrel', description: 'Slide ink cartridge inside barrel', type: 'MANUAL', order: 2 },
      { name: 'Fit compression spring', description: 'Thread spring onto writing tip of refill', type: 'MANUAL', order: 3 },
      { name: 'Fit writing tip / nose cone', description: 'Screw nose cone onto front barrel threads', type: 'MANUAL', order: 4 },
      { name: 'Fit cap / clip assembly', description: 'Slide pocket clip into cap housing', type: 'MANUAL', order: 5 },
      { name: 'Fit push button / plunger', description: 'Insert retractable clicker mechanism', type: 'MANUAL', order: 6 },
      { name: 'Screw threaded cap assembly', description: 'Thread cap onto rear barrel section', type: 'MANUAL', order: 7 },
      { name: 'Visual & click testing', description: 'Functional write stroke and latch verification', type: 'MANUAL', order: 8 },
      { name: 'Place in finished tray', description: 'Transfer completed pen to holding fixture', type: 'MANUAL', order: 9 },
    ];

    for (const el of elementsToCreate) {
      const createdEl = await prisma.element.create({
        data: {
          studyId: study.id,
          name: sanitize(el.name),
          description: el.description ? sanitize(el.description) : undefined,
          type: el.type || 'MANUAL',
          order: el.order,
        },
      });

      // Default rating 100%
      await prisma.rating.create({
        data: {
          studyId: study.id,
          elementId: createdEl.id,
          system: 'WESTINGHOUSE',
          ratingPercent: 100,
        },
      });
    }

    // Default allowances (Personal 5%, Fatigue 4%, Delay 1% = 10%)
    const allowanceVal = data.allowancePercent || 10;
    await prisma.allowance.create({
      data: {
        studyId: study.id,
        personal: Math.round(allowanceVal * 0.5 * 10) / 10,
        fatigue: Math.round(allowanceVal * 0.4 * 10) / 10,
        delay: Math.round(allowanceVal * 0.1 * 10) / 10,
        special: 0,
        totalPercent: allowanceVal,
        formula: 'ADDITIVE',
      },
    });

    const fullStudy = await prisma.study.findUnique({
      where: { id: study.id },
      include: { elements: true, allowances: true, ratings: true },
    });

    return ok(fullStudy, 201);
  } catch (e: unknown) {
    const err2 = e as { message?: string };
    return err(err2.message || 'Server error', 500);
  }
}
