/**
 * Pixel Art Rendering Engine
 * Draws crisp, procedural 16-bit / 32-bit pixel sprites directly onto the canvas.
 */

import { CharacterClassId, EnemyEntity } from '../types/game';

// Helper to draw a pixel block
export function drawPixelRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

/**
 * Draws the Hero character sprite based on class, facing, and walking animation
 */
export function drawPlayerSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  classId: CharacterClassId,
  facing: 1 | -1,
  animTick: number,
  isMoving: boolean,
  isHit: boolean,
  weaponEvolved: boolean
) {
  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y));
  ctx.scale(facing, 1);

  // Bobbing animation
  const bob = isMoving ? Math.sin(animTick * 12) * 2 : 0;
  const legOffset = isMoving ? Math.sin(animTick * 12) * 3 : 0;

  // Flash white/red if hit using fast blend or overlay
  if (isHit) {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
    ctx.fillRect(-12, -26 + bob, 24, 36);
  }

  // Aura for weapon evolution (pure pixel outline without expensive shadowBlur)
  if (weaponEvolved) {
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1;
    ctx.strokeRect(-16, -26 + bob, 32, 38);
  }

  // Shadows under character
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 8, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw class-specific pixel art (grid: 24x28 scaled)
  const p = 2; // pixel size

  switch (classId) {
    case 'warrior': {
      // Knight: Silver Armor, Red Cape, Steel Greatsword
      // Cape
      drawPixelRect(ctx, -10, -14 + bob, 4, 16, '#991b1b');
      drawPixelRect(ctx, -8, -12 + bob, 2, 14, '#b91c1c');

      // Legs & Boots
      drawPixelRect(ctx, -5 - legOffset, 2 + bob, 4, 6, '#334155');
      drawPixelRect(ctx, 1 + legOffset, 2 + bob, 4, 6, '#334155');
      drawPixelRect(ctx, -6 - legOffset, 6 + bob, 5, 3, '#1e293b');
      drawPixelRect(ctx, 1 + legOffset, 6 + bob, 5, 3, '#1e293b');

      // Torso / Plate Armor
      drawPixelRect(ctx, -6, -10 + bob, 12, 12, '#64748b');
      drawPixelRect(ctx, -5, -8 + bob, 10, 8, '#94a3b8');
      drawPixelRect(ctx, -2, -6 + bob, 4, 6, '#cbd5e1'); // highlight

      // Belt & Gold buckle
      drawPixelRect(ctx, -6, 0 + bob, 12, 3, '#1e293b');
      drawPixelRect(ctx, -1, 0 + bob, 3, 3, '#f59e0b');

      // Helmet & Visor
      drawPixelRect(ctx, -6, -22 + bob, 12, 12, '#64748b');
      drawPixelRect(ctx, -5, -20 + bob, 10, 10, '#94a3b8');
      drawPixelRect(ctx, 0, -18 + bob, 6, 4, '#0f172a'); // eye slit visor
      drawPixelRect(ctx, 2, -17 + bob, 2, 2, '#38bdf8'); // glowing blue eyes

      // Winged crest on helmet
      drawPixelRect(ctx, -7, -24 + bob, 3, 4, '#fbbf24');
      drawPixelRect(ctx, -2, -26 + bob, 4, 4, '#dc2626');

      // Shield & Sword
      drawPixelRect(ctx, -9, -6 + bob, 4, 10, '#475569');
      drawPixelRect(ctx, -8, -4 + bob, 3, 7, '#cbd5e1');

      // Right arm holding sword
      drawPixelRect(ctx, 5, -8 + bob, 4, 8, '#64748b');
      // Sword blade
      const swordCol = weaponEvolved ? '#fbbf24' : '#e2e8f0';
      drawPixelRect(ctx, 7, -22 + bob, 3, 16, swordCol);
      drawPixelRect(ctx, 5, -6 + bob, 7, 2, '#78350f'); // hilt
      drawPixelRect(ctx, 7, -4 + bob, 3, 4, '#451a03'); // pommel
      break;
    }

    case 'mage': {
      // Mage: Violet Robe, Wizard Hat, Arcane Staff
      // Robe bottom
      drawPixelRect(ctx, -6, 0 + bob, 12, 8, '#4c1d95');
      drawPixelRect(ctx, -4, 2 + bob, 8, 6, '#5b21b6');
      drawPixelRect(ctx, -5 - legOffset, 6 + bob, 3, 3, '#1e1b4b');
      drawPixelRect(ctx, 2 + legOffset, 6 + bob, 3, 3, '#1e1b4b');

      // Torso / Vest
      drawPixelRect(ctx, -5, -10 + bob, 10, 10, '#6d28d9');
      drawPixelRect(ctx, -2, -8 + bob, 4, 8, '#a78bfa'); // golden/runic embroidery
      drawPixelRect(ctx, -5, -2 + bob, 10, 2, '#fbbf24'); // gold sash

      // Face
      drawPixelRect(ctx, -4, -18 + bob, 8, 8, '#fed7aa');
      drawPixelRect(ctx, 1, -16 + bob, 2, 2, '#7c3aed'); // glowing eyes

      // Wizard Hat
      drawPixelRect(ctx, -9, -19 + bob, 18, 3, '#3b0764');
      drawPixelRect(ctx, -6, -24 + bob, 12, 5, '#4c1d95');
      drawPixelRect(ctx, -4, -28 + bob, 8, 4, '#581c87');
      drawPixelRect(ctx, -1, -32 + bob, 4, 4, '#6b21a8');
      drawPixelRect(ctx, -3, -22 + bob, 6, 2, '#fbbf24'); // hat band

      // Staff
      drawPixelRect(ctx, 7, -24 + bob, 2, 32, '#78350f'); // wooden pole
      const orbCol = weaponEvolved ? '#f59e0b' : '#38bdf8';
      drawPixelRect(ctx, 5, -28 + bob, 6, 6, orbCol); // magical crystal
      drawPixelRect(ctx, 6, -27 + bob, 4, 4, '#ffffff'); // shine
      break;
    }

    case 'ranger': {
      // Archer: Hunter Green, Hood, Wooden Recurve Bow, Quiver
      // Quiver on back
      drawPixelRect(ctx, -8, -14 + bob, 4, 12, '#78350f');
      drawPixelRect(ctx, -8, -18 + bob, 2, 4, '#ffffff'); // feather fletching
      drawPixelRect(ctx, -6, -17 + bob, 2, 3, '#ef4444');

      // Boots & Legs
      drawPixelRect(ctx, -5 - legOffset, 2 + bob, 4, 6, '#365314');
      drawPixelRect(ctx, 1 + legOffset, 2 + bob, 4, 6, '#365314');
      drawPixelRect(ctx, -5 - legOffset, 6 + bob, 5, 3, '#451a03');
      drawPixelRect(ctx, 1 + legOffset, 6 + bob, 5, 3, '#451a03');

      // Leather Armor & Green Tunic
      drawPixelRect(ctx, -6, -10 + bob, 12, 12, '#15803d');
      drawPixelRect(ctx, -4, -8 + bob, 8, 8, '#166534');
      drawPixelRect(ctx, -6, -1 + bob, 12, 3, '#78350f'); // belt

      // Hood & Face
      drawPixelRect(ctx, -6, -20 + bob, 12, 10, '#166534');
      drawPixelRect(ctx, -2, -18 + bob, 6, 6, '#fed7aa'); // face
      drawPixelRect(ctx, 1, -16 + bob, 2, 2, '#15803d'); // eye
      drawPixelRect(ctx, -7, -22 + bob, 14, 4, '#14532d'); // hood top

      // Bow
      const bowCol = weaponEvolved ? '#fbbf24' : '#92400e';
      drawPixelRect(ctx, 8, -20 + bob, 3, 26, bowCol);
      drawPixelRect(ctx, 6, -10 + bob, 2, 6, bowCol); // bow handle
      // Bow string
      drawPixelRect(ctx, 7, -19 + bob, 1, 24, '#e2e8f0');
      break;
    }

    case 'assassin': {
      // Shadow Rogue: Pitch Black Garb, Crimson Scarf, Twin Daggers
      // Scarf blowing in wind
      const scarfWind = Math.sin(animTick * 14) * 3;
      drawPixelRect(ctx, -12 + scarfWind, -12 + bob, 6, 4, '#dc2626');
      drawPixelRect(ctx, -8 + scarfWind, -10 + bob, 4, 6, '#b91c1c');

      // Legs
      drawPixelRect(ctx, -5 - legOffset, 2 + bob, 4, 6, '#0f172a');
      drawPixelRect(ctx, 1 + legOffset, 2 + bob, 4, 6, '#0f172a');
      drawPixelRect(ctx, -6 - legOffset, 6 + bob, 5, 3, '#1e293b');
      drawPixelRect(ctx, 1 + legOffset, 6 + bob, 5, 3, '#1e293b');

      // Dark ninja Gi
      drawPixelRect(ctx, -6, -10 + bob, 12, 12, '#1e293b');
      drawPixelRect(ctx, -4, -8 + bob, 8, 8, '#0f172a');
      drawPixelRect(ctx, -6, -1 + bob, 12, 2, '#dc2626'); // red sash

      // Mask & Shadow Eyes
      drawPixelRect(ctx, -6, -20 + bob, 12, 10, '#0f172a');
      drawPixelRect(ctx, -2, -18 + bob, 6, 5, '#1e293b');
      drawPixelRect(ctx, 0, -16 + bob, 3, 2, '#ef4444'); // sinister crimson eyes

      // Twin Poison Daggers
      const daggerCol = weaponEvolved ? '#a855f7' : '#22c55e';
      drawPixelRect(ctx, 7, -12 + bob, 3, 10, daggerCol);
      drawPixelRect(ctx, -9, -10 + bob, 3, 8, daggerCol);
      break;
    }

    case 'necromancer': {
      // Necromancer: Bone Skull Mask, Dark Shroud, Scepter of the Dead
      // Ethereal ghostly hem
      const ghostWiggle = Math.sin(animTick * 10) * 2;
      drawPixelRect(ctx, -7, 0 + bob, 14, 8, '#1e1b4b');
      drawPixelRect(ctx, -6 + ghostWiggle, 4 + bob, 12, 6, '#09090b');

      // Torso
      drawPixelRect(ctx, -6, -10 + bob, 12, 10, '#2e1065');
      drawPixelRect(ctx, -3, -8 + bob, 6, 8, '#581c87');
      // Bone ribcage ornament
      drawPixelRect(ctx, -4, -6 + bob, 8, 2, '#f8fafc');
      drawPixelRect(ctx, -3, -3 + bob, 6, 2, '#f8fafc');

      // Skull Mask
      drawPixelRect(ctx, -5, -20 + bob, 10, 10, '#f1f5f9');
      drawPixelRect(ctx, -3, -16 + bob, 2, 2, '#020617'); // eye socket 1
      drawPixelRect(ctx, 1, -16 + bob, 2, 2, '#10b981'); // glowing green soul eye
      drawPixelRect(ctx, -2, -12 + bob, 4, 2, '#0f172a'); // skull teeth

      // Shroud hood
      drawPixelRect(ctx, -7, -22 + bob, 14, 4, '#1e1b4b');

      // Skull Scepter
      drawPixelRect(ctx, 8, -24 + bob, 2, 32, '#3f3f46');
      drawPixelRect(ctx, 6, -28 + bob, 6, 6, '#f8fafc'); // mini skull
      const soulFlame = weaponEvolved ? '#38bdf8' : '#10b981';
      drawPixelRect(ctx, 7, -32 + bob, 4, 4, soulFlame); // soul fire
      break;
    }
  }

  ctx.restore();
}

