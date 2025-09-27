# 멀티스테이지 빌드를 위한 Node.js 베이스 이미지
FROM node:20-alpine AS base

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 매니저 캐시 최적화를 위한 패키지 파일들만 먼저 복사
COPY package*.json ./

# 의존성 설치
RUN npm install --only=production && npm cache clean --force

# 개발 의존성 설치 (개발 스테이지용)
FROM base AS development

# 모든 의존성 설치 (개발 의존성 포함)
RUN npm install

# 소스 코드 복사
COPY . .

# TypeScript 컴파일을 위한 빌드
RUN npm run build

# 개발 서버 실행
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# 프로덕션 스테이지
FROM base AS production

# 프로덕션 의존성만 설치
RUN npm install --only=production && npm cache clean --force

# 빌드된 애플리케이션 복사 (개발 스테이지에서 빌드된 파일)
COPY --from=development /app/dist ./dist
COPY --from=development /app/package*.json ./

# 포트 노출
EXPOSE 3000

# 프로덕션 서버 실행
CMD ["npm", "run", "start:prod"]

# 개발 환경용 스테이지 (핫 리로드 지원)
FROM node:20-alpine AS dev

WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사
COPY . .

# 포트 노출
EXPOSE 3000

# 개발 서버 실행 (핫 리로드)
CMD ["npm", "run", "start:dev"]
