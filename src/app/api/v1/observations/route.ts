import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, err } from '@/lib/api';

const schema = z.object({
  studyId: z.string(),
  elementId: z.string(),
  cycleNumber: z.number().int().min(1),
  observedTime: z.number().positive(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try { body = await req.json(); } catch { return err('Invalid JSON', 400); }
    const parsed = schema.safeParse(body);
    if (!parsed.success) return err('Validation failed', 422, parsed.error.flatten());

    const obs = await prisma.observation.upsert({
      where: {
        studyId_elementId_cycleNumber: {
          studyId: parsed.data.studyId,
          elementId: parsed.data.elementId,
          cycleNumber: parsed.data.cycleNumber,
        },
      },
      update: {
        observedTime: parsed.data.observedTime,
        notes: parsed.data.notes,
      },
      create: {
        studyId: parsed.data.studyId,
        elementId: parsed.data.elementId,
        cycleNumber: parsed.data.cycleNumber,
        observedTime: parsed.data.observedTime,
        notes: parsed.data.notes,
      },
    });

    return ok(obs, 201);
  } catch (e: unknown) {
    const error = e as { message?: string };
    return err(error.message || 'Server error', 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const studyId = req.nextUrl.searchParams.get('studyId');
    const cycleNumber = req.nextUrl.searchParams.get('cycleNumber');

    if (!studyId) return err('studyId required', 400);

    if (cycleNumber) {
      await prisma.observation.deleteMany({
        where: { studyId, cycleNumber: parseInt(cycleNumber) },
      });
      return ok({ message: `Cycle ${cycleNumber} deleted` });
    }

    await prisma.observation.deleteMany({
      where: { studyId },
    });
    return ok({ message: 'All observations for study deleted' });
  } catch (e: unknown) {
    const error = e as { message?: string };
    return err(error.message || 'Server error', 500);
  }
}
