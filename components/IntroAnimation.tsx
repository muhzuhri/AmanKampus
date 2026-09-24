'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function IntroAnimation() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<'idle' | 'center' | 'fly' | 'done'>('idle');

  useEffect(() => {
    // Only run on the homepage
    if (pathname !== '/') {
      setPhase('done');
      return;
    }
    setPhase('center');

    // After holding center → fly to navbar
    const flyTimer = setTimeout(() => setPhase('fly'), 1400);
    // After fly → remove overlay entirely
    const doneTimer = setTimeout(() => {
      setPhase('done');
    }, 2800);

    return () => {
      clearTimeout(flyTimer);
      clearTimeout(doneTimer);
    };
  }, [pathname]);

  if (phase === 'idle' || phase === 'done') return null;

  return (
    <AnimatePresence>
      {(phase === 'center' || phase === 'fly') && (
        /* ── Full-screen dark teal overlay ── */
        <motion.div
          key="intro-overlay"
          className="fixed inset-0 z-9999 flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: '#061f1d' }}
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === 'fly' ? 0 : 1 }}
          transition={{ duration: 1.1, ease: 'easeInOut', delay: phase === 'fly' ? 0.6 : 0 }}
        >
          {/* ── Subtle radial glow behind logo ── */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'center' ? 1 : 0 }}
            transition={{ duration: 0.8 }}
            style={{
              background:
                'radial-gradient(ellipse 55% 40% at 50% 50%, rgba(20,184,166,0.18) 0%, transparent 70%)',
            }}
          />

          {/* ── Animated ring pulse ── */}
          {phase === 'center' && (
            <>
              <motion.div
                className="absolute rounded-full border border-teal-500/20"
                initial={{ scale: 0.6, opacity: 0.6 }}
                animate={{ scale: 2.4, opacity: 0 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                style={{ width: 180, height: 180 }}
              />
              <motion.div
                className="absolute rounded-full border border-teal-400/15"
                initial={{ scale: 0.6, opacity: 0.4 }}
                animate={{ scale: 2.8, opacity: 0 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
                style={{ width: 180, height: 180 }}
              />
            </>
          )}

          {/* ── Central Logo Block ── */}
          <motion.div
            className="flex flex-col items-center gap-5 select-none"
            initial={{ scale: 1, opacity: 0, y: 0 }}
            animate={
              phase === 'center'
                ? { scale: 1, opacity: 1, y: 0 }
                : {
                    /* Fly toward top-left navbar position.
                       translateX/Y nudge the element toward the top-left corner.
                       Scale collapses from hero size down to navbar-icon size. */
                    scale: 0.13,
                    opacity: 0,
                    x: 'calc(-42vw + 24px)',
                    y: 'calc(-44vh + 18px)',
                  }
            }
            transition={
              phase === 'center'
                ? { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
                : { duration: 0.85, ease: [0.76, 0, 0.24, 1] }
            }
          >
            {/* Shield logo */}
            <motion.div
              className="relative"
              animate={phase === 'center' ? { y: [0, -8, 0] } : {}}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-2xl bg-teal-400/10 blur-2xl scale-125" />
              <div
                className="relative w-44 h-44 rounded-2xl overflow-hidden border-2 border-teal-700/60 shadow-2xl"
                style={{ boxShadow: '0 0 60px rgba(20,184,166,0.25), 0 0 120px rgba(20,184,166,0.1)' }}
              >
                <Image
                  src="/images/logii.png"
                  alt="AmanKampus Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>

            {/* Brand name */}
            <motion.div
              className="flex flex-col items-center gap-1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: phase === 'center' ? 1 : 0, y: phase === 'center' ? 0 : 12 }}
              transition={{ duration: 0.75, delay: 0.25 }}
            >
              <span
                className="text-4xl font-extrabold tracking-tight text-white"
                style={{ textShadow: '0 0 40px rgba(20,184,166,0.5)' }}
              >
                AmanKampus
              </span>
            </motion.div>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
