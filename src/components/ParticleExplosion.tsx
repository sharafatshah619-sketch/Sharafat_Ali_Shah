import React, { useEffect, useRef, useCallback } from 'react';

interface ParticleExplosionProps {
  active: boolean;
  tubePositions?: { x: number; y: number; color?: string }[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  shape: 'circle' | 'star' | 'droplet';
  rotation: number;
  vRot: number;
  gravity: number;
  drag: number;
  shimmer: boolean;
  shimmerSpeed: number;
}

interface ShockwaveRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  growth: number;
}

const PALETTE = [
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#10b981', // emerald
  '#eab308', // gold
  '#ec4899', // pink
  '#9333ea', // purple
  '#f97316', // orange
  '#ef4444', // red
  '#84cc16', // lime
  '#fde047', // bright star yellow
  '#ffffff', // sparkle white
];

export const ParticleExplosion: React.FC<ParticleExplosionProps> = ({
  active,
  tubePositions = [],
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const ringsRef = useRef<ShockwaveRing[]>([]);
  const animFrameId = useRef<number | null>(null);
  const isRunningRef = useRef<boolean>(false);

  // Helper to spawn a blast at (x, y)
  const spawnBlast = useCallback(
    (
      x: number,
      y: number,
      count: number = 60,
      baseColor?: string,
      velocityScale: number = 1.0
    ) => {
      // Add shockwave ring
      ringsRef.current.push({
        x,
        y,
        radius: 5,
        maxRadius: 80 * velocityScale,
        color: baseColor || '#38bdf8',
        alpha: 0.8,
        growth: 4 * velocityScale,
      });

      // Add particles
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 8 + 3) * velocityScale;
        const color =
          baseColor && Math.random() > 0.4
            ? baseColor
            : PALETTE[Math.floor(Math.random() * PALETTE.length)];

        const shapes: Particle['shape'][] = ['circle', 'star', 'droplet'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];

        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (Math.random() * 3 + 1), // upward bias
          size: Math.random() * 5 + 3,
          color,
          alpha: 1,
          decay: Math.random() * 0.015 + 0.008,
          shape,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.2,
          gravity: 0.16,
          drag: 0.97,
          shimmer: Math.random() > 0.5,
          shimmerSpeed: Math.random() * 10 + 5,
        });
      }
    },
    []
  );

  // Trigger grand celebration sequence
  useEffect(() => {
    if (!active) {
      particlesRef.current = [];
      ringsRef.current = [];
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Immediate eruption from tubes if coordinates available
    if (tubePositions.length > 0) {
      tubePositions.forEach((pos, idx) => {
        setTimeout(() => {
          spawnBlast(pos.x, pos.y, 35, pos.color, 0.9);
        }, idx * 70);
      });
    }

    // 2. Sequential Grand Fireworks bursts across screen
    const burstSequence = [
      { x: width * 0.5, y: height * 0.35, color: '#facc15', delay: 100, scale: 1.4 },
      { x: width * 0.25, y: height * 0.28, color: '#06b6d4', delay: 350, scale: 1.2 },
      { x: width * 0.75, y: height * 0.26, color: '#ec4899', delay: 550, scale: 1.3 },
      { x: width * 0.4, y: height * 0.42, color: '#10b981', delay: 800, scale: 1.1 },
      { x: width * 0.6, y: height * 0.38, color: '#9333ea', delay: 1050, scale: 1.3 },
      { x: width * 0.5, y: height * 0.25, color: '#f59e0b', delay: 1300, scale: 1.5 },
    ];

    burstSequence.forEach(({ x, y, color, delay, scale }) => {
      setTimeout(() => {
        spawnBlast(x, y, 70, color, scale);
      }, delay);
    });
  }, [active, tubePositions, spawnBlast]);

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    isRunningRef.current = true;

    const render = () => {
      if (!isRunningRef.current) return;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Render shockwave rings
      const rings = ringsRef.current;
      for (let i = rings.length - 1; i >= 0; i--) {
        const ring = rings[i];
        ring.radius += ring.growth;
        ring.alpha -= 0.025;

        if (ring.alpha <= 0 || ring.radius >= ring.maxRadius) {
          rings.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color;
        ctx.globalAlpha = Math.max(0, ring.alpha);
        ctx.lineWidth = Math.max(1, 4 * (1 - ring.radius / ring.maxRadius));
        ctx.shadowColor = ring.color;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();
      }

      // Render particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.vx *= p.drag;
        p.vy *= p.drag;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.y > window.innerHeight + 50) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        let currentAlpha = p.alpha;
        if (p.shimmer) {
          currentAlpha *= 0.6 + 0.4 * Math.sin(Date.now() * 0.015 * p.shimmerSpeed);
        }
        ctx.globalAlpha = Math.max(0, Math.min(1, currentAlpha));

        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size * 1.5;

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'star') {
          // 4-point sparkle star
          const s = p.size * 1.4;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(0, 0, s, 0);
          ctx.quadraticCurveTo(0, 0, 0, s);
          ctx.quadraticCurveTo(0, 0, -s, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s);
          ctx.closePath();
          ctx.fill();
        } else {
          // Droplet / oval shape
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.7, p.size * 1.3, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      isRunningRef.current = false;
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Allow clicking on the screen while celebration is active to burst more fireworks!
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!active) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    spawnBlast(clickX, clickY, 80, undefined, 1.3);
  };

  if (!active && particlesRef.current.length === 0 && ringsRef.current.length === 0) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      className={`fixed inset-0 z-40 w-full h-full transition-opacity duration-700 pointer-events-none`}
      style={{ touchAction: 'none' }}
    />
  );
};
