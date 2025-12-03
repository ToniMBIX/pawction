import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},            // evita "process is not defined"
    global: 'globalThis',         // evita "global is not defined"
    __APP_BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    target: 'es2020',
    sourcemap: false
  },
  optimizeDeps: {
    esbuildOptions: {
      define: { global: 'globalThis' }
    },
    include: ["@stripe/stripe-js"]
  }
})
