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
| GET | `/api/notes` | Query：`page`、`pageSize`、`keyword` | `200`：分页笔记列表 | `401` |
| GET | `/api/notes/{noteId}` | Path：`noteId` | `200`：`{ data: Note }` | `404 NOTE_NOT_FOUND` |
| POST | `/api/notes` | JSON：`title`、`content`、`solutionLinks` | `201`：`{ data: Note }` | `400 INVALID_NOTE_INPUT` |
| PATCH | `/api/notes/{noteId}` | JSON：至少一个可编辑字段 | `200`：`{ data: Note }` | `400 INVALID_NOTE_INPUT`、`404 NOTE_NOT_FOUND` |
| DELETE | `/api/notes/{noteId}` | Path：`noteId` | `204` | `404 NOTE_NOT_FOUND` |

`solutionLinks` 为 `{ name, url }[]`，URL 仅支持 HTTP/HTTPS；本模块不提供题目或错题关联接口。

```json
{ "noteIds": ["note-uuid-1", "note-uuid-2"] }
```
