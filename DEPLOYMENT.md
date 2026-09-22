# AlgoLift 部署指南

本文档描述 AlgoLift 项目当前的**实际部署架构**：

- **前端**：Vercel
- **后端**：本地 `localhost:3000`，通过 ngrok 临时暴露到公网（待迁移到腾讯云轻量服务器）
- **数据库**：Neon（PostgreSQL，Pooled Connection）

> **注意**：本文档已删除未启用的 Render 部署方案（`backend/render.yaml` 已移除）。Render 方案从未投入使用，请勿再参考旧文档。

## 技术栈

- **前端**: Vue 3 + Vite + TypeScript + Pinia + Vue Router + Tailwind CSS + Axios
- **后端**: Node.js + Express + TypeScript + Prisma + PostgreSQL
- **数据库**: Neon (PostgreSQL)

---

## 1. 架构总览

```
┌──────────────┐     同源 /api (rewrite) 或跨源直连      ┌──────────────┐      ┌──────────────┐
│  浏览器/用户   │ ────────────────────────────────────► │  Vercel 前端   │ ───►│  后端(ngrok)  │
└──────────────┘                                       └──────────────┘      └──────┬───────┘
                                                                                     │
                                                                              ┌──────▼───────┐
                                                                              │  Neon 数据库  │
                                                                              └──────────────┘
```

前端有两种访问后端的方式（见下文 1.1 / 1.2），二者**二选一**：

1. **同源 `/api` 方案（推荐，未来固定后端时使用）**：不配置 `VITE_API_BASE_URL`，前端请求相对路径 `/api/*`，由 `frontend/vercel.json` 的 rewrite 在 Vercel 边缘将请求代理到后端真实地址（通过环境变量 `BACKEND_ORIGIN` 指定）。
2. **跨源直连方案（当前使用）**：在 Vercel 配置 `VITE_API_BASE_URL`，使其指向 ngrok 暴露的后端地址 + `/api`（例如 `https://<xxx>.ngrok-free.dev/api`）。此时前端直接请求 ngrok，不走 `vercel.json` 的 rewrite。

> 两种方案不能同时依赖：设置了 `VITE_API_BASE_URL` 时，前端不会发同源 `/api` 请求；未设置 `VITE_API_BASE_URL` 时，才会走 `/api` rewrite。

### 1.1 同源 `/api` 方案（rewrite 代理）

`frontend/src/api.ts` 中 `baseURL` 默认为 `/api`（当未设置 `VITE_API_BASE_URL` 时）。

`frontend/vercel.json` 将该路径重写到一个真实后端地址：

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://${BACKEND_ORIGIN}/api/$1",
      "env": ["BACKEND_ORIGIN"]
    }
  ]
}
```

- `${BACKEND_ORIGIN}` 是 Vercel **运行时环境变量**，在 Vercel Project Settings → Environment Variables 中配置，值为 ngrok 域名（**不带** `https://`，例如 `xxxx.ngrok-free.app`）。
- **ngrok 地址每次重启会变**：地址变了只需修改 Vercel 上的 `BACKEND_ORIGIN` 环境变量，无需改代码；但同源方案会让 Vercel 边缘代理以 Vercel 自身的 User-Agent 请求 ngrok。
- 迁移到腾讯云轻量服务器后，把 `BACKEND_ORIGIN` 指向固定域名（如 `api.algolift.com`）即可，前端代码零改动。

### 1.2 跨源直连方案（当前使用）

当前生产实际使用该方案：

| 环境变量 | 值 | 说明 |
|----------|-----|------|
| `VITE_API_BASE_URL` | `https://<xxx>.ngrok-free.dev/api` | 指向 ngrok 暴露的后端地址 + `/api` |