/**
 * Draws Minion (Skeletons, Bone Golem, etc.)
 */
export function drawMinionSprite(
  ctx: CanvasRenderingContext2D,
  minion: { x: number; y: number; type: string; animFrame: number; hp: number; maxHp: number }
) {
  ctx.save();
  ctx.translate(Math.floor(minion.x), Math.floor(minion.y));

  const bob = Math.sin(minion.animFrame * 10) * 2;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 6, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Skeleton minion
  // Legs
  drawPixelRect(ctx, -3, 0 + bob, 2, 6, '#cbd5e1');
  drawPixelRect(ctx, 1, 0 + bob, 2, 6, '#cbd5e1');
  // Ribs
  drawPixelRect(ctx, -4, -8 + bob, 8, 8, '#f1f5f9');
  drawPixelRect(ctx, -2, -6 + bob, 4, 4, '#0f172a');
  // Skull
  drawPixelRect(ctx, -4, -16 + bob, 8, 8, '#ffffff');
  drawPixelRect(ctx, -2, -14 + bob, 2, 2, '#020617');
  drawPixelRect(ctx, 1, -14 + bob, 2, 2, '#10b981'); // green eye
  // Little bone sword
  drawPixelRect(ctx, 5, -12 + bob, 2, 10, '#94a3b8');

  // Mini HP bar
  const hpPct = Math.max(0, minion.hp / minion.maxHp);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-8, -22 + bob, 16, 2);
  ctx.fillStyle = '#10b981';
  ctx.fillRect(-8, -22 + bob, 16 * hpPct, 2);

  ctx.restore();
}

