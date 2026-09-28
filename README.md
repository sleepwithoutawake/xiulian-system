# 修炼系统 Web App

线上 App：

```text
https://xiulian-system.pages.dev/
```

同步 Worker：

```text
https://xiulian-sync.maoxiangyu199.workers.dev
```

## 文件说明

- `修炼系统_每日操作卡.html`：主 App 源文件。
- `index.html`：本地入口，跳转到主 App。
- `manifest.json`：PWA 安装配置。
- `sw.js`：PWA 离线缓存。
- `app-icon.svg`：App 图标。
- `_headers`：Cloudflare Pages 响应头配置。
- `sync-worker.js`：自动同步后端 Worker 源码。
- `wrangler-sync.toml`：同步 Worker 的 Cloudflare 部署配置。
- `dist/`：Cloudflare Pages 发布目录。
- `同步部署说明.md`：同步功能说明。
- `免费托管继续部署.md`：托管结果和重新部署命令。
- `指令.md`：原始需求说明。

## 重新发布

更新 App 后，先同步 `dist` 目录，再发布：

```powershell
Copy-Item -LiteralPath '.\修炼系统_每日操作卡.html' -Destination '.\dist\app.html' -Force
npx wrangler pages deploy dist --project-name xiulian-system --commit-dirty=true
```

更新同步 Worker：

```powershell
npx wrangler deploy --config wrangler-sync.toml
```
