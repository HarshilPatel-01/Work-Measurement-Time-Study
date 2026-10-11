'use client';

import React from 'react';
import { Calculator, Info } from 'lucide-react';

interface FormulaCardProps {
  title: string;
  formula: string;
  description: string;
  calculatedValue?: string | number;
  unit?: string;
  statusBadge?: string;
}

export const FormulaCard: React.FC<FormulaCardProps> = ({
  title,
  formula,
  description,
  calculatedValue,
  unit,
  statusBadge,
}) => {
  return (
    <div className="card-premium p-5 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Calculator className="w-3.5 h-3.5" />
            </div>
            <h4 className="font-heading font-semibold text-sm text-foreground">{title}</h4>
          </div>
          {statusBadge && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {statusBadge}
            </span>
          )}
        </div>

        <div className="bg-secondary/70 dark:bg-slate-900/60 border border-border/80 rounded-xl px-3 py-2 my-2.5">
          <code className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
            {formula}
          </code>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5 mt-1">
          <Info className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
          {description}
        </p>
      </div>

      {calculatedValue !== undefined && (
        <div className="mt-4 pt-3 border-t border-border flex items-baseline justify-between">
          <span className="text-xs font-medium text-muted-foreground">Current Value:</span>
          <span className="font-heading font-bold text-lg text-foreground tabular-nums">
            {calculatedValue} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
          </span>
        </div>
      )}
    </div>
  );
};

