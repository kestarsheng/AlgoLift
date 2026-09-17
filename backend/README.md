# AlgoLift Backend

Node.js、Express、TypeScript、Prisma 和 PostgreSQL（Neon）后端骨架。

## 1. 安装依赖

在 `backend/` 目录执行：

```bash
npm install
```

## 2. 配置环境变量

确认 `backend/.env` 已存在，并配置以下变量：

```env
DATABASE_URL="你的 Neon pooled connection string"
JWT_SECRET="长度足够的随机字符串"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

不要将 `.env` 提交到 Git；可参考 `.env.example`。

## 3. 生成 Prisma Client

```bash
npm run prisma:generate
```

首次创建或修改数据库结构时，在 `backend/` 目录执行：

```bash
npm run prisma:migrate -- --name init
```

生产环境只执行：

```bash
npm run prisma:deploy
```

## 4. 构建项目

```bash
npm run build
```

## 5. 启动开发服务器

```bash
npm run dev
```

默认地址为 `http://localhost:3000`，健康检查接口为 `GET /api/health`，Swagger UI 为 `http://localhost:3000/api/docs`。

## 6. 其他命令

```bash
npm run lint
npm start
```
