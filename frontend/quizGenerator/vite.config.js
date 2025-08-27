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
    // This is the crucial part for proxying API requests to your backend
    proxy: {
      '/api': { // This will match any request path that starts with '/api'
        target: 'https://quiz-generator-livid.vercel.app', // Your backend server's address
        changeOrigin: true, // Needed for proper host header handling in many proxy scenarios
        // If your backend routes also include '/api' (e.g., /api/v1/teacher/quizzes)
        // then you typically DON'T need a rewrite rule. The entire '/api' prefix
        // will be forwarded to your target.
        // rewrite: (path) => path.replace(/^\/api/, '/api'), // This line is usually NOT needed if your backend also uses '/api'
      },
      // If you have other backend routes that don't start with /api (e.g., /auth),
      // you might need additional proxy entries:
      // '/auth': {
      //   target: 'http://localhost:3141',
      //   changeOrigin: true,
      // },
    },
  },
})