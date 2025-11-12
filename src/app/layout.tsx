import type { Metadata } from "next";
import { Inter, Space_Grotesk, IBM_Plex_Mono } from 'next/font/google'
import "./globals.css";
import { ThemeProvider } from '@/context/ThemeContext';
import { SyncProvider } from '@/context/SyncContext';
import TopNav from '@/components/TopNav';
import HFCFooter from '@/components/HFCFooter';
import FloatingControls from '@/components/FloatingControls';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
  display: 'swap',
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
      className={`${inter.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable}`}
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
            <TopNav />
            <main className="pt-16">
              {children}
            </main>
            {/* HFC footer holds theme toggle and settings link for HFC theme only */}
            <HFCFooter />
            {/* Small floating controls (always present) so theme/settings are reachable */}
            <FloatingControls />
          </SyncProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}