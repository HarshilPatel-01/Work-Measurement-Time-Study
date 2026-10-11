'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { calculateImprovement } from '@/lib/calc';

export default function ImprovementPage() {

  // Baseline standard values for Pen Assembly
  const beforeST = 66.6;
  const afterST = 38.4;
  const metrics = calculateImprovement(beforeST, afterST);

  const beforeElements = [
    { name: '1. Pick barrel from bin', time: 3.4, note: 'Loose box reaching' },
    { name: '2. Insert refill', time: 6.9, note: 'Manual orientation' },
    { name: '3. Fit spring', time: 4.8, note: 'Tangled springs' },
    { name: '4. Nose cone', time: 7.6, note: 'Difficult threading' },
    { name: '5. Cap & clip', time: 5.8, note: 'Two-hand alignment' },
    { name: '6. Push button', time: 8.5, note: 'Tight tolerance push' },
    { name: '7. Screw cap', time: 6.2, note: 'Manual wrist twist' },
    { name: '8. Write test', time: 9.8, note: 'Multiple scribble strokes' },
    { name: '9. Finished tray', time: 3.6, note: 'Long reach drop' },
  ];

  const afterElements = [
    { name: '1. Pick barrel from fixture', time: 1.9, note: 'Gravity chute dispenser' },
    { name: '2. Insert refill', time: 3.8, note: 'Funnel guide jig' },
    { name: '3. Fit spring', time: 2.7, note: 'Pre-separated tray' },
    { name: '4. Nose cone', time: 4.2, note: 'Pre-threaded locator' },
    { name: '5. Cap & clip', time: 3.1, note: 'Pre-assembled sub-unit' },
    { name: '6. Push button', time: 4.6, note: 'Snap fixture lever' },
    { name: '7. Screw cap', time: 3.4, note: 'Semi-auto torque tool' },
    { name: '8. Write test', time: 5.4, note: 'Single click sensor pad' },
    { name: '9. Finished tray', time: 2.1, note: 'Adjacent slide chute' },
  ];

  const chartData = beforeElements.map((b, i) => ({
    name: b.name.split(' ')[1] || b.name,
    before: b.time,
    after: afterElements[i]?.time || 0,
    saved: Math.round((b.time - (afterElements[i]?.time || 0)) * 10) / 10,
  }));

  return (
    <div className="space-y-6">
      {/* ── TOP HERO BANNER ─────────────────────────────────────────────── */}
      <div className="card-gradient p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-indigo-500/20">
        <div className="space-y-2 max-w-2xl">
          <Badge variant="emerald" icon={<Sparkles className="w-3 h-3" />}>
            Motion Economy &amp; Productivity Analysis
          </Badge>
          <h2 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Before vs After Method Improvement
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Quantify process engineering gains achieved by introducing gravity chutes, assembly fixtures, shortened reaches, and ergonomic workstation layouts for manual pen assembly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/reports">
            <Button variant="outline" icon={<FileSpreadsheet className="w-4 h-4" />}>
              Export Comparison
            </Button>
          </Link>
          <Link href="/study/new">
            <Button variant="primary" icon={<TrendingUp className="w-4 h-4" />}>
              New Comparative Study
            </Button>
          </Link>
        </div>
      </div>

      {/* ── 4 KEY COMPARISON STATS ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Cycle Time Saved
          </span>
          <div className="mt-3">
            <div className="text-3xl font-bold font-heading text-emerald-600 dark:text-emerald-400 tabular-nums">
              {metrics.timeSavedSeconds.toFixed(1)}s
            </div>
            <span className="text-xs text-muted-foreground mt-1 block">
              From {beforeST}s down to {afterST}s per pen
            </span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Cycle Time Reduction
          </span>
          <div className="mt-3">
            <div className="text-3xl font-bold font-heading text-indigo-600 dark:text-indigo-400 tabular-nums">
              -{metrics.improvementPercent.toFixed(1)}%
            </div>
            <span className="text-xs text-muted-foreground mt-1 block">
              Faster production cycle duration
            </span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Throughput Increase
          </span>
          <div className="mt-3">
            <div className="text-3xl font-bold font-heading text-emerald-600 dark:text-emerald-400 tabular-nums">
              +{metrics.additionalOutputPerHour.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">pens/hr</span>
            </div>
            <span className="text-xs text-muted-foreground mt-1 block">
              Growth from {metrics.beforeOutputPerHour.toFixed(1)} to {metrics.afterOutputPerHour.toFixed(1)} units/hr
            </span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Labour Productivity Gain
          </span>
          <div className="mt-3">
            <div className="text-3xl font-bold font-heading text-foreground tabular-nums">
              +{metrics.efficiencyGainPercent.toFixed(1)}%
            </div>
            <span className="text-xs text-muted-foreground mt-1 block">
              Output gain per operator hour worked
            </span>
          </div>
        </Card>
      </div>

      {/* ── COMPARISON BAR CHART ────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Element-by-Element Time Comparison (Seconds)"
          subtitle="Red: Baseline loose picking | Green: Improved with gravity chutes & jigs"
        />
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
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
              <Bar dataKey="before" name="BEFORE Improvement (s)" fill="#F43F5E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="after" name="AFTER Improvement (s)" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* ── SIDE-BY-SIDE METHOD STUDY TABLE ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BEFORE METHOD */}
        <Card className="border-rose-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="rose">BEFORE</Badge>
              <h3 className="font-heading font-bold text-base text-foreground">Baseline Manual Method</h3>
            </div>
            <span className="text-sm font-bold font-heading text-rose-600 dark:text-rose-400 tabular-nums">
              {beforeST} sec
            </span>
          </div>

          <div className="space-y-2.5">
            {beforeElements.map((el, i) => (
              <div key={i} className="p-3 rounded-xl bg-secondary/40 border border-border/80 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-semibold text-foreground block">{el.name}</span>
                  <span className="text-muted-foreground">{el.note}</span>
                </div>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                  {el.time.toFixed(1)}s
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* AFTER METHOD */}
        <Card className="border-emerald-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="emerald">AFTER</Badge>
              <h3 className="font-heading font-bold text-base text-foreground">Optimized Ergonomic Method</h3>
            </div>
            <span className="text-sm font-bold font-heading text-emerald-600 dark:text-emerald-400 tabular-nums">
              {afterST} sec
            </span>
          </div>

          <div className="space-y-2.5">
            {afterElements.map((el, i) => (
              <div key={i} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-semibold text-foreground block">{el.name}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">{el.note}</span>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {el.time.toFixed(1)}s
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── ENGINEERING MOTION ECONOMY PRINCIPLES APPLIED ──────────────── */}
      <Card>
        <CardHeader
          title="Motion Economy &amp; Workstation Redesign Implementation"
          subtitle="Specific Barnes principles applied to reduce pen assembly cycle times"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 font-bold flex items-center justify-center text-sm">
              1
            </div>
            <h4 className="font-heading font-semibold text-sm text-foreground">Gravity Feed Dispensers</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Barrels and ink refills are delivered automatically to fixed pick points at normal working area (300mm), eliminating searching in deep boxes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-500 font-bold flex items-center justify-center text-sm">
              2
            </div>
            <h4 className="font-heading font-semibold text-sm text-foreground">Guiding &amp; Holding Jigs</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Funnel guide fixtures allow blind, one-motion insertion of springs and refills into the barrel, preventing fumbling and alignment delays.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center text-sm">
              3
            </div>
            <h4 className="font-heading font-semibold text-sm text-foreground">Drop Chute Discharge</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Finished pens are dropped directly into a padded slide chute immediately adjacent to testing pad, saving 1.5 seconds per pen on reach travel.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

