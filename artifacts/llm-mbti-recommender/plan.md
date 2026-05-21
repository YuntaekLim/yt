# LLM-MBTI Recommender 구현 계획

## 아키텍처 결정

| 결정 | 선택 | 이유 |
|---|---|---|
| 추천 엔진 | 정적 affinity 점수 기반 룩업 (런타임 LLM 호출 없음) | spec 불변규칙 "런타임 외부 의존성 제거". 입력 조합 폭발(약 6천만) → 룰 기반 점수 합산이 유일하게 실용적. 결정적 매칭 자연 만족. |
| affinity·텍스트 데이터 작성 | 개발 시점 Claude로 초안 생성 → JSON·TS로 커밋 | spec 의존성 항목과 일치. 런타임은 lookup만, 결과 품질은 데이터 품질 = 사람·LLM 협업으로 결정. |
| 진단 화면 라우팅 | 단일 페이지(`/`)에서 step state로 4단계 진행 | 4 routes는 뒤로가기 자연스럽지만 빈 URL 공유 위험·코드 분산. step state가 단순하고 진단 중 URL 깨끗. 결과만 별도 라우트(`/result`). |
| 입력 상태 영속화 | URL 쿼리스트링은 결과 단계에서만 | spec에서 결과 URL만 공유 대상. 진행 중 새로고침 시 처음부터 다시 — 진단 시간 3분 미만이라 수용 가능. |
| 칩 다중선택 컴포넌트 | shadcn ToggleGroup (`type=multiple`) | radix base 위, 다중선택 의미가 명시적, 키보드·접근성 기본 제공. |
| Toast 피드백 | 인라인 상태 기반 작은 div + setTimeout | sonner 의존 추가 회피. 토스트 사용처가 2곳뿐이라 자체 구현이 더 가벼움. |
| OG 이미지 | `next/og`를 사용한 `app/result/opengraph-image.tsx` | Next 16 표준 패턴. 동적 입력별 이미지 자동. |
| 결과 페이지 렌더 | Server Component (`app/result/page.tsx`) | LLM 호출 없으니 서버에서 정적 룩업·렌더가 가장 단순·빠름. 클라이언트 컴포넌트는 복사·공유 버튼만. |

## 인프라 리소스

| 리소스 | 유형 | 선언 위치 | 생성 Task |
|---|---|---|---|
| None | — | — | — |

런타임 LLM 호출이 사라지면서 API 키·KV·서버리스 추가 자원 불필요.

## 데이터 모델

### Input
- `mbti`: MBTI16 (16유형 중 하나)
- `jobs`: JobId[] (1개 이상, 8개 카테고리 중)
- `tasks`: TaskId[] (1개 이상, 10개 중)
- `priorities`: PriorityId[] (1개 이상, 4개 중)

### Model
- `id`: ModelId
- `displayName`: string (예: "Claude Opus 4.7")
- `vendor`: "anthropic" | "openai" | "google"
- `tier`: "large" | "small"
- `strengths`: string[] (대안 카드 한 줄 강점에 사용)

### Recommendation
- `main`: Model
- `alternatives`: Model[] (1-2개)
- `reasoning`: string (메인 카드 추천 근거 텍스트, 변수 치환됨)
- `systemPrompt`: string (메인 카드 시스템 프롬프트, 변수 치환됨)

### Affinity (정적 데이터)
- `byMbti`: Record<MBTI16, Record<ModelId, number>>
- `byJob`: Record<JobId, Record<ModelId, number>>
- `byTask`: Record<TaskId, Record<ModelId, number>>
- `byPriority`: Record<PriorityId, Record<ModelId, number>>

## 필요 스킬

| 스킬 | 적용 Task | 용도 |
|---|---|---|
| `shadcn` | 3, 4, 6, 7 | Button·Card·ToggleGroup·Separator·Badge 컴포넌트 사용·설치. base=radix 일관 규칙. |
| `next-best-practices` | 5, 6, 8 | App Router · Server vs Client Component 경계 · async params 처리 · metadata·OG. |
| `vercel-composition-patterns` | 3, 4 | MbtiGrid·ChipMultiSelect 재사용 가능 컴포넌트 설계. |
| `vercel-react-best-practices` | 5, 6 | useDiagnosis hook 성능, result 페이지 RSC 최적. |
| `web-design-guidelines` | 3, 4, 6, 7 | UI 리뷰 — 키보드 포커스·aria·터치 타겟. |

