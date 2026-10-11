'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  FileText,
  Layers,
  Table,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Study {
  id: string;
  name: string;
  method: string;
  productModel: string;
  workstation: string;
  operator: string;
  date: string;
  _count: { elements: number; observations: number };
}

export default function ReportsPage() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudyId, setSelectedStudyId] = useState<string>('');

  useEffect(() => {
    fetch('/api/v1/studies?limit=50')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setStudies(data.data);
          if (data.data.length > 0) {
            setSelectedStudyId(data.data[0].id);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedStudy = studies.find((s) => s.id === selectedStudyId);

  return (
    <div className="space-y-6">
      {/* ── TOP HERO BANNER ─────────────────────────────────────────────── */}
      <div className="card-gradient p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-indigo-500/20">
        <div className="space-y-2 max-w-2xl">
          <Badge variant="indigo" icon={<FileSpreadsheet className="w-3 h-3" />}>
            Academic Documentation &amp; Reporting
          </Badge>
          <h2 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Academic Reports &amp; Data Exports
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Generate formal Industrial Engineering laboratory reports with complete title headers, multi-sheet formatted Excel workbooks, raw CSV matrices, and master cross-study archives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a href="/api/v1/reports/export-all" download>
            <Button variant="primary" icon={<Download className="w-4 h-4" />}>
              Export All Studies (.xlsx)
            </Button>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Study Selector List */}
        <Card>
          <CardHeader
            title="1. Select Study Session"
            subtitle="Choose a study to download its formal report"
          />

          {loading ? (
            <div className="space-y-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-secondary/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : studies.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No studies available. Create a study first.
            </div>
          ) : (
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {studies.map((s) => {
                const isSelected = s.id === selectedStudyId;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStudyId(s.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 text-foreground font-semibold shadow-sm'
                        : 'border-border/60 hover:bg-secondary/60 text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-foreground truncate pr-2">{s.name}</span>
                      <Badge variant={s.method === 'BEFORE' ? 'rose' : 'emerald'}>
                        {s.method}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                      <span>{s.workstation}</span>
                      <span>{new Date(s.date).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        {/* Right: Export Format Options & Preview */}
        <div className="lg:col-span-2 space-y-6">
          {selectedStudy ? (
            <>
              {/* Selected Study Meta Preview */}
              <Card className="p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-border">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-foreground">
                      {selectedStudy.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedStudy.productModel} · {selectedStudy.workstation} · Operator: {selectedStudy.operator || 'Operator 1'}
                    </p>
                  </div>
                  <Badge variant={selectedStudy.method === 'BEFORE' ? 'rose' : 'emerald'}>
                    {selectedStudy.method} Method
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-4 text-center">
                  <div className="p-2.5 rounded-xl bg-secondary/50">
                    <span className="text-[11px] text-muted-foreground font-semibold">Elements</span>
                    <div className="text-base font-bold font-heading text-foreground mt-0.5">
                      {selectedStudy._count.elements}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-secondary/50">
                    <span className="text-[11px] text-muted-foreground font-semibold">Observations</span>
                    <div className="text-base font-bold font-heading text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {selectedStudy._count.observations}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-secondary/50">
                    <span className="text-[11px] text-muted-foreground font-semibold">Date</span>
                    <div className="text-xs font-bold text-foreground mt-1">
                      {new Date(selectedStudy.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Card>

              {/* 3 Download Formats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. PDF Report */}
                <Card className="p-5 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-3">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h4 className="font-heading font-bold text-base text-foreground">
                      Academic PDF Report
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Official IE laboratory report with title header, formulas block, results table, KPIs, and page numbering.
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-border">
                    <a href={`/api/v1/reports/pdf?studyId=${selectedStudy.id}`} download className="block">
                      <Button variant="primary" className="w-full text-xs" icon={<Download className="w-3.5 h-3.5" />}>
                        Download PDF (.pdf)
                      </Button>
                    </a>
                  </div>
                </Card>

                {/* 2. Excel Multi-sheet Workbook */}
                <Card className="p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <h4 className="font-heading font-bold text-base text-foreground">
                      Multi-Sheet Excel (.xlsx)
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      5 formatted sheets: Study Info, Observations Matrix, Calculations, Before/After Comparison, and Summary.
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-border">
                    <a href={`/api/v1/reports/excel?studyId=${selectedStudy.id}`} download className="block">
                      <Button variant="secondary" className="w-full text-xs text-emerald-600 dark:text-emerald-400" icon={<Download className="w-3.5 h-3.5" />}>
                        Download Excel (.xlsx)
                      </Button>
                    </a>
                  </div>
                </Card>

                {/* 3. Raw CSV Data */}
                <Card className="p-5 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3">
                      <Table className="w-5 h-5" />
                    </div>
                    <h4 className="font-heading font-bold text-base text-foreground">
                      Raw CSV Observation Data
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Comma-separated matrix suitable for statistical analysis in Python, R, MATLAB, or SPSS.
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-border">
                    <a href={`/api/v1/reports/csv?studyId=${selectedStudy.id}`} download className="block">
                      <Button variant="outline" className="w-full text-xs" icon={<Download className="w-3.5 h-3.5" />}>
                        Download CSV (.csv)
                      </Button>
                    </a>
                  </div>
                </Card>
              </div>
            </>
          ) : (
            <Card className="text-center py-16">
              <Layers className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-xs text-muted-foreground">Select a study on the left to export reports.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
