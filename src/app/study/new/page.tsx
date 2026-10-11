'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ElementItem {
  id: string;
  name: string;
  description: string;
  type: string;
  order: number;
}

const DEFAULT_7_ELEMENTS: ElementItem[] = [
  { id: '1', name: 'Pick barrel from bin', description: 'Grasp cylindrical barrel tube from holding container', type: 'MANUAL', order: 1 },
  { id: '2', name: 'Insert ink refill into barrel', description: 'Orient ink cartridge and slide inside barrel', type: 'MANUAL', order: 2 },
  { id: '3', name: 'Fit compression spring over refill', description: 'Thread spring onto tip end of refill', type: 'MANUAL', order: 3 },
  { id: '4', name: 'Fit writing tip / nose cone', description: 'Screw cone onto front barrel threads', type: 'MANUAL', order: 4 },
  { id: '5', name: 'Fit cap / clip assembly', description: 'Slide pocket clip into cap housing', type: 'MANUAL', order: 5 },
  { id: '6', name: 'Fit push button / plunger', description: 'Insert retractable clicker mechanism into rear', type: 'MANUAL', order: 6 },
  { id: '7', name: 'Screw threaded cap assembly', description: 'Thread cap onto rear barrel section to seal', type: 'MANUAL', order: 7 },
];

const DETAILED_9_ELEMENTS: ElementItem[] = [
  ...DEFAULT_7_ELEMENTS,
  { id: '8', name: 'Functional click & write inspection', description: 'Click 3 times and perform spiral test stroke on pad', type: 'MANUAL', order: 8 },
  { id: '9', name: 'Place completed pen in finished tray', description: 'Transfer completed pen to 10x5 partitioned tray', type: 'MANUAL', order: 9 },
];