## 영향 받는 파일

| 파일 경로 | 변경 유형 | 관련 Task |
|---|---|---|
| `types/recommender.ts` | New | 1 |
| `lib/url-state.ts` · `lib/url-state.test.ts` | New | 1 |
| `data/models.ts` | New | 2 |
| `data/affinity.ts` | New | 2 |
| `data/templates.ts` | New | 2 |
| `lib/recommend.ts` · `lib/recommend.test.ts` | New | 2 |
| `components/diagnose/progress-dots.tsx` | New | 3 |
| `components/diagnose/mbti-grid.tsx` · `mbti-grid.test.tsx` | New | 3 |
| `components/diagnose/chip-multi-select.tsx` · `chip-multi-select.test.tsx` | New | 4 |
| `hooks/use-diagnosis.ts` · `use-diagnosis.test.ts` | New | 5 |
| `components/diagnose/diagnose-flow.tsx` · `diagnose-flow.test.tsx` | New | 5 |
| `app/page.tsx` | Modify | 5 |
| `app/layout.tsx` | Modify | 5 |
| `components/result/result-card.tsx` · `result-card.test.tsx` | New | 6 |
| `components/result/alternative-card.tsx` | New | 6 |
| `app/result/page.tsx` · `app/result/__tests__/page.test.tsx` | New | 6 |
| `app/result/page.tsx` | Modify | 8 (`generateMetadata` 추가) |
| `components/result/copy-prompt-button.tsx` · `copy-prompt-button.test.tsx` | New | 7 |
| `components/result/share-button.tsx` · `share-button.test.tsx` | New | 7 |
| `app/result/opengraph-image.tsx` | New | 8 |
| `e2e/diagnose.spec.ts` | New | 9 |
| `e2e/smoke.spec.ts` | Modify | 9 |
| `components/component-example.tsx` · `components/example.tsx` | Delete | 5 |

## Tasks

### Task 1: 입력 타입과 URL 쿼리스트링 검증·정규화

- **담당 시나리오**: Scenario 5 (full), Scenario 4 (불변 규칙 — 결정적 매칭의 순서 정규화)
- **크기**: S (2 파일)
- **의존성**: None
- **참조**:
  - (next-best-practices — async searchParams 처리)
- **구현 대상**:
  - `types/recommender.ts` — MBTI16, JobId, TaskId, PriorityId, ModelId 리터럴 유니온
  - `lib/url-state.ts` · `lib/url-state.test.ts` — `parseInputFromSearchParams`, `serializeInput`, `normalizeInput` (배열 정렬)
- **수용 기준**:
  - [ ] 정상 쿼리스트링 `?mbti=INTJ&jobs=ai,app&tasks=code,research&priorities=accuracy,creativity` → 정규화된 입력 객체로 파싱된다
  - [ ] `?mbti=` 누락/빈 값 → null 반환 (invalid)
  - [ ] `?mbti=ZZZZ` (16유형 외) → null 반환
  - [ ] `jobs`·`tasks`·`priorities` 중 정의 외 값이 섞이면 정의된 값만 남기고, 모두 정의 외면 null 반환
  - [ ] `?jobs=app,ai` 와 `?jobs=ai,app` 가 같은 정규화 입력으로 매핑된다 (배열 정렬)
- **검증**:
  - `bun run test lib/url-state`

### Task 2: 추천 엔진 + affinity·템플릿 데이터

- **담당 시나리오**: Scenario 1 (성공기준: 메인·대안·근거 텍스트·시스템 프롬프트), Scenario 4 (결정적), 불변규칙 (추천 후보 제약)
- **크기**: M (5 파일)
- **의존성**: Task 1 (입력 타입)
- **참조**:
  - (claude-api — 개발 시점 affinity·텍스트 초안 생성에 사용)
  - 결정된 모델 풀: Claude Opus 4.7 · Claude Haiku 4.5 · GPT-5 · GPT-4o-mini · Gemini 2.5 Pro
- **구현 대상**:
  - `data/models.ts` — 5개 모델 메타데이터 (displayName, vendor, strengths)
  - `data/affinity.ts` — MBTI/Job/Task/Priority별 모델 점수 (개발 시점 Claude로 초안, 사람이 보정)
  - `data/templates.ts` — `reasoningTemplate`, `systemPromptTemplate` 두 종. `{mbti}`, `{jobs}`, `{tasks}`, `{priorities}`, `{model}` placeholder 지원
  - `lib/recommend.ts` · `lib/recommend.test.ts` — `recommend(input): Recommendation`
