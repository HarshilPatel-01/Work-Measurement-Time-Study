'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sliders, ArrowRight } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { calculatePFD, standardTime } from '@/lib/calc';

export default function AllowancesPage() {
  const [personal, setPersonal] = useState<number>(5.0);
  const [fatigue, setFatigue] = useState<number>(4.0);
  const [delay, setDelay] = useState<number>(1.0);
  const [special, setSpecial] = useState<number>(0.0);
  const [baseNormalTime, setBaseNormalTime] = useState<number>(38.4);
  const formulaMode = 'ADDITIVE' as const;

  const totalAllowance = calculatePFD(personal, fatigue, delay, special);
  const computedST = standardTime(baseNormalTime, totalAllowance, formulaMode);
  const allowanceAddedSeconds = computedST - baseNormalTime;

  const presets = [
    { name: 'ILO Standard Light Bench (Default)', p: 5.0, f: 4.0, d: 1.0, s: 0.0, desc: 'Normal seated pen assembly in well-lit, ventilated room' },
    { name: 'Moderate Standing Line', p: 5.0, f: 6.0, d: 2.0, s: 0.0, desc: 'Standing workbench with repetitive arm reach' },
    { name: 'High Precision Inspection', p: 5.0, f: 5.0, d: 1.0, s: 2.0, desc: 'High visual strain micro-assembly requirement' },
    { name: 'Hot / Non-AC Industrial Shop', p: 7.0, f: 7.0, d: 2.0, s: 1.0, desc: 'Elevated ambient temperature causing higher fatigue' },
  ];

  return (
    <div className="space-y-6">
      {/* ── TOP BANNER ─────────────────────────────────────────────────── */}
      <div className="card-gradient p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-indigo-500/20">
        <div className="space-y-2 max-w-2xl">
          <Badge variant="indigo" icon={<Sliders className="w-3 h-3" />}>
            Work Measurement Guidelines
          </Badge>
          <h2 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            PFD Allowance Calculator
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Determine standard allowances for Personal needs (P), Basic &amp; variable Fatigue (F), and Unavoidable Delays (D) following ILO International Labour Office recommendations.
          </p>
        </div>

        <Link href="/study">
          <Button variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
            Apply to Time Studies
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Sliders Panel */}
        <Card className="lg:col-span-2 space-y-6">
          <CardHeader
            title="Interactive Allowance Breakdown (PFD)"
            subtitle="Adjust percentage components and inspect impact on Standard Time"
          />

          {/* Preset Buttons */}
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Load Recommended ILO Presets:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((pr) => (
                <button
                  key={pr.name}
                  onClick={() => {
                    setPersonal(pr.p);
                    setFatigue(pr.f);
                    setDelay(pr.d);
                    setSpecial(pr.s);
                  }}
                  className="p-2.5 text-left rounded-xl bg-secondary/50 hover:bg-secondary border border-border transition-all text-xs"
                >
                  <span className="font-semibold text-foreground block">{pr.name}</span>
                  <span className="text-[11px] text-muted-foreground line-clamp-1">{pr.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5 pt-4 border-t border-border">
            {/* 1. Personal Allowance */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-foreground">1. Personal Needs Allowance (P)</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">{personal.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="2"
                max="12"
                step="0.5"
                value={personal}
                onChange={(e) => setPersonal(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-[11px] text-muted-foreground">Standard ILO baseline: 5% (drinking water, restroom, personal comfort).</span>
            </div>

            {/* 2. Basic Fatigue */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-foreground">2. Basic &amp; Variable Fatigue Allowance (F)</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">{fatigue.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="2"
                max="15"
                step="0.5"
                value={fatigue}
                onChange={(e) => setFatigue(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-[11px] text-muted-foreground">Compensates physiological recovery from light bench assembly and eye strain.</span>
            </div>

            {/* 3. Delay Allowance */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-foreground">3. Unavoidable Delay Allowance (D)</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">{delay.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="0.5"
                value={delay}
                onChange={(e) => setDelay(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-[11px] text-muted-foreground">Covers minor parts bin replenishments, defective parts rejection, and supervisor briefs.</span>
            </div>

            {/* 4. Special Policy Allowance */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-foreground">4. Special / Environmental Allowance</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">{special.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={special}
                onChange={(e) => setSpecial(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-[11px] text-muted-foreground">Policy allowance for training or exceptional shop floor temperature.</span>
            </div>
          </div>
        </Card>

        {/* Live Calculation Output Card */}
        <Card className="flex flex-col justify-between p-6 bg-gradient-to-br from-card via-card to-indigo-500/10 border-indigo-500/20">
          <div>
            <CardHeader
              title="Standard Time Result"
              subtitle="Live allowance conversion"
            />

            <div className="space-y-4 my-4">
              <div className="p-3 rounded-xl bg-secondary/50 border border-border">
                <span className="text-xs text-muted-foreground font-semibold block">Total PFD Allowance (A)</span>
                <div className="text-3xl font-bold font-heading text-indigo-600 dark:text-indigo-400 tabular-nums mt-1">
                  {totalAllowance.toFixed(1)}%
                </div>
                <span className="text-xs text-muted-foreground mt-0.5 block">
                  Multiplier: ×{(1 + totalAllowance / 100).toFixed(3)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Sample Normal Time (NT):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={baseNormalTime}
                    onChange={(e) => setBaseNormalTime(parseFloat(e.target.value) || 38.4)}
                    className="input-field text-sm font-semibold tabular-nums"
                  />
                  <span className="text-xs font-semibold text-foreground">sec</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase block">
                  Resulting Standard Time (ST):
                </span>
                <div className="text-3xl font-bold font-heading text-foreground tabular-nums mt-1">
                  {computedST.toFixed(2)}s
                </div>
                <span className="text-xs text-muted-foreground mt-1 block">
                  +{allowanceAddedSeconds.toFixed(2)}s added as rest and personal allowance
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground block mb-1">Formula Applied:</span>
            <code className="text-indigo-600 dark:text-indigo-400 font-mono font-semibold">
              ST = NT × (1 + {totalAllowance.toFixed(1)}/100)
            </code>
          </div>
        </Card>
      </div>
    </div>
  );
}

