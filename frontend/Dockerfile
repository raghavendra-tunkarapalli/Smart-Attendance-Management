# Stage 1: Fast multi-stage build with dependency caching
FROM node:20-alpine AS builder
WORKDIR /app

# Cache dependencies
COPY package*.json ./
RUN npm ci

# Build production assets
COPY . .
RUN npm run build

# Stage 2: Ultra-lightweight production server
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5173
HEALTHCHECK --interval=5s --timeout=3s --retries=5 CMD wget -q --spider http://localhost:5173/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
