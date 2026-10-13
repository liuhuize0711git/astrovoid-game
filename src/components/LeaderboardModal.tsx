import React, { useState } from 'react';
import { Trophy, X, Medal, Target, Crosshair, Calendar, Trash2, ShieldAlert } from 'lucide-react';
import { ScoreRecord } from '../types/game';
import { getLeaderboard, saveLeaderboard } from '../utils/storage';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScore?: number;
  latestRecordId?: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentScore,
  latestRecordId
}) => {
  const [records, setRecords] = useState<ScoreRecord[]>(() => getLeaderboard());
  const [filter, setFilter] = useState<'all' | 'today'>('all');
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const displayedRecords = filter === 'today'
    ? records.filter((r) => r.date.startsWith(todayStr))
    : records;

  const handleClear = () => {
    saveLeaderboard([]);
    setRecords([]);
    setConfirmClear(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-indigo-500/30 bg-slate-950 p-6 shadow-2xl shadow-indigo-950/40 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl font-mono">
                GALACTIC HALL OF FAME
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>星际飞行员最高战绩榜</span>
                <span aria-hidden="true">·</span>
                <span>街机全球名人堂</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Controls & Stats Bar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/80 p-1">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              全时期总榜 ({records.length})
            </button>
            <button
              onClick={() => setFilter('today')}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition ${
                filter === 'today'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              今日战绩
            </button>
          </div>

          {currentScore !== undefined && currentScore > 0 && (
            <div className="text-xs text-slate-300 font-mono">
              当前当局得分: <span className="font-bold text-sky-400">{currentScore.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Table Records List */}
        <div className="mt-5 max-h-[420px] overflow-y-auto rounded-xl border border-slate-800/80 bg-slate-900/40">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-900/95 text-slate-400 font-mono border-b border-slate-800 backdrop-blur-sm">
              <tr>
                <th className="py-3 px-4">排名</th>
                <th className="py-3 px-4">飞行员代号</th>
                <th className="py-3 px-4 text-right">星际总分</th>
                <th className="py-3 px-4 text-center">星区 (波次)</th>
                <th className="py-3 px-4 text-center">击坠数</th>
                <th className="py-3 px-4 text-center">精准度</th>
                <th className="py-3 px-4 text-right hidden sm:table-cell">日期</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {displayedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    暂无记录，快去出击创下新辉煌！
                  </td>
                </tr>
              ) : (
                displayedRecords.map((item, idx) => {
                  const rank = idx + 1;
                  const isLatest = latestRecordId === item.id;
                  const isTop1 = rank === 1;
                  const isTop2 = rank === 2;
                  const isTop3 = rank === 3;

                  return (
                    <tr
                      key={item.id}
                      className={`transition ${
                        isLatest
                          ? 'bg-indigo-950/60 text-white'
                          : 'hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3 px-4 font-bold">
                        <div className="flex items-center gap-1.5">
                          {isTop1 ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-500/20 text-amber-400">
                              <Medal className="h-3.5 w-3.5" />
                            </span>
                          ) : isTop2 ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-400/20 text-slate-300">
                              <Medal className="h-3.5 w-3.5" />
                            </span>
                          ) : isTop3 ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-700/20 text-amber-600">
                              <Medal className="h-3.5 w-3.5" />
                            </span>
                          ) : (
                            <span className="text-slate-500 w-5 text-center">{rank}</span>
                          )}
                        </div>
                      </td>

                      {/* Callsign */}
                      <td className="py-3 px-4 font-bold tracking-wider">
                        <span className={isTop1 ? 'text-amber-400' : isLatest ? 'text-sky-400' : 'text-slate-200'}>
                          {item.callsign}
                        </span>
                        {isLatest && (
                          <span className="ml-2 text-[10px] text-indigo-400 font-sans">[本局记录]</span>
                        )}
                      </td>

                      {/* Score */}
                      <td className="py-3 px-4 text-right font-extrabold text-sky-400">
                        {item.score.toLocaleString()}
                      </td>

                      {/* Wave */}
                      <td className="py-3 px-4 text-center text-slate-300">
                        SECTOR {item.wave}
                      </td>

                      {/* Kills */}
                      <td className="py-3 px-4 text-center text-slate-300">
                        {item.kills}
                      </td>

                      {/* Accuracy */}
                      <td className="py-3 px-4 text-center text-emerald-400">
                        {item.accuracy}%
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-right text-slate-500 text-[11px] hidden sm:table-cell">
                        {item.date}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer actions */}
        <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-500">
          <div>
            {!confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-1.5 text-slate-500 hover:text-rose-400 transition"
              >
                <Trash2 className="h-3.5 w-3.5" /> 重置排行榜
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-rose-400">确认清空？</span>
                <button
                  onClick={handleClear}
                  className="font-bold text-rose-400 hover:underline"
                >
                  确定
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="text-slate-400 hover:underline"
                >
                  取消
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            返回作战
          </button>
        </div>
      </div>
    </div>
  );
};
