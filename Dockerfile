# -------------------------------------
# Stage 1 - Build
# -------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# -------------------------------------
# Stage 2 - Production
# -------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3006

COPY --from=builder /app ./

EXPOSE 3006

CMD ["npx", "next", "start", "-p", "3006"]