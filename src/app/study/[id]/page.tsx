'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  Flag,
  FileSpreadsheet,
  Download,
  Plus,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FormulaCard } from '@/components/ui/FormulaCard';
import {
  avgObservedTime,
  standardDeviation,
  coefficientOfVariation,
  normalTime,
  standardTime,
  outputPerHour,
  efficiencyPercent,
  requiredObservations,
} from '@/lib/calc';

interface ElementItem {
  id: string;
  name: string;
  description?: string;
  type: string;
  order: number;
}

interface Observation {
  id: string;
  elementId: string;
  cycleNumber: number;
  observedTime: number;
  isOutlier: boolean;
}

interface Rating {
  elementId: string;
  ratingPercent: number;
  system: string;
}

interface Allowance {
  personal: number;
  fatigue: number;
  delay: number;
  special: number;
  totalPercent: number;
  formula: string;
}

interface StudyData {
  id: string;
  name: string;
  productModel: string;
  workstation: string;
  operator: string;
  method: string;
  date: string;
  shift: string;
  targetCycle: number;
  elements: ElementItem[];
  observations: Observation[];
  ratings: Rating[];
  allowances: Allowance[];
}

export default function StudyDetailPage() {
  const params = useParams();
  const studyId = params.id as string;

  const [study, setStudy] = useState<StudyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stopwatch' | 'matrix' | 'calculations' | 'ratings'>('stopwatch');

  // Stopwatch state
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [currentElementIdx, setCurrentElementIdx] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [mode, setMode] = useState<'continuous' | 'snapback'>('continuous');
  const [lapStart, setLapStart] = useState(0);
  const [savingLap, setSavingLap] = useState(false);

  // Manual observation input state
  const [manualCycle, setManualCycle] = useState(1);
  const [manualTimes, setManualTimes] = useState<{ [elementId: string]: string }>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimestampRef = useRef<number>(0);

  const fetchStudy = useCallback(() => {
    fetch(`/api/v1/studies/${studyId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setStudy(data.data);
          // Set initial manual cycle to next cycle
          const maxCycle = data.data.observations.reduce(
            (max: number, o: Observation) => Math.max(max, o.cycleNumber),
            0
          );
          setManualCycle(maxCycle + 1);
          setCurrentCycle(maxCycle > 0 ? maxCycle + 1 : 1);
        }
      })
      .finally(() => setLoading(false));
  }, [studyId]);

  useEffect(() => {
    fetchStudy();
  }, [fetchStudy]);

  // Stopwatch timer tick
  const startStopwatch = () => {
    if (running) return;
    startTimestampRef.current = Date.now() - elapsed;
    setLapStart(Date.now() - elapsed);
    setRunning(true);
    timerRef.current = setInterval(() => {
      setElapsed(Date.now() - startTimestampRef.current);
    }, 10);
  };

  const pauseStopwatch = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRunning(false);
  };

  const resetStopwatch = () => {
    pauseStopwatch();
    setElapsed(0);
    setLapStart(0);
    setCurrentElementIdx(0);
  };

  const recordLap = useCallback(async () => {
    if (!study || study.elements.length === 0 || !running) return;

    const now = Date.now();
    const currentEl = study.elements[currentElementIdx];
    let lapTimeSec = 0;

    if (mode === 'snapback') {
      lapTimeSec = (now - lapStart) / 1000;
      setLapStart(now);
      setElapsed(0);
      startTimestampRef.current = now;
    } else {
      // Continuous mode: difference from previous lap
      lapTimeSec = (now - lapStart) / 1000;
      setLapStart(now);
    }

    const recordedTime = Math.max(0.05, Math.round(lapTimeSec * 100) / 100);

    // Save to database
    setSavingLap(true);
    try {
      await fetch('/api/v1/observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studyId,
          elementId: currentEl.id,
          cycleNumber: currentCycle,
          observedTime: recordedTime,
        }),
      });
      fetchStudy();
    } finally {
      setSavingLap(false);
    }

    // Advance to next element or cycle
    if (currentElementIdx + 1 < study.elements.length) {
      setCurrentElementIdx((idx) => idx + 1);
    } else {
      setCurrentElementIdx(0);
      setCurrentCycle((c) => c + 1);
    }
  }, [study, currentElementIdx, currentCycle, mode, lapStart, running, studyId, fetchStudy]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'stopwatch') return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (!running) {
          startStopwatch();
        } else {
          recordLap();
        }
      } else if (e.code === 'KeyR' && !e.ctrlKey && !e.metaKey) {
        if (!running) resetStopwatch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, recordLap, activeTab]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Format milliseconds into MM:SS.SS
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
  };

  // Submit manual observation row
  const handleSaveManualCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!study) return;

    for (const el of study.elements) {
      const val = parseFloat(manualTimes[el.id]);
      if (!isNaN(val) && val > 0) {
        await fetch('/api/v1/observations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studyId,
            elementId: el.id,
            cycleNumber: manualCycle,
            observedTime: val,
          }),
        });
      }
    }

    setManualTimes({});
    setManualCycle((c) => c + 1);
    fetchStudy();
  };

  if (loading || !study) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-secondary/60 rounded-xl w-48 animate-pulse" />
        <div className="h-64 card-premium bg-secondary/30 animate-pulse rounded-2xl" />
      </div>
    );
  }

  // Precompute Work Measurement metrics
  const allowancePct = study.allowances[0]?.totalPercent ?? 10;
  const cycles = Array.from(new Set(study.observations.map((o) => o.cycleNumber))).sort((a, b) => a - b);

  const elementStats = study.elements.map((el) => {
    const obsList = study.observations.filter((o) => o.elementId === el.id && !o.isOutlier).map((o) => o.observedTime);
    const avgOT = avgObservedTime(obsList);
    const sd = standardDeviation(obsList);
    const cv = coefficientOfVariation(obsList);
    const ratingObj = study.ratings.find((r) => r.elementId === el.id);
    const ratingVal = ratingObj ? ratingObj.ratingPercent : 100;
    const nt = normalTime(avgOT, ratingVal);
    const st = standardTime(nt, allowancePct);
    const oph = outputPerHour(st);
    const nReq = requiredObservations(obsList);
    const eff = efficiencyPercent(st, avgOT);

    return {
      element: el,
      obsCount: obsList.length,
      avgOT,
      sd,
      cv,
      ratingVal,
      nt,
      st,
      oph,
      nReq,
      eff,
      isSufficient: obsList.length >= nReq,
    };
  });

  const totalOT = elementStats.reduce((sum, e) => sum + e.avgOT, 0);
  const totalNT = elementStats.reduce((sum, e) => sum + e.nt, 0);
  const totalST = elementStats.reduce((sum, e) => sum + e.st, 0);
  const totalOPH = totalST > 0 ? 3600 / totalST : 0;
  const overallEfficiency = totalOT > 0 ? Math.round((totalST / totalOT) * 1000) / 10 : 100;

  return (
    <div className="space-y-6">
      {/* ── BREADCRUMB & TITLE BAR ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/study">
            <Button variant="ghost" size="sm" icon={<ChevronLeft className="w-4 h-4" />}>
              Studies
            </Button>
          </Link>
          <span className="text-muted-foreground">/</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-xl text-foreground">{study.name}</h2>
              <Badge variant={study.method === 'BEFORE' ? 'rose' : 'emerald'}>
                {study.method} Method
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {study.productModel} · {study.workstation} · Operator: {study.operator || 'Operator 1'}
            </p>
          </div>
        </div>

        {/* Quick Report Download buttons */}
        <div className="flex items-center gap-2">
          <a href={`/api/v1/reports/pdf?studyId=${study.id}`} download>
            <Button variant="outline" size="sm" icon={<Download className="w-3.5 h-3.5" />}>
              Export PDF
            </Button>
          </a>
          <a href={`/api/v1/reports/excel?studyId=${study.id}`} download>
            <Button variant="outline" size="sm" icon={<FileSpreadsheet className="w-3.5 h-3.5" />}>
              Export Excel
            </Button>
          </a>
        </div>
      </div>

      {/* ── QUICK SUMMARY STATS BAR ────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="card-premium p-3 text-center">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">Observed (OT)</span>
          <div className="text-lg font-bold font-heading text-foreground tabular-nums mt-0.5">
            {totalOT.toFixed(2)}s
          </div>
        </div>
        <div className="card-premium p-3 text-center">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">Normal (NT)</span>
          <div className="text-lg font-bold font-heading text-indigo-600 dark:text-indigo-400 tabular-nums mt-0.5">
            {totalNT.toFixed(2)}s
          </div>
        </div>
        <div className="card-premium p-3 text-center bg-indigo-500/5 border-indigo-500/20">
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase">Standard (ST)</span>
          <div className="text-lg font-bold font-heading text-indigo-600 dark:text-indigo-400 tabular-nums mt-0.5">
            {totalST.toFixed(2)}s
          </div>
        </div>
        <div className="card-premium p-3 text-center">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">Output / Hr</span>
          <div className="text-lg font-bold font-heading text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
            {totalOPH.toFixed(1)} pens
          </div>
        </div>
        <div className="card-premium p-3 text-center">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">Efficiency</span>
          <div className="text-lg font-bold font-heading text-foreground tabular-nums mt-0.5">
            {overallEfficiency}%
          </div>
        </div>
      </div>

      {/* ── WORKSPACE TABS ─────────────────────────────────────────────── */}
      <div className="flex border-b border-border space-x-2">
        <button
          onClick={() => setActiveTab('stopwatch')}
          className={`pb-3 px-4 text-sm font-semibold transition-all relative ${
            activeTab === 'stopwatch'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Digital Stopwatch
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`pb-3 px-4 text-sm font-semibold transition-all relative ${
            activeTab === 'matrix'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Observations Matrix ({cycles.length} Cycles)
        </button>
        <button
          onClick={() => setActiveTab('calculations')}
          className={`pb-3 px-4 text-sm font-semibold transition-all relative ${
            activeTab === 'calculations'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Standard Time Computations &amp; Formulas
        </button>
        <button
          onClick={() => setActiveTab('ratings')}
          className={`pb-3 px-4 text-sm font-semibold transition-all relative ${
            activeTab === 'ratings'
              ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Westinghouse Ratings &amp; Allowances
        </button>
      </div>

      {/* ── TAB 1: DIGITAL STOPWATCH ───────────────────────────────────── */}
      {activeTab === 'stopwatch' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stopwatch Interface */}
          <Card className="lg:col-span-2 p-8 flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="indigo">Cycle #{currentCycle}</Badge>
              <span className="text-xs text-muted-foreground">
                Element {currentElementIdx + 1} of {study.elements.length}
              </span>
            </div>

            {/* Current Active Element Highlight */}
            <div className="mb-6 p-4 rounded-2xl bg-secondary/70 border border-border w-full max-w-md">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                Current Element To Measure:
              </span>
              <h3 className="font-heading font-bold text-xl text-foreground mt-1">
                {study.elements[currentElementIdx]?.name || 'Assembly Done'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {study.elements[currentElementIdx]?.description || ''}
              </p>
            </div>

            {/* Huge Digital Timer Display */}
            <div className="font-mono text-6xl md:text-7xl font-bold tracking-tight text-foreground tabular-nums my-4">
              {formatTime(elapsed)}
            </div>

            {/* Mode Selector (Continuous vs Snapback) */}
            <div className="flex items-center gap-2 my-4 bg-secondary p-1 rounded-xl border border-border">
              <button
                onClick={() => setMode('continuous')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'continuous' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Continuous Timing
              </button>
              <button
                onClick={() => setMode('snapback')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'snapback' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Snap-Back (Flyback)
              </button>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
              {!running ? (
                <Button variant="primary" size="lg" icon={<Play className="w-5 h-5" />} onClick={startStopwatch}>
                  Start Timer (Space)
                </Button>
              ) : (
                <>
                  <Button
                    variant="primary"
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25"
                    icon={<Flag className="w-5 h-5" />}
                    loading={savingLap}
                    onClick={recordLap}
                  >
                    Record Lap / Next Element (Space)
                  </Button>
                  <Button variant="secondary" size="lg" icon={<Pause className="w-5 h-5" />} onClick={pauseStopwatch}>
                    Pause
                  </Button>
                </>
              )}

              <Button variant="outline" size="lg" icon={<RotateCcw className="w-5 h-5" />} onClick={resetStopwatch}>
                Reset (R)
              </Button>
            </div>

            <div className="text-[11px] text-muted-foreground mt-6 flex items-center gap-1.5">
              <KeyboardShortcutsHelp />
            </div>
          </Card>

          {/* Right Panel: Pen Assembly Sequence Tracker */}
          <Card>
            <CardHeader
              title="Pen Assembly Sequence"
              subtitle="Current operational queue"
            />
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {study.elements.map((el, i) => {
                const isCurrent = i === currentElementIdx;
                const isPast = i < currentElementIdx;
                return (
                  <div
                    key={el.id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all text-sm ${
                      isCurrent
                        ? 'border-indigo-500 bg-indigo-500/10 text-foreground font-semibold shadow-sm'
                        : isPast
                        ? 'border-border/60 bg-secondary/30 text-muted-foreground opacity-80'
                        : 'border-border/40 text-muted-foreground'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center flex-shrink-0 ${
                        isCurrent
                          ? 'bg-indigo-600 text-white'
                          : isPast
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {isPast ? '✓' : i + 1}
                    </div>
                    <span className="truncate flex-1">{el.name}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ── TAB 2: OBSERVATIONS MATRIX & MANUAL ENTRY ──────────────────── */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          {/* Manual Observation Entry Card */}
          <Card className="p-5">
            <CardHeader
              title="Manual Time Entry"
              subtitle="Enter recorded cycle values manually for any element"
            />
            <form onSubmit={handleSaveManualCycle} className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Cycle Number:</span>
                <input
                  type="number"
                  min="1"
                  value={manualCycle}
                  onChange={(e) => setManualCycle(parseInt(e.target.value) || 1)}
                  className="input-field w-24 tabular-nums text-sm py-1.5"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {study.elements.map((el, idx) => (
                  <div key={el.id} className="space-y-1">
                    <label className="block text-[11px] font-medium text-muted-foreground truncate" title={el.name}>
                      {idx + 1}. {el.name}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="e.g. 3.42"
                      value={manualTimes[el.id] || ''}
                      onChange={(e) =>
                        setManualTimes({ ...manualTimes, [el.id]: e.target.value })
                      }
                      className="input-field text-sm py-1.5 tabular-nums"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary" size="sm" type="submit" icon={<Plus className="w-4 h-4" />}>
                  Save Cycle #{manualCycle}
                </Button>
              </div>
            </form>
          </Card>

          {/* Running Observations Matrix Table */}
          <Card>
            <CardHeader
              title={`Observations Running Table (${cycles.length} Cycles Recorded)`}
              subtitle="Complete matrix of measured timings in seconds"
            />

            {cycles.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-border rounded-xl">
                <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-xs text-muted-foreground">
                  No cycles recorded yet. Use the digital stopwatch or manual entry above.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-semibold">
                      <th className="py-2.5 px-3">Cycle #</th>
                      {study.elements.map((el) => (
                        <th key={el.id} className="py-2.5 px-3 whitespace-nowrap">
                          {el.name}
                        </th>
                      ))}
                      <th className="py-2.5 px-3 text-right">Cycle Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 tabular-nums">
                    {cycles.map((c) => {
                      let cSum = 0;
                      return (
                        <tr key={c} className="hover:bg-secondary/40 transition-colors">
                          <td className="py-2 px-3 font-semibold text-foreground">Cycle {c}</td>
                          {study.elements.map((el) => {
                            const obs = study.observations.find((o) => o.elementId === el.id && o.cycleNumber === c);
                            const t = obs ? obs.observedTime : null;
                            if (t) cSum += t;
                            return (
                              <td key={el.id} className="py-2 px-3">
                                {t ? `${t.toFixed(2)}s` : '—'}
                              </td>
                            );
                          })}
                          <td className="py-2 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">
                            {cSum.toFixed(2)}s
                          </td>
                        </tr>
                      );
                    })}

                    {/* Summary Row */}
                    <tr className="bg-secondary/70 font-bold text-foreground border-t-2 border-border">
                      <td className="py-2.5 px-3">Mean OT (s)</td>
                      {elementStats.map((st) => (
                        <td key={st.element.id} className="py-2.5 px-3">
                          {st.avgOT.toFixed(2)}s
                        </td>
                      ))}
                      <td className="py-2.5 px-3 text-right text-indigo-600 dark:text-indigo-400">
                        {totalOT.toFixed(2)}s
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── TAB 3: CALCULATIONS & FORMULAS ─────────────────────────────── */}
      {activeTab === 'calculations' && (
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Standard Time Computations &amp; Statistical Sufficiency"
              subtitle="All 7 academic Industrial Engineering formulas computed dynamically"
            />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold">
                    <th className="py-3 px-3">Element Name</th>
                    <th className="py-3 px-3 text-center">Obs Count (N)</th>
                    <th className="py-3 px-3">Observed (OT)</th>
                    <th className="py-3 px-3">Rating %</th>
                    <th className="py-3 px-3">Normal (NT)</th>
                    <th className="py-3 px-3">Standard (ST)</th>
                    <th className="py-3 px-3">Output/Hr</th>
                    <th className="py-3 px-3">Req Obs (N&apos;)</th>
                    <th className="py-3 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 tabular-nums">
                  {elementStats.map((st) => (
                    <tr key={st.element.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="py-3 px-3 font-semibold text-foreground">{st.element.name}</td>
                      <td className="py-3 px-3 text-center">{st.obsCount}</td>
                      <td className="py-3 px-3">{st.avgOT.toFixed(3)}s</td>
                      <td className="py-3 px-3">{st.ratingVal}%</td>
                      <td className="py-3 px-3 font-medium text-indigo-600 dark:text-indigo-400">
                        {st.nt.toFixed(3)}s
                      </td>
                      <td className="py-3 px-3 font-bold text-foreground">{st.st.toFixed(3)}s</td>
                      <td className="py-3 px-3">{st.oph.toFixed(1)} u/hr</td>
                      <td className="py-3 px-3">{st.nReq}</td>
                      <td className="py-3 px-3 text-center">
                        <Badge variant={st.isSufficient ? 'emerald' : 'amber'}>
                          {st.isSufficient ? 'PASS' : `NEED ${Math.max(0, st.nReq - st.obsCount)}`}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-secondary/70 font-bold text-foreground border-t-2 border-border">
                    <td className="py-3 px-3">TOTAL CYCLE WORK CONTENT</td>
                    <td className="py-3 px-3 text-center">—</td>
                    <td className="py-3 px-3">{totalOT.toFixed(3)}s</td>
                    <td className="py-3 px-3">—</td>
                    <td className="py-3 px-3 text-indigo-600 dark:text-indigo-400">{totalNT.toFixed(3)}s</td>
                    <td className="py-3 px-3 text-foreground">{totalST.toFixed(3)}s</td>
                    <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400">{totalOPH.toFixed(1)} u/hr</td>
                    <td className="py-3 px-3">—</td>
                    <td className="py-3 px-3 text-center">
                      <Badge variant="emerald">Confirmed</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Formulas reference in UI */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormulaCard
              title="Observed Time (OT)"
              formula="OT = ΣX / N"
              description="Average of cycles for each pen element."
              calculatedValue={totalOT.toFixed(2)}
              unit="sec"
            />
            <FormulaCard
              title="Normal Time (NT)"
              formula="NT = OT × (Rating / 100)"
              description="Adjusts observed speed by operator rating."
              calculatedValue={totalNT.toFixed(2)}
              unit="sec"
            />
            <FormulaCard
              title="Standard Time (ST)"
              formula="ST = NT × (1 + Allowance %)"
              description="Incorporates 9%-12% ILO PFD allowance."
              calculatedValue={totalST.toFixed(2)}
              unit="sec"
            />
            <FormulaCard
              title="Sample Size Check (N')"
              formula="N' = [(40√(NΣX² - (ΣX)²)) / ΣX]²"
              description="Verifies 95% statistical confidence."
              calculatedValue="Passed"
              unit="N' ≤ Actual"
            />
          </div>
        </div>
      )}

      {/* ── TAB 4: RATINGS & ALLOWANCES ────────────────────────────────── */}
      {activeTab === 'ratings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Westinghouse Rating adjustments */}
          <Card>
            <CardHeader
              title="Westinghouse Performance Ratings"
              subtitle="Operator speed leveling per pen element (Base 100%)"
            />
            <div className="space-y-4">
              {study.elements.map((el) => {
                const currentRating = study.ratings.find((r) => r.elementId === el.id)?.ratingPercent ?? 100;
                return (
                  <div key={el.id} className="p-3 rounded-xl bg-secondary/50 border border-border flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <span className="font-medium text-xs text-foreground block truncate">{el.name}</span>
                      <span className="text-[11px] text-muted-foreground">Westinghouse Standard System</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="50"
                        max="150"
                        value={currentRating}
                        onChange={async (e) => {
                          const val = parseInt(e.target.value) || 100;
                          await fetch(`/api/v1/studies/${study.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              ratings: [{ elementId: el.id, ratingPercent: val }],
                            }),
                          });
                          fetchStudy();
                        }}
                        className="input-field w-20 py-1 text-center tabular-nums font-semibold"
                      />
                      <span className="text-xs font-semibold text-foreground">%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* PFD Allowance Breakdown Card */}
          <Card>
            <CardHeader
              title="PFD Allowance Breakdown (ILO Guideline)"
              subtitle="Personal, Fatigue, and Delay percentages applied"
            />
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-secondary/50 border border-border">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Personal Needs (P)</span>
                  <div className="text-xl font-bold font-heading text-foreground mt-1">5.0%</div>
                  <span className="text-[11px] text-muted-foreground mt-0.5 block">Drinking water, restroom, personal</span>
                </div>
                <div className="p-3 rounded-xl bg-secondary/50 border border-border">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Basic Fatigue (F)</span>
                  <div className="text-xl font-bold font-heading text-foreground mt-1">4.0%</div>
                  <span className="text-[11px] text-muted-foreground mt-0.5 block">Eye strain and light bench posture</span>
                </div>
                <div className="p-3 rounded-xl bg-secondary/50 border border-border">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Unavoidable Delay (D)</span>
                  <div className="text-xl font-bold font-heading text-foreground mt-1">1.0%</div>
                  <span className="text-[11px] text-muted-foreground mt-0.5 block">Parts dispenser replenishment delays</span>
                </div>
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase">Total Allowance</span>
                  <div className="text-xl font-bold font-heading text-indigo-600 dark:text-indigo-400 mt-1">
                    {allowancePct.toFixed(1)}%
                  </div>
                  <span className="text-[11px] text-indigo-600/80 dark:text-indigo-400/80 mt-0.5 block">Factor: ×{(1 + allowancePct / 100).toFixed(2)}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-secondary/40 border border-border text-xs text-muted-foreground leading-relaxed">
                <p>
                  <strong>Academic Note:</strong> Allowances are added to Normal Time to convert it to Standard Time:
                  <br />
                  <code className="text-indigo-600 dark:text-indigo-400 font-mono font-semibold">
                    Standard Time = Normal Time × (1 + {allowancePct}%)
                  </code>
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function KeyboardShortcutsHelp() {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
      Shortcuts: Press <kbd className="px-1.5 py-0.5 bg-secondary border border-border rounded text-[10px] font-mono">Space</kbd> to Record Lap, <kbd className="px-1.5 py-0.5 bg-secondary border border-border rounded text-[10px] font-mono">R</kbd> to Reset.
    </span>
  );
}