- 该变量是**构建期**注入的：会被打进 JS 产物，**地址变了必须修改该变量并重新部署**（Redeploy 或推新提交）。
- 因为请求直接跨源发往 ngrok，后端 CORS 必须允许 Vercel 域名（见 `backend/src/config/env.ts` 的 `FRONTEND_URL`）。
- 前端请求拦截器会附加 `ngrok-skip-browser-warning: true` 头，绕过 ngrok 免费版给浏览器型请求返回的 HTML 插页（`ERR_NGROK_6024`）。**迁移到自建固定后端后应移除该头**。

> **历史背景**：`vercel.json` 的 `/api` rewrite 曾长期指向已废弃的 `algolift-backend.onrender.com`（Render，从未启用）。本次已改为环境变量驱动的真实后端地址，旧地址不再被引用。

---

## 2. Vercel 前端配置

### 2.1 Vercel 项目设置

在 Vercel Dashboard 中导入项目后，配置如下：

| 配置项 | 值 |
|--------|-----|
| Root Directory | `frontend` |
| Framework Preset | `Vite` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### 2.2 环境变量

在 Vercel 项目设置中添加以下环境变量（与 1.1 / 1.2 方案对应，**二选一**）：

| 方案 | 环境变量 | 值 |
|------|----------|-----|
| 同源 `/api` | `BACKEND_ORIGIN` | 当前 ngrok 域名，如 `xxxx.ngrok-free.app` |
| 跨源直连 | `VITE_API_BASE_URL` | `https://<xxx>.ngrok-free.dev/api` |

> **注意**：环境变量名前缀必须是 `VITE_`，Vite 才会将 `VITE_API_BASE_URL` 注入到客户端代码中。`BACKEND_ORIGIN` 供 Vercel 边缘 rewrite 运行时替换使用，无需 `VITE_` 前缀。

---

## 3. 后端（本地 + ngrok）部署

### 3.1 启动后端

后端运行在开发者本机：

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy   # 生产库迁移
npm run build
npm start                    # 监听 localhost:3000
```

开发模式可改用 `npm run dev`（`tsx watch`）。

### 3.2 暴露公网（ngrok）

```bash
ngrok http 3000
```

- 免费版每次启动分配**新的随机域名**，域名变了必须同步更新 Vercel 上的 `BACKEND_ORIGIN`（同源方案）或 `VITE_API_BASE_URL`（跨源方案）并重新部署前端。
- **限制**：后端跑在本地，本机关机/休眠后线上接口全部不可用（前端会统一显示「请求失败」）。

### 3.3 后端环境变量

在 `backend/.env` 中配置（从 `backend/.env.example` 复制，**绝不提交**）：

| 变量名 | 说明 |
|--------|------|
| `DATABASE_URL` | Neon Pooled Connection String，如 `postgresql://user:pass@ep-xxx-pooler.aws.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | JWT 签名密钥（随机长字符串） |
| `PORT` | 服务端口，本地为 `3000` |
| `FRONTEND_URL` | CORS 允许的前端源，如 `https://<project>.vercel.app` |

---

## 4. Neon 数据库配置

### 4.1 连接串格式

Neon 提供两种连接串：

**Pooled Connection（推荐用于生产）**
```
postgresql://username:password@ep-xxx-pooler.c-xxx.aws.neon.tech/neondb?sslmode=require
```

**Direct Connection（开发用）**
```
postgresql://username:password@ep-xxx.c-xxx.aws.neon.tech/neondb?sslmode=require
```

### 4.2 配置说明

- Neon 默认提供 **Pooled Connection**，自动处理连接池，适合生产环境。
- 连接串中包含 `?sslmode=require`，确保 SSL 加密连接。
- 项目使用 Prisma，数据库连接由 Prisma Client 管理。

### 4.3 生产数据库迁移

所有数据库变更通过 Prisma Migration 完成。

- 生成迁移：`npx prisma migrate dev --name <描述>`（仅本地开发库）
- 生产环境应用迁移：`npx prisma migrate deploy`
- 禁止在生产环境执行 `migrate dev`。

---

## 5. 部署流程

### 5.1 例行发布（前端改动）

