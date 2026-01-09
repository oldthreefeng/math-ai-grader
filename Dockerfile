# 构建阶段 - 使用阿里云镜像

FROM gaoding-registry.cn-hangzhou.cr.aliyuncs.com/pub/node:20-slim AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建参数 - 用于构建时传入环境变量
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY

# 百度API配置 - 构建时传入（⚠️ 注意：这些变量会被编译进前端bundle）
ARG VITE_BAIDU_AK
ARG VITE_BAIDU_SK
ENV VITE_BAIDU_AK=$VITE_BAIDU_AK
ENV VITE_BAIDU_SK=$VITE_BAIDU_SK

# 构建应用（Vite会在构建时读取VITE_*前缀的环境变量）
RUN npm run build

# 运行阶段 - 使用阿里云镜像提供静态文件服务
FROM gaoding-registry.cn-hangzhou.cr.aliyuncs.com/pub/nginx:1.29.3

# 复制构建产物到 nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置文件（如果需要自定义配置）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]

