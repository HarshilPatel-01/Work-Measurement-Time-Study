'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-foreground p-4">
      <div className="card-premium p-8 md:p-12 text-center max-w-md w-full border border-rose-500/20 shadow-xl">
        <div className="text-7xl font-heading font-black bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent mb-3">
          500
        </div>
        <h1 className="text-xl font-heading font-bold text-foreground mb-2">Calculation Error Occurred</h1>
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
          {error.message || 'An unexpected error occurred while processing the time study calculation.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary flex-1">
            Try Again
          </button>
          <Link href="/dashboard" className="btn-secondary flex-1">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
