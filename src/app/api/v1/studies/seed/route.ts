import { ok, err } from '@/lib/api';
import { seedDatabase } from '../../../../../../prisma/seed';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await seedDatabase();
    return ok({ message: 'Sample Pen Assembly dataset loaded successfully' });
  } catch (e: unknown) {
    const error = e as { message?: string };
    return err(error.message || 'Failed to seed sample data', 500);
  }
}

