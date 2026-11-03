import React from 'react';
import { PlayerEntity } from '../types/game';
import { X, Swords, Shield, Heart, Wind, Crosshair, Sparkles, Clock, Droplet, Backpack } from 'lucide-react';

interface InventoryModalProps {
  player: PlayerEntity;
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ player, onClose }) => {
  const eq = player.equipment;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Backpack className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-pixel text-lg text-slate-100">TÚI ĐỒ & CHỈ SỐ NHÂN VẬT</h2>
              <p className="text-xs text-slate-400 font-mono">
                {player.classData.name} · Cấp {player.level}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Split: Stats on Left, Equipment Slots on Right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Complete Stats */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Chỉ Số Tổng Hợp</h3>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-rose-400 flex items-center gap-1.5"><Heart className="w-4 h-4" /> Máu Tối Đa</span>
                <span className="text-base font-bold text-slate-100 mt-1 block tabular-nums">{player.maxHp}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-sky-400 flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> Năng Lượng</span>
                <span className="text-base font-bold text-slate-100 mt-1 block tabular-nums">{player.maxMana}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-amber-400 flex items-center gap-1.5"><Swords className="w-4 h-4" /> Sát Thương</span>
                <span className="text-base font-bold text-slate-100 mt-1 block tabular-nums">{player.attack}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-emerald-400 flex items-center gap-1.5"><Shield className="w-4 h-4" /> Giáp Hộ Thân</span>
                <span className="text-base font-bold text-slate-100 mt-1 block tabular-nums">{player.defense}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-indigo-400 flex items-center gap-1.5"><Wind className="w-4 h-4" /> Tốc Di Chuyển</span>
                <span className="text-base font-bold text-slate-100 mt-1 block tabular-nums">{player.moveSpeed.toFixed(1)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-yellow-400 flex items-center gap-1.5"><Crosshair className="w-4 h-4" /> Tỉ Lệ Chí Mạng</span>
                <span className="text-base font-bold text-slate-100 mt-1 block tabular-nums">{Math.round(player.critRate * 100)}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-purple-400 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Giảm Hồi Chiêu</span>
                <span className="text-base font-bold text-slate-100 mt-1 block tabular-nums">{Math.round(player.cooldownReduction * 100)}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-emerald-400 flex items-center gap-1.5"><Droplet className="w-4 h-4" /> Hút Máu / Đòn</span>
                <span className="text-base font-bold text-slate-100 mt-1 block tabular-nums">{player.vampirism}</span>
              </div>
            </div>

            {/* Passive details */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 mt-2">
              <span className="text-xs font-pixel text-amber-400 block mb-1">Nội Tại: {player.classData.passiveName}</span>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">{player.classData.passiveDesc}</p>
            </div>
          </div>

          {/* Right: Equipment Slots */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Trang Bị Đang Mặc</h3>
            <div className="flex flex-col gap-2.5">
              {/* Weapon Slot */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Vũ Khí Chính</span>
                  <p className="text-sm font-pixel text-amber-400 mt-0.5">
                    {eq.weapon ? eq.weapon.name : 'Chưa trang bị'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{eq.weapon?.description}</p>
                </div>
                {player.weaponEvolved && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-pixel text-[9px]">
                    TIẾN HÓA
                  </span>
                )}
              </div>

              {/* Armor Slot */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Áo Giáp</span>
                  <p className="text-sm font-pixel text-emerald-400 mt-0.5">
                    {eq.armor ? eq.armor.name : 'Giáp Vải Thô'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{eq.armor ? eq.armor.description : '+0 Giáp'}</p>
                </div>
              </div>

              {/* Boots Slot */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Giày Di Chuyển</span>
                  <p className="text-sm font-pixel text-indigo-400 mt-0.5">
                    {eq.boots ? eq.boots.name : 'Giày Da Cũ'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{eq.boots ? eq.boots.description : '+0 Tốc độ'}</p>
                </div>
              </div>

              {/* Ring / Relic Slot */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Nhẫn & Thánh Vật</span>
                  <p className="text-sm font-pixel text-purple-400 mt-0.5">
                    {eq.ring ? eq.ring.name : eq.relic ? eq.relic.name : 'Trống'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {eq.ring ? eq.ring.description : eq.relic ? eq.relic.description : 'Đánh bại Boss để nhận bảo vật hiếm'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Close CTA */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs transition-colors cursor-pointer"
          >
            ĐÓNG (ESC)
          </button>
        </div>
      </div>
    </div>
  );
};
