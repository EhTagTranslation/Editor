FROM oven/bun:alpine AS builder

RUN bun install -g pnpm@latest

WORKDIR /app

COPY / /app

RUN pnpm install --prod --frozen-lockfile

FROM oven/bun:distroless

WORKDIR /app

COPY --from=builder /app /app

ENTRYPOINT [ "bun", "dist/server/main.js" ]
