import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AmanKampus - Platform Keamanan & Pelaporan Anonim Kampus",
  description: "Sistem pelaporan terenkripsi end-to-end untuk menciptakan lingkungan kampus yang aman, inklusif, dan bebas perundungan.",
};

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CommandPalette } from "@/components/CommandPalette";
import AntiGravityCanvas from "@/components/hero/AntiGravityCanvas";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#060913] dark:text-slate-100 relative" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* Global 3D Anti-Gravity Floating Micro-Cubes Canvas across all user pages */}
          <AntiGravityCanvas />

          <Navbar />
          <CommandPalette />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
