# AstroVoid: Retro Space Shooter

经典街机风格的复古太空战机射击游戏，具备粒子特效、多样武器升级、Boss 决战与街机排行榜系统。

## 直接开玩

不想装环境的话，直接用浏览器打开这个文件即可：

```
dist/astrovoid-standalone.html
```

它是打包好的单文件版本，双击就能玩，不需要联网也不需要装依赖。

## 本地开发

需要 Node.js（建议 20 以上）。

```bash
npm install      # 安装依赖
npm run dev      # 启动开发服务器，默认 http://localhost:3000
npm run build    # 构建到 dist/
npm run preview  # 本地预览构建结果
npm run lint     # TypeScript 类型检查
```

## 目录结构

```
├── src/
│   ├── App.tsx                      # 应用入口与整体布局
│   ├── main.tsx                     # React 挂载点
│   ├── index.css
│   ├── components/
│   │   ├── GameCanvas.tsx           # 游戏主循环与渲染（核心）
│   │   ├── LeaderboardModal.tsx     # 排行榜弹窗
│   │   ├── PilotManualModal.tsx     # 操作说明弹窗
│   │   └── DownloadModal.tsx        # 下载/分享弹窗
│   ├── types/game.ts                # 类型定义
│   └── utils/
│       ├── audio.ts                 # 音效处理
│       └── storage.ts               # 本地存档与排行榜持久化
├── dist/                            # 构建产物
│   ├── index.html                   # 网页版入口
│   ├── assets/                      # 打包后的 JS / CSS
│   ├── astrovoid-standalone.html    # 单文件离线版
│   └── astrovoid-game.zip           # 游戏压缩包
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── metadata.json
```

## 技术栈

- **React 19** + **TypeScript**
- **Vite 8** 构建
- **Tailwind CSS 4**
- **motion** 动画
- **lucide-react** 图标
- **@google/genai**（可选服务端能力）

## 在线玩

推送到 `main` 分支后，GitHub Actions 会自动构建并部署到：

```
https://liuhuize0711git.github.io/astrovoid-game/
```

部署逻辑在 `.github/workflows/deploy-pages.yml`，不需要本地装 Node 环境。

## 说明

- `vite.config.ts` 里的 `base` 固定为 `/astrovoid-game/`，这是 GitHub Pages 项目站点的子路径。
  如果部署到别的路径（比如自定义域名下的根目录），把它改成 `/` 或对应路径即可。
- `dist/` 是构建产物，**已加入 .gitignore，不进版本库**；线上版本由 Actions 每次重新构建。
- `public/` 目录里的文件会被 Vite 原样拷贝到构建输出根目录。游戏界面"打包保存"里提供的两个下载项
  （`astrovoid-standalone.html` 单文件离线版、`astrovoid-game.zip` 完整源码包）就放在这里。
  注意"打包保存"用的是相对路径，改动目录结构时要一并检查。
- `astrovoid-standalone.html` 是打包好的单文件版本，双击就能玩，不依赖任何路径或服务器。
