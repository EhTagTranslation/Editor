FROM oven/bun:alpine AS base

WORKDIR /app

FROM base AS builder

RUN bun install -g pnpm@latest

COPY / /app

RUN pnpm install --prod --frozen-lockfile

FROM base AS runner

WORKDIR /app

COPY --from=builder /app /app

ENTRYPOINT [ "bun", "dist/server/main.js" ]
