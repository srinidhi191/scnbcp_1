## Multi-stage Dockerfile for SCNBCP API
# Build stage: compile TypeScript
FROM node:18-alpine AS builder
WORKDIR /app

# copy package files and install deps (including dev for tsc)
COPY package*.json ./
RUN npm ci

# copy source and build
COPY . .
RUN npm run build

# Runtime stage
FROM node:18-alpine
WORKDIR /app

# Copy package.json and install only production deps
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled dist from builder
COPY --from=builder /app/dist ./dist

# Ensure uploads directory exists
RUN mkdir -p /app/uploads

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "dist/server.js"]
