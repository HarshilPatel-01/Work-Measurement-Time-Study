'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Timer,
  FileSpreadsheet,
  TrendingUp,
  Cpu,
  Sliders,
  Sparkles,
  Database,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [sampleModalOpen, setSampleModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Time Studies', href: '/study', icon: Timer },
    { label: 'New Study Setup', href: '/study/new', icon: PlusCircle },
    { label: 'Method Improvement', href: '/improvement', icon: TrendingUp },
    { label: 'IE Tools & OPC / FPC', href: '/tools', icon: Cpu },
    { label: 'PFD Allowance Calculator', href: '/allowances', icon: Sliders },
    { label: 'Productivity Analysis', href: '/analysis', icon: Sparkles },
    { label: 'Reports & Export', href: '/reports', icon: FileSpreadsheet },
  ];

  const handleLoadSample = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/studies/seed', { method: 'POST' });
      if (res.ok) {
        setSampleModalOpen(false);
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/studies/reset', { method: 'POST' });
      if (res.ok) {
        setResetModalOpen(false);
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <aside
        className={`relative flex flex-col border-r border-border bg-card/95 backdrop-blur-md transition-all duration-200 z-30 select-none ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-md border border-amber-500/30 bg-black flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="font-heading font-bold text-sm tracking-tight text-foreground block truncate">
                  TimeStudy IE
                </span>
                <span className="text-[10.5px] text-indigo-600 dark:text-indigo-400 font-medium block truncate">
                  Manual Pen Assembly
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
          <div className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            {!collapsed ? 'Work Measurement' : '•'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-gradient-to-r from-indigo-500/15 to-violet-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Bottom Data Controls */}
        <div className="p-3 border-t border-border space-y-2">
          {!collapsed && (
            <div className="px-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Data Management
            </div>
          )}

          <button
            onClick={() => setSampleModalOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
            title="Load Pen Assembly Sample Dataset"
          >
            <Database className="w-3.5 h-3.5 flex-shrink-0" />
            {!collapsed && <span className="truncate">Load Sample Data</span>}
          </button>

          <button
            onClick={() => setResetModalOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
            title="Reset All Study Data"
          >
            <RotateCcw className="w-3.5 h-3.5 flex-shrink-0" />
            {!collapsed && <span className="truncate">Reset All Data</span>}
          </button>
        </div>
      </aside>

      {/* Confirmation Modal: Load Sample Data */}
      <Modal
        isOpen={sampleModalOpen}
        onClose={() => setSampleModalOpen(false)}
        title="Load Pen Assembly Sample Dataset"
        description="This will populate your local database with real-world Before & After pen assembly time studies."
        footer={
          <>
            <Button variant="secondary" onClick={() => setSampleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={loading} onClick={handleLoadSample}>
              Load Dataset
            </Button>
          </>
        }
      >
        <div className="space-y-2 text-muted-foreground text-xs leading-relaxed">
          <p>The sample dataset includes:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Baseline Study (BEFORE)</strong>: 30 cycles across 9 pen assembly elements with disorganized bin pickups and unstandardized methods.</li>
            <li><strong>Optimized Study (AFTER)</strong>: 30 cycles with gravity chutes, funnels, snap jigs, and ergonomic bench layout.</li>
            <li>PFD allowances, Westinghouse performance ratings, and full cycle distributions.</li>
          </ul>
        </div>
      </Modal>

      {/* Confirmation Modal: Reset All Data */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset All Study Records?"
        description="Are you sure you want to delete all studies and timing records?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setResetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={loading} onClick={handleResetData}>
              Reset Everything
            </Button>
          </>
        }
      >
        <p className="text-muted-foreground text-xs leading-relaxed">
          This operation clears all studies, elements, and observations from your local SQLite database. You can always reload the standard pen assembly sample dataset at any time.
        </p>
      </Modal>
    </>
  );
};

