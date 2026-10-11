'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, FileSpreadsheet } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function AnalysisPage() {
  // Capacity planning state
  const [operators, setOperators] = useState<number>(3);
  const [shiftHours, setShiftHours] = useState<number>(8);
  const [lineEfficiency, setLineEfficiency] = useState<number>(88);
  const standardTimePerPen = 41.8; // seconds

  const grossSeconds = operators * shiftHours * 3600;
  const effectiveSeconds = grossSeconds * (lineEfficiency / 100);
  const dailyOutput = Math.round(effectiveSeconds / standardTimePerPen);
  const pensPerOperator = Math.round(dailyOutput / operators);

  const recommendations = [
    {
      severity: 'HIGH',
      badge: 'Bottleneck',
      title: 'Functional Click & Write Test (Element 8)',
      detail: 'Measured at 5.4s standard time. This is currently the pacing element of the assembly line.',
      action: 'Implement an automated dual-contact sensor testing fixture to bring test cycle time below 2.5s.',
    },
    {
      severity: 'HIGH',
      badge: 'Method Economy',
      title: 'Push Button & Clicker Mechanism Insertion',
      detail: 'Highest variance observed (CV = 18.2%) due to tight mechanical tolerances during manual alignment.',
      action: 'Introduce a chamfered locating guide block on the assembly fixture to standardize insertion angle.',
    },
    {
      severity: 'MEDIUM',
      badge: 'Line Balancing',
      title: 'Station 2 Balancing Delay',
      detail: 'Workstation 2 exhibits 2.8s of idle time per cycle compared to the pacing takt time of 12s.',
      action: 'Transfer secondary visual inspection of barrel imprint to Station 2 to utilize spare operator capacity.',
    },
    {
      severity: 'LOW',
      badge: 'Material Delivery',
      title: 'Pre-assembled Cap and Pocket Clip',
      detail: 'Pre-assembling the pocket clip onto the cap at sub-assembly reduces main line handling time by 42%.',
      action: 'Maintain batch size of 200 pre-clipped caps in gravity feed dispensers.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── TOP HERO BANNER ─────────────────────────────────────────────── */}
      <div className="card-gradient p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-indigo-500/20">
        <div className="space-y-2 max-w-2xl">
          <Badge variant="emerald" icon={<Sparkles className="w-3 h-3" />}>
            Automated Engineering Insights
          </Badge>
          <h2 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Productivity Analysis &amp; Recommendations
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Rule-based industrial engineering intelligence identifying bottlenecks, motion waste, statistical variations, and theoretical production line capacity for manual pen assembly.
          </p>
        </div>

        <Link href="/reports">
          <Button variant="primary" icon={<FileSpreadsheet className="w-4 h-4" />}>
            Export Full Analysis
          </Button>
        </Link>
      </div>

      {/* ── CAPACITY PLANNING CALCULATOR ───────────────────────────────── */}
      <Card>
        <CardHeader
          title="Assembly Line Capacity Planning Calculator"
          subtitle="Simulate shift throughput based on operator count, working hours, and line balance efficiency"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
              Workstation Operators
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={operators}
              onChange={(e) => setOperators(parseInt(e.target.value) || 1)}
              className="input-field tabular-nums text-base font-bold"
            />
            <span className="text-[11px] text-muted-foreground mt-1 block">Number of assembly workers</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
              Shift Length (Hours)
            </label>
            <input
              type="number"
              min="1"
              max="16"
              value={shiftHours}
              onChange={(e) => setShiftHours(parseFloat(e.target.value) || 8)}
              className="input-field tabular-nums text-base font-bold"
            />
            <span className="text-[11px] text-muted-foreground mt-1 block">Net scheduled shift duration</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
              Line Balancing Efficiency %
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="50"
                max="100"
                value={lineEfficiency}
                onChange={(e) => setLineEfficiency(parseFloat(e.target.value) || 85)}
                className="input-field tabular-nums text-base font-bold"
              />
              <span className="text-sm font-semibold text-foreground">%</span>
            </div>
            <span className="text-[11px] text-muted-foreground mt-1 block">Accounts for balance delay &amp; pacing</span>
          </div>
        </div>

        {/* Output KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border">
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase">Daily Output Throughput</span>
            <div className="text-3xl font-bold font-heading text-foreground tabular-nums mt-1">
              {dailyOutput.toLocaleString()} pens
            </div>
            <span className="text-xs text-muted-foreground mt-1 block">Across {shiftHours}h shift</span>
          </div>

          <div className="p-4 rounded-xl bg-secondary/50 border border-border text-center">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Throughput Per Operator</span>
            <div className="text-3xl font-bold font-heading text-foreground tabular-nums mt-1">
              {pensPerOperator.toLocaleString()} pens
            </div>
            <span className="text-xs text-muted-foreground mt-1 block">Productivity per person</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Hourly Output Rate</span>
            <div className="text-3xl font-bold font-heading text-emerald-600 dark:text-emerald-400 tabular-nums mt-1">
              {Math.round(dailyOutput / shiftHours)} pens/hr
            </div>
            <span className="text-xs text-muted-foreground mt-1 block">At standard performance</span>
          </div>
        </div>
      </Card>

      {/* ── AUTOMATED ENGINEERING RECOMMENDATIONS ──────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-lg text-foreground">
              Engineering Recommendations &amp; Bottlenecks
            </h3>
            <p className="text-xs text-muted-foreground">
              Automated heuristics derived from cycle time variance and standard work content
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, i) => (
            <Card key={i} className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant={rec.severity === 'HIGH' ? 'rose' : rec.severity === 'MEDIUM' ? 'amber' : 'indigo'}>
                    {rec.badge}
                  </Badge>
                  <span className="text-[11px] font-semibold text-muted-foreground">Priority: {rec.severity}</span>
                </div>

                <h4 className="font-heading font-semibold text-base text-foreground mt-2">
                  {rec.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {rec.detail}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/80 bg-secondary/30 rounded-xl p-3">
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase block mb-1">
                  Proposed Solution:
                </span>
                <p className="text-xs text-foreground font-medium">
                  {rec.action}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

