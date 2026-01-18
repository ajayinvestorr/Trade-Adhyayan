
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Stringify the env to ensure it's safely replaced as a constant during build
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      external: [
        // Prevent Vite from trying to bundle external CDN modules
        'react',
        'react-dom',
        'lucide-react',
        'recharts',
        '@google/genai',
        '@supabase/supabase-js'
      ]
    }
  }
});
