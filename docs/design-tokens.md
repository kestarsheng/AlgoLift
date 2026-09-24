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
| `--success` | 成功状态（一遍过、已完成、稳定） | `#5aad84` |
| `--warning` | 警告状态（进行中、待复习） | `#c4a25a` |
| `--danger` | 危险/错误状态（逾期、失败、优先） | `#c46a6a` |
| `--heat-0` | 热力图空单元格 | `#edf2f9` |
| `--heat-1` | 热力图 1 级（少量） | `#d5e0f2` |
| `--heat-2` | 热力图 2 级 | `#adc2e6` |
| `--heat-3` | 热力图 3 级 | `#7b9dd6` |
| `--heat-4` | 热力图 4 级（最多） | `#4a6dc4` |

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

### 状态色（按主题）

状态色在大多数浅色主题下一致（success `#5aad84`、warning `#c4a25a`、danger `#c46a6a`）；warm/pink 使用偏暖的状态色，slate 的 success 略调为 `#5dad84`。

| 主题 | `--success` | `--warning` | `--danger` |
|---|---|---|---|
| dawn | `#5aad84` | `#c4a25a` | `#c46a6a` |
| warm | `#8fb893` | `#c9a85e` | `#c96e6e` |
| mint | `#5aad84` | `#c4a25a` | `#c46a6a` |
| slate | `#5dad84` | `#c4a25a` | `#c46a6a` |
| orange | `#5aad84` | `#c4a25a` | `#c46a6a` |
| pink | `#8fb893` | `#c9a85e` | `#c96e6e` |
| black | `#5aad84` | `#c4a25a` | `#c46a6a` |
| sky | `#5aad84` | `#c4a25a` | `#c46a6a` |

### 热力图色阶（按主题）

5 级色阶随主题 accent 变化，每个主题独立；`--heat-0` 为空单元格底色，`--heat-4` 为最活跃色（通常对应该主题的 `--color-accent-hover`）。

| 主题 | `--heat-0` | `--heat-1` | `--heat-2` | `--heat-3` | `--heat-4` |
|---|---|---|---|---|---|
| dawn | `#edf2f9` | `#d5e0f2` | `#adc2e6` | `#7b9dd6` | `#4a6dc4` |
| warm | `#f0ebe6` | `#e2d2c5` | `#d0b29c` | `#c48d6b` | `#c06a3f` |
| mint | `#e9f4ee` | `#cde8d8` | `#a0d6b4` | `#68c492` | `#3cb07a` |
| slate | `#ececf5` | `#d3d4ec` | `#aeb1de` | `#8087ce` | `#535abb` |
| orange | `#f1ebe4` | `#e5d3c0` | `#d7b594` | `#ce925e` | `#ce782e` |
| pink | `#f0e9ed` | `#e3ced9` | `#d5a9be` | `#cf7da1` | `#cc487d` |
| black | `#181b22` | `#1b2a2e` | `#234747` | `#2e6e6b` | `#40bfb8` |
| sky | `#e9f1f6` | `#cae1ef` | `#9cc9e3` | `#69acd3` | `#3b9ec7` |

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
