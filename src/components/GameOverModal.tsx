import React from 'react';
import { Skull, Trophy, RotateCcw, Home, Clock, Award } from 'lucide-react';
import { sounds } from '../services/audio';

interface GameOverModalProps {
  stats: {
    time: string;
    kills: number;
    level: number;
    bossKills: number;
  };
  classNameUsed: string;
  onRestart: () => void;
  onQuit: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  classNameUsed,
  onRestart,
  onQuit,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4 select-none animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl">
        {/* Skull Icon */}
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-4">
          <Skull className="w-9 h-9" />
        </div>

        <h2 className="font-pixel text-2xl sm:text-3xl text-rose-400 mb-1">KẾT THÚC TRẬN ĐÁNH</h2>
        <p className="text-xs text-slate-400 font-mono mb-6">
          Anh hùng {classNameUsed} đã ngã xuống anh dũng trên chiến trường
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-left">
            <span className="text-slate-400 flex items-center gap-1.5"><Clock className="w-4 h-4 text-sky-400" /> Thời Gian Sống</span>
            <span className="text-lg font-bold text-slate-100 font-pixel mt-1 block tabular-nums">{stats.time}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-left">
            <span className="text-slate-400 flex items-center gap-1.5"><Award className="w-4 h-4 text-amber-400" /> Cấp Độ Đạt Được</span>
            <span className="text-lg font-bold text-amber-400 font-pixel mt-1 block tabular-nums">Lv.{stats.level}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-left">
            <span className="text-slate-400 flex items-center gap-1.5"><Skull className="w-4 h-4 text-rose-400" /> Quái Đã Tiêu Diệt</span>
            <span className="text-lg font-bold text-slate-100 font-pixel mt-1 block tabular-nums">{stats.kills}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-left">
            <span className="text-slate-400 flex items-center gap-1.5"><Trophy className="w-4 h-4 text-amber-500" /> Boss Hạ Gục</span>
            <span className="text-lg font-bold text-amber-500 font-pixel mt-1 block tabular-nums">{stats.bossKills}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => {
              sounds.playLevelUp();
              onRestart();
            }}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-pixel text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 border border-amber-300"
          >
            <RotateCcw className="w-4 h-4" />
            <span>TÁI XUẤT GIANG HỒ (CHƠI LẠI)</span>
          </button>

          <button
            onClick={onQuit}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
          >
            <Home className="w-4 h-4" />
            <span>Về Màn Hình Chính</span>
          </button>
        </div>
      </div>
    </div>
  );
};
