# Hupis - NestJS 소셜 플랫폼

PostgreSQL + TypeORM을 사용한 NestJS 기반 소셜 플랫폼입니다.  
사용자 인증, 게시글 작성, 댓글, 좋아요, 리포스트 등의 소셜 기능을 제공합니다.

## 📋 목차

- [실행방법](#-실행방법)
- [기술 스택](#-기술-스택)
- [디렉토리 구조](#-디렉토리-구조)
- [백엔드 아키텍처](#-백엔드-아키텍처)
- [개발 도구](#-개발-도구)

## 🚀 실행방법

### Docker를 이용한 실행

#### 사전 요구사항
- Docker & Docker Compose 설치
- Git 설치

#### 1단계: 프로젝트 클론
```bash
# 프로젝트 클론
git clone git@github.com:risha939/hupis.git
cd hupis
```

#### 2단계: 환경변수 파일 설정
```bash
# 환경변수 파일 설정 
cp env.docker .env
```

#### 3단계: Docker 환경 실행
```bash
# 개발 환경 시작 (빌드 포함)
npm run docker:dev
```

#### 4단계: 서비스 접속
- **API 서버**: http://localhost:3000
- **API 문서 (Swagger)**: http://localhost:3000/docs/hupis
- **데이터베이스 관리 (pgAdmin)**: http://localhost:5050
  - Email: admin@hupis.com
  - Password: admin


### Docker 명령어 모음

```bash
# 개발 환경 시작 (빌드 포함)
npm run docker:dev

# 백그라운드에서 서비스 시작
npm run docker:up

# 서비스 중지
npm run docker:down

# 로그 확인
npm run docker:logs

# 컨테이너 재시작
npm run docker:restart

# DB 접속
npm run docker:db

# 앱 컨테이너 접속
npm run docker:shell

# 완전 정리 (볼륨 포함)
npm run docker:clean
```

## 🛠️ 기술 스택

- **NestJS**: ^11.0.1
- **TypeScript**: ^5.7.3
- **Node.js**: 20+ (현재 사용: v22.19.0)
- **PostgreSQL**: 15+ (현재 사용: v17.6, Docker: postgres:15-alpine)
- **TypeORM**: ^0.3.27

### Authentication & Security
- **JWT**: @nestjs/jwt ^11.0.0, passport-jwt ^4.0.1
- **Argon2**: ^0.44.0
- **Passport**: @nestjs/passport ^11.0.5, passport ^0.7.0

### Development & Documentation
- **Swagger/OpenAPI**: @nestjs/swagger ^11.2.0, swagger-ui-express ^5.0.1
- **Docker**: Docker Compose 3.8
- **ESLint & Prettier**: eslint ^9.18.0, prettier ^3.4.2
---

**PostgreSQL 선택 이유**  
소셜 미디어 플랫폼의 특성상 대용량 데이터 조회가 빈번하게 발생하고, 다양한 관계형 데이터를 효율적으로 관리해야할 필요성이 있다고 생각합니다. psql 의 최대 강점은 다양한 인덱스 유형을 지원하고, 대용량 데이터 처리가 가능하며, 복잡한 쿼리도 안정적으로 처리하는 성능을 가지고 있는것으로 알고 있습니다. 이는 나중에 필요해 질 것"을 커버 가능하다고 판단 했습니다.  

**TypeORM 선택 이유**  
TypeScript 호환이 가장 잘 된다는 점이 선택 이유가 크고, 데코레이터를 사용할 수 있기 떄문에 스키마 정의 편의성 + 가독성 및 타입 안정성을 확보하기 좋아서 선택하였습니다.  

**Access Token + Refresh Token 방식 선택 이유**  
짧은 유효기간의 Access Token 으로 보안성을 높히며, Refresh Token 으로 자동 재발급이 가능하기 때문에 사용자는 로그인을 자주 반복하지 않아도 된다는 편의성, 그리고 추후 Refresh Token을 디바이스 별로 관리할 시 다중 디바이스를 세밀하게 제어할 수 있습니다.

## 📁 디렉토리 구조

```
src/
├── auth/                    # 인증 관련 모듈
│   ├── jwt.guard.ts        # JWT 가드
│   └── jwt.strategy.ts     # JWT 전략
├── config/                  # 설정 파일들
│   ├── database.config.ts  # 데이터베이스 설정
│   ├── jwt.config.ts       # JWT 설정
│   ├── swagger.ts          # Swagger 설정
│   └── utils.ts            # 유틸리티 함수
├── post/                    # 게시글 관련 모듈
│   ├── category/           # 카테고리 관리
│   ├── comment/            # 댓글 기능
│   ├── like/               # 좋아요 기능
│   ├── post/               # 게시글 CRUD
│   └── repost/             # 리포스트 기능
├── shared/                  # 공통 모듈
│   ├── decorators/         # 커스텀 데코레이터
│   ├── dto/                # 공통 DTO
│   ├── interceptors/       # 인터셉터
│   └── types/              # 공통 타입 정의
├── user/                    # 사용자 관리 모듈
│   ├── dto/                # 사용자 DTO
│   ├── entities/           # 사용자 엔티티
│   ├── response/           # 응답 DTO
│   └── types/              # 사용자 타입
├── app.controller.ts        # 루트 컨트롤러
├── app.module.ts           # 루트 모듈
├── app.service.ts          # 루트 서비스
└── main.ts                 # 애플리케이션 진입점
```

### 주요 디렉토리 설명

- **`auth/`**: JWT 기반 인증 시스템 구현
- **`config/`**: 데이터베이스, JWT, Swagger 등 설정 관리
- **`post/`**: 게시글, 댓글, 좋아요, 리포스트 등 소셜 기능 구현
- **`shared/`**: 프로젝트 전반에서 사용되는 공통 모듈
- **`user/`**: 사용자 등록, 로그인, 프로필 관리 기능

## 🏗️ 백엔드 아키텍처

### 현재 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client        │    │   NestJS API    │    │   PostgreSQL    │
│   (Frontend)    │◄──►│   Server        │◄──►│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   pgAdmin       │
                       │   (DB Admin)    │
                       └─────────────────┘
```

### 데이터베이스 설계

![Database Schema](https://velog.velcdn.com/images/risha939/post/5e869254-1fc7-4b2e-999a-8ee6b90da47b/image.png)


### 이후 개선안

#### 1. 성능 최적화
- [ ] 데이터베이스 쿼리 최적화
- [ ] Redis 캐싱 도입

#### 2. 확장성 개선
- [ ] 마이크로서비스 아키텍처 전환 검토
- [ ] 메시지 큐 도입
- [ ] 로드 밸런싱 구성

#### 3. 모니터링 및 로깅
- [ ] APM (Application Performance Monitoring) 도입
- [ ] 헬스체크 엔드포인트 추가

#### 4. 개발 개선
- [ ] 자동화된 테스트 커버리지 도입

## 🔧 개발 도구

### 로그 확인
```bash
# 전체 서비스 로그
npm run docker:logs

# 특정 서비스 로그
docker-compose logs -f app      # 애플리케이션 로그
docker-compose logs -f postgres # 데이터베이스 로그
docker-compose logs -f pgadmin  # pgAdmin 로그
```
