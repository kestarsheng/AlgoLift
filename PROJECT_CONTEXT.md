# 算法学习工作台 · 项目上下文文档

> AlgoLift 是一个面向算法学习者的个人刷题管理工作台，支持题目分类管理、练习记录、错题本、题解笔记、待办与学习进度跟踪，提供数据概览与学习建议。

---

## 1. 技术栈

| 层级 | 技术选型 | 说明 |
|---|---|---|
| 前端 | Vue 3 + Vite + TypeScript + Pinia + Vue Router + Tailwind CSS 4 + Axios + Vitest | `<script setup>` 语法，design-tokens 设计令牌体系，CSS 变量主题切换 |
| 后端 | Node.js + Express + TypeScript + Prisma + JWT + bcrypt + Swagger + Jest | `express.Router()` 分模块，统一错误格式 `{ code, message }` |
| 数据库 | PostgreSQL（Neon，Pooled Connection） | 所有数据库操作通过 Prisma，禁止裸 SQL |
| 鉴权 | JWT + bcrypt | Token 通过 `Authorization: Bearer <token>` 头传递，有效期 7 天 |
| 富文本 | Tiptap + Markdown + Mermaid | 编辑器对标飞书/Notion，渲染经 DOMPurify 清洗 |
| 桌面端 | Electron | 打包为桌面应用，密钥运行时生成 |
| API 文档 | Swagger（swagger-jsdoc + swagger-ui-express） | 每个接口写 `@swagger` JSDoc 注释 |
| CI | GitHub Actions | backend + frontend 两个 job |

---

## 2. 部署架构

| 组件 | 位置 | 说明 |
|---|---|---|
| 前端 | Vercel（Production 跟踪 `main` 分支） | 构建命令 `npm run build`；环境变量 `VITE_API_BASE_URL` 指向 ngrok 后端地址 |
| 后端 | 本地 `localhost:3000`，通过 ngrok 暴露 | 由开发者本机进程提供服务，`ngrok http 3000` |
| 数据库 | Neon | 云端 PostgreSQL，使用 Pooled Connection |

**当前为临时方案**：后端跑在本地，机器关机后线上接口不可用；ngrok 地址每次重启会变，需同步更新 Vercel 环境变量并重新部署。未来计划迁移到腾讯云轻量服务器。

---

## 3. 数据库模型与实体关系

以 `backend/prisma/schema.prisma` 为准，共 11 个模型 + 3 个中间表：

### 3.1 模型清单

| # | 模型 | 表名 | 说明 |
|---|---|---|---|
| 1 | User | users | 用户，含 email、passwordHash、displayName、theme |
| 2 | Category | categories | 分类，按用户隔离，名称唯一 |
| 3 | Problem | problems | 题目，含 title、difficulty、internalNote（Markdown） |
| 4 | PracticeRecord | practice_records | 练习记录，关联题目，含 practicedAt、solvedFirstTry、remark |
| 5 | Wrong | wrongs | 错题，含 title、category（自由文本）、difficulty、review、solutionLinks |
| 6 | Note | notes | 题解笔记，含 title、content（Markdown）、solutionLinks |
| 7 | Todo | todos | 待办，含 title、dueDate、priority（P0/P1/P2）、status、remark |
| 8 | Progress | progresses | 学习进度，含 title、progress（0-100）、progressDate、description |
| 9 | ProblemCategory | problem_categories | 中间表：题目 ↔ 分类（多对多） |
| 10 | ProblemNote | problem_notes | 中间表：题目 ↔ 笔记（多对多） |
| 11 | WrongNote | wrong_notes | 中间表：错题 ↔ 笔记（多对多） |

### 3.2 枚举

| 枚举 | 值 | 用途 |
|---|---|---|
| Difficulty | EASY / MEDIUM / HARD | 题目与错题难度 |
| TodoPriority | P0 / P1 / P2 | 待办优先级 |
| TodoStatus | TODO / IN_PROGRESS / COMPLETED | 待办状态 |

### 3.3 实体关系

```
User (1) ──── (N) Category
User (1) ──── (N) Problem
User (1) ──── (N) PracticeRecord
User (1) ──── (N) Wrong
User (1) ──── (N) Note
User (1) ──── (N) Todo
User (1) ──── (N) Progress

Problem (N) ──── (M) Category    通过 ProblemCategory 中间表
Problem (N) ──── (M) Note        通过 ProblemNote 中间表
Wrong   (N) ──── (M) Note        通过 WrongNote 中间表
Problem (1) ──── (N) PracticeRecord
Problem (1) ──── (N) Wrong       （可选关联，problemId 可为 null）
```

