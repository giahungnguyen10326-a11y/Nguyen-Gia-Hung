import {
  CharacterClass,
  DropItem,
  EnemyEntity,
  Item,
  MinionEntity,
  Particle,
  PlayerEntity,
  Projectile,
  UpgradeOption,
} from '../types/game';
import { BOSS_DROP_ITEMS, CHARACTER_CLASSES, UPGRADE_POOL, SHOP_UPGRADES } from './data';
import {
  drawDropItem,
  drawEnemySprite,
  drawMinionSprite,
  drawPixelRect,
  drawPlayerSprite,
  drawProjectile,
  drawTheWorldStand,
  drawLightningBolt,
} from './pixelArt';
import { sounds } from '../services/audio';

export interface HUDData {
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  xp: number;
  xpNeeded: number;
  level: number;
  gold: number;
  kills: number;
  timeFormatted: string;
  activeBoss: { name: string; hp: number; maxHp: number; isSuperElite?: boolean } | null;
  skills: { id: string; name: string; hotkey: string; cooldown: number; currentCooldown: number; icon: string; color: string }[];
  weaponEvolved: boolean;
  dashLevel: number;
  dashCooldown: number;
  dashCurrentCooldown: number;
  scytheLevel: number;
  magnetRadius: number;
  armorUpgradeLevel: number;
  guinsooLevel: number;
  theWorldLevel: number;
  theWorldCooldown: number;
  theWorldCurrentCooldown: number;
  timeStopActiveTimer: number;
  inVoidDimension: boolean;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animId: number = 0;
  private lastTime: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;

  // React callbacks
  public onUpdateHUD: (data: HUDData) => void;
  public onLevelUp: (choices: any[]) => void;
  public onBossChest: (chest: DropItem) => void;
  public onGameOver: (stats: { time: string; kills: number; level: number; bossKills: number }) => void;
  public onOpenShop: () => void;

  // Game Entities & State
  public player: PlayerEntity;
  private enemies: EnemyEntity[] = [];
  private projectiles: Projectile[] = [];
  private particles: Particle[] = [];
  private dropItems: DropItem[] = [];
  private hudTimer: number = 0;

  // Metrics
  private kills: number = 0;
  private bossKills: number = 0;
  private gameTime: number = 0;
  private nextBossTime: number = 90; // First boss at 90s (1.5 min)
  private nextBossIdx: number = 0;
  private spawnTimer: number = 0;
  private voidBossTriggered: boolean = false;
  private theWorldPunchCooldownTimer: number = 0;
  private activeLightnings: { x1: number; y1: number; x2: number; y2: number; life: number; color: string }[] = [];

  // Camera & Screen Shake & Hitstop
  private cameraX: number = 0;
  private cameraY: number = 0;
  private shakeIntensity: number = 0;
  private hitstopTimer: number = 0;
  private animTick: number = 0;

  // Input State
  private keysHeld: Record<string, boolean> = {};
  private mousePos = { x: 0, y: 0 };
  private isMouseDown: boolean = false;

  constructor(
    canvas: HTMLCanvasElement,
    classId: string,
    callbacks: {
      onUpdateHUD: (data: HUDData) => void;
      onLevelUp: (choices: any[]) => void;
      onBossChest: (chest: DropItem) => void;
      onGameOver: (stats: { time: string; kills: number; level: number; bossKills: number }) => void;
      onOpenShop: () => void;
    }
  ) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;

    this.onUpdateHUD = callbacks.onUpdateHUD;
    this.onLevelUp = callbacks.onLevelUp;
    this.onBossChest = callbacks.onBossChest;
    this.onGameOver = callbacks.onGameOver;
    this.onOpenShop = callbacks.onOpenShop;

    const baseClass = CHARACTER_CLASSES[classId] || CHARACTER_CLASSES.warrior;
    this.player = this.createPlayer(baseClass);

