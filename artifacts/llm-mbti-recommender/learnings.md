# LLM-MBTI Recommender — Learnings

이 파일은 구현 중 내린 판단·실수·발견을 기록한다. 잘 풀린 일은 생략, 예상과
달랐던 것·우회·다시 마주치고 싶지 않은 것만 남긴다.

---

<!-- entries appended below -->

---
category: tooling
applied: not-yet
---
## vitest 기본 exclude를 overriding하면 e2e가 잡힌다

**상황**: Checkpoint B에서 `bun run test`가 `e2e/smoke.spec.ts`를 vitest이 잡아서
"Playwright Test did not expect test() to be called here" 에러로 실패. `vitest.config.ts`의
`exclude: [".claude/worktrees/**", "node_modules/**"]`가 vitest의 기본 exclude
패턴(`**/dist/**`, e2e 표기 없음)을 override하면서 e2e 파일이 단위 테스트에 잡혔다.

**판단**: `exclude` 배열에 `"e2e/**"`를 추가. spec 외 작업이지만 모든 후속 작업의
checkpoint를 블록하기 때문에 즉시 수정.

**다시 마주칠 가능성**: 중간 — Vitest+Playwright을 같이 쓰는 모든 신규 프로젝트에서
재발 가능. exclude를 "추가"로 다루는 게 일반적인데 `vitest.config.ts`는 override
패턴이라 의도와 달라진다.

---
category: code-review
applied: not-yet
---
## readonly array → ToggleGroup의 mutable value 타입 충돌

**상황**: Task 4 ChipMultiSelect에서 `value: readonly T[]` props를 radix
ToggleGroup의 `value: string[]`에 그대로 넘기려 했고, `as string[]` 캐스트는 TS가
"readonly → mutable" 변환을 거부.

**판단**: `[...value]` 스프레드로 mutable 복사본을 만들어 전달. T extends string이라
별도 캐스트 불필요. 호출자는 readonly 안정성을 유지하고, ToggleGroup이 받는 시점에만
copy를 만든다.

**다시 마주칠 가능성**: 중간 — radix·shadcn 컴포넌트가 종종 mutable array를 요구하고
shadcn 코드는 그대로 두는 규칙이라 wrapper 안에서 매번 같은 패턴이 필요할 수 있음.

---
category: tooling
applied: not-yet
---
## vitest `vi.mock` 팩토리에서 외부 변수 참조 시 hoist 에러

**상황**: Task 6 page.test.tsx에서 `const redirectMock = vi.fn(...)` 다음 줄에
`vi.mock("next/navigation", () => ({ redirect: redirectMock }))`를 적었더니
"Cannot access 'redirectMock' before initialization". vi.mock은 import보다 위로
hoist되는데 일반 변수는 그대로 그 자리에 남아 mock 팩토리가 실행될 때 아직 정의 안 됨.

**판단**: `vi.hoisted(() => ({ redirectMock: vi.fn(...) }))`로 mock을 같이 hoist.
이후 `vi.mock`의 팩토리 안에서 그대로 참조 가능.

**다시 마주칠 가능성**: 높음 — Server Component에서 redirect/notFound 같은
control-flow를 mock해야 할 때마다 반복. SKILL이나 CLAUDE.md에 패턴 한 줄 메모할
가치가 있음.