**关键设计点**：
- 所有业务模型均有 `userId` 字段，按用户隔离，查询时带 `where: { userId }` 过滤。
- 多对多关系通过中间表实现（ProblemCategory、ProblemNote、WrongNote），有外键约束和级联删除。
- PracticeRecord 通过 `problemId` 外键关联题目（非标题文本），保证引用完整性。
- Wrong 的 `problemId` 为可选关联（可为 null），删除题目时设为 null（SetNull）。
- Wrong 的 `category` 为自由文本字段，与 Category 模型无关。
- 富文本字段（internalNote、content、review）存储 Markdown 格式。

---

## 4. 用户认证与多租户隔离

### 4.1 认证流程

1. 注册：`POST /api/auth/register`，bcrypt 哈希密码，返回 JWT。
2. 登录：`POST /api/auth/login`，验证密码，返回 JWT。
3. 鉴权中间件：`requireAuth` 解析 `Authorization: Bearer <token>` 头，验证 JWT，注入 `req.auth = { sub, email }`。
4. 当前用户：`GET /api/auth/me`，根据 token 返回用户信息。
5. Token 存储：前端 `localStorage.algolift_token`，Axios 请求拦截器自动附加。
6. 401 处理：前端响应拦截器清理 token 并跳转登录页。

### 4.2 多租户隔离

- 每个用户的数据完全隔离：所有 service 方法首参为 `userId`（来自 `req.auth!.sub`）。
- 所有 Prisma 查询都带 `where: { userId }` 条件。
- 关联资源操作（如关联笔记）校验目标资源属于当前用户，否则返回 403/404。
- 删除操作通过 `where: { id, userId }` 确保只能删除自己的数据。
- 速率限制：注册 10 次/小时/IP，登录 20 次/15 分钟/IP。

---

## 5. 核心功能模块

| 模块 | 后端路由 | 前端页面 | 说明 |
|---|---|---|---|
| 用户认证 | `/api/auth/*` | /login, /register | 注册、登录、当前用户 |
| 分类 | `/api/categories/*` | /categories | 分类 CRUD，题目分类管理 |
| 题目 | `/api/problems/*` | /categories, /problems/:id | 题目 CRUD，练习记录，笔记关联 |
| 练习记录 | `/api/problems/:id/practice-records` | 题目详情内 | 记录练习日期、一遍做对、备注 |
| 错题 | `/api/wrongs/*` | /wrongs, /wrongs/:id | 错题 CRUD，错因复盘，题解链接 |
| 错题-笔记关联 | `/api/wrongs/:id/notes` | 错题详情内 | 关联题解笔记 |
| 笔记 | `/api/notes/*` | /notes, /notes/:id | 笔记 CRUD，关联错题聚合查询 |
| 待办 | `/api/todos` | /todos | 待办 CRUD，逾期标记 |
| 学习进度 | `/api/progresses` | /progress | 进度 CRUD，百分比展示 |
| 数据概览 | `/api/stats/dashboard` | /dashboard | 难度分布、热力图、正确率 |
| 学习建议 | `/api/stats/suggestions` | /dashboard | 基于真实数据生成建议 |
| 全局搜索 | `/api/search` | 顶部搜索栏 | 题目/错题/笔记/待办分组搜索 |
| 笔记关联错题 | `/api/notes/:id/wrongs` | 笔记详情内 | 聚合查询消除 N+1 |

---

## 6. 用户操作流程

**刷题练习**：分类看板 → 分类题目列表 → 题目详情（内部笔记、练习记录、关联笔记）→ 记一次练习。

**错题本**：错题列表（按分类筛选）→ 错题详情（错因复盘、题解链接、关联笔记）。

**题解笔记**：笔记列表 → 笔记详情（内容编辑、关联题目/错题）。

**待办**：待办列表（逾期标红、按优先级排序）→ 新增/编辑/完成。

**学习进度**：进度卡片列表 → 新增/编辑进度。

**数据概览**：统计卡片 + 难度分布柱状图 + 刷题打卡热力图 + 分类掌握度 + 学习建议。

**全局搜索**：顶部搜索图标 → 输入关键词 → 分组结果下拉 → 点击跳转详情。

---

## 7. 工程化能力

- **数据库迁移**：Prisma Migration，`npx prisma migrate dev` 生成迁移，`migrate deploy` 部署。
- **自动化测试**：后端 Jest 集成测试（supertest + 真实数据库），前端 Vitest（jsdom + @vue/test-utils）。
- **CI/CD**：GitHub Actions，push/PR 自动跑后端（迁移+构建+测试）和前端（构建+测试）。
- **API 文档**：Swagger UI 挂载在 `/api/docs`，由 swagger-jsdoc 自动生成。
- **依赖管理**：精确版本锁定（无 `^` 前缀），lockfile 提交。
- **主题系统**：CSS 变量 + data-theme 属性，8 种主题，localStorage 持久化。
- **桌面端**：Electron 打包，密钥运行时生成，桌面快捷方式 .bat 启动器。
