import React, { useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles, Trophy, Shield, Swords } from 'lucide-react';
import { sounds } from '../services/audio';

interface TitleScreenProps {
  onStart: () => void;
  onOpenClassSelect: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  onOpenClassSelect,
  isMuted,
  onToggleMute,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Background atmospheric animated pixel battlefield
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Ambient floating embers & pixel stars
    const embers: { x: number; y: number; s: number; vy: number; col: string }[] = [];
    for (let i = 0; i < 70; i++) {
      embers.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        s: 1.5 + Math.random() * 3,
        vy: 0.3 + Math.random() * 0.8,
        col: Math.random() > 0.4 ? '#fbbf24' : '#ef4444',
      });
    }

    const render = () => {
      t += 0.02;
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle dungeon grid parallax
      const gridSize = 48;
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.3)';
      ctx.lineWidth = 1;
      const offsetX = Math.sin(t * 0.5) * 20;
      const offsetY = Math.cos(t * 0.4) * 20;

      for (let x = (offsetX % gridSize); x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = (offsetY % gridSize); y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Floating burning embers
      embers.forEach((em) => {
        em.y -= em.vy;
        em.x += Math.sin(t + em.y * 0.01) * 0.4;
        if (em.y < 0) em.y = canvas.height;

        ctx.fillStyle = em.col;
        ctx.fillRect(Math.floor(em.x), Math.floor(em.y), Math.floor(em.s), Math.floor(em.s));
      });

      animId = requestAnimationFrame(render);
    };

    render();

    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        sounds.playLevelUp();
        onOpenClassSelect();
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', handleKey);
    };
  }, [onOpenClassSelect]);

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col justify-between items-center text-slate-100 select-none">
      {/* Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Top Utility Bar */}
      <div className="relative z-10 w-full flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400/80">
          <span className="font-pixel text-[10px]">VER 2.5</span>
          <span aria-hidden="true">·</span>
          <span>5 CLASS ANH HÙNG</span>
          <span aria-hidden="true">·</span>
          <span>TIẾN HÓA VŨ KHÍ</span>
        </div>

        <button
          onClick={onToggleMute}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-500 transition-colors text-xs"
          title="Bật/Tắt Âm Thanh"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          <span>{isMuted ? 'Tắt Âm' : 'Âm Thanh'}</span>
        </button>
      </div>

      {/* Hero Centerpiece: Bespoke SVG Title Lockup */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl">
        {/* Decorative Badge */}
        <div className="flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-pixel tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>GAME NHẬP VAI SINH TỒN PIXEL 2D</span>
        </div>

        {/* Bespoke SVG Pixel Title */}
        <div className="mb-4">
          <h1 className="font-pixel text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 drop-shadow-[0_4px_16px_rgba(245,158,11,0.5)]">
            PIXEL HERO
          </h1>
          <p className="font-pixel text-base sm:text-xl text-rose-400 tracking-widest mt-2 drop-shadow-[0_2px_8px_rgba(239,68,68,0.4)]">
            CUỘC CHIẾN BẤT TẬN
          </p>
        </div>

        {/* Atmospheric Subtitle */}
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mb-10 leading-relaxed font-sans">
          Chiến đấu trước muôn trùng quái vật, hạ gục trùm hắc ám, thu thập bảo vật rơi ra và tiến hóa sức mạnh thần thánh để trở thành huyền thoại.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <button
            onClick={() => {
              sounds.playLevelUp();
              onOpenClassSelect();
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-pixel text-sm tracking-wider shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-3 border-2 border-amber-300"
          >
            <Swords className="w-5 h-5 text-slate-950" />
            <span>CHỌN CLASS & VÀO TRẬN</span>
          </button>
        </div>

        {/* Start Key Hint */}
        <div className="mt-4 text-xs font-pixel text-slate-400 animate-pulse">
          Nhấn [SPACE] hoặc [ENTER] để bắt đầu
        </div>
      </div>

      {/* Flat Control Hints Footer */}
      <div className="relative z-10 w-full py-6 px-4 bg-gradient-to-t from-slate-950/90 to-transparent flex flex-col items-center">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">WASD</kbd>
            <span>Di chuyển</span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">Chuột Trái</kbd>
            <span>Tấn công</span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">Q / E / Space</kbd>
            <span>Kỹ năng & Tuyệt chiêu</span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-sky-600/60 text-sky-300">C</kbd>
            <span className="text-sky-300">Lướt</span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-amber-600/60 text-amber-300">B</kbd>
            <span className="text-amber-300">Cửa hàng</span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-amber-400/70 text-amber-300 font-bold">R</kbd>
            <span className="text-amber-300 font-bold">Dừng thời gian (The World)</span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">I</kbd>
            <span>Túi đồ</span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">Esc</kbd>
            <span>Tạm dừng</span>
          </div>
        </div>
      </div>
    </div>
  );
};
