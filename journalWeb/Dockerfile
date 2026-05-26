# Этап сборки приложения
FROM oven/bun:1 AS builder
WORKDIR /app

# Копируем манифесты зависимостей
COPY package.json bun.lock ./

# Устанавливаем зависимости с замороженным lock-файлом для стабильности
RUN bun install --frozen-lockfile

# Копируем весь исходный код проекта
COPY . .

# Собираем приложение для production
RUN bun run build

# Этап раздачи статики
FROM nginx:alpine

# Конфигурируем Nginx для поддержки React Router (перенаправление всех запросов на index.html)
RUN rm -rf /etc/nginx/conf.d/*
RUN echo $'server {\\n\\
    listen 80;\\n\\
    server_name localhost;\\n\\
    root /usr/share/nginx/html;\\n\\
    index index.html;\\n\\
    location / {\\n\\
        try_files $uri $uri/ /index.html;\\n\\
    }\\n\\
}' > /etc/nginx/conf.d/default.conf

# Копируем собранные файлы (dist) из этапа сборки в директорию Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Указываем порт, который слушает контейнер
EXPOSE 80

# Запускаем Nginx на переднем плане
CMD ["nginx", "-g", "daemon off;"]
