# syntax=docker/dockerfile:1

# --- Étape 1 : build ---------------------------------------------------------
FROM node:24-alpine AS builder

WORKDIR /app

# better-sqlite3 est un module natif : sans prebuild musl, il est compilé ici.
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src

RUN npm run build && npm prune --omit=dev

# --- Étape 2 : runtime -------------------------------------------------------
FROM node:24-alpine AS runtime

ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_PATH=./data/database.sqlite \
    PHOTOS_PATH=./data/photos

WORKDIR /app

# tzdata : garantit la résolution des fuseaux IANA utilisés pour calculer le jour courant.
RUN apk add --no-cache tzdata

COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./

# Le dossier ./data n'est jamais copié dans l'image (voir .dockerignore) :
# il est monté au runtime pour persister la base SQLite et les photos privées.
RUN mkdir -p /app/data/photos && chown -R node:node /app/data
VOLUME /app/data

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/main"]
