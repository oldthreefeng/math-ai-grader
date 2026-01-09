import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // 配置代理解决开发环境的跨域问题
        proxy: {
          '/api/baidu': {
            target: 'https://aip.baidubce.com',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/baidu/, ''),
            secure: true,
            configure: (proxy, _options) => {
              proxy.on('error', (err, _req, _res) => {
                console.log('proxy error', err);
              });
              proxy.on('proxyReq', (proxyReq, req, _res) => {
                // 安全：隐藏URL中的敏感参数
                const safeUrl = req.url ? req.url.replace(/([?&])(client_id|client_secret|access_token)=[^&]*/g, '$1$2=***') : 'unknown';
                console.log('Sending Request to the Target:', req.method, safeUrl);
              });
              proxy.on('proxyRes', (proxyRes, req, _res) => {
                // 安全：隐藏URL中的敏感参数
                const safeUrl = req.url ? req.url.replace(/([?&])(client_id|client_secret|access_token)=[^&]*/g, '$1$2=***') : 'unknown';
                console.log('Received Response from the Target:', proxyRes.statusCode, safeUrl);
              });
            },
          },
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
