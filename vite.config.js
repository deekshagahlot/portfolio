import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  appType: 'mpa',
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        shiprocket: resolve(__dirname, 'work/shiprocket-agentic/index.html'),
        quick: resolve(__dirname, 'work/quick-and-rider/index.html'),
        apna: resolve(__dirname, 'work/apna-store/index.html'),
        exp01: resolve(__dirname, 'playground/design-system-context/index.html'),
        exp02: resolve(__dirname, 'playground/adversarial-reviewer/index.html'),
        exp03: resolve(__dirname, 'playground/writing-rules/index.html'),
      },
    },
  },
})
