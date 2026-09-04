'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

interface MicroCubeData {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  speed: number;
  floatOffset: number;
  colorDark: string;
  colorLight: string;
  wireframe?: boolean;
}

// Single Floating Micro Cube Component
function FloatingMicroCube({
  data,
  isDark,
}: {
  data: MicroCubeData;
  isDark: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const initialPos = useRef(data.position);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const t = time * data.speed + data.floatOffset;

    // Gentle 3D continuous rotation
    meshRef.current.rotation.x = data.rotation[0] + t * 0.25;
    meshRef.current.rotation.y = data.rotation[1] + t * 0.35;
    meshRef.current.rotation.z = data.rotation[2] + Math.sin(t * 0.5) * 0.15;

    // Smooth Anti-Gravity Floating Motion (Y-axis oscillation)
    const floatY = Math.sin(t * 0.8) * 0.35;

    // Mouse Parallax Interaction (Smooth Lerp)
    const mouseX = (state.pointer.x * state.viewport.width) / 16;
    const mouseY = (state.pointer.y * state.viewport.height) / 16;

    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      initialPos.current[0] + mouseX * 0.2,
      0.05
    );
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      initialPos.current[1] + floatY + mouseY * 0.2,
      0.05
    );
  });

  const currentColor = isDark ? data.colorDark : data.colorLight;

  return (
    <mesh ref={meshRef} position={data.position} scale={data.scale}>
      <boxGeometry args={[0.22, 0.22, 0.22]} />
      <meshStandardMaterial
        color={currentColor}
        roughness={isDark ? 0.2 : 0.4}
        metalness={isDark ? 0.8 : 0.3}
        wireframe={data.wireframe || false}
        emissive={currentColor}
        emissiveIntensity={isDark ? 0.25 : 0.05}
        transparent
        opacity={isDark ? 0.85 : 0.75}
      />
    </mesh>
  );
}

export default function AntiGravityScene() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Generate an elegant array of small micro-cubes distributed across the viewport height
  const microCubes = useMemo<MicroCubeData[]>(() => {
    const paletteDark = ['#0d9488', '#10b981', '#38bdf8', '#8b5cf6', '#6366f1', '#14b8a6'];
    const paletteLight = ['#0f766e', '#059669', '#0284c7', '#4f46e5', '#7c3aed', '#0d9488'];

    const count = 48;
    const cubes: MicroCubeData[] = [];

    for (let i = 0; i < count; i++) {
      const colorIdx = i % paletteDark.length;
      cubes.push({
        position: [
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 22, // Vertical spread for full landing page
          (Math.random() - 0.5) * 8 - 1,
        ],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
        scale: 0.6 + Math.random() * 0.8, // Small micro cubes (scale 0.6 - 1.4 -> ~0.15 - 0.3 units)
        speed: 0.4 + Math.random() * 0.6,
        floatOffset: Math.random() * Math.PI * 2,
        colorDark: paletteDark[colorIdx],
        colorLight: paletteLight[colorIdx],
        wireframe: i % 5 === 0, // Occasional sleek wireframe cube
      });
    }
    return cubes;
  }, []);

  return (
    <>
      {/* Lighting Setup adjusting based on theme */}
      <ambientLight intensity={isDark ? 0.6 : 1.2} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={isDark ? 1.5 : 0.8}
        color={isDark ? '#38bdf8' : '#0f766e'}
      />
      <pointLight
        position={[-8, -5, -4]}
        intensity={isDark ? 2 : 1}
        color={isDark ? '#8b5cf6' : '#6366f1'}
      />

      {/* Floating Micro Cubes */}
      {microCubes.map((cube, idx) => (
        <FloatingMicroCube key={idx} data={cube} isDark={isDark} />
      ))}

      {/* Ambient Sparkles Particles */}
      <Sparkles
        count={80}
        scale={[18, 24, 10]}
        size={isDark ? 2.5 : 1.8}
        speed={0.3}
        opacity={isDark ? 0.5 : 0.35}
        color={isDark ? '#38bdf8' : '#0d9488'}
      />
    </>
  );
}
