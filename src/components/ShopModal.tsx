import React from 'react';
import { SHOP_UPGRADES, ShopUpgradeConfig } from '../game/data';
import { PlayerEntity } from '../types/game';
import { Shield, Wind, Sparkles, Magnet, Coins, X, Check, ArrowUp, Swords, Clock } from 'lucide-react';
import { sounds } from '../services/audio';

interface ShopModalProps {
  player: PlayerEntity;
  onBuyUpgrade: (type: 'armor' | 'dash' | 'scythe' | 'magnet' | 'guinsoo' | 'the_world') => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ player, onBuyUpgrade, onClose }) => {
  const getUpgradeLevel = (type: ShopUpgradeConfig['id']): number => {
    switch (type) {
      case 'armor': return player.armorUpgradeLevel;
      case 'dash': return player.dashLevel;
      case 'scythe': return player.scytheLevel;
      case 'magnet': return player.magnetLevel;
      case 'guinsoo': return player.guinsooLevel;
      case 'the_world': return player.theWorldLevel;
    }
  };

  const getItemIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield': return <Shield className="w-8 h-8 text-emerald-400" />;
      case 'Wind': return <Wind className="w-8 h-8 text-sky-400" />;
      case 'Sparkles': return <Sparkles className="w-8 h-8 text-purple-400" />;
      case 'Magnet': return <Magnet className="w-8 h-8 text-amber-400" />;
      case 'Swords': return <Swords className="w-8 h-8 text-rose-400" />;
      case 'Clock': return <Clock className="w-8 h-8 text-amber-300" />;
      default: return <Sparkles className="w-8 h-8 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-4 select-none animate-fade-in">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header with Title and Gold Balance */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-pixel">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-pixel text-lg sm:text-xl text-slate-100 flex items-center gap-2">
                <span>CỬA HÀNG VŨ KHÍ & STAND HUYỀN THOẠI</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                  PHÍM B
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Mua Cuồng Đao Guinsoo (+tốc đánh), Stand The World (Dừng thời gian R), Giáp, Giày Lướt và Bảo Vật
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Player Gold Counter */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-sm shadow-inner">
              <Coins className="w-5 h-5 text-amber-400 animate-pulse" />
              <span className="font-pixel text-base text-amber-400 tabular-nums">{player.gold}</span>
              <span className="text-xs text-amber-500">Vàng</span>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              title="Đóng cửa hàng (B / ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Shop Upgrades Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {SHOP_UPGRADES.map((item) => {
            const currentLevel = getUpgradeLevel(item.id);
            const isMax = currentLevel >= item.maxLevel;
            const cost = isMax ? 0 : item.costs[currentLevel];
            const canAfford = player.gold >= cost;

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isMax
                    ? 'bg-slate-900/40 border-slate-800/80 opacity-90'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 shadow-lg'
                }`}
              >
                <div>
                  {/* Top Bar: Icon + Level Dots */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center shrink-0">
                        {getItemIcon(item.icon)}
                      </div>
                      <div>
                        <h3 className="font-pixel text-sm text-slate-100">{item.name}</h3>
                        <span className="text-[11px] font-mono text-slate-400">
                          {item.id === 'dash' && 'Mở khóa Lướt [Phím C]'}
                          {item.id === 'scythe' && 'Lưỡi hái xoay quanh'}
                          {item.id === 'armor' && 'Tăng máu & giáp hộ thân'}
                          {item.id === 'magnet' && 'Tăng tầm hút ngọc & vàng'}
                          {item.id === 'guinsoo' && '+2% Tốc đánh / cấp (10 Cấp)'}
                          {item.id === 'the_world' && 'Stand Đấm & Dừng Giờ [R]'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Level Progress Pips */}
                  <div className="flex items-center gap-1 mb-3 flex-wrap">
                    {Array.from({ length: item.maxLevel }).map((_, idx) => {
                      const lvl = idx + 1;
                      return (
                        <div
                          key={lvl}
                          className={`w-3 h-3 rounded-sm border ${
                            lvl <= currentLevel
                              ? 'bg-amber-400 border-amber-300 shadow-sm shadow-amber-500/50'
                              : 'bg-slate-800 border-slate-700'
                          }`}
                          title={`Cấp ${lvl}`}
                        />
                      );
                    })}
                    <span className="text-[10px] font-mono text-slate-500 ml-1">
                      {currentLevel}/{item.maxLevel}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 font-sans leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Current Active & Next Level Effect */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs font-mono mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[10px] uppercase font-bold">Hiện tại:</span>
                      <span className="text-slate-300 text-[11px]">
                        {currentLevel === 0 ? 'Chưa mở khóa' : item.levelEffects[currentLevel - 1]}
                      </span>
                    </div>

                    {!isMax && (
                      <div className="flex items-center gap-2 text-amber-300">
                        <span className="text-amber-500 text-[10px] uppercase font-bold">Kế tiếp:</span>
                        <span className="text-[11px]">{item.levelEffects[currentLevel]}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <div className="text-xs font-mono">
                    {isMax ? (
                      <span className="text-emerald-400 font-pixel text-[11px] flex items-center gap-1">
                        <Check className="w-4 h-4" /> ĐÃ TỐI ĐA
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-400 font-pixel text-xs">
                        <Coins className="w-4 h-4" />
                        <span className="tabular-nums">{cost}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Vàng</span>
                      </div>
                    )}
                  </div>

                  {!isMax ? (
                    <button
                      onClick={() => onBuyUpgrade(item.id)}
                      disabled={!canAfford}
                      className={`px-4 py-2.5 rounded-xl font-pixel text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:translate-y-0.5'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <ArrowUp className="w-4 h-4" />
                      <span>{currentLevel === 0 ? 'MỞ KHÓA' : 'NÂNG CẤP'}</span>
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">Hoàn Tất</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info & close */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span>Phím tắt:</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-sky-500/50 text-sky-300">C</kbd>
            <span>Lướt né đòn ·</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-amber-500/50 text-amber-300">R</kbd>
            <span>Dừng thời gian (Stand The World)</span>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs transition-colors cursor-pointer border border-slate-700"
          >
            ĐÓNG (B / ESC)
          </button>
        </div>
      </div>
    </div>
  );
};
