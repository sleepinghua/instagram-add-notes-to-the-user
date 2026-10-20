# instagram-add-notes-to-the-user

AI 修复脚本：Instagram - 为用户添加备注(别名/标签)  
原脚本地址：https://greasyfork.org/zh-CN/scripts/387871-instagram-add-notes-to-the-user  
原作者：**pana**（GPL-3.0-or-later）  
修复：sleepinghua

脚本主要用来给 Instagram 用户添加备注名和分组，支持自定义颜色与 WebDAV 同步。

原脚本 2023 年更新，失效多年，等不到可以用的脚本，于是自己 AI 试了试  
大学学的破文科，不会写代码~太残念了 (╯°□°）╯︵ ┻━┻

这一版是真的修好了。

---

## 安装

需要 Tampermonkey 或 Violentmonkey。

**方式一**：Greasyfork 搜「Instagram - 为用户添加备注(别名/标签) 修复版」

**方式二**：直接安装本仓库文件

```
https://raw.githubusercontent.com/sleepinghua/instagram-add-notes-to-the-user/main/Instagram%20-%20%E4%B8%BA%E7%94%A8%E6%88%B7%E6%B7%BB%E5%8A%A0%E5%A4%87%E6%B3%A8(%E5%88%AB%E5%90%8D%E6%A0%87%E7%AD%BE).js
```

## 原版为什么失效

原脚本的选择器全部建立在 Instagram 的**构建哈希类名**上（`_aaqt`、`_aamz`、`_ab8x`、`_aa_y`、`x8j4wrb`…）。这类类名每次发版整体更换，于是所有 `querySelector` 返回 `null`，注入逻辑全部空转——不报错，也没效果。

2026 年的页面还有两处结构变化：

| 原版依赖 | 现在 |
|---|---|
| `article header a` | 帖子内部已没有 `<header>` |
| `main header:has(h2)` / `h2` | 全站已没有 `<h1>/<h2>` |

## 这版做了什么

- **选择器改成语义 / 结构**：`article`、`section`、`a[href]` 路径解析；主页用户名直接取 URL 第一段
- **只改「用户名文字」**：只有文字正好等于用户名的链接才改写，头像、认证徽章一律不碰
- **事件层重写**：弃用 arrive.js（一个 bindEvent 一个 MutationObserver，页面会堆到二十多个），改为单个 MutationObserver + 300ms 去抖，扫描分轻量 / 完整两档
- **两种呈现方式**：替换用户名 / 用户名 + 胶囊，一个开关同时管首页和用户页
- **其他**：长备注省略号、删除备注后还原用户名、深色背景下的按钮对比度

## 命令

| 位置 | 命令 | 作用 |
|---|---|---|
| 油猴菜单 | 切换备注呈现（替换用户名 / 胶囊） | 切换显示方式 |
| 油猴菜单 | 立即重新扫描页面 | 手动触发扫描 |
| 控制台 | `__igNoteDiag()` | 自检：命中数、当前模式、扫描耗时 |
| 控制台 | `__igNoteSweep()` | 手动执行一轮完整扫描 |

## 更新日志

### 6.3.0 — 2026-10-20
- 重写事件层：单个 MutationObserver + 去抖，两档扫描
- 修复「关闭替换开关不生效」
- 修复「首页与用户页呈现不一致」
- 修复「头像概率性被备注侵占 / 加载异常」
- 统一按钮尺寸与胶囊字号
- 清理死代码与无效 CSS

## 目录说明

| 文件 | 说明 |
|---|---|
| `Instagram - 为用户添加备注(别名标签).js` | 发布版（无注释，31 KB） |
| `ig-note-full.js` | 早期实验分支，已废弃，勿用 |

## 许可

原脚本采用 GPL-3.0-or-later，本修复版沿用相同许可，并保留原作者署名。
