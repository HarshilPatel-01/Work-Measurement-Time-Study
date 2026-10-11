import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Deterministic normal distribution generator
function generateObservations(baseTime: number, cv: number, count: number): number[] {
  const stdDev = (baseTime * cv) / 100;
  const obs: number[] = [];
  for (let i = 0; i < count; i++) {
    const u1 = Math.random() || 0.5;
    const u2 = Math.random() || 0.5;
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const t = Math.max(baseTime * 0.45, baseTime + z * stdDev);
    obs.push(Math.round(t * 100) / 100);
  }
  return obs;
}

export const PEN_ELEMENTS_BEFORE = [
  { name: 'Pick barrel from bin', description: 'Grasp cylindrical barrel from disorganized parts bin', baseTime: 3.4, cv: 14, type: 'MANUAL' },
  { name: 'Insert ink refill into barrel', description: 'Orient ink cartridge and slide into barrel tube', baseTime: 6.9, cv: 16, type: 'MANUAL' },
  { name: 'Fit compression spring over refill', description: 'Thread coiled spring onto tip end of refill', baseTime: 4.8, cv: 18, type: 'MANUAL' },
  { name: 'Fit writing tip / nose cone', description: 'Position cone over spring and thread onto barrel', baseTime: 7.6, cv: 15, type: 'MANUAL' },
  { name: 'Fit cap / clip assembly', description: 'Slide clip onto pen cap mechanism', baseTime: 5.8, cv: 17, type: 'MANUAL' },
  { name: 'Fit push button / clicker', description: 'Insert plunger mechanism into rear barrel end', baseTime: 8.5, cv: 14, type: 'MANUAL' },
  { name: 'Screw threaded cap assembly', description: 'Tighten rear threaded cap onto barrel housing', baseTime: 6.2, cv: 12, type: 'MANUAL' },
  { name: 'Functional click & writing test', description: 'Click 3 times and perform spiral test stroke on pad', baseTime: 9.8, cv: 22, type: 'MANUAL' },
  { name: 'Place completed pen in finished tray', description: 'Discharge pen to 10x5 partitioned tray', baseTime: 3.6, cv: 9, type: 'MANUAL' },
];

export const PEN_ELEMENTS_AFTER = [
  { name: 'Pick barrel from fixture', description: 'Pre-oriented gravity chute feed barrel pickup', baseTime: 1.9, cv: 8, type: 'MANUAL' },
  { name: 'Insert ink refill into barrel', description: 'Slide refill using funnel guide fixture', baseTime: 3.8, cv: 9, type: 'MANUAL' },
  { name: 'Fit compression spring over refill', description: 'Pre-assembled spring dispenser pickup', baseTime: 2.7, cv: 9, type: 'MANUAL' },
  { name: 'Fit writing tip / nose cone', description: 'Fast-lead thread tightening with pneumatic jig', baseTime: 4.2, cv: 8, type: 'MANUAL' },
  { name: 'Fit cap / clip assembly', description: 'Pre-subassembled cap and clip unit insertion', baseTime: 3.1, cv: 7, type: 'MANUAL' },
  { name: 'Fit push button / clicker', description: 'Snap-lock mechanism engagement', baseTime: 4.6, cv: 8, type: 'MANUAL' },
  { name: 'Screw threaded cap assembly', description: 'Torque-limited motorized driver engagement', baseTime: 3.4, cv: 7, type: 'MANUAL' },
  { name: 'Functional click & writing test', description: 'Standardized single-click sensor inspection pad', baseTime: 5.4, cv: 10, type: 'MANUAL' },
  { name: 'Place completed pen in finished tray', description: 'Direct drop into cushioned slide chute', baseTime: 2.1, cv: 6, type: 'MANUAL' },
];

