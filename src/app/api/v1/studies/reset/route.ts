import { prisma } from '@/lib/prisma';
import { ok, err } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await prisma.observation.deleteMany({});
    await prisma.rating.deleteMany({});
    await prisma.allowance.deleteMany({});
    await prisma.result.deleteMany({});
    await prisma.element.deleteMany({});
    await prisma.study.deleteMany({});
    return ok({ message: 'All study data reset successfully' });
  } catch (e: unknown) {
    const error = e as { message?: string };
    return err(error.message || 'Failed to reset data', 500);
  }
}

