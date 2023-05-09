FROM node:lts-alpine

WORKDIR /app

COPY / /app

RUN pnpm install --prod --frozen-lockfile

ENTRYPOINT [ "node", "dist/server/main.js" ]
