# 算法学习工作台 · 项目开发规范与 SOP

> 本文档为项目强制遵循的开发规范与标准作业流程（SOP）。所有代码提交、接口设计、页面实现均须符合以下约定。

---

## 一、Git 工作流

### 1.1 仓库信息
- **远程仓库地址**：`git@github.com:kestarsheng/AlgoLift.git`
- **主分支**：`main`（保护分支，不允许直接 push，只接受 PR 合并）
- **开发分支**：`develop`（日常集成分支，功能完成后先合并到这里）
- **功能分支**：`feat/xxx`（从 `develop` 切出，完成后合并回 `develop`）
- **修复分支**：`fix/xxx`（从 `develop` 或 `main` 切出，完成后合并回对应分支）
- **发布分支**：`release/x.x.x`（从 `develop` 切出，用于发布前测试，完成后合并到 `main` 和 `develop`）

### 1.2 分支策略
| 分支 | 用途 | 来源 | 合并目标 |
|---|---|---|---|
| `main` | 生产环境代码，永远可部署 | — | — |
| `develop` | 日常开发集成分支 | `main` | `main`（通过 release 分支） |
| `feat/xxx` | 开发新功能 | `develop` | `develop` |
| `fix/xxx` | 修复缺陷 | `develop` 或 `main` | 对应来源分支 |
| `release/x.x.x` | 发布前测试与准备 | `develop` | `main` + `develop` |

### 1.3 提交信息规范
必须遵循 Conventional Commits：
- `feat:` 新增功能 —— 例：`feat: 新增用户注册接口`
- `fix:` 修复缺陷 —— 例：`fix: 修复题目分类关联查询错误`
- `refactor:` 重构 —— 例：`refactor: 重构练习记录的数据模型`
- `style:` 样式调整 —— 例：`style: 调整首页布局为非对称排版`
- `docs:` 文档补充 —— 例：`docs: 补充 API 接口文档`
- `chore:` 构建/依赖更新 —— 例：`chore: 升级 Prisma 到 5.x`

### 1.4 提交与合并流程
1. **提交粒度**：每完成一个可独立运行的小功能，必须提交一次。
2. **提交流程**：每次提交前，必须确保代码能通过编译（`npm run build` 或 `tsc --noEmit`）。
3. **单一职责提交**：一次提交只做一件事，不要混入不相关的修改。
4. **功能开发**：
   - 从 `develop` 切出 `feat/xxx` 分支。
   - 开发完成后，提交并 push 到远程。
   - 发起 PR 合并到 `develop`，PR 描述中说明改了什么、为什么改。
   - 至少 1 人 review 通过后合并。
5. **发布流程**：
   - 从 `develop` 切出 `release/x.x.x`。
   - 在 release 分支上做最终测试和 bug 修复。
   - 测试通过后，合并到 `main` 和 `develop`。
   - 在 `main` 上打 tag：`vx.x.x`。
6. **紧急修复**：
   - 从 `main` 切出 `fix/xxx`。
   - 修复完成后，合并回 `main` 和 `develop`。
   - 在 `main` 上打 tag：`vx.x.x`。

### 1.5 远程仓库操作

**首次推送**：

    git remote add origin git@github.com:kestarsheng/AlgoLift.git
    git branch -M main
    git push -u origin main

**创建 develop 分支**：

    git checkout -b develop
    git push -u origin develop

**日常推送**：

    git add -A
    git commit -m "feat: xxx"
    git push

**拉取最新代码**：

    git pull origin develop

### 1.6 禁止事项
- 禁止直接向 `main` 分支 push 代码。
- 禁止在 `main` 分支上直接开发。
- 禁止提交 `.env`、`node_modules/`、`dist/` 等文件。
- 禁止在一次提交中混入多个不相关的修改。

### 1.7 版本号规范

遵循 Semantic Versioning（语义化版本）：

- `v0.x.x`：开发阶段，API 可能随时变动。
- `v1.0.0`：首个正式版本，API 稳定。
- `v1.x.x`：新增功能，向后兼容。
- `v1.0.x`：修复缺陷，向后兼容。
- `v2.0.0`：不兼容的重大变更。

Git tag 格式：`v1.0.0`、`v1.2.3`，必须带 `v` 前缀。

### 1.8 分支自动命名规则

功能开发前，AI 必须根据任务类型自动生成分支名，不需要询问用户。命名规则如下：

