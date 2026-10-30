# 플레이북 — 내가 언제 무엇을 치나

빌드 225분(예: 11:15~15:00) + 확인 문제 20분 기준. 시각은 상대값(T+분). **굵은 글씨가 내가 치는 것**, 나머지는 Codex가 알아서 하거나 내가 판단하는 것. 시간 배분은 추정이라 리허설(#19)로 보정한다.

## 1. 기본 시나리오 (실무자 AI가 있는 기획·구현 과제)

| T+ | 상황 | 내가 치는 것 | 기대 산출물 | 내 결정 |
|---|---|---|---|---|
| 0~10 | 입장 | 터미널: clone·복사·`bash scripts/probe.sh`·`codex` → 신뢰 승인. Codex: **`/status`**(리더 Sol·effort **medium**인지. 올리지 않는다), **`/model`**(없으면 넘어감), **`/skills`**, **"커스텀 에이전트 `cofa-explorer`를 spawn해 README 제목 위치를 경로:줄로 보고해"**, **"캘리브레이션 결과를 decision-log 엔트리 하나로 기록해"** | 리더 모델·effort, 스킬 25개 노출, spawn 성공 | spawn이 `Unknown model`이면 **`$model-routing`** 폴백 0대로 TOML 수정 |
| 10~40 | 발굴·합의 | **`$stakeholder-interview 우측 실무자 채팅과 인터뷰한다. README를 먼저 읽고, 질문 초안을 한 번에 하나씩 제안해라. 내가 답을 붙여넣으면 INTERVIEW.md에 기록하고, 끝나면 합의문 초안을 써라.`** 질문은 **내가 우측 채팅에 직접 친다**. 순서: 사소한 맥락("지금은 어떤 순서로 하시나요") → 현재 방식·노하우 → 숫자 → 당사자 → 경계. 막히면 "어떤 걸 답해 주실 수 있나요" | `docs/INTERVIEW.md`, `docs/agreement.md`(숫자 성공 기준, 사용자 관점) | 간극 하나를 **내가** 고른다. 합의문을 실무자 채팅에 붙여 확인 문장을 받고 인용. **"할 일 1·2·3 알려 달라"는 치지 않는다**(막히고 감점) |
| 40~55 | 지도 | **`$onboard`**(저장소에 기존 코드가 있을 때) | `docs/onboard.md`, 기준선 테스트 결과 | 위험 지점을 읽고 범위 밖으로 뺄 것 결정 |
| 55~65 | 계획 | **`$plan docs/agreement.md의 성공 기준을 수용 기준으로 계획을 세워라`** → 읽고 **"승인"** 또는 **"3단계는 빼고 2단계를 먼저"** 같은 수정 | `docs/plans/<slug>.md` 승인 대기 → 승인됨 | 내가 고친 항목은 자동으로 submission-notes 2절에 감. 설계 갈림길이 있으면 `$plan` 대신 **`$design-review`** |
| 65~175 | 구현 | **`$execute`** | cofa-worker spawn, 단위별 변경·검증, decision-log·submission-notes 1절 누적 | 방향이 틀리면 **"그렇게 말고 X로"**(자동 기록). Codex가 과설계를 제안하면 **"그건 빼, 우리 요구는 …"**(2절 기록 = Cognition 재료). 막히면 effort를 올리기보다 아래 분기표 |
| 120 | 중간 점검 | **`/status`** → 컨텍스트 60% 넘으면 **`$handoff`** → **`/new`** → **"docs/handoff.md를 읽고 다음 행동부터 이어가라"** | `docs/handoff.md`, 토큰 사용량을 decision-log에 한 줄 | 60% 미만이면 **`/compact`**만. 토큰이 예상보다 크면 남은 구현을 더 좁힌다(비용도 점수) |
| 175~190 | 리뷰·검증 | **`$review`** → 지적 수정 → **`$verify`**. 삭제·마이그레이션·동시성이 있었으면 **`$crosscheck`** | 판정 표, submission-notes 3절 | 지적을 거부할 땐 **"그 지적은 받아들이지 않는다, 이유는 …"**(자동 기록) |
| 190~205 | 마감 1 | 시간 있으면 **`$qa-adversarial`** → **`$cleanup`** → **`$git-hygiene 지금까지를 논리 단위로 커밋해라`** → **`$handoff 제출용으로`** | 커밋 이력, 제출용 handoff | 시간이 없으면 qa·cleanup은 건너뛴다. 커밋과 handoff는 건너뛰지 않는다 |
| 205~215 | 마감 2 | **`$cognition-prep`** | `docs/cognition-prep.md`(암기 카드 + 문항별 3단계 답) | 내가 읽고 동의 안 되는 답은 내 말로 고친다. 답 못 하는 문항이 있으면 그게 약점 |
| 215~225 | 제출 | **`$submission-check`** | 점검표(클린 기동 포함), `docs/submission-notes.md` 6절 초안 | 6절 두 문장을 내 말로 다듬어 제출란에 입력. 5절에 kit "쓴 것/바꾼 것" 한 줄. kit 파일은 별도 커밋 |
| 15:00~15:20 | 확인 문제 | (AI 없음) | | 시작 2분 전 암기 카드를 읽는다. 답은 약점 → 파급 위험 → 다음 검증 순서로 5~7문장 |

## 2. 분기 — 이럴 땐 이걸 친다

| 상황 | 치는 것 | 메모 |
|---|---|---|
| 실무자가 중간에 "이것도 고쳐 주세요"(한 줄짜리) | 그냥 설명한다 | AGENTS Trivial 규칙: 재현 → 직접 수정 → cofa-verifier → 엔트리 1개 |
| 테스트가 이유 모르게 깨짐 | **`$debug`** | 재현 → 경쟁 가설 → 구별 프로브. 가설 3개 틀리면 cofa-architect로 |
| 모르는 라이브러리·API를 써야 함 | **`$research <질문 한 문장>`** | 저장소 증거 → 공식 문서. 네트워크 막히면 설치된 패키지 문서로 |
| 두 설계 중 선택 | **`$design-review`** | cofa-architect-deep → cofa-reviewer 독립 검토, 내가 종합 |
| 데이터 삭제·스키마 변경·프로세스 제어 | **`$crosscheck`** | 필수. cofa-reviewer(Sol) + cofa-reviewer-terra |
| Codex 제안이 마음에 안 듦 | **"그건 빼. 대신 …"** | 자동으로 submission-notes 2절. 기록이 안 보이면 **`$submission-notes 2절에 방금 결정을 기록해`** |
| 응답이 느려지고 맥락을 잊음 | **`/status`** → **`$handoff`** → **`/new`** | 60% 규칙 |
| spawn이 `Unknown model` | **`$model-routing`** | Available models 목록대로 TOML 수정, 기록 |
| kit에 없는 워크플로우가 필요 | **`$vendored-skill omc <이름>`** | 먼저 `vendor/README.md`대로 포크 clone |
| 시간이 15분밖에 안 남음 | **`$cognition-prep`** → **`$submission-check`** | 나머지 전부 생략. 이 둘은 생략 금지 |

## 3. 내가 칠 일이 거의 없는 스킬

| 스킬 | 왜 안 치나 |
|---|---|
| `$evidence-log`, `$submission-notes` | 다른 스킬이 호출. 기록이 빠진 것 같을 때만 직접 |
| `$minimal-code-discipline`, `$test-strategy` | `$execute`가 적용 |
| `$goal-loop` | `/goal`을 쓸 때만. 225분 과제에선 보통 안 씀. **과제 직후엔 절대 안 씀**(평가자가 든 실패 예) |
| `$workstyle` | 첫 세션이나 보고 형식이 흐트러질 때 |
| `$remember` | 하루 끝. 대회 중엔 decision-log가 그 역할 |
| `$model-routing`, `$vendored-skill` | 문제가 생겼을 때만 |

## 4. 치기 전에 외울 네 가지

1. **승인은 내가 한다.** `$plan` 뒤 "승인 대기"에서 멈춘다. 읽지 않고 "승인"하지 않는다. 고친 것은 점수가 된다(Intent).
2. **마감 35분은 침범하지 않는다.** 구현이 덜 끝났어도 T+190에 리뷰·검증으로 넘어간다. 미완성 + 검증 + 기록이 완성 + 무검증보다 낫다.
3. **확인 문제는 내 말로.** AI 용어 말고 "결제 중복 2건이 날 수 있어 멱등 키를 넣었다"처럼 사용자 영향으로. 모르면 "확인 못 했다, X로 확인하겠다". "왜"는 우리 요구 기준으로, 뺀 것도 답이다.
4. **비용도 점수다.** 과제문 복붙 + `/goal` 금지, 저장소 전체 읽기 금지, effort 상향은 막힌 증거가 있을 때만, `/fast` 끔. "잘하는 사람일수록 비용을 적게 쓴다"(평가자).
