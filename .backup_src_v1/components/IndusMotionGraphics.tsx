import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Sparkles, Sun, Sunset, Moon, Play, Pause, Volume2, VolumeX, Eye } from 'lucide-react';

export type AmbienceMood = 'golden-hour' | 'sunset-twilight' | 'starlit-night';

interface IndusMotionGraphicsProps {
  className?: string;
  showControls?: boolean;
  compact?: boolean;
  initialMood?: AmbienceMood;
  onMoodChange?: (mood: AmbienceMood) => void;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  targetAlpha: number;
  hueShift: number;
  pulsePhase: number;
  pulseSpeed: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

export const IndusMotionGraphics: React.FC<IndusMotionGraphicsProps> = ({
  className = '',
  showControls = true,
  compact = false,
  initialMood = 'golden-hour',
  onMoodChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Ambience state
  const [mood, setMood] = useState<AmbienceMood>(initialMood);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [showParticles, setShowParticles] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Audio Context reference for gentle peaceful anime slice-of-life wind chime synthesizer
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Cursor tracking for interactive spring displacement
  const mouseRef = useRef<{ x: number; y: number; active: boolean; targetX: number; targetY: number }>({
    x: 0.5,
    y: 0.5,
    active: false,
    targetX: 0.5,
    targetY: 0.5
  });

  // Particles & ripples storage
  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const timeRef = useRef<number>(0);

  // Color schemes for each slice-of-life anime & Indus motion theme
  const moodPalettes = {
    'golden-hour': {
      name: 'Golden Hour (4:30 PM)',
      subtitle: 'Warm afternoon sunbeams & drifting dust motes',
      accent: 'amber',
      waveGradients: [
        ['rgba(245, 158, 11, 0.7)', 'rgba(234, 88, 12, 0.4)', 'rgba(251, 191, 36, 0.8)'],
        ['rgba(217, 119, 6, 0.5)', 'rgba(249, 115, 22, 0.6)', 'rgba(253, 224, 71, 0.4)'],
        ['rgba(180, 83, 9, 0.4)', 'rgba(239, 68, 68, 0.3)', 'rgba(245, 158, 11, 0.6)'],
        ['rgba(251, 146, 60, 0.5)', 'rgba(244, 63, 94, 0.3)', 'rgba(254, 240, 138, 0.7)']
      ],
      coreGlow: 'rgba(251, 191, 36, 0.25)',
      particleColor: [251, 191, 36],
      canvasBg: 'from-amber-50/70 via-orange-50/40 to-stone-50/30 dark:from-stone-950 dark:via-amber-950/20 dark:to-stone-900',
      sunbeamColor: 'rgba(253, 230, 138, 0.12)',
      vibeTag: '☀️ Nostalgic Golden Hour'
    },
    'sunset-twilight': {
      name: 'Sunset Twilight (黄昏)',
      subtitle: 'Indus continuous gradient: saffron to twilight indigo',
      accent: 'orange',
      waveGradients: [
        ['rgba(249, 115, 22, 0.75)', 'rgba(219, 39, 119, 0.5)', 'rgba(99, 102, 241, 0.6)'],
        ['rgba(234, 88, 12, 0.6)', 'rgba(168, 85, 247, 0.4)', 'rgba(79, 70, 229, 0.5)'],
        ['rgba(251, 146, 60, 0.5)', 'rgba(244, 63, 94, 0.6)', 'rgba(67, 56, 202, 0.4)'],
        ['rgba(245, 158, 11, 0.7)', 'rgba(192, 38, 211, 0.4)', 'rgba(129, 140, 248, 0.7)']
      ],
      coreGlow: 'rgba(249, 115, 22, 0.22)',
      particleColor: [251, 146, 60],
      canvasBg: 'from-orange-50/70 via-rose-50/40 to-indigo-50/30 dark:from-stone-950 dark:via-purple-950/25 dark:to-stone-900',
      sunbeamColor: 'rgba(254, 205, 211, 0.14)',
      vibeTag: '🌅 Saffron & Indigo Twilight'
    },
    'starlit-night': {
      name: 'Starlit Dusk (宵)',
      subtitle: 'Peaceful deep twilight with luminous firefly motes',
      accent: 'indigo',
      waveGradients: [
        ['rgba(99, 102, 241, 0.7)', 'rgba(147, 51, 234, 0.5)', 'rgba(56, 189, 248, 0.6)'],
        ['rgba(79, 70, 229, 0.5)', 'rgba(236, 72, 153, 0.4)', 'rgba(125, 211, 252, 0.4)'],
        ['rgba(67, 56, 202, 0.6)', 'rgba(168, 85, 247, 0.5)', 'rgba(251, 191, 36, 0.3)'],
        ['rgba(129, 140, 248, 0.5)', 'rgba(217, 70, 239, 0.3)', 'rgba(34, 211, 238, 0.6)']
      ],
      coreGlow: 'rgba(99, 102, 241, 0.2)',
      particleColor: [129, 140, 248],
      canvasBg: 'from-indigo-50/60 via-slate-50/40 to-stone-50/30 dark:from-stone-950 dark:via-indigo-950/30 dark:to-stone-900',
      sunbeamColor: 'rgba(199, 210, 254, 0.1)',
      vibeTag: '🌌 Deep Serene Starlight'
    }
  };

  const currentPalette = moodPalettes[mood];

  const handleMoodSelect = (newMood: AmbienceMood) => {
    setMood(newMood);
    if (onMoodChange) onMoodChange(newMood);
  };

  // Play peaceful gentle slice-of-life wind chime note (Web Audio API)
  const playWindChime = useCallback((pitchMultiplier = 1) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Pentatonic warm bells: 523.25 (C5), 587.33 (D5), 659.25 (E5), 783.99 (G5), 880 (A5)
      const frequencies = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
      const baseFreq = frequencies[Math.floor(Math.random() * frequencies.length)] * pitchMultiplier;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      // Subtle overtone shimmer
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.002, now + 1.2);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.9);
    } catch {
      // Audio might fail if user hasn't interacted or policy prevents it
    }
  }, [soundEnabled]);

  // Handle canvas click: ripple + wind chime
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    ripplesRef.current.push({
      x,
      y,
      radius: 5,
      maxRadius: Math.max(canvas.width, canvas.height) * 0.45,
      alpha: 0.8,
      speed: 3.5
    });

    playWindChime(1.1);
  };

  // Track mouse coordinates over canvas for interactive spring deflection
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    mouseRef.current.targetX = (e.clientX - rect.left) / rect.width;
    mouseRef.current.targetY = (e.clientY - rect.top) / rect.height;
    mouseRef.current.active = true;
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    mouseRef.current.active = true;
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseRef.current.active = false;
  };

  // Initialize particles with delicate floating drift
  useEffect(() => {
    const count = compact ? 25 : 45;
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        radius: 1 + Math.random() * 2.5,
        vx: (Math.random() - 0.5) * 0.0004,
        vy: -0.0003 - Math.random() * 0.0006, // Gentle upward drift like warm summer dust motes
        alpha: 0.1 + Math.random() * 0.6,
        targetAlpha: 0.2 + Math.random() * 0.7,
        hueShift: (Math.random() - 0.5) * 20,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03
      });
    }
    particlesRef.current = particles;
  }, [compact]);

  // Main high-performance Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;

    const resize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Render step
    const render = () => {
      if (!canvas || !ctx) return;
      const width = canvas.width;
      const height = canvas.height;

      // Smooth mouse easing
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      // Clear canvas with subtle transparency
      ctx.clearRect(0, 0, width, height);

      const t = timeRef.current;
      const centerX = width * 0.5 + (mouseRef.current.x - 0.5) * width * 0.1;
      const centerY = height * 0.48 + (mouseRef.current.y - 0.5) * height * 0.1;
      const baseRadius = Math.min(width, height) * (compact ? 0.28 : 0.32);

      // 1. Draw Slice-of-Life Warm Ambient Sunbeams (Komorebi light rays)
      ctx.save();
      const beamGrad = ctx.createLinearGradient(width * 0.1, 0, width * 0.8, height);
      beamGrad.addColorStop(0, currentPalette.sunbeamColor);
      beamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.03)');
      beamGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = beamGrad;
      // Soft diagonal light rays
      for (let i = 0; i < 4; i++) {
        const offset = i * (width * 0.2) + Math.sin(t * 0.005 + i) * 20;
        ctx.beginPath();
        ctx.moveTo(offset, 0);
        ctx.lineTo(offset + width * 0.15, 0);
        ctx.lineTo(offset - width * 0.1, height);
        ctx.lineTo(offset - width * 0.25, height);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // 2. Draw Sarvam Indus Concentric Mandala Harmonic Waves
      // Saffron to Indigo continuous spectrum with resonant trochoids
      const numRings = compact ? 5 : 7;
      const petals = 6; // Hexagonal / mandala harmonic resonance

      ctx.save();
      ctx.lineWidth = 1.4 * dpr;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let r = 0; r < numRings; r++) {
        const ringFraction = (r + 1) / numRings;
        const currentRadius = baseRadius * ringFraction;
        const speed = (0.008 + r * 0.003) * speedMultiplier;
        const phase = t * speed + (r * Math.PI) / 3;

        const gradIndex = r % currentPalette.waveGradients.length;
        const colors = currentPalette.waveGradients[gradIndex];

        // Linear gradient across wave
        const lineGrad = ctx.createLinearGradient(
          centerX - currentRadius,
          centerY - currentRadius,
          centerX + currentRadius,
          centerY + currentRadius
        );
        lineGrad.addColorStop(0, colors[0]);
        lineGrad.addColorStop(0.5, colors[1]);
        lineGrad.addColorStop(1, colors[2]);

        ctx.strokeStyle = lineGrad;
        ctx.beginPath();

        const steps = 180;
        for (let s = 0; s <= steps; s++) {
          const theta = (s / steps) * Math.PI * 2;
          // Harmonic wave modulation inspired by Indus mandala flow
          const wave1 = Math.sin(theta * petals + phase) * (currentRadius * 0.08);
          const wave2 = Math.cos(theta * (petals / 2) - phase * 0.7) * (currentRadius * 0.05);

          // Interactive mouse attraction
          const mouseDistX = Math.cos(theta) * currentRadius - (mouseRef.current.x - 0.5) * width * 0.4;
          const mouseDistY = Math.sin(theta) * currentRadius - (mouseRef.current.y - 0.5) * height * 0.4;
          const distToMouse = Math.sqrt(mouseDistX * mouseDistX + mouseDistY * mouseDistY);
          const mouseEffect = Math.max(0, 1 - distToMouse / (width * 0.35)) * 14 * dpr;

          const rMod = currentRadius + wave1 + wave2 + mouseEffect;
          const x = centerX + Math.cos(theta) * rMod;
          const y = centerY + Math.sin(theta) * rMod;

          if (s === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();

        // Delicate intersection nodes (luminous golden dots)
        if (r % 2 === 1) {
          for (let p = 0; p < petals; p++) {
            const nodeTheta = (p / petals) * Math.PI * 2 + phase * 0.5;
            const nodeR = currentRadius + Math.sin(nodeTheta * petals + phase) * (currentRadius * 0.08);
            const nx = centerX + Math.cos(nodeTheta) * nodeR;
            const ny = centerY + Math.sin(nodeTheta) * nodeR;

            ctx.fillStyle = colors[0];
            ctx.beginPath();
            ctx.arc(nx, ny, (1.8 + Math.sin(phase + p) * 0.6) * dpr, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.restore();

      // 3. Central Luminous Core Glow
      ctx.save();
      const coreGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        baseRadius * 0.7
      );
      coreGrad.addColorStop(0, currentPalette.coreGlow);
      coreGrad.addColorStop(0.5, currentPalette.coreGlow.replace('0.25', '0.08').replace('0.22', '0.06'));
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 4. Draw Ripples from Clicks
      if (ripplesRef.current.length > 0) {
        ctx.save();
        for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
          const rip = ripplesRef.current[i];
          rip.radius += rip.speed * dpr;
          rip.alpha *= 0.96;

          ctx.strokeStyle = `rgba(${currentPalette.particleColor.join(',')}, ${rip.alpha * 0.6})`;
          ctx.lineWidth = 1.8 * dpr;
          ctx.beginPath();
          ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
          ctx.stroke();

          if (rip.radius >= rip.maxRadius || rip.alpha < 0.01) {
            ripplesRef.current.splice(i, 1);
          }
        }
        ctx.restore();
      }

      // 5. Draw Slice-of-Life Drifting Warm Dust Motes / Cherry Blossom Golden Glow
      if (showParticles) {
        ctx.save();
        const [pr, pg, pb] = currentPalette.particleColor;

        particlesRef.current.forEach((p) => {
          // Update physics
          p.x += p.vx * speedMultiplier;
          p.y += p.vy * speedMultiplier;

          // Wrap edges
          if (p.y < -0.05) {
            p.y = 1.05;
            p.x = Math.random();
          }
          if (p.x < -0.05) p.x = 1.05;
          if (p.x > 1.05) p.x = -0.05;

          // Breathing alpha
          p.pulsePhase += p.pulseSpeed;
          const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulsePhase));

          const px = p.x * width;
          const py = p.y * height;

          // Particle body
          ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, ${currentAlpha})`;
          ctx.beginPath();
          ctx.arc(px, py, p.radius * dpr, 0, Math.PI * 2);
          ctx.fill();

          // Subtle soft aura around larger dust motes
          if (p.radius > 2) {
            ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, ${currentAlpha * 0.25})`;
            ctx.beginPath();
            ctx.arc(px, py, p.radius * 2.8 * dpr, 0, Math.PI * 2);
            ctx.fill();
          }
        });
        ctx.restore();
      }

      // Advance time if playing
      if (isPlaying) {
        timeRef.current += 1;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mood, isPlaying, speedMultiplier, showParticles, compact, currentPalette]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-2xl border border-stone-200/80 dark:border-stone-800/80 transition-all duration-500 shadow-sm ${className}`}
    >
      {/* Background ambient gradient with warm slice-of-life tone */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${currentPalette.canvasBg} transition-colors duration-700 pointer-events-none`}
      />

      {/* Interactive HTML5 Motion Graphics Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="relative z-10 w-full h-full block cursor-crosshair touch-none"
        title="Interactive Indus Motion Graphics — Click to release harmonic ripples"
      />

      {/* Floating Slice-of-Life Atmosphere & Motion Controls */}
      {showControls && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/70 dark:border-stone-800/70 shadow-xs text-xs">
          {/* Mood Selector Buttons */}
          <button
            type="button"
            onClick={() => handleMoodSelect('golden-hour')}
            className={`px-2 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
              mood === 'golden-hour'
                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
            title="Golden Hour: Warm afternoon sunbeams & drifting dust motes"
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Golden Hour</span>
          </button>

          <button
            type="button"
            onClick={() => handleMoodSelect('sunset-twilight')}
            className={`px-2 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
              mood === 'sunset-twilight'
                ? 'bg-orange-100 dark:bg-orange-950/80 text-orange-900 dark:text-orange-200 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
            title="Sunset Twilight: Saffron to indigo continuous run"
          >
            <Sunset className="w-3.5 h-3.5 text-orange-500" />
            <span className="hidden sm:inline">Twilight</span>
          </button>

          <button
            type="button"
            onClick={() => handleMoodSelect('starlit-night')}
            className={`px-2 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
              mood === 'starlit-night'
                ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-200 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
            title="Starlit Dusk: Deep peaceful starlight"
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Starlit</span>
          </button>

          <div className="h-4 w-px bg-stone-200 dark:bg-stone-800 mx-0.5" />

          {/* Play/Pause Motion */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 rounded-md text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            title={isPlaying ? 'Pause motion graphics' : 'Resume motion graphics'}
            aria-label={isPlaying ? 'Pause motion' : 'Play motion'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          {/* Sound Chime Toggle */}
          <button
            type="button"
            onClick={() => {
              const nextState = !soundEnabled;
              setSoundEnabled(nextState);
              if (nextState) playWindChime(1);
            }}
            className={`p-1 rounded-md transition-colors ${
              soundEnabled
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
            }`}
            title={soundEnabled ? 'Slice of Life Wind Chime Active (Click canvas)' : 'Enable Slice of Life Wind Chime'}
            aria-label="Toggle wind chime audio"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}

      {/* Floating Bottom Info Pill with Slice of Life Feeling */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-stone-200/60 dark:border-stone-800/60 text-xs text-stone-700 dark:text-stone-300 pointer-events-none select-none">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
        <span className="font-semibold text-stone-900 dark:text-stone-100">{currentPalette.vibeTag}</span>
        <span className="text-stone-400 hidden sm:inline">•</span>
        <span className="text-stone-500 dark:text-stone-400 text-[11px] hidden md:inline">
          Interactive Harmonic Waves • Move cursor or click canvas
        </span>
      </div>
    </div>
  );
};
