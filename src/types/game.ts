export type CharacterClassId = 'warrior' | 'mage' | 'ranger' | 'assassin' | 'necromancer';

export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type ItemType = 'weapon' | 'armor' | 'boots' | 'ring' | 'relic';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  description: string;
  iconName: string;
  stats: {
    attack?: number;
    maxHp?: number;
    defense?: number;
    critRate?: number; // 0 to 1
    critDamage?: number; // multiplier e.g. 1.5
    moveSpeed?: number;
    cooldownReduction?: number; // 0 to 0.5
    vampirism?: number; // HP per hit
    attackSpeed?: number;
  };
  evolutionWeapon?: boolean;
}

export interface Skill {
  id: string;
  name: string;
  hotkey: 'Q' | 'E' | 'SPACE';
  description: string;
  cooldown: number; // in seconds
  currentCooldown: number;
  icon: string;
  color: string;
  isUltimate?: boolean;
  evolutionLevel: number;
}

export interface CharacterClass {
  id: CharacterClassId;
  name: string;
  title: string;
  description: string;
  playstyle: string;
  accentColor: string;
  baseStats: {
    maxHp: number;
    hp: number;
    maxMana: number;
    mana: number;
    attack: number;
    defense: number;
    moveSpeed: number;
    critRate: number;
    critDamage: number;
    attackRange: number;
    attackSpeed: number; // attacks per second
  };
  startingWeaponName: string;
  skills: Skill[];
  passiveName: string;
  passiveDesc: string;
}

export interface UpgradeOption {
  id: string;
  title: string;
  subtitle: string;
  type: 'stat' | 'skill_upgrade' | 'new_skill' | 'passive';
  rarity: ItemRarity;
  icon: string;
  apply?: (player: PlayerEntity) => void;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'square' | 'circle' | 'spark' | 'text';
  text?: string;
  fontSize?: number;
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  isCrit: boolean;
  radius: number;
  color: string;
  source: 'player' | 'enemy' | 'minion';
  pierce: number;
  life: number;
  maxLife: number;
  type: 'arrow' | 'fireball' | 'magic' | 'blade' | 'bone' | 'deathwave' | 'meteor' | 'shuriken' | 'poison';
  specialEffect?: string;
  target?: EnemyEntity;
}

export interface MinionEntity {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  attack: number;
  target: EnemyEntity | null;
  type: 'skeleton' | 'golem' | 'wisp';
  life: number;
  maxLife: number;
  animFrame: number;
}

export interface DamageNumber {
  id: number;
  x: number;
  y: number;
  damage: number | string;
  color: string;
  alpha: number;
  life: number;
  isCrit: boolean;
}

export interface DropItem {
  id: number;
  x: number;
  y: number;
  type: 'xp' | 'gold' | 'health' | 'chest';
  value: number;
  itemData?: Item;
  color: string;
  size: number;
  blink: number;
}

export interface EnemyEntity {
  id: number;
  x: number;
  y: number;
  type: 'slime' | 'goblin' | 'bat' | 'skeleton' | 'fire_demon' | 'golem' | 'boss_slime' | 'boss_knight' | 'boss_dragon' | 'boss_necro' | 'boss_void_monarch';
  name: string;
  isBoss: boolean;
  isSuperElite?: boolean;
  hp: number;
  maxHp: number;
  attack: number;
  speed: number;
  radius: number;
  color: string;
  xpValue: number;
  goldValue: number;
  attackCooldown: number;
  telegraphTimer: number; // for boss attacks
  telegraphMax: number;
  state: 'idle' | 'chase' | 'attack' | 'windup';
  modifier?: 'speed' | 'tank' | 'frost' | 'fire';
  hitFlash: number;
}

export interface PlayerEntity {
  x: number;
  y: number;
  facing: 1 | -1;
  classData: CharacterClass;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  attack: number;
  defense: number;
  moveSpeed: number;
  critRate: number;
  critDamage: number;
  attackSpeed: number;
  attackTimer: number;
  cooldownReduction: number;
  vampirism: number;
  level: number;
  xp: number;
  xpNeeded: number;
  gold: number;
  invulnerableTime: number;
  hitFlash: number;
  weaponEvolved: boolean;
  equipment: {
    weapon: Item | null;
    armor: Item | null;
    boots: Item | null;
    ring: Item | null;
    relic: Item | null;
  };
  inventory: Item[];
  minions: MinionEntity[];
  // Shop Upgrades (5 levels each)
  armorUpgradeLevel: number; // 0 to 5
  dashLevel: number; // 0 to 5 (cấp 1 mở khóa phím C, cấp 2-5 giảm hồi chiêu)
  dashCooldown: number;
  dashCurrentCooldown: number;
  scytheLevel: number; // 0 to 5 (+5 dmg và +1 lưỡi hái mỗi cấp)
  scytheAngle: number;
  magnetLevel: number; // 0 to 5 (tăng bán kính hút vật phẩm)
  magnetRadius: number;
  // Guinsoo's Rageblade (10 levels, +2% attack speed per level)
  guinsooLevel: number; // 0 to 10
  // Stand: The World (5 levels: punch every 1s, Time Stop [R] 1.0s + 0.2s/lvl)
  theWorldLevel: number; // 0 to 5
  theWorldPunchTimer: number;
  theWorldCooldown: number;
  theWorldCurrentCooldown: number;
  timeStopActiveTimer: number;
  // Lightning Shock chain upgrade (level 1-2)
  lightningLevel: number;
  // Void Dimension mode (Lv20 solo boss arena)
  inVoidDimension: boolean;
}

export type GameStateMode = 'TITLE' | 'CLASS_SELECT' | 'PLAYING' | 'PAUSED' | 'LEVEL_UP' | 'BOSS_CHEST' | 'INVENTORY' | 'SHOP' | 'GAME_OVER' | 'VICTORY';
