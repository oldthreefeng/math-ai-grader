# Docker 部署指南

## 快速开始

### 方式一：使用 Docker Compose（推荐）

1. **构建并启动容器**
```bash
docker-compose up -d --build
```

2. **访问应用**
打开浏览器访问：http://localhost:3000

3. **停止容器**
```bash
docker-compose down
```

### 方式二：使用 Docker 命令

1. **构建镜像**
```bash
docker build -t math-ai-grader .
```

2. **运行容器**
```bash
docker run -d -p 3000:80 --name math-ai-grader math-ai-grader
```

3. **访问应用**
打开浏览器访问：http://localhost:3000

4. **停止容器**
```bash
docker stop math-ai-grader
docker rm math-ai-grader
```

## 环境变量配置

**重要提示**：由于这是一个前端应用，环境变量需要在构建时设置。Vite 会将 `VITE_*` 前缀的环境变量编译进前端 bundle 中。

### 使用 .env 文件（推荐）

创建 `.env` 文件（不要提交到 git）：
```bash
# 百度API配置（必需）
VITE_BAIDU_AK=your_baidu_api_key_here
VITE_BAIDU_SK=your_baidu_secret_key_here

# Gemini API配置（可选）
GEMINI_API_KEY=your_gemini_api_key_here
```

然后使用 docker-compose 构建：
```bash
docker-compose up -d --build
```

docker-compose 会自动读取 `.env` 文件中的变量并传递给构建过程。

### 使用 Docker 命令构建

如果使用 `docker build` 命令，需要手动传入构建参数：

```bash
docker build \
  --build-arg VITE_BAIDU_AK=your_baidu_api_key \
  --build-arg VITE_BAIDU_SK=your_baidu_secret_key \
  --build-arg GEMINI_API_KEY=your_gemini_api_key \
  -t math-ai-grader .
```

### 环境变量说明

| 变量名 | 说明 | 是否必需 | 是否暴露在bundle中 |
|--------|------|---------|-------------------|
| `VITE_BAIDU_AK` | 百度API Key | ✅ 必需 | ⚠️ 是（会暴露） |
| `VITE_BAIDU_SK` | 百度API Secret Key | ✅ 必需 | ⚠️ 是（会暴露） |
| `GEMINI_API_KEY` | Gemini API Key | ❌ 可选 | ⚠️ 是（会暴露） |

**⚠️ 安全警告**：`VITE_*` 前缀的环境变量会被编译进前端 JavaScript bundle 中，任何人都可以在浏览器中查看。这是前端应用的限制。最佳实践是创建后端API来代理所有敏感API调用。

## 自定义端口

修改 `docker-compose.yml` 中的端口映射：
```yaml
ports:
  - "8080:80"  # 将 8080 改为你想要的端口
```

## 查看日志

```bash
# 使用 docker-compose
docker-compose logs -f

# 使用 docker
docker logs -f math-ai-grader
```

## 跨域问题解决

**已配置**：项目已配置 Nginx 反向代理解决百度 API 的跨域问题。

- **生产环境（Docker）**：Nginx 自动将 `/api/baidu/*` 请求代理到百度 API
- **开发环境**：Vite 开发服务器已配置代理，同样支持 `/api/baidu/*` 路径

所有百度 API 调用都会自动通过代理转发，无需额外配置。

## 生产环境部署建议

1. **使用 HTTPS**：配置 SSL 证书，修改 nginx 配置支持 HTTPS
2. **资源限制**：在 `docker-compose.yml` 中添加资源限制
3. **健康检查**：添加健康检查配置
4. **反向代理**：在生产环境中使用 Nginx 或 Traefik 作为反向代理

