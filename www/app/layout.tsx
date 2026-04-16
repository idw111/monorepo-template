import type { Metadata } from 'next';
import { IBM_Plex_Sans_KR, Space_Grotesk } from 'next/font/google';
import type { ReactNode } from 'react';
import { AppProvider } from '@/contexts/app-context';
import './globals.css';

const bodyFont = IBM_Plex_Sans_KR({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const displayFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Monorepo Template',
  description: 'Next.js frontend scaffold for the monorepo template.',
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body className={`${bodyFont.variable} ${displayFont.variable} min-h-screen bg-canvas font-sans text-ink`}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
