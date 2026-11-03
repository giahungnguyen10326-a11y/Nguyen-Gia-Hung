import React from 'react';
import { HUDData } from '../game/GameEngine';
import { Volume2, VolumeX, Pause, Backpack, Sparkles, Skull, Coins, Swords, Shield, Heart, Store, Wind, Clock, Zap } from 'lucide-react';

interface GameHUDProps {
  data: HUDData;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onOpenInventory: () => void;
  onOpenShop: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  data,
  isMuted,
  onToggleMute,
  onPause,
  onOpenInventory,
  onOpenShop,
}) => {
  const hpPct = Math.max(0, Math.min(100, (data.hp / data.maxHp) * 100));
  const manaPct = Math.max(0, Math.min(100, (data.mana / data.maxMana) * 100));
  const xpPct = Math.max(0, Math.min(100, (data.xp / data.xpNeeded) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
      {/* TOP ROW: Status Clusters & Timer */}
      <div className="flex items-start justify-between w-full">
        {/* Top-Left: Player Vitality & Level */}
        <div className="pointer-events-auto flex items-center gap-3 bg-slate-950/80 border border-slate-800 rounded-xl p-3 shadow-md max-w-sm">
          {/* Level Badge */}
          <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-pixel text-xs shrink-0">
            <span className="text-[9px] text-slate-400">LVL</span>
            <span className="text-sm font-bold tabular-nums">{data.level}</span>
          </div>

          {/* Bars Cluster */}
          <div className="flex flex-col gap-1.5 w-44 sm:w-56">
            {/* HP Bar */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-0.5">
                <span className="text-rose-400 font-bold flex items-center gap-1"><Heart className="w-3 h-3" /> HP</span>
                <span className="tabular-nums text-slate-300">{data.hp} / {data.maxHp}</span>
              </div>
              <div className="w-full h-2.5 rounded bg-slate-900 border border-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-rose-500 transition-all duration-150"
                  style={{ width: `${hpPct}%` }}
                />
              </div>
            </div>

            {/* Mana Bar */}
            <div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-0.5">
                <span className="text-sky-400 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> MP</span>
                <span className="tabular-nums text-slate-400">{data.mana} / {data.maxMana}</span>
              </div>
              <div className="w-full h-1.5 rounded bg-slate-900 border border-slate-800 overflow-hidden">
                <div
                  className="h-full bg-sky-500 transition-all duration-150"
                  style={{ width: `${manaPct}%` }}
                />
              </div>
            </div>

            {/* XP Bar */}
            <div>
              <div className="w-full h-1 rounded bg-slate-900 overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-150"
                  style={{ width: `${xpPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top-Center: Survival Timer & Boss Countdown */}
        <div className="flex flex-col items-center">
          <div className="px-4 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-100 font-pixel text-sm tracking-wider shadow-md tabular-nums">
            {data.timeFormatted}
          </div>

          <div className="flex items-center gap-1.5 mt-1 flex-wrap justify-center">
            {data.weaponEvolved && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-[9px] font-pixel text-amber-300 animate-pulse">
                TIẾN HÓA
              </span>
            )}

            {data.scytheLevel > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-[9px] font-mono text-purple-300">
                Lưỡi Hái x{data.scytheLevel}
              </span>
            )}

            {data.guinsooLevel > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/40 text-[9px] font-mono text-rose-300">
                Cuồng Đao +{data.guinsooLevel * 2}%
              </span>
            )}

            {data.theWorldLevel > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-[9px] font-mono text-amber-300">
                Stand Lv{data.theWorldLevel}
              </span>
            )}
          </div>
        </div>

        {/* Top-Right: Kills, Gold & Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Shop Button (B) */}
          <button
            onClick={onOpenShop}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30 text-amber-300 hover:text-white transition-all cursor-pointer shadow-md"
            title="Mở Cửa Hàng Trang Bị & Bổ Trợ (Phím B)"
          >
            <Store className="w-4 h-4 text-amber-400" />
            <span className="font-pixel text-[11px] hidden sm:inline">SHOP</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-amber-500/40 text-[10px] text-amber-300 font-mono">B</kbd>
          </button>

          {/* Stats Cluster */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono shadow-md">
            <div className="flex items-center gap-1.5 text-rose-400" title="Số quái vật đã tiêu diệt">
              <Skull className="w-4 h-4" />
              <span className="tabular-nums font-bold text-slate-200">{data.kills}</span>
            </div>
            <span className="text-slate-700">·</span>
            <div className="flex items-center gap-1.5 text-amber-400" title="Vàng kiếm được (Dùng trong Cửa hàng)">
              <Coins className="w-4 h-4" />
              <span className="tabular-nums font-bold text-slate-200">{data.gold}</span>
            </div>
          </div>

          {/* Inventory Button */}
          <button
            onClick={onOpenInventory}
            className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Mở Túi Đồ & Trang Bị (Phím I)"
          >
            <Backpack className="w-5 h-5 text-amber-400" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Bật/Tắt Âm Thanh"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Tạm dừng game (ESC)"
          >
            <Pause className="w-5 h-5 text-slate-300" />
          </button>
        </div>
      </div>

      {/* VOID DIMENSION BANNER */}
      {data.inVoidDimension && (
        <div className="pointer-events-none self-center flex flex-col items-center w-full max-w-xl animate-fade-in -mt-2 mb-2">
          <div className="px-5 py-1.5 rounded-full bg-purple-950/90 border-2 border-purple-500 text-purple-200 font-pixel text-xs tracking-wider shadow-xl shadow-purple-950/80 flex items-center gap-2 animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span>KHÔNG GIAN HƯ KHÔNG · SOLO TRÙM TINH ANH</span>
          </div>
        </div>
      )}

      {/* TOP-CENTER BOSS BAR (Visible ONLY when Boss is alive) */}
      {data.activeBoss && (
        <div className="pointer-events-none self-center flex flex-col items-center w-full max-w-xl animate-fade-in -mt-4">
          <div className="flex items-center justify-between w-full text-xs font-pixel mb-1 drop-shadow-md">
            <span className="text-rose-400 flex items-center gap-1.5">
              <Skull className="w-4 h-4 text-rose-500 animate-bounce" />
              <span>{data.activeBoss.name}</span>
            </span>
            <span className="text-slate-300 font-mono tabular-nums">
              {Math.max(0, Math.round(data.activeBoss.hp))} / {data.activeBoss.maxHp}
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-950/90 border-2 border-rose-600 overflow-hidden shadow-lg shadow-rose-950/50">
            <div
              className="h-full bg-gradient-to-r from-rose-700 via-rose-500 to-amber-500 transition-all duration-100"
              style={{ width: `${Math.max(0, Math.min(100, (data.activeBoss.hp / data.activeBoss.maxHp) * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* BOTTOM-CENTER: Active Skills Hotbar & Dash & Stand */}
      <div className="pointer-events-auto self-center flex items-center gap-2 sm:gap-3 bg-slate-950/85 border border-slate-800 rounded-2xl p-2.5 shadow-xl">
        {data.skills.map((skill) => {
          const isReady = skill.currentCooldown <= 0;
          const cdPct = isReady ? 0 : (skill.currentCooldown / skill.cooldown) * 100;

          return (
            <div
              key={skill.id}
              className="relative flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-900 border-2 border-slate-700 overflow-hidden shadow-inner group"
            >
              {/* Cooldown Sweep Shade */}
              {!isReady && (
                <div
                  className="absolute inset-0 bg-slate-950/85 flex items-center justify-center text-xs font-mono font-bold text-amber-400 tabular-nums z-10"
                >
                  {skill.currentCooldown.toFixed(1)}s
                </div>
              )}

              {/* Skill Icon / Label */}
              <div
                className="font-pixel text-[11px] text-center px-1"
                style={{ color: skill.color }}
              >
                {skill.name.slice(0, 8)}
              </div>

              {/* Hotkey Badge */}
              <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-slate-950/90 border border-slate-700 text-[9px] font-mono text-slate-300 font-bold">
                {skill.hotkey}
              </div>

              {/* Cooldown bar indicator at bottom */}
              {!isReady && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400"
                  style={{ width: `${100 - cdPct}%` }}
                />
              )}
            </div>
          );
        })}

        {/* Dash Slot [C] */}
        <div
          className={`relative flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 overflow-hidden shadow-inner transition-colors ${
            data.dashLevel > 0
              ? 'bg-slate-900 border-sky-500/60'
              : 'bg-slate-950/80 border-slate-800 opacity-60'
          }`}
          title={
            data.dashLevel > 0
              ? `Lướt Nhanh (Phím C) - Hồi: ${data.dashCooldown.toFixed(1)}s (Cấp ${data.dashLevel}/5)`
              : 'Kỹ năng Lướt (Phím C) - Mua Giày trong Cửa Hàng [B] để mở khóa!'
          }
        >
          {data.dashLevel > 0 ? (
            <>
              {data.dashCurrentCooldown > 0 && (
                <div className="absolute inset-0 bg-slate-950/85 flex items-center justify-center text-xs font-mono font-bold text-sky-400 tabular-nums z-10">
                  {data.dashCurrentCooldown.toFixed(1)}s
                </div>
              )}
              <Wind className="w-5 h-5 text-sky-400 mb-0.5" />
              <div className="font-pixel text-[9px] text-sky-300">LƯỚT</div>
              <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-slate-950/90 border border-sky-500/40 text-[9px] font-mono text-sky-300 font-bold">
                C
              </div>
              {data.dashCurrentCooldown > 0 && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-sky-400"
                  style={{ width: `${100 - (data.dashCurrentCooldown / data.dashCooldown) * 100}%` }}
                />
              )}
            </>
          ) : (
            <>
              <Wind className="w-4 h-4 text-slate-500 mb-0.5" />
              <div className="font-pixel text-[8px] text-slate-500">KHÓA</div>
              <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-slate-950/90 border border-slate-700 text-[9px] font-mono text-slate-500 font-bold">
                C
              </div>
            </>
          )}
        </div>

        {/* Stand: The World Slot [R] */}
        <div
          className={`relative flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 overflow-hidden shadow-inner transition-colors ${
            data.theWorldLevel > 0
              ? data.timeStopActiveTimer > 0
                ? 'bg-amber-500/25 border-amber-400 shadow-lg shadow-amber-500/50 animate-pulse'
                : 'bg-slate-900 border-amber-500/60'
              : 'bg-slate-950/80 border-slate-800 opacity-60'
          }`}
          title={
            data.theWorldLevel > 0
              ? `Stand The World (Phím R) - Dừng thời gian ${(1.0 + (data.theWorldLevel - 1) * 0.2).toFixed(1)}s (Hồi: ${data.theWorldCooldown}s, Cấp ${data.theWorldLevel}/5)`
              : 'Stand The World (Phím R) - Mua trong Cửa Hàng [B] để mở khóa!'
          }
        >
          {data.theWorldLevel > 0 ? (
            <>
              {data.timeStopActiveTimer > 0 ? (
                <div className="absolute inset-0 bg-amber-500/30 flex flex-col items-center justify-center text-xs font-pixel font-bold text-amber-300 tabular-nums z-10 animate-pulse">
                  <span className="text-[9px]">DỪNG</span>
                  <span>{data.timeStopActiveTimer.toFixed(1)}s</span>
                </div>
              ) : data.theWorldCurrentCooldown > 0 ? (
                <div className="absolute inset-0 bg-slate-950/85 flex items-center justify-center text-xs font-mono font-bold text-amber-400 tabular-nums z-10">
                  {data.theWorldCurrentCooldown.toFixed(1)}s
                </div>
              ) : null}

              <Clock className="w-5 h-5 text-amber-400 mb-0.5" />
              <div className="font-pixel text-[8px] text-amber-300">DỪNG GIỜ</div>
              <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-slate-950/90 border border-amber-500/40 text-[9px] font-mono text-amber-300 font-bold">
                R
              </div>
              {data.theWorldCurrentCooldown > 0 && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400"
                  style={{ width: `${100 - (data.theWorldCurrentCooldown / data.theWorldCooldown) * 100}%` }}
                />
              )}
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 text-slate-500 mb-0.5" />
              <div className="font-pixel text-[8px] text-slate-500">KHÓA</div>
              <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-slate-950/90 border border-slate-700 text-[9px] font-mono text-slate-500 font-bold">
                R
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
