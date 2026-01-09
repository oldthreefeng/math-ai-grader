# 环境变量配置指南

## Vite 环境变量说明

Vite 会自动读取项目根目录下的 `.env` 文件。**只有以 `VITE_` 开头的环境变量才会暴露给客户端代码**。

## 开发环境（npm run dev）

### 1. 创建 `.env` 文件

在项目根目录创建 `.env` 文件：

```bash
# 百度API配置（必需）
VITE_BAIDU_AK=your_baidu_api_key_here
VITE_BAIDU_SK=your_baidu_secret_key_here

# Gemini API配置（可选）
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. 启动开发服务器

```bash
npm run dev
```

Vite 会自动：
- 读取 `.env` 文件
- 将 `VITE_*` 前缀的变量注入到 `import.meta.env` 中
- 代码中可以通过 `import.meta.env.VITE_BAIDU_AK` 访问

### 3. 验证配置

在浏览器控制台检查：
```javascript
console.log(import.meta.env.VITE_BAIDU_AK)  // 应该显示你的API密钥
```

如果看到 `undefined`，检查：
- `.env` 文件是否在项目根目录
- 变量名是否以 `VITE_` 开头
- 是否重启了开发服务器

## 生产环境（Docker）

### 方式一：使用 .env 文件（推荐）

1. 创建 `.env` 文件（与开发环境相同）

2. 使用 docker-compose：
```bash
docker-compose up -d --build
```

docker-compose 会自动读取 `.env` 文件并传递给构建过程。

### 方式二：使用构建参数

```bash
docker build \
  --build-arg VITE_BAIDU_AK=your_ak \
  --build-arg VITE_BAIDU_SK=your_sk \
  -t math-ai-grader .
```

## 环境变量优先级

Vite 按以下顺序加载环境变量（后面的会覆盖前面的）：

1. `.env` - 所有环境都会加载
2. `.env.local` - 所有环境都会加载（被 git 忽略）
3. `.env.[mode]` - 只在指定模式下加载（如 `.env.development`）
4. `.env.[mode].local` - 只在指定模式下加载（被 git 忽略）

## 重要提示

### ⚠️ 安全警告

- **`VITE_*` 前缀的变量会被编译进前端 bundle**
- 任何人都可以在浏览器中查看这些变量
- **不要在前端代码中使用敏感信息**（如密码、私钥等）

### ✅ 最佳实践

1. **开发环境**：使用 `.env.local`（不会被 git 提交）
2. **生产环境**：通过构建参数传入，不要提交到代码仓库
3. **敏感操作**：应该通过后端 API 处理，而不是前端

## 常见问题

### Q: 为什么修改 `.env` 后需要重启开发服务器？

A: Vite 只在启动时读取 `.env` 文件。修改后需要重启 `npm run dev`。

### Q: 为什么变量是 `undefined`？

A: 检查：
- 变量名是否以 `VITE_` 开头
- `.env` 文件是否在项目根目录
- 是否重启了开发服务器
- 变量名是否正确（区分大小写）

### Q: Docker 构建时环境变量不生效？

A: 确保：
- Dockerfile 中定义了 `ARG` 和 `ENV`
- 构建时传入了 `--build-arg`
- docker-compose.yml 中配置了 `args`

## 示例文件

参考 `.env.example` 文件（如果存在）创建你的 `.env` 文件。

