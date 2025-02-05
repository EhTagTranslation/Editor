FROM node:lts-alpine

WORKDIR /app

COPY / /app

RUN corepack pnpm install --prod --frozen-lockfile

ENTRYPOINT [ "node", "dist/server/main.js" ]
