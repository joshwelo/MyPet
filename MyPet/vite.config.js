import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Manual chunking for libraries like React, ReactDOM, etc.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // This will separate all node_modules into their own chunk
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Set the chunk size warning limit to 1000 KB (1 MB)
  },
})
