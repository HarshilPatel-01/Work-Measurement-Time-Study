import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, err } from '@/lib/api';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const study = await prisma.study.findFirst({
      where: { id: params.id, isActive: true },
      include: {
        elements: { where: { isActive: true }, orderBy: { order: 'asc' } },
        observations: { orderBy: [{ cycleNumber: 'asc' }, { elementId: 'asc' }] },
        ratings: true,
        allowances: true,
        results: true,
      },
    });
    if (!study) return err('Study not found', 404);
    return ok(study);
  } catch (e: unknown) {
    const error = e as { message?: string };
    return err(error.message || 'Error fetching study', 500);
  }
}

const updateSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  productModel: z.string().optional(),
  workstation: z.string().optional(),
  operator: z.string().optional(),
  date: z.string().optional(),
  shift: z.string().optional(),
  method: z.enum(['BEFORE', 'AFTER']).optional(),
  description: z.string().max(500).optional(),
  targetCycle: z.number().int().min(1).optional(),
  allowance: z.object({
    personal: z.number().min(0),
    fatigue: z.number().min(0),
    delay: z.number().min(0),
    special: z.number().min(0),
    totalPercent: z.number().min(0),
    formula: z.string().default('ADDITIVE'),
  }).optional(),
  ratings: z.array(z.object({
    elementId: z.string(),
    ratingPercent: z.number().min(50).max(150),
    system: z.string().optional(),
  })).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    let body: unknown;
    try { body = await req.json(); } catch { return err('Invalid JSON', 400); }

    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return err('Validation failed', 422, parsed.error.flatten());

    const { allowance, ratings, ...studyData } = parsed.data;

    await prisma.study.update({
      where: { id: params.id },
      data: {
        ...studyData,
        date: studyData.date ? new Date(studyData.date) : undefined,
      },
    });

    if (allowance) {
      await prisma.allowance.upsert({
        where: { studyId: params.id },
        update: {
          personal: allowance.personal,
          fatigue: allowance.fatigue,
          delay: allowance.delay,
          special: allowance.special,
          totalPercent: allowance.totalPercent,
          formula: allowance.formula,
        },
        create: {
          studyId: params.id,
          personal: allowance.personal,
          fatigue: allowance.fatigue,
          delay: allowance.delay,
          special: allowance.special,
          totalPercent: allowance.totalPercent,
          formula: allowance.formula,
        },
      });
    }

    if (ratings && ratings.length > 0) {
      for (const r of ratings) {
        await prisma.rating.upsert({
          where: { studyId_elementId: { studyId: params.id, elementId: r.elementId } },
          update: { ratingPercent: r.ratingPercent, system: r.system || 'WESTINGHOUSE' },
          create: { studyId: params.id, elementId: r.elementId, ratingPercent: r.ratingPercent, system: r.system || 'WESTINGHOUSE' },
        });
      }
    }

    const updated = await prisma.study.findUnique({
      where: { id: params.id },
      include: {
        elements: { where: { isActive: true }, orderBy: { order: 'asc' } },
        observations: true,
        ratings: true,
        allowances: true,
      },
    });

    return ok(updated);
  } catch (e: unknown) {
    const error = e as { message?: string };
    return err(error.message || 'Server error', 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.study.delete({ where: { id: params.id } });
    return ok({ message: 'Study deleted successfully' });
  } catch (e: unknown) {
    const error = e as { message?: string };
    return err(error.message || 'Server error', 500);
  }
}
