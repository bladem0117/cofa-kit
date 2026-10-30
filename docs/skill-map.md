# 스킬 지도 — 어떤 흐름에서 무엇을 부르고, 무엇이 남나

읽는 법: 왼쪽 "신호"가 보이면 그 행의 스킬을 부른다. `$이름`으로 명시 호출이 가장 확실하다. 자연어로 말해도 AGENTS.md 9절의 라우팅 표가 같은 스킬로 보낸다. "산출물"은 파일이나 표로 남는 것, "내가 보는 것"은 그 산출물에서 내가 판단해야 하는 지점이다.

## 1. 흐름 순서

| # | 신호(이럴 때) | 스킬 | 입력 | 산출물 | 내가 보는 것 | 다음 |
|---|---|---|---|---|---|---|
| 0 | 새 환경에 들어왔다 | (스킬 없음) `/status` `/skills` spawn 테스트 | — | `decision-log` 엔트리 1 | 모델·effort·스킬 25개·spawn 성공 | 1 또는 2 |
| 1 | 우측에 실무자 역할 AI가 있다 / "문제를 정의하라" | `$stakeholder-interview` | README, 실무자 답변 | `docs/INTERVIEW.md`, `docs/agreement.md`(숫자 성공 기준, 실무자 확인 인용) | 간극 하나 선택, 성공 기준 숫자 | 2 |
| 2 | 저장소에 기존 코드가 있다 / "어떻게 돌아가나" | `$onboard` | 저장소 | `docs/onboard.md`(기준선 결과, 진입점, 모듈 그래프, 관례, 위험, 증거/추론/미확인) | 위험 지점, 기준선 통과 여부 | 3 |
| 3 | 코드 2파일 이상 바꿀 것 같다 / "계획 세워" | `$plan` | 합의문·지도 | `docs/plans/<slug>.md`(수용 기준, 3~6단계, 검증 계획, 범위 밖) **승인 대기** | 단계·범위를 고치거나 "승인" | 4 또는 3' |
| 3' | 설계 갈림길 / 삭제·마이그레이션·동시성·보안 | `$design-review` | 계획 스냅샷 | 계획 v2 + ADR 요약, 라운드 기록 | 트레이드오프 선택 | 4 |
| 4 | 계획이 승인됐다 / "구현해" | `$execute` | 승인된 계획 | 변경 파일, 단위별 검증 결과, `submission-notes` 1절 행 | 방향이 맞는지, 범위 이탈 | 5 |
| 4a | 구현 중 테스트가 깨진다 / "왜 실패하지" | `$debug` | 실패 출력 | 재현 절차, 가설 표, 원인(파일:줄), 수정 1개, 회귀 테스트 | 가설이 증거로 갈렸는지 | 4 |
| 4b | 모르는 라이브러리·규격 / "이거 어떻게 쓰지" | `$research` | 질문 한 문장 | 출처 붙은 발견, 검증/추론 구분, 미확인 | 결정에 쓸 사실 | 4 |
| 4c | 새 동작을 추가한다 / "테스트부터" | `$test-strategy` | 수용 기준 | 기준↔테스트 매핑, 실행 결과, 커버리지 공백 | 공백 중 받아들일 것 | 4 |
| 4d | 컨텍스트 60% 초과 / 응답이 느려짐 | `$handoff` → `/new` | — | `docs/handoff.md` | 다음 행동이 맞는지 | 이어서 |
| 5 | 구현이 끝났다 / "리뷰해" | `$review` | 요구사항·diff·반례 | 판정(승인/수정 요청), 결함 표(심각도·확신도·파일:줄·수정안), 열린 질문 | 지적 수용/거부(거부는 2절 기록) | 5' 또는 6 |
| 5' | 고위험 변경이었다 | `$crosscheck` | 요구사항·diff·반례·불변식 | 다른 모델의 반례 표, 라운드 기록 | 알려진 한계 승인 | 6 |
| 6 | "진짜 되는지 확인해" / 완료 주장 전 | `$verify` | 수용 기준 | PASS/FAIL/PARTIAL, 증거 표(명령→결과), `submission-notes` 3절 | 검증 충분성(고위험) | 7 |
| 7a | 입력을 받는 기능이고 시간이 있다 | `$qa-adversarial` | 실행 표면 | 시나리오 매트릭스, 결함·수정, 정리, 종료 상태 | 차단된 시나리오 | 7b |
| 7b | 제출 전 정리 | `$cleanup` | 변경 파일 | 냄새 표, 전/후 테스트, 줄 수 변화 | 남긴 것과 이유 | 7c |
| 7c | 커밋할 때 | `$git-hygiene` | 변경 | 커밋 목록(해시·요지·엔트리), 스캔 결과 | 커밋 단위 | 7d |
| 7d | 제출용 인계 | `$handoff 제출용으로` | — | `docs/handoff.md` + "다음 담당자가 30분 안에" | 다음 행동 | 8 |
| 8 | 마감 20분 전 | `$cognition-prep` | 산출물 전체 | `docs/cognition-prep.md`(암기 카드, 문항별 3단계 답) | 동의 안 되는 답을 내 말로, 답 못 하는 문항 | 9 |
| 9 | 제출 직전 | `$submission-check` | 전체 | 점검표(PASS/FAIL), `submission-notes` 6절 초안 | 6절 두 문장을 내 말로 | 제출 |
| ∞ | 어느 단계든 결정을 했다 | `$evidence-log`(자동) | — | `docs/decision-log.md` 엔트리 | — | — |
| ∞ | 내가 AI 제안을 수정·거부했다 | `$submission-notes`(자동) | — | `docs/submission-notes.md` 2절 행 | 기록됐는지 | — |

## 2. 분기·폴백

| 신호 | 스킬 | 산출물 |
|---|---|---|
| 한 줄짜리 수정 요청 | (스킬 없음) AGENTS Trivial 규칙 | 수정 + cofa-verifier 판정 + 엔트리 1 |
| 장시간 자율 반복이 필요 | `$goal-loop` → `/goal` | 목표 문장(기준·예산·상한), 반복별 한 줄 기록 |
| spawn이 `Unknown model` / 레이트리밋 | `$model-routing` | 대체 모델 결정 + 엔트리 |
| kit에 없는 워크플로우 | `$vendored-skill omc|omx <이름>` | 원본 경로·번역표·결과 |
| 작업 방식이 흐트러짐 | `$workstyle` | — (규칙 재확인) |
| 다음 세션에도 필요한 사실 | `$remember` | notepad/decision-log/AGENTS 갱신 |
| 코드를 쓰기 직전 | `$minimal-code-discipline`(`$execute`가 적용) | 사다리 결정 한 줄씩 |

## 3. 산출물 파일 한눈에

| 파일 | 만드는 스킬 | 누가 읽나 |
|---|---|---|
| `docs/INTERVIEW.md`, `docs/agreement.md` | stakeholder-interview | 나, 심사자(Intent) |
| `docs/onboard.md` | onboard | 나, 확인 문제 답 재료(Cognition) |
| `docs/plans/<slug>.md` | plan, design-review | 나(승인), execute |
| `docs/decision-log.md` | 모든 스킬(evidence-log) | 심사자, 확인 문제 답 재료 |
| `docs/submission-notes.md` | execute/review/verify/crosscheck → submission-notes | **나(제출란에 옮겨 적음)** |
| `docs/handoff.md` | handoff | 새 세션, 다음 담당자(Communication) |
| `docs/cognition-prep.md` | cognition-prep | **나(확인 문제 직전 2분)** |
| 커밋 이력 | git-hygiene | 심사자(문서↔코드 대조) |
