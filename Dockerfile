###############
# Multi-stage Dockerfile for VolunteerHub backend (NestJS + Prisma + PostgreSQL)
###############

########## Stage 1: Build ##########
FROM node:22-alpine AS builder

WORKDIR /app

# Install root deps (workspace tools like concurrently, if ever needed)
COPY package.json package-lock.json ./
RUN npm install

# Install backend deps
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm install

# Copy full repo (backend needs src, prisma, etc.)
WORKDIR /app
COPY . .

# Build backend (Prisma generate + Nest build)
WORKDIR /app/backend
RUN npm run prisma:generate
RUN npm run build


########## Stage 2: Runtime ##########
FROM node:22-alpine

WORKDIR /app/backend

ENV NODE_ENV=production

# Copy built backend from builder image
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/package*.json ./
COPY --from=builder /app/backend/src ./src
COPY --from=builder /app/backend/prisma ./prisma

# Fly.io will inject PORT, but Nest defaults are set in main.ts
EXPOSE 3000

# Start production server
CMD ["node", "dist/src/main.js"]


