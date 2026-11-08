# --- Étape 1 : Dépendances ---
FROM node:25-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# --- Étape 2 : Exécution (Runtime) ---
FROM node:25-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

# Mettre à jour Alpine pour corriger les CVE OS
RUN apk update && apk upgrade --no-cache

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copier uniquement les dépendances de production
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

# Générer Prisma Client (nécessaire pour l'exécution)
RUN npx prisma generate

USER nodejs
EXPOSE 5000

CMD ["node", "server.js"]
