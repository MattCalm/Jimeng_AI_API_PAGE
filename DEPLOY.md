# Railway 部署指南

## 1. 准备

- 确保本地已可运行：`npm start`
- 代码已推送到 GitHub

## 2. 创建 Railway 项目

1. 登录 Railway
2. New Project → Deploy from GitHub repo
3. 选择本仓库

## 3. 配置环境变量

在 Railway 项目 Variables 中添加：

- `VOLC_ACCESS_KEY`
- `VOLC_SECRET_KEY`
- `APP_PASSWORD`
- `SESSION_SECRET`
- `PORT`（可设置为 `3000`）

## 4. 启动命令

- Build Command: `npm install`
- Start Command: `npm start`

## 5. 网络与域名

- Railway 会自动暴露服务端口
- 使用生成的域名即可多设备访问（电脑/手机）
- 如需自定义域名，可在 Railway Domain 中绑定

## 6. 部署后检查

- 访问 `/api/health`，应返回 `status: ok`
- 打开首页，输入密码登录
- 尝试生成一张测试图片

## 7. 生产建议

- 使用复杂 `APP_PASSWORD`
- 使用随机高强度 `SESSION_SECRET`
- 定期轮换 `VOLC_ACCESS_KEY` / `VOLC_SECRET_KEY`