/**
 * Draws Enemy / Boss pixel art sprite
 */
export function drawEnemySprite(
  ctx: CanvasRenderingContext2D,
  enemy: EnemyEntity,
  animTick: number
) {
  ctx.save();
  ctx.translate(Math.floor(enemy.x), Math.floor(enemy.y));

  // Hit flash (fast direct overlay, no expensive filter)
  if (enemy.hitFlash > 0) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.fillRect(-enemy.radius, -enemy.radius, enemy.radius * 2, enemy.radius * 2);
  }

  // Boss / Elite aura (clean stroke without software shadowBlur)
  if (enemy.isBoss) {
    ctx.strokeStyle = enemy.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, enemy.radius * 0.4, enemy.radius * 1.1, enemy.radius * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (enemy.modifier) {
    ctx.strokeStyle = enemy.modifier === 'fire' ? '#ef4444' : enemy.modifier === 'frost' ? '#38bdf8' : '#eab308';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-enemy.radius, -enemy.radius, enemy.radius * 2, enemy.radius * 2);
  }

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(0, enemy.radius * 0.7, enemy.radius * 0.9, enemy.radius * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  const wobble = Math.sin(animTick * 8 + enemy.id) * 2;

  switch (enemy.type) {
    case 'slime': {
      // Slime: Cute green jelly
      const scaleX = 1 + Math.sin(animTick * 8) * 0.15;
      const scaleY = 1 - Math.sin(animTick * 8) * 0.15;
      ctx.scale(scaleX, scaleY);

      drawPixelRect(ctx, -10, -8, 20, 16, '#22c55e');
      drawPixelRect(ctx, -8, -12, 16, 6, '#4ade80');
      drawPixelRect(ctx, -6, -14, 12, 4, '#86efac');
      // Shine
      drawPixelRect(ctx, -6, -10, 4, 4, '#dcfce7');
      // Eyes
      drawPixelRect(ctx, -4, -4, 3, 4, '#052e16');
      drawPixelRect(ctx, 3, -4, 3, 4, '#052e16');
      break;
    }

    case 'goblin': {
      // Goblin: Green fiend with spiked club
      drawPixelRect(ctx, -8, -10 + wobble, 16, 16, '#15803d');
      drawPixelRect(ctx, -6, -16 + wobble, 12, 8, '#16a34a');
      // Pointy ears
      drawPixelRect(ctx, -10, -14 + wobble, 4, 4, '#15803d');
      drawPixelRect(ctx, 6, -14 + wobble, 4, 4, '#15803d');
      // Red eyes & fangs
      drawPixelRect(ctx, -4, -12 + wobble, 3, 2, '#ef4444');
      drawPixelRect(ctx, 2, -12 + wobble, 3, 2, '#ef4444');
      drawPixelRect(ctx, -2, -8 + wobble, 4, 2, '#ffffff');
      // Club
      drawPixelRect(ctx, 8, -14 + wobble, 4, 16, '#78350f');
      drawPixelRect(ctx, 6, -18 + wobble, 8, 6, '#451a03');
      break;
    }

    case 'bat': {
      // Bat: Flapping wings
      const wingFlap = Math.sin(animTick * 20) * 8;
      // Body
      drawPixelRect(ctx, -4, -4 + wobble, 8, 8, '#312e81');
      // Eyes
      drawPixelRect(ctx, -2, -3 + wobble, 2, 2, '#ef4444');
      drawPixelRect(ctx, 1, -3 + wobble, 2, 2, '#ef4444');
      // Wings
      drawPixelRect(ctx, -14, -8 + wingFlap, 10, 8, '#4338ca');
      drawPixelRect(ctx, 4, -8 - wingFlap, 10, 8, '#4338ca');
      break;
    }

    case 'skeleton': {
      // Skeleton archer / swordsman
      drawPixelRect(ctx, -6, -8 + wobble, 12, 12, '#cbd5e1');
      drawPixelRect(ctx, -2, -6 + wobble, 4, 4, '#0f172a'); // rib gaps
      drawPixelRect(ctx, -6, -18 + wobble, 12, 10, '#f8fafc'); // skull
      drawPixelRect(ctx, -4, -14 + wobble, 3, 3, '#020617');
      drawPixelRect(ctx, 1, -14 + wobble, 3, 3, '#dc2626'); // glowing eye
      drawPixelRect(ctx, -3, -10 + wobble, 6, 2, '#475569'); // teeth
      break;
    }

    case 'fire_demon': {
      // Fire Demon: Glowing horns & lava skin
      drawPixelRect(ctx, -10, -12 + wobble, 20, 20, '#991b1b');
      drawPixelRect(ctx, -8, -8 + wobble, 16, 12, '#dc2626');
      drawPixelRect(ctx, -4, -4 + wobble, 8, 6, '#f97316'); // magma core
      // Horns
      drawPixelRect(ctx, -12, -20 + wobble, 4, 10, '#450a0a');
      drawPixelRect(ctx, 8, -20 + wobble, 4, 10, '#450a0a');
      // Burning eyes
      drawPixelRect(ctx, -5, -10 + wobble, 3, 3, '#fef08a');
      drawPixelRect(ctx, 2, -10 + wobble, 3, 3, '#fef08a');
      break;
    }

    case 'golem': {
      // Stone Golem: Heavy monolith
      drawPixelRect(ctx, -14, -16 + wobble, 28, 26, '#475569');
      drawPixelRect(ctx, -10, -12 + wobble, 20, 18, '#64748b');
      // Moss & Rune
      drawPixelRect(ctx, -8, -8 + wobble, 6, 6, '#15803d');
      drawPixelRect(ctx, 0, -6 + wobble, 4, 8, '#38bdf8'); // glowing rune
      // Eyes
      drawPixelRect(ctx, -6, -14 + wobble, 4, 2, '#38bdf8');
      drawPixelRect(ctx, 2, -14 + wobble, 4, 2, '#38bdf8');
      break;
    }

    // BOSSES
    case 'boss_slime': {
      // Slime King: Giant bouncing gelatinous sovereign with crown
      const bScale = 1 + Math.sin(animTick * 6) * 0.12;
      ctx.scale(bScale, 2 - bScale);
      drawPixelRect(ctx, -26, -20, 52, 38, '#059669');
      drawPixelRect(ctx, -22, -26, 44, 14, '#10b981');
      drawPixelRect(ctx, -18, -16, 10, 8, '#6ee7b7'); // shine
      // Eyes & Grin
      drawPixelRect(ctx, -12, -10, 6, 8, '#022c22');
      drawPixelRect(ctx, 6, -10, 6, 8, '#022c22');
      drawPixelRect(ctx, -10, -8, 2, 3, '#ecfdf5');
      drawPixelRect(ctx, 8, -8, 2, 3, '#ecfdf5');
      // Crown
      drawPixelRect(ctx, -16, -34, 32, 10, '#fbbf24');
      drawPixelRect(ctx, -18, -40, 6, 8, '#f59e0b');
      drawPixelRect(ctx, -3, -42, 6, 10, '#f59e0b');
      drawPixelRect(ctx, 12, -40, 6, 8, '#f59e0b');
      drawPixelRect(ctx, -2, -34, 4, 4, '#ef4444'); // ruby in crown
      break;
    }

    case 'boss_knight': {
      // Dark Knight Revenant: Giant corrupted warlord
      drawPixelRect(ctx, -20, -28 + wobble, 40, 48, '#0f172a');
      drawPixelRect(ctx, -16, -22 + wobble, 32, 34, '#1e293b');
      // Glowing red demonic visor
      drawPixelRect(ctx, -10, -20 + wobble, 20, 6, '#450a0a');
      drawPixelRect(ctx, -8, -19 + wobble, 16, 4, '#ef4444');
      // Horns / Spikes on shoulders
      drawPixelRect(ctx, -26, -32 + wobble, 8, 14, '#475569');
      drawPixelRect(ctx, 18, -32 + wobble, 8, 14, '#475569');
      // Giant Cursed Greatsword
      drawPixelRect(ctx, 20, -45 + wobble, 6, 55, '#dc2626');
      drawPixelRect(ctx, 22, -40 + wobble, 2, 45, '#fecaca');
      break;
    }

    case 'boss_dragon': {
      // Ancient Fire Drake: Horned draconian terror
      drawPixelRect(ctx, -30, -24 + wobble, 60, 44, '#7f1d1d');
      drawPixelRect(ctx, -24, -18 + wobble, 48, 32, '#991b1b');
      drawPixelRect(ctx, -16, -8 + wobble, 32, 18, '#f97316'); // magma belly
      // Giant Wings
      const dWing = Math.sin(animTick * 10) * 10;
      drawPixelRect(ctx, -50, -36 + dWing, 22, 28, '#450a0a');
      drawPixelRect(ctx, 28, -36 - dWing, 22, 28, '#450a0a');
      // Horns & Snout
      drawPixelRect(ctx, -14, -36 + wobble, 8, 14, '#18181b');
      drawPixelRect(ctx, 6, -36 + wobble, 8, 14, '#18181b');
      // Glowing eyes & smoke
      drawPixelRect(ctx, -10, -22 + wobble, 6, 4, '#fef08a');
      drawPixelRect(ctx, 4, -22 + wobble, 6, 4, '#fef08a');
      break;
    }

    case 'boss_necro': {
      // Necro Overlord: Floating skull lich
      const hover = Math.sin(animTick * 6) * 6;
      drawPixelRect(ctx, -22, -26 + hover, 44, 46, '#18181b');
      drawPixelRect(ctx, -18, -20 + hover, 36, 36, '#2e1065');
      // Giant floating skull face
      drawPixelRect(ctx, -14, -36 + hover, 28, 22, '#f8fafc');
      drawPixelRect(ctx, -10, -30 + hover, 6, 6, '#020617');
      drawPixelRect(ctx, 4, -30 + hover, 6, 6, '#020617');
      drawPixelRect(ctx, -8, -28 + hover, 3, 3, '#a855f7'); // purple flame eye
      drawPixelRect(ctx, 6, -28 + hover, 3, 3, '#a855f7');
      // Crown of bones
      drawPixelRect(ctx, -16, -44 + hover, 32, 10, '#3b0764');
      drawPixelRect(ctx, -10, -42 + hover, 20, 6, '#c084fc');
      break;
    }

    case 'boss_void_monarch': {
      // Super Elite Boss: Chúa Tể Hư Không (Dio - Void Monarch)
      const hover = Math.sin(animTick * 8) * 8;
      // Celestial Void Rune Circle
      ctx.save();
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.ellipse(0, 18, 48, 18, animTick * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Cosmic Void Cape & Torso
      drawPixelRect(ctx, -28, -32 + hover, 56, 52, '#090514');
      drawPixelRect(ctx, -22, -26 + hover, 44, 42, '#2e1065');
      drawPixelRect(ctx, -16, -18 + hover, 32, 28, '#4c1d95');

      // Golden Pauldrons & Royal Breastplate
      drawPixelRect(ctx, -32, -30 + hover, 14, 16, '#f59e0b');
      drawPixelRect(ctx, 18, -30 + hover, 14, 16, '#f59e0b');
      drawPixelRect(ctx, -10, -14 + hover, 20, 14, '#fbbf24');

      // Head & Void Helmet with Dio Golden Horns
      drawPixelRect(ctx, -16, -46 + hover, 32, 22, '#1e1b4b');
      drawPixelRect(ctx, -20, -56 + hover, 8, 16, '#f59e0b'); // Left Horn
      drawPixelRect(ctx, 12, -56 + hover, 8, 16, '#f59e0b'); // Right Horn
      drawPixelRect(ctx, -12, -40 + hover, 24, 6, '#dc2626'); // Visor slit
      drawPixelRect(ctx, -8, -39 + hover, 6, 4, '#fef08a'); // Glowing demon eye L
      drawPixelRect(ctx, 2, -39 + hover, 6, 4, '#fef08a'); // Glowing demon eye R

      // Twin Void Energy Scythes
      drawPixelRect(ctx, -38, -60 + hover, 6, 65, '#9333ea');
      drawPixelRect(ctx, -48, -62 + hover, 16, 6, '#c084fc');
      drawPixelRect(ctx, 32, -60 + hover, 6, 65, '#9333ea');
      drawPixelRect(ctx, 32, -62 + hover, 16, 6, '#c084fc');
      break;
    }
  }

  // Draw attack telegraph circle / laser if charging
  if (enemy.telegraphTimer > 0) {
    ctx.save();
    const progress = 1 - enemy.telegraphTimer / enemy.telegraphMax;
    ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + progress * 0.6})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius * 2.5 * progress, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // HP bar over head for non-bosses (Boss has top screen bar)
  if (!enemy.isBoss && enemy.hp < enemy.maxHp) {
    const hpPct = Math.max(0, enemy.hp / enemy.maxHp);
    const barW = Math.max(20, enemy.radius * 1.5);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-barW / 2, -enemy.radius - 10 + wobble, barW, 4);
    ctx.fillStyle = enemy.modifier ? '#f59e0b' : '#ef4444';
    ctx.fillRect(-barW / 2, -enemy.radius - 10 + wobble, barW * hpPct, 4);
  }

  ctx.restore();
}

