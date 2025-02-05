FROM node:lts-alpine

RUN npm install -g corepack@latest npm@latest

WORKDIR /app

COPY / /app

RUN corepack pnpm install --prod --frozen-lockfile

ENTRYPOINT [ "node", "dist/server/main.js" ]