- **수용 기준**:
  - [ ] 정규화 입력 객체 → 후보 풀(5개) 안에서 메인 모델 1개와 대안 모델 1-2개가 결정된다
  - [ ] 같은 입력 두 번 호출 → 두 결과의 메인·대안·근거·시스템 프롬프트가 완전히 일치한다
  - [ ] 입력 순서를 바꿔도(`jobs=ai,app` vs `app,ai`) 결과가 일치한다 (Task 1 정규화에 의존)
  - [ ] 메인 모델은 후보 풀에 정의된 5개 중 하나다
  - [ ] 어떤 유효 입력 조합이어도 메인이 결정된다 (`null` 반환 없음)
  - [ ] 결과의 `reasoning` 문자열에 입력으로 받은 MBTI 이름과 직무·작업·우선순위 표시 라벨이 들어 있다
  - [ ] 결과의 `systemPrompt` 문자열에 같은 라벨들이 들어 있다
- **검증**:
  - `bun run test lib/recommend`

---

### Checkpoint: Tasks 1-2 이후 (Logic Slice)
- [ ] 모든 테스트 통과: `bun run test lib`
- [ ] 빌드 성공: `bun run build`
- [ ] 임시 콘솔에서 `recommend(...)`를 호출해 결과 카드에 들어갈 데이터가 의미 있게 생성됨을 사람 눈으로 확인

---

### Task 3: MBTI 16유형 그리드 + 진행도 컴포넌트

- **담당 시나리오**: Scenario 1 (성공기준: MBTI 미선택 시 다음 비활성), wireframe Screen 0·4
- **크기**: M (4 파일)
- **의존성**: Task 1 (타입)
- **참조**:
  - (shadcn — Button 컴포넌트; ToggleGroup 단일 선택 대신 자체 그리드 cell — 16칸이라 ToggleGroup이 과함)
  - (web-design-guidelines — 키보드·터치 타겟)
  - `artifacts/llm-mbti-recommender/wireframe.html` Screen 0, 4
- **구현 대상**:
  - `components/diagnose/progress-dots.tsx` — `current: number`, `total: number`
  - `components/diagnose/mbti-grid.tsx` · `mbti-grid.test.tsx` — `value: MBTI16 | null`, `onChange`
- **수용 기준**:
  - [ ] 컴포넌트 마운트 → 16개 MBTI 라벨(`INTJ`...`ESFP`) 셀이 보인다
  - [ ] `value={null}`로 마운트 → 어떤 셀도 선택된 시각 상태가 아니다
  - [ ] 사용자가 "INTJ" 셀을 클릭 → `onChange("INTJ")`가 호출되고, 재렌더 시 "INTJ" 셀이 선택 상태로 보인다
  - [ ] "INTJ" 선택 후 "ENFP" 클릭 → "ENFP"만 선택 상태(단일 선택)
  - [ ] `<ProgressDots current={1} total={4} />` → 첫 번째 dot이 active 시각 상태, 나머지 3개는 비활성
- **검증**:
  - `bun run test components/diagnose/mbti-grid`

### Task 4: 다중선택 칩 컴포넌트 (직무·작업·우선순위 재사용)

- **담당 시나리오**: Scenario 1 (성공기준: 다중선택 0개 시 다음 비활성), wireframe Screen 1·5·6
- **크기**: S (2 파일)
- **의존성**: Task 1 (타입)
- **참조**:
  - (shadcn — ToggleGroup `type=multiple` 설치·사용)
  - (vercel-composition-patterns — generic prop 패턴으로 옵션 재사용)
  - `artifacts/llm-mbti-recommender/wireframe.html` Screen 1, 5, 6
- **구현 대상**:
  - `components/diagnose/chip-multi-select.tsx` · `chip-multi-select.test.tsx` — 제네릭 `<T extends string>`, props: `options: {value: T; label: string}[]`, `value: T[]`, `onChange`
  - `bunx --bun shadcn@latest add toggle-group` 선행
