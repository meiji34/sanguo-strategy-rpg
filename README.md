# 乱世执棋

![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.5-39c5bb?style=for-the-badge)
![SQLite](https://img.shields.io/badge/SQLite-save_data-78dcca?style=for-the-badge)
![DeepSeek](https://img.shields.io/badge/DeepSeek-dialogue_proxy-00a6d6?style=for-the-badge)

> 地图驱动式三国权谋战略 RPG 原型。
> 前端负责地图、回合、指令和 UI；后端负责用户会话、云端存档和 AI 文本代理。

```text
      乱世已开局，桂阳等你点将。
      database online / deepseek ready / miku blessing accepted
```

## ミク神龛

项目没有真的依赖 Miku，但是 README 可以有一点电子香火。

```text
          /\\_/\\
     ____/ 39 \\____        电子葱力注入中...
    /  save   ai  \\
   /__ turn  map __\\       今日也要把桂阳治理成 SSR 城池
```

## 当前功能

- 大地图城池交互、势力范围、路线与军令展示
- 回合制内政、军事、亲信、刘表关系等原型玩法
- 本地存档兜底和后端 SQLite 云端存档
- 游客会话、注册、登录、登出等后端接口
- DeepSeek API 代理，用于 NPC 对话和文本生成
- 前端已拆分为 `index.html`、`css/`、`js/`、`assets/`

## 项目结构

```text
sanguo-strategy-rpg/
├── index.html              # 页面结构
├── css/
│   └── main.css            # 全局样式
├── js/
│   ├── game.js             # 游戏主逻辑
│   └── data/
│       └── mapData.js      # 地图区域与城池坐标数据
├── assets/
│   └── map.png             # 三国地图底图
├── server/
│   ├── index.mjs           # Node 后端、SQLite、DeepSeek 代理
│   └── README.md           # 后端接口说明
├── deploy.sh               # 服务器一键更新脚本
├── .env.example            # 环境变量模板
└── package.json
```

## 本地运行

要求 Node.js `>=22.5.0`，因为后端使用了内置 `node:sqlite`。

```bash
cp .env.example .env
npm start
```

然后打开：

```text
http://127.0.0.1:3001/
```

健康检查：

```bash
curl http://127.0.0.1:3001/api/health
```

## 环境变量

```env
PORT=3001
HOST=127.0.0.1
DATABASE_PATH=./data/sanguo.sqlite
SESSION_SECRET=change-me
CORS_ORIGIN=*

DEEPSEEK_API_KEY=your-api-key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_THINKING=disabled
DEEPSEEK_TIMEOUT_MS=12000
```

不要把 `.env` 提交到仓库。

## 服务器更新

服务器仓库目录默认：

```text
/opt/1panel/www/sites/sanguogame/backend
```

前端静态目录默认：

```text
/opt/1panel/www/sites/sanguogame/index
```

第一次使用：

```bash
cd /opt/1panel/www/sites/sanguogame/backend
git pull
chmod +x deploy.sh
./deploy.sh
```

以后每次更新：

```bash
cd /opt/1panel/www/sites/sanguogame/backend
./deploy.sh
```

脚本会自动执行：

- 拉取 GitHub 最新代码
- 同步 `index.html`、`css/`、`js/`、`assets/` 到静态网站目录
- 用 PM2 启动或重启 `sanguo-backend`
- 请求 `/api/health` 检查后端状态

## 数据存储

后端使用 SQLite。默认数据库位置：

```text
data/sanguo.sqlite
```

服务器上通常是：

```text
/opt/1panel/www/sites/sanguogame/backend/data/sanguo.sqlite
```

主要表：

- `users`：账号用户和游客用户
- `sessions`：登录会话
- `saves`：玩家游戏存档
- `ai_requests`：AI 请求记录

备份时重点备份：

```bash
cp /opt/1panel/www/sites/sanguogame/backend/data/sanguo.sqlite /opt/1panel/www/sites/sanguogame/sanguo-backup.sqlite
```

## API 概览

认证：

- `POST /api/auth/guest`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

存档：

- `GET /api/saves`
- `GET /api/saves/:slot`
- `PUT /api/saves/:slot`
- `DELETE /api/saves/:slot`

AI：

- `POST /api/ai/chat`
- `POST /api/ai/dialogue`

更多细节见 [server/README.md](server/README.md)。

## AI 设计原则

AI 只负责文本和轻量状态解释，不直接决定核心玩法结果。

- 可以生成 NPC 对话、任务文本、事件叙述
- 可以读取角色设定 JSON 后输出符合人设的回复
- 不直接改兵力、税收、战斗胜负、交易结果
- 游戏数值仍由前端/后端确定性逻辑处理

一句话：AI 是军师嘴替，不是天命骰子。