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

# Рабочий этап для запуска приложения
FROM oven/bun:1-alpine
WORKDIR /app

# Копируем собранные файлы
COPY --from=builder /app/dist ./dist

# Указываем порт (dockploy будет проксировать запросы на него)
EXPOSE 3000

# Используем bunx и serve для раздачи статики (флаг -s для React Router/SPA)
CMD ["bunx", "serve", "-s", "dist", "-l", "tcp://0.0.0.0:3000"]