export async function seedDatabase() {
  console.log('🌱 Clearing existing study data...');
  await prisma.observation.deleteMany({});
  await prisma.rating.deleteMany({});
  await prisma.allowance.deleteMany({});
  await prisma.result.deleteMany({});
  await prisma.element.deleteMany({});
  await prisma.study.deleteMany({});

  console.log('🌱 Seeding Pen Assembly baseline and improved studies...');

  // 1. BEFORE Improvement Study
  const beforeStudy = await prisma.study.create({
    data: {
      name: 'Manual Pen Assembly - Baseline Study (BEFORE)',
      productModel: 'Retractable Ballpoint Pen Model Pro-X',
      workstation: 'Manual Station WS-01',
      operator: 'Ravi Kumar (Operator A)',
      date: new Date('2024-09-10'),
      shift: 'Shift 1 (08:00 - 16:30)',
      method: 'BEFORE',
      description: 'Initial time study conducted on manual pen assembly without fixtures or standard work layout. Significant reach distances and variable method observed.',
      targetCycle: 30,
    },
  });

  const beforeElements = [];
  for (let i = 0; i < PEN_ELEMENTS_BEFORE.length; i++) {
    const el = await prisma.element.create({
      data: {
        studyId: beforeStudy.id,
        name: PEN_ELEMENTS_BEFORE[i].name,
        description: PEN_ELEMENTS_BEFORE[i].description,
        type: PEN_ELEMENTS_BEFORE[i].type,
        order: i + 1,
        startPoint: 'Grasp part',
        endPoint: 'Release or align',
      },
    });
    beforeElements.push(el);
  }

  // 30 cycles of observations for BEFORE
  const CYCLES = 30;
  for (let c = 1; c <= CYCLES; c++) {
    for (let e = 0; e < beforeElements.length; e++) {
      const el = beforeElements[e];
      const baseEl = PEN_ELEMENTS_BEFORE[e];
      const [time] = generateObservations(baseEl.baseTime, baseEl.cv, 1);
      await prisma.observation.create({
        data: {
          studyId: beforeStudy.id,
          elementId: el.id,
          cycleNumber: c,
          observedTime: time,
        },
      });
    }
  }

  // Westinghouse ratings for BEFORE study (overall ~95% rating)
  for (const el of beforeElements) {
    await prisma.rating.create({
      data: {
        studyId: beforeStudy.id,
        elementId: el.id,
        system: 'WESTINGHOUSE',
        skillRating: -0.05,     // Fair skill
        effortRating: 0.00,      // Average effort
        conditionRating: 0.00,   // Average conditions
        consistencyRating: 0.00, // Average consistency
        ratingPercent: 95,
      },
    });
  }

  // Allowance: Personal 5% + Fatigue 4% + Delay 2% + Special 1% = 12%
  await prisma.allowance.create({
    data: {
      studyId: beforeStudy.id,
      personal: 5,
      fatigue: 4,
      delay: 2,
      special: 1,
      totalPercent: 12,
      formula: 'ADDITIVE',
    },
  });

  // 2. AFTER Improvement Study
  const afterStudy = await prisma.study.create({
    data: {
      name: 'Manual Pen Assembly - Optimized Method (AFTER)',
      productModel: 'Retractable Ballpoint Pen Model Pro-X',
      workstation: 'Ergonomic Station WS-01 (With Fixtures & Chutes)',
      operator: 'Ravi Kumar (Operator A - Trained)',
      date: new Date('2024-10-05'),
      shift: 'Shift 1 (08:00 - 16:30)',
      method: 'AFTER',
      description: 'Post-improvement study after motion economy redesign. Gravity bins, funnel guides, snap jigs, and shortened reach envelope implemented.',
      targetCycle: 30,
    },
  });

  const afterElements = [];
  for (let i = 0; i < PEN_ELEMENTS_AFTER.length; i++) {
    const el = await prisma.element.create({
      data: {
        studyId: afterStudy.id,
        name: PEN_ELEMENTS_AFTER[i].name,
        description: PEN_ELEMENTS_AFTER[i].description,
        type: PEN_ELEMENTS_AFTER[i].type,
        order: i + 1,
        startPoint: 'Pick with guide',
        endPoint: 'Snap into place',
      },
    });
    afterElements.push(el);
  }

  for (let c = 1; c <= CYCLES; c++) {
    for (let e = 0; e < afterElements.length; e++) {
      const el = afterElements[e];
      const baseEl = PEN_ELEMENTS_AFTER[e];
      const [time] = generateObservations(baseEl.baseTime, baseEl.cv, 1);
      await prisma.observation.create({
        data: {
          studyId: afterStudy.id,
          elementId: el.id,
          cycleNumber: c,
          observedTime: time,
        },
      });
    }
  }

  // Westinghouse ratings for AFTER study (rating ~112%)
  for (const el of afterElements) {
    await prisma.rating.create({
      data: {
        studyId: afterStudy.id,
        elementId: el.id,
        system: 'WESTINGHOUSE',
        skillRating: 0.06,      // Good skill
        effortRating: 0.05,     // Good effort
        conditionRating: 0.02,  // Good conditions
        consistencyRating: 0.01,// Good consistency
        ratingPercent: 114,
      },
    });
  }

  // Allowance: Personal 5% + Fatigue 3% + Delay 1% = 9%
  await prisma.allowance.create({
    data: {
      studyId: afterStudy.id,
      personal: 5,
      fatigue: 3,
      delay: 1,
      special: 0,
      totalPercent: 9,
      formula: 'ADDITIVE',
    },
  });

  // Seed allowance presets
  const presets = [
    { name: 'Light Pen Bench Assembly (ILO Standard)', personal: 5, fatigue: 4, delay: 2, special: 0, description: 'Seated manual bench work with good lighting and ventilation', isDefault: true },
    { name: 'High-Pace Production Line', personal: 5, fatigue: 6, delay: 2, special: 1, description: 'Paced assembly line with intermittent standing', isDefault: false },
    { name: 'Precision Inspection & Assembly', personal: 5, fatigue: 5, delay: 1, special: 2, description: 'High visual acuity requirement for small parts and sub-assemblies', isDefault: false },
  ];

  for (const p of presets) {
    await prisma.allowancePreset.upsert({
      where: { name: p.name },
      update: p,
      create: p,
    });
  }

  console.log('✅ Realistic Pen Assembly dataset seeded successfully!');
}

async function main() {
  await seedDatabase();
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
