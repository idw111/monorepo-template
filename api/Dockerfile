# ================================================
# 빌드 스테이지
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ================================================
# 실행 스테이지
FROM node:20-alpine AS runner

WORKDIR /app

# 프로덕션 종속성만 설치
COPY package*.json ./
# prepare 스크립트를 무시하고 프로덕션 의존성만 설치
RUN npm pkg delete scripts.prepare && \
    npm ci --omit=dev

# 빌드된 파일과 필요한 파일들만 복사
COPY --from=builder /app/.env.docker .env
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json .


# 로그 디렉토리 생성 및 권한 설정
RUN mkdir -p /app/logs && \
    chown -R node:node /app

# 환경변수 기본값 설정 (필요한 경우)
ENV NODE_ENV=production 

# 보안을 위해 non-root 유저로 실행
USER node
EXPOSE 5003
CMD ["npm", "start"]