export default function NewStudyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form parameters
  const [name, setName] = useState('Manual Pen Assembly Time Study');
  const [productModel, setProductModel] = useState('Retractable Ballpoint Pen Model Pro-X');
  const [workstation, setWorkstation] = useState('WS-01 Manual Assembly Bench');
  const [operator, setOperator] = useState('Operator A (Assembly Line)');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState('Morning Shift (08:00 - 16:30)');
  const [method, setMethod] = useState<'BEFORE' | 'AFTER'>('BEFORE');
  const [targetCycle, setTargetCycle] = useState(15);
  const [allowancePercent, setAllowancePercent] = useState(10);
  const [ratingMethod, setRatingMethod] = useState('WESTINGHOUSE');
  const [description, setDescription] = useState(
    'Work measurement study establishing standard times for manual pen assembly elements with Westinghouse rating and PFD allowances.'
  );

  // Pen Assembly elements state
  const [elements, setElements] = useState<ElementItem[]>(DEFAULT_7_ELEMENTS);
  const [newElementName, setNewElementName] = useState('');

  const handleAddElement = () => {
    if (!newElementName.trim()) return;
    const newEl: ElementItem = {
      id: String(Date.now()),
      name: newElementName.trim(),
      description: 'Custom assembly work element',
      type: 'MANUAL',
      order: elements.length + 1,
    };
    setElements([...elements, newEl]);
    setNewElementName('');
  };

  const handleRemoveElement = (index: number) => {
    if (elements.length <= 1) return;
    const updated = elements.filter((_, i) => i !== index).map((el, idx) => ({ ...el, order: idx + 1 }));
    setElements(updated);
  };

  const moveElement = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === elements.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const copy = [...elements];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    setElements(copy.map((el, i) => ({ ...el, order: i + 1 })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Study name is required.');
      return;
    }
    if (elements.length === 0) {
      setError('At least one assembly element is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/studies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          productModel,
          workstation,
          operator,
          date: new Date(date).toISOString(),
          shift,
          method,
          targetCycle,
          allowancePercent,
          description,
          elements: elements.map((el, i) => ({
            name: el.name,
            description: el.description,
            type: el.type,
            order: i + 1,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create study session');
      } else {
        router.push(`/study/${data.data.id}`);
      }
    } catch {
      setError('Network error. Failed to save new study.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ── TOP BREADCRUMB ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Link href="/study">
          <Button variant="ghost" size="sm" icon={<ChevronLeft className="w-4 h-4" />}>
            Back to Studies
          </Button>
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium text-foreground">Configure New Study</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm">
            {error}
          </div>
        )}

        {/* ── 1. STUDY GENERAL INFORMATION ──────────────────────────────── */}
        <Card>
          <CardHeader
            title="1. Study Header &amp; Setup Details"
            subtitle="Identification, operator, workstation, and study method"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                Study Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Manual Pen Assembly Line Balancing Study"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                Product Model *
              </label>
              <input
                type="text"
                required
                value={productModel}
                onChange={(e) => setProductModel(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                Workstation Location *
              </label>
              <input
                type="text"
                required
                value={workstation}
                onChange={(e) => setWorkstation(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                Operator Name
              </label>
              <input
                type="text"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                Study Method *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('BEFORE')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    method === 'BEFORE'
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/40 shadow-sm'
                      : 'border-border bg-secondary text-muted-foreground'
                  }`}
                >
                  BEFORE (Baseline)
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('AFTER')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    method === 'AFTER'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 shadow-sm'
                      : 'border-border bg-secondary text-muted-foreground'
                  }`}
                >
                  AFTER (Improved)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                Study Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                Work Shift
              </label>
              <input
                type="text"
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </Card>

        {/* ── 2. WORK MEASUREMENT PARAMETERS ────────────────────────────── */}
        <Card>
          <CardHeader
            title="2. Work Measurement Parameters"
            subtitle="Target sample size, performance rating, and allowances"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                Target Observation Cycles
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={targetCycle}
                onChange={(e) => setTargetCycle(parseInt(e.target.value) || 10)}
                className="input-field"
              />
              <span className="text-[11px] text-muted-foreground mt-1 block">
                ILO recommends 20-30 cycles for high confidence.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                Rating Method
              </label>
              <select
                value={ratingMethod}
                onChange={(e) => setRatingMethod(e.target.value)}
                className="input-field"
              >
                <option value="WESTINGHOUSE">Westinghouse System (Skill, Effort, Conditions)</option>
                <option value="SYNTHETIC">Synthetic Leveling (100% Base)</option>
                <option value="DIRECT">Direct Pace Rating (%)</option>
              </select>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Standardizes operator speed against a normal worker.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                Total PFD Allowance %
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="40"
                  step="0.5"
                  value={allowancePercent}
                  onChange={(e) => setAllowancePercent(parseFloat(e.target.value) || 10)}
                  className="input-field tabular-nums"
                />
                <span className="text-sm font-semibold text-foreground">%</span>
              </div>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Personal (5%) + Fatigue (4%) + Delay (1%) = 10% standard.
              </span>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                Study Notes / Scope
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Study description..."
                className="input-field text-xs"
              />
            </div>
          </div>
        </Card>

        {/* ── 3. PEN ASSEMBLY ELEMENTS CUSTOMIZER ────────────────────────── */}
        <Card>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-heading font-bold text-lg text-foreground">
                3. Pen Assembly Work Elements
              </h3>
              <p className="text-xs text-muted-foreground">
                Define the measurable operation elements. You can add, edit, remove, and reorder.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setElements(DEFAULT_7_ELEMENTS)}
              >
                Reset to 7 Core Elements
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setElements(DETAILED_9_ELEMENTS)}
              >
                Load Full 9 Elements
              </Button>
            </div>
          </div>

          {/* Elements list */}
          <div className="space-y-2">
            {elements.map((el, index) => (
              <div
                key={el.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 border border-border/80 hover:border-indigo-500/30 transition-all"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={el.name}
                    onChange={(e) => {
                      const copy = [...elements];
                      copy[index].name = e.target.value;
                      setElements(copy);
                    }}
                    className="w-full bg-transparent font-medium text-sm text-foreground focus:outline-none focus:underline"
                    placeholder="Element description"
                  />
                  <span className="text-[11px] text-muted-foreground block truncate">
                    {el.description}
                  </span>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => moveElement(index, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                    title="Move element up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveElement(index, 'down')}
                    disabled={index === elements.length - 1}
                    className="p-1 rounded text-muted-foreground hover:text-foreground disabled:opacity-30"
                    title="Move element down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveElement(index)}
                    disabled={elements.length <= 1}
                    className="p-1 rounded text-muted-foreground hover:text-rose-500 disabled:opacity-30 transition-colors ml-1"
                    title="Delete element"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add custom element input */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
            <input
              type="text"
              value={newElementName}
              onChange={(e) => setNewElementName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddElement();
                }
              }}
              placeholder="Add custom element (e.g. Inspect pen barrel laser etching)..."
              className="input-field text-sm"
            />
            <Button
              type="button"
              variant="secondary"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleAddElement}
            >
              Add
            </Button>
          </div>
        </Card>

        {/* ── SUBMIT BUTTON ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/study">
            <Button variant="secondary" type="button">
              Cancel
            </Button>
          </Link>
          <Button variant="primary" type="submit" loading={loading} icon={<Save className="w-4 h-4" />}>
            Create Study Session &amp; Launch Stopwatch
          </Button>
        </div>
      </form>
    </div>
  );
}
