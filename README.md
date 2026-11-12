# Team Nter · 독스루 (Docthru)

> 📌 개발 문서 번역 챌린지 서비스 "독스루"<br>
> 챌린지 신청 · 승인부터 번역 작성 · 피드백 · 좋아요 · 알림까지

## 1. 팀 이름

**Team Nter**

팀 협업 문서 링크: [노션 바로가기](https://app.notion.com/p/4012b190d85f804a8f5af1059e92e813?v=d3a2b190d85f836ab32888f5b3690199&source=copy_link)

## 2. 팀원 구성

| 이름              | 담당                                              | 개인 GitHub 링크                    |
| ----------------- | ------------------------------------------------- | ----------------------------------- |
| **이지우** (팀장) | 번역 작업물 상세 · 작성 · 수정, 피드백            | https://github.com/Rasol07          |
| **김하경**        | 랜딩 · 회원가입 · 로그인, 배포                    | https://github.com/Arden-Sol        |
| **이홍균**        | 챌린지 목록 · 상세 · 참여, 어드민 챌린지 목록     | https://github.com/cycling-lion-cub |
| **김재영**        | 챌린지 신청 · 나의 챌린지, 어드민 신청 관리, 알림 | https://github.com/yangpahub        |

## 3. 프로젝트 소개

대다수의 개발 콘텐츠가 영어로 작성되어 있어, 영어에 익숙하지 않은 개발자는 새로운 기술을 익히기 어렵습니다.
**독스루**는 개발 관련 영어 문서를 함께 번역하는 **챌린지**를 열고, 에디터에서 번역을 작성하며, 서로의 번역에 **피드백과 좋아요**를 주고받는 서비스입니다.

**프로젝트 기간**: 2026.10.23 ~ 2026.11.12

## 4. 기술 스택

| 구분      | 사용 기술                                                                                    |
| --------- | -------------------------------------------------------------------------------------------- |
| Frontend  | JavaScript, Next.js 16 (App Router), React 19, vanilla-extract, TanStack Query v5, Tiptap v3 |
| Backend   | Node.js 24, Express 5, Prisma ORM 8, zod 4, bcrypt, jsonwebtoken, Swagger (zod-openapi)      |
| Database  | PostgreSQL (Render)                                                                          |
| 인증      | JWT (accessToken · refreshToken httpOnly 쿠키), Google OAuth 2.0                             |
| 공통 Tool | Git & GitHub, Notion, CodeRabbit (코드 리뷰)                                                 |
| 배포      | Netlify (프론트) · Render (백엔드 · DB)                                                      |

## 5. 팀원별 구현 기능 상세

### 이지우 (팀장)

- 공용 컴포넌트
  - Button · Input · Textarea · Modal · ConfirmModal · DeleteConfirmModal · Popover · Pagination · QueryBoundary 구현 및 팀 공유
  - 공용 Header · Container 레이아웃 구현
  - 공용 Modal: Esc 연타 시 dialog만 닫히고 overlay가 남는 문제 수정
- 번역 작성 페이지 (에디터)
  - Tiptap 에디터로 번역 작성 · 제출 기능 구현 (서식 툴바 · 코드 블록 하이라이트)
  - 임시저장(SubmissionDraft) 저장 · 불러오기 모달 구현, 나가기 확인 모달
- 번역 작업물 상세 페이지
  - fetch(GET)를 사용하여 작업물 조회, 비로그인 상태에서도 조회 가능
  - 작업물 좋아요 기능 및 인증 · 캐시 동기화
  - 피드백 조회 · 작성 · 수정 · 삭제 기능 구현 (더보기 페이지네이션)
  - 작업물 수정 · 삭제 기능 구현 (관리자 삭제 시 삭제 사유 입력)
  - "챌린지로 돌아가기" 링크로 작업물에서 챌린지 상세로 바로 이동
- 백엔드
  - 작업물(Submission) · 피드백 · 임시저장 · 좋아요 API 구현 (검증 및 트랜잭션 처리)
  - 작업물 · 피드백 생성 · 수정 · 삭제 시 알림 생성
  - 요청 출처(Origin) 검사 미들웨어 작성
  - API Swagger 문서 정리 (`/docs`)
- 대소문자 파일명 · 파일 경로 리팩토링 (리눅스 배포 빌드 오류 방지)

### 김하경

- 프로젝트 초기 세팅
  - 백엔드 프로젝트 초기 세팅 (Layered 구조 · 전역 에러 처리 · CORS · 요청 검증 미들웨어)
  - Render 배포 설정 및 Prisma 연동, 개발용 시드 스크립트 작성
  - 프론트 TanStack Query 초기 설정
- 인증 구조
  - JWT accessToken · refreshToken 발급 및 httpOnly 쿠키 인증, 비밀번호 해시 처리
  - 요청마다 로그인 사용자를 식별하는 미들웨어, 내 정보 조회(`useMe`) 훅
- 회원가입 · 로그인 · 로그아웃
  - 인증 API 연동 및 로그인 · 회원가입 페이지 구현, 인증 mutation 훅 분리
  - 회원가입 유효성 검증 및 중복 가입 방지 강화 (백엔드)
  - 헤더 로그인 영역 · 사용자 메뉴(등급 표시 · 로그아웃) 구현
  - 로그인 · 회원가입 페이지 UI 스타일링
- 구글 소셜 로그인
  - 구글 OAuth 로그인 · 회원가입 API 구현 (state 검증 · PKCE)
  - 프론트엔드 구글 로그인 연동
- 랜딩 페이지
  - 비로그인 사용자 대상 서비스 소개 랜딩 페이지 구현, 로그인 사용자는 랜딩을 보지 않도록 처리
- 배포
  - Next.js rewrites 프록시로 배포 환경(Netlify — Render)의 쿠키 유실 문제 해결

### 이홍균

- 프로젝트 초기 세팅
  - 프론트 프로젝트 초기 세팅 및 라우팅 폴더 구조 생성
- 챌린지 목록 페이지
  - fetch(GET)를 사용하여 챌린지 목록 조회 (페이지네이션 · 제목 검색 · 분야 다중 필터 · 문서 타입 · 진행 상태 · 정렬)
  - 검색 · 필터 · 정렬 · 페이지 상태를 URL 쿼리와 동기화
  - 정렬 드롭다운 · 필터 팝업(모바일 시트) 디자인 적용
  - 카드 전체 클릭(stretched link) 및 hover 모션 적용, 나의 챌린지 카드에도 동일 적용
- 챌린지 상세 페이지
  - 로그인 · 역할 · 마감 · 참여 · 제출 · 정원 상태에 따른 버튼 분기 (도전하기 · 계속 도전하기 · 내 작업물 보기 등)
  - fetch(POST)를 사용하여 챌린지 참여하기 구현
  - 참여 현황: 좋아요 기준 공동 순위 · 1등 왕관 표시 · 페이지네이션
  - 마감된 챌린지의 최다 추천 번역 캐러셀 (여러 개 넘기기 · 펼치기 / 접기)
- 어드민 챌린지 관리
  - 챌린지 목록 · 상세의 ⋮ 메뉴에서 삭제 사유 입력 후 챌린지 삭제
  - 어드민에게 신규 챌린지 신청 버튼 숨김
- 헤더 네비게이션
  - 역할별 메뉴 (어드민: 챌린지 관리 · 챌린지 목록 / 일반: 챌린지 목록 · 나의 챌린지 / 비로그인: 챌린지 목록)
  - 현재 페이지 강조, hover 모션, 모바일 심볼 로고
- 백엔드
  - 공개 챌린지 목록 · 상세 조회 API, 마감 후 첫 조회 시 최다 추천 작업물 자동 채택
  - 챌린지 참여하기 · 포기하기 API, 관리자 참여 차단
  - 참여 동시성 처리: 트랜잭션 + 행 잠금으로 정원 초과 방지, 유니크 제약으로 중복 참여 방지
  - 참여 현황 목록 API (공동 순위 rank 계산)
  - 시연용 시드 데이터 (실제 개발 문서 기반 챌린지 120개 · 작업물 · 좋아요 · 피드백)

### 김재영

- 공용 컴포넌트
  - 챌린지 카드 · 칩 공용 컴포넌트 구현
- 신규 챌린지 신청
  - fetch(POST)를 사용하여 챌린지 신청 폼 구현
  - 비로그인 상태에서 신청 시 로그인 후 신청 페이지로 돌아오도록 처리
- 나의 챌린지 페이지
  - 참여중 · 완료한 · 신청한 챌린지 탭 구현, 제출 여부에 따른 버튼 분기
  - 신청한 챌린지 상세 · 신청 취소 · 수정, 거절된 챌린지 재신청
- 어드민 챌린지 신청 관리
  - 신청 목록 (상태 다중 필터 · 정렬 · 검색)
  - 신청 상세 및 승인 · 거절 (거절 사유 모달), 이전 · 다음 챌린지 이동
  - 어드민 페이지 접근 제한 (AdminGuard)
- 알림
  - 헤더 알림 목록 · 읽음 · 모두 읽음 기능 구현
- 백엔드
  - 인증 · 권한 미들웨어(authorization) 작성
  - 내 챌린지 목록 API (참여중 · 완료 목록에 내 제출물 id 포함)
  - 어드민 신청 목록 / 상세 · 승인 · 거절 · 취소 API 구현
  - 챌린지 상태 변경 알림 생성 및 알림 목록 · 읽음 · 모두 읽음 API 구현
  - 신청자 챌린지 수정 API, 거절 · 취소 사유(moderation) 기록

## 6. 파일 구조

> 📌 기준: GitHub `development` 브랜치 최신 (back `98abf4c`)<br>
> `node_modules/` · `env/.env.development`(gitignored)는 트리에서 제외했습니다.<br>
> Layered Architecture: **Controller(라우트 · DTO 검증) → Service(비즈니스 로직 · 트랜잭션) → Repository(Prisma 쿼리)** 순서로 호출합니다.

```text
백엔드 back-end/
├── package.json · pnpm-lock.yaml · pnpm-workspace.yaml   # Express 5 · Prisma ORM 8 · zod 4 · bcrypt · jsonwebtoken · Swagger
├── prisma.config.ts                        # Prisma CLI 설정 (contract 경로 · DB 연결)
├── eslint.config.js · jsconfig.json · .prettierrc · .prettierignore · .nvmrc
├── .gitignore
├── README.md
├── env/
│   └── .env.example                        # DATABASE_URL · JWT 시크릿 · Google OAuth · CORS · 시드 비밀번호 예시
├── migrations/                             # DB 스키마 변경 이력
│   ├── app/refs/db.json                    # 현재 적용된 스키마 버전
│   └── snapshots/<hash>/                   # 버전별 스키마 스냅샷 (contract.json · contract.d.ts, 7개)
├── scripts/
│   ├── seed.js                             # 시연용 시드 (DB 초기화 → 유저 · 챌린지 · 참여 · 작업물 · 좋아요 · 피드백 · 알림)
│   └── seed-data.js                        # 시드용 한글 데이터 (실제 개발 문서 120개 · 작업물 본문 생성기 · 피드백)
└── src/
    ├── main.js                             # 서버 시작점 (DI 컨테이너 생성 → listen → 종료 처리)
    ├── app.js                              # Express 앱 구성 (미들웨어 → 라우트 → Swagger → 에러 핸들러)
    ├── config/
    │   └── config.js                       # zod 환경변수 검증 (PORT · DB · JWT · OAuth · CORS · URL)
    ├── prisma/
    │   ├── contract.prisma                 # DB 스키마 (User · Challenge · Participation · Submission · SubmissionDraft · SubmissionLike · Feedback · Notification · ModerationLog)
    │   ├── contract.json · contract.d.ts   # 스키마에서 생성된 계약 파일
    │   └── db.js                           # Prisma DB 클라이언트
    ├── common/
    │   ├── di/container.js                 # 의존성 주입 (Repository → Service → Controller 연결)
    │   ├── constants/
    │   │   ├── challenge.js                # 분야 · 문서 타입 · 상태 · 정렬 · 처리(action) 상수
    │   │   ├── error.js                    # 에러 메시지 모음
    │   │   ├── http-stats.js               # HTTP 상태 코드
    │   │   ├── time.js                     # 시간 단위 상수
    │   │   ├── shortNickname.js            # 소셜 가입 시 임시 닉네임 생성
    │   │   └── index.js
    │   ├── exceptions/                     # HttpException + 400 · 401 · 403 · 404 · 409 예외 클래스
    │   ├── schemas/id.schema.js            # 경로 ID(양의 정수) 공용 검증
    │   └── lifecycle/graceful-shutdown.js  # 종료 신호 시 서버 · DB 연결 정리
    ├── middlewares/
    │   ├── cors.middleware.js              # 허용된 출처만 CORS 허용
    │   ├── origin-guard.middleware.js      # 쓰기 요청의 Origin · Referer 검사
    │   ├── identify-user.middleware.js     # 쿠키 토큰으로 요청 사용자 식별 (전역)
    │   ├── authorization.middleware.js     # 로그인 필수 · 관리자 전용 검사
    │   ├── validation.middleware.js        # zod DTO로 body · query · params 검증
    │   ├── error-handler.middleware.js     # 전역 에러 → 공통 응답 JSON
    │   └── index.js
    ├── providers/
    │   ├── token.provider.js               # JWT accessToken · refreshToken 발급 · 검증
    │   ├── cookie.provider.js              # 인증 쿠키 설정 (httpOnly · sameSite · secure)
    │   ├── password.provider.js            # bcrypt 비밀번호 해시 · 비교
    │   ├── social.provider.js              # Google OAuth 요청 · 토큰 교환
    │   ├── oauth-state.provider.js         # OAuth state 서명 · 검증, PKCE, 이동 경로(next) 검증
    │   └── index.js
    ├── controllers/                        # 라우트 정의 + 요청 · 응답 (도메인별 폴더, dto/에 zod 스키마)
    │   ├── base.controller.js              # 공용 라우터 생성
    │   ├── auth/                           # 회원가입 · 로그인 · 로그아웃 · 구글 로그인 / 콜백
    │   ├── user/                           # 내 정보 · 내 챌린지 목록 · 알림 목록 · 읽음 · 모두 읽음
    │   ├── challenge/                      # 챌린지 목록 · 상세 · 신청 · 수정 · 취소, 어드민 목록 · 상세
    │   ├── moderation-log/                 # 챌린지 승인 · 거절 · 취소(삭제)
    │   ├── participation/                  # 참여하기 · 포기하기 · 참여 현황 · 참여 정보
    │   ├── submission/                     # 작업물 작성 · 목록 · 상세 · 수정 · 삭제
    │   ├── submission-draft/               # 임시저장 조회 · 저장 · 삭제
    │   ├── submission-like/                # 좋아요 등록 · 취소
    │   ├── feedback/                       # 피드백 목록 · 작성 · 수정 · 삭제
    │   └── index.js
    ├── services/                           # 비즈니스 로직 · 권한 검사 · 트랜잭션
    │   ├── auth.service.js · social.service.js · user.service.js   # 인증 · 소셜 로그인 · 유저
    │   ├── challenge.service.js            # 챌린지 조회 · 신청 · 수정 · 마감 후 최다 추천 채택
    │   ├── moderation-log.service.js       # 승인 · 거절 · 취소 + 상태 변경 알림
    │   ├── participation.service.js        # 참여(트랜잭션 + 행 잠금) · 포기 · 참여 현황 공동 순위
    │   ├── submission.service.js           # 작업물 + 작성 · 수정 · 삭제 알림
    │   ├── submission-draft.service.js · submission-like.service.js   # 임시저장 · 좋아요
    │   ├── feedback.service.js             # 피드백 + 작성 · 수정 · 삭제 알림
    │   ├── notification.service.js         # 알림 목록 · 읽음 처리
    │   └── index.js
    ├── repositories/                       # Prisma 쿼리 (도메인별)
    │   ├── user.repository.js · challenge.repository.js · participation.repository.js
    │   ├── submission.repository.js · submission-draft.repository.js · submission-like.repository.js
    │   ├── feedback.repository.js · notification.repository.js · moderation-log.repository.js
    │   └── index.js
    └── docs/                               # Swagger 문서 (/docs)
        ├── openapi.js                      # 문서 전체 조립
        ├── paths/                          # 도메인별 API 경로 문서 (zod DTO 재사용)
        ├── schemas/                        # 응답 스키마
        ├── examples.js                     # 요청 예시 값
        └── helpers.js                      # 문서 작성 헬퍼
```

> 프론트엔드 코드와 파일 구조는 [team-Nter/front-end](https://github.com/team-Nter/front-end) 레포에서 확인할 수 있습니다.

## 7. 구현 홈페이지

https://nter.netlify.app/
