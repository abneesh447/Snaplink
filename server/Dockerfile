# Multi-stage Build for Express Server
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Production Runner
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --only=production

# Copy source code and client from builder
COPY --from=builder /usr/src/app/src ./src
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "src/server.js"]
