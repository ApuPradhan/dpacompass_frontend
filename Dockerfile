# ============================================
# DPA COMPASS FRONTEND
# Production Docker Image
# ============================================

# ============================================
# STAGE 1 - BUILD
# ============================================

FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Copy dependency definitions
COPY package.json package-lock.json ./

# Install dependencies inside Linux container
# Includes optional native dependencies required by Rolldown
RUN npm ci --include=optional

# Copy frontend source and configuration
COPY . .

# Build Vite application
RUN npm run build


# ============================================
# STAGE 2 - PRODUCTION
# ============================================

FROM nginx:alpine

# Remove default Nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled frontend
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]