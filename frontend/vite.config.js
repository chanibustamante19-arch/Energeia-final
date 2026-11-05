import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL('..', import.meta.url)), '')
  return {
    root,
    envDir: fileURLToPath(new URL('..', import.meta.url)),
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    ...(env.VITE_BASE44_APP_BASE_URL
      ? {
          server: {
            proxy: {
              '^/api/(apps|app-logs)([/?]|$)': {
                target: env.VITE_BASE44_APP_BASE_URL,
                changeOrigin: true,
              },
            },
          },
        }
      : {}),
  }
})
