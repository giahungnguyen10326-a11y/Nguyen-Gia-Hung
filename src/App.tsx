import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CharacterClassId, DropItem, GameStateMode, Item, UpgradeOption } from './types/game';
import { GameEngine, HUDData } from './game/GameEngine';
import { TitleScreen } from './components/TitleScreen';
import { ClassSelectModal } from './components/ClassSelectModal';
import { GameHUD } from './components/GameHUD';
import { LevelUpModal } from './components/LevelUpModal';
import { BossChestModal } from './components/BossChestModal';
import { InventoryModal } from './components/InventoryModal';
import { ShopModal } from './components/ShopModal';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { sounds } from './services/audio';

export default function App() {
  const [gameState, setGameState] = useState<GameStateMode>('TITLE');
  const [selectedClassId, setSelectedClassId] = useState<CharacterClassId>('warrior');
  const [isMuted, setIsMuted] = useState<boolean>(sounds.isMuted);

  // HUD State synced from GameEngine
  const [hudData, setHudData] = useState<HUDData | null>(null);

  // Modal states
  const [levelUpChoices, setLevelUpChoices] = useState<UpgradeOption[] | null>(null);
  const [bossChestItem, setBossChestItem] = useState<DropItem | null>(null);
  const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [gameOverStats, setGameOverStats] = useState<{
    time: string;
    kills: number;
    level: number;
    bossKills: number;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Toggle Mute
  const handleToggleMute = useCallback(() => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  }, []);

  // Initialize and start game engine
  const startGame = useCallback((classId: CharacterClassId) => {
    setSelectedClassId(classId);
    setGameState('PLAYING');
    setIsPaused(false);
    setLevelUpChoices(null);
    setBossChestItem(null);
    setIsInventoryOpen(false);
    setIsShopOpen(false);
    setGameOverStats(null);
  }, []);

  // Mount Game Engine when entering PLAYING mode
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas, selectedClassId, {
      onUpdateHUD: (data) => {
        setHudData(data);
      },
      onLevelUp: (choices) => {
        setLevelUpChoices(choices);
      },
      onBossChest: (chest) => {
        setBossChestItem(chest);
      },
      onGameOver: (stats) => {
        setGameOverStats(stats);
      },
      onOpenShop: () => {
        engine.pause();
        setIsShopOpen(true);
      },
    });

    engineRef.current = engine;
    engine.start();

    // Global Key Listener for Pause (Esc), Shop (B) & Inventory (I)
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (levelUpChoices || bossChestItem || gameOverStats) return;
        if (isShopOpen) {
          setIsShopOpen(false);
          engine.resume();
          return;
        }
        if (isInventoryOpen) {
          setIsInventoryOpen(false);
          engine.resume();
          return;
        }
        setIsPaused((prev) => {
          const next = !prev;
          if (next) engine.pause();
          else engine.resume();
          return next;
        });
      } else if (e.key === 'b' || e.key === 'B') {
        if (levelUpChoices || bossChestItem || gameOverStats || isPaused) return;
        if (isInventoryOpen) return;
        setIsShopOpen((prev) => {
          const next = !prev;
          if (next) engine.pause();
          else engine.resume();
          return next;
        });
      } else if (e.key === 'i' || e.key === 'I') {
        if (levelUpChoices || bossChestItem || gameOverStats || isPaused || isShopOpen) return;
        setIsInventoryOpen((prev) => {
          const next = !prev;
          if (next) engine.pause();
          else engine.resume();
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleGlobalKey);

    return () => {
      window.removeEventListener('keydown', handleGlobalKey);
      engine.stop();
      engineRef.current = null;
    };
  }, [gameState, selectedClassId]);

  // Handle Level Up choice selection
  const handleSelectUpgrade = (upgradeId: string) => {
    if (engineRef.current) {
      engineRef.current.applyUpgrade(upgradeId);
    }
    setLevelUpChoices(null);
  };

  // Handle Boss Chest item equipped
  const handleEquipBossItem = (item: Item) => {
    if (engineRef.current) {
      engineRef.current.equipBossItem(item);
    }
    setBossChestItem(null);
  };

  // Pause / Resume
  const handlePause = () => {
    if (engineRef.current) {
      engineRef.current.pause();
    }
    setIsPaused(true);
  };

  const handleResume = () => {
    if (engineRef.current) {
      engineRef.current.resume();
    }
    setIsPaused(false);
  };

  // Restart match
  const handleRestart = () => {
    startGame(selectedClassId);
  };

  // Quit to Title
  const handleQuit = () => {
    if (engineRef.current) {
      engineRef.current.stop();
      engineRef.current = null;
    }
    setGameState('TITLE');
    setIsPaused(false);
    setLevelUpChoices(null);
    setBossChestItem(null);
    setIsInventoryOpen(false);
    setIsShopOpen(false);
    setGameOverStats(null);
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 overflow-hidden select-none font-sans">
      {/* 1. TITLE SCREEN */}
      {gameState === 'TITLE' && (
        <TitleScreen
          onStart={() => setGameState('CLASS_SELECT')}
          onOpenClassSelect={() => setGameState('CLASS_SELECT')}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* 2. CLASS SELECTION SCREEN */}
      {gameState === 'CLASS_SELECT' && (
        <ClassSelectModal
          onSelectClass={(id) => startGame(id)}
          onBack={() => setGameState('TITLE')}
        />
      )}

      {/* 3. ACTIVE GAME PLAYING VIEWPORT */}
      {gameState === 'PLAYING' && (
        <div className="relative w-full h-full">
          {/* Isolated High-Performance 60fps Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-crosshair pixel-art"
          />

          {/* Low-Occlusion World-Matched HUD */}
          {hudData && (
            <GameHUD
              data={hudData}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              onPause={handlePause}
              onOpenInventory={() => {
                if (engineRef.current) engineRef.current.pause();
                setIsInventoryOpen(true);
              }}
              onOpenShop={() => {
                if (engineRef.current) engineRef.current.pause();
                setIsShopOpen(true);
              }}
            />
          )}

          {/* Level Up Choice Modal */}
          {levelUpChoices && hudData && (
            <LevelUpModal
              level={hudData.level}
              choices={levelUpChoices}
              onSelectUpgrade={handleSelectUpgrade}
              onReroll={() => {
                if (engineRef.current) {
                  const newChoices = engineRef.current.triggerLevelUpChoices();
                  setLevelUpChoices(newChoices);
                }
              }}
            />
          )}

          {/* Shop Modal (Phím B) */}
          {isShopOpen && engineRef.current && (
            <ShopModal
              player={engineRef.current.player}
              onBuyUpgrade={(type) => {
                if (engineRef.current) {
                  engineRef.current.buyShopUpgrade(type);
                  // Force state refresh so gold and levels re-render immediately
                  if (hudData) {
                    setHudData({ ...hudData, gold: engineRef.current.player.gold });
                  }
                }
              }}
              onClose={() => {
                setIsShopOpen(false);
                engineRef.current?.resume();
              }}
            />
          )}

          {/* Boss Chest Drop Modal */}
          {bossChestItem && engineRef.current && (
            <BossChestModal
              playerClassId={selectedClassId}
              weaponAlreadyEvolved={engineRef.current.player.weaponEvolved}
              onEquipItem={handleEquipBossItem}
            />
          )}

          {/* Inventory & Character Stats Modal */}
          {isInventoryOpen && engineRef.current && (
            <InventoryModal
              player={engineRef.current.player}
              onClose={() => {
                setIsInventoryOpen(false);
                engineRef.current?.resume();
              }}
            />
          )}

          {/* Pause Modal */}
          {isPaused && (
            <PauseModal
              onResume={handleResume}
              onRestart={handleRestart}
              onQuit={handleQuit}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
            />
          )}

          {/* Game Over Modal */}
          {gameOverStats && (
            <GameOverModal
              stats={gameOverStats}
              classNameUsed={selectedClassId.toUpperCase()}
              onRestart={handleRestart}
              onQuit={handleQuit}
            />
          )}
        </div>
      )}
    </div>
  );
}
