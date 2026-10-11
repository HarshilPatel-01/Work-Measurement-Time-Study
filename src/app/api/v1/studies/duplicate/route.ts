import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err } from '@/lib/api';

export async function POST(req: NextRequest) {
  try {
    const { studyId, newName } = await req.json();
    if (!studyId) return err('studyId is required', 400);

    const source = await prisma.study.findUnique({
      where: { id: studyId },
      include: {
        elements: { orderBy: { order: 'asc' } },
        observations: true,
        ratings: true,
        allowances: true,
      },
    });

    if (!source) return err('Source study not found', 404);

    const newStudy = await prisma.study.create({
      data: {
        name: newName || `${source.name} (Copy)`,
        productModel: source.productModel,
        workstation: source.workstation,
        operator: source.operator,
        date: new Date(),
        shift: source.shift,
        method: source.method,
        description: source.description,
        targetCycle: source.targetCycle,
      },
    });

    // Map old element id to new element id
    const elementIdMap = new Map<string, string>();
    for (const el of source.elements) {
      const created = await prisma.element.create({
        data: {
          studyId: newStudy.id,
          name: el.name,
          description: el.description,
          type: el.type,
          order: el.order,
          startPoint: el.startPoint,
          endPoint: el.endPoint,
        },
      });
      elementIdMap.set(el.id, created.id);
    }

    // Copy observations
    for (const obs of source.observations) {
      const newElId = elementIdMap.get(obs.elementId);
      if (newElId) {
        await prisma.observation.create({
          data: {
            studyId: newStudy.id,
            elementId: newElId,
            cycleNumber: obs.cycleNumber,
            observedTime: obs.observedTime,
            isOutlier: obs.isOutlier,
            outlierReason: obs.outlierReason,
            notes: obs.notes,
          },
        });
      }
    }

    // Copy ratings
    for (const rat of source.ratings) {
      const newElId = elementIdMap.get(rat.elementId);
      if (newElId) {
        await prisma.rating.create({
          data: {
            studyId: newStudy.id,
            elementId: newElId,
            system: rat.system,
            skillRating: rat.skillRating,
            effortRating: rat.effortRating,
            conditionRating: rat.conditionRating,
            consistencyRating: rat.consistencyRating,
            ratingPercent: rat.ratingPercent,
          },
        });
      }
    }

    // Copy allowances
    if (source.allowances && source.allowances.length > 0) {
      const a = source.allowances[0];
      await prisma.allowance.create({
        data: {
          studyId: newStudy.id,
          personal: a.personal,
          fatigue: a.fatigue,
          delay: a.delay,
          special: a.special,
          totalPercent: a.totalPercent,
          formula: a.formula,
        },
      });
    }

    return ok(newStudy, 201);
  } catch (e: unknown) {
    const error = e as { message?: string };
    return err(error.message || 'Failed to duplicate study', 500);
  }
}

