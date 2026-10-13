import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield,
  Heart,
  Zap,
  Bomb,
  Trophy,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Pause,
  BookOpen,
  Monitor,
  Flame,
  Award,
  ChevronRight,
  Crosshair,
  Radio,
  Download
} from 'lucide-react';
import { GameCanvas } from './components/GameCanvas';
import { LeaderboardModal } from './components/LeaderboardModal';
import { PilotManualModal } from './components/PilotManualModal';
import { DownloadModal } from './components/DownloadModal';
import { GameState, GameStats, Player } from './types/game';
import { retroAudio } from './utils/audio';
import { getHighScore, addScoreRecord } from './utils/storage';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('title');
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [bgmEnabled, setBgmEnabled] = useState<boolean>(true);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isManualOpen, setIsManualOpen] = useState<boolean>(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState<boolean>(false);
  const [highScore, setHighScore] = useState<number>(() => getHighScore());

  // Callsign & Score submission
  const [pilotCallsign, setPilotCallsign] = useState<string>('VIPER-X');
  const [latestSubmittedId, setLatestSubmittedId] = useState<string | undefined>(undefined);
  const [achievedRank, setAchievedRank] = useState<number | null>(null);

  // Live HUD states from canvas loop
  const [liveStats, setLiveStats] = useState<GameStats>({
    score: 0,
    wave: 1,
    shotsFired: 0,
    shotsHit: 0,
    enemiesKilled: 0,
    bossesDefeated: 0
  });

  const [livePlayer, setLivePlayer] = useState<Player>({
    x: 400,
    y: 800,
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
  });

  // Keep audio settings synced
  useEffect(() => {
    retroAudio.enabled = soundEnabled;
    retroAudio.bgmEnabled = bgmEnabled;
    if (gameState === 'playing' && soundEnabled && bgmEnabled) {
      retroAudio.startBGM();
    } else {
      retroAudio.stopBGM();
    }
  }, [soundEnabled, bgmEnabled, gameState]);

  // Start / Resume Game
  const handleStartGame = () => {
    setGameState('playing');
    setAchievedRank(null);
    if (soundEnabled && bgmEnabled) {
      retroAudio.startBGM();
    }
  };

  // Pause / Resume Toggle
  const togglePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
      retroAudio.stopBGM();
    } else if (gameState === 'paused') {
      setGameState('playing');
      if (soundEnabled && bgmEnabled) retroAudio.startBGM();
    }
  };

  // Game Over callback from Canvas
  const handleGameOver = useCallback((finalStats: GameStats) => {
    setGameState('game_over');
    retroAudio.stopBGM();
    setLiveStats(finalStats);
    if (finalStats.score > highScore) {
      setHighScore(finalStats.score);
    }
  }, [highScore]);

  // Stats update throttle from canvas
  const handleStatsUpdate = useCallback((stats: GameStats, player: Player) => {
    setLiveStats(stats);
    setLivePlayer(player);
  }, []);

  // Submit highscore to Hall of Fame
  const handleSubmitScore = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAccuracy = liveStats.shotsFired > 0
      ? Math.round((liveStats.shotsHit / liveStats.shotsFired) * 100)
      : 0;

    const today = new Date().toISOString().split('T')[0];
    const { rank } = addScoreRecord({
      callsign: (pilotCallsign.trim() || 'ANONYMOUS').toUpperCase(),
      score: liveStats.score,
      wave: liveStats.wave,
      kills: liveStats.enemiesKilled,
      accuracy: Math.min(100, finalAccuracy),
      date: today
    });

    setAchievedRank(rank);
    setHighScore(getHighScore());
    setIsLeaderboardOpen(true);
  };

  const accuracyPercent = liveStats.shotsFired > 0
    ? Math.min(100, Math.round((liveStats.shotsHit / liveStats.shotsFired) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Bar following Top Bar Contract: 1 row, 3 zones */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3 sm:px-6">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 whitespace-nowrap shrink-0">
              ASTROVOID 1984
            </span>
          </div>

          {/* Zone 2: 4-5 single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="whitespace-nowrap shrink-0 hover:text-cyan-400 transition"
            >
              排行榜 (Leaderboard)
            </button>
            <button
              onClick={() => setIsManualOpen(true)}
              className="whitespace-nowrap shrink-0 hover:text-cyan-400 transition"
            >
              作战手册 (Manual)
            </button>
            <button
              onClick={() => setIsDownloadOpen(true)}
              className="whitespace-nowrap shrink-0 text-cyan-400 hover:text-cyan-300 font-bold transition flex items-center gap-1"
            >
              <Download className="h-3.5 w-3.5" /> 打包保存 (Save)
            </button>
            <button
              onClick={() => setCrtEnabled(!crtEnabled)}
              className={`whitespace-nowrap shrink-0 transition ${
                crtEnabled ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              CRT扫描线: {crtEnabled ? '开' : '关'}
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="whitespace-nowrap shrink-0 hover:text-cyan-400 transition flex items-center gap-1"
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-cyan-400" /> : <VolumeX className="h-3.5 w-3.5" />}
              声效: {soundEnabled ? '开启' : '静音'}
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2">
            {gameState === 'playing' ? (
              <button
                onClick={togglePause}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-cyan-500 hover:text-white transition"
              >
                <Pause className="h-3.5 w-3.5" /> 暂停
              </button>
            ) : gameState === 'paused' ? (
              <button
                onClick={togglePause}
                className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-cyan-500 transition"
              >
                <Play className="h-3.5 w-3.5" /> 继续
              </button>
            ) : (
              <button
                onClick={handleStartGame}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:opacity-95 shadow-md shadow-cyan-500/20 transition"
              >
                <Play className="h-3.5 w-3.5" /> 战机出击
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Game Arena */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center p-3 sm:p-6">
        {/* HUD Overlay Bar during play */}
        <div className="mb-3 w-full max-w-[800px] rounded-xl border border-slate-800 bg-slate-900/90 p-3 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            {/* Score & Wave */}
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] uppercase text-slate-400">SCORE</span>
                <p className="text-base font-extrabold tracking-wider text-cyan-400">
                  {String(liveStats.score).padStart(8, '0')}
                </p>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <span className="text-[10px] uppercase text-slate-400">SECTOR</span>
                <p className="text-sm font-bold text-indigo-300">
                  WAVE {liveStats.wave}
                </p>
              </div>
              <div className="border-l border-slate-800 pl-4 hidden sm:block">
                <span className="text-[10px] uppercase text-slate-400">HI-SCORE</span>
                <p className="text-xs font-bold text-amber-400">
                  {String(Math.max(highScore, liveStats.score)).padStart(8, '0')}
                </p>
              </div>
            </div>

            {/* Health & Shield Gauges */}
            <div className="flex items-center gap-4">
              {/* Hull HP */}
              <div className="w-28 sm:w-32">
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="flex items-center gap-1 text-rose-400">
                    <Heart className="h-3 w-3" /> HULL
                  </span>
                  <span className="font-bold text-slate-300">{Math.round(livePlayer.hp)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${Math.max(0, (livePlayer.hp / livePlayer.maxHp) * 100)}%` }}
                    className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-150"
                  ></div>
                </div>
              </div>

              {/* Shield Gauge */}
              <div className="w-28 sm:w-32">
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span className="flex items-center gap-1 text-cyan-400">
                    <Shield className="h-3 w-3" /> SHIELD
                  </span>
                  <span className="font-bold text-slate-300">{Math.round(livePlayer.shield)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${Math.max(0, (livePlayer.shield / livePlayer.maxShield) * 100)}%` }}
                    className="h-full bg-gradient-to-r from-sky-600 to-cyan-400 transition-all duration-150"
                  ></div>
                </div>
              </div>
            </div>

            {/* Weapon & Bomb Arsenal */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-[11px] text-slate-300">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>LV.{livePlayer.weaponLevel}</span>
              </div>

              <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
                <span className="text-[10px] text-slate-400">BOMB:</span>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-2.5 w-2.5 rounded-sm transition ${
                        i < livePlayer.bombs ? 'bg-purple-500 shadow-sm shadow-purple-500' : 'bg-slate-800'
                      }`}
                    ></span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Game Container */}
        <div className="relative w-full max-w-[800px]">
          <GameCanvas
            gameState={gameState}
            crtEnabled={crtEnabled}
            onGameOver={handleGameOver}
            onStatsUpdate={handleStatsUpdate}
            onRequestBomb={() => {}}
          />

          {/* Title Screen Overlay */}
          {gameState === 'title' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/85 p-6 backdrop-blur-sm">
              <div className="text-center max-w-md">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 tracking-wider mb-2">
                  <Radio className="h-3.5 w-3.5 animate-pulse" /> ARCADE SIMULATOR
                </div>
                <h1 className="font-mono text-4xl sm:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-indigo-400 drop-shadow-[0_0_25px_rgba(56,189,248,0.4)]">
                  ASTROVOID
                </h1>
                <p className="mt-3 text-xs text-slate-300 leading-relaxed font-mono">
                  银河深空遭遇未确认舰队围攻！驾驶战机突围星区，收集武器补给，消灭轨道歼星母舰，将你的代号刻在星际名人堂！
                </p>

                {/* Pilot Callsign input before launch */}
                <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/90 p-4 text-left">
                  <label className="text-[11px] font-mono font-semibold uppercase text-slate-400 block mb-1">
                    飞行员呼号 / PILOT CALLSIGN:
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={pilotCallsign}
                    onChange={(e) => setPilotCallsign(e.target.value.toUpperCase())}
                    placeholder="VIPER-X"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-cyan-400 font-bold focus:border-cyan-500 focus:outline-none uppercase"
                  />
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>当前最高街机记录: {highScore.toLocaleString()}</span>
                    <span>连击加成: 最高 4.0X</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleStartGame}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 px-6 py-3.5 font-mono text-sm font-black tracking-wider text-white shadow-xl shadow-cyan-500/25 hover:opacity-95 transition"
                  >
                    <Play className="h-4 w-4 fill-current" /> 立即出击 [START GAME]
                  </button>
                  <button
                    onClick={() => setIsLeaderboardOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3.5 font-mono text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition"
                  >
                    <Trophy className="h-4 w-4 text-amber-400" /> 排行榜
                  </button>
                  <button
                    onClick={() => setIsDownloadOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-4 py-3.5 font-mono text-xs font-bold text-cyan-300 hover:bg-cyan-900/50 hover:text-white transition"
                  >
                    <Download className="h-4 w-4 text-cyan-400" /> 打包保存
                  </button>
                </div>

                {/* Quick Controls Cheat Sheet */}
                <div className="mt-6 border-t border-slate-800/80 pt-4 text-[11px] text-slate-500 font-mono flex items-center justify-center gap-4">
                  <span>WASD 移动</span>
                  <span aria-hidden="true">·</span>
                  <span>空格 开火</span>
                  <span aria-hidden="true">·</span>
                  <span>B 键 EMP 炸弹</span>
                  <span aria-hidden="true">·</span>
                  <span>支持鼠标拖拽</span>
                </div>
              </div>
            </div>
          )}

          {/* Paused Screen Overlay */}
          {gameState === 'paused' && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-6">
              <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-950 p-6 text-center shadow-2xl">
                <h3 className="font-mono text-2xl font-black text-cyan-400">MISSION PAUSED</h3>
                <p className="mt-1 text-xs text-slate-400 font-mono">星区战事已挂起，整备后继续</p>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={togglePause}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-600 py-3 text-xs font-bold text-white hover:bg-cyan-500 transition"
                  >
                    <Play className="h-4 w-4" /> 恢复作战
                  </button>
                  <button
                    onClick={() => {
                      setSoundEnabled(!soundEnabled);
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 py-2.5 text-xs text-slate-300 hover:bg-slate-800 transition"
                  >
                    {soundEnabled ? <Volume2 className="h-4 w-4 text-cyan-400" /> : <VolumeX className="h-4 w-4" />}
                    音效开关: {soundEnabled ? '已开启' : '已静音'}
                  </button>
                  <button
                    onClick={() => {
                      setGameState('title');
                      retroAudio.stopBGM();
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 py-2.5 text-xs text-rose-400 hover:bg-rose-950/40 transition"
                  >
                    <RotateCcw className="h-4 w-4" /> 放弃并返回主界面
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Game Over & Callsign Record Submission Overlay */}
          {gameState === 'game_over' && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-6">
              <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-slate-950 p-6 sm:p-8 text-center shadow-2xl shadow-rose-950/40">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-rose-500 tracking-wider">
                  ⚠️ HULL COMPROMISED
                </div>
                <h2 className="mt-1 font-mono text-3xl font-black text-white">
                  MISSION FAILED
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">战机已被摧毁，战绩数据已同步</p>

                {/* Score Summary Box */}
                <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/80 p-4 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">最终战绩得分</span>
                    <span className="text-lg font-black text-cyan-400">{liveStats.score.toLocaleString()}</span>
                  </div>
                  <div className="mt-2.5 grid grid-cols-3 gap-2 text-center text-slate-300">
                    <div>
                      <div className="text-[10px] text-slate-500">波次星区</div>
                      <div className="font-bold">WAVE {liveStats.wave}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">击坠敌舰</div>
                      <div className="font-bold">{liveStats.enemiesKilled} 艘</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">命中精度</div>
                      <div className="font-bold text-emerald-400">{accuracyPercent}%</div>
                    </div>
                  </div>
                </div>

                {/* Form to submit to Leaderboard */}
                <form onSubmit={handleSubmitScore} className="mt-5 text-left">
                  <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                    提交至星际排行榜 (Pilot Callsign):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={12}
                      value={pilotCallsign}
                      onChange={(e) => setPilotCallsign(e.target.value.toUpperCase())}
                      placeholder="CALLSIGN"
                      className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-mono text-xs font-bold text-cyan-400 focus:border-cyan-500 focus:outline-none uppercase"
                    />
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 font-mono text-xs font-bold text-black hover:bg-amber-400 transition"
                    >
                      <Trophy className="h-3.5 w-3.5" /> 登记上榜
                    </button>
                  </div>
                </form>

                {/* Retry / Back buttons */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleStartGame}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 py-3 font-mono text-xs font-bold text-white hover:opacity-95 transition"
                  >
                    <RotateCcw className="h-4 w-4" /> 再次出击 (Retry)
                  </button>
                  <button
                    onClick={() => setGameState('title')}
                    className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 font-mono text-xs text-slate-400 hover:text-white transition"
                  >
                    主界面
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile / Quick Action Dock Below Canvas */}
        <div className="mt-4 flex w-full max-w-[800px] flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Detonate bomb from button if playing
                if (gameState === 'playing') {
                  const ev = new KeyboardEvent('keydown', { key: 'b' });
                  window.dispatchEvent(ev);
                }
              }}
              disabled={gameState !== 'playing' || livePlayer.bombs <= 0}
              className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2 font-bold transition ${
                gameState === 'playing' && livePlayer.bombs > 0
                  ? 'border-purple-500/60 bg-purple-950/60 text-purple-300 hover:bg-purple-900/60 shadow-lg shadow-purple-950/50'
                  : 'border-slate-800 bg-slate-900/40 text-slate-600 cursor-not-allowed'
              }`}
            >
              <Bomb className="h-4 w-4" /> 触发 EMP 脉冲弹 (剩余 {livePlayer.bombs})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsManualOpen(true)}
              className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition"
            >
              <BookOpen className="h-3.5 w-3.5" /> 武器与按键指南
            </button>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="flex items-center gap-1 text-amber-400 hover:underline transition"
            >
              <Trophy className="h-3.5 w-3.5" /> 查看星际排行榜
            </button>
          </div>
        </div>
      </main>

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentScore={liveStats.score}
        latestRecordId={latestSubmittedId}
      />

      {/* Pilot Manual Modal */}
      <PilotManualModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
      />

      {/* Package & Download Modal */}
      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
      />

      {/* Retro Arcade Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500 font-mono">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4">
          <p>© 2026 ASTROVOID RETRO ARCADE · HTML5 矢量粒子引擎</p>
          <p className="hidden sm:block">60FPS 垂直同步 · Web Audio 8-bit 合成器</p>
        </div>
      </footer>
    </div>
  );
}
