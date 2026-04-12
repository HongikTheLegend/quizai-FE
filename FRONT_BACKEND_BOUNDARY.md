# QuizAI Frontend / Backend Boundary

프론트엔드와 백엔드의 책임 경계를 명확히 하기 위한 기준 문서입니다.  
목표: 개발 병렬화, 커뮤니케이션 비용 감소, API 변경 리스크 최소화.

## 1) 책임 분리 원칙

- 프론트엔드 책임
  - 사용자 인터페이스/상호작용
  - 클라이언트 상태 관리 및 화면 전환
  - API 호출, 응답 표시, 로딩/에러 UX
  - WebSocket 연결 수명 관리(연결/해제/이벤트 렌더링)
- 백엔드 책임
  - 인증/인가 검증(JWT, 권한 체크)
  - 비즈니스 로직/데이터 무결성
  - 퀴즈 생성 파이프라인(문서 처리, AI 호출)
  - 실시간 세션 상태의 단일 진실 원천(source of truth)

## 2) 데이터 계약 (Contract) 책임

- 백엔드가 정의/보장
  - OpenAPI 스키마, 필드 타입, 필수/선택 여부
  - 에러 포맷(HTTP 코드, `detail` 또는 `message`)
  - WebSocket 이벤트 포맷(`type`, `payload`)
- 프론트엔드가 준수
  - 백엔드 스키마 기반 TypeScript 타입 동기화
  - 계약 외 필드 의존 금지
  - 예외/빈값/지연 응답에 대한 방어적 렌더링

## 3) 기능별 경계

### 인증(Auth)

- 프론트
  - 로그인/회원가입 폼, 입력 검증, 토스트, 리다이렉트
  - access token 저장 및 요청 헤더 주입
- 백엔드
  - `/auth/login`, `/auth/register` 구현
  - 토큰 발급/검증, role 포함 사용자 정보 반환

### 강의 업로드 / 퀴즈 생성

- 프론트
  - PDF 파일 선택, 업로드 진행 상태, Skeleton UI
  - 생성 요청 트리거, 결과 목록 렌더링
- 백엔드
  - `/lectures/upload` 파일 수신/저장
  - `/quizzes/generate` 실제 퀴즈 생성 및 저장
  - 비동기 처리 시 상태값 제공(`processing`, `ready`, `failed`)

### 세션/참여코드

- 프론트
  - 세션 시작 버튼, 참여코드 표시, 학생 코드 입력 UI
  - 웹소켓 이벤트 표시 및 제출 UX
- 백엔드
  - `/sessions/start`에서 참여코드 생성 및 유일성 보장
  - `/sessions/join`에서 코드 검증 및 세션 연결
  - 세션 상태 전이 규칙 관리(waiting/active/ended)

### 실시간(WebSocket)

- 프론트
  - `useQuizSocket` 훅에서 연결 관리
  - `quiz_started`, `answer_submitted`, `session_ended` 이벤트 반영
- 백엔드
  - 세션별 브로드캐스트 라우팅
  - 이벤트 발행 순서/재시도/종료 처리

### 운영자(Admin)

- 프론트
  - 운영 대시보드, 사용자/세션/강의 관리 화면
- 백엔드
  - 관리자 전용 API 권한 검사
  - 감사 로그, 민감 작업 기록

## 4) 에러 처리 경계

- 프론트
  - 사용자 친화 메시지, 재시도 버튼, 폴백 UI
  - 네트워크 장애/타임아웃 처리
- 백엔드
  - 안정적인 에러 코드/메시지 제공
  - 내부 예외를 표준 에러 포맷으로 매핑

## 5) 배포 경계

- 프론트(Vercel)
  - 빌드/정적 자산/SSR 실행
  - 환경변수: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`
- 백엔드(예: Render/Fly.io/EC2 등)
  - API 서버, DB, 스토리지, AI 연동
  - CORS 및 WebSocket origin 허용 목록 관리

## 6) 변경 프로세스 (필수)

1. 백엔드가 API 스펙 변경 PR/문서 공유
2. 프론트가 타입/서비스 계층 반영
3. 통합 테스트(로그인, 업로드, 퀴즈 생성, 세션 참여)
4. 배포 전 스테이징에서 e2e 확인

## 7) 현재 프로젝트 기준 TODO

- `/sessions/join` 백엔드 최종 지원 여부 확정
- 업로드/퀴즈 생성 응답 스키마 고정
- WebSocket 인증 방식(헤더/쿼리/쿠키) 확정
- 운영자 API 범위(사용자 권한 변경, 강제 종료 등) 확정

## 8) 백엔드 수동 검증 (Swagger / OpenAPI)

아래는 **종료된(ended) 세션** 집계와 강사 대시보드가 기대대로인지 확인할 때 쓰는 절차입니다.

### A. `GET /sessions/{id}/result`

1. **Authorize** → 로그인하여 받은 access token 입력  
2. `GET /sessions/{id}/result` → **Try it out**  
3. `session_id` 경로에 **ended 상태** 세션 UUID 입력 후 **Execute**

**성공 응답 예시(필드):** `total_students`, `avg_score`, `grade_distribution`(`excellent` / `needs_practice` / `needs_review`), `students`(`student_id`, `nickname`, `score`, `grade`).  
`students[].answers`, `session_id`, `weak_concepts`, `quiz_stats`는 백엔드가 생략할 수 있으며, 프론트 타입은 이를 허용합니다.

**세션 UUID를 모를 때:** Supabase → Table Editor → `sessions` 테이블에서 `session_code`(예: `C3D4`)로 행을 찾아 해당 행의 `id`(UUID)를 복사합니다.

### B. `GET /dashboard/instructor`

1. 강사 계정(예: `instructor1@test.com`)으로 로그인한 토큰으로 **Authorize**  
2. `GET /dashboard/instructor` → **Try it out** → **Execute**  
3. `recent_sessions`에 **ended 세션만** 노출되는지(또는 정책대로 필터되는지) 확인합니다.

---

이 문서는 기능 추가 시 갱신하며, 프론트/백엔드 모두 같은 버전을 기준으로 개발합니다.
