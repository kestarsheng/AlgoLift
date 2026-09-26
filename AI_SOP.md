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

AI 必须自己完成以下全部操作，不需要用户手动执行任何 Git 或 GitHub 命令：

1. 根据任务类型，按 1.8 节自动生成分支名。
2. 从 `develop` 切出新分支。
3. 写代码。
4. 写测试（如果适用）。
5. 跑构建和测试，确认通过。
6. `git add -A`
7. `git commit -m "<type>: <描述>"`
8. `git push -u origin <分支名>`
9. `gh pr create --base develop --head <分支名> --title "<标题>" --body "<描述>"`
10. `gh pr checks --watch`，等 CI 跑绿。
11. `gh pr merge <PR编号> --merge --delete-branch`
12. `git checkout develop`
13. `git pull origin develop`
14. `git branch -d <分支名>`
15. 向用户报告：做了什么、测试结果、commit hash、PR 链接、当前 `develop` 状态。

**唯一例外**：`main` 分支的合并由用户手动执行。AI 只负责合并到 `develop`。

**如果 CI 失败**：用 `gh run view <run-id> --log-failed` 看报错，修复后重新 push，再等 CI。

**如果 `gh pr merge` 被 Rulesets 阻挡**：停下来告知用户，不要用 `--admin`。

### 1.9.1 生产发布（人工拍板）

AI 完成功能开发后，按 1.9 节合并到 `develop`，**然后停下来**。

**不要自动合并到 `main`。**

合并到 `main` 必须由用户明确指令触发。用户说“发布”或“合并到 main”时，AI 才执行：

1. `gh pr create --base main --head develop --title "release: <描述>" --body "<描述>"`
2. `gh pr checks --watch`
3. `gh pr merge --merge`（不加 `--delete-branch`）
4. `git checkout main && git pull origin main`
5. `git tag -a v0.1.x -m "<描述>" && git push origin v0.1.x`
6. `git checkout develop`
7. 报告：PR 链接、tag、Vercel 部署状态。

### 1.10 GitHub 操作规范（AI 全自动）

AI 使用 `gh` CLI 完成以下操作，不需要用户手动：

1. 开 PR：`gh pr create --base develop --head <分支名> --title "<标题>" --body "<描述>"`
2. 查看 CI 状态：`gh pr checks <PR编号>`
3. 等待 CI 通过：`gh pr checks <PR编号> --watch`
4. 合并 PR：`gh pr merge <PR编号> --merge --delete-branch`
5. 如果 CI 失败：`gh run view <run-id> --log-failed`，根据报错修复后重新 push。

如果 `gh` 命令失败（未登录、权限不足等），必须停下来告知用户，不要强行 push。

### 1.11 任务交接规范

每次任务完成后，AI 必须在报告中附上**"下一个任务的建议 Prompt"**。

**强制要求**：这个 Prompt 必须是**完整、可直接复制使用**的，不能是"请参考上一条"或"压缩摘要"。必须包含以下 5 个部分：

**1. 开始前命令**（原样复制）：

    git checkout develop
    git pull origin develop
    git status
    确认当前分支是 develop

**2. 背景**（完整列出）：
- 已完成模块：<列出所有已完成的模块>
- 已有接口：见 `docs/API.md`
- 数据库表：<列出所有表>
- 已有测试：<套件数、测试数、通过率>
- 当前 develop commit：<hash>

**3. 本次任务**：<一句话描述要做什么>

**4. 需求**：
<编号列出具体需求，至少 5 条>

**5. 要求**：
- 遵守 `AI_SOP.md` 第三章、第四章、第六章。
- 按 `AI_SOP.md` 1.9 节执行全自动 Git 工作流。
- 按 `AI_SOP.md` 1.11 节，更新 `docs/API.md`。
- 完成后报告：接口清单、测试结果、commit hash、PR 链接、当前 `develop` 状态，以及**下一个任务的建议 Prompt（同样按本节格式）**。