- **수용 기준**:
  - [ ] 옵션 8개 전달 → 칩 8개가 보인다
  - [ ] 칩 라벨 텍스트가 옵션의 label 그대로 렌더된다
  - [ ] `value=[]`로 마운트 → 어떤 칩도 선택 상태가 아니다
  - [ ] "인공지능" 칩 클릭 → `onChange(["ai"])` 호출, "인공지능" 칩이 선택 상태
  - [ ] 이미 선택된 칩 다시 클릭 → 그 값이 제거된 배열로 `onChange` 호출
  - [ ] `value=[]` 일 때 부모에서 받은 `selectedCount` derived가 0임 — Diagnose flow가 이 값으로 다음 버튼을 비활성화할 수 있다 (test는 onChange를 통해 검증)
- **검증**:
  - `bun run test components/diagnose/chip-multi-select`

---

### Checkpoint: Tasks 3-4 이후 (Form Primitives)
- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] 두 컴포넌트가 독립적으로 동작하며 props 계약대로 onChange 발생

---

### Task 5: 진단 흐름 페이지 (4단계 통합 + `app/page.tsx`)

- **담당 시나리오**: Scenario 1 (happy path 전체 — 클릭부터 `/result?<query>` 이동까지)
- **크기**: M (5 파일)
- **의존성**: Task 1 (URL 직렬화), Task 3 (MbtiGrid), Task 4 (ChipMultiSelect)
- **참조**:
  - (next-best-practices — 클라이언트 컴포넌트 경계, useRouter for navigation)
  - (vercel-react-best-practices — useReducer로 step state 관리)
  - `artifacts/llm-mbti-recommender/spec.md` Scenario 1
- **구현 대상**:
  - `hooks/use-diagnosis.ts` · `use-diagnosis.test.ts` — step state(1-4), 입력 상태(mbti/jobs/tasks/priorities), 진행도, `canAdvance`, `next()`, `prev()`, `buildResultPath()`
  - `components/diagnose/diagnose-flow.tsx` · `diagnose-flow.test.tsx` — 4단계 라우터 (현재 step에 따라 MbtiGrid · ChipMultiSelect · 결과 보기 버튼 렌더)
  - `app/page.tsx` — `<DiagnoseFlow />` 호출 (기존 `<ComponentExample />` 교체)
  - `app/layout.tsx` — title/description 메타데이터를 본 feature에 맞게 수정
  - `components/component-example.tsx`, `components/example.tsx` — 삭제
- **수용 기준**:
  - [ ] 첫 진입 시 MBTI 그리드 + 진행도 1/4 + 비활성 "다음" 버튼이 보인다
  - [ ] MBTI 카드 클릭 → "다음" 버튼이 활성된다
  - [ ] "다음" 클릭 → 직무 다중선택 화면 + 진행도 2/4 + 비활성 "다음" 버튼이 보인다
  - [ ] Step 2/3/4 어느 단계든 칩 1개 이상 선택 시에만 진행 가능
  - [ ] Step 4에서 우선순위 1개 이상 선택 후 버튼 라벨이 "결과 보기"로 보인다
  - [ ] Step 4 "결과 보기" 클릭 → 페이지가 `/result?mbti=...&jobs=...&tasks=...&priorities=...` 로 이동하고, 모든 입력값이 쿼리스트링에 포함된다
  - [ ] 각 단계에서 "이전" 버튼 클릭 → 이전 단계로 돌아가고 선택값이 유지된다 (Step 1엔 이전 없음)
- **검증**:
  - `bun run test components/diagnose/diagnose-flow hooks/use-diagnosis`
  - Browser MCP — `http://localhost:3000/` 에서 happy path 클릭, 결과 URL 단언, 증거 `artifacts/llm-mbti-recommender/evidence/task-5-flow.png` 저장

### Task 6: 결과 페이지 + 카드 (메인·대안)

- **담당 시나리오**: Scenario 1 (결과 카드 표시), Scenario 4 (결정적 매칭 — 동일 URL 두 번 진입 시 동일 결과), Scenario 5 (잘못된 URL → Step 1), Scenario 6 (다시 진단하기)
- **크기**: M (5 파일)
- **의존성**: Task 1 (URL 파싱), Task 2 (recommend), Task 5 (`/`로 redirect할 수 있도록)
- **참조**:
  - (next-best-practices — async `searchParams` props, Server Component + Client interactivity 경계, `redirect()`)
  - (shadcn — Card 컴포넌트, Button)
  - `artifacts/llm-mbti-recommender/wireframe.html` Screen 2
