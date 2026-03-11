# Jimeng 4.0 文生图 Web App（最小可用版）

一个可部署的 Node.js + Express + 原生前端单页应用，用于调用 Jimeng 4.0 文生图异步 API。

## 功能概览

- 中文单页界面：提示词 + 比例 + 分辨率 + 一键生成
- 后端代理调用 API，前端不接触 AccessKey / SecretKey
- 访问密码门禁（轻量 session）
- 基础限流与严格参数校验
- 轮询异步任务直到完成并返回图片 URL

## 本地启动

### 1) 安装依赖

```bash
npm install
```

### 2) 配置环境变量

复制并编辑：

```bash
cp .env.example .env
```

必填变量：

- `VOLC_ACCESS_KEY`
- `VOLC_SECRET_KEY`
- `APP_PASSWORD`
- `PORT`（默认可填 3000）
- `SESSION_SECRET`（强烈建议设置）

### 3) 运行

开发模式：

```bash
npm run dev
```

生产模式：

```bash
npm start
```

访问 `http://localhost:3000`。

## API 路由

- `POST /api/login`：密码登录
- `POST /api/generate`：提交并轮询任务，返回最终图片 URL
- `GET /api/health`：健康检查
- `GET /api/me`：当前会话登录状态
- `POST /api/logout`：退出登录

## Jimeng 调用说明

- Base URL: `https://visual.volcengineapi.com`
- Submit: `Action=CVSync2AsyncSubmitTask&Version=2022-08-31`
- Get Result: `Action=CVSync2AsyncGetResult&Version=2022-08-31`
- 固定参数：
  - `req_key = jimeng_t2i_v40`
  - `region = cn-north-1`
  - `service = cv`
  - `force_single = true`
  - 结果查询时 `req_json` 为 JSON 字符串，带 `return_url=true`

## Railway 部署（简版）

1. 将仓库推送到 GitHub。
2. 在 Railway 新建 Project 并导入仓库。
3. 在 Variables 中配置 `.env` 同名变量。
4. Start Command 使用 `npm start`。
5. 部署后使用 Railway 分配域名访问。

详细见 `DEPLOY.md`。

## 安全说明（重点）

- 密钥只保存在服务端环境变量中。
- 浏览器仅请求你的后端 API，不直接访问火山引擎签名接口。
- 使用 `express-session` 维护登录态（无用户系统）。
- 对登录与生成接口做限流，减少暴力尝试与滥用。
- 后端对 prompt / ratio / resolution 严格白名单校验。

详细见 `SECURITY.md`。