/**
 * Draws Projectile (Arrows, Fireballs, Meteors, Bone Spears, Slices)
 */
export function drawProjectile(
  ctx: CanvasRenderingContext2D,
  proj: { x: number; y: number; vx: number; vy: number; radius: number; color: string; type: string }
) {
  ctx.save();
  ctx.translate(Math.floor(proj.x), Math.floor(proj.y));
  const angle = Math.atan2(proj.vy, proj.vx);
  ctx.rotate(angle);

  switch (proj.type) {
    case 'arrow':
      drawPixelRect(ctx, -8, -1, 16, 2, '#cbd5e1');
      drawPixelRect(ctx, 4, -2, 4, 4, '#94a3b8'); // arrow head
      drawPixelRect(ctx, -8, -3, 3, 6, '#ef4444'); // fletch
      break;

    case 'fireball':
    case 'meteor':
      drawPixelRect(ctx, -6, -6, 12, 12, '#ea580c');
      drawPixelRect(ctx, -4, -4, 8, 8, '#facc15');
      drawPixelRect(ctx, -2, -2, 4, 4, '#ffffff');
      break;

    case 'blade':
      // Golden / steel slashing arc
      drawPixelRect(ctx, -4, -14, 8, 28, proj.color);
      drawPixelRect(ctx, -2, -10, 4, 20, '#ffffff');
      break;

    case 'magic':
    case 'deathwave':
      drawPixelRect(ctx, -5, -5, 10, 10, proj.color);
      drawPixelRect(ctx, -3, -3, 6, 6, '#ffffff');
      break;

    case 'shuriken':
      drawPixelRect(ctx, -4, -4, 8, 8, '#22c55e');
      drawPixelRect(ctx, -6, -1, 12, 2, '#4ade80');
      drawPixelRect(ctx, -1, -6, 2, 12, '#4ade80');
      break;

    default:
      ctx.fillStyle = proj.color;
      ctx.beginPath();
      ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
      ctx.fill();
  }

  ctx.restore();
}

