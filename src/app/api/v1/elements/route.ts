import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, err, sanitize } from '@/lib/api';

const createElementSchema = z.object({
  studyId: z.string(),
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  type: z.string().default('MANUAL'),
  order: z.number().int().optional(),
});

const reorderSchema = z.object({
  studyId: z.string(),
  orders: z.array(z.object({
    id: z.string(),
    order: z.number().int(),
  })),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createElementSchema.safeParse(body);
    if (!parsed.success) return err('Validation failed', 422, parsed.error.flatten());

    const { studyId, name, description, type, order } = parsed.data;

    let targetOrder = order;
    if (targetOrder === undefined) {
      const maxOrder = await prisma.element.aggregate({
        where: { studyId },
        _max: { order: true },
      });
      targetOrder = (maxOrder._max.order || 0) + 1;
    }

    const element = await prisma.element.create({
      data: {
        studyId,
        name: sanitize(name),
        description: description ? sanitize(description) : undefined,
        type,
        order: targetOrder,
      },
    });

    // Default rating 100%
    await prisma.rating.create({
      data: {
        studyId,
        elementId: element.id,
        ratingPercent: 100,
        system: 'WESTINGHOUSE',
      },
    });

    return ok(element, 201);
  } catch (e: unknown) {
    const error = e as { message?: string };
    return err(error.message || 'Server error', 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = reorderSchema.safeParse(body);
    if (!parsed.success) return err('Validation failed', 422, parsed.error.flatten());

    for (const item of parsed.data.orders) {
      await prisma.element.update({
        where: { id: item.id },
        data: { order: item.order },
      });
    }

    const elements = await prisma.element.findMany({
      where: { studyId: parsed.data.studyId, isActive: true },
      orderBy: { order: 'asc' },
    });

    return ok(elements);
  } catch (e: unknown) {
    const error = e as { message?: string };
    return err(error.message || 'Server error', 500);
  }
}