    this.bindEvents();
    this.resizeCanvas();
  }

  private createPlayer(classData: CharacterClass): PlayerEntity {
    return {
      x: 0,
      y: 0,
      facing: 1,
      classData: JSON.parse(JSON.stringify(classData)),
      hp: classData.baseStats.hp,
      maxHp: classData.baseStats.maxHp,
      mana: classData.baseStats.mana,
      maxMana: classData.baseStats.maxMana,
      attack: classData.baseStats.attack,
      defense: classData.baseStats.defense,
      moveSpeed: classData.baseStats.moveSpeed,
      critRate: classData.baseStats.critRate,
      critDamage: classData.baseStats.critDamage,
      attackSpeed: classData.baseStats.attackSpeed,
      attackTimer: 0,
      cooldownReduction: 0,
      vampirism: 0,
      level: 1,
      xp: 0,
      xpNeeded: 100,
      gold: 0,
      invulnerableTime: 0,
      hitFlash: 0,
      weaponEvolved: false,
      equipment: {
        weapon: {
          id: 'starter_weapon',
          name: classData.startingWeaponName,
          type: 'weapon',
          rarity: 'common',
          description: 'Vũ khí khởi đầu mộc mạc nhưng bền bỉ.',
          iconName: 'Swords',
          stats: { attack: classData.baseStats.attack },
        },
        armor: null,
        boots: null,
        ring: null,
        relic: null,
      },
      inventory: [],
      minions: [],
      armorUpgradeLevel: 0,
      dashLevel: 0,
      dashCooldown: 4.0,
      dashCurrentCooldown: 0,
      scytheLevel: 0,
      scytheAngle: 0,
      magnetLevel: 0,
      magnetRadius: 120,
      guinsooLevel: 0,
      theWorldLevel: 0,
      theWorldPunchTimer: 1.0,
      theWorldCooldown: 18.0,
      theWorldCurrentCooldown: 0,
      timeStopActiveTimer: 0,
      lightningLevel: 0,
      inVoidDimension: false,
    };
  }

  private resizeCanvas = () => {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };

  private bindEvents() {
    window.addEventListener('resize', this.resizeCanvas);

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);

    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  public unbindEvents() {
    window.removeEventListener('resize', this.resizeCanvas);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);

    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keysHeld[e.key.toLowerCase()] = true;
    this.keysHeld[e.code] = true;

    // Edge-triggered skills
    if (e.key === 'q' || e.key === 'Q') {
      this.triggerSkill(0);
    } else if (e.key === 'e' || e.key === 'E') {
      this.triggerSkill(1);
    } else if (e.code === 'Space') {
      this.triggerSkill(2); // Ultimate
    } else if (e.key === 'c' || e.key === 'C') {
      this.triggerDash();
    } else if (e.key === 'r' || e.key === 'R') {
      this.triggerTheWorldTimeStop();
    } else if (e.key === 'b' || e.key === 'B') {
      this.onOpenShop();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keysHeld[e.key.toLowerCase()] = false;
    this.keysHeld[e.code] = false;
  };

  private handleBlur = () => {
    this.keysHeld = {};
    this.isMouseDown = false;
  };

  private handleMouseMove = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePos.x = e.clientX - rect.left;
    this.mousePos.y = e.clientY - rect.top;
  };

  private handleMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
      this.isMouseDown = true;
    }
  };

  private handleMouseUp = (e: MouseEvent) => {
    if (e.button === 0) {
      this.isMouseDown = false;
    }
  };

  public start() {
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    if (!this.isRunning) {
      this.start();
      return;
    }
    this.isPaused = false;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public stop() {
    this.isRunning = false;
    cancelAnimationFrame(this.animId);
    this.unbindEvents();
  }

  private loop = (currentTime: number) => {
    if (!this.isRunning) return;

    if (this.isPaused) {
      this.render(); // draw paused state
      return;
    }

    const rawDt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    const dt = Math.min(rawDt, 0.05); // clamp delta time for stability

    // Hitstop freeze frame
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
    } else {
      this.update(dt);
    }

    this.render();
    this.animId = requestAnimationFrame(this.loop);
  };

  // --- GAME UPDATE SIMULATION ---
  private update(dt: number) {
    this.gameTime += dt;
    this.animTick += dt;

    // Player inputs & movement
    let moveX = 0;
    let moveY = 0;
    if (this.keysHeld['w'] || this.keysHeld['arrowup']) moveY -= 1;
    if (this.keysHeld['s'] || this.keysHeld['arrowdown']) moveY += 1;
    if (this.keysHeld['a'] || this.keysHeld['arrowleft']) moveX -= 1;
    if (this.keysHeld['d'] || this.keysHeld['arrowright']) moveX += 1;

    if (moveX !== 0 && moveY !== 0) {
      const invSqrt = 1 / Math.SQRT2;
      moveX *= invSqrt;
      moveY *= invSqrt;
    }

    const currentSpeed = this.player.moveSpeed * 60;
    this.player.x += moveX * currentSpeed * dt;
    this.player.y += moveY * currentSpeed * dt;

    // Face toward mouse
    const worldMouseX = this.mousePos.x - this.canvas.width / 2 + this.cameraX;
    this.player.facing = worldMouseX >= this.player.x ? 1 : -1;

    // Camera smoothly follows player
    this.cameraX += (this.player.x - this.cameraX) * 0.1;
    this.cameraY += (this.player.y - this.cameraY) * 0.1;

    // Screen Shake decay
    if (this.shakeIntensity > 0) {
      this.shakeIntensity = Math.max(0, this.shakeIntensity - dt * 25);
    }

    // Player Invulnerability & Hit Flash
    if (this.player.invulnerableTime > 0) {
      this.player.invulnerableTime -= dt;
    }
    if (this.player.hitFlash > 0) {
      this.player.hitFlash -= dt;
    }

    // Mana & HP regeneration
    this.player.mana = Math.min(this.player.maxMana, this.player.mana + 15 * dt);
    // Passive class heals (Warrior passive regen, etc.)
    if (this.player.classData.id === 'warrior') {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 2 * dt);
    }

    // Skill Cooldowns
    this.player.classData.skills.forEach((s) => {
      if (s.currentCooldown > 0) {
        s.currentCooldown = Math.max(0, s.currentCooldown - dt);
      }
    });

    // Dash Cooldown (Phím C)
    if (this.player.dashCurrentCooldown > 0) {
      this.player.dashCurrentCooldown = Math.max(0, this.player.dashCurrentCooldown - dt);
    }

    // Stand The World Time Stop Cooldown & Active Timer (Phím R)
    if (this.player.theWorldCurrentCooldown > 0) {
      this.player.theWorldCurrentCooldown = Math.max(0, this.player.theWorldCurrentCooldown - dt);
    }
    const isTimeStopped = this.player.timeStopActiveTimer > 0;
    if (isTimeStopped) {
      this.player.timeStopActiveTimer = Math.max(0, this.player.timeStopActiveTimer - dt);
    }

    // Stand: The World 1-Second Auto Punch
    if (this.theWorldPunchCooldownTimer > 0) {
      this.theWorldPunchCooldownTimer -= dt;
    }
    if (this.player.theWorldLevel > 0) {
      this.player.theWorldPunchTimer -= dt;
      if (this.player.theWorldPunchTimer <= 0) {
        this.player.theWorldPunchTimer = 1.0;
        let closest: EnemyEntity | null = null;
        let minDist = 220;
        for (const en of this.enemies) {
          const d = Math.hypot(en.x - this.player.x, en.y - this.player.y);
          if (d < minDist) {
            minDist = d;
            closest = en;
          }
        }
        if (closest) {
          sounds.playPunch();
          this.theWorldPunchCooldownTimer = 0.25;
          const punchDamage = Math.round(this.player.attack * (1.8 + this.player.theWorldLevel * 0.4));
          this.damageEnemy(closest, punchDamage, true);
          this.createParticleBurst(closest.x, closest.y, 14, '#fbbf24');
        }
      }
    }

    // Active Lightning Decay
    for (let i = this.activeLightnings.length - 1; i >= 0; i--) {
      this.activeLightnings[i].life -= dt;
      if (this.activeLightnings[i].life <= 0) {
        this.activeLightnings.splice(i, 1);
      }
    }

    // Orbiting Scythes logic (Shop upgrade: +5 sát thương, +1 lưỡi hái mỗi cấp)
    if (this.player.scytheLevel > 0) {
      this.player.scytheAngle += dt * 3.5;
      const scytheCount = this.player.scytheLevel;
      const scytheDmg = 10 + this.player.scytheLevel * 5;
      const orbitRadius = 65;

      for (let i = 0; i < scytheCount; i++) {
        const a = this.player.scytheAngle + (i * Math.PI * 2) / scytheCount;
        const sx = this.player.x + Math.cos(a) * orbitRadius;
        const sy = this.player.y + Math.sin(a) * orbitRadius;

        for (let j = 0; j < this.enemies.length; j++) {
          const en = this.enemies[j];
          if (Math.hypot(en.x - sx, en.y - sy) < en.radius + 16) {
            this.damageEnemy(en, scytheDmg * dt * 2.8, false);
          }
        }
      }
    }

    // Auto / Mouse Primary Attack
    this.player.attackTimer -= dt;
    if ((this.isMouseDown || this.keysHeld['space']) && this.player.attackTimer <= 0) {
      this.executePrimaryAttack();
      this.player.attackTimer = 1 / this.player.attackSpeed;
    }

    // Update Minions (Necromancer)
    this.updateMinions(dt);

    // Update Projectiles
    this.updateProjectiles(dt);

    // Update Enemies & Bosses (Frozen if Time Stopped)
    if (!isTimeStopped) {
      this.updateEnemies(dt);

      // Monster Spawning Schedule (Suspended in Void Dimension)
      if (!this.player.inVoidDimension) {
        this.handleMonsterSpawning(dt);
        this.handleBossSchedule();
      }
    }

    // Update Particles
    this.updateParticles(dt);

    // Update Drops
    this.updateDrops(dt);

    // Sync HUD data to React throttled (10 times a second instead of 60 to prevent React lag)
    this.hudTimer += dt;
    if (this.hudTimer >= 0.1) {
      this.hudTimer = 0;
      this.syncHUD();
    }
  }

  // --- PRIMARY ATTACK ---
  private executePrimaryAttack() {
    const worldMouseX = this.mousePos.x - this.canvas.width / 2 + this.cameraX;
    const worldMouseY = this.mousePos.y - this.canvas.height / 2 + this.cameraY;

    const dx = worldMouseX - this.player.x;
    const dy = worldMouseY - this.player.y;
    const dist = Math.hypot(dx, dy) || 1;
    const dirX = dx / dist;
    const dirY = dy / dist;

    const isCrit = Math.random() < this.player.critRate;
    const damage = Math.round(
      this.player.attack * (isCrit ? this.player.critDamage : 1) * (0.9 + Math.random() * 0.2)
    );

    switch (this.player.classData.id) {
      case 'warrior': {
        sounds.playSlash();
        // Melee slash projectile
        const slashColor = this.player.weaponEvolved ? '#fbbf24' : '#e2e8f0';
        this.projectiles.push({
          id: Math.random(),
          x: this.player.x + dirX * 30,
          y: this.player.y + dirY * 30,
          vx: dirX * (this.player.weaponEvolved ? 380 : 200),
          vy: dirY * (this.player.weaponEvolved ? 380 : 200),
          damage: this.player.weaponEvolved ? damage * 1.5 : damage,
          isCrit,
          radius: this.player.weaponEvolved ? 35 : 24,
          color: slashColor,
          source: 'player',
          pierce: this.player.weaponEvolved ? 5 : 2,
          life: 0.28,
          maxLife: 0.28,
          type: 'blade',
        });
        break;
      }

      case 'mage': {
        sounds.playMagicCast();
        const orbCol = this.player.weaponEvolved ? '#f59e0b' : '#38bdf8';
        this.projectiles.push({
          id: Math.random(),
          x: this.player.x,
          y: this.player.y - 10,
          vx: dirX * 420,
          vy: dirY * 420,
          damage: this.player.weaponEvolved ? damage * 1.4 : damage,
          isCrit,
          radius: 12,
          color: orbCol,
          source: 'player',
          pierce: this.player.weaponEvolved ? 3 : 1,
          life: 1.2,
          maxLife: 1.2,
          type: this.player.weaponEvolved ? 'fireball' : 'magic',
        });
        break;
      }

      case 'ranger': {
        sounds.playShoot();
        const arrowCount = this.player.weaponEvolved ? 3 : 1;
        const spread = 0.15;
        for (let i = 0; i < arrowCount; i++) {
          const angle = Math.atan2(dirY, dirX) + (i - (arrowCount - 1) / 2) * spread;
          this.projectiles.push({
            id: Math.random(),
            x: this.player.x,
            y: this.player.y - 8,
            vx: Math.cos(angle) * 550,
            vy: Math.sin(angle) * 550,
            damage,
            isCrit,
            radius: 8,
            color: '#22c55e',
            source: 'player',
            pierce: this.player.weaponEvolved ? 3 : 1,
            life: 1.0,
            maxLife: 1.0,
            type: 'arrow',
          });
        }
        break;
      }

      case 'assassin': {
        sounds.playSlash();
        // Twin daggers fast strike / poison shuriken
        this.projectiles.push({
          id: Math.random(),
          x: this.player.x + dirX * 20,
          y: this.player.y + dirY * 20,
          vx: dirX * 460,
          vy: dirY * 460,
          damage,
          isCrit,
          radius: 10,
          color: '#a855f7',
          source: 'player',
          pierce: 1,
          life: 0.4,
          maxLife: 0.4,
          type: 'shuriken',
          specialEffect: 'poison',
        });
        break;
      }

      case 'necromancer': {
        sounds.playMagicCast();
        // Leeching soul orb
        this.projectiles.push({
          id: Math.random(),
          x: this.player.x,
          y: this.player.y - 10,
          vx: dirX * 360,
          vy: dirY * 360,
          damage,
          isCrit,
          radius: 14,
          color: '#10b981',
          source: 'player',
          pierce: 2,
          life: 1.1,
          maxLife: 1.1,
          type: 'magic',
          specialEffect: 'leech',
        });
        break;
      }
    }
  }

  // --- TRIGGER DASH (Phím C - Mở khóa từ Cửa Hàng Giày) ---
  public triggerDash() {
    if (this.player.dashLevel <= 0 || this.player.dashCurrentCooldown > 0) return;

    let dirX = 0;
    let dirY = 0;
    if (this.keysHeld['w'] || this.keysHeld['arrowup']) dirY -= 1;
    if (this.keysHeld['s'] || this.keysHeld['arrowdown']) dirY += 1;
    if (this.keysHeld['a'] || this.keysHeld['arrowleft']) dirX -= 1;
    if (this.keysHeld['d'] || this.keysHeld['arrowright']) dirX += 1;

    if (dirX === 0 && dirY === 0) {
      const worldMouseX = this.mousePos.x - this.canvas.width / 2 + this.cameraX;
      const worldMouseY = this.mousePos.y - this.canvas.height / 2 + this.cameraY;
      const dx = worldMouseX - this.player.x;
      const dy = worldMouseY - this.player.y;
      const dist = Math.hypot(dx, dy) || 1;
      dirX = dx / dist;
      dirY = dy / dist;
    } else {
      const len = Math.hypot(dirX, dirY) || 1;
      dirX /= len;
      dirY /= len;
    }

    this.player.x += dirX * 160;
    this.player.y += dirY * 160;
    this.player.invulnerableTime = 0.45;
    this.player.dashCurrentCooldown = this.player.dashCooldown;
    sounds.playDash();
    this.createParticleBurst(this.player.x, this.player.y, 14, '#38bdf8');
  }

  // --- TRIGGER THE WORLD TIME STOP (Phím R) ---
  public triggerTheWorldTimeStop() {
    if (this.player.theWorldLevel <= 0) return;
    if (this.player.theWorldCurrentCooldown > 0) return;
    if (this.player.timeStopActiveTimer > 0) return;

    // Time stop duration: 1.0s base + 0.2s per upgrade level (can be upgraded 5 times)
    const duration = 1.0 + (this.player.theWorldLevel - 1) * 0.2;
    this.player.timeStopActiveTimer = duration;
    this.player.theWorldCurrentCooldown = this.player.theWorldCooldown;

    sounds.playTimeStop();
    this.triggerCameraShake(12);
    this.createParticleBurst(this.player.x, this.player.y, 35, '#fbbf24');
    this.syncHUD();
  }

  // --- TRIGGER ACTIVE SKILLS ---
  public triggerSkill(slotIdx: number) {
    const skill = this.player.classData.skills[slotIdx];
    if (!skill || skill.currentCooldown > 0) return;

    const manaCost = slotIdx === 2 ? 50 : 25;
    if (this.player.mana < manaCost) return;
    this.player.mana -= manaCost;

    // Calculate CDR
    const actualCd = skill.cooldown * (1 - this.player.cooldownReduction);
    skill.currentCooldown = actualCd;

    const worldMouseX = this.mousePos.x - this.canvas.width / 2 + this.cameraX;
    const worldMouseY = this.mousePos.y - this.canvas.height / 2 + this.cameraY;

    // Execute skill by class and slot
    switch (this.player.classData.id) {
      case 'warrior':
        if (slotIdx === 0) {
          // Whirlwind 360 Slash
          sounds.playSlash();
          this.triggerCameraShake(6);
          const slashRadius = 130;
          this.createParticleBurst(this.player.x, this.player.y, 25, '#ef4444');
          this.enemies.forEach((en) => {
            const d = Math.hypot(en.x - this.player.x, en.y - this.player.y);
            if (d < slashRadius + en.radius) {
              const dmg = Math.round(this.player.attack * 2.2);
              this.damageEnemy(en, dmg, true);
              // Knockback
              const pushAngle = Math.atan2(en.y - this.player.y, en.x - this.player.x);
              en.x += Math.cos(pushAngle) * 60;
              en.y += Math.sin(pushAngle) * 60;
            }
          });
        } else if (slotIdx === 1) {
          // Berserk Roar
          sounds.playLevelUp();
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.player.maxHp * 0.2);
          this.player.attackSpeed *= 1.4;
          this.player.moveSpeed *= 1.3;
          this.createParticleBurst(this.player.x, this.player.y, 20, '#f97316');
          setTimeout(() => {
            this.player.attackSpeed /= 1.4;
            this.player.moveSpeed /= 1.3;
          }, 5000);
        } else if (slotIdx === 2) {
          // Excalibur Ultimate Beam
          sounds.playExplosion();
          this.triggerCameraShake(12);
          this.hitstop(0.06);
          const angle = Math.atan2(worldMouseY - this.player.y, worldMouseX - this.player.x);
          for (let i = 0; i < 7; i++) {
            this.projectiles.push({
              id: Math.random(),
              x: this.player.x + Math.cos(angle) * (i * 40),
              y: this.player.y + Math.sin(angle) * (i * 40),
              vx: Math.cos(angle) * 700,
              vy: Math.sin(angle) * 700,
              damage: Math.round(this.player.attack * 5.0),
              isCrit: true,
              radius: 40,
              color: '#fbbf24',
              source: 'player',
              pierce: 99,
              life: 1.2,
              maxLife: 1.2,
              type: 'blade',
            });
          }
        }
        break;

      case 'mage':
        if (slotIdx === 0) {
          // Frost Nova (Freeze all nearby enemies)
          sounds.playMagicCast();
          this.triggerCameraShake(4);
          this.createParticleBurst(this.player.x, this.player.y, 30, '#38bdf8');
          this.enemies.forEach((en) => {
            const d = Math.hypot(en.x - this.player.x, en.y - this.player.y);
            if (d < 180 + en.radius) {
              this.damageEnemy(en, Math.round(this.player.attack * 1.5), false);
              en.speed = 0; // Frozen!
              setTimeout(() => {
                en.speed = en.isBoss ? 2.0 : 1.2;
              }, 2500);
            }
          });
        } else if (slotIdx === 1) {
          // Meteor Strike at cursor
          sounds.playExplosion();
          this.triggerCameraShake(10);
          this.createParticleBurst(worldMouseX, worldMouseY, 40, '#f97316');
          this.enemies.forEach((en) => {
            const d = Math.hypot(en.x - worldMouseX, en.y - worldMouseY);
            if (d < 160 + en.radius) {
              this.damageEnemy(en, Math.round(this.player.attack * 3.5), true);
            }
          });
        } else if (slotIdx === 2) {
          // Chain Lightning Ultimate Storm
          sounds.playExplosion();
          this.triggerCameraShake(14);
          this.enemies.slice(0, 15).forEach((en) => {
            this.damageEnemy(en, Math.round(this.player.attack * 4.5), true);
            this.createParticleBurst(en.x, en.y, 15, '#c084fc');
          });
        }
        break;

      case 'ranger':
        if (slotIdx === 0) {
          // Arrow Volley (9 arrows)
          sounds.playShoot();
          const baseAngle = Math.atan2(worldMouseY - this.player.y, worldMouseX - this.player.x);
          for (let i = -4; i <= 4; i++) {
            const a = baseAngle + i * 0.12;
            this.projectiles.push({
              id: Math.random(),
              x: this.player.x,
              y: this.player.y,
              vx: Math.cos(a) * 600,
              vy: Math.sin(a) * 600,
              damage: Math.round(this.player.attack * 1.8),
              isCrit: Math.random() < this.player.critRate,
              radius: 8,
              color: '#22c55e',
              source: 'player',
              pierce: 3,
              life: 1.0,
              maxLife: 1.0,
              type: 'arrow',
            });
          }
        } else if (slotIdx === 1) {
          // Wind Dash & Caltrops
          sounds.playDash();
          const angle = Math.atan2(worldMouseY - this.player.y, worldMouseX - this.player.x);
          this.player.x += Math.cos(angle) * 160;
          this.player.y += Math.sin(angle) * 160;
          this.player.invulnerableTime = 1.5;
          this.createParticleBurst(this.player.x, this.player.y, 15, '#10b981');
        } else if (slotIdx === 2) {
          // Artemis Piercing Barrage
          sounds.playShoot();
          this.triggerCameraShake(8);
          for (let i = 0; i < 16; i++) {
            const a = (i / 16) * Math.PI * 2;
            this.projectiles.push({
              id: Math.random(),
              x: this.player.x,
              y: this.player.y,
              vx: Math.cos(a) * 500,
              vy: Math.sin(a) * 500,
              damage: Math.round(this.player.attack * 3.0),
              isCrit: true,
              radius: 10,
              color: '#4ade80',
              source: 'player',
              pierce: 5,
              life: 1.3,
              maxLife: 1.3,
              type: 'arrow',
            });
          }
        }
        break;

      case 'assassin':
        if (slotIdx === 0) {
          // Fan of Poison Kunai
          sounds.playShoot();
          const baseA = Math.atan2(worldMouseY - this.player.y, worldMouseX - this.player.x);
          for (let i = -3; i <= 4; i++) {
            const a = baseA + i * 0.14;
            this.projectiles.push({
              id: Math.random(),
              x: this.player.x,
              y: this.player.y,
              vx: Math.cos(a) * 520,
              vy: Math.sin(a) * 520,
              damage: Math.round(this.player.attack * 1.6),
              isCrit: true,
              radius: 9,
              color: '#a855f7',
              source: 'player',
              pierce: 2,
              life: 0.8,
              maxLife: 0.8,
              type: 'shuriken',
              specialEffect: 'poison',
            });
          }
        } else if (slotIdx === 1) {
          // Shadow Blink (Teleport to cursor)
          sounds.playDash();
          this.createParticleBurst(this.player.x, this.player.y, 20, '#0f172a');
          this.player.x = worldMouseX;
          this.player.y = worldMouseY;
          this.player.invulnerableTime = 1.0;
          this.createParticleBurst(this.player.x, this.player.y, 25, '#dc2626');
          // Damage enemies at destination
          this.enemies.forEach((en) => {
            if (Math.hypot(en.x - this.player.x, en.y - this.player.y) < 100) {
              this.damageEnemy(en, Math.round(this.player.attack * 2.5), true);
            }
          });
        } else if (slotIdx === 2) {
          // Void Scythe Execution
          sounds.playExplosion();
          this.triggerCameraShake(12);
          this.enemies.forEach((en) => {
            const d = Math.hypot(en.x - this.player.x, en.y - this.player.y);
            if (d < 240) {
              // Execute if < 30% HP
              const isExec = en.hp < en.maxHp * 0.35 && !en.isBoss;
              const dmg = isExec ? en.hp + 999 : Math.round(this.player.attack * 4.0);
              this.damageEnemy(en, dmg, true);
              if (isExec) {
                this.createParticleBurst(en.x, en.y, 20, '#7e22ce');
              }
            }
          });
        }
        break;

      case 'necromancer':
        if (slotIdx === 0) {
          // Summon 3 Skeleton Warriors
          sounds.playSummon();
          for (let i = 0; i < 3; i++) {
            this.player.minions.push({
              id: Math.random(),
              x: this.player.x + (Math.random() - 0.5) * 80,
              y: this.player.y + (Math.random() - 0.5) * 80,
              hp: 150 + this.player.level * 20,
              maxHp: 150 + this.player.level * 20,
              attack: Math.round(this.player.attack * 0.8),
              target: null,
              type: 'skeleton',
              life: 30,
              maxLife: 30,
              animFrame: 0,
            });
          }
          this.createParticleBurst(this.player.x, this.player.y, 20, '#10b981');
        } else if (slotIdx === 1) {
          // Death Decay Aura
          sounds.playMagicCast();
          this.createParticleBurst(worldMouseX, worldMouseY, 35, '#047857');
          this.enemies.forEach((en) => {
            if (Math.hypot(en.x - worldMouseX, en.y - worldMouseY) < 180) {
              this.damageEnemy(en, Math.round(this.player.attack * 2.0), false);
              en.speed *= 0.5; // slow
            }
          });
          // Leech heal
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + 30);
        } else if (slotIdx === 2) {
          // Lich Transformation & Giant Bone Golem
          sounds.playExplosion();
          this.triggerCameraShake(12);
          // Spawn Giant Bone Golem
          this.player.minions.push({
            id: Math.random(),
            x: this.player.x,
            y: this.player.y - 40,
            hp: 600 + this.player.level * 60,
            maxHp: 600 + this.player.level * 60,
            attack: Math.round(this.player.attack * 2.2),
            target: null,
            type: 'golem',
            life: 25,
            maxLife: 25,
            animFrame: 0,
          });
          // Death waves
          for (let i = 0; i < 3; i++) {
            setTimeout(() => {
              this.enemies.forEach((en) => {
                if (Math.hypot(en.x - this.player.x, en.y - this.player.y) < 300) {
                  this.damageEnemy(en, Math.round(this.player.attack * 2.5), true);
                }
              });
            }, i * 300);
          }
        }
        break;
    }
  }

  // --- MINIONS UPDATE ---
  private updateMinions(dt: number) {
    for (let i = this.player.minions.length - 1; i >= 0; i--) {
      const minion = this.player.minions[i];
      minion.life -= dt;
      minion.animFrame += dt;

      if (minion.life <= 0 || minion.hp <= 0) {
        this.createParticleBurst(minion.x, minion.y, 8, '#cbd5e1');
        this.player.minions.splice(i, 1);
        continue;
      }

      // Find closest enemy
      let closest: EnemyEntity | null = null;
      let closestDist = 350;
      this.enemies.forEach((en) => {
        const d = Math.hypot(en.x - minion.x, en.y - minion.y);
        if (d < closestDist) {
          closestDist = d;
          closest = en;
        }
      });

      if (closest) {
        const dx = (closest as EnemyEntity).x - minion.x;
        const dy = (closest as EnemyEntity).y - minion.y;
        const dist = Math.hypot(dx, dy) || 1;
        const speed = 120 * dt;

        if (dist > 30) {
          minion.x += (dx / dist) * speed;
          minion.y += (dy / dist) * speed;
        } else {
          // Attack!
          this.damageEnemy(closest, minion.attack * dt * 2, false);
        }
      } else {
        // Follow player
        const dx = this.player.x - minion.x;
        const dy = this.player.y - minion.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist > 70) {
          minion.x += (dx / dist) * 100 * dt;
          minion.y += (dy / dist) * 100 * dt;
        }
      }
    }
  }

  // --- PROJECTILES SIMULATION ---
  private updateProjectiles(dt: number) {
    const isTimeStopped = this.player.timeStopActiveTimer > 0;
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];

      // Enemy projectiles are completely frozen in Time Stop!
      if (proj.source === 'enemy' && isTimeStopped) {
        continue;
      }

      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.life -= dt;

      if (proj.life <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Collision with enemies (if source is player)
      if (proj.source === 'player') {
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const en = this.enemies[j];
          const dist = Math.hypot(en.x - proj.x, en.y - proj.y);
          if (dist < en.radius + proj.radius) {
            this.damageEnemy(en, proj.damage, proj.isCrit);
            proj.pierce--;

            // Special effects
            if (proj.specialEffect === 'poison') {
              en.modifier = 'frost';
              en.speed *= 0.7;
            } else if (proj.specialEffect === 'leech') {
              this.player.hp = Math.min(this.player.maxHp, this.player.hp + 6);
            }

            if (this.player.vampirism > 0) {
              this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.player.vampirism);
            }

            if (proj.pierce <= 0) {
              this.projectiles.splice(i, 1);
              break;
            }
          }
        }
      } else if (proj.source === 'enemy') {
        // Enemy projectile hitting player
        const dist = Math.hypot(this.player.x - proj.x, this.player.y - proj.y);
        if (dist < 18 + proj.radius && this.player.invulnerableTime <= 0) {
          this.damagePlayer(proj.damage);
          this.projectiles.splice(i, 1);
        }
      }
    }
  }

  // --- DAMAGE ENEMY & KNOCKBACK ---
  private damageEnemy(enemy: EnemyEntity, damage: number, isCrit: boolean, skipChain: boolean = false) {
    enemy.hp -= damage;
    enemy.hitFlash = 0.1;

    sounds.playHit();

    // Hitstop on heavy / crit hits
    if (isCrit || enemy.isBoss) {
      this.hitstop(0.03);
      this.triggerCameraShake(enemy.isBoss ? 4 : 1.5);
    }

    // Trigger Lightning Shock chain effect if unlocked and not already chaining
    if (!skipChain && this.player.lightningLevel > 0) {
      this.triggerChainLightning(enemy, damage);
    }

    // Death check
    if (enemy.hp <= 0) {
      this.killEnemy(enemy);
    }
  }

  private triggerChainLightning(originEnemy: EnemyEntity, baseDamage: number) {
    const maxTargets = this.player.lightningLevel >= 2 ? 5 : 3;
    const dmgRatio = this.player.lightningLevel >= 2 ? 1.0 : 0.75;
    const chainDmg = Math.round(baseDamage * dmgRatio);

    const candidates = this.enemies
      .filter((e) => e !== originEnemy && e.hp > 0 && Math.hypot(e.x - originEnemy.x, e.y - originEnemy.y) < 180)
      .slice(0, maxTargets);

    if (candidates.length > 0) {
      sounds.playLightning();
      let prevX = originEnemy.x;
      let prevY = originEnemy.y;

      candidates.forEach((target) => {
        this.activeLightnings.push({
          x1: prevX,
          y1: prevY,
          x2: target.x,
          y2: target.y,
          life: 0.12,
          color: this.player.lightningLevel >= 2 ? '#c084fc' : '#38bdf8',
        });
        this.damageEnemy(target, chainDmg, false, true);
        target.speed *= 0.5; // Shock stun
        prevX = target.x;
        prevY = target.y;
      });
    }
  }

  // --- KILL ENEMY & DROP LOOT ---
  private killEnemy(enemy: EnemyEntity) {
    const idx = this.enemies.indexOf(enemy);
    if (idx !== -1) {
      this.enemies.splice(idx, 1);
    }

    this.kills++;
    sounds.playEnemyDeath();
    this.createParticleBurst(enemy.x, enemy.y, enemy.isBoss ? 50 : 14, enemy.color);

    if (enemy.isBoss) {
      this.bossKills++;
      this.triggerCameraShake(16);
      this.hitstop(0.08);

      // GUARANTEED BOSS CHEST DROP!
      this.dropItems.push({
        id: Math.random(),
        x: enemy.x,
        y: enemy.y,
        type: 'chest',
        value: 1,
        color: '#fbbf24',
        size: 24,
        blink: 0,
      });

      // Also drops lots of Gold & XP
      for (let i = 0; i < 15; i++) {
        this.dropItems.push({
          id: Math.random(),
          x: enemy.x + (Math.random() - 0.5) * 120,
          y: enemy.y + (Math.random() - 0.5) * 120,
          type: 'gold',
          value: 20,
          color: '#f59e0b',
          size: 8,
          blink: Math.random(),
        });
      }
    } else {
      // Regular monster drops XP gem
      this.dropItems.push({
        id: Math.random(),
        x: enemy.x,
        y: enemy.y,
        type: 'xp',
        value: enemy.xpValue,
        color: enemy.xpValue > 25 ? '#a855f7' : enemy.xpValue > 15 ? '#38bdf8' : '#22c55e',
        size: 7,
        blink: Math.random(),
      });

      // Chance for Gold
      if (Math.random() < 0.35) {
        this.dropItems.push({
          id: Math.random(),
          x: enemy.x + 8,
          y: enemy.y + 8,
          type: 'gold',
          value: enemy.goldValue,
          color: '#f59e0b',
          size: 6,
          blink: Math.random(),
        });
      }

      // Chance for Health Potion
      if (Math.random() < 0.08) {
        this.dropItems.push({
          id: Math.random(),
          x: enemy.x - 8,
          y: enemy.y - 8,
          type: 'health',
          value: 40,
          color: '#ef4444',
          size: 9,
          blink: Math.random(),
        });
      }
    }
  }

  // --- DAMAGE PLAYER ---
  private damagePlayer(amount: number) {
    if (this.player.invulnerableTime > 0) return;

    // Assassin dodge passive (20%)
    if (this.player.classData.id === 'assassin' && Math.random() < 0.2) {
      return;
    }

    const netDamage = Math.max(2, Math.round(amount - this.player.defense));
    this.player.hp -= netDamage;
    this.player.invulnerableTime = 0.4;
    this.player.hitFlash = 0.15;
    this.triggerCameraShake(4);
    sounds.playPlayerHurt();

    // Warrior thorns passive (reflects 20% back)
    if (this.player.classData.id === 'warrior') {
      this.enemies.forEach((en) => {
        if (Math.hypot(en.x - this.player.x, en.y - this.player.y) < 100) {
          this.damageEnemy(en, Math.round(netDamage * 0.4), false);
        }
      });
    }

    if (this.player.hp <= 0) {
      this.player.hp = 0;
      this.handleGameOver();
    }
  }

  // --- ENEMIES BEHAVIOR & MOVEMENT ---
  private updateEnemies(dt: number) {
    for (let i = 0; i < this.enemies.length; i++) {
      const en = this.enemies[i];
      if (en.hitFlash > 0) en.hitFlash -= dt;

      // Telegraph timer for boss attacks
      if (en.telegraphTimer > 0) {
        en.telegraphTimer -= dt;
      }

      const dx = this.player.x - en.x;
      const dy = this.player.y - en.y;
      const dist = Math.hypot(dx, dy) || 1;

      // Boss special behaviors
      if (en.isBoss) {
        this.updateBossBehavior(en, dt, dx, dy, dist);
      } else {
        // Standard enemy pathfinding toward player
        const speed = en.speed * 60 * dt;
        en.x += (dx / dist) * speed;
        en.y += (dy / dist) * speed;

        // Melee hit player
        if (dist < en.radius + 16) {
          this.damagePlayer(en.attack);
        }

        // Ranged enemies (Skeleton archer & fire demon shoot occasionally)
        if (en.type === 'skeleton' || en.type === 'fire_demon') {
          en.attackCooldown -= dt;
          if (en.attackCooldown <= 0 && dist < 320) {
            en.attackCooldown = 3.5;
            this.projectiles.push({
              id: Math.random(),
              x: en.x,
              y: en.y,
              vx: (dx / dist) * 220,
              vy: (dy / dist) * 220,
              damage: en.attack * 0.8,
              isCrit: false,
              radius: 6,
              color: en.type === 'fire_demon' ? '#f97316' : '#cbd5e1',
              source: 'enemy',
              pierce: 1,
              life: 2.0,
              maxLife: 2.0,
              type: en.type === 'fire_demon' ? 'fireball' : 'arrow',
            });
          }
        }
      }
    }
  }

  // --- BOSS BEHAVIOR ---
  private updateBossBehavior(
    boss: EnemyEntity,
    dt: number,
    dx: number,
    dy: number,
    dist: number
  ) {
    boss.attackCooldown -= dt;

    // Movement
    const speed = boss.speed * 60 * dt;
    if (dist > 50) {
      boss.x += (dx / dist) * speed;
      boss.y += (dy / dist) * speed;
    }

    if (dist < boss.radius + 18) {
      this.damagePlayer(boss.attack * dt * 2.5);
    }

    // Special Boss attacks on cooldown (intensified for high difficulty)
    if (boss.attackCooldown <= 0) {
      boss.attackCooldown = boss.isSuperElite ? 2.5 : 3.2;
      boss.telegraphTimer = boss.isSuperElite ? 0.6 : 0.8;
      boss.telegraphMax = boss.isSuperElite ? 0.6 : 0.8;

      setTimeout(() => {
        if (!this.isRunning || boss.hp <= 0) return;
        this.executeBossSpecial(boss);
      }, (boss.isSuperElite ? 600 : 800));
    }
  }

  private executeBossSpecial(boss: EnemyEntity) {
    sounds.playExplosion();
    this.triggerCameraShake(8);

    switch (boss.type) {
      case 'boss_slime': {
        // Acid splash projectiles in 8 directions + spawn mini slimes
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          this.projectiles.push({
            id: Math.random(),
            x: boss.x,
            y: boss.y,
            vx: Math.cos(a) * 200,
            vy: Math.sin(a) * 200,
            damage: 25,
            isCrit: false,
            radius: 8,
            color: '#10b981',
            source: 'enemy',
            pierce: 1,
            life: 2.5,
            maxLife: 2.5,
            type: 'magic',
          });
        }
        // Spawn 2 slimes
        for (let i = 0; i < 2; i++) {
          this.spawnSingleMonster('slime', boss.x + (i - 0.5) * 60, boss.y + 30);
        }
        break;
      }

      case 'boss_knight': {
        // Corrupted Shockwave Dash toward player
        const dx = this.player.x - boss.x;
        const dy = this.player.y - boss.y;
        const dist = Math.hypot(dx, dy) || 1;
        boss.x += (dx / dist) * 120;
        boss.y += (dy / dist) * 120;
        for (let i = 0; i < 6; i++) {
          const a = Math.atan2(dy, dx) + (i - 2.5) * 0.25;
          this.projectiles.push({
            id: Math.random(),
            x: boss.x,
            y: boss.y,
            vx: Math.cos(a) * 280,
            vy: Math.sin(a) * 280,
            damage: 35,
            isCrit: false,
            radius: 12,
            color: '#ef4444',
            source: 'enemy',
            pierce: 1,
            life: 2.0,
            maxLife: 2.0,
            type: 'blade',
          });
        }
        break;
      }

      case 'boss_dragon': {
        // Dragon Fire Breath Cone
        const angle = Math.atan2(this.player.y - boss.y, this.player.x - boss.x);
        for (let i = -4; i <= 4; i++) {
          const a = angle + i * 0.12;
          this.projectiles.push({
            id: Math.random(),
            x: boss.x,
            y: boss.y,
            vx: Math.cos(a) * 260,
            vy: Math.sin(a) * 260,
            damage: 40,
            isCrit: false,
            radius: 14,
            color: '#f97316',
            source: 'enemy',
            pierce: 1,
            life: 2.0,
            maxLife: 2.0,
            type: 'fireball',
          });
        }
        break;
      }

      case 'boss_necro': {
        // Death ring of bone projectiles & summon skeletons
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          this.projectiles.push({
            id: Math.random(),
            x: boss.x,
            y: boss.y,
            vx: Math.cos(a) * 180,
            vy: Math.sin(a) * 180,
            damage: 35,
            isCrit: false,
            radius: 10,
            color: '#c084fc',
            source: 'enemy',
            pierce: 1,
            life: 3.0,
            maxLife: 3.0,
            type: 'deathwave',
          });
        }
        this.spawnSingleMonster('skeleton', boss.x - 40, boss.y + 40);
        this.spawnSingleMonster('skeleton', boss.x + 40, boss.y + 40);
        break;
      }

      case 'boss_void_monarch': {
        // Super Elite Void Monarch Boss moves!
        sounds.playVoidWarp();
        sounds.playExplosion();
        this.triggerCameraShake(14);

        // 1. Shadow Blink Strike near player
        const blinkAngle = Math.random() * Math.PI * 2;
        boss.x = this.player.x + Math.cos(blinkAngle) * 80;
        boss.y = this.player.y + Math.sin(blinkAngle) * 80;
        this.createParticleBurst(boss.x, boss.y, 35, '#a855f7');

        // 2. Fire 16 radial void blades that pierce
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          this.projectiles.push({
            id: Math.random(),
            x: boss.x,
            y: boss.y,
            vx: Math.cos(a) * 320,
            vy: Math.sin(a) * 320,
            damage: 48,
            isCrit: false,
            radius: 12,
            color: '#c084fc',
            source: 'enemy',
            pierce: 1,
            life: 3.0,
            maxLife: 3.0,
            type: 'deathwave',
          });
        }
        break;
      }
    }
  }

  // --- MONSTER SPAWN CONTROLLER ---
  private handleMonsterSpawning(dt: number) {
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;

    // Difficulty scaling: monster count and frequency ramp up with game time
    const minutes = this.gameTime / 60;
    const spawnInterval = Math.max(0.7, 2.2 - minutes * 0.25);
    this.spawnTimer = spawnInterval;

    const countToSpawn = Math.min(8, 2 + Math.floor(minutes * 1.5));
    for (let i = 0; i < countToSpawn; i++) {
      this.spawnWaveMonster();
    }
  }

  private spawnWaveMonster() {
    // Pick angle outside screen
    const angle = Math.random() * Math.PI * 2;
    const distance = 550 + Math.random() * 150;
    const spawnX = this.player.x + Math.cos(angle) * distance;
    const spawnY = this.player.y + Math.sin(angle) * distance;

    const minutes = this.gameTime / 60;
    // Types unlocked by survival duration
    const types: ('slime' | 'goblin' | 'bat' | 'skeleton' | 'fire_demon' | 'golem')[] = ['slime'];
    if (minutes > 0.4) types.push('goblin');
    if (minutes > 0.8) types.push('bat');
    if (minutes > 1.3) types.push('skeleton');
    if (minutes > 2.0) types.push('fire_demon');
    if (minutes > 2.8) types.push('golem');

    const chosenType = types[Math.floor(Math.random() * types.length)];
    this.spawnSingleMonster(chosenType, spawnX, spawnY);
  }

  private spawnSingleMonster(type: EnemyEntity['type'], x: number, y: number) {
    const minutes = this.gameTime / 60;
    const hpScale = 1 + minutes * 0.4;
    const atkScale = 1 + minutes * 0.3;

    let baseHp = 35;
    let baseAtk = 12;
    let speed = 1.3;
    let radius = 14;
    let color = '#22c55e';
    let xp = 10;
    let gold = 5;

    switch (type) {
      case 'slime':
        baseHp = 40;
        baseAtk = 10;
        speed = 1.1;
        radius = 14;
        color = '#22c55e';
        xp = 8;
        break;
      case 'goblin':
        baseHp = 65;
        baseAtk = 16;
        speed = 1.5;
        radius = 16;
        color = '#15803d';
        xp = 14;
        break;
      case 'bat':
        baseHp = 30;
        baseAtk = 14;
        speed = 2.4;
        radius = 12;
        color = '#6366f1';
        xp = 12;
        break;
      case 'skeleton':
        baseHp = 80;
        baseAtk = 18;
        speed = 1.2;
        radius = 16;
        color = '#cbd5e1';
        xp = 20;
        break;
      case 'fire_demon':
        baseHp = 130;
        baseAtk = 24;
        speed = 1.4;
        radius = 18;
        color = '#ef4444';
        xp = 35;
        break;
      case 'golem':
        baseHp = 220;
        baseAtk = 28;
        speed = 0.8;
        radius = 24;
        color = '#64748b';
        xp = 50;
        break;
    }

    // Elite modifier (15% chance after 1 min)
    let modifier: EnemyEntity['modifier'] | undefined;
    if (minutes > 0.8 && Math.random() < 0.18) {
      const mods: ('speed' | 'tank' | 'frost' | 'fire')[] = ['speed', 'tank', 'frost', 'fire'];
      modifier = mods[Math.floor(Math.random() * mods.length)];
      baseHp *= 1.8;
      xp *= 2.5;
    }

    this.enemies.push({
      id: Math.random(),
      x,
      y,
      type,
      name: type.toUpperCase(),
      isBoss: false,
      hp: Math.round(baseHp * hpScale),
      maxHp: Math.round(baseHp * hpScale),
      attack: Math.round(baseAtk * atkScale),
      speed,
      radius,
      color,
      xpValue: xp,
      goldValue: gold,
      attackCooldown: 2.0,
      telegraphTimer: 0,
      telegraphMax: 0,
      state: 'chase',
      modifier,
      hitFlash: 0,
    });
  }

  // --- BOSS SCHEDULE ---
  private handleBossSchedule() {
    if (this.gameTime >= this.nextBossTime && this.nextBossIdx < 4) {
      this.spawnBoss(this.nextBossIdx);
      this.nextBossIdx++;
      // Next boss intervals
      const nextDelays = [120, 150, 180, 240];
      this.nextBossTime = this.gameTime + (nextDelays[this.nextBossIdx] || 200);
    }
  }

  public spawnBoss(bossIndex: number) {
    sounds.playBossAlert();
    this.triggerCameraShake(16);

    const angle = Math.random() * Math.PI * 2;
    const bx = this.player.x + Math.cos(angle) * 450;
    const by = this.player.y + Math.sin(angle) * 450;

    const bossTypes: EnemyEntity['type'][] = ['boss_slime', 'boss_knight', 'boss_dragon', 'boss_necro'];
    const bossNames = [
      'VUA SLIME HOÀNG GIA',
      'BÁ TƯỚC HẮC ÁM REVENANT',
      'HỎA LONG VIỄN CỔ',
      'CHÚA TỂ ĐẦU LÂU LICH',
    ];

    const type = bossTypes[bossIndex % bossTypes.length];
    const name = bossNames[bossIndex % bossNames.length];
    // Significantly increased boss difficulty and HP
    const hp = 3200 + bossIndex * 2400;

    this.enemies.push({
      id: Math.random(),
      x: bx,
      y: by,
      type,
      name,
      isBoss: true,
      hp,
      maxHp: hp,
      attack: 42 + bossIndex * 16,
      speed: 1.5,
      radius: 36,
      color: type === 'boss_slime' ? '#10b981' : type === 'boss_knight' ? '#ef4444' : type === 'boss_dragon' ? '#f97316' : '#a855f7',
      xpValue: 400,
      goldValue: 200,
      attackCooldown: 2.8,
      telegraphTimer: 0,
      telegraphMax: 0,
      state: 'chase',
      hitFlash: 0,
    });
  }

  // --- TRIGGER VOID DIMENSION SUPER ELITE BOSS (Level 20) ---
  public triggerVoidBossEncounter() {
    this.voidBossTriggered = true;
    this.player.inVoidDimension = true;

    // Erase all small monsters and projectiles as requested:
    // "khi đạt lv20 sẽ phải đấu với boss tinh anh siêu khó. Lúc boss tinh anh xuất hiện nó kéo bạn vào 1 không gian khác, xóa hết các con quái nhỏ và bạn phải solo với nó"
    this.enemies = [];
    this.projectiles = [];

    sounds.playVoidWarp();
    sounds.playBossAlert();
    this.triggerCameraShake(22);
    this.hitstop(0.12);
    this.createParticleBurst(this.player.x, this.player.y, 60, '#a855f7');

    // Spawn Super Elite Boss
    this.spawnSuperEliteVoidBoss();
    this.syncHUD();
  }

  public spawnSuperEliteVoidBoss() {
    const angle = Math.random() * Math.PI * 2;
    const bx = this.player.x + Math.cos(angle) * 260;
    const by = this.player.y + Math.sin(angle) * 260;

    this.enemies.push({
      id: Math.random(),
      x: bx,
      y: by,
      type: 'boss_void_monarch',
      name: 'CHÚA TỂ HƯ KHÔNG: DIO - VOID MONARCH (SIÊU TINH ANH)',
      isBoss: true,
      isSuperElite: true,
      hp: 18000,
      maxHp: 18000,
      attack: 60,
      speed: 2.0,
      radius: 38,
      color: '#a855f7',
      xpValue: 1500,
      goldValue: 800,
      attackCooldown: 2.5,
      telegraphTimer: 0,
      telegraphMax: 0,
      state: 'chase',
      hitFlash: 0,
    });
  }

  // --- DROPS & PICKUPS ---
  private updateDrops(dt: number) {
    for (let i = this.dropItems.length - 1; i >= 0; i--) {
      const drop = this.dropItems[i];
      drop.blink += dt;

      const dx = this.player.x - drop.x;
      const dy = this.player.y - drop.y;
      const dist = Math.hypot(dx, dy);

      // Vacuum / magnet effect when player is nearby
      const pickupRange = drop.type === 'chest' ? 35 : this.player.magnetRadius;
      if (dist < pickupRange) {
        if (drop.type === 'chest') {
          // Open boss chest ceremony!
          this.openBossChest(drop);
          this.dropItems.splice(i, 1);
          continue;
        }

        // Magnet suction
        const pullSpeed = 320 + this.player.magnetRadius * 0.7;
        drop.x += (dx / dist) * pullSpeed * dt;
        drop.y += (dy / dist) * pullSpeed * dt;

        if (dist < 18) {
          sounds.playPickup();
          if (drop.type === 'xp') {
            this.addXP(drop.value);
          } else if (drop.type === 'gold') {
            this.player.gold += drop.value;
          } else if (drop.type === 'health') {
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + drop.value);
          }
          this.dropItems.splice(i, 1);
        }
      }
    }
  }

  // --- LEVEL UP LOGIC ---
  private addXP(amount: number) {
    this.player.xp += amount;
    if (this.player.xp >= this.player.xpNeeded) {
      this.player.xp -= this.player.xpNeeded;
      this.player.level++;
      this.player.xpNeeded = Math.round(this.player.xpNeeded * 1.35);

      sounds.playLevelUp();
      this.createParticleBurst(this.player.x, this.player.y, 25, '#fbbf24');

      // Check for Level 20 Super Elite Void Boss event!
      if (this.player.level >= 20 && !this.voidBossTriggered) {
        this.triggerVoidBossEncounter();
      }

      // Trigger 3 random upgrade choices
      this.triggerLevelUpChoices();
    }
  }

  public triggerLevelUpChoices(): UpgradeOption[] {
    this.pause();
    // Pick 3 random upgrades from pool
    const shuffled = [...UPGRADE_POOL].sort(() => 0.5 - Math.random());
    const choices = shuffled.slice(0, 3);
    this.onLevelUp(choices);
    return choices;
  }

  public applyUpgrade(upgradeId: string) {
    switch (upgradeId) {
      case 'up_attack_1':
        this.player.attack = Math.round(this.player.attack * 1.2);
        break;
      case 'up_hp_1':
        this.player.maxHp += 50;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 50);
        break;
      case 'up_speed_1':
        this.player.moveSpeed += 0.6;
        break;
      case 'up_crit_1':
        this.player.critRate = Math.min(0.85, this.player.critRate + 0.15);
        break;
      case 'up_atk_speed_1':
        this.player.attackSpeed *= 1.25;
        break;
      case 'up_cdr_1':
        this.player.cooldownReduction = Math.min(0.5, this.player.cooldownReduction + 0.15);
        break;
      case 'up_vamp_1':
        this.player.vampirism += 4;
        break;
      case 'up_defense_1':
        this.player.defense += 8;
        break;
      case 'up_skill_q': {
        const qSkill = this.player.classData.skills[0];
        if (qSkill) {
          qSkill.cooldown *= 0.8;
          qSkill.evolutionLevel++;
        }
        break;
      }
      case 'up_skill_e': {
        const eSkill = this.player.classData.skills[1];
        if (eSkill) {
          eSkill.cooldown *= 0.75;
          eSkill.evolutionLevel++;
        }
        break;
      }
      case 'up_crit_dmg':
        this.player.critDamage += 0.5;
        break;
      case 'up_magnet_1':
        this.player.magnetRadius += 75;
        this.player.magnetLevel += 1;
        break;
      case 'up_magnet_2':
        this.player.magnetRadius += 150;
        this.player.magnetLevel += 2;
        break;
      case 'up_atk_speed_2':
        this.player.attackSpeed *= 1.2;
        this.player.moveSpeed += 0.4;
        break;
      case 'up_atk_speed_3':
        this.player.attackSpeed *= 1.25;
        this.player.critRate = Math.min(0.9, this.player.critRate + 0.1);
        break;
      case 'up_lightning_1':
        this.player.lightningLevel = Math.max(1, this.player.lightningLevel + 1);
        break;
      case 'up_lightning_2':
        this.player.lightningLevel = 2;
        break;
    }
    this.resume();
  }

  // --- BUY SHOP UPGRADE (Phím B) ---
  public buyShopUpgrade(type: 'armor' | 'dash' | 'scythe' | 'magnet' | 'guinsoo' | 'the_world'): boolean {
    const config = SHOP_UPGRADES.find((s) => s.id === type);
    if (!config) return false;

    let currentLvl = 0;
    if (type === 'armor') currentLvl = this.player.armorUpgradeLevel;
    else if (type === 'dash') currentLvl = this.player.dashLevel;
    else if (type === 'scythe') currentLvl = this.player.scytheLevel;
    else if (type === 'magnet') currentLvl = this.player.magnetLevel;
    else if (type === 'guinsoo') currentLvl = this.player.guinsooLevel;
    else if (type === 'the_world') currentLvl = this.player.theWorldLevel;

    if (currentLvl >= config.maxLevel) return false;

    const cost = config.costs[currentLvl];
    if (this.player.gold < cost) return false;

    this.player.gold -= cost;
    sounds.playLevelUp();

    if (type === 'armor') {
      this.player.armorUpgradeLevel++;
      this.player.defense += 5;
      this.player.maxHp += 30;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 30);
    } else if (type === 'dash') {
      this.player.dashLevel++;
      const cds = [4.0, 3.2, 2.5, 1.8, 1.2];
      this.player.dashCooldown = cds[this.player.dashLevel - 1] || 1.2;
      this.player.moveSpeed += 0.3;
    } else if (type === 'scythe') {
      this.player.scytheLevel++;
    } else if (type === 'magnet') {
      this.player.magnetLevel++;
      this.player.magnetRadius += 60;
    } else if (type === 'guinsoo') {
      this.player.guinsooLevel++;
      this.player.attackSpeed *= 1.02; // +2% per level (10 levels total)
    } else if (type === 'the_world') {
      this.player.theWorldLevel++;
      if (this.player.theWorldLevel >= 5) {
        this.player.theWorldCooldown = 14.0;
      }
    }

    this.syncHUD();
    return true;
  }

  // --- OPEN BOSS CHEST REWARD ---
  private openBossChest(chest: DropItem) {
    sounds.playChestOpen();
    this.triggerCameraShake(10);
    this.createParticleBurst(chest.x, chest.y, 40, '#fbbf24');
    this.pause();
    this.onBossChest(chest);
  }

  public equipBossItem(item: Item) {
    if (item.evolutionWeapon) {
      this.player.weaponEvolved = true;
      this.player.equipment.weapon = item;
      this.player.attack += item.stats.attack || 40;
    } else if (item.type === 'armor') {
      this.player.equipment.armor = item;
      this.player.maxHp += item.stats.maxHp || 100;
      this.player.defense += item.stats.defense || 15;
    } else if (item.type === 'boots') {
      this.player.equipment.boots = item;
      this.player.moveSpeed += item.stats.moveSpeed || 1.0;
    } else if (item.type === 'ring') {
      this.player.equipment.ring = item;
      this.player.vampirism += item.stats.vampirism || 6;
      this.player.critRate += item.stats.critRate || 0.1;
    } else if (item.type === 'relic') {
      this.player.equipment.relic = item;
      this.player.cooldownReduction = Math.min(0.5, this.player.cooldownReduction + (item.stats.cooldownReduction || 0.2));
    }
    this.player.inventory.push(item);
    this.resume();
  }

  // --- GAME OVER ---
  private handleGameOver() {
    this.pause();
    this.onGameOver({
      time: this.formatTime(this.gameTime),
      kills: this.kills,
      level: this.player.level,
      bossKills: this.bossKills,
    });
  }

  // --- PARTICLES ---
  private createParticleBurst(x: number, y: number, count: number, color: string) {
    if (this.particles.length >= 40) return;
    const actualCount = Math.min(count, 10);
    for (let i = 0; i < actualCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 140;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        color,
        alpha: 1,
        life: 0.3 + Math.random() * 0.3,
        maxLife: 0.6,
        shape: 'square',
      });
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private triggerCameraShake(amount: number) {
    this.shakeIntensity = Math.min(20, this.shakeIntensity + amount);
  }

  private hitstop(seconds: number) {
    this.hitstopTimer = seconds;
  }

  // --- RENDER SYSTEM ---
  private render() {
    const width = this.canvas.width;
    const height = this.canvas.height;

    this.ctx.clearRect(0, 0, width, height);

    this.ctx.save();
    // Apply camera and screen shake
    const shakeX = (Math.random() - 0.5) * this.shakeIntensity;
    const shakeY = (Math.random() - 0.5) * this.shakeIntensity;
    this.ctx.translate(
      Math.floor(width / 2 - this.cameraX + shakeX),
      Math.floor(height / 2 - this.cameraY + shakeY)
    );

    // 1. Draw Dungeon Floor Tiles & Grid (Optimized without trigonometric per-frame math)
    this.drawDungeonFloor();

    // 2. Draw Drop Items (Chests, Gems, Gold, Potions)
    this.dropItems.forEach((item) => drawDropItem(this.ctx, item));

    // 3. Draw Minions
    this.player.minions.forEach((minion) => drawMinionSprite(this.ctx, minion));

    // 4. Draw Enemies & Bosses
    this.enemies.forEach((enemy) => drawEnemySprite(this.ctx, enemy, this.animTick));

    // 5. Draw Projectiles
    this.projectiles.forEach((proj) => drawProjectile(this.ctx, proj));

    // 6. Draw Player
    const isMoving =
      this.keysHeld['w'] ||
      this.keysHeld['s'] ||
      this.keysHeld['a'] ||
      this.keysHeld['d'] ||
      this.keysHeld['arrowup'] ||
      this.keysHeld['arrowdown'] ||
      this.keysHeld['arrowleft'] ||
      this.keysHeld['arrowright'];

    drawPlayerSprite(
      this.ctx,
      this.player.x,
      this.player.y,
      this.player.classData.id,
      this.player.facing,
      this.animTick,
      !!isMoving,
      this.player.hitFlash > 0,
      this.player.weaponEvolved
    );

    // 7. Draw Stand: The World (if unlocked)
    if (this.player.theWorldLevel > 0) {
      drawTheWorldStand(
        this.ctx,
        this.player.x,
        this.player.y,
        this.player.facing,
        this.animTick,
        this.theWorldPunchCooldownTimer > 0
      );
    }

    // 8. Draw Active Lightning Chains
    this.activeLightnings.forEach((l) => {
      drawLightningBolt(this.ctx, l.x1, l.y1, l.x2, l.y2, l.color);
    });

    // 9. Draw Orbiting Scythes (Shop upgrade: Lưỡi Hái Bay Vòng Quanh)
    if (this.player.scytheLevel > 0) {
      const scytheCount = this.player.scytheLevel;
      const orbitRadius = 65;
      for (let i = 0; i < scytheCount; i++) {
        const a = this.player.scytheAngle + (i * Math.PI * 2) / scytheCount;
        const sx = this.player.x + Math.cos(a) * orbitRadius;
        const sy = this.player.y + Math.sin(a) * orbitRadius;
        this.drawScythe(sx, sy, a + Math.PI / 2);
      }
    }

    // 10. Draw Particles
    this.particles.forEach((p) => {
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      drawPixelRect(this.ctx, p.x, p.y, p.size, p.size, p.color);
      this.ctx.restore();
    });

    // 11. Time Stop Negative / Golden Inversion Filter Overlay
    if (this.player.timeStopActiveTimer > 0) {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(251, 191, 36, 0.12)';
      this.ctx.fillRect(this.cameraX - width, this.cameraY - height, width * 2, height * 2);
      this.ctx.strokeStyle = '#f59e0b';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(this.player.x, this.player.y, 80 + Math.sin(this.animTick * 10) * 10, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }

    this.ctx.restore();
  }

  // Draw procedural retro spinning scythe blade
  private drawScythe(x: number, y: number, angle: number) {
    this.ctx.save();
    this.ctx.translate(Math.floor(x), Math.floor(y));
    this.ctx.rotate(angle);
    drawPixelRect(this.ctx, -2, -10, 4, 20, '#475569'); // handle
    drawPixelRect(this.ctx, -12, -12, 14, 4, '#9333ea'); // purple curved blade
    drawPixelRect(this.ctx, -16, -8, 6, 6, '#c084fc');
    drawPixelRect(this.ctx, -14, -2, 4, 6, '#f3e8ff'); // razor edge
    this.ctx.restore();
  }

  // Draw procedural retro stone dungeon floor / Void Dimension floor (Fast integer bitwise hash)
  private drawDungeonFloor() {
    const tileSize = 64;
    const startCol = Math.floor((this.cameraX - this.canvas.width / 2) / tileSize) - 1;
    const endCol = Math.ceil((this.cameraX + this.canvas.width / 2) / tileSize) + 1;
    const startRow = Math.floor((this.cameraY - this.canvas.height / 2) / tileSize) - 1;
    const endRow = Math.ceil((this.cameraY + this.canvas.height / 2) / tileSize) + 1;

    for (let c = startCol; c <= endCol; c++) {
      for (let r = startRow; r <= endRow; r++) {
        const x = c * tileSize;
        const y = r * tileSize;
        // Fast integer bitwise hash without any trigonometry
        const hash = ((c * 73856093) ^ (r * 19349663)) & 7;

        if (this.player.inVoidDimension) {
          // Void Dimension Abyssal Floor
          const voidShade = hash === 7 ? '#150826' : hash > 3 ? '#0a0214' : '#1d0a33';
          this.ctx.fillStyle = voidShade;
          this.ctx.fillRect(x, y, tileSize, tileSize);
          this.ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(x, y, tileSize, tileSize);
          if (hash === 0) {
            drawPixelRect(this.ctx, x + 16, y + 16, 6, 6, '#dc2626');
          } else if (hash === 1) {
            drawPixelRect(this.ctx, x + 28, y + 28, 8, 4, '#a855f7');
          }
          continue;
        }

        const stoneShade = hash === 7 ? '#0c1322' : hash > 3 ? '#0f172a' : '#141e33';

        this.ctx.fillStyle = stoneShade;
        this.ctx.fillRect(x, y, tileSize, tileSize);

        // Subtle stone borders
        this.ctx.strokeStyle = 'rgba(30, 41, 59, 0.35)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, tileSize, tileSize);

        // Occasional moss / crack
        if (hash === 0) {
          drawPixelRect(this.ctx, x + 12, y + 14, 6, 4, '#15803d');
        } else if (hash === 1) {
          drawPixelRect(this.ctx, x + 24, y + 32, 10, 2, '#334155');
        }
      }
    }
  }

  // --- SYNC HUD DATA ---
  private syncHUD() {
    const activeBoss = this.enemies.find((e) => e.isBoss);
    this.onUpdateHUD({
      hp: Math.max(0, Math.round(this.player.hp)),
      maxHp: this.player.maxHp,
      mana: Math.max(0, Math.round(this.player.mana)),
      maxMana: this.player.maxMana,
      xp: this.player.xp,
      xpNeeded: this.player.xpNeeded,
      level: this.player.level,
      gold: this.player.gold,
      kills: this.kills,
      timeFormatted: this.formatTime(this.gameTime),
      activeBoss: activeBoss
        ? {
            name: activeBoss.name,
            hp: activeBoss.hp,
            maxHp: activeBoss.maxHp,
            isSuperElite: activeBoss.isSuperElite,
          }
        : null,
      skills: this.player.classData.skills.map((s) => ({
        id: s.id,
        name: s.name,
        hotkey: s.hotkey,
        cooldown: s.cooldown,
        currentCooldown: Math.max(0, s.currentCooldown),
        icon: s.icon,
        color: s.color,
      })),
      weaponEvolved: this.player.weaponEvolved,
      dashLevel: this.player.dashLevel,
      dashCooldown: this.player.dashCooldown,
      dashCurrentCooldown: Math.max(0, this.player.dashCurrentCooldown),
      scytheLevel: this.player.scytheLevel,
      magnetRadius: this.player.magnetRadius,
      armorUpgradeLevel: this.player.armorUpgradeLevel,
      guinsooLevel: this.player.guinsooLevel,
      theWorldLevel: this.player.theWorldLevel,
      theWorldCooldown: this.player.theWorldCooldown,
      theWorldCurrentCooldown: Math.max(0, this.player.theWorldCurrentCooldown),
      timeStopActiveTimer: Math.max(0, this.player.timeStopActiveTimer),
      inVoidDimension: this.player.inVoidDimension,
    });
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
