'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Timer,
  Plus,
  Search,
  Copy,
  Trash2,
  Play,
  FileSpreadsheet,
  Calendar,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

interface Study {
  id: string;
  name: string;
  method: string;
  date: string;
  shift: string;
  workstation: string;
  productModel: string;
  operator: string;
  targetCycle: number;
  _count: { elements: number; observations: number };
  allowances: { totalPercent: number }[];
}

export default function StudiesPage() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'BEFORE' | 'AFTER'>('ALL');
  const [deleteTarget, setDeleteTarget] = useState<Study | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  const fetchStudies = () => {
    setLoading(true);
    fetch('/api/v1/studies?limit=50')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStudies(data.data || []);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudies();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/v1/studies/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      fetchStudies();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicate = async (study: Study) => {
    setDuplicating(study.id);
    try {
      const res = await fetch('/api/v1/studies/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studyId: study.id, newName: `${study.name} (Copy)` }),
      });
      if (res.ok) {
        fetchStudies();
      }
    } finally {
      setDuplicating(null);
    }
  };

  const filteredStudies = studies.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.productModel.toLowerCase().includes(search.toLowerCase()) ||
      s.workstation.toLowerCase().includes(search.toLowerCase()) ||
      (s.operator && s.operator.toLowerCase().includes(search.toLowerCase()));

    const matchesMethod = methodFilter === 'ALL' || s.method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  return (
    <div className="space-y-6">
      {/* ── TOP HEADER & CONTROLS ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Time Study Sessions &amp; History
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage, duplicate, open, and review work measurement studies for manual pen assembly
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/study/new">
            <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
              Create New Study
            </Button>
          </Link>
          <Link href="/reports">
            <Button variant="outline" icon={<FileSpreadsheet className="w-4 h-4" />}>
              Export All
            </Button>
          </Link>
        </div>
      </div>

      {/* ── SEARCH & FILTER BAR ─────────────────────────────────────────── */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search studies by name, operator, workstation, or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Method:</span>
            <div className="flex rounded-xl bg-secondary p-1 border border-border">
              {(['ALL', 'BEFORE', 'AFTER'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethodFilter(m)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    methodFilter === m
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* ── STUDIES GRID / CARDS ────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 card-premium bg-secondary/40 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredStudies.length === 0 ? (
        <Card className="text-center py-16">
          <Timer className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-60" />
          <h3 className="font-heading font-bold text-lg text-foreground">No Studies Match Your Criteria</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-6">
            Try adjusting your search query or filter, or create a brand new time study session.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={() => { setSearch(''); setMethodFilter('ALL'); }}>
              Clear Filters
            </Button>
            <Link href="/study/new">
              <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
                Create Study
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudies.map((study) => {
            const cyclesCount = study._count?.observations
              ? Math.round(study._count.observations / (study._count.elements || 1))
              : 0;
            const allowancePct = study.allowances[0]?.totalPercent ?? 10;

            return (
              <motion.div
                key={study.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.15 }}
                className="card-premium p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <Badge variant={study.method === 'BEFORE' ? 'rose' : 'emerald'}>
                      {study.method} Method
                    </Badge>
                    <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(study.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-foreground leading-snug line-clamp-2 mt-1">
                    {study.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {study.productModel} · {study.workstation}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/70 text-center">
                    <div className="bg-secondary/50 rounded-xl p-2">
                      <div className="text-base font-bold font-heading text-foreground tabular-nums">
                        {study._count?.elements ?? 0}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-medium">Elements</div>
                    </div>
                    <div className="bg-secondary/50 rounded-xl p-2">
                      <div className="text-base font-bold font-heading text-indigo-600 dark:text-indigo-400 tabular-nums">
                        {cyclesCount}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-medium">Cycles Obs</div>
                    </div>
                    <div className="bg-secondary/50 rounded-xl p-2">
                      <div className="text-base font-bold font-heading text-foreground tabular-nums">
                        {allowancePct}%
                      </div>
                      <div className="text-[10px] text-muted-foreground font-medium">Allowance</div>
                    </div>
                  </div>

                  {study.operator && (
                    <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="font-medium text-foreground">Operator:</span> {study.operator}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicate(study)}
                      disabled={duplicating === study.id}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="Duplicate Study"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(study)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Delete Study"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link href={`/study/${study.id}`}>
                    <Button variant="primary" size="sm" icon={<Play className="w-3.5 h-3.5" />}>
                      Open Study
                    </Button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Time Study?"
        description={`Are you sure you want to permanently delete "${deleteTarget?.name}"?`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Permanently
            </Button>
          </>
        }
      >
        <p className="text-xs text-muted-foreground">
          This will permanently delete this study and all its associated timing observations, performance ratings, and calculations.
        </p>
      </Modal>
    </div>
  );
}
