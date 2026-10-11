'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Sun, Moon, Plus, FileSpreadsheet, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const getPageMeta = () => {
    if (pathname === '/dashboard') return { title: 'Industrial Engineering Dashboard', desc: 'Pen Assembly Work Measurement & Key Productivity Metrics' };
    if (pathname === '/study') return { title: 'Time Study Records', desc: 'Browse, compare, and manage manual assembly studies' };
    if (pathname === '/study/new') return { title: 'New Time Study Setup', desc: 'Configure workstation, operator, and assembly elements' };
    if (pathname.startsWith('/study/')) return { title: 'Stopwatch & Timing Matrix', desc: 'Live cycle observation, Westinghouse ratings, and calculations' };
    if (pathname === '/improvement') return { title: 'Method Improvement (Before vs After)', desc: 'Quantify motion economy savings, cycle reduction, and output growth' };
    if (pathname === '/tools') return { title: 'Industrial Engineering Tools', desc: 'Operation Process Chart, Flow Process Chart, Pareto Analysis & Line Balancing' };
    if (pathname === '/allowances') return { title: 'PFD Allowance Calculator', desc: 'Personal, Fatigue, and Delay breakdown based on ILO guidelines' };
    if (pathname === '/analysis') return { title: 'Productivity Analysis & Insights', desc: 'Automated engineering recommendations and bottleneck evaluation' };
    if (pathname === '/reports') return { title: 'Reports & Academic Exports', desc: 'Download PDF documents, multi-sheet Excel workbooks, and CSV tables' };
    return { title: 'Time Study & Work Measurement', desc: 'Academic Pen Assembly Productivity Project' };
  };

  const meta = getPageMeta();

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md px-6 flex items-center justify-between z-20">
      <div>
        <h1 className="font-heading font-bold text-base md:text-lg text-foreground tracking-tight">
          {meta.title}
        </h1>
        <p className="hidden md:block text-xs text-muted-foreground">
          {meta.desc}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Open academic workspace indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-600 dark:text-indigo-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Open Academic Workspace</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
          title="Toggle Light / Dark Theme"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
        </button>

        {/* Quick action buttons */}
        <Link href="/reports">
          <Button variant="outline" size="sm" icon={<FileSpreadsheet className="w-3.5 h-3.5" />}>
            Export
          </Button>
        </Link>

        <Link href="/study/new">
          <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
            New Study
          </Button>
        </Link>
      </div>
    </header>
  );
};

