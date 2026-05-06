// src/app/layout.tsx

import { AuthProvider } from "@/components/providers/session-provider";
import { NavbarWrapper } from "@/components/NavbarWrapper";
import { Sidebar } from "@/components/sidebar";
import { SidebarProvider } from "@/context/sidebar-context";
import { Footer } from "@/components/Footer";
import { getSiteSettings } from "@/config/site";
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

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    title: `${site.name} — ${site.description}`,
    description: site.tagline,
    icons: {
      icon: site.faviconUrl ?? site.logoUrl ?? "/favicon.ico",
      apple: site.faviconUrl ?? site.logoUrl ?? "/apple-touch-icon.png",
    },
  };
}

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
          <SidebarProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <div className="flex min-w-0 flex-1 flex-col lg:pl-14">
                <NavbarWrapper />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
            </div>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}