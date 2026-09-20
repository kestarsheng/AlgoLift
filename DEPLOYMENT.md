# AlgoLift 生产部署指南

本文档说明 AlgoLift 项目在 Vercel（前端）和 Render（后端）上的生产部署配置。

## 技术栈

- **前端**: Vue 3 + Vite + TypeScript + Pinia + Vue Router + Tailwind CSS + Axios
- **后端**: Node.js + Express + TypeScript + Prisma + PostgreSQL
- **数据库**: Neon (PostgreSQL)

---

## 1. Vercel 前端配置

### 1.1 Vercel 项目设置

在 Vercel Dashboard 中导入项目后，配置如下：

| 配置项 | 值 |
|--------|-----|
| Root Directory | `frontend` |
| Framework Preset | `Vite` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### 1.2 环境变量

在 Vercel 项目设置中添加以下环境变量：

| 环境变量 | 值 | 说明 |
|----------|-----|------|
| `VITE_API_BASE_URL` | `https://algolift-backend.onrender.com/api` | 指向 Render 后端地址 |

> **注意**: 环境变量名前缀必须是 `VITE_`，Vite 才会将其注入到客户端代码中。

### 1.3 vercel.json 配置

项目已包含 `frontend/vercel.json`，配置了 API 代理：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://algolift-backend.onrender.com/api/$1"
    }
  ]
}
```

此配置将 `/api/*` 请求代理到 Render 后端。

---

## 2. Render 后端配置

### 2.1 Render 项目设置

在 Render Dashboard 中创建新的 Web Service：

| 配置项 | 值 |
|--------|-----|
| Root Directory | `backend` |
| Environment | `Node` |
| Region | `Singapore` (推荐) |
| Build Command | `npm install && npx prisma generate && npm run build` |
| Start Command | `npm start` |

### 2.2 环境变量

在 Render 项目设置中添加以下环境变量：

| 环境变量 | 值 | 说明 |
|----------|-----|------|
| `NODE_ENV` | `production` | 生产环境标识 |
| `PORT` | `10000` | Render 分配的端口 |
| `DATABASE_URL` | (Neon 连接串) | 见下方 Neon 配置 |
| `JWT_SECRET` | (随机字符串) | JWT 签名密钥 |

### 2.3 render.yaml 配置

项目已包含 `backend/render.yaml`，可直接在 Render Dashboard 中通过 YAML 导入：

```yaml
services:
  - type: web
    name: algolift-backend
    env: node
    region: singapore
    buildCommand: npm install && npx prisma generate && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: PORT
        value: 10000
    autoDeploy: false
```

> **注意**: `DATABASE_URL` 和 `JWT_SECRET` 设置为 `sync: false`，首次部署时需要在 Render Dashboard 中手动输入。

---

## 3. Neon 数据库配置

### 3.1 连接串格式

Neon 提供了两种连接串：

**Pooled Connection (推荐用于生产)**
```
postgresql://username:password@ep-xxx-pooler.c-xxx.aws.neon.tech/neondb?sslmode=require
```

**Direct Connection (开发用)**
```
postgresql://username:password@ep-xxx.c-xxx.aws.neon.tech/neondb?sslmode=require
```

### 3.2 配置说明

- Neon 默认提供 **Pooled Connection**，自动处理连接池，适合生产环境
- 连接串中包含 `?sslmode=require`，确保 SSL 加密连接
- 项目已使用 Prisma，数据库连接由 Prisma Client 管理

### 3.3 生产数据库迁移

后端构建时已包含 `npx prisma generate`，Render 部署时会自动执行 Prisma Client 生成。

首次部署后，如需运行数据库迁移：
```bash
npx prisma migrate deploy
```

---

## 4. 部署流程

### 4.1 部署顺序

**推荐顺序**: 后端 → 前端 → 验证

1. **先部署后端 (Render)**
   - 确保后端服务正常运行
   - 记录后端 URL（如 `https://algolift-backend.onrender.com`）

2. **再部署前端 (Vercel)**
   - 确保 `VITE_API_BASE_URL` 指向正确的后端地址
   - 验证前端构建成功

3. **最后验证**
   - 访问前端 URL，确认页面加载正常
   - 测试登录/注册功能
   - 测试 API 请求是否正常

### 4.2 验证检查清单

- [ ] 前端页面正常加载
- [ ] 后端健康检查 `https://algolift-backend.onrender.com/api/health` 返回正常
- [ ] 用户可以注册/登录
- [ ] API 请求正常返回数据
- [ ] 无 CORS 错误
- [ ] 无 404/500 错误

---

## 5. 环境变量汇总

### 5.1 前端 (Vercel)

| 变量名 | 示例值 |
|--------|---------|
| `VITE_API_BASE_URL` | `https://algolift-backend.onrender.com/api` |

### 5.2 后端 (Render)

| 变量名 | 示例值 |
|--------|---------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `DATABASE_URL` | `postgresql://...` (Neon 连接串) |
| `JWT_SECRET` | 随机生成的密钥字符串 |

---

## 6. 常见问题

### 6.1 CORS 错误

如果前端请求后端时出现 CORS 错误，检查后端 `src/config/env.ts` 中的 `frontendUrl` 配置，确保包含前端 Vercel 域名。

### 6.2 数据库连接失败

- 确认 `DATABASE_URL` 正确（Neon 连接串）
- 确认使用了正确的 SSL 模式 (`sslmode=require`)
- 检查 Neon 控制台中的项目状态

### 6.3 前端 API 请求失败

- 确认 `VITE_API_BASE_URL` 正确指向 Render 后端
- 确认后端服务已启动并可访问

---

## 7. 相关文件

- `frontend/vercel.json` - Vercel 配置
- `backend/render.yaml` - Render 配置
- `backend/src/config/env.ts` - 后端环境变量读取
- `frontend/src/api.ts` - 前端 API 客户端配置
- `.github/workflows/ci.yml` - CI 配置（已适配生产迁移）
