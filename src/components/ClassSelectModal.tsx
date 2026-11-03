import React, { useState, useEffect, useRef } from 'react';
import { CHARACTER_CLASSES } from '../game/data';
import { CharacterClassId } from '../types/game';
import { drawPlayerSprite } from '../game/pixelArt';
import { sounds } from '../services/audio';
import { Swords, Shield, Zap, Sparkles, Heart, Wind, Crosshair, Skull, Users, ArrowLeft } from 'lucide-react';

interface ClassSelectModalProps {
  onSelectClass: (classId: CharacterClassId) => void;
  onBack: () => void;
}

export const ClassSelectModal: React.FC<ClassSelectModalProps> = ({ onSelectClass, onBack }) => {
  const [selectedId, setSelectedId] = useState<CharacterClassId>('warrior');
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const classes = Object.values(CHARACTER_CLASSES);
  const currentClass = CHARACTER_CLASSES[selectedId];

  // Render animated pixel character preview on selected class
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.04;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Pedestal shadow
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, canvas.height / 2 + 36, 40, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Draw enlarged pixel sprite (scale x3)
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2 + 10);
      ctx.scale(3.2, 3.2);
      drawPlayerSprite(
        ctx,
        0,
        0,
        selectedId,
        1,
        t,
        true, // walking motion
        false,
        false
      );
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [selectedId]);

  return (
    <div className="relative w-screen h-screen bg-slate-950 flex flex-col justify-between p-6 sm:p-10 select-none overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 text-xs font-mono transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>QUAY LẠI</span>
        </button>

        <div className="text-center">
          <h2 className="font-pixel text-lg sm:text-2xl text-amber-400">CHỌN ANH HÙNG XUẤT TRẬN</h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">5 Class đại diện với bộ kỹ năng và lối chơi độc nhất</p>
        </div>

        <div className="text-xs font-mono text-slate-400">
          <span>CLASS: </span>
          <span className="text-amber-400 font-pixel uppercase">{currentClass.name}</span>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-6 items-center max-w-7xl mx-auto w-full">
        {/* Left Column: 5 Class Selection Cards */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {classes.map((cls) => {
            const isSelected = cls.id === selectedId;
            return (
              <button
                key={cls.id}
                onClick={() => {
                  sounds.playPickup();
                  setSelectedId(cls.id);
                }}
                className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-amber-400 shadow-lg shadow-amber-500/10 translate-x-2'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center font-pixel text-xs border"
                    style={{
                      backgroundColor: `${cls.accentColor}20`,
                      borderColor: cls.accentColor,
                      color: cls.accentColor,
                    }}
                  >
                    {cls.id === 'warrior' && <Swords className="w-6 h-6" />}
                    {cls.id === 'mage' && <Sparkles className="w-6 h-6" />}
                    {cls.id === 'ranger' && <Crosshair className="w-6 h-6" />}
                    {cls.id === 'assassin' && <Zap className="w-6 h-6" />}
                    {cls.id === 'necromancer' && <Skull className="w-6 h-6" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-sm text-slate-100">{cls.name}</span>
                      <span className="text-xs text-slate-400 font-sans">({cls.title})</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{cls.playstyle}</p>
                  </div>
                </div>

                <div className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-300">
                  {cls.startingWeaponName}
                </div>
              </button>
            );
          })}
        </div>

        {/* Center: Live Pixel Canvas Preview */}
        <div className="lg:col-span-3 flex flex-col items-center justify-center bg-slate-900/60 border border-slate-800 rounded-2xl p-6 min-h-[340px]">
          <canvas ref={previewCanvasRef} width={220} height={220} className="pixel-art" />
          <div className="mt-4 text-center">
            <h3 className="font-pixel text-base text-slate-100">{currentClass.name}</h3>
            <p className="text-xs text-amber-400 font-mono mt-1">{currentClass.title}</p>
            <p className="text-xs text-slate-400 mt-2 max-w-xs">{currentClass.description}</p>
          </div>
        </div>

        {/* Right Column: Stats & Skills Kit Breakdown */}
        <div className="lg:col-span-4 flex flex-col gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          {/* Base Stats Grid */}
          <div>
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">Chỉ số cơ bản</h4>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <span className="text-rose-400 flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> Máu (HP)</span>
                <span className="text-slate-100 font-bold tabular-nums">{currentClass.baseStats.maxHp}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <span className="text-sky-400 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Mana</span>
                <span className="text-slate-100 font-bold tabular-nums">{currentClass.baseStats.maxMana}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <span className="text-amber-400 flex items-center gap-1"><Swords className="w-3.5 h-3.5" /> Sức Đánh</span>
                <span className="text-slate-100 font-bold tabular-nums">{currentClass.baseStats.attack}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <span className="text-emerald-400 flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Giáp Trụ</span>
                <span className="text-slate-100 font-bold tabular-nums">{currentClass.baseStats.defense}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <span className="text-indigo-400 flex items-center gap-1"><Wind className="w-3.5 h-3.5" /> Tốc Chạy</span>
                <span className="text-slate-100 font-bold tabular-nums">{currentClass.baseStats.moveSpeed}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <span className="text-yellow-400 flex items-center gap-1"><Crosshair className="w-3.5 h-3.5" /> Chí Mạng</span>
                <span className="text-slate-100 font-bold tabular-nums">{Math.round(currentClass.baseStats.critRate * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Passive Skill */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 text-xs font-pixel text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NỘI TẠI: {currentClass.passiveName}</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">{currentClass.passiveDesc}</p>
          </div>

          {/* Active Skills Kit */}
          <div>
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Bộ Kỹ Năng Độc Nhất</h4>
            <div className="flex flex-col gap-2">
              {currentClass.skills.map((skill) => (
                <div key={skill.id} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                  <div
                    className="w-7 h-7 rounded flex items-center justify-center font-pixel text-[10px] shrink-0 border"
                    style={{ backgroundColor: `${skill.color}25`, borderColor: skill.color, color: skill.color }}
                  >
                    {skill.hotkey}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-pixel text-xs text-slate-100">{skill.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">({skill.cooldown}s)</span>
                      {skill.isUltimate && (
                        <span className="text-[9px] font-pixel text-amber-400 uppercase tracking-wider">Tuyệt Chiêu</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{skill.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Primary Action */}
      <div className="flex items-center justify-center pt-4 border-t border-slate-800">
        <button
          onClick={() => {
            sounds.playLevelUp();
            onSelectClass(selectedId);
          }}
          className="px-10 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-pixel text-sm tracking-wider shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transform hover:-translate-y-0.5 transition-all cursor-pointer flex items-center gap-3 border border-amber-300"
        >
          <Swords className="w-5 h-5" />
          <span>CHỌN {currentClass.name.toUpperCase()} & BẮT ĐẦU CHIẾN ĐẤU</span>
        </button>
      </div>
    </div>
  );
};
