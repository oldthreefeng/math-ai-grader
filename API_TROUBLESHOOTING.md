# API 调用问题排查指南

## 问题：创建新考试上传文件后，无法调用API

### 排查步骤

#### 1. 检查浏览器控制台
打开浏览器开发者工具（F12），查看 Console 标签页中的错误信息：
- 网络错误（Network Error）
- CORS 错误（Cross-Origin Request Blocked）
- API 返回的错误代码

#### 2. 检查网络请求
在浏览器开发者工具的 Network 标签页中：
- 查找 `/api/baidu/` 开头的请求
- 检查请求状态码：
  - `200` - 成功
  - `404` - 代理路径未找到
  - `502` - 代理服务器错误
  - `504` - 超时

#### 3. 验证代理配置

**开发环境（Vite）**：
- 确认 `vite.config.ts` 中已配置代理
- 启动开发服务器：`npm run dev`
- 访问 `http://localhost:3000/api/baidu/oauth/2.0/token?...` 测试代理

**生产环境（Docker）**：
- 确认 `nginx.conf` 中已配置 `/api/baidu/` 代理
- 检查 Docker 容器日志：`docker logs math-ai-grader`
- 测试代理：`curl http://localhost:3000/api/baidu/oauth/2.0/token?...`

#### 4. 常见问题及解决方案

**问题1：404 Not Found**
- **原因**：代理路径配置错误
- **解决**：
  - 检查 `services.ts` 中 `URL_PREFIX` 是否为 `/api/baidu`
  - 检查 `nginx.conf` 或 `vite.config.ts` 中的代理配置

**问题2：CORS 错误**
- **原因**：直接调用百度API，未通过代理
- **解决**：确保使用 `/api/baidu` 前缀，而不是直接调用 `https://aip.baidubce.com`

**问题3：502 Bad Gateway**
- **原因**：Nginx 无法连接到百度API服务器
- **解决**：
  - 检查网络连接
  - 检查 `nginx.conf` 中的 `proxy_pass` 配置
  - 确认 `proxy_ssl_server_name on;` 已设置

**问题4：Token 获取失败**
- **原因**：API Key 或 Secret Key 错误
- **解决**：
  - 检查 `services.ts` 中的 `BAIDU_CONFIG.AK` 和 `BAIDU_CONFIG.SK`
  - 确认百度AI平台的密钥是否正确

**问题5：OCR API 返回错误**
- **原因**：图片格式或大小不符合要求
- **解决**：
  - 检查图片格式（支持 JPG、PNG）
  - 检查图片大小（建议不超过 4MB）
  - 查看控制台中的具体错误信息

### 调试技巧

1. **添加日志**：
   - 代码中已添加 `console.log` 输出API调用信息
   - 查看控制台中的 "调用API:" 日志

2. **测试代理**：
   ```bash
   # 测试Token获取
   curl -X POST "http://localhost:3000/api/baidu/oauth/2.0/token?grant_type=client_credentials&client_id=YOUR_AK&client_secret=YOUR_SK"
   ```

3. **检查Nginx配置**：
   ```bash
   # 进入Docker容器
   docker exec -it math-ai-grader sh
   
   # 检查nginx配置
   cat /etc/nginx/conf.d/default.conf
   
   # 测试nginx配置
   nginx -t
   ```

### 联系支持

如果问题仍未解决，请提供以下信息：
1. 浏览器控制台的完整错误信息
2. Network 标签页中的请求详情（请求URL、状态码、响应内容）
3. Docker 容器日志（如果使用Docker部署）
4. 使用的环境（开发/生产）

