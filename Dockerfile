FROM node:lts-alpine

WORKDIR /app

COPY pnpm-lock.yaml /app

RUN corepack pnpm fetch --prod

COPY / /app

RUN corepack pnpm install --prod --offline --frozen-lockfile

ENTRYPOINT [ "node", "dist/server/main.js" ]
