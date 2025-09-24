# PostgreSQL + TypeORM 설정 가이드

## 설치 (필수 패키지)
다음 패키지를 설치하세요:

```bash
npm i @nestjs/typeorm typeorm pg @nestjs/config
```

## 환경변수
프로젝트 루트에 `.env` 파일을 생성하고 아래 값을 설정하세요:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=hupis
DB_SSL=false
NODE_ENV=development
PORT=3000
```

## 실행

```bash
npm run start:dev
```

처음 실행 시 `synchronize`가 활성화되어 `users` 테이블이 자동 생성됩니다. 운영환경에서는 `NODE_ENV=production`으로 설정하여 스키마 동기화를 비활성화하세요.