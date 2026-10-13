import React from 'react';
import { Download, FileCode, Archive, X, CheckCircle2, Terminal, ExternalLink } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-950 p-6 shadow-2xl shadow-cyan-950/40 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white font-mono">
                PACKAGED GAME DOWNLOAD
              </h2>
              <p className="text-xs text-slate-400">游戏已成功打包，选择你需要的保存方式</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Options */}
        <div className="mt-6 space-y-4">
          {/* Option 1: Standalone HTML */}
          <div className="group rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/30 to-slate-900/60 p-5 transition hover:border-cyan-400">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0">
                  <FileCode className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">单文件离线可玩版 (推荐)</h3>
                    <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                      ~520 KB
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    所有脚本、样式、声效与游戏引擎已内嵌于单一 HTML 文件中。下载后双击即可在任何电脑浏览器中直接离线畅玩，无需安装 Node.js。
                  </p>
                </div>
              </div>

              <a
                href="astrovoid-standalone.html"
                download="astrovoid-standalone.html"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-cyan-500 transition"
              >
                <Download className="h-3.5 w-3.5" /> 保存 HTML
              </a>
            </div>
          </div>

          {/* Option 2: Full Source ZIP */}
          <div className="group rounded-xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-slate-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
                  <Archive className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">完整工程源码包 (ZIP)</h3>
                    <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-mono text-indigo-300">
                      ~320 KB
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    包含完整 React 19 + TypeScript + Vite 源码、配置文件以及生产构建产物（dist 目录）。
                  </p>
                </div>
              </div>

              <a
                href="astrovoid-game.zip"
                download="astrovoid-game.zip"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition"
              >
                <Download className="h-3.5 w-3.5" /> 下载 ZIP
              </a>
            </div>
          </div>
        </div>

        {/* Local Run Guide */}
        <div className="mt-6 rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 font-mono text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-2">
            <Terminal className="h-4 w-4 text-cyan-400" /> 本地开发者运行指南:
          </div>
          <div className="space-y-1 text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <p>1. 解压 <span className="text-cyan-400">astrovoid-game.zip</span></p>
            <p>2. 执行 <span className="text-indigo-400">npm install</span></p>
            <p>3. 执行 <span className="text-emerald-400">npm run dev</span> 即可在本地启动开发环境</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            完成并关闭
          </button>
        </div>
      </div>
    </div>
  );
};
