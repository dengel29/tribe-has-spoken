import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    minifyIdentifiers:false,
    keepNames: true,
    minify:false,
    
  }
})