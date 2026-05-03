import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SavesProvider } from "@/context/SavesContext";
import { DarkModeProvider } from "@/components/DarkModeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "National Parks Explorer",
  description: "Discover America's national parks — search, filter, and explore park details powered by the NPS API.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var dark = localStorage.getItem('darkMode');
                if (dark === 'true' || (!dark && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col antialiased`}>
        <DarkModeProvider>
          <AuthProvider>
            <SavesProvider>{children}</SavesProvider>
          </AuthProvider>
        </DarkModeProvider>
      </body>
    </html>
  );
}
