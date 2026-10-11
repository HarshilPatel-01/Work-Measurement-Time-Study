import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center text-foreground p-4">
      <div className="card-premium p-8 md:p-12 text-center max-w-md w-full border border-border shadow-xl">
        <div className="text-7xl font-heading font-black bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent mb-3">
          404
        </div>
        <h1 className="text-xl font-heading font-bold text-foreground mb-2">Page Not Found</h1>
        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
          The requested time study or engineering page could not be located.
        </p>
        <Link href="/dashboard" className="btn-primary inline-flex justify-center w-full">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
