FROM node:alpine AS builder

RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=feltpen --docker

FROM node:alpine AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install

# 프로젝트를 빌드 합니다.
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# 리모트 캐싱을 위한 환경변수를 설정합니다. (선택사항)
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM

# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

RUN yarn turbo run build --filter=feltpen...

FROM node:alpine AS runner
WORKDIR /app

# 루트에서 실행하지 않도록 사용자를 생성합니다.
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/apps/feltpen/next.config.js .
COPY --from=installer /app/apps/feltpen/package.json .

# 이미지 사이즈를 줄이기 위해 standalone 모드로 빌드된 파일만 복사합니다.
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/feltpen/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/feltpen/.next/static ./apps/feltpen/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/feltpen/public ./apps/feltpen/public

CMD node apps/feltpen/server.js