# 分支与提交工作流

仿生产环境的分支模型：所有开发都走分支，不往 `main` 直接堆代码。

## 分支结构

- `main` — 稳定 / 生产分支。只接收来自 `develop` 的发布合并，平时不动。
- `develop` — 集成分支。功能分支从这里切出、合回这里。
- `feat/<slug>` / `fix/<slug>` / `docs/<slug>` / `refactor/<slug>` / `chore/<slug>` — 功能分支，从 `develop` 切出。

## 日常开发流程

1. 从 `develop` 切出功能分支：
   ```bash
   git checkout develop && git pull && git checkout -b feat/<slug>
   ```
2. 实现「一个小功能」，自测通过。
3. 提交（conventional commit）：
   ```bash
   git commit -m "feat: <简短描述>"
   ```
4. 推送分支：
   ```bash
   git push -u origin feat/<slug>
   ```
5. 合回 `develop`：
   ```bash
   git checkout develop && git merge feat/<slug> && git push origin develop
   ```
6. 删除已合并的功能分支（本地 + 远程）。
7. `develop` 稳定后，合并 `main` 做发布：
   ```bash
   git checkout main && git merge develop && git push origin main
   ```

## 提交规范（Conventional Commits）

- 类型：`feat` 新功能 / `fix` 修复 / `docs` 文档 / `refactor` 重构 / `test` 测试 / `chore` 杂项。
- 主题行简洁（中文亦可），正文说明 **为什么**（why）而非 **做了什么**。
- 粒度：一个「小功能」一个提交，而非一个模块一次大提交。

## 注意事项

- 推送 GitHub 走 **SSH**（`git@github.com:kestarsheng/AlgoLift.git`），不用 https（本环境 https 走本地代理会握手失败）。
- `.workbuddy/` 不纳入版本库，仅作为本地项目记忆存在。
