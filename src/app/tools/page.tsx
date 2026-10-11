'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Cpu,
  FileSpreadsheet,
} from 'lucide-react';
import {
  Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Legend
} from 'recharts';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { lineBalanceLCR, calculatePareto } from '@/lib/calc';

export default function IEToolsPage() {
  const [activeTab, setActiveTab] = useState<'opc' | 'fpc' | 'pareto' | 'balancing'>('opc');
  const [taktTime, setTaktTime] = useState<number>(12); // 12 seconds takt time

  // Pen Assembly Elements
  const penElements = [
    { id: 'e1', name: 'Pick barrel from bin', standardTime: 2.1, type: 'OPERATION', symbol: '○' },
    { id: 'e2', name: 'Insert ink refill into barrel', standardTime: 4.2, type: 'OPERATION', symbol: '○' },
    { id: 'e3', name: 'Fit compression spring', standardTime: 3.0, type: 'OPERATION', symbol: '○' },
    { id: 'e4', name: 'Fit writing tip / nose cone', standardTime: 4.6, type: 'OPERATION', symbol: '○' },
    { id: 'e5', name: 'Fit cap / clip assembly', standardTime: 3.4, type: 'OPERATION', symbol: '○' },
    { id: 'e6', name: 'Fit push button / clicker', standardTime: 5.0, type: 'OPERATION', symbol: '○' },
    { id: 'e7', name: 'Screw threaded cap assembly', standardTime: 3.7, type: 'OPERATION', symbol: '○' },
    { id: 'e8', name: 'Functional click & write test', standardTime: 5.9, type: 'INSPECTION', symbol: '□' },
    { id: 'e9', name: 'Place in tray / packaging', standardTime: 2.3, type: 'OPERATION', symbol: '○' },
  ];

  // Flow Process Chart Steps (Material: Ballpoint Pen Components)
  const fpcSteps = [
    { step: 1, desc: 'Barrels stored in component rack', event: 'STORAGE', symbol: '▽', dist: '-', time: '-' },
    { step: 2, desc: 'Transport barrels to workbench WS-01', event: 'TRANSPORT', symbol: '⇨', dist: '5.0 m', time: '12 s' },
    { step: 3, desc: 'Pick barrel and position in jig', event: 'OPERATION', symbol: '○', dist: '0.3 m', time: '2.1 s' },
    { step: 4, desc: 'Insert refill into barrel housing', event: 'OPERATION', symbol: '○', dist: '0.2 m', time: '4.2 s' },
    { step: 5, desc: 'Wait for spring dispenser batch', event: 'DELAY', symbol: 'D', dist: '-', time: '1.5 s' },
    { step: 6, desc: 'Fit spring over refill tip', event: 'OPERATION', symbol: '○', dist: '0.2 m', time: '3.0 s' },
    { step: 7, desc: 'Screw writing tip / nose cone', event: 'OPERATION', symbol: '○', dist: '0.2 m', time: '4.6 s' },
    { step: 8, desc: 'Fit cap, clip & plunger clicker', event: 'OPERATION', symbol: '○', dist: '0.3 m', time: '8.4 s' },
    { step: 9, desc: 'Functional click & write inspection', event: 'INSPECTION', symbol: '□', dist: '-', time: '5.9 s' },
    { step: 10, desc: 'Discharge into finished goods tray', event: 'OPERATION', symbol: '○', dist: '0.4 m', time: '2.3 s' },
    { step: 11, desc: 'Final storage in shipping carton', event: 'STORAGE', symbol: '▽', dist: '8.0 m', time: '25 s' },
  ];

  // Pareto data
  const paretoData = calculatePareto(penElements);

  // Line balancing data using Largest Candidate Rule (LCR)
  const lineBalance = lineBalanceLCR(penElements, taktTime);

  return (
    <div className="space-y-6">
      {/* ── TOP HEADER ─────────────────────────────────────────────────── */}
      <div className="card-gradient p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-indigo-500/20">
        <div className="space-y-2 max-w-2xl">
          <Badge variant="indigo" icon={<Cpu className="w-3 h-3" />}>
            Industrial Engineering Toolkit
          </Badge>
          <h2 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Process Charts, Pareto &amp; Line Balancing
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Standard ASME method study tools: Operation Process Chart (OPC), Flow Process Chart (FPC), 80/20 Pareto bottleneck analysis, and assembly line balancing using Largest Candidate Rule.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/reports">
            <Button variant="outline" icon={<FileSpreadsheet className="w-4 h-4" />}>
              Export All Tool Results
            </Button>
          </Link>
        </div>
      </div>

      {/* ── TOOL TABS ──────────────────────────────────────────────────── */}
      <div className="flex border-b border-border space-x-2">
        <button
          onClick={() => setActiveTab('opc')}
          className={`pb-3 px-4 text-sm font-semibold transition-all relative ${
            activeTab === 'opc'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Operation Process Chart (OPC)
        </button>
        <button
          onClick={() => setActiveTab('fpc')}
          className={`pb-3 px-4 text-sm font-semibold transition-all relative ${
            activeTab === 'fpc'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Flow Process Chart (FPC)
        </button>
        <button
          onClick={() => setActiveTab('pareto')}
          className={`pb-3 px-4 text-sm font-semibold transition-all relative ${
            activeTab === 'pareto'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Pareto Analysis (80/20)
        </button>
        <button
          onClick={() => setActiveTab('balancing')}
          className={`pb-3 px-4 text-sm font-semibold transition-all relative ${
            activeTab === 'balancing'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Assembly Line Balancing (LCR)
        </button>
      </div>

      {/* ── 1. OPERATION PROCESS CHART (OPC) ────────────────────────────── */}
      {activeTab === 'opc' && (
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Operation Process Chart (OPC) - Manual Pen Assembly"
              subtitle="Shows chronological sequence of all operations (○) and inspections (□) with standard times"
            />

            <div className="relative pl-6 md:pl-10 space-y-4 my-6 before:absolute before:left-9 md:before:left-13 before:top-4 before:bottom-4 before:w-0.5 before:bg-indigo-500/30">
              {penElements.map((el, i) => (
                <div key={el.id} className="relative flex items-center gap-4">
                  {/* Symbol Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center flex-shrink-0 z-10 shadow-sm border ${
                      el.type === 'INSPECTION'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
                    }`}
                  >
                    <span className="text-sm font-mono">{el.symbol}</span>
                  </div>

                  {/* Step Description Card */}
                  <div className="card-premium p-3.5 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                          Step {i + 1}
                        </span>
                        <Badge variant={el.type === 'INSPECTION' ? 'amber' : 'indigo'}>
                          {el.type}
                        </Badge>
                      </div>
                      <h4 className="font-heading font-semibold text-sm text-foreground mt-0.5">
                        {el.name}
                      </h4>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="font-mono font-bold text-sm text-foreground tabular-nums">
                        {el.standardTime}s
                      </span>
                      <span className="text-[11px] text-muted-foreground block">Standard Time</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* OPC Summary Table */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-border text-center">
              <div className="p-3 rounded-xl bg-secondary/50">
                <span className="text-xs text-muted-foreground font-semibold">Total Operations (○)</span>
                <div className="text-xl font-bold font-heading text-indigo-600 dark:text-indigo-400 mt-1">8</div>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50">
                <span className="text-xs text-muted-foreground font-semibold">Total Inspections (□)</span>
                <div className="text-xl font-bold font-heading text-amber-600 dark:text-amber-400 mt-1">1</div>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50">
                <span className="text-xs text-muted-foreground font-semibold">Total Work Content</span>
                <div className="text-xl font-bold font-heading text-foreground mt-1">34.2s</div>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50">
                <span className="text-xs text-muted-foreground font-semibold">Theoretical Output</span>
                <div className="text-xl font-bold font-heading text-emerald-600 dark:text-emerald-400 mt-1">105 u/hr</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── 2. FLOW PROCESS CHART (FPC) ─────────────────────────────────── */}
      {activeTab === 'fpc' && (
        <Card>
          <CardHeader
            title="Flow Process Chart (FPC) - Component Material Flow"
            subtitle="ASME 5 standard symbols: Operation (○), Transport (⇨), Delay (D), Inspection (□), Storage (▽)"
          />

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Process Activity Description</th>
                  <th className="py-2.5 px-3 text-center">Type</th>
                  <th className="py-2.5 px-3 text-center">Symbol</th>
                  <th className="py-2.5 px-3 text-right">Distance</th>
                  <th className="py-2.5 px-3 text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {fpcSteps.map((step) => (
                  <tr key={step.step} className="hover:bg-secondary/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-muted-foreground">{step.step}</td>
                    <td className="py-2.5 px-3 font-medium text-foreground">{step.desc}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary border border-border">
                        {step.event}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-base text-indigo-600 dark:text-indigo-400">
                      {step.symbol}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-muted-foreground">{step.dist}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-foreground">{step.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── 3. PARETO ANALYSIS (80/20 RULE) ─────────────────────────────── */}
      {activeTab === 'pareto' && (
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Pareto Analysis of Pen Assembly Element Times (80/20 Rule)"
              subtitle="Bars: Standard time per element (s) | Line: Cumulative percentage (%)"
            />

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={paretoData} margin={{ top: 10, right: 20, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" angle={-20} textAnchor="end" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis yAxisId="left" unit="s" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" unit="%" domain={[0, 100]} tick={{ fontSize: 11 }} />
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
                  <Bar yAxisId="left" dataKey="standardTime" name="Standard Time (s)" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="cumulativePercentage" name="Cumulative %" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Vital Few Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 bg-emerald-500/5 border-emerald-500/20">
              <h4 className="font-heading font-semibold text-sm text-emerald-600 dark:text-emerald-400 mb-1">
                The &quot;Vital Few&quot; Bottleneck Elements
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The top 3 elements (Write test: 5.9s, Push button: 5.0s, Nose cone: 4.6s) account for over <strong>45%</strong> of the total assembly work content. Prioritizing jigs on these 3 elements yields the maximum productivity improvement.
              </p>
            </Card>

            <Card className="p-4 bg-secondary/50">
              <h4 className="font-heading font-semibold text-sm text-foreground mb-1">
                Engineering Recommendation
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Apply pre-threaded guides to nose cone and a rapid sensory click pad to inspection. This reduces the vital few times by 40%, directly increasing line throughput.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* ── 4. ASSEMBLY LINE BALANCING (LCR) ────────────────────────────── */}
      {activeTab === 'balancing' && (
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-foreground">
                  Largest Candidate Rule (LCR) Line Balancing
                </h3>
                <p className="text-xs text-muted-foreground">
                  Adjust target takt time to compute optimal workstations and line balance efficiency
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Target Takt Time:</span>
                <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-xl border border-border">
                  <input
                    type="number"
                    min="6"
                    max="30"
                    step="0.5"
                    value={taktTime}
                    onChange={(e) => setTaktTime(parseFloat(e.target.value) || 12)}
                    className="w-16 bg-transparent text-center font-bold font-heading text-sm text-foreground focus:outline-none"
                  />
                  <span className="text-xs font-semibold text-muted-foreground">sec</span>
                </div>
              </div>
            </div>

            {/* Balancing KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-border text-center">
              <div className="p-3 rounded-xl bg-secondary/50">
                <span className="text-xs text-muted-foreground font-semibold">Stations Required</span>
                <div className="text-2xl font-bold font-heading text-foreground mt-1">
                  {lineBalance.numWorkstations} Workstations
                </div>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50">
                <span className="text-xs text-muted-foreground font-semibold">Balance Efficiency</span>
                <div className="text-2xl font-bold font-heading text-emerald-600 dark:text-emerald-400 mt-1">
                  {lineBalance.balanceEfficiency.toFixed(1)}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50">
                <span className="text-xs text-muted-foreground font-semibold">Balance Delay %</span>
                <div className="text-2xl font-bold font-heading text-amber-600 dark:text-amber-400 mt-1">
                  {lineBalance.balanceDelay.toFixed(1)}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50">
                <span className="text-xs text-muted-foreground font-semibold">Takt Output Rate</span>
                <div className="text-2xl font-bold font-heading text-indigo-600 dark:text-indigo-400 mt-1">
                  {Math.round(3600 / taktTime)} pens/hr
                </div>
              </div>
            </div>
          </Card>

          {/* Workstations Distribution Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lineBalance.stations.map((st) => {
              const assignedElements = penElements.filter((e) => st.elements.includes(e.id));
              const loadPercent = Math.min(100, Math.round((st.totalTime / taktTime) * 100));

              return (
                <Card key={st.stationId} className="p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-heading font-bold text-sm text-foreground">
                        Station {st.stationId}
                      </span>
                      <Badge variant={loadPercent > 90 ? 'amber' : 'indigo'}>
                        {loadPercent}% Load
                      </Badge>
                    </div>

                    {/* Progress Bar of Station vs Takt */}
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mb-4">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${loadPercent}%` }}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase block">
                        Assigned Pen Elements:
                      </span>
                      {assignedElements.map((el) => (
                        <div key={el.id} className="text-xs text-foreground flex items-center justify-between py-1 border-b border-border/50">
                          <span className="truncate pr-2">{el.name}</span>
                          <span className="font-mono font-semibold text-muted-foreground tabular-nums">
                            {el.standardTime}s
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Station Total: <strong>{st.totalTime.toFixed(1)}s</strong></span>
                    <span className="text-muted-foreground">Idle: <strong className="text-amber-500">{st.idleTime.toFixed(1)}s</strong></span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

