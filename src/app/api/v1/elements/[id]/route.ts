import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, err, sanitize } from '@/lib/api';

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  type: z.string().optional(),
  order: z.number().int().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return err('Validation failed', 422, parsed.error.flatten());

    const updated = await prisma.element.update({
      where: { id: params.id },
      data: {
        name: parsed.data.name ? sanitize(parsed.data.name) : undefined,
        description: parsed.data.description !== undefined ? sanitize(parsed.data.description) : undefined,
        type: parsed.data.type,
        order: parsed.data.order,
      },
    });

    return ok(updated);
  } catch (e: unknown) {
    const error = e as { message?: string };
    return err(error.message || 'Server error', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.element.delete({
      where: { id: params.id },
    });
    return ok({ message: 'Element deleted' });
  } catch (e: unknown) {
    const error = e as { message?: string };
    return err(error.message || 'Server error', 500);
  }
}