/**
 * Draws Loot Drop: XP Gem, Gold, Health Potion, or Boss Chest
 */
export function drawDropItem(
  ctx: CanvasRenderingContext2D,
  item: { x: number; y: number; type: string; color: string; size: number; blink: number }
) {
  ctx.save();
  ctx.translate(Math.floor(item.x), Math.floor(item.y));

  const bob = Math.sin(item.blink * 6) * 3;

  if (item.type === 'xp') {
    // Diamond Gem
    drawPixelRect(ctx, -3, -3 + bob, 6, 6, item.color);
    drawPixelRect(ctx, -1, -1 + bob, 2, 2, '#ffffff');
  } else if (item.type === 'gold') {
    // Golden Coin
    drawPixelRect(ctx, -4, -4 + bob, 8, 8, '#f59e0b');
    drawPixelRect(ctx, -2, -2 + bob, 4, 4, '#fef08a');
  } else if (item.type === 'health') {
    // Red Heart / Flask
    drawPixelRect(ctx, -5, -5 + bob, 10, 10, '#ef4444');
    drawPixelRect(ctx, -2, -8 + bob, 4, 3, '#78350f'); // cork
    drawPixelRect(ctx, -3, -3 + bob, 2, 4, '#ffffff'); // shine
  } else if (item.type === 'chest') {
    // Glowing Royal Boss Chest
    drawPixelRect(ctx, -12, -8 + bob, 24, 16, '#78350f');
    drawPixelRect(ctx, -10, -6 + bob, 20, 12, '#92400e');
    // Gold trims & lock
    drawPixelRect(ctx, -12, -12 + bob, 24, 6, '#fbbf24');
    drawPixelRect(ctx, -3, -4 + bob, 6, 6, '#f59e0b');
    drawPixelRect(ctx, -1, -2 + bob, 2, 2, '#0f172a'); // keyhole
    // Sparkles
    const spark = Math.sin(item.blink * 10);
    if (spark > 0) {
      drawPixelRect(ctx, -14, -16 + bob, 3, 3, '#fef08a');
      drawPixelRect(ctx, 12, -14 + bob, 3, 3, '#fef08a');
    }
  }

  ctx.restore();
}

