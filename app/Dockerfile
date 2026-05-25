# --- Stage 1: install dependencies ---
# We use a full Node image to run npm install
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# --- Stage 2: the actual runtime image ---
# We start fresh from a minimal image and copy only what we need.
# This keeps the final image small (~80MB instead of ~900MB).
FROM node:20-alpine AS runner
WORKDIR /app

# Create a non-root user — running as root inside a container is a security risk
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy node_modules from stage 1, copy our source code
COPY --from=builder /app/node_modules ./node_modules
COPY src/    ./src/
COPY config/ ./config/

# Switch to the non-root user before starting
USER appuser

EXPOSE 3000

# Healthcheck — Docker itself will check if the app is alive
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
  CMD node -e "require('http').get('http://localhost:3000/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"