**禁止**：
- 禁止输出"请参考上一条"。
- 禁止输出压缩摘要。
- 禁止省略背景信息。
- 禁止写"从 develop 创建功能分支"这种模糊描述，必须写完整的 Git 命令。

### 1.12 生产发布规范

功能开发完成并合入 `develop` 后，**不会自动上线**。要上线，必须把 `develop` 合到 `main`：

1. 开 PR：`develop` → `main`。
2. 等 CI 绿。
3. 合并。
4. Vercel 自动触发 Production 部署。
5. 在 `main` 上打 tag（版本号）。

**注意：AI 只负责开 PR，不自动合并到 `main`。生产发布由用户手动确认后合并。**

> **为什么必须有这一步**：Vercel 的 **Production 环境跟踪 `main` 分支**。合入 `develop` 只会产生 Preview 部署，**线上不会发生任何变化**。也就是说，只合到 `develop` 的修复，线上永远不会生效。

**AI 侧（只做到第 1 步，然后停下）**：

    git checkout develop
    git pull origin develop
    gh pr create --base main --head develop --title "<标题>" --body-file <描述文件>

开完 PR 后，AI 必须向用户报告 PR 链接并**等待用户自行合并**，不得代为合并到 `main`。

**用户侧（第 2–5 步）**：

    gh pr checks <PR编号> --watch
    gh pr merge <PR编号> --merge
    git checkout main
    git pull origin main
    git tag vX.Y.Z
    git push origin vX.Y.Z

**与 1.2 / 1.4 中 `release/x.x.x` 分支的关系**：`release/x.x.x` 分支目前**未实际使用**。已有的两次发布（`v0.1.0` 对应 PR #40、`v0.1.1` 对应 PR #43）都是 `develop` 直接合到 `main` 后打 tag，即上面的 5 步流程。1.4 的 release 分支流程可作为将来需要“发布前冻结”时的备选。

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
- 禁止提交 `frontend/.env.electron`（本地 Electron 配置，含本地环境变量）。
- 禁止提交 `electron/node_modules/`、`electron/dist/`（Electron 依赖与打包产物）。
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

### 3.6 前端代码规范

- Vue 3 统一使用 `<script setup>` 语法，不使用 Options API。
- 每个业务模块独立 Pinia Store，禁止全局巨型 Store。
- Vue Router 使用懒加载，形如 `component: () => import('./views/Xxx.vue')`。
- Tailwind 工具类优先，禁止新增自定义 CSS 文件（全项目只保留 `frontend/src/style.css` 一个全局样式入口）。
- 颜色使用主题 CSS 变量，禁止硬编码颜色值。
- 禁止使用 `any`。

### 3.7 依赖版本约束（前后端通用）

- **禁止使用 `"latest"` 作为依赖版本**：`package.json` 中所有 `dependencies` 与 `devDependencies` 必须写**精确版本号**（形如 `"1.20.0"`），不得出现 `"latest"`、`"*"`、`"x"` 等浮动标记。
- **禁止使用脱字符 `^` 或波浪号 `~` 范围**：例如 `"^5.22.0"`、`"~4.3.3"` 一律不允许，必须改为对应的精确版本。范围语义会让 `npm install` 在不同时间拉到不兼容的新版本，破坏 CI 可复现性（典型事故：`undici 8` 与 Node 20 冲突即由 `"latest"` 引入）。
- **版本来源**：固定版本时，以当前 `package-lock.json` 中实际安装的精确版本为准（`packages["node_modules/<pkg>"].version`），不得凭空填写。
- **lockfile 必须提交**：`package-lock.json` 与 `package.json` 必须成对提交，且二者完全一致。修改 `package.json` 版本后，必须删除旧 lockfile 重新 `npm install` 生成全新 lockfile，再提交。
- **升级依赖时**：先在分支上单独把目标包改为新精确版本，跑通构建+测试+CI 后再合并；禁止批量 `"latest"` 升级。
- **CI Node 版本与依赖联动**：若某依赖（如 `jsdom` → `undici`）要求更高版本的 Node，应在 `.github/workflows/ci.yml` 对应 job 中显式声明，并在升级该依赖时同步检查。

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

