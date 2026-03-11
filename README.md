# Jimeng AI API Page (Next.js)

## 1) 本地运行

```bash
npm install
cp .env.example .env.local
# 填入你的 VOLCENGINE_API_KEY 和 VOLCENGINE_MODEL
npm run dev
```

打开 http://localhost:3000。

## 2) 接口

- `POST /api/generate`
- 请求体：

```json
{
  "prompt": "一只在月球散步的熊猫"
}
```

## 3) Vercel 部署

1. 把代码推到 GitHub。
2. 登录 Vercel，`Add New Project`，导入该仓库。
3. 在 `Environment Variables` 配置：
   - `VOLCENGINE_API_KEY`
   - `VOLCENGINE_MODEL`
   - （可选）`VOLCENGINE_BASE_URL`
4. 点击 Deploy。
5. 部署完成后拿到线上域名，例如 `https://xxx.vercel.app`。

## 4) 手机和电脑收藏

- 手机/电脑都直接收藏 `https://xxx.vercel.app`。
- 其他电脑只要能访问该网址，也能调用你的 `/api/generate`。
- 注意：接口调用次数和费用由你的火山引擎账号承担。
