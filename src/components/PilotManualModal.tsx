import React from 'react';
import { BookOpen, X, Shield, Zap, Crosshair, Bomb, Radio, Heart } from 'lucide-react';

interface PilotManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PilotManualModal: React.FC<PilotManualModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-sky-500/30 bg-slate-950 p-6 shadow-2xl shadow-sky-950/40 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white font-mono">
                PILOT FLIGHT MANUAL
              </h2>
              <p className="text-xs text-slate-400">星际战机操作指南与敌机档案情报</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="mt-6 space-y-6 text-xs text-slate-300">
          {/* Controls */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono text-sky-400">
              [ 操控指令 / CONTROLS ]
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2 font-mono">
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <span className="text-slate-400">移动战机:</span>
                <p className="text-white font-bold mt-1">W A S D / 方向键</p>
                <p className="text-[11px] text-slate-500 mt-0.5">支持鼠标/触控屏平滑拖拽驾驶</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <span className="text-slate-400">主炮开火:</span>
                <p className="text-white font-bold mt-1">空格键 Space / 自动开火</p>
                <p className="text-[11px] text-slate-500 mt-0.5">高频连射，可摧毁沿途敌舰</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <span className="text-slate-400">全屏 EMP 炸弹:</span>
                <p className="text-white font-bold mt-1">按键 B / 界面轰炸按钮</p>
                <p className="text-[11px] text-slate-500 mt-0.5">清除全屏敌弹并对全体造成巨额伤害</p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <span className="text-slate-400">游戏暂停:</span>
                <p className="text-white font-bold mt-1">按键 P / Esc</p>
                <p className="text-[11px] text-slate-500 mt-0.5">随时暂停并调节声效音量</p>
              </div>
            </div>
          </div>

          {/* Powerups intel */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono text-indigo-400">
              [ 补给战利品 / POWER-UPS ]
            </h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-sky-500/20 text-sky-400 font-bold font-mono">
                  W
                </div>
                <div>
                  <div className="font-semibold text-white">主炮升级 (LV.1 ~ LV.5)</div>
                  <div className="text-[11px] text-slate-400">双联、三向散射、四联量子重炮</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-500/20 text-emerald-400 font-bold font-mono">
                  S
                </div>
                <div>
                  <div className="font-semibold text-white">护盾发生器 (Shield)</div>
                  <div className="text-[11px] text-slate-400">立即回满偏转护盾，并具备自动慢充</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-purple-500/20 text-purple-400 font-bold font-mono">
                  B
                </div>
                <div>
                  <div className="font-semibold text-white">EMP 脉冲战术核弹 (+1)</div>
                  <div className="text-[11px] text-slate-400">紧急避险神技，储存上限 5 枚</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-amber-500/20 text-amber-400 font-bold font-mono">
                  R
                </div>
                <div>
                  <div className="font-semibold text-white">过载极速连发 (Rapid Fire)</div>
                  <div className="text-[11px] text-slate-400">持续 6 秒超高速机炮弹幕压制</div>
                </div>
              </div>
            </div>
          </div>

          {/* Combat Intel */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono text-amber-400">
              [ 连击与高分机制 / COMBO & SCORING ]
            </h3>
            <div className="mt-2 text-slate-400 leading-relaxed">
              连续击毁敌舰将在 3 秒内累计连击数（COMBO），最高可提供高达 <span className="text-amber-400 font-bold">4.0 倍</span> 积分加成！保持高精准度与快速歼敌是问鼎全球星际名人堂（Hall of Fame）的制胜法宝。
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-800 pt-4 text-right">
          <button
            onClick={onClose}
            className="rounded-lg bg-sky-600 px-5 py-2 text-xs font-semibold text-white hover:bg-sky-500 transition"
          >
            明白，准备出击！
          </button>
        </div>
      </div>
    </div>
  );
};