### 6.1 实际技术栈

| 层级 | 技术选型 | 约束 |
|---|---|---|
| 前端 | Vue 3 + Vite + TypeScript + Pinia + Vue Router + Tailwind CSS + Axios + Vitest | 详见 3.6 前端代码规范 |
| 后端 | Node.js + Express + TypeScript + Prisma + JWT + bcrypt + Swagger + Jest | 使用 `express.Router()` 分模块 |
| 数据库 | PostgreSQL（Neon，Pooled Connection） | 使用 Neon 的 Pooled Connection String；所有数据库操作必须通过 Prisma，禁止裸 SQL |
| 鉴权 | JWT + bcrypt | Token 通过 `Authorization: Bearer <token>` 头传递 |
| API 文档 | Swagger（swagger-jsdoc + swagger-ui-express） | 每个接口必须写 Swagger 注释 |
| 前端部署 | Vercel（**Production 跟踪 `main`**） | 构建命令 `npm run build`；发布流程见 1.12 |
| 后端部署 | **本地 + ngrok（临时方案，待迁移到腾讯云轻量服务器）** | 见 6.2 当前部署架构 |
| CI | GitHub Actions | **含 `backend` 与 `frontend` 两个 job**：后端跑迁移+构建+Jest；前端跑 `npm ci` + `npm run build` + Vitest |
| 主题系统 | CSS 变量 + data-theme 属性 | 颜色全部用 CSS 变量，禁止硬编码颜色值；所有组件必须通过 var(--color-xxx) 引用颜色 |
| 主题持久化 | localStorage | 用户选择的主题必须持久化 |

### 6.2 当前部署架构

| 组件 | 位置 | 说明 |
|---|---|---|
| 前端 | Vercel | 环境变量 `VITE_API_BASE_URL` 指向 ngrok 后端地址 |
| 后端 | 本地 `localhost:3000`，通过 ngrok 暴露 | 由开发者本机进程提供服务，命令形如 `ngrok http 3000` |
| 数据库 | Neon | 云端 PostgreSQL，使用 Pooled Connection |

**临时方案的限制（必须知道）**：

- **电脑必须开机**：后端跑在本地，机器关机或休眠后，线上接口全部不可用（前端会统一显示「请求失败」）。
- **ngrok 地址每次重启会变**：免费版 ngrok 每次启动分配新的随机域名，地址一变前端就失联，**必须同步更新 Vercel 的 `VITE_API_BASE_URL` 并重新部署**（见 8.3）。
- **请求依赖 ngrok 专用请求头**：`frontend/src/api.ts` 的请求拦截器附加了 `ngrok-skip-browser-warning: true`，用于绕过 ngrok 免费版给浏览器型请求返回的 HTML 插页。**迁移到自建后端后，这个头应当一并移除。**
- **前端已进 CI**：`.github/workflows/ci.yml` 含 `frontend` job，每次 push/PR 自动跑 `npm ci` + `npm run build` + `npm test`（Vitest）。

**未来计划**：把后端迁移到**腾讯云轻量服务器**，形成稳定的公网地址。届时建议前端改为同源 `/api`（删掉 `VITE_API_BASE_URL`），由 `frontend/vercel.json` 的 rewrite 在 Vercel 边缘做服务端代理，从根上消除跨源 CORS 问题。

---

## 七、沟通与反馈

1. 如果不确定需求，先提问，不要猜测。
2. 如果发现需求有技术风险（性能、安全）或更好建议，主动提醒。
3. 每次生成代码后，概括总结改了什么、为什么这么改。

---

## 八、环境变量管理

