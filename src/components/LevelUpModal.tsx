import React, { useState } from 'react';
import { UpgradeOption } from '../types/game';
import { Sparkles, Sword, Heart, Wind, Crosshair, Zap, Clock, Droplet, Shield, Magnet, RotateCcw } from 'lucide-react';
import { sounds } from '../services/audio';

interface LevelUpModalProps {
  level: number;
  choices: UpgradeOption[];
  onSelectUpgrade: (upgradeId: string) => void;
  onReroll: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  level,
  choices,
  onSelectUpgrade,
  onReroll,
}) => {
  const [rerollsLeft, setRerollsLeft] = useState<number>(2);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sword': return <Sword className="w-8 h-8 text-amber-400" />;
      case 'Heart': return <Heart className="w-8 h-8 text-rose-400" />;
      case 'Wind': return <Wind className="w-8 h-8 text-indigo-400" />;
      case 'Crosshair': return <Crosshair className="w-8 h-8 text-yellow-400" />;
      case 'Zap': return <Zap className="w-8 h-8 text-amber-400" />;
      case 'Clock': return <Clock className="w-8 h-8 text-sky-400" />;
      case 'Droplet': return <Droplet className="w-8 h-8 text-emerald-400" />;
      case 'Shield': return <Shield className="w-8 h-8 text-emerald-400" />;
      case 'Magnet': return <Magnet className="w-8 h-8 text-indigo-400" />;
      default: return <Sparkles className="w-8 h-8 text-purple-400" />;
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'epic': return <span className="text-purple-400 font-pixel text-[10px]">SỬ THI</span>;
      case 'rare': return <span className="text-sky-400 font-pixel text-[10px]">HIẾM</span>;
      default: return <span className="text-slate-400 font-pixel text-[10px]">THƯỜNG</span>;
    }
  };

  const handleRerollClick = () => {
    if (rerollsLeft <= 0) return;
    sounds.playPickup();
    setRerollsLeft((prev) => prev - 1);
    onReroll();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-3xl flex flex-col items-center">
        {/* Banner */}
        <div className="flex items-center gap-2 mb-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-pixel text-xs tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>THĂNG CẤP ĐẠT LEVEL {level}!</span>
        </div>
        <h2 className="font-pixel text-2xl sm:text-3xl text-slate-100 mb-2">CHỌN NÂNG CẤP SỨC MẠNH</h2>
        <p className="text-xs text-slate-400 mb-8 font-mono">Chọn một kỹ năng hoặc chỉ số để tiến hóa nhân vật</p>

        {/* 3 Choices Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-6">
          {choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => {
                sounds.playLevelUp();
                onSelectUpgrade(choice.id);
              }}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-900/90 border border-slate-700/80 hover:border-amber-400 hover:bg-slate-900 transition-all transform hover:-translate-y-1.5 cursor-pointer shadow-xl group relative overflow-hidden"
            >
              <div className="absolute top-3 right-3">
                {getRarityBadge(choice.rarity)}
              </div>

              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {getIcon(choice.icon)}
              </div>

              <h3 className="font-pixel text-sm text-slate-100 group-hover:text-amber-300 transition-colors mb-2">
                {choice.title}
              </h3>

              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                {choice.subtitle}
              </p>

              <div className="mt-6 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs font-pixel text-slate-300 group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:border-amber-400 transition-colors">
                LỰA CHỌN
              </div>
            </button>
          ))}
        </div>

        {/* Reroll Button (2 chances) */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRerollClick}
            disabled={rerollsLeft <= 0}
            className={`px-6 py-3 rounded-xl font-pixel text-xs flex items-center gap-2 border transition-all cursor-pointer ${
              rerollsLeft > 0
                ? 'bg-slate-900 hover:bg-slate-800 border-amber-500/40 text-amber-300 hover:border-amber-400 shadow-md shadow-amber-500/10'
                : 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <RotateCcw className={`w-4 h-4 ${rerollsLeft > 0 ? 'text-amber-400' : 'text-slate-600'}`} />
            <span>ĐỔI LẠI CÁC NÂNG CẤP (CÒN {rerollsLeft}/2 LƯỢT)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
