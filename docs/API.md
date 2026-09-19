# AlgoLift API

> OpenAPI 3.0.3 接口汇总；服务基础路径为 `/api`。受保护接口使用 `Authorization: Bearer <JWT>`，错误响应统一为 `{ "code": "...", "message": "..." }`。

## 目录

- [通用约定](#通用约定)
- [Health](#health)
- [Auth](#auth)
- [Category](#category)
- [Problem](#problem)
- [PracticeRecord](#practicerecord)
- [ProblemNote](#problemnote)
- [Note 题解笔记](#note-题解笔记)
- [Todo 待办](#todo-待办)
- [Progress 学习进度](#progress-学习进度)
- [Wrong 错题](#wrong-错题)
- [WrongNote 错题题解笔记关联](#wrongnote-错题题解笔记关联)

## 通用约定

| 项目 | 约定 |
|---|---|
| JWT | 有效期 7 天；请求头为 `Authorization: Bearer <JWT>` |
| 请求体 | `Content-Type: application/json` |
| 分页 | 默认 `page=1`、`pageSize=20`，最大 100 |
| 难度 | `EASY`、`MEDIUM`、`HARD` |

## Health

| 方法 | 路径 | 鉴权 | 请求参数/请求体 | 响应示例 | 错误码 |
|---|---|---|---|---|---|
| GET | `/api/health` | 无 | 无 | `200`：`{ "status": "ok" }` | 无 |

## Auth

| 方法 | 路径 | 鉴权 | 请求参数/请求体 | 响应示例 | 错误码 |
|---|---|---|---|---|---|
| POST | `/api/auth/register` | 无 | JSON：`email`、`password` 必填；`displayName` 可选 | `201`：`{ "user": User, "token": "jwt" }` | `VALIDATION_ERROR` (400)、`EMAIL_ALREADY_EXISTS` (409) |
| POST | `/api/auth/login` | 无 | JSON：`email`、`password` 必填 | `200`：`{ "user": User, "token": "jwt" }` | `INVALID_CREDENTIALS` (401) |
| GET | `/api/auth/me` | Bearer JWT | 无 | `200`：`User` | `UNAUTHORIZED` (401)、`INVALID_TOKEN` (401)、`USER_NOT_FOUND` (404) |

注册/登录请求体：

```json
{ "email": "alice@example.com", "password": "password123", "displayName": "Alice" }
```

用户响应示例：

```json
{ "id": "uuid", "email": "alice@example.com", "displayName": "Alice", "theme": "BLUE" }
```

## Category

| 方法 | 路径 | 鉴权 | 请求参数/请求体 | 响应示例 | 错误码 |
|---|---|---|---|---|---|
| GET | `/api/categories` | Bearer JWT | Query：`keyword`、`includeEmpty=true` 可选 | `200`：`{ "data": [Category] }` | `UNAUTHORIZED` (401) |
| POST | `/api/categories` | Bearer JWT | JSON：`name` 必填，最长 100 字符 | `201`：`{ "data": Category }` | `VALIDATION_ERROR` (400)、`CATEGORY_NAME_EXISTS` (409) |
| PATCH | `/api/categories/{categoryId}` | Bearer JWT | Path：`categoryId`；JSON：`name` 必填 | `200`：`{ "data": Category }` | `VALIDATION_ERROR` (400)、`CATEGORY_NOT_FOUND` (404)、`CATEGORY_NAME_EXISTS` (409) |
| DELETE | `/api/categories/{categoryId}` | Bearer JWT | Path：`categoryId` | `204`：无响应体 | `CATEGORY_NOT_FOUND` (404) |
| GET | `/api/categories/{categoryId}/problems` | Bearer JWT | Path：`categoryId`；Query：`page`、`pageSize`、`keyword`、`difficulty` 可选 | `200`：题目分页 | `CATEGORY_NOT_FOUND` (404) |
| PUT | `/api/problems/{problemId}/categories` | Bearer JWT | Path：`problemId`；JSON：`categoryIds` 字符串数组，可为空且不可重复 | `200`：分类数组 | `INVALID_CATEGORY_IDS` (400)、`CATEGORY_ACCESS_DENIED` (403)、`PROBLEM_NOT_FOUND` (404) |

```json
{ "name": "数组" }
```

## Problem

| 方法 | 路径 | 鉴权 | 请求参数/请求体 | 响应示例 | 错误码 |
|---|---|---|---|---|---|
| GET | `/api/problems` | Bearer JWT | Query：`page`、`pageSize`、`keyword`、`difficulty`、`categoryId` 可选 | `200`：`{ "data": [Problem], "pagination": Pagination }` | `INVALID_QUERY` (500)、`CATEGORY_NOT_FOUND` (404) |
| POST | `/api/problems` | Bearer JWT | JSON：`title`、`difficulty` 必填；`internalNote`、`categoryIds` 可选 | `201`：题目摘要 | `INVALID_PROBLEM_INPUT` (400)、`CATEGORY_ACCESS_DENIED` (403)、`PROBLEM_TITLE_EXISTS` (409) |
| GET | `/api/problems/{problemId}` | Bearer JWT | Path：`problemId` | `200`：题目详情，含练习记录和笔记 | `PROBLEM_NOT_FOUND` (404) |
| PATCH | `/api/problems/{problemId}` | Bearer JWT | Path：`problemId`；JSON 至少一个字段：`title`、`difficulty`、`internalNote` | `200`：题目摘要 | `INVALID_PROBLEM_INPUT` (400)、`PROBLEM_NOT_FOUND` (404)、`PROBLEM_TITLE_EXISTS` (409) |
| DELETE | `/api/problems/{problemId}` | Bearer JWT | Path：`problemId` | `204`：无响应体 | `PROBLEM_NOT_FOUND` (404) |

```json
{ "title": "Two Sum", "difficulty": "EASY", "internalNote": "使用哈希表", "categoryIds": ["category-uuid"] }
```

## PracticeRecord

前端刷题流程使用分类看板 `/categories`、分类题目列表 `/categories/{categoryId}/problems` 和题目详情 `/problems/{problemId}`；列表支持 `keyword`、`difficulty`、`page`、`pageSize`，详情通过练习记录接口展示日期、首遍正确状态和备注。

前端题目详情页由独立 `problemDetail` 与 `practiceRecord` Pinia Store 驱动：详情加载后展示分类、内部笔记和关联题解笔记；练习记录支持分页、创建和删除，创建成功后回到第 1 页并刷新列表。

题目详情管理流程：编辑标题、难度或内部笔记时调用 `PATCH /api/problems/{problemId}`，分类管理使用 `PUT /api/problems/{problemId}/categories` 替换分类 ID 数组（空数组表示取消全部分类），题解笔记管理使用 `PUT /api/problems/{problemId}/notes` 替换笔记 ID 数组（空数组表示取消全部关联）；两类关联保存成功后重新请求题目详情。删除按钮必须确认后调用 `DELETE /api/problems/{problemId}`，成功后返回来源分类列表（带 `categoryId` 查询参数）或分类看板，失败时保留详情并展示错误。

| 方法 | 路径 | 鉴权 | 请求参数/请求体 | 响应示例 | 错误码 |
|---|---|---|---|---|---|
| GET | `/api/problems/{problemId}/practice-records` | Bearer JWT | Path：`problemId`；Query：`page`、`pageSize` 可选 | `200`：记录分页 | `INVALID_QUERY` (500)、`PROBLEM_NOT_FOUND` (404) |
| POST | `/api/problems/{problemId}/practice-records` | Bearer JWT | JSON：`practicedAt` (`YYYY-MM-DD`)、`solvedFirstTry` 必填；`remark` 可选 | `201`：`{ "data": Record }` | `INVALID_PRACTICE_RECORD` (400)、`PROBLEM_NOT_FOUND` (404) |
| DELETE | `/api/problems/{problemId}/practice-records/{recordId}` | Bearer JWT | Path：`problemId`、`recordId` | `204`：无响应体 | `PRACTICE_RECORD_NOT_FOUND` (404) |

```json
{ "practicedAt": "2026-09-17", "solvedFirstTry": true, "remark": "掌握双指针" }
```

## ProblemNote

| 方法 | 路径 | 鉴权 | 请求参数/请求体 | 响应示例 | 错误码 |
|---|---|---|---|---|---|
| PUT | `/api/problems/{problemId}/notes` | Bearer JWT | Path：`problemId`；JSON：`noteIds` 字符串数组，可为空且不可重复 | `200`：`{ "data": { "problemId": "uuid", "notes": [Note] } }` | `INVALID_NOTE_IDS` (400)、`NOTE_ACCESS_DENIED` (403)、`PROBLEM_NOT_FOUND` (404) |

## Note 题解笔记

| 方法 | 路径 | 请求 | 成功响应 | 错误 |
|---|---|---|---|---|
| GET | `/api/notes` | Query：`page`、`pageSize`、`keyword` | `200`：分页笔记列表；每项额外包含 `problemCount`、`wrongCount` | `401` |
| GET | `/api/notes/{noteId}` | Path：`noteId` | `200`：`{ data: Note }` | `404 NOTE_NOT_FOUND` |
| POST | `/api/notes` | JSON：`title`、`content`、`solutionLinks` | `201`：`{ data: Note }` | `400 INVALID_NOTE_INPUT` |
| PATCH | `/api/notes/{noteId}` | JSON：至少一个可编辑字段 | `200`：`{ data: Note }` | `400 INVALID_NOTE_INPUT`、`404 NOTE_NOT_FOUND` |
| DELETE | `/api/notes/{noteId}` | Path：`noteId` | `204` | `404 NOTE_NOT_FOUND` |

`solutionLinks` 为 `{ name, url }[]`，URL 仅支持 HTTP/HTTPS；本模块不提供题目或错题关联接口。

```json
{ "noteIds": ["note-uuid-1", "note-uuid-2"] }
```

## Todo 待办

优先级为 `P0`、`P1`、`P2`；状态为 `TODO`（待办）、`IN_PROGRESS`（进行中）、`COMPLETED`（已完成）；日期使用 `YYYY-MM-DD`。

| 方法 | 路径 | 请求参数/请求体 | 成功响应 | 错误 |
|---|---|---|---|---|
| GET | `/api/todos` | Query：`status`、`priority`、`overdue`、`keyword`、`page`、`pageSize` 可选 | `200`：`{ data: Todo[], pagination }` | `400 INVALID_QUERY`、`401 UNAUTHORIZED` |
| POST | `/api/todos` | JSON：`title`、`priority` 必填；`dueDate`、`status`、`remark` 可选 | `201`：`{ data: Todo }` | `400 INVALID_TODO_INPUT` |
| GET | `/api/todos/{todoId}` | Path：`todoId` | `200`：`{ data: Todo }` | `404 TODO_NOT_FOUND` |
| PATCH | `/api/todos/{todoId}` | JSON：至少一个可编辑字段：`title`、`dueDate`、`priority`、`status`、`remark` | `200`：`{ data: Todo }` | `400 INVALID_TODO_INPUT`、`404 TODO_NOT_FOUND` |
| DELETE | `/api/todos/{todoId}` | Path：`todoId` | `204`：无响应体 | `404 TODO_NOT_FOUND` |

Todo 响应包含 `isOverdue`：截止日期早于当天且状态不是 `COMPLETED` 时为 `true`；列表按未完成、日期、优先级排序。

## Progress 学习进度

进度值为 `0`–`100` 的整数；`progressDate` 使用 `YYYY-MM-DD`，列表默认按日期倒序。

| 方法 | 路径 | 请求参数/请求体 | 成功响应 | 错误 |
|---|---|---|---|---|
| GET | `/api/progresses` | Query：`keyword`、`page`、`pageSize` 可选 | `200`：`{ data: Progress[], pagination }` | `400 INVALID_QUERY`、`401 UNAUTHORIZED` |
| POST | `/api/progresses` | JSON：`title`、`progress`、`progressDate` 必填；`description` 可选 | `201`：`{ data: Progress }` | `400 INVALID_PROGRESS_INPUT`、`401 UNAUTHORIZED` |
| GET | `/api/progresses/{progressId}` | Path：`progressId` | `200`：`{ data: Progress }` | `401 UNAUTHORIZED`、`404 PROGRESS_NOT_FOUND` |
| PATCH | `/api/progresses/{progressId}` | JSON：至少一个可编辑字段：`title`、`progress`、`progressDate`、`description` | `200`：`{ data: Progress }` | `400 INVALID_PROGRESS_INPUT`、`401 UNAUTHORIZED`、`404 PROGRESS_NOT_FOUND` |
| DELETE | `/api/progresses/{progressId}` | Path：`progressId` | `204`：无响应体 | `401 UNAUTHORIZED`、`404 PROGRESS_NOT_FOUND` |

## Wrong 错题

错题分类为自由文本，与 Category 模块无关；`solutionLinks` 为 `{ name, url }[]`，URL 仅支持 HTTP/HTTPS。

| 方法 | 路径 | 请求参数/请求体 | 成功响应 | 错误 |
|---|---|---|---|---|
| GET | `/api/wrongs` | Query：`page`、`pageSize`、`keyword`、`category`、`difficulty` 可选 | `200`：`{ data: Wrong[], pagination }`；每项额外包含 `noteCount` | `400 INVALID_QUERY`、`401 UNAUTHORIZED` |
| POST | `/api/wrongs` | JSON：`title`、`difficulty`、`solutionLinks` 必填；`problemId`、`category`、`review` 可选 | `201`：`{ data: Wrong }` | `400 INVALID_WRONG_INPUT`、`404 PROBLEM_NOT_FOUND` |
| GET | `/api/wrongs/{wrongId}` | Path：`wrongId` | `200`：`{ data: Wrong }` | `401 UNAUTHORIZED`、`404 WRONG_NOT_FOUND` |
| PATCH | `/api/wrongs/{wrongId}` | JSON：至少一个可编辑字段：`problemId`、`title`、`category`、`difficulty`、`review`、`solutionLinks` | `200`：`{ data: Wrong }` | `400 INVALID_WRONG_INPUT`、`404 WRONG_NOT_FOUND`、`404 PROBLEM_NOT_FOUND` |
| DELETE | `/api/wrongs/{wrongId}` | Path：`wrongId` | `204`：无响应体 | `401 UNAUTHORIZED`、`404 WRONG_NOT_FOUND` |

`problemId` 可在创建或编辑时传入；传入的题目必须属于当前用户，传 `null` 可清除关联。

前端列表页使用 `noteCount` 展示错题关联笔记数量，使用 `problemCount` 和 `wrongCount` 展示题解笔记关联题目与错题数量；这些字段由列表接口通过 Prisma `_count` 聚合返回。

## WrongNote 错题—题解笔记关联

前端 `frontend/src/stores/wrongNote.ts` 封装上述三个接口；错题详情页支持查看、整体替换、清空和解除单条关联。题解笔记详情页通过错题列表与关联查询展示反向关联错题。

| 方法 | 路径 | 请求参数/请求体 | 成功响应 | 错误 |
|---|---|---|---|---|
| GET | `/api/wrongs/{wrongId}/notes` | Path：`wrongId` | `200`：`{ "data": { "wrongId": "uuid", "notes": [Note] } }` | `404 WRONG_NOT_FOUND` |
| PUT | `/api/wrongs/{wrongId}/notes` | Path：`wrongId`；JSON：`noteIds` 字符串数组，可为空且不可重复 | `200`：`{ "data": { "wrongId": "uuid", "notes": [Note] } }` | `400 INVALID_NOTE_IDS`、`403 NOTE_ACCESS_DENIED`、`404 WRONG_NOT_FOUND` |
| DELETE | `/api/wrongs/{wrongId}/notes/{noteId}` | Path：`wrongId`、`noteId` | `204`：无响应体 | `404 WRONG_NOT_FOUND`、`404 WRONG_NOTE_NOT_FOUND` |

以上接口仅允许关联当前用户拥有的 Wrong 和 Note；整体替换为事务操作，校验失败时保留原有关联。