- **구현 대상**:
  - `components/result/result-card.tsx` · `result-card.test.tsx` — 메인 카드: 모델명, 근거 텍스트, 시스템 프롬프트 (자식 슬롯에 복사 버튼 받음)
  - `components/result/alternative-card.tsx` — 모델명 + 한 줄 강점
  - `app/result/page.tsx` · `app/result/__tests__/page.test.tsx` — 서버 컴포넌트, searchParams → URL 파싱 → 유효 시 추천 호출 후 카드 렌더, 무효 시 `redirect("/")`
  - 결과 페이지 하단에 "다시 진단하기" 링크 (`/` 로 navigate)
- **수용 기준**:
  - [ ] `/result?mbti=INTJ&jobs=ai,app&tasks=code,research&priorities=accuracy,creativity` 진입 → 메인 카드에 추천 모델명이 보인다
  - [ ] 결과 페이지 상단에 사용자가 선택한 MBTI·직무·작업·우선순위 라벨이 한 줄 요약으로 표시된다 (wireframe Screen 2 "당신의 진단" 영역)
  - [ ] 메인 카드에 근거 텍스트가 보이고, 그 안에 "INTJ", "인공지능", "어플리케이션SW", "코드 작성·리뷰", "기술 리서치·학습", "정확성", "창의성" 라벨이 모두 포함된다
  - [ ] 메인 카드에 시스템 프롬프트 텍스트 영역이 보이고, 위와 같은 라벨이 포함된다
  - [ ] 메인 카드 아래에 대안 카드 1-2개가 보이며, 각각 모델명과 한 줄 강점이 보인다
  - [ ] `/result?mbti=ZZZZ&...` 또는 누락된 입력으로 진입 → 진단 시작 페이지(`/`)로 이동한다
  - [ ] 같은 결과 URL 두 번 진입 → 두 응답의 메인 모델명·근거 텍스트가 일치한다
  - [ ] "다시 진단하기" 클릭 → `/` 로 이동하고 MBTI 그리드가 비선택 상태로 보인다
  - [ ] 결과 페이지 응답 HTML에는 쿼리스트링 입력값 외에 사용자 식별 가능한 정보(이메일·IP·세션·쿠키 등)가 포함되지 않는다 (불변 규칙 — 프라이버시)
- **검증**:
  - `bun run test components/result/result-card app/result`
  - Browser MCP — 정상 URL 진입 후 카드 가시성 확인, 잘못된 URL 진입 시 `/`로 리다이렉트 확인, 증거 `artifacts/llm-mbti-recommender/evidence/task-6-result.png`

---

### Checkpoint: Tasks 5-6 이후 (End-to-end Happy Path)
- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] 사람이 `bun run dev` 후 브라우저에서 진단을 끝까지 진행 → 결과 카드까지 도달 + 같은 결과 URL을 새 탭에서 열어 동일 결과 확인

---

### Task 7: 시스템 프롬프트 복사 + URL 공유 (인라인 토스트)

- **담당 시나리오**: Scenario 2 (프롬프트 복사 + 피드백), Scenario 3 (URL 공유 + 피드백)
- **크기**: M (4 파일)
- **의존성**: Task 6 (결과 카드에 슬롯으로 주입)
- **참조**:
  - (vercel-react-best-practices — useState + setTimeout cleanup, ref for clipboard fallback)
  - `artifacts/llm-mbti-recommender/wireframe.html` Screen 7, 8
- **구현 대상**:
  - `components/result/copy-prompt-button.tsx` · `copy-prompt-button.test.tsx` — props `text: string`, 클릭 시 `navigator.clipboard.writeText`, 라벨 1.5s 토글, 인라인 토스트 표시
  - `components/result/share-button.tsx` · `share-button.test.tsx` — 현재 `window.location.href` 복사, 동일 패턴
- **수용 기준**:
  - [ ] `<CopyPromptButton text="abc">` 클릭 → 클립보드에 정확히 "abc" 가 들어간다
  - [ ] 클릭 직후 버튼 라벨이 "복사됨" (또는 동등 텍스트)로 보이고, 1.5초 뒤 원래 라벨("복사")로 돌아온다
  - [ ] 클릭 직후 화면 하단(또는 카드 옆)에 "시스템 프롬프트가 복사되었어요" 같은 토스트가 보이고, 자동으로 사라진다
  - [ ] `<ShareButton>` 클릭 → 클립보드에 현재 페이지 URL이 정확히 들어간다 (테스트에서는 mock된 `location.href`)
  - [ ] ShareButton 클릭 직후 라벨이 "공유됨"으로 토글, 1.5초 뒤 원복, 토스트 노출
