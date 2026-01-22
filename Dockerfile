FROM node:lts-alpine AS base

WORKDIR /app

FROM base AS builder

RUN npm install -g pnpm@latest

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /app/

RUN pnpm install --frozen-lockfile

COPY . /app

RUN <<EOF
  set -eu

  BANNER='
  const { dirname: __dirname, filename: __filename } = import.meta;
  const require = (() => {
    const r = process.getBuiltinModule("module").createRequire(import.meta.url);
    return (name) => { try { return r(name) } catch { return {default:{}}; } }
  })(); 
  '

  pnpm build:server

  pnpm esbuild --bundle dist/server/main.js --outfile=main.js \
    --platform=node --target=node24 --charset=utf8 \
    --minify --keep-names --sourcemap --legal-comments=external \
    --banner:js="$BANNER" \
    --external:@fastify/view --external:@nestjs/websockets --external:@nestjs/microservices --external:@nestjs/platform-express \
    --external:class-transformer/storage --external:libphonenumber-js

  rm -rf .[!.]* dist node_modules src test tools scripts
EOF

FROM base AS production

COPY --from=builder /app /app

ENTRYPOINT [ "node", "main.js" ]
