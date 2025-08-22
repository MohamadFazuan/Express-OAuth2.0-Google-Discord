# Backend Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Development image
FROM base AS dev
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
EXPOSE 3002
CMD ["npm", "run", "dev:server"]

# Production image, copy all the files and run server
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy the standalone output
COPY --from=deps --chown=expressjs:nodejs /app/node_modules ./node_modules
COPY --chown=expressjs:nodejs . .

USER expressjs

EXPOSE 3002

ENV PORT=3002

CMD ["node", "server.js"]
