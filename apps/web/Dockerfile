FROM node:22-alpine AS deps
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/package.json
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate \
  && pnpm install --filter @football-value/web... --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /repo
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/web/node_modules ./apps/web/node_modules
COPY apps/web ./apps/web
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate \
  && pnpm --dir apps/web build

FROM node:22-alpine AS runner
WORKDIR /repo
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
COPY package.json pnpm-workspace.yaml ./
COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/apps/web/package.json ./apps/web/package.json
COPY --from=builder /repo/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder /repo/apps/web/.next ./apps/web/.next
COPY --from=builder /repo/apps/web/messages ./apps/web/messages
COPY --from=builder /repo/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["pnpm", "--dir", "apps/web", "start"]
