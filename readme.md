# Snow Love

Snow Love 的个人博客，目标域名：`https://snowlove.is-a.dev`。

## 技术栈

- VitePress
- Vue
- GitHub Pages
- 基于 [Alittfre/vitepress-theme-bluearchive](https://github.com/Alittfre/vitepress-theme-bluearchive) 二次定制

## 当前设计

保留成熟主题已有的文章卡片、标签、搜索、深色模式、移动端适配、代码高亮、图片灯箱和交互动效，在此基础上改成 Snow Love 的站点品牌与内容结构，不重新造博客 UI。

## 本地运行

```bash
pnpm install
pnpm run dev
```

构建：

```bash
pnpm run build
```

## 写文章

文章继续放在 `posts/` 目录，使用 Markdown：

```md
---
title: 文章标题
date: 2026-08-17
tags: [随笔]
pinned: false
---

这里写摘要。

---

这里写正文。
```

## 部署

仓库内置 GitHub Actions。推送到 `main` 后会构建 VitePress 并部署到 GitHub Pages；`public/CNAME` 已配置为 `snowlove.is-a.dev`。

## Theme credit

UI 与主题基础来自 [vitepress-theme-bluearchive](https://github.com/Alittfre/vitepress-theme-bluearchive)。原主题许可与作者署名应继续保留。