| 任务类型 | 分支前缀 | 示例 |
|---|---|---|
| 新功能 | `feat/` | `feat/user-auth`、`feat/category-crud` |
| 缺陷修复 | `fix/` | `fix/login-validation`、`fix/schema-format` |
| 重构 | `refactor/` | `refactor/auth-service` |
| 文档 | `docs/` | `docs/api-swagger` |
| 配置/构建 | `chore/` | `chore/ci-setup`、`chore/deps-upgrade` |

命名要求：
- 使用英文小写
- 单词之间用短横线 `-` 连接
- 不超过 4 个单词
- 语义清晰，能看出这个分支在做什么

AI 在开始任务前，必须先执行：
1. `git checkout develop`
2. `git pull origin develop`
3. `git checkout -b <自动生成的分支名>`
4. `git push -u origin <自动生成的分支名>`

任务完成后，AI 必须执行：
1. `git checkout develop`
2. `git merge <分支名>`
3. `git push origin develop`
4. 提醒用户是否删除该分支（默认保留，除非用户确认删除）

### 1.9 AI 全自动工作流

本项目采用"AI 全自动模式"。AI 不允许直接 commit 到 `develop` 或 `main`。所有功能开发必须在 `feat/xxx` 分支上完成，然后通过 PR 合并。每次任务，AI 必须自己完成以下全部操作，不需要用户手动执行任何 Git 命令：

1. 根据任务类型，按 1.8 节自动生成分支名。
2. 从 `develop` 切出新分支。
3. 写代码。
4. 写测试（如果适用）。
5. 跑构建和测试，确认通过。
6. `git add -A`
7. `git commit -m "<type>: <描述>"`
8. `git push -u origin <分支名>`
9. 在 GitHub 上开 PR：从 `<分支名>` 合并到 `develop`。
10. 等待 CI 跑绿（`CI / backend` 状态检查通过）。
11. 在 GitHub 上点 "Merge pull request" 完成合并。
12. 删除远程功能分支（PR 页面提供 "Delete branch" 按钮）。
13. 向用户报告：做了什么、测试结果、commit hash、PR 链接。

**唯一例外**：`main` 分支的合并由用户手动执行。AI 只负责合并到 `develop`。

**注意**：由于 `develop` 已配置 Rulesets（禁止直接 push），第 9-11 步必须通过 GitHub PR 完成，不能使用 `git merge` + `git push` 的本地合并方式。

**如果 AI 无法在 GitHub 上开 PR**（例如执行环境不支持 GitHub API 操作），则：
- 推送功能分支到远程后，**停止**，并告知用户："功能分支已推送，请手动在 GitHub 上开 PR。"
- 由用户手动完成 PR 创建、CI 等待、合并。

### 1.10 GitHub 操作规范（AI 全自动）

AI 使用 `gh` CLI 完成以下操作，不需要用户手动：

1. 开 PR：`gh pr create --base develop --head <分支名> --title "<标题>" --body "<描述>"`
2. 查看 CI 状态：`gh pr checks <PR编号>`
3. 等待 CI 通过：`gh pr checks <PR编号> --watch`
4. 合并 PR：`gh pr merge <PR编号> --merge --delete-branch`
5. 如果 CI 失败：`gh run view <run-id> --log-failed`，根据报错修复后重新 push。

如果 `gh` 命令失败（未登录、权限不足等），必须停下来告知用户，不要强行 push。

### 1.11 任务交接规范

每次任务完成后，AI 必须在报告中附上 **"下一个任务的建议 Prompt"**，格式如下：

---

## 下一个任务的建议 Prompt

> 你是一位有 10 年经验的资深全栈工程师。请先阅读项目根目录下的 `AI_SOP.md` 和 `PROJECT_CONTEXT.md`。
>
> **开始前**：
> - `git checkout develop`
> - `git pull origin develop`
> - `git status`（确认工作区干净）
> - 确认当前分支是 `develop`
>
> **本次任务**：<下一个模块的名字>
>
> **背景**（上一个任务完成后，项目当前的状态）：
> - 已完成的模块：<列表>
> - 已有的接口：<列表>
> - 数据库表：<列表>
> - 已有的测试：<列表>
> - 当前的 `develop` commit：<hash>
>
> **需求**：
> <下一个模块的功能描述>
>
> **要求**：
> 1. 先阅读 `PROJECT_CONTEXT.md` 里关于 <实体名> 的描述，以及原型里的使用流程。
> 2. 根据需求，你自行设计接口（路径、方法、请求/响应格式、错误码）。不要参考通用 CRUD 模板。
> 3. 输出接口设计文档，先给我确认，再写代码。
> 4. 我确认后，实现代码 + 测试。
> 5. 遵守 `AI_SOP.md` 第三章、第四章、第六章。
> 6. 按 `AI_SOP.md` 1.9 节执行全自动 Git 工作流。
> 7. 完成后报告：接口设计、测试结果、commit hash、当前 `develop` 状态，以及**下一个任务的建议 Prompt**。

