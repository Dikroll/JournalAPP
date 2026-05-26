# Stage 1: Build the app
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy package files and scripts (needed for postinstall)
COPY package.json bun.lockb* ./
COPY scripts/ ./scripts/

# Install dependencies
RUN bun install

# Copy all project files
COPY . .

# Build the project for web platform
# VITE_PLATFORM=web enables tree-shaking of Capacitor/mobile code
RUN VITE_PLATFORM=web bun run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
