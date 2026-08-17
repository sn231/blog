# Snow Love

Snow Love 的个人博客，目标域名：`https://snowlove.is-a.dev`。

## 技术栈

- VitePress
- Vue
- Vercel
- GitHub
- 基于 [Alittfre/vitepress-theme-bluearchive](https://github.com/Alittfre/vitepress-theme-bluearchive) 二次定制

## 设计思路

不从零造博客 UI。直接复用成熟主题已有的文章卡片、标签、搜索、深色模式、移动端适配、代码高亮、图片灯箱和交互动效，再在此基础上做 Snow Love 的品牌化改造。

当前定制包括：

- 首页品牌改为 Snow Love
- 首页头像改为 `sn231` 的 GitHub 头像
- 去掉上游主题自带的角色播放器与背景音乐
- 将主题切换命名改为“浅色 / 深色 / 跟随系统”
- 保留文章列表、分页、标签、搜索、烟花效果和响应式布局
- 清除原模板 Gitalk OAuth 配置，不在公开前端保留 secret
- 内置 `/admin` 文章后台，可直接新建、修改和发布 Markdown 文章

## 博客后台

部署后打开：

```text
/admin
```

后台支持：

- 管理员密码登录
- 新建文章
- 打开已有文章继续编辑
- 标题、日期、标签、置顶设置
- Markdown 编辑与即时预览
- 一键发布

发布按钮会调用 Vercel Function，由服务端自动把 Markdown 写入 GitHub 的 `posts/` 目录；GitHub 更新后会自动触发 Vercel Production Deployment。日常发文不需要手动进入 GitHub。

### 后台所需环境变量

在 Vercel 项目的 Environment Variables 中配置：

```text
BLOG_ADMIN_PASSWORD=<后台登录密码>
BLOG_GITHUB_TOKEN=<仅允许写 sn231/blog Contents 的 GitHub fine-grained token>
```

`BLOG_GITHUB_TOKEN` 只在 Vercel 服务端使用，不会发送到浏览器。建议只给 `sn231/blog` 单仓库的 Contents: Read and write 权限。

## 本地运行

```bash
pnpm install
pnpm run dev
```

构建：

```bash
pnpm run build
```

## 文章格式

后台最终仍保存为 Markdown，因此内容可移植、可版本管理：

```md
---
title: 文章标题
date: 2026-08-17
tags: [随笔]
pinned: false
---

这里写正文。
```

## 部署

GitHub 仓库已连接 Vercel。非 `main` 分支会生成 Preview Deployment；合并到 `main` 后由 Vercel 自动发布 Production Deployment。

最终自定义域名计划使用：`snowlove.is-a.dev`。

## Theme credit

UI 与主题基础来自 [vitepress-theme-bluearchive](https://github.com/Alittfre/vitepress-theme-bluearchive)。继续保留上游主题作者与项目署名。
