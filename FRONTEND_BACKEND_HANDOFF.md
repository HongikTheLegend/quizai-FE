# QuizAI 프론트엔드 작업 정리 · 백엔드 전달 사항

작성 기준: 2026-04-11, 브랜치 `develop` 기준 코드 스냅샷.

---

## 1. 프론트엔드에서 구현·변경한 내용 요약

### 1.1 공통 · 인프라
- **API 프록시** (`src/app/api/proxy/[...path]/route.ts`): 브라우저 CORS 회피용. `API_SERVER_URL`로 업스트림 전달, `ENABLE_PROXY_MOCK_FALLBACK`이 `false`가 아니면 업스트림 503/네트워크 실패 시 계약 형태의 **모의 JSON** 응답.
- **클라이언트** (`NEXT_PUBLIC_API_URL=/api/proxy` 권장): Axios `apiRequest`, Bearer `access_token` 주입.
- **랜딩(메인)** (`/`): 마케팅형 홈. `/`, `/login`, `/register`는 **사이드바 없는 전체 폭** 레이아웃.
- **AuthGuard**: `/`는 공개. 로그인 상태에서 `/login`·`/register` 접근 시 역할 홈으로 리다이렉트.
- **UI 톤**: 글로벌 테마·히어로·셸 정비(인디고 계열, 그라데이션 배경 등). 기술 용어(세션 ID, Connected 등)를 사용자용 문구로 완화.

### 1.2 인증
- **로그인·회원가입**: 폼 상단 **역할 선택**(수강생 / 교강사 / 운영자). 성공 후 저장·이동은 **선택 역할**을 반영(`saveAuthSession`의 `user.role`).
- 로그인 요청 body에 `role` 포함(서버가 무시할 수 있음). 프록시 모의 로그인은 body의 `role`을 **이메일 휴리스틱보다 우선**.
- **JWT 페이로드 디코드**(`src/lib/jwt-payload.ts`): `user.role`이 비어 있거나 잘못될 때 `role` / `realm_access.roles` / `authorities` 등에서 역할 보강.
- 모의 토큰은 JWT 형태의 unsigned 페이로드로 `role` 포함.

### 1.3 수강생
- **개인 홈** (`/student/dashboard`): `GET /students/me/quiz-results`로 **내 퀴즈 목록**, 항목 선택 시 `GET /sessions/{id}/result`로 상세. 본인 행 하이라이트(`user.id` / `user.name` 매칭).
- **`/student/sessions`**: 제거 대신 **`/student/dashboard?open=quiz-results`**로 리다이렉트.
- **퀴즈방 입장·플레이**: 참여코드, 실시간 패널(남은 시간·참여 인원·제출 집계). WebSocket 이벤트로 상태 누적(`quiz-ws-live-state.ts`).
- **수업 신청**: `GET /lectures`, `POST /lectures/{id}/enroll` (프록시 모의 포함).

### 1.4 교강사
- **강의 자료**: PDF+제목 업로드 후 **같은 `lecture_id`로 퀴즈 생성 API 자동 1회 호출**. 추가 문항은 같은 강의로 **붙이기(append)** / **전체 덮어쓰기(replace)**.
- **라이브 퀴즈**: 퀴즈방 생성, 참여코드, 실시간 활동·참가자 표(서버가 `participant_answer` 주면 개별 제출 표시).

### 1.5 운영자
- **`/admin/sessions`**: 방 ID(+선택 WebSocket URL)로 **모니터링 패널** 연결(교강사와 유사한 실시간 UI).

### 1.6 WebSocket(프론트 가정)
- 이벤트 파싱·라이브 상태: `session_joined`, `quiz_started`, `answer_update`, `answer_revealed`, `session_ended`, `participant_answer`(선택), `error`.
- `quiz_started`에 `quiz_id`, `question`, `options[]`, `time_limit` 필요(타이머·문항 표시).

---

## 2. 백엔드에 요청·합의가 필요한 사항

### 2.1 필수(화면이 의도대로 동작하려면)
| 구분 | 메서드·경로 | 비고 |
|------|-------------|------|
| 내 퀴즈 목록 | `GET /students/me/quiz-results` | Bearer 필수. 응답 예: `{ results: [{ session_id, title?, attended_at?, my_score?, grade? }] }`. **없으면** 수강생 대시보드 목록이 비거나 404. |
| 세션 결과 | `GET /sessions/{session_id}/result` | 기존 계약 유지. |
| 수강 신청 | `POST /lectures/{lecture_id}/enroll` | 선택. 없으면 수강 신청 버튼 404/에러. |
| 로그인 응답 | `POST /auth/login` | `user.role` 또는 **JWT `role` 클레임** 중 하나는 신뢰 가능하게. 프론트는 역할 선택으로 UI를 보정하지만 **API 권한은 토큰 기준**. |
| CORS | — | 브라우저 직접 호출 시 CORS 필요. 현재는 **동일 출처 `/api/proxy`** 권장. |

### 2.2 실시간(라이브 퀴즈 품질)
- **`session_joined`**: `participant_count`, `nickname` — 참가자 목록·인원 수.
- **`quiz_started`**: `time_limit`, `options` 배열 포함 권장.
- **`answer_update`**: `total`, `answered`, `rate`, `distribution` — 집계 바.
- **`participant_answer`** (권장): `{ nickname, quiz_id, submitted: boolean }` — 교강사/운영 **개별 제출** 열 정확도.

### 2.3 퀴즈 생성 플로우
- 업로드 직후 `POST /quizzes/generate` 연쇄 호출 — 백엔드가 **동기 응답**이면 현재 구조와 맞음. **비동기 파이프라인**이면 job id + 폴링/Webhook 계약 필요.

### 2.4 역할·보안
- 프론트의 **역할 선택**은 네비게이션용. **교강사/운영 API**는 서버에서 JWT/DB 역할 검증 필수.
- `POST /auth/login` body의 `role`을 서버가 신뢰해선 안 됨(클라이언트 조작 가능).

---

## 3. 환경 변수 체크리스트

| 변수 | 용도 |
|------|------|
| `NEXT_PUBLIC_API_URL` | 기본 `/api/proxy` |
| `API_SERVER_URL` | 프록시 업스트림 베이스 URL |
| `ENABLE_PROXY_MOCK_FALLBACK` | `false`면 503 시 모의 응답 비활성화 |
| `NEXT_PUBLIC_WS_URL` | WebSocket 베이스(프록시 미경유) |

---

## 4. 주요 파일 맵(참고)

- 프록시: `src/app/api/proxy/[...path]/route.ts`
- 인증 정규화: `src/lib/auth-response-normalize.ts`, `src/lib/jwt-payload.ts`
- WS 라이브 상태: `src/lib/quiz-ws-live-state.ts`, `src/hooks/use-quiz-socket.ts`
- 수강생 API: `src/services/student-service.ts`
- 랜딩: `src/components/marketing/home-landing.tsx`

---

## 5. Git

이 문서와 함께 `develop`에 커밋·푸시하는 것을 권장합니다. 백엔드 저장소와 공유 시 이 파일만 전달해도 됩니다.
