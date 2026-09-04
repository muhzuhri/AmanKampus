'use client';

import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import ViolationsCatalogSection from '@/components/home/ViolationsCatalogSection';
import TrustAndSecuritySection from '@/components/home/TrustAndSecuritySection';
import EncryptionSimulator from '@/components/home/EncryptionSimulator';
import MentalHealthModule from '@/components/home/MentalHealthModule';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 font-sans relative overflow-hidden">
      <main className="relative z-10 pt-24 pb-20 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto space-y-32">
        <HeroSection />
        <ViolationsCatalogSection />
        <TrustAndSecuritySection />
        <EncryptionSimulator />
        <MentalHealthModule />
      </main>
    </div>
  );
}