- **검증**:
  - `bun run test components/result/copy-prompt-button components/result/share-button`

### Task 8: OG 이미지 + 메타데이터

- **담당 시나리오**: Scenario 3 (OG 메타태그 + 모델명·MBTI 표시), 불변규칙 (URL 공유 가능성)
- **크기**: S (1-2 파일)
- **의존성**: Task 6 (결과 페이지 라우트 존재)
- **참조**:
  - (next-best-practices — `opengraph-image.tsx` 규약, `generateMetadata`)
  - Next.js 16 `next/og` API
- **구현 대상**:
  - `app/result/opengraph-image.tsx` — searchParams로부터 추천 결과 도출, ImageResponse로 모델명·MBTI 시각화
  - `app/result/page.tsx`에 `generateMetadata` 함수 추가 (title·description·OG 메타태그)
- **수용 기준**:
  - [ ] `curl http://localhost:3000/result?mbti=INTJ&...` 응답 HTML에 `<meta property="og:image" ...>`, `og:title`, `og:description` 가 모두 포함된다
  - [ ] OG 이미지 URL을 직접 요청 → 이미지 응답이 200 OK이고, 이미지의 alt나 메타에 "INTJ" 와 메인 모델명이 들어 있다
- **검증**:
  - `bun run test app/result` (메타데이터 단언)
  - Browser MCP — OG URL을 직접 열어 이미지 가시 확인, 증거 `artifacts/llm-mbti-recommender/evidence/task-8-og.png`

### Task 9: E2E 통합 테스트 (Playwright)

- **담당 시나리오**: Scenario 1 (전체 흐름), 5 (잘못된 URL), 6 (다시 진단하기) — 브라우저 단
- **크기**: S (2 파일)
- **의존성**: Tasks 5, 6, 7 (모든 UI 동작 가능)
- **참조**:
  - `playwright.config.ts` — webServer가 `bun run dev`로 자동 기동
- **구현 대상**:
  - `e2e/diagnose.spec.ts` — happy path, 잘못된 URL redirect, 다시 진단하기
  - `e2e/smoke.spec.ts` — title을 본 feature에 맞게 수정
- **수용 기준**:
  - [ ] Playwright: `/` 진입 → MBTI 선택 → 4단계 클릭 진행 → `/result?...` 페이지에서 추천 모델명이 보인다
  - [ ] Playwright: `/result?mbti=BAD` 진입 → 최종 URL이 `/` 이고 MBTI 그리드가 보인다
  - [ ] Playwright: 결과 페이지에서 "다시 진단하기" 클릭 → `/` 로 이동, MBTI 미선택 상태
  - [ ] Playwright: 결과 페이지에서 "복사" 클릭 후 클립보드 값이 시스템 프롬프트와 일치한다
  - [ ] `e2e/smoke.spec.ts` 가 본 feature 제목으로 통과한다
- **검증**:
  - `bun run test:e2e`

---

### Checkpoint: Tasks 7-9 이후 (Ship-ready)
- [ ] 모든 단위 테스트 통과: `bun run test`
- [ ] 모든 E2E 통과: `bun run test:e2e`
- [ ] 빌드 성공: `bun run build`
- [ ] Browser MCP로 모바일 viewport(375px)에서 전체 흐름 한 번 더 — 증거 `artifacts/llm-mbti-recommender/evidence/checkpoint-c-mobile.png`

---

## 미결정 항목

- `data/affinity.ts`의 구체 점수와 `data/templates.ts`의 정확한 카피는 Task 2 실행
  시 Claude로 초안을 만들어 사람이 보정한다. plan 단계에서는 구조만 확정.
- OG 이미지의 시각 톤(컬러·폰트·로고 사용 여부)은 Task 8 실행 시 결정.
- 진단 진행 중 새로고침 시 입력 보존 여부는 보류 (현재 plan은 보존하지 않음).
  실제 사용 데이터에서 이탈이 큰 경우 sessionStorage 추가로 해결 — 이번 MVP 범위 외.
