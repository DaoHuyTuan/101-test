import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/oauth2': {
        target: 'https://is-101digital-sandbox.101digital.io',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/oauth2/, '/oauth2')
      },
      '/invoice-service': {
        target: 'https://api-wso2-101digital-sandbox.101digital.io',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/invoice-service/, '/invoice-service')
      },
      '/membership-service': {
        target: 'https://api-wso2-101digital-sandbox.101digital.io',
        changeOrigin: true,
        secure: false,
        rewrite: path =>
          path.replace(/^\/membership-service/, '/membership-service')
      }
    }
  }
})
