FROM node:lts-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY pnpm-lock.yaml /app

RUN pnpm fetch --prod

COPY / /app

RUN pnpm install --prod --offline --frozen-lockfile

ENTRYPOINT [ "node", "dist/server/main.js" ]
