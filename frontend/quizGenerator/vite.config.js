// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react-swc'
// import tailwindcss from '@tailwindcss/vite'
// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(),tailwindcss()],
// })


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc' // or '@vitejs/plugin-react' if you're not using SWC
import tailwindcss from '@tailwindcss/vite' // Ensure this plugin is correctly set up if you're using it

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Proxy all /api requests to the backend server so the frontend can call
    // relative paths like /api/v1/classroom/create without needing a hardcoded host.
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:3141',
        changeOrigin: true,
      },
    },
  },
})