---

**要求**：
- 建议 Prompt 必须是**完整可直接使用的**，不能是"请参考上一条"。
- 必须包含当前项目状态（已完成的模块、已有的接口、测试情况）。
- 必须包含下一个模块的需求描述。
- 如果下一个模块有依赖（比如题目模块依赖分类模块），必须明确说明。

---

## 二、.gitignore 规范

### 2.1 必须忽略的文件与目录
以下内容**绝对不允许提交到 Git 仓库**：

| 类别 | 文件 / 目录 | 原因 |
|---|---|---|
| 依赖 | `node_modules/` | 体积巨大，可通过 `npm install` 还原 |
| 构建产物 | `dist/`、`build/` | 由构建工具生成，不需要版本管理 |
| 环境变量 | `.env`、`.env.*` | 包含密钥、数据库连接串等敏感信息 |
| 操作系统 | `.DS_Store`、`Thumbs.db` | 系统自动生成，与项目无关 |
| 日志 | `*.log`、`npm-debug.log*` | 运行时产生，不需要提交 |
| 测试覆盖率 | `coverage/` | 由测试工具生成 |
| Prisma 本地文件 | `prisma/*.db`、`prisma/migrations/dev.db*` | 本地开发用数据库，不应入库 |
| 缓存 | `.cache/`、`.parcel-cache/`、`.vite/` | 构建缓存，可重新生成 |
| 临时文件 | `*.tmp`、`*.swp` | 编辑器临时文件 |

### 2.2 必须提交的文件
以下内容**必须提交**，不能忽略：
- `package.json`、`package-lock.json`（或 `pnpm-lock.yaml`、`yarn.lock`）—— 锁定依赖版本
- `prisma/schema.prisma` —— 数据库模型定义
- `prisma/migrations/` —— 数据库迁移记录（除本地 `.db` 文件外）
- `.env.example` —— 环境变量模板（不含真实值，只列 key）
- `AI_SOP.md`、`PROJECT_CONTEXT.md` —— 项目规范与上下文

