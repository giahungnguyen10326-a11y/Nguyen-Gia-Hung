import React, { useState } from 'react';
import { BOSS_DROP_ITEMS } from '../game/data';
import { CharacterClassId, Item } from '../types/game';
import { Trophy, Sparkles, Swords, Shield, Heart, Zap, Hourglass, Check } from 'lucide-react';
import { sounds } from '../services/audio';

interface BossChestModalProps {
  playerClassId: CharacterClassId;
  weaponAlreadyEvolved: boolean;
  onEquipItem: (item: Item) => void;
}

export const BossChestModal: React.FC<BossChestModalProps> = ({
  playerClassId,
  weaponAlreadyEvolved,
  onEquipItem,
}) => {
  // Determine relevant weapon evolution for this player class
  const classEvoMap: Record<CharacterClassId, string> = {
    warrior: 'evo_excalibur',
    mage: 'evo_phoenix_staff',
    ranger: 'evo_artemis_bow',
    assassin: 'evo_death_scythe',
    necromancer: 'evo_lich_orb',
  };

  const targetWeaponId = classEvoMap[playerClassId];
  const weaponItem = BOSS_DROP_ITEMS.find((it) => it.id === targetWeaponId);

  // Pool of other legendary items
  const otherItems = BOSS_DROP_ITEMS.filter((it) => !it.evolutionWeapon);

  // Present 3 reward options: if weapon not yet evolved, item 1 is the Evolved Weapon!
  const offeredItems: Item[] = [];
  if (!weaponAlreadyEvolved && weaponItem) {
    offeredItems.push(weaponItem);
    offeredItems.push(otherItems[0]);
    offeredItems.push(otherItems[1]);
  } else {
    // Pick 3 legendary accessories
    offeredItems.push(...otherItems.slice(0, 3));
  }

  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const getItemIcon = (iconName: string) => {
    switch (iconName) {
      case 'Swords': return <Swords className="w-8 h-8 text-amber-400" />;
      case 'Flame': return <Sparkles className="w-8 h-8 text-orange-400" />;
      case 'Target': return <Zap className="w-8 h-8 text-emerald-400" />;
      case 'Skull': return <Swords className="w-8 h-8 text-purple-400" />;
      case 'Ghost': return <Sparkles className="w-8 h-8 text-emerald-400" />;
      case 'Shield': return <Shield className="w-8 h-8 text-sky-400" />;
      case 'Heart': return <Heart className="w-8 h-8 text-rose-400" />;
      case 'Hourglass': return <Hourglass className="w-8 h-8 text-amber-400" />;
      default: return <Zap className="w-8 h-8 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-4xl flex flex-col items-center">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-pixel text-xs tracking-wider animate-pulse">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>HẠ GỤC BOSS · BẢO VẬT HOÀNG GIA RƠI RA!</span>
        </div>
        <h2 className="font-pixel text-2xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 mb-2">
          CHỌN BẢO VẬT TIẾN HÓA
        </h2>
        <p className="text-xs text-slate-400 mb-8 font-mono">
          Năng lượng từ Boss giúp thức tỉnh sức mạnh tối thượng và vũ khí huyền thoại mới
        </p>

        {/* 3 Offer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
          {offeredItems.map((item, idx) => {
            const isSelected = selectedIdx === idx;
            const isEvo = !!item.evolutionWeapon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  sounds.playPickup();
                  setSelectedIdx(idx);
                }}
                className={`relative flex flex-col items-center text-center p-6 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-amber-400 shadow-xl shadow-amber-500/20 -translate-y-2'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Evolution Badge */}
                {isEvo && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-300 font-pixel text-[9px]">
                    TIẾN HÓA
                  </div>
                )}

                <div className="w-20 h-20 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-4">
                  {getItemIcon(item.iconName)}
                </div>

                <h3 className="font-pixel text-sm text-amber-300 mb-1">{item.name}</h3>
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider mb-3">
                  {item.type} · {item.rarity}
                </span>

                <p className="text-xs text-slate-300 font-sans leading-relaxed mb-4">
                  {item.description}
                </p>

                {/* Stat pills */}
                <div className="flex flex-wrap gap-1.5 justify-center mt-auto text-[11px] font-mono text-amber-200">
                  {item.stats.attack && <span>+{item.stats.attack} Công</span>}
                  {item.stats.maxHp && <span>+{item.stats.maxHp} HP</span>}
                  {item.stats.defense && <span>+{item.stats.defense} Giáp</span>}
                  {item.stats.critRate && <span>+{Math.round(item.stats.critRate * 100)}% Chí Mạng</span>}
                  {item.stats.vampirism && <span>+{item.stats.vampirism} Hút Máu</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Equip Button */}
        <button
          onClick={() => {
            sounds.playLevelUp();
            onEquipItem(offeredItems[selectedIdx]);
          }}
          className="px-10 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-pixel text-sm tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-3 border border-amber-300"
        >
          <Check className="w-5 h-5" />
          <span>NHẬN TRANG BỊ & TIẾP TỤC CHIẾN ĐẤU</span>
        </button>
      </div>
    </div>
  );
};
