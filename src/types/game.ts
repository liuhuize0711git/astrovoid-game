export type WeaponType = 'blaster' | 'dual' | 'spread' | 'plasma' | 'laser';

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  maxHp: number;
  hp: number;
  maxShield: number;
  shield: number;
  shieldRegenTimer: number;
  weaponType: WeaponType;
  weaponLevel: number;
  bombs: number;
  invulnerableTimer: number;
  tilt: number; // for roll animation (-1 to 1)
}

export type EnemyType = 'scout' | 'fighter' | 'interceptor' | 'cruiser' | 'boss';

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  speedX: number;
  speedY: number;
  shootCooldown: number;
  points: number;
  angle: number;
  customTimer?: number;
  phase?: number;
  isBoss?: boolean;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  isPlayer: boolean;
  color: string;
  type?: 'standard' | 'plasma' | 'laser' | 'missile';
  homing?: boolean;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  decay: number;
  sparkle?: boolean;
}

export interface Shockwave {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
  speed: number;
}

export type PowerUpType = 'weapon_upgrade' | 'shield_restore' | 'emp_bomb' | 'repair' | 'rapid_fire';

export interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: PowerUpType;
  vy: number;
  pulse: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  fontSize: number;
}

export interface Star {
  x: number;
  y: number;
  radius: number;
  speed: number;
  alpha: number;
  color: string;
}

export interface ScoreRecord {
  id: string;
  callsign: string;
  score: number;
  wave: number;
  kills: number;
  accuracy: number;
  date: string;
  rank?: number;
}

export interface GameStats {
  score: number;
  wave: number;
  shotsFired: number;
  shotsHit: number;
  enemiesKilled: number;
  bossesDefeated: number;
}

export type GameState = 'title' | 'playing' | 'paused' | 'game_over' | 'victory';
