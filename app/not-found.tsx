'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import NextLink from 'next/link';

// ─── Shooting Star Component ──────────────────────────────────────────────────
const ShootingStar = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    className="absolute h-[1.5px] bg-gradient-to-r from-transparent via-violet-300 to-transparent z-0"
    style={{ width: 150, top: `${Math.random() * 50}%`, left: '-20%', rotate: '20deg', opacity: 0 }}
    animate={{ x: '140vw', opacity: [0, 0, 1, 1, 0, 0] }}
    transition={{ duration: 2.5, delay, repeat: Infinity, repeatDelay: 4 + Math.random() * 12, ease: "linear" }}
  />
);

// ─── Star Field Canvas with Parallax ──────────────────────────────────────────
const StarField = ({ mouseX, mouseY }: { mouseX: any, mouseY: any }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<{ x: number, y: number, r: number, o: number, p: number }[]>([]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const initStars = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      starsRef.current = Array.from({ length: 250 }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.3,
        o: Math.random() * 0.7 + 0.2,
        p: Math.random() * 0.05
      }));
    };
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseX.get() || 0;
      const my = mouseY.get() || 0;
      starsRef.current.forEach(star => {
        const px = star.x + (mx * star.p);
        const py = star.y + (my * star.p);
        ctx.beginPath(); ctx.arc(px, py, star.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(255, 255, 255, ${star.o})`; ctx.fill();
      });
      requestAnimationFrame(animate);
    };
    initStars();
    const animId = requestAnimationFrame(animate);
    window.addEventListener('resize', initStars);
    return () => { window.removeEventListener('resize', initStars); cancelAnimationFrame(animId); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
};

// ─── Dynamic Planet SVG: Layered Clipping for correct 3D Depth ────────────────
const PlanetSystem = () => {
  const dustCount = 60;
  const dustParticles = Array.from({ length: dustCount }).map((_, i) => ({
    id: i,
    delay: (i / dustCount) * -12,
    size: Math.random() * 1.8 + 0.5,
    opacity: Math.random() * 0.6 + 0.3,
    dur: 12,
  }));

  return (
    <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible drop-shadow-[0_0_60px_rgba(124,58,237,0.3)]">
      <defs>
        <radialGradient id="planetGrad" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="40%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </radialGradient>
        
        <radialGradient id="moonGrad" cx="30%" cy="30%"><stop offset="0%" stopColor="#cbd5e1" /><stop offset="100%" stopColor="#475569" /></radialGradient>
        
        {/* Quỹ đạo ellipse cố định */}
        <path id="ringPathFixed" d="M 80,200 A 120,30 -15 1 1 320,200 A 120,30 -15 1 1 80,200" fill="none" />

        {/* ClipPath để chia vành đai thành 2 nửa: TRƯỚC và SAU */}
        {/* Nửa SAU: Phần phía trên đường xích đạo nghiêng -15 độ */}
        <clipPath id="clipBack">
          <rect x="0" y="0" width="400" height="200" transform="rotate(-15, 200, 200)" />
        </clipPath>
        {/* Nửa TRƯỚC: Phần phía dưới đường xích đạo nghiêng -15 độ */}
        <clipPath id="clipFront">
          <rect x="0" y="200" width="400" height="200" transform="rotate(-15, 200, 200)" />
        </clipPath>
      </defs>

      {/* 1. Nhóm bụi bay PHÍA SAU hành tinh */}
      <g clipPath="url(#clipBack)">
        {dustParticles.map((p) => (
          <circle key={`back-${p.id}`} r={p.size} fill="rgba(196,181,253,0.4)" style={{ opacity: p.opacity }}>
            <animateMotion dur={`${p.dur}s`} repeatCount="indefinite" begin={`${p.delay}s`} calcMode="linear">
              <mpath href="#ringPathFixed" />
            </animateMotion>
          </circle>
        ))}
      </g>

      {/* 2. Hành tinh chính (Nằm ở giữa) */}
      <g>
        <circle cx="200" cy="200" r="65" fill="url(#planetGrad)" />
        <circle cx="170" cy="180" r="12" fill="rgba(255,255,255,0.08)" />
        <ellipse cx="230" cy="230" rx="20" ry="6" fill="rgba(255,255,255,0.04)" transform="rotate(-20, 230, 230)" />
      </g>

      {/* 3. Nhóm bụi bay PHÍA TRƯỚC hành tinh */}
      <g clipPath="url(#clipFront)">
        {dustParticles.map((p) => (
          <circle key={`front-${p.id}`} r={p.size} fill="rgba(196,181,253,0.8)" style={{ opacity: p.opacity }}>
            <animateMotion dur={`${p.dur}s`} repeatCount="indefinite" begin={`${p.delay}s`} calcMode="linear">
              <mpath href="#ringPathFixed" />
            </animateMotion>
          </circle>
        ))}
      </g>

      {/* 4. Mặt trăng xoay quanh */}
      <g>
        <animateTransform attributeName="transform" type="rotate" from="0 200 200" to="360 200 200" dur="20s" repeatCount="indefinite" />
        <circle cx="200" cy="50" r="14" fill="url(#moonGrad)" />
      </g>
    </svg>
  );
};

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState('');
  const [msgIdx, setMsgIdx] = useState(0);
  const bubbleMsgs = ['SIGNAL_LOST', 'Hố đen à??', 'Ủa đâu đây?', 'Lạc trôi rồi!', 'Về thôi!!'];

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const planetX = useTransform(springX, (v) => v * 0.08);
  const planetY = useTransform(springY, (v) => v * 0.08);
  const robotParallaxX = useTransform(springX, (v) => v * 0.15);
  const robotParallaxY = useTransform(springY, (v) => v * 0.15);
  const textX = useTransform(springX, (v) => v * 0.04);
  const textY = useTransform(springY, (v) => v * 0.04);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener('mousemove', handleMouseMove);
    const msgTimer = setInterval(() => setMsgIdx(i => (i + 1) % bubbleMsgs.length), 5000);
    const clockTimer = setInterval(() => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }) + ' UTC'), 1000);
    return () => { window.removeEventListener('mousemove', handleMouseMove); clearInterval(msgTimer); clearInterval(clockTimer); };
  }, []);

  if (!mounted) return <div className="bg-[#020408] min-h-screen" />;

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center bg-[#020408] overflow-hidden select-none">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Be+Vietnam+Pro:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600;1,700;1,900&display=swap');
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
        .text-glow { text-shadow: 0 0 25px rgba(139, 92, 246, 0.6); }
        .force-padding-btn {
            padding: 1rem 0 !important;
            white-space: nowrap !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
        }
        .terminal-header-dot { width: 8px; height: 8px; border-radius: 50%; }
      `}</style>

      <StarField mouseX={springX} mouseY={springY} />
      
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <div className="w-full h-full opacity-[0.03]" style={{
          background: 'linear-gradient(to bottom, transparent, #fff 50%, transparent)',
          height: '200%', animation: 'scanline 15s linear infinite'
        }} />
      </div>

      <ShootingStar delay={1} /><ShootingStar delay={7} />

      <section className="relative z-20 w-full max-w-7xl mx-auto px-10 py-20 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        
        {/* ─── Left Section ─── */}
        <div className="flex flex-col items-center justify-center relative min-h-[500px]">
          <motion.div style={{ x: textX, y: textY }} className="absolute pointer-events-none select-none">
            <h1 className="text-[200px] sm:text-[320px] font-black text-white/[0.012] tracking-tighter"
                style={{ fontFamily: "'Space Mono', monospace", WebkitTextStroke: '1px rgba(255,255,255,0.03)' }}>
              404
            </h1>
          </motion.div>

          <div className="relative w-80 h-80 sm:w-96 sm:h-96 md:w-[480px] md:h-[480px]">
            <motion.div style={{ x: planetX, y: planetY }} 
              animate={{ y: [0, -15, 0] }} 
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} 
              className="w-full h-full overflow-visible">
              <PlanetSystem />
            </motion.div>

            <motion.div style={{ x: robotParallaxX, y: robotParallaxY }} className="absolute top-1/4 left-0 w-28 h-28 md:w-36 md:h-36 z-30">
              <motion.div
                animate={{ x: [-15, 15, -15], y: [-20, -70, -20], rotate: [-10, 10, -10] }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full relative group"
              >
                <Image src="/robot.png" alt="Robot" fill className="object-contain drop-shadow-[0_0_35px_rgba(167,139,250,0.5)] transition-all duration-500 group-hover:scale-110" priority />
                <AnimatePresence mode="wait">
                  <motion.div key={msgIdx} initial={{ opacity: 0, scale: 0.8, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    className="absolute -top-14 left-1/2 -translate-x-1/2 px-5 py-2 bg-[#0a0514]/95 border border-violet-500/30 text-violet-200 font-mono text-[10px] font-bold whitespace-nowrap rounded-lg backdrop-blur-xl shadow-2xl">
                    {bubbleMsgs[msgIdx]}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0a0514] border-r border-b border-violet-500/30 rotate-45" />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* ─── Right Section ─── */}
        <motion.div style={{ x: textX, y: textY }} className="flex flex-col gap-12 text-center lg:text-left">
          <header className="space-y-8">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-center lg:justify-start gap-5 text-violet-400 font-mono text-[10px] tracking-[0.5em] font-bold uppercase">
              <div className="w-14 h-px bg-violet-500/50" /> Galaxy OS v2.4.1
            </motion.div>

            <motion.h2 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
              className="text-6xl md:text-[85px] font-black text-white leading-[1] tracking-[-0.03em] text-glow"
              style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              Lạc lối<br />
              giữa <span className="bg-gradient-to-br from-violet-400 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent italic px-1">vũ trụ</span><br />
              code
            </motion.h2>

            <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-xl mx-auto lg:mx-0 opacity-80" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              Trang bạn đang tìm kiếm đã trôi dạt vào vùng tối dữ liệu — ngoài tầm phủ sóng của bất kỳ vệ tinh nào.
            </p>
          </header>

          {/* Terminal Block */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="border border-white/[0.08] bg-[#0d0d1a]/80 backdrop-blur-3xl rounded-none overflow-hidden max-w-lg mx-auto lg:mx-0 shadow-2xl">
            <div className="px-5 py-3 bg-white/[0.03] border-b border-white/[0.05] flex items-center justify-between">
              <div className="flex gap-2">
                <div className="terminal-header-dot bg-rose-500/80" />
                <div className="terminal-header-dot bg-amber-500/80" />
                <div className="terminal-header-dot bg-emerald-500/80" />
              </div>
              <div className="text-[9px] font-mono text-white/20 tracking-widest uppercase">System Diagnostic</div>
            </div>
            
            <div className="p-8 space-y-4">
              {[
                { label: 'STATUS', val: '404 NOT_FOUND', color: 'text-rose-400' },
                { label: 'SIGNAL', val: 'LOST_IN_TRANSMISSION', color: 'text-violet-400' },
                { label: 'SECTOR', val: '7G_DEEP_SPACE', color: 'text-slate-300' },
                { label: 'COORDS', val: '10.7626, 106.6602', color: 'text-slate-500' }
              ].map((item, idx) => (
                <div key={idx} className="font-mono text-[11px] flex gap-6 items-center group">
                  <span className="text-white/10 w-6 select-none text-[9px]">{idx + 1}</span>
                  <span className="text-white/25 w-20 select-none tracking-widest uppercase">› {item.label}</span>
                  <span className={`${item.color} font-bold tracking-widest`}>{item.val}</span>
                  {idx === 0 && <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="w-1.5 h-3.5 bg-rose-500/60 inline-block" />}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 w-full max-w-lg">
            <NextLink href="/" className="w-full sm:flex-1">
              <button className="force-padding-btn w-full bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-bold uppercase tracking-[0.3em] transition-all duration-300 rounded-lg shadow-[0_10px_30px_rgba(139,92,246,0.3)] hover:shadow-[0_15px_40px_rgba(139,92,246,0.5)] hover:-translate-y-1 active:translate-y-0 border-none cursor-pointer">
                ⌂ Về trang chủ
              </button>
            </NextLink>
            <button onClick={() => window.history.back()}
              className="w-full sm:flex-1 force-padding-btn bg-transparent border-2 border-white/10 hover:border-white/30 text-white/70 hover:text-white text-[11px] font-bold uppercase tracking-[0.3em] transition-all duration-300 rounded-lg hover:bg-white/5 cursor-pointer">
              ← Quay lại
            </button>
          </motion.div>
        </motion.div>
      </section>

      <footer className="absolute bottom-8 left-12 right-12 flex justify-between items-end font-mono text-[9px] text-white/10 tracking-[0.3em] uppercase z-40 pointer-events-none">
        <div className="space-y-1"><div>LAT_10.7626 // LONG_106.6602</div><div>Signal: <span className="text-rose-500/30">CRITICAL</span></div></div>
        <div className="text-center font-bold tracking-[0.5em] text-white/30 hidden md:block border-b border-white/5 pb-1">{time}</div>
        <div className="text-right space-y-1"><div>Sector_7G // Deep_Data_Void</div><div>Codelearn_Platform_OS</div></div>
      </footer>
    </main>
  );
}