### 8.1 本地开发
- 后端：`backend/.env`，从 `backend/.env.example` 复制并填入真实值。
- 前端：`frontend/.env` 可选。本地开发留空即可，Vite 开发服务器会把 `/api` 代理到 `http://localhost:3000`（见 `frontend/vite.config.ts` 的 `server.proxy`）。
- `.env` 必须加入 `.gitignore`，绝不提交。
- `.env.example` 只列 key，不填真实值，必须提交。

### 8.2 后端（本地 + ngrok）

后端当前跑在开发者本机的 `localhost:3000`，通过 ngrok 隧道暴露到公网。

- 本地变量写在 `backend/.env`（从 `backend/.env.example` 复制），绝不提交。
- 必须配置：`DATABASE_URL`、`JWT_SECRET`、`PORT`，以及 `FRONTEND_URL`（CORS 允许的前端源）。
- 使用 Neon 的 Pooled Connection String 作为 `DATABASE_URL`。
- ngrok 隧道指向本地端口：`ngrok http 3000`。

> **注意**：Render 方案（原 `backend/render.yaml`）**从未启用**，`render.yaml` 已从仓库删除；根目录 `DEPLOYMENT.md` 已重写为「前端 Vercel + 后端本地/ngrok + 数据库 Neon」的真实架构。

### 8.3 前端（Vercel）

- 在 Vercel Project Settings → Environment Variables 中配置。
- 必须配置：`VITE_API_BASE_URL`，**指向 ngrok 暴露的后端地址 + `/api`**（例如 `https://<xxx>.ngrok-free.dev/api`）。

**`VITE_API_BASE_URL` 说明**：

- 该变量是**构建期**注入的，前端通过 `import.meta.env.VITE_API_BASE_URL` 读取（见 `frontend/src/api.ts`），会被打进 JS 产物。
- **ngrok 地址变了，必须修改这个环境变量并重新部署。** 仅修改变量不会自动生效——因为值是构建期写死的，必须**重新触发一次部署**（Vercel 上的 Redeploy，或推一个新提交）才会重新构建。
- 未设置该变量时，`frontend/src/api.ts` 会回落到同源相对路径 `/api`，此时由 `frontend/vercel.json` 的 rewrite 在 Vercel 边缘代理到后端。
- **`frontend/vercel.json` 里 `/api` rewrite 的 destination 使用环境变量 `BACKEND_ORIGIN`**（`https://${BACKEND_ORIGIN}/api/$1`，通过 `env` 字段声明）。在 Vercel 上配置 `BACKEND_ORIGIN` 为当前 ngrok 域名（不带 `https://`）即可，无需写死在代码里；ngrok 地址变化时只需更新 Vercel 环境变量并重新部署。

### 8.4 命名规范
- 后端环境变量：`UPPER_SNAKE_CASE`（如 `DATABASE_URL`）。
- 前端环境变量：必须以 `VITE_` 开头（如 `VITE_API_BASE_URL`）。

### 8.5 `.env.example` 示例

    # 后端（backend/.env.example）
    DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
    JWT_SECRET="replace-with-a-long-random-secret"
    PORT=3000
    FRONTEND_URL="http://localhost:5173"

    # 前端（frontend/.env.example）
    # 本地开发可留空，默认走 Vite 开发服务器的 /api 代理
    # VITE_API_BASE_URL="http://localhost:3000/api"

---

## 九、数据库迁移流程

### 9.1 本地开发流程
1. 修改 `backend/prisma/schema.prisma`。
2. 执行 `npx prisma migrate dev --name <描述>` 生成迁移文件。
3. 检查 `prisma/migrations/` 下生成的 SQL 文件，确认无误。
4. 执行 `npx prisma generate` 更新 Prisma Client。

### 9.2 生产数据库迁移流程
1. 对生产库（Neon）执行 `npx prisma migrate deploy`。
2. 禁止在生产环境执行 `migrate dev`。

### 9.3 禁止事项
- 禁止手动修改数据库表结构。
- 禁止删除 `prisma/migrations/` 下的迁移文件。
- 禁止在迁移文件生成后手动修改 SQL（如需修改，回滚后重新生成）。
