# AlgoLift Design Tokens

> 来源：`prototype/dashboard.html` 概览页原型。主题切换只改变颜色变量，不改变布局、字体、圆角或边框。

## 颜色

| Token | 用途 | dawn 默认值 |
|---|---|---|
| `--color-bg` | 页面背景 | `#f2f6fd` |
| `--color-surface` | 卡片、侧栏背景 | `#ffffff` |
| `--color-surface-topbar` | 顶部栏半透明背景 | `rgba(242,246,253,.88)` |
| `--color-hover` | 悬停、轨道背景 | `#e8eef8` |
| `--color-text` | 主文字 | `#121826` |
| `--color-text-secondary` | 次文字 | `#4d5b73` |
| `--color-text-muted` | 辅助文字 | `#8695ae` |
| `--color-accent` | 强调色、进度条 | `#5f82db` |
| `--color-accent-light` | 标签背景、hover | `#e8effa` |
| `--color-accent-hover` | 强调色悬停态 | `#4a6dc4` |
| `--color-border` | 分隔线、卡片边框 | `#dfe5ef` |

### 八种主题色板

每个主题完整变量（含 surface、文字层级、状态色和 heat0–heat4）均写在 `frontend/src/style.css`。

| 主题 | bg | text | accent | accentLight | border |
|---|---|---|---|---|---|
| dawn（蓝） | `#f2f6fd` | `#121826` | `#5f82db` | `#e8effa` | `#dfe5ef` |
| warm（暖） | `#f8f4f0` | `#2c221e` | `#d48054` | `#f6ede7` | `#e6ddd5` |
| mint（薄荷） | `#f0f9f4` | `#1a2d22` | `#52c48c` | `#e8f7ef` | `#e2ece5` |
| slate（板岩） | `#f2f2f9` | `#1e2230` | `#6870cc` | `#ededf7` | `#e2e3ed` |
| orange（橙） | `#f8f5f1` | `#2c211a` | `#e28a3d` | `#f8efe6` | `#e6ddd4` |
| pink（粉） | `#f7f2f5` | `#2c1c24` | `#db5e93` | `#f8eaf1` | `#e5dbe0` |
| black（黑） | `#0b0c11` | `#e4e5ea` | `#40bfb8` | `#1a2e2e` | `#252832` |
| sky（天蓝） | `#f0f7fb` | `#16222a` | `#50b0d9` | `#e6f2f8` | `#dee7ed` |

## 字体与字号

- 标题：`Space Grotesk`, sans-serif；正文：`Inter`, system-ui；等宽数据：`JetBrains Mono`。
- 页面大标题 `25px`；模块标题 `17px`；主数字 `27px`；首要主数字 `35px`；正文 `16px`；辅助正文 `15px`；小标签 `12px`。

## 间距

- 页面内容：`18px 22px 32px`，移动端 `12px`。
- 模块间距：`14px`；紧凑模块/元素：`8px`。
- 卡片内边距：`14px`；紧凑卡片：`10px 12px`。
- 常规元素间距 `8px`，导航/列表 `10px`，统计信息组 `16px`。

## 圆角与边框

- 卡片、按钮、标签：`3px`；进度条和热力图单元格：`2px`。
- 标准边框：`1px solid var(--color-border)`；复选框：`1.5px`。
- 侧栏 `232px`，顶部栏 `50px`，图标按钮 `32px`，进度条 `5px`，知识卡进度条 `3px`。
- 使用 1px 边框表达层级，不使用阴影。