/**
 * Draws Stand: The World (Za Warudo) hovering beside the player
 */
export function drawTheWorldStand(
  ctx: CanvasRenderingContext2D,
  playerX: number,
  playerY: number,
  facing: 1 | -1,
  animTick: number,
  isPunching: boolean
) {
  ctx.save();
  // Stand hovers above and slightly behind player
  const floatX = playerX - 24 * facing + Math.cos(animTick * 4) * 3;
  const floatY = playerY - 18 + Math.sin(animTick * 4) * 4;

  ctx.translate(Math.floor(floatX), Math.floor(floatY));
  ctx.scale(facing, 1);

  // Golden Aura around Stand
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 4, 18, 24, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Back oxygen tanks
  drawPixelRect(ctx, -14, -14, 5, 14, '#d97706');
  drawPixelRect(ctx, -14, -16, 5, 2, '#78350f');

  // Legs
  drawPixelRect(ctx, -6, 8, 4, 12, '#fbbf24');
  drawPixelRect(ctx, 2, 8, 4, 12, '#fbbf24');
  drawPixelRect(ctx, -6, 20, 5, 3, '#10b981'); // emerald kneecaps
  drawPixelRect(ctx, 2, 20, 5, 3, '#10b981');

  // Torso / Muscular chest
  drawPixelRect(ctx, -8, -6, 16, 16, '#f59e0b');
  drawPixelRect(ctx, -6, -4, 12, 12, '#fbbf24');
  drawPixelRect(ctx, -3, -2, 6, 6, '#10b981'); // green heart motif

  // Shoulders
  drawPixelRect(ctx, -12, -8, 6, 8, '#d97706');
  drawPixelRect(ctx, 6, -8, 6, 8, '#d97706');

  // Head & Golden Mask / Chin strap
  drawPixelRect(ctx, -6, -22, 12, 14, '#fbbf24');
  drawPixelRect(ctx, -8, -20, 16, 4, '#d97706'); // headpiece crest
  drawPixelRect(ctx, -4, -16, 3, 3, '#10b981'); // Emerald eye L
  drawPixelRect(ctx, 1, -16, 3, 3, '#10b981'); // Emerald eye R
  drawPixelRect(ctx, -4, -10, 8, 3, '#78350f'); // chin strap

  // Fists & Punch barrage if punching!
  if (isPunching) {
    const punchOffsets = [
      { x: 16, y: -6 },
      { x: 26, y: -12 },
      { x: 22, y: 2 },
      { x: 32, y: -4 },
    ];
    punchOffsets.forEach((p, idx) => {
      const pScale = (animTick * 20 + idx * 2) % 1;
      drawPixelRect(ctx, p.x + pScale * 8, p.y, 8, 6, '#fef08a');
      drawPixelRect(ctx, p.x + pScale * 8 - 4, p.y + 1, 4, 4, '#fbbf24');
    });
  } else {
    // Idle fists ready
    drawPixelRect(ctx, 8, -2, 6, 6, '#fbbf24');
  }

  ctx.restore();
}

/**
 * Draws Jagged Electric Lightning Bolt between two positions
 */
export function drawLightningBolt(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string = '#38bdf8'
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);

  const dist = Math.hypot(x2 - x1, y2 - y1);
  const steps = Math.max(3, Math.floor(dist / 25));
  for (let i = 1; i < steps; i++) {
    const progress = i / steps;
    const midX = x1 + (x2 - x1) * progress;
    const midY = y1 + (y2 - y1) * progress;
    const offset = (Math.random() - 0.5) * 18;
    const nx = -(y2 - y1) / (dist || 1);
    const ny = (x2 - x1) / (dist || 1);
    ctx.lineTo(midX + nx * offset, midY + ny * offset);
  }
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

