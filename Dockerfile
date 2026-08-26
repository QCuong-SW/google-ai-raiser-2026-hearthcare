# ==============================================================================
# LifeLink AI — Multi-stage Fullstack Dockerfile for Google Cloud Run
# Compiles React Client + NestJS Server into 1 Single Cloud Container
# ==============================================================================

# Step 1: Build React Frontend Client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install --frozen-lockfile || npm install
COPY client/ ./
RUN npm run build

# Step 2: Build NestJS Backend Server
FROM node:20-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --frozen-lockfile || npm install
COPY server/ ./
RUN npm run build

# Step 3: Production Runner Image
FROM node:20-alpine AS runner
WORKDIR /app

# Copy Production Assets
COPY --from=client-builder /app/client/dist ./client/dist
COPY --from=server-builder /app/server/package*.json ./server/
COPY --from=server-builder /app/server/node_modules ./server/node_modules
COPY --from=server-builder /app/server/dist ./server/dist

# Google Cloud Run uses PORT environment variable (default 8080)
ENV PORT=8080
EXPOSE 8080

WORKDIR /app/server
CMD ["node", "dist/main"]
