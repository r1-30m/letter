# 훈련소 인편 서비스

훈련병과 가족들이 편지를 주고받을 수 있는 웹 서비스입니다.

## 기능

- 회원가입/로그인
- 훈련병 조회
- 편지 작성 및 전송
- 메일함 (받은 편지함)
- 편지 삭제

## 기술 스택

- **Frontend**: React, Styled Components
- **Backend**: Node.js, Express
- **Database**: SQLite
- **Deployment**: Vercel

## 로컬 개발 환경

### 백엔드 실행
```bash
cd server
npm install
npm start
```

### 프론트엔드 실행
```bash
cd client
npm install
npm start
```

## 배포

이 프로젝트는 Vercel을 통해 배포됩니다.

### 배포 방법

1. [Vercel](https://vercel.com)에 가입
2. GitHub 저장소 연결
3. 자동 배포 설정

### 환경 변수

배포 시 다음 환경 변수를 설정하세요:
- `NODE_ENV`: production

## API 엔드포인트

- `POST /api/register` - 회원가입
- `POST /api/login` - 로그인
- `POST /api/search-trainee` - 훈련병 조회
- `POST /api/check-id` - ID 중복 확인
- `POST /api/send-letter` - 편지 전송
- `POST /api/letters` - 편지 목록 조회
- `POST /api/delete-letter` - 편지 삭제

## 라이선스

MIT License 