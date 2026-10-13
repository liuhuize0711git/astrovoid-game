import React, { useRef, useEffect, useCallback } from 'react';
import {
  Player,
  Enemy,
  Bullet,
  Particle,
  Shockwave,
  PowerUp,
  FloatingText,
  Star,
  GameState,
  GameStats,
  EnemyType,
  PowerUpType
} from '../types/game';
import { retroAudio } from '../utils/audio';

interface GameCanvasProps {
  gameState: GameState;
  crtEnabled: boolean;
  onGameOver: (finalStats: GameStats) => void;
  onStatsUpdate: (stats: GameStats, player: Player) => void;
  onRequestBomb: () => void;
  difficultyMultiplier?: number;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 900;

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  crtEnabled,
  onGameOver,
  onStatsUpdate,
  onRequestBomb,
  difficultyMultiplier = 1
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable Game State in ref for high performance 60FPS loop
  const stateRef = useRef<{
    player: Player;
    enemies: Enemy[];
    bullets: Bullet[];
    particles: Particle[];
    shockwaves: Shockwave[];
    powerups: PowerUp[];
    floatingTexts: FloatingText[];
    stars: Star[];
    keys: Record<string, boolean>;
    pointer: { x: number; y: number; active: boolean; isDown: boolean };
    lastShootTime: number;
    shake: number;
    wave: number;
    waveTimer: number;
    waveEnemiesRemaining: number;
    bossActive: boolean;
    stats: GameStats;
    combo: number;
    comboTimer: number;
    rapidFireTimer: number;
  }>({
    player: {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 120,
      width: 44,
      height: 48,
      speed: 7,
      maxHp: 100,
      hp: 100,
      maxShield: 100,
      shield: 100,
      shieldRegenTimer: 0,
      weaponType: 'blaster',
      weaponLevel: 1,
      bombs: 2,
      invulnerableTimer: 0,
      tilt: 0
    },
    enemies: [],
    bullets: [],
    particles: [],
    shockwaves: [],
    powerups: [],
    floatingTexts: [],
    stars: [],
    keys: {},
    pointer: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 120, active: false, isDown: false },
    lastShootTime: 0,
    shake: 0,
    wave: 1,
    waveTimer: 0,
    waveEnemiesRemaining: 15,
    bossActive: false,
    stats: {
      score: 0,
      wave: 1,
      shotsFired: 0,
      shotsHit: 0,
      enemiesKilled: 0,
      bossesDefeated: 0
    },
    combo: 0,
    comboTimer: 0,
    rapidFireTimer: 0
  });

  // Initialize Starfield
  useEffect(() => {
    const stars: Star[] = [];
    const colors = ['#ffffff', '#93c5fd', '#c4b5fd', '#a7f3d0', '#fbcfe8'];
    for (let i = 0; i < 140; i++) {
      const speedTier = Math.random();
      stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        radius: speedTier > 0.85 ? 1.8 : speedTier > 0.5 ? 1.2 : 0.7,
        speed: speedTier > 0.85 ? 2.8 : speedTier > 0.5 ? 1.5 : 0.6,
        alpha: 0.3 + Math.random() * 0.7,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    stateRef.current.stars = stars;
  }, []);

  // Reset Game
  const resetGame = useCallback(() => {
    const s = stateRef.current;
    s.player = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 120,
      width: 44,
      height: 48,
      speed: 7,
      maxHp: 100,
      hp: 100,
      maxShield: 100,
      shield: 100,
      shieldRegenTimer: 0,
      weaponType: 'blaster',
      weaponLevel: 1,
      bombs: 2,
      invulnerableTimer: 60,
      tilt: 0
    };
    s.enemies = [];
    s.bullets = [];
    s.particles = [];
    s.shockwaves = [];
    s.powerups = [];
    s.floatingTexts = [];
    s.wave = 1;
    s.waveTimer = 0;
    s.waveEnemiesRemaining = 12;
    s.bossActive = false;
    s.shake = 0;
    s.combo = 0;
    s.comboTimer = 0;
    s.rapidFireTimer = 0;
    s.stats = {
      score: 0,
      wave: 1,
      shotsFired: 0,
      shotsHit: 0,
      enemiesKilled: 0,
      bossesDefeated: 0
    };

    // Add starting announcement text
    s.floatingTexts.push({
      id: Math.random(),
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2 - 40,
      text: 'SECTOR 1: LAUNCH',
      color: '#38bdf8',
      alpha: 1,
      vy: -0.6,
      fontSize: 28
    });
  }, []);

  // Trigger EMP Bomb
  const triggerBomb = useCallback(() => {
    const s = stateRef.current;
    if (s.player.bombs <= 0) return;
    s.player.bombs--;

    retroAudio.playBomb();
    s.shake = 24;

    // Expanding shockwave
    s.shockwaves.push({
      id: Math.random(),
      x: s.player.x,
      y: s.player.y,
      radius: 10,
      maxRadius: Math.max(CANVAS_WIDTH, CANVAS_HEIGHT),
      color: '#38bdf8',
      alpha: 1,
      speed: 28
    });

    // Clear all enemy bullets and convert to score particles
    s.bullets = s.bullets.filter((b) => {
      if (!b.isPlayer) {
        for (let i = 0; i < 4; i++) {
          s.particles.push({
            id: Math.random(),
            x: b.x,
            y: b.y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            color: '#38bdf8',
            alpha: 1,
            size: 2,
            decay: 0.04
          });
        }
        return false;
      }
      return true;
    });

    // Massive damage to all current enemies
    s.enemies.forEach((enemy) => {
      enemy.hp -= 220;
    });

    s.floatingTexts.push({
      id: Math.random(),
      x: s.player.x,
      y: s.player.y - 30,
      text: '⚡ EMP DETONATED!',
      color: '#38bdf8',
      alpha: 1,
      vy: -1,
      fontSize: 22
    });
  }, []);

  // Expose bomb call to parent if needed
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === 'b' || e.key === 'B') && gameState === 'playing') {
        triggerBomb();
        onRequestBomb();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [gameState, triggerBomb, onRequestBomb]);

  // Restart trigger when game state moves to playing from title or game_over
  useEffect(() => {
    if (gameState === 'playing' && stateRef.current.stats.score === 0 && stateRef.current.enemies.length === 0) {
      resetGame();
    }
  }, [gameState, resetGame]);

  // Spawn Particle Helper
  const createExplosion = (x: number, y: number, color: string, count: number = 24, isLarge: boolean = false) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * (isLarge ? 9 : 5) + 1.5) * (Math.random() > 0.5 ? 1 : 0.8);
      s.particles.push({
        id: Math.random(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.4 ? color : '#ffffff',
        alpha: 1,
        size: Math.random() * (isLarge ? 4.5 : 2.8) + 1.2,
        decay: Math.random() * 0.025 + 0.015,
        sparkle: Math.random() > 0.5
      });
    }

    if (isLarge) {
      s.shockwaves.push({
        id: Math.random(),
        x,
        y,
        radius: 5,
        maxRadius: 160,
        color,
        alpha: 0.9,
        speed: 12
      });
    }
  };

  // Keyboard & Mouse Listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const s = stateRef.current;
      const player = s.player;

      // Update Screen Shake
      if (s.shake > 0) {
        s.shake *= 0.9;
        if (s.shake < 0.2) s.shake = 0;
      }

      if (gameState === 'playing') {
        // --- 1. PLAYER MOVEMENT ---
        let moveX = 0;
        let moveY = 0;

        if (s.keys['arrowleft'] || s.keys['a']) moveX -= 1;
        if (s.keys['arrowright'] || s.keys['d']) moveX += 1;
        if (s.keys['arrowup'] || s.keys['w']) moveY -= 1;
        if (s.keys['arrowdown'] || s.keys['s']) moveY += 1;

        // Pointer (touch/mouse drag) follow
        if (s.pointer.active) {
          const dx = s.pointer.x - player.x;
          const dy = s.pointer.y - player.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 4) {
            moveX = dx / Math.max(dist, 1);
            moveY = dy / Math.max(dist, 1);
          }
        }

        // Normalize diagonal
        if (moveX !== 0 && moveY !== 0) {
          moveX *= 0.7071;
          moveY *= 0.7071;
        }

        player.x += moveX * player.speed;
        player.y += moveY * player.speed;

        // Clamp inside bounds
        player.x = Math.max(player.width / 2, Math.min(CANVAS_WIDTH - player.width / 2, player.x));
        player.y = Math.max(player.height / 2, Math.min(CANVAS_HEIGHT - player.height / 2, player.y));

        // Tilt calculation for banking animation
        player.tilt += (moveX - player.tilt) * 0.18;

        // Thruster flame particles
        for (let i = 0; i < 2; i++) {
          s.particles.push({
            id: Math.random(),
            x: player.x + (Math.random() - 0.5) * 12,
            y: player.y + player.height / 2 - 2,
            vx: (Math.random() - 0.5) * 1.5 - player.tilt * 1.5,
            vy: Math.random() * 4 + 4,
            color: Math.random() > 0.4 ? '#38bdf8' : '#67e8f9',
            alpha: 0.8,
            size: Math.random() * 3 + 1.5,
            decay: 0.04
          });
        }

        // Shield auto-regeneration
        if (player.shield < player.maxShield) {
          player.shieldRegenTimer++;
          if (player.shieldRegenTimer > 180) {
            player.shield = Math.min(player.maxShield, player.shield + 0.15);
          }
        }

        if (player.invulnerableTimer > 0) {
          player.invulnerableTimer--;
        }

        // Rapid fire timer
        if (s.rapidFireTimer > 0) {
          s.rapidFireTimer--;
        }

        // Combo decay
        if (s.comboTimer > 0) {
          s.comboTimer--;
          if (s.comboTimer <= 0) s.combo = 0;
        }

        // --- 2. WEAPON FIRING ---
        const wantsToShoot = s.keys[' '] || s.keys['k'] || s.pointer.isDown || true; // Auto-fire supported for arcade feel
        const shootInterval = s.rapidFireTimer > 0 ? 90 : 140;

        if (wantsToShoot && currentTime - s.lastShootTime > shootInterval) {
          s.lastShootTime = currentTime;
          s.stats.shotsFired++;
          retroAudio.playShoot(player.weaponLevel);

          const lvl = player.weaponLevel;
          const py = player.y - player.height / 2;

          if (lvl === 1) {
            // Single Blaster
            s.bullets.push({
              id: Math.random(),
              x: player.x,
              y: py,
              vx: 0,
              vy: -16,
              radius: 4,
              damage: 26,
              isPlayer: true,
              color: '#38bdf8'
            });
          } else if (lvl === 2) {
            // Dual Twin
            s.bullets.push(
              {
                id: Math.random(),
                x: player.x - 12,
                y: py,
                vx: 0,
                vy: -17,
                radius: 4,
                damage: 24,
                isPlayer: true,
                color: '#38bdf8'
              },
              {
                id: Math.random(),
                x: player.x + 12,
                y: py,
                vx: 0,
                vy: -17,
                radius: 4,
                damage: 24,
                isPlayer: true,
                color: '#38bdf8'
              }
            );
          } else if (lvl === 3) {
            // Triple Spread
            s.bullets.push(
              {
                id: Math.random(),
                x: player.x,
                y: py,
                vx: 0,
                vy: -18,
                radius: 4.5,
                damage: 28,
                isPlayer: true,
                color: '#818cf8'
              },
              {
                id: Math.random(),
                x: player.x - 14,
                y: py + 4,
                vx: -2.2,
                vy: -17,
                radius: 4,
                damage: 20,
                isPlayer: true,
                color: '#a78bfa'
              },
              {
                id: Math.random(),
                x: player.x + 14,
                y: py + 4,
                vx: 2.2,
                vy: -17,
                radius: 4,
                damage: 20,
                isPlayer: true,
                color: '#a78bfa'
              }
            );
          } else if (lvl === 4) {
            // Quad Plasma
            for (let off of [-18, -6, 6, 18]) {
              s.bullets.push({
                id: Math.random(),
                x: player.x + off,
                y: py + (Math.abs(off) > 10 ? 6 : 0),
                vx: off * 0.08,
                vy: -18,
                radius: 4.5,
                damage: 24,
                isPlayer: true,
                color: '#c084fc'
              });
            }
          } else {
            // Level 5: Overcharged Quantum Laser & Homing
            s.bullets.push(
              {
                id: Math.random(),
                x: player.x - 5,
                y: py,
                vx: 0,
                vy: -20,
                radius: 6,
                damage: 40,
                isPlayer: true,
                color: '#38bdf8'
              },
              {
                id: Math.random(),
                x: player.x + 5,
                y: py,
                vx: 0,
                vy: -20,
                radius: 6,
                damage: 40,
                isPlayer: true,
                color: '#38bdf8'
              },
              {
                id: Math.random(),
                x: player.x - 24,
                y: py + 6,
                vx: -4,
                vy: -16,
                radius: 4,
                damage: 22,
                isPlayer: true,
                color: '#f43f5e'
              },
              {
                id: Math.random(),
                x: player.x + 24,
                y: py + 6,
                vx: 4,
                vy: -16,
                radius: 4,
                damage: 22,
                isPlayer: true,
                color: '#f43f5e'
              }
            );
          }
        }

        // --- 3. WAVE & ENEMY SPAWNING ---
        s.waveTimer++;

        // Spawn standard enemies
        if (!s.bossActive && s.waveEnemiesRemaining > 0 && s.waveTimer % Math.max(30, 75 - s.wave * 4) === 0) {
          s.waveEnemiesRemaining--;

          const types: EnemyType[] = ['scout', 'scout', 'fighter'];
          if (s.wave >= 2) types.push('interceptor');
          if (s.wave >= 3) types.push('cruiser');

          const chosenType = types[Math.floor(Math.random() * types.length)];
          const spawnX = 60 + Math.random() * (CANVAS_WIDTH - 120);

          let hp = 40;
          let speedY = 2;
          let points = 100;
          let width = 36;
          let height = 36;

          if (chosenType === 'scout') {
            hp = 35 + s.wave * 6;
            speedY = 2.8 + Math.random() * 1.2;
            points = 80;
            width = 30;
            height = 30;
          } else if (chosenType === 'fighter') {
            hp = 65 + s.wave * 12;
            speedY = 2.0;
            points = 150;
            width = 38;
            height = 40;
          } else if (chosenType === 'interceptor') {
            hp = 50 + s.wave * 8;
            speedY = 3.8;
            points = 200;
            width = 32;
            height = 34;
          } else if (chosenType === 'cruiser') {
            hp = 160 + s.wave * 25;
            speedY = 1.2;
            points = 350;
            width = 54;
            height = 54;
          }

          s.enemies.push({
            id: Math.random(),
            type: chosenType,
            x: spawnX,
            y: -50,
            width,
            height,
            hp: hp * difficultyMultiplier,
            maxHp: hp * difficultyMultiplier,
            speedX: (Math.random() - 0.5) * 2,
            speedY,
            shootCooldown: Math.floor(Math.random() * 60) + 40,
            points,
            angle: 0
          });
        }

        // Spawn Boss every 3 waves
        if (!s.bossActive && s.waveEnemiesRemaining <= 0 && s.enemies.length === 0) {
          if (s.wave % 3 === 0) {
            // Boss spawn!
            s.bossActive = true;
            retroAudio.playBossWarning();
            s.shake = 16;

            const bossHp = (800 + s.wave * 350) * difficultyMultiplier;
            s.enemies.push({
              id: Math.random(),
              type: 'boss',
              x: CANVAS_WIDTH / 2,
              y: -120,
              width: 140,
              height: 100,
              hp: bossHp,
              maxHp: bossHp,
              speedX: 2.2,
              speedY: 1.2,
              shootCooldown: 50,
              points: 3000 * s.wave,
              angle: 0,
              customTimer: 0,
              phase: 1,
              isBoss: true
            });

            s.floatingTexts.push({
              id: Math.random(),
              x: CANVAS_WIDTH / 2,
              y: CANVAS_HEIGHT / 2 - 80,
              text: '⚠️ DREADNOUGHT CLASS THREAT ⚠️',
              color: '#ef4444',
              alpha: 1,
              vy: -0.5,
              fontSize: 26
            });
          } else {
            // Advance to next wave
            s.wave++;
            s.stats.wave = s.wave;
            s.waveEnemiesRemaining = 14 + s.wave * 4;
            s.waveTimer = 0;

            s.floatingTexts.push({
              id: Math.random(),
              x: CANVAS_WIDTH / 2,
              y: CANVAS_HEIGHT / 2 - 60,
              text: `SECTOR ${s.wave} CLEARED`,
              color: '#38bdf8',
              alpha: 1,
              vy: -0.7,
              fontSize: 26
            });
          }
        }

        // --- 4. UPDATE ENEMIES ---
        s.enemies = s.enemies.filter((enemy) => {
          // Boss Logic
          if (enemy.isBoss) {
            if (enemy.y < 150) {
              enemy.y += enemy.speedY;
            } else {
              enemy.x += enemy.speedX;
              if (enemy.x > CANVAS_WIDTH - enemy.width / 2 || enemy.x < enemy.width / 2) {
                enemy.speedX *= -1;
              }
            }

            enemy.shootCooldown--;
            if (enemy.shootCooldown <= 0) {
              enemy.shootCooldown = Math.max(35, 75 - s.wave * 3);

              // Boss fires radial pattern
              const bulletCount = 8;
              for (let b = 0; b < bulletCount; b++) {
                const angle = (b / bulletCount) * Math.PI * 2 + (enemy.customTimer || 0);
                s.bullets.push({
                  id: Math.random(),
                  x: enemy.x,
                  y: enemy.y + 30,
                  vx: Math.cos(angle) * 3.8,
                  vy: Math.sin(angle) * 3.8,
                  radius: 5,
                  damage: 18,
                  isPlayer: false,
                  color: '#ef4444'
                });
              }
              enemy.customTimer = (enemy.customTimer || 0) + 0.35;
            }
          } else {
            // Standard Enemies
            enemy.y += enemy.speedY;

            if (enemy.type === 'scout') {
              enemy.x += Math.sin(enemy.y * 0.05) * 3;
            } else if (enemy.type === 'interceptor') {
              // Accelerates toward player x
              enemy.x += (player.x - enemy.x) * 0.025;
            } else {
              enemy.x += enemy.speedX;
              if (enemy.x > CANVAS_WIDTH - 30 || enemy.x < 30) enemy.speedX *= -1;
            }

            // Shoot at player
            enemy.shootCooldown--;
            if (enemy.shootCooldown <= 0 && enemy.y > 20 && enemy.y < CANVAS_HEIGHT - 100) {
              enemy.shootCooldown = 90 + Math.random() * 80;

              const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
              const speed = 4.2;

              s.bullets.push({
                id: Math.random(),
                x: enemy.x,
                y: enemy.y + enemy.height / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 4,
                damage: 14,
                isPlayer: false,
                color: '#f97316'
              });
            }
          }

          // Check if dead
          if (enemy.hp <= 0) {
            // Destroyed!
            s.stats.enemiesKilled++;
            s.combo++;
            s.comboTimer = 180; // 3 seconds combo window
            const comboMultiplier = 1 + Math.min(s.combo * 0.2, 3);
            const gainedScore = Math.floor(enemy.points * comboMultiplier);
            s.stats.score += gainedScore;

            if (enemy.isBoss) {
              s.stats.bossesDefeated++;
              s.bossActive = false;
              s.wave++;
              s.stats.wave = s.wave;
              s.waveEnemiesRemaining = 16 + s.wave * 4;
              s.shake = 30;
              retroAudio.playExplosion(true);
              createExplosion(enemy.x, enemy.y, '#f59e0b', 80, true);

              // Guaranteed upgrades drop
              for (let p = 0; p < 3; p++) {
                s.powerups.push({
                  id: Math.random(),
                  x: enemy.x + (p - 1) * 40,
                  y: enemy.y,
                  type: p === 0 ? 'weapon_upgrade' : p === 1 ? 'emp_bomb' : 'shield_restore',
                  vy: 2,
                  pulse: 0
                });
              }

              s.floatingTexts.push({
                id: Math.random(),
                x: enemy.x,
                y: enemy.y,
                text: `+${gainedScore} BOSS DESTROYED!`,
                color: '#fbbf24',
                alpha: 1,
                vy: -1.2,
                fontSize: 24
              });
            } else {
              retroAudio.playExplosion(false);
              createExplosion(enemy.x, enemy.y, enemy.type === 'cruiser' ? '#ec4899' : '#38bdf8', 26);

              // Chance of Powerup Drop
              if (Math.random() < 0.22) {
                const pTypes: PowerUpType[] = ['weapon_upgrade', 'shield_restore', 'repair', 'rapid_fire'];
                if (player.bombs < 3 && Math.random() < 0.3) pTypes.push('emp_bomb');
                const pType = pTypes[Math.floor(Math.random() * pTypes.length)];

                s.powerups.push({
                  id: Math.random(),
                  x: enemy.x,
                  y: enemy.y,
                  type: pType,
                  vy: 2.2,
                  pulse: 0
                });
              }

              s.floatingTexts.push({
                id: Math.random(),
                x: enemy.x,
                y: enemy.y,
                text: `+${gainedScore}${s.combo > 2 ? ` (x${comboMultiplier.toFixed(1)})` : ''}`,
                color: '#38bdf8',
                alpha: 1,
                vy: -1,
                fontSize: 16
              });
            }

            return false;
          }

          // Off screen bottom removal
          if (enemy.y > CANVAS_HEIGHT + 100) {
            return false;
          }

          return true;
        });

        // --- 5. UPDATE BULLETS ---
        s.bullets = s.bullets.filter((b) => {
          b.x += b.vx;
          b.y += b.vy;

          // Out of screen bounds
          if (b.x < -20 || b.x > CANVAS_WIDTH + 20 || b.y < -30 || b.y > CANVAS_HEIGHT + 30) {
            return false;
          }

          if (b.isPlayer) {
            // Check collision with enemies
            for (let enemy of s.enemies) {
              const dx = b.x - enemy.x;
              const dy = b.y - enemy.y;
              const hitRadius = enemy.width / 2 + b.radius;

              if (Math.hypot(dx, dy) < hitRadius) {
                enemy.hp -= b.damage;
                s.stats.shotsHit++;

                // Spark particle
                for (let i = 0; i < 3; i++) {
                  s.particles.push({
                    id: Math.random(),
                    x: b.x,
                    y: b.y,
                    vx: (Math.random() - 0.5) * 3,
                    vy: (Math.random() - 0.5) * 3,
                    color: b.color,
                    alpha: 1,
                    size: 2,
                    decay: 0.05
                  });
                }
                return false;
              }
            }
          } else {
            // Enemy bullet hitting player
            if (player.invulnerableTimer <= 0) {
              const dx = b.x - player.x;
              const dy = b.y - player.y;
              const hitRadius = player.width / 2.2 + b.radius;

              if (Math.hypot(dx, dy) < hitRadius) {
                // Shield absorbs damage first
                if (player.shield > 0) {
                  player.shield -= b.damage * 1.2;
                  player.shieldRegenTimer = 0;
                  retroAudio.playShieldDeflect();
                  if (player.shield < 0) {
                    player.hp += player.shield; // overflow
                    player.shield = 0;
                  }
                } else {
                  player.hp -= b.damage;
                  player.shieldRegenTimer = 0;
                  retroAudio.playPlayerHit();
                  s.shake = 12;
                }

                // Hit spark
                createExplosion(b.x, b.y, '#ef4444', 8);

                // Check game over
                if (player.hp <= 0) {
                  player.hp = 0;
                  createExplosion(player.x, player.y, '#f59e0b', 60, true);
                  retroAudio.playExplosion(true);
                  onGameOver({ ...s.stats });
                }

                return false;
              }
            }
          }

          return true;
        });

        // --- 6. UPDATE POWERUPS ---
        s.powerups = s.powerups.filter((p) => {
          p.y += p.vy;
          p.pulse += 0.08;

          // Check pickup by player
          const dx = p.x - player.x;
          const dy = p.y - player.y;
          if (Math.hypot(dx, dy) < player.width / 2 + 18) {
            retroAudio.playPowerup();

            let pickupText = '';
            let textColor = '#38bdf8';

            if (p.type === 'weapon_upgrade') {
              player.weaponLevel = Math.min(5, player.weaponLevel + 1);
              pickupText = `WEAPON UPGRADE LV.${player.weaponLevel}`;
              textColor = '#38bdf8';
            } else if (p.type === 'shield_restore') {
              player.shield = player.maxShield;
              pickupText = 'SHIELD RESTORED';
              textColor = '#34d399';
            } else if (p.type === 'repair') {
              player.hp = Math.min(player.maxHp, player.hp + 40);
              pickupText = '+40 HULL INTEGRITY';
              textColor = '#22c55e';
            } else if (p.type === 'emp_bomb') {
              player.bombs = Math.min(5, player.bombs + 1);
              pickupText = '+1 EMP BOMB';
              textColor = '#a855f7';
            } else if (p.type === 'rapid_fire') {
              s.rapidFireTimer = 360; // 6 seconds overdrive
              pickupText = 'RAPID FIRE OVERDRIVE';
              textColor = '#f59e0b';
            }

            s.floatingTexts.push({
              id: Math.random(),
              x: player.x,
              y: player.y - 40,
              text: pickupText,
              color: textColor,
              alpha: 1,
              vy: -1,
              fontSize: 18
            });

            // Pickup sparkle
            createExplosion(p.x, p.y, textColor, 16);
            return false;
          }

          return p.y < CANVAS_HEIGHT + 40;
        });

        // Sync stats callback periodically
        onStatsUpdate({ ...s.stats }, { ...player });
      }

      // --- 7. UPDATE PARTICLES, SHOCKWAVES & FLOATING TEXTS ---
      s.particles = s.particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        return p.alpha > 0;
      });

      s.shockwaves = s.shockwaves.filter((sw) => {
        sw.radius += sw.speed;
        sw.alpha -= 0.035;
        return sw.alpha > 0 && sw.radius < sw.maxRadius;
      });

      s.floatingTexts = s.floatingTexts.filter((ft) => {
        ft.y += ft.vy;
        ft.alpha -= 0.015;
        return ft.alpha > 0;
      });

      // Update Starfield
      s.stars.forEach((star) => {
        star.y += star.speed;
        if (star.y > CANVAS_HEIGHT) {
          star.y = 0;
          star.x = Math.random() * CANVAS_WIDTH;
        }
      });

      // --- 8. DRAWING ROUTINE ---
      ctx.save();

      // Screen shake translation
      if (s.shake > 0) {
        const shakeX = (Math.random() - 0.5) * s.shake;
        const shakeY = (Math.random() - 0.5) * s.shake;
        ctx.translate(shakeX, shakeY);
      }

      // Deep space background
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Distant space grid lines (Retro synthwave horizon illusion)
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.25)';
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_WIDTH; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }

      // Draw Stars
      s.stars.forEach((star) => {
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Draw Shockwaves
      s.shockwaves.forEach((sw) => {
        ctx.save();
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = Math.max(0, sw.alpha);
        ctx.lineWidth = 4;
        ctx.shadowBlur = 15;
        ctx.shadowColor = sw.color;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // Draw PowerUps
      s.powerups.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        const scale = 1 + Math.sin(p.pulse) * 0.12;
        ctx.scale(scale, scale);

        let color = '#38bdf8';
        let label = 'W';
        if (p.type === 'shield_restore') {
          color = '#34d399';
          label = 'S';
        } else if (p.type === 'emp_bomb') {
          color = '#a855f7';
          label = 'B';
        } else if (p.type === 'repair') {
          color = '#ef4444';
          label = '+';
        } else if (p.type === 'rapid_fire') {
          color = '#f59e0b';
          label = 'R';
        }

        ctx.shadowBlur = 14;
        ctx.shadowColor = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';

        // Diamond container
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(14, 0);
        ctx.lineTo(0, 14);
        ctx.lineTo(-14, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, 0, 0);

        ctx.restore();
      });

      // Draw Particles
      s.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        if (p.sparkle) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Bullets
      s.bullets.forEach((b) => {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = b.color;
        ctx.fillStyle = b.color;

        ctx.beginPath();
        if (b.isPlayer) {
          // Elongated laser bolt
          ctx.ellipse(b.x, b.y, b.radius, b.radius * 2.5, 0, 0, Math.PI * 2);
        } else {
          // Energy orb
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.restore();
      });

      // Draw Enemies
      s.enemies.forEach((enemy) => {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);

        if (enemy.isBoss) {
          // Boss: Dreadnought Flagship
          ctx.shadowBlur = 18;
          ctx.shadowColor = '#ef4444';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.fillStyle = '#1e1b4b';

          // Main Hull
          ctx.beginPath();
          ctx.moveTo(0, 50);
          ctx.lineTo(70, -20);
          ctx.lineTo(40, -50);
          ctx.lineTo(-40, -50);
          ctx.lineTo(-70, -20);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Core Reactor
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(0, 0, 16 + Math.sin(currentTime * 0.008) * 3, 0, Math.PI * 2);
          ctx.fill();

          // Health bar above Boss
          const barW = 120;
          const barH = 7;
          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          ctx.fillRect(-barW / 2, -70, barW, barH);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-barW / 2, -70, (enemy.hp / enemy.maxHp) * barW, barH);
        } else {
          // Standard Enemies
          let strokeColor = '#38bdf8';
          let fillColor = '#0f172a';

          if (enemy.type === 'scout') strokeColor = '#c084fc';
          if (enemy.type === 'fighter') strokeColor = '#f97316';
          if (enemy.type === 'interceptor') strokeColor = '#fbbf24';
          if (enemy.type === 'cruiser') strokeColor = '#f43f5e';

          ctx.shadowBlur = 10;
          ctx.shadowColor = strokeColor;
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 2;
          ctx.fillStyle = fillColor;

          const hw = enemy.width / 2;
          const hh = enemy.height / 2;

          ctx.beginPath();
          if (enemy.type === 'scout') {
            // Triangle Scout
            ctx.moveTo(0, hh);
            ctx.lineTo(hw, -hh);
            ctx.lineTo(0, -hh / 2);
            ctx.lineTo(-hw, -hh);
          } else if (enemy.type === 'fighter') {
            // Arrowhead Fighter
            ctx.moveTo(0, hh);
            ctx.lineTo(hw, 0);
            ctx.lineTo(hw / 2, -hh);
            ctx.lineTo(-hw / 2, -hh);
            ctx.lineTo(-hw, 0);
          } else {
            // Cruiser / Interceptor
            ctx.moveTo(0, hh);
            ctx.lineTo(hw, -hh / 2);
            ctx.lineTo(0, -hh);
            ctx.lineTo(-hw, -hh / 2);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Mini HP bar if damaged
          if (enemy.hp < enemy.maxHp) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(-hw, -hh - 8, enemy.width, 3);
            ctx.fillStyle = strokeColor;
            ctx.fillRect(-hw, -hh - 8, (enemy.hp / enemy.maxHp) * enemy.width, 3);
          }
        }
        ctx.restore();
      });

      // Draw Player Fighter
      if (player.hp > 0 && gameState !== 'game_over') {
        ctx.save();
        ctx.translate(player.x, player.y);

        // Invulnerability flash
        if (player.invulnerableTimer > 0 && Math.floor(player.invulnerableTimer / 4) % 2 === 0) {
          ctx.globalAlpha = 0.4;
        }

        // Tilt rotation
        ctx.rotate(player.tilt * 0.25);

        // Vector Fighter Hull
        ctx.shadowBlur = 16;
        ctx.shadowColor = '#38bdf8';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.fillStyle = '#0f172a';

        // Fighter shape
        ctx.beginPath();
        ctx.moveTo(0, -player.height / 2); // Nose
        ctx.lineTo(player.width / 2, player.height / 2 - 4); // Right wing tip
        ctx.lineTo(player.width / 4, player.height / 2 - 12);
        ctx.lineTo(0, player.height / 2 - 6); // Tail center
        ctx.lineTo(-player.width / 4, player.height / 2 - 12);
        ctx.lineTo(-player.width / 2, player.height / 2 - 4); // Left wing tip
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Cockpit canopy glow
        ctx.fillStyle = '#7dd3fc';
        ctx.beginPath();
        ctx.ellipse(0, -4, 4, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Active Shield Forcefield Bubble
        if (player.shield > 0) {
          ctx.save();
          const shieldAlpha = Math.min(0.7, 0.2 + (player.shield / player.maxShield) * 0.5);
          ctx.strokeStyle = `rgba(56, 189, 248, ${shieldAlpha})`;
          ctx.fillStyle = `rgba(56, 189, 248, ${shieldAlpha * 0.15})`;
          ctx.lineWidth = 2;
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#38bdf8';
          ctx.beginPath();
          ctx.arc(0, 0, player.width * 0.85, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }

        ctx.restore();
      }

      // Draw Floating Combat Texts
      s.floatingTexts.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.fillStyle = ft.color;
        ctx.font = `bold ${ft.fontSize}px 'Courier New', monospace`;
        ctx.textAlign = 'center';
        ctx.shadowBlur = 8;
        ctx.shadowColor = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // Optional Retro CRT Scanline Overlay
      if (crtEnabled) {
        ctx.save();
        ctx.fillStyle = 'rgba(10, 10, 10, 0.15)';
        for (let y = 0; y < CANVAS_HEIGHT; y += 4) {
          ctx.fillRect(0, y, CANVAS_WIDTH, 1.5);
        }
        ctx.restore();
      }

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, crtEnabled, difficultyMultiplier, onGameOver, onStatsUpdate]);

  // Touch and Mouse handlers for smooth dragging
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    stateRef.current.pointer.x = (e.clientX - rect.left) * scaleX;
    stateRef.current.pointer.y = (e.clientY - rect.top) * scaleY;
    stateRef.current.pointer.active = true;
    stateRef.current.pointer.isDown = true;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!stateRef.current.pointer.active) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    stateRef.current.pointer.x = (e.clientX - rect.left) * scaleX;
    stateRef.current.pointer.y = (e.clientY - rect.top) * scaleY;
  };

  const handlePointerUp = () => {
    stateRef.current.pointer.isDown = false;
  };

  return (
    <div className="relative mx-auto flex items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-cyan-950/20">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="h-auto w-full max-w-[800px] touch-none cursor-crosshair select-none aspect-[8/9]"
      />
    </div>
  );
};
