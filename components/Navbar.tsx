'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Formulir', path: '/report' },
    { name: 'Pelacakan', path: '/track' },
    { name: 'Bantuan & PFA', path: '/support' },
    { name: 'Edukasi', path: '/education' },
  ];

  const isDark = resolvedTheme === 'dark';

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 dark:bg-[#060913]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs'
          : 'bg-white/70 dark:bg-[#060913]/60 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 h-18 flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 group-hover:opacity-90 transition-opacity">
            <Image
              src="/images/logo.png"
              alt="AmanKampus Logo"
              width={36}
              height={36}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            AmanKampus
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.name}
                href={link.path}
                className={`relative px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-teal-700 dark:text-teal-400 font-semibold bg-teal-50 dark:bg-teal-950/50'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 border border-teal-200 dark:border-teal-500/40 rounded-lg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 350, damping: 32 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle Button */}
          {mounted && (
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 transition-all duration-200 shadow-xs cursor-pointer"
              aria-label="Toggle theme"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun className="w-4.5 h-4.5 text-amber-400" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-slate-700" />
              )}
            </button>
          )}

          {/* Command Palette Trigger Button */}
          <button
            onClick={() => {
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
            }}
            className="flex items-center gap-2.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200/90 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl px-3.5 py-2 transition-all dark:bg-slate-800/80 dark:hover:bg-slate-700/90 dark:border-slate-700 dark:text-slate-200 dark:hover:text-white cursor-pointer shadow-xs"
          >
            <span>Pusat Perintah</span>
            <span className="flex items-center gap-0.5 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 px-1.5 py-0.5 font-sans text-slate-800 dark:text-slate-200 shadow-xs font-bold text-[11px]">
              <span>⌘</span>K
            </span>
          </button>
          
          
        </div>

        {/* Mobile Hamburger & Theme Button */}
        <div className="flex items-center gap-2 md:hidden">
          {mounted && (
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          )}
          <button
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800"
          >
            <div className="px-6 py-5 space-y-2 flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    pathname === link.path
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-3 mt-1 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/report"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex justify-center bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition-colors"
                >
                  Buat Laporan Anonim
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
