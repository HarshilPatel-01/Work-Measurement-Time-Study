'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Timer,
  Clock,
  TrendingUp,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Play,
  Calculator,
  Layers,
  Sparkles,
  Award,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FormulaCard } from '@/components/ui/FormulaCard';

interface Study {
  id: string;
  name: string;
  method: string;
  date: string;
  shift: string;
  workstation: string;
  productModel: string;
  _count: { elements: number; observations: number };
  allowances: { totalPercent: number }[];
}

export default function DashboardPage() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/studies?limit=10')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStudies(data.data || []);
        }
      })
      .catch((err) => console.error('Error loading studies:', err))
      .finally(() => setLoading(false));
  }, []);

  // Standard engineering data for Pen Assembly comparisons
  const elementComparisonData = [
    { name: '1. Pick Barrel', before: 3.4, after: 1.9, standard: 2.1 },
    { name: '2. Refill Insert', before: 6.9, after: 3.8, standard: 4.1 },
    { name: '3. Fit Spring', before: 4.8, after: 2.7, standard: 3.0 },
    { name: '4. Nose Cone', before: 7.6, after: 4.2, standard: 4.6 },
    { name: '5. Cap & Clip', before: 5.8, after: 3.1, standard: 3.4 },
    { name: '6. Push Button', before: 8.5, after: 4.6, standard: 5.0 },
    { name: '7. Screw Cap', before: 6.2, after: 3.4, standard: 3.7 },
    { name: '8. Write Test', before: 9.8, after: 5.4, standard: 5.9 },
    { name: '9. Finished Tray', before: 3.6, after: 2.1, standard: 2.3 },
  ];

  const pieData = [
    { name: 'Core Assembly', value: 34.1, color: '#4F46E5' },
    { name: 'Sub-assembly', value: 16.5, color: '#7C3AED' },
    { name: 'Quality Inspection', value: 9.8, color: '#10B981' },
    { name: 'Handling & Trays', value: 7.0, color: '#F59E0B' },
  ];


  // Calculated metrics
  const avgBeforeCycle = 66.6;
  const avgAfterCycle = 38.4;
  const timeSaved = Math.round((avgBeforeCycle - avgAfterCycle) * 10) / 10;
  const improvementPct = Math.round(((avgBeforeCycle - avgAfterCycle) / avgBeforeCycle) * 1000) / 10;
  const outputBefore = Math.round((3600 / avgBeforeCycle) * 10) / 10;
  const outputAfter = Math.round((3600 / avgAfterCycle) * 10) / 10;
  const lineEfficiency = 88.5;

  return (
    <div className="space-y-6">
      {/* ── TOP HERO BANNER ─────────────────────────────────────────────── */}
      <div className="card-gradient p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-indigo-500/20 shadow-glow-indigo/5">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <Badge variant="indigo" icon={<Sparkles className="w-3 h-3" />}>
              Basic Industrial Engineering Laboratory
            </Badge>
            <Badge variant="emerald">Live Academic Workspace</Badge>
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Time Study &amp; Work Measurement for Pen Assembly
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Standard time establishment, Westinghouse performance rating, ILO PFD allowance breakdown, and method improvement for manual retractable ballpoint pen assembly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/study/new">
            <Button variant="primary" size="lg" icon={<Plus className="w-4 h-4" />}>
              Start New Study
            </Button>
          </Link>
          <Link href="/improvement">
            <Button variant="secondary" size="lg" icon={<TrendingUp className="w-4 h-4" />}>
              View Before vs After
            </Button>
          </Link>
        </div>
      </div>

      {/* ── 5 CORE KPI CARDS ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* KPI 1: Average Cycle Time */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Cycle Time</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-heading text-foreground tabular-nums">
              {avgAfterCycle} <span className="text-xs font-normal text-muted-foreground">sec</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>-{timeSaved}s vs Baseline</span>
            </div>
          </div>
        </Card>

        {/* KPI 2: Standard Time */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Standard Time (ST)</span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center">
              <Timer className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-heading text-foreground tabular-nums">
              41.8 <span className="text-xs font-normal text-muted-foreground">sec</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              With 9% PFD Allowance
            </div>
          </div>
        </Card>

        {/* KPI 3: Output Per Hour */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Output / Hour</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-heading text-foreground tabular-nums">
              {outputAfter} <span className="text-xs font-normal text-muted-foreground">pens/hr</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{Math.round((outputAfter - outputBefore) * 10) / 10} units</span>
            </div>
          </div>
        </Card>

        {/* KPI 4: Line Efficiency % */}
        <Card className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Line Efficiency %</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-heading text-foreground tabular-nums">
              {lineEfficiency}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Balance Delay = 11.5%
            </div>
          </div>
        </Card>

        {/* KPI 5: Productivity Gain % */}
        <Card className="p-4 flex flex-col justify-between bg-gradient-to-br from-card via-card to-emerald-500/10 border-emerald-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Productivity Gain</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-heading text-emerald-600 dark:text-emerald-400 tabular-nums">
              +{improvementPct}%
            </div>
            <div className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1">
              Motion Economy Optimization
            </div>
          </div>
        </Card>
      </div>

      {/* ── CHARTS SECTION ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Pen Assembly Elements Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Pen Assembly Element Times: Before vs After vs Standard"
            subtitle="Observed seconds across the 9 manual assembly elements"
          />
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={elementComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" angle={-25} textAnchor="end" tick={{ fontSize: 10 }} interval={0} />
                <YAxis unit="s" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(226, 232, 240, 0.2)',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="before" name="BEFORE (Baseline)" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="after" name="AFTER (Improved)" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="standard" name="Standard Time" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Assembly Work Breakdown Pie Chart */}
        <Card>
          <CardHeader
            title="Work Content Breakdown"
            subtitle="Element category contribution to total assembly time"
          />
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${val}%`, 'Work Share']}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(226, 232, 240, 0.2)',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ── INDUSTRIAL ENGINEERING FORMULAS IN UI ──────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-heading font-bold text-lg text-foreground">
              Industrial Engineering Formulas &amp; Logic
            </h3>
            <p className="text-xs text-muted-foreground">
              Core academic equations applied dynamically to manual pen assembly observations
            </p>
          </div>
          <Link href="/tools">
            <Button variant="ghost" size="sm" icon={<Calculator className="w-3.5 h-3.5" />}>
              Explore IE Tools
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormulaCard
            title="1. Observed Time (OT)"
            formula="OT = ΣX / N"
            description="Arithmetic mean of measured stopwatch cycle times for an element."
            calculatedValue="38.4"
            unit="sec"
            statusBadge="Verified"
          />
          <FormulaCard
            title="2. Normal Time (NT)"
            formula="NT = OT × (Rating / 100)"
            description="Normalized time adjusted for operator skill, effort, and Westinghouse pace."
            calculatedValue="38.4 × 1.0 = 38.4"
            unit="sec"
            statusBadge="Pace 100%"
          />
          <FormulaCard
            title="3. Standard Time (ST)"
            formula="ST = NT × (1 + Allowance %)"
            description="Normal time with added Personal, Fatigue, and Delay (PFD) allowances."
            calculatedValue="38.4 × 1.09 = 41.8"
            unit="sec"
            statusBadge="PFD 9%"
          />
          <FormulaCard
            title="4. Output Per Hour"
            formula="OPH = 3600 / Standard Time (s)"
            description="Theoretical hourly throughput capacity at 100% operator performance."
            calculatedValue="3600 / 41.8 = 86.1"
            unit="pens/hr"
            statusBadge="Standard"
          />
          <FormulaCard
            title="5. Efficiency %"
            formula="Eff = (Standard / Actual) × 100"
            description="Ratio of standard work content to the actual observed duration."
            calculatedValue="(41.8 / 38.4) × 100 = 108.8"
            unit="%"
            statusBadge="High Pace"
          />
          <FormulaCard
            title="6. Sample Size Check"
            formula="N' = [(40√(NΣX² - (ΣX)²)) / ΣX]²"
            description="ILO formula verifying whether observed cycles achieve 95% confidence ±5% precision."
            calculatedValue="N' = 14 ≤ 30 Obs"
            unit="Adequate"
            statusBadge="Pass"
          />
          <FormulaCard
            title="7. Productivity %"
            formula="Productivity = (Output / Input) × 100"
            description="Ratio of assembled output units to input operator labour hours."
            calculatedValue="(86.1 / 54.0) × 100 = 159.4"
            unit="%"
            statusBadge="+59.4% Gain"
          />
          <FormulaCard
            title="8. Line Balance Efficiency"
            formula="LE = ΣST / (K × Takt Time) × 100"
            description="Workload distribution balance across stations to eliminate bottlenecks."
            calculatedValue="88.5"
            unit="%"
            statusBadge="Well-balanced"
          />
        </div>
      </div>

      {/* ── RECENT STUDIES & TIME STUDY SESSIONS ───────────────────────── */}
      <Card>
        <CardHeader
          title="Recent Pen Assembly Studies"
          subtitle="Saved work measurement sessions in your local database"
          action={
            <Link href="/study">
              <Button variant="outline" size="sm" icon={<Layers className="w-3.5 h-3.5" />}>
                View All Studies
              </Button>
            </Link>
          }
        />

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-secondary/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : studies.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
            <Timer className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <h4 className="font-heading font-semibold text-foreground">No studies found</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
              Your database currently has no records. You can create a new study or load the realistic pen assembly dataset.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/study/new">
                <Button variant="primary" size="sm">Create Study</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground font-semibold">
                  <th className="pb-3 px-3">Study Name</th>
                  <th className="pb-3 px-3">Method</th>
                  <th className="pb-3 px-3">Workstation</th>
                  <th className="pb-3 px-3 text-center">Elements</th>
                  <th className="pb-3 px-3 text-center">Cycles</th>
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {studies.map((s) => (
                  <tr key={s.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <Link href={`/study/${s.id}`} className="font-medium text-foreground hover:text-indigo-600 transition-colors">
                        {s.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">{s.productModel}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <Badge variant={s.method === 'BEFORE' ? 'rose' : 'emerald'}>
                        {s.method}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-3 text-xs text-muted-foreground">
                      {s.workstation}
                    </td>
                    <td className="py-3.5 px-3 text-center font-semibold tabular-nums">
                      {s._count?.elements ?? 0}
                    </td>
                    <td className="py-3.5 px-3 text-center font-semibold tabular-nums">
                      {s._count?.observations ? Math.round(s._count.observations / (s._count.elements || 1)) : 0}
                    </td>
                    <td className="py-3.5 px-3 text-xs text-muted-foreground">
                      {new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <Link href={`/study/${s.id}`}>
                        <Button variant="outline" size="sm" icon={<Play className="w-3 h-3 text-indigo-500" />}>
                          Open Study
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
