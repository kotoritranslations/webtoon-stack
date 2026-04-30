// src/app/layout.tsx

import { AuthProvider } from "@/components/providers/session-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "SITE — Lee series gratis",
  description: "Descubre miles de series de webtoon, manga y cómics de creadores independientes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  const isDark = theme === 'dark';
                  const html = document.documentElement;
                  if (isDark) {
                    html.style.backgroundColor = '#0a0a0a';
                    html.style.color = '#fafafa';
                    html.setAttribute('data-theme', 'dark');
                  } else {
                    html.style.backgroundColor = '#fafafa';
                    html.style.color = '#0f0f0f';
                    html.setAttribute('data-theme', 'light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${geist.variable} ${geistMono.variable} font-sans`}>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}