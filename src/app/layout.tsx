import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import "./globals.css";
import { ThemeProvider } from '@/context/ThemeContext';
import { SyncProvider } from '@/context/SyncContext';
import LayoutContent from '@/components/LayoutContent';
import FloatingControls from '@/components/FloatingControls';
import AutoSync from '@/components/AutoSync';

// Optimize font loading - only load essential font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: "HFC Reviews Dashboard",
  description: "Dashboard for monitoring HFC customer reviews and agent performance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={inter.variable}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'light';
                  const html = document.documentElement;
                  html.classList.remove('dark', 'hfc');
                  if (theme === 'dark') {
                    html.classList.add('dark');
                  } else if (theme === 'hfc') {
                    html.classList.add('hfc');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className="font-sans antialiased dark:bg-gray-900"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <SyncProvider>
            <AutoSync />
            <LayoutContent>
              {children}
            </LayoutContent>
            {/* Small floating controls (always present) so theme/settings are reachable */}
            <FloatingControls />
          </SyncProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}