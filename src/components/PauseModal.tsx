import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Home } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onQuit,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl">
        <h2 className="font-pixel text-xl sm:text-2xl text-amber-400 mb-2">TẠM DỪNG TRẬN CHIẾN</h2>
        <p className="text-xs text-slate-400 font-mono mb-6">Trò chơi đang dừng. Sẵn sàng trở lại chiến trường?</p>

        {/* Buttons List */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onResume}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <span>TIẾP TỤC CHIẾN ĐẤU (ESC)</span>
          </button>

          <button
            onClick={onToggleMute}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>Âm Thanh: {isMuted ? 'Đang Tắt' : 'Đang Bật'}</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Chơi Lại Trận Này</span>
          </button>

          <button
            onClick={onQuit}
            className="w-full py-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 font-mono text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-rose-900/50"
          >
            <Home className="w-4 h-4" />
            <span>Thoát Ra Màn Hình Chính</span>
          </button>
        </div>

        {/* Short Controls Reminder */}
        <div className="mt-8 pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex flex-wrap justify-center gap-2">
          <span>WASD Di chuyển</span>
          <span>·</span>
          <span>Chuột/Space Đánh</span>
          <span>·</span>
          <span>Q/E Kỹ năng</span>
        </div>
      </div>
    </div>
  );
};
