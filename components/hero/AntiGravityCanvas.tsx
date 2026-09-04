'use client';

import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import AntiGravityScene from './AntiGravityScene';
import { useTheme } from 'next-themes';

export default function AntiGravityCanvas() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR or before mounting, default to dark classes to match initial theme hydration
  const isDark = mounted ? resolvedTheme === 'dark' : true;

  if (!mounted) {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-500">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full blur-[140px] transition-all duration-700 pointer-events-none bg-teal-950/25 opacity-70" />
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] transition-all duration-700 pointer-events-none bg-purple-950/20 opacity-60" />
        <div className="absolute bottom-0 right-1/4 w-[650px] h-[550px] rounded-full blur-[130px] transition-all duration-700 pointer-events-none bg-emerald-950/20 opacity-60" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-500">
      {/* Background Radial Glow Blobs (Adapts to Dark / Light Mode) */}
      <div
        className={`absolute top-0 right-0 w-[700px] h-[700px] rounded-full blur-[140px] transition-all duration-700 pointer-events-none ${
          isDark
            ? 'bg-teal-950/25 opacity-70'
            : 'bg-teal-100/60 opacity-80'
        }`}
      />
      <div
        className={`absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] transition-all duration-700 pointer-events-none ${
          isDark
            ? 'bg-purple-950/20 opacity-60'
            : 'bg-indigo-100/50 opacity-70'
        }`}
      />
      <div
        className={`absolute bottom-0 right-1/4 w-[650px] h-[550px] rounded-full blur-[130px] transition-all duration-700 pointer-events-none ${
          isDark
            ? 'bg-emerald-950/20 opacity-60'
            : 'bg-emerald-100/50 opacity-70'
        }`}
      />

      {/* R3F Canvas - Only rendered client side */}
      <Canvas
        camera={{ position: [0, 0, 7], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        className="w-full h-full"
      >
        <AntiGravityScene />
      </Canvas>
    </div>
  );
}
