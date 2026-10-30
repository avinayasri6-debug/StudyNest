import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { aiApiPlugin } from './server/aiPlugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), aiApiPlugin()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules') && id.includes('prismjs')) {
            return 'vendor-prism';
          }
          if (id.includes('node_modules') && (id.includes('react') || id.includes('react-dom'))) {
            return 'vendor-react';
          }
          if (id.includes('mockQuestionsData') || id.includes('quizQuestions')) {
            return 'academic-questions-data';
          }
          if (id.includes('videosData') || id.includes('subjectsData') || id.includes('pythonData')) {
            return 'academic-curriculum-data';
          }
        }
      }
    }
  }
})
