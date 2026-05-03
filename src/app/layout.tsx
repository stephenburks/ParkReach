import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { SavesProvider } from '@/context/SavesContext';
import { QueryProvider } from '@/components/QueryProvider';
import { DarkModeProvider } from '@/components/DarkModeProvider';
import { Toaster } from '@/components/ui/sonner';
import { SkipLink } from '@/components/SkipLink';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ParkReach',
  description: 'Discover America\'s national parks — search, filter, and explore park details powered by the NPS API.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col antialiased`}>
        <SkipLink />
        <QueryProvider>
          <DarkModeProvider>
            <AuthProvider>
              <SavesProvider>{children}</SavesProvider>
            </AuthProvider>
            <Toaster />
          </DarkModeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
