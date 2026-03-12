import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
	server: {
		proxy: {
			'/api': {
				target: 'https://msapi-top-journal.ru',
				changeOrigin: true,
				rewrite: path => path.replace(/^\/api/, ''),
			},
			// Файлы тоже проксируем — бэкенд отдаёт localhost:8000/files/...
			// fixUrl заменяет хост на localhost:5173, Vite проксирует дальше
			'/files': {
				target: 'https://msapi-top-journal.ru',
				changeOrigin: true,
			},
		},
	},
})
