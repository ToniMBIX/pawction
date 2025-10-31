import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Este config:
// - Inyecta shims para 'process.env' y 'global' (algunas libs lo referencian).
// - Fija target moderno para evitar transformaciones problemáticas.
// - Evita que Vite intente prebundlear módulos de Node.

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},     // evita "process is not defined"
    global: 'globalThis',  // evita "global is not defined"
  },
  build: {
    target: 'es2020',
    sourcemap: false,
  },
  optimizeDeps: {
    esbuildOptions: {
      define: { global: 'globalThis' },
    },
  },
})
