import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ToastProvider } from '@/components/providers/toast-provider';
import { AppShell } from '@/components/layout/AppShell';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Time Study & Work Measurement | Pen Assembly',
    template: '%s | Pen Assembly Time Study',
  },
  description: 'Academic Work Measurement and Time Study System for Manual Pen Assembly Productivity Improvement. Basic Industrial Engineering.',
  keywords: [
    'time study', 'work measurement', 'standard time', 'pen assembly',
    'industrial engineering', 'productivity improvement', 'line balancing', 'motion study',
  ],
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            <AppShell>
              {children}
            </AppShell>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
