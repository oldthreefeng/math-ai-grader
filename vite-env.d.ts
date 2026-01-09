/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PROD: boolean;
  readonly DEV: boolean;
  readonly MODE: string;
  // 可以添加其他环境变量
  readonly GEMINI_API_KEY?: string;
  // 百度API配置（⚠️ 注意：前端环境变量仍然会暴露）
  readonly VITE_BAIDU_AK?: string;
  readonly VITE_BAIDU_SK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

