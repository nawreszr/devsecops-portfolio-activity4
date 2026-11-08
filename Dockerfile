# --- Étape 1 : Dépendances ---
FROM node:25-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- Étape 2 : Build ---
FROM node:25-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Active le mode standalone pour Next.js (voir next.config.ts)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Étape 3 : Exécution (Runtime) ---
FROM node:25-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED=1

# Mettre à jour Alpine pour corriger les CVE OS
RUN apk update && apk upgrade --no-cache

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copier uniquement le strict nécessaire depuis le builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