前端发布通过 Git 工作流触发（见 `AI_SOP.md` 1.12）：

1. 合并到 `main`（用户手动合并 `develop → main` 的 PR）。
2. Vercel 自动触发 **Production** 部署（`main` 跟踪生产环境）。
3. 在 `main` 上打 tag：`vX.Y.Z`。

### 5.2 后端变更（本地 + ngrok 场景）

后端没有持续部署：

1. 在本地拉最新代码。
2. `npm install && npx prisma generate && npx prisma migrate deploy`。
3. 重启 `npm start`。
4. 如需线上可达，重启 ngrok 并同步更新 Vercel 环境变量后重新部署前端。

### 5.3 验证检查清单

- [ ] 前端页面正常加载
- [ ] 后端健康检查 `<后端地址>/api/health` 返回正常
- [ ] 用户可以注册/登录
- [ ] API 请求正常返回数据
- [ ] 无 CORS 错误
- [ ] 无 404/500 错误

---

## 6. 环境变量汇总

### 6.1 前端 (Vercel)

| 变量名 | 示例值 | 说明 |
|--------|---------|------|
| `BACKEND_ORIGIN` | `xxxx.ngrok-free.app` | 同源 `/api` 方案的 rewrite 目标域名（运行时替换） |
| `VITE_API_BASE_URL` | `https://xxxx.ngrok-free.dev/api` | 跨源直连方案的构建期后端地址 |

### 6.2 后端 (本地 .env)

| 变量名 | 示例值 |
|--------|---------|
| `DATABASE_URL` | `postgresql://...` (Neon 连接串) |
| `JWT_SECRET` | 随机生成的密钥字符串 |
| `PORT` | `3000` |
| `FRONTEND_URL` | `https://<project>.vercel.app` |

---

## 7. 常见问题

### 7.1 CORS 错误

如果前端请求后端时出现 CORS 错误：

- 跨源直连方案：检查后端 `backend/src/config/env.ts` 的 `FRONTEND_URL` 是否包含前端 Vercel 域名。
- 同源 `/api` 方案：请求由 Vercel 边缘代理发出，不受浏览器 CORS 限制，一般无需处理；但需确认后端 CORS 允许 Vercel 的源（如有）。

### 7.2 数据库连接失败

- 确认 `DATABASE_URL` 正确（Neon Pooled Connection String）。
- 确认使用了正确的 SSL 模式（`sslmode=require`）。
- 检查 Neon 控制台中的项目状态。

### 7.3 前端 API 请求失败

- **「请求失败」并伴随 console CORS 报错**：通常是 ngrok 免费版插页被浏览器拦截。确认 `ngrok-skip-browser-warning` 请求头仍存在（`frontend/src/api.ts`）。
- **连接被拒绝 / 超时**：先后端是否在本机运行（`npm start`）且 ngrok 隧道是否启动。
- **同一部署下偶发失败**：ngrok 域名已变。更新 Vercel 环境变量（`BACKEND_ORIGIN` 或 `VITE_API_BASE_URL`）并重新部署。

### 7.4 迁移到固定服务器（腾讯云轻量）时

1. 把后端部署到公网服务器，得到固定域名（如 `api.algolift.com`）。
2. 前端改回同源 `/api` 方案：删除 `VITE_API_BASE_URL`，在 Vercel 配置 `BACKEND_ORIGIN=api.algolift.com`。
3. 移除 `frontend/src/api.ts` 中的 `ngrok-skip-browser-warning` 请求头。
4. 重新部署前端。

---

## 8. 相关文件

- `frontend/vercel.json` - Vercel 配置（构建命令 / rewrites，含 `/api` 代理）
- `backend/src/config/env.ts` - 后端环境变量读取
- `frontend/src/api.ts` - 前端 API 客户端配置（baseURL、ngrok 请求头）
- `.github/workflows/ci.yml` - CI 配置（backend + frontend 两个 job）