### 2.3 根目录 `.gitignore` 模板

    # 依赖
    node_modules/
    .pnp
    .pnp.js

    # 构建产物
    dist/
    build/
    .vite/
    .cache/

    # 环境变量
    .env
    .env.*
    !.env.example

    # 编辑器
    .vscode/
    .idea/
    *.swp
    *.swo

    # 操作系统
    .DS_Store
    Thumbs.db

    # 日志
    *.log
    npm-debug.log*
    yarn-debug.log*
    yarn-error.log*
    pnpm-debug.log*

    # 测试
    coverage/

    # Prisma 本地数据库
    prisma/*.db
    prisma/*.db-journal

    # 临时文件
    *.tmp
    *.temp

### 2.4 禁止事项
- 禁止提交 `.env` 或任何包含真实密钥的文件。
- 禁止提交 `node_modules/`。
- 禁止提交 `dist/`、`build/` 等构建产物。
- 禁止提交本地数据库文件（如 `dev.db`）。
- 如果某个文件已经被误提交，必须用 `git rm --cached <file>` 从版本控制中移除，并加入 `.gitignore`。

---

## 三、代码风格

### 3.1 模块化
- 每个文件只负责一个功能，不要写超大文件。
- 前后端代码必须严格分离：`frontend/` 目录放 Vue 代码，`backend/` 目录放 Express 代码。
- 共享类型定义（如 API 请求/响应类型）放在 `shared/` 目录，前后端共同引用。

### 3.2 命名规范

| 类别 | 规范 | 示例 |
|---|---|---|
| 变量 / 函数 | `camelCase` | `getUserById` |
| Vue 组件 / 类 | `PascalCase` | `ProblemList.vue` |
| 常量 | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT` |
| 数据库表 / 字段 | `snake_case` | `practice_records` |
| Prisma 模型 | `PascalCase` | `PracticeRecord` |
| API 路由 | `kebab-case` | `/api/practice-records` |

### 3.3 注释
- 每个文件头部必须写一段注释，说明"这个文件是干什么的"。
- 每个复杂函数必须写参数和返回值说明（使用 JSDoc 风格）。

### 3.4 类型安全
- 前后端均使用 TypeScript，禁止使用 `any`。
- 所有函数必须标注参数类型和返回值类型。
- Prisma 生成的类型必须直接使用，不要手动重复定义。

### 3.5 错误处理
- 所有 API 调用必须用 `try/catch` 包裹。
- 后端返回统一的错误格式：`{ code, message }`。
- 前端使用 Axios 拦截器统一处理后端返回的错误。

---

## 四、开发流程（分步执行，禁止一次性生成）

### 第一步：确认需求
- 每次提出一个功能，先用文字描述理解的"输入、输出、依赖关系"。
- 经确认后再写代码，不猜需求。

### 第二步：先写数据模型
- 如涉及新实体，先输出 Prisma Schema。
- 经确认后执行 `npx prisma migrate dev` 生成迁移。
- 禁止直接手动修改数据库，所有变更必须通过 Prisma Migration。

### 第三步：先写接口，再写页面
- 后端 API 必须先用 Postman 或 Swagger UI 测试通过，再写前端。
- 每个 API 必须用 JSDoc 风格的 @swagger 注释描述请求参数、响应格式和错误码，由 swagger-jsdoc 自动生成 Swagger UI

### 第四步：小步提交
- 每完成一个小模块，主动提醒执行 `git add` 和 `git commit`。

---

## 五、UI/UX 规范

### 5.1 风格
- 工程笔记本 / 极简编辑风。
- 支持主题配色切换：用户可在「设置」中自由切换以下 8 种配色：
  粉、黄、橙、蓝、绿、棕、灰、黑。
- 配色只换颜色，不换布局、不换字体、不换圆角、不换边框风格。

### 5.2 配色系统（8 种主题）

每种主题包含 5 个颜色变量：
- `bg`：背景色（极浅，带主色调）
- `text`：主文字色（深色，带主色调）
- `accent`：强调色（饱和度适中，不刺眼）
- `accentLight`：浅强调色（用于标签背景、hover 态）
- `border`：边框色（浅灰，带主色调）

| 主题 | bg | text | accent | accentLight | border |
|---|---|---|---|---|---|
| 粉 | `#FDF8F6` | `#2D2A2A` | `#B85C6E` | `#F2E4E7` | `#E8DCDE` |
| 黄 | `#FDFBF3` | `#2D2B26` | `#B89B3E` | `#F2EDD9` | `#E8E2CE` |
| 橙 | `#FDF7F0` | `#2D2A26` | `#C26B3A` | `#F2E4D8` | `#E8D9C8` |
| 蓝 | `#F5F8FA` | `#26313A` | `#3E6B8C` | `#DDE8F0` | `#C8D6E0` |
| 绿 | `#F4F9F6` | `#26332B` | `#3E8C5F` | `#DDF0E4` | `#C8E0D2` |
| 棕 | `#FAF6F2` | `#332B26` | `#8C6B4E` | `#EDE0D5` | `#E0D0C0` |
| 灰 | `#F7F7F7` | `#2A2A2A` | `#5C5C5C` | `#E8E8E8` | `#D8D8D8` |
| 黑 | `#1A1A1A` | `#E8E8E8` | `#8C8C8C` | `#2A2A2A` | `#333333` |

**所有主题必须遵循的约束：**
- 禁止使用紫色渐变。
- 禁止使用亮粉色（如 `#FF69B4`）或任何高饱和度荧光色。
- 背景色必须是极浅（或极深，如黑色主题），不能是大面积中等饱和度的颜色。
- 强调色饱和度适中，不能刺眼。
- 黑色主题是唯一例外：背景深、文字浅，但依然保持极简和克制。

### 5.3 字体
- 标题：Space Grotesk（从 Google Fonts 引入）
- 正文：system-ui
- 字体不随主题切换而改变。

### 5.4 布局
- 非对称排版，避免居中大标题。
- 左侧内容区 + 右侧信息栏。
- 优先使用 CSS Grid 或 Flexbox，避免绝对定位。
- 布局不随主题切换而改变。

### 5.5 细节
- 圆角不超过 4px。
- 用 1px 边框代替阴影。
- 所有组件必须支持移动端响应式（至少 375px 宽度可用）。
- 细节不随主题切换而改变。

### 5.6 主题切换实现要求
- 使用 CSS 变量（CSS Custom Properties）定义所有颜色，挂在 `:root` 或 `[data-theme="xxx"]` 上。
- 主题切换时，只改变 CSS 变量的值，不重写任何样式。
- 用户选择的主题必须持久化到 `localStorage`，刷新后保持。
- 主题切换入口放在「设置」页面或顶部导航栏。
- 切换动画不超过 200ms，避免花哨的过渡效果。
- 默认主题为「蓝」，用户首次访问时使用默认主题。

---

## 六、技术栈约束

| 层级 | 技术选型 | 约束 |
|---|---|---|
| 前端 | Vue 3 + Vite + TypeScript | 使用 `<script setup>` 语法 |
| 前端样式 | Tailwind CSS | 禁止写自定义 CSS 文件，全部用 Tailwind 类 |
| 前端状态 | Pinia | 每个模块一个 Store，禁止全局巨型 Store |
| 前端路由 | Vue Router | 使用懒加载路由 |
| 后端 | Node.js + Express + TypeScript | 使用 `express.Router()` 分模块 |
| ORM | Prisma | 所有数据库操作必须通过 Prisma，禁止裸 SQL |
| 数据库 | PostgreSQL (Neon) | 使用 Neon 提供的 Pooled Connection String |
| 鉴权 | JWT + bcrypt | Token 存 httpOnly Cookie 或 Authorization Header |
| API 文档 | Swagger | 每个接口必须写 Swagger 注释 |
| 部署（前端） | Vercel | 构建命令 `npm run build` |
| 部署（后端） | Render | 注意冷启动，环境变量通过 Render Dashboard 配置 |
| CI/CD | GitHub Actions | 每次 push 到 `main` 自动跑 lint + test |
| 主题系统 | CSS 变量 + data-theme 属性 | 颜色全部用 CSS 变量，禁止硬编码颜色值；所有组件必须通过 var(--color-xxx) 引用颜色 |
| 主题持久化 | localStorage | 用户选择的主题必须持久化 |

---

## 七、沟通与反馈

1. 如果不确定需求，先提问，不要猜测。
2. 如果发现需求有技术风险（性能、安全）或更好建议，主动提醒。
3. 每次生成代码后，概括总结改了什么、为什么这么改。

---

## 八、环境变量管理

### 8.1 本地开发
- 根目录创建 `.env`，从 `.env.example` 复制并填入真实值。
- `.env` 必须加入 `.gitignore`，绝不提交。
- `.env.example` 只列 key，不填真实值，必须提交。

### 8.2 后端（Render）
- 在 Render Dashboard → Environment 中配置所有环境变量。
- 必须配置：`DATABASE_URL`、`JWT_SECRET`、`PORT`。
- 使用 Neon 的 Pooled Connection String 作为 `DATABASE_URL`。

### 8.3 前端（Vercel）
- 在 Vercel Project Settings → Environment Variables 中配置。
- 必须配置：`VITE_API_BASE_URL`（指向 Render 后端地址）。

### 8.4 命名规范
- 后端环境变量：`UPPER_SNAKE_CASE`（如 `DATABASE_URL`）。
- 前端环境变量：必须以 `VITE_` 开头（如 `VITE_API_BASE_URL`）。

### 8.5 `.env.example` 示例

    # 后端
    DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
    JWT_SECRET="your-secret-key"
    PORT=3000

    # 前端
    VITE_API_BASE_URL="http://localhost:3000/api"

---

## 九、数据库迁移流程

### 9.1 本地开发流程
1. 修改 `backend/prisma/schema.prisma`。
2. 执行 `npx prisma migrate dev --name <描述>` 生成迁移文件。
3. 检查 `prisma/migrations/` 下生成的 SQL 文件，确认无误。
4. 执行 `npx prisma generate` 更新 Prisma Client。

### 9.2 生产部署流程
1. 在 Render 的部署命令中加入 `npx prisma migrate deploy`。
2. 禁止在生产环境执行 `migrate dev`。

### 9.3 禁止事项
- 禁止手动修改数据库表结构。
- 禁止删除 `prisma/migrations/` 下的迁移文件。
- 禁止在迁移文件生成后手动修改 SQL（如需修改，回滚后重新生成）。