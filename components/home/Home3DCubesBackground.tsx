'use client';

import React, { useEffect, useRef } from 'react';

interface Cube3D {
  x: number;
  y: number;
  z: number;
  size: number;
  rx: number;
  ry: number;
  rz: number;
  vrx: number;
  vry: number;
  vrz: number;
  vx: number;
  vy: number;
  vz: number;
  baseAlpha: number;
  colorType: 'teal' | 'indigo' | 'emerald';
}

/**
 * Sticky 3D Floating Small Cubes Background — Khusus Halaman Beranda (Homepage Only)
 * Menampilkan banyak kotak-kotak 3D kecil melayang interaktif yang tetap aktif & melayang secara sticky saat halaman di-scroll.
 */
export default function Home3DCubesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; rx: number; ry: number }>({
    x: 0,
    y: 0,
    rx: 0,
    ry: 0,
  });
  const scrollYRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      const centerX = width / 2;
      const centerY = height / 2;
      mouseRef.current.rx = ((e.clientY - centerY) / centerY) * 0.4;
      mouseRef.current.ry = ((e.clientX - centerX) / centerX) * 0.4;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Cube unit 3D vertices (8 corners of a cube)
    const unitVertices = [
      [-1, -1, -1],
      [1, -1, -1],
      [1, 1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, 1],
      [-1, 1, 1],
    ];

    // 12 Edges connecting vertices
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // Back face
      [4, 5], [5, 6], [6, 7], [7, 4], // Front face
      [0, 4], [1, 5], [2, 6], [3, 7], // Connecting edges
    ];

    // 6 Faces (4 vertices per face)
    const faces = [
      [0, 1, 2, 3], // Back
      [4, 5, 6, 7], // Front
      [0, 1, 5, 4], // Bottom
      [2, 3, 7, 6], // Top
      [0, 3, 7, 4], // Left
      [1, 2, 6, 5], // Right
    ];

    // Initialize 75-85 small 3D cubes for rich density
    const cubeCount = Math.min(85, Math.max(50, Math.floor((width * height) / 16000)));
    const cubes: Cube3D[] = [];
    const colorOptions: ('teal' | 'indigo' | 'emerald')[] = ['teal', 'teal', 'indigo', 'emerald'];

    for (let i = 0; i < cubeCount; i++) {
      cubes.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 750 + 100,
        size: Math.random() * 14 + 7, // Small 3D cubes (7px - 21px)
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
        vrx: (Math.random() - 0.5) * 0.018,
        vry: (Math.random() - 0.5) * 0.018,
        vrz: (Math.random() - 0.5) * 0.015,
        vx: (Math.random() - 0.5) * 0.75,
        vy: (Math.random() - 0.5) * 0.75,
        vz: (Math.random() - 0.5) * 0.45,
        baseAlpha: Math.random() * 0.5 + 0.4,
        colorType: colorOptions[Math.floor(Math.random() * colorOptions.length)],
      });
    }

    let currentCamRx = 0;
    let currentCamRy = 0;
    const focalLength = 480;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      currentCamRx += (mouseRef.current.rx - currentCamRx) * 0.04;
      currentCamRy += (mouseRef.current.ry - currentCamRy) * 0.04;

      const cosCamX = Math.cos(currentCamRx);
      const sinCamX = Math.sin(currentCamRx);
      const cosCamY = Math.cos(currentCamRy);
      const sinCamY = Math.sin(currentCamRy);

      // Subtle parallax scroll offset
      const scrollOffset = scrollYRef.current * 0.05;

      for (let i = 0; i < cubes.length; i++) {
        const c = cubes[i];

        // 3D Motion Drift
        c.x += c.vx;
        c.y += c.vy;
        c.z += c.vz;

        c.rx += c.vrx;
        c.ry += c.vry;
        c.rz += c.vrz;

        const halfW = (width * 1.5) / 2;
        const halfH = (height * 1.5) / 2;
        if (Math.abs(c.x) > halfW) c.vx *= -1;
        if (Math.abs(c.y) > halfH) c.vy *= -1;
        if (c.z < 80 || c.z > 850) c.vz *= -1;

        // Cube Rotation Matrix
        const cosRx = Math.cos(c.rx), sinRx = Math.sin(c.rx);
        const cosRy = Math.cos(c.ry), sinRy = Math.sin(c.ry);
        const cosRz = Math.cos(c.rz), sinRz = Math.sin(c.rz);

        // Project Cube Vertices
        const projectedVertices: { x: number; y: number; z: number }[] = [];

        for (let v = 0; v < unitVertices.length; v++) {
          const [ux, uy, uz] = unitVertices[v];
          let vx = ux * c.size;
          let vy = uy * c.size;
          let vz = uz * c.size;

          // Rotate X, Y, Z
          let y1 = vy * cosRx - vz * sinRx;
          let z1 = vz * cosRx + vy * sinRx;
          let x1 = vx * cosRy + z1 * sinRy;
          let z2 = z1 * cosRy - vx * sinRy;
          let x2 = x1 * cosRz - y1 * sinRz;
          let y2 = y1 * cosRz + x1 * sinRz;

          // Translate to World Space (including scroll parallax)
          let wx = x2 + c.x;
          let wy = y2 + c.y - (scrollOffset % 100);
          let wz = z2 + c.z;

          // Apply Global Camera Rotation
          let cx1 = wx * cosCamY - wz * sinCamY;
          let cz1 = wz * cosCamY + wx * sinCamY;
          let cy1 = wy * cosCamX - cz1 * sinCamX;
          let cz2 = cz1 * cosCamX + wy * sinCamX;

          // 3D Perspective Projection
          const scale = focalLength / (focalLength + cz2);
          const px = cx1 * scale + width / 2;
          const py = cy1 * scale + height / 2;

          projectedVertices.push({ x: px, y: py, z: cz2 });
        }

        const scale = focalLength / (focalLength + c.z);
        const alpha = Math.max(0.12, Math.min(0.85, scale * c.baseAlpha));

        // Color Palettes
        let strokeColor = `rgba(45, 212, 191, ${alpha * 0.85})`; // Teal
        let fillColor = `rgba(13, 148, 136, ${alpha * 0.15})`;

        if (c.colorType === 'indigo') {
          strokeColor = `rgba(129, 140, 248, ${alpha * 0.85})`;
          fillColor = `rgba(79, 70, 229, ${alpha * 0.15})`;
        } else if (c.colorType === 'emerald') {
          strokeColor = `rgba(52, 211, 153, ${alpha * 0.85})`;
          fillColor = `rgba(16, 185, 129, ${alpha * 0.15})`;
        }

        // Draw Translucent 3D Faces
        for (let f = 0; f < faces.length; f++) {
          const faceIdxs = faces[f];
          ctx.beginPath();
          ctx.moveTo(projectedVertices[faceIdxs[0]].x, projectedVertices[faceIdxs[0]].y);
          for (let k = 1; k < faceIdxs.length; k++) {
            ctx.lineTo(projectedVertices[faceIdxs[k]].x, projectedVertices[faceIdxs[k]].y);
          }
          ctx.closePath();
          ctx.fillStyle = fillColor;
          ctx.fill();
        }

        // Draw Crisp 3D Cube Edges
        ctx.beginPath();
        for (let e = 0; e < edges.length; e++) {
          const p1 = projectedVertices[edges[e][0]];
          const p2 = projectedVertices[edges[e][1]];
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        }
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = Math.max(0.9, 1.6 * scale);
        ctx.stroke();
      }

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full block opacity-75 dark:opacity-90" />
    </div>
  );
}
