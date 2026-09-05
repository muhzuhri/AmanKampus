'use client';

import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import ViolationsCatalogSection from '@/components/home/ViolationsCatalogSection';
import TrustAndSecuritySection from '@/components/home/TrustAndSecuritySection';
import EncryptionSimulator from '@/components/home/EncryptionSimulator';
import MentalHealthModule from '@/components/home/MentalHealthModule';
import Home3DCubesBackground from '@/components/home/Home3DCubesBackground';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-transparent text-stone-900 dark:text-stone-100 font-sans relative overflow-hidden">
      {/* 3D Floating Interactive Cubes Background — Khusus Halaman Beranda (Seluruh Halaman Sebelum Footer) */}
      <Home3DCubesBackground />

      <main className="relative z-10 pt-24 pb-20 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto space-y-24 md:space-y-28">
        <HeroSection />
        <ViolationsCatalogSection />
        <TrustAndSecuritySection />
        <EncryptionSimulator />
        <MentalHealthModule />
      </main>
    </div>
  );
}



