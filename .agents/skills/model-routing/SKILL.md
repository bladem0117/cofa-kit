---
name: model-routing
description: 역할별 모델·effort 규칙, Terra·Luna 한정 용도, 404·레이트리밋·spawn 모델 검증 폴백, 캘리브레이션. Use: choosing a model, model unavailable, new environment.
---

# model-routing — 모델 라우팅

원칙 두 가지. **Sol이 기본이고, 비용 조절은 모델이 아니라 effort로 한다.** 공지 단가 기준 6.1 Sol은 5.6 Terra보다 싸거나 같아서, 더 약한 모델로 내릴 가격상 이유가 없다. 근거 수치와 출처는 `docs/model-routing.md`.

## 어디에 적혀 있나 (단일 진실원)
- 리더 모델·effort: `.codex/config.toml`의 `model`, `model_reasoning_effort`
- 서브에이전트 모델·effort: `.codex/agents/<name>.toml`. 명시 모델 > `default_subagent_model` > 현재 부모 모델 상속
- 스킬 본문은 **에이전트 이름만** 부른다. 모델명을 스킬에 쓰지 않는다(이중 진실원 방지).

## 기본 표

| 에이전트 | 모델 | effort | 쓰는 곳 | 쓰지 않는 곳 |
|---|---|---|---|---|
| 리더, cofa-planner, cofa-architect, cofa-reviewer, cofa-verifier | Sol | high | 요구 분석·설계·리뷰·검증 | 반복 탐색 |
| cofa-architect-deep | Sol | xhigh | `$design-review`의 Complex·고위험 계획 검토만 | 일상 설계 판단 |
| cofa-worker | Sol | medium | 구현·테스트 작성·버그 수정 | 설계 결정 |
| cofa-reviewer-terra | Terra | high | `$crosscheck`에서 "작성 모델과 다른 리뷰어" | 그 외 전부 |
| cofa-explorer | Luna | low | 파일·심볼 **위치 찾기** | 관계 해석·영향 범위·수정·긴 문맥 회상 |
| cofa-writer | Luna | low | 커밋 메시지·요약·문서 한 절 **초안** | 사실 확인·파일 반영(리더가 한다) |

Terra의 용도는 두 가지뿐이다. 교차 리뷰어, 그리고 Sol 레이트리밋 시 폴백. Luna는 틀려도 바로 드러나고 싼 일에만.

## 상향 조건 (즉시, 횟수 세지 않는다)
- 증거가 부족한데 결론을 내야 하거나, 중대한 반례가 발견됐을 때 → effort를 한 단계 올리거나 cofa-architect에 넘긴다.
- 같은 시도의 반복은 원인 가설이 바뀌었을 때만 허용한다. 가설이 그대로면 반복하지 않는다.
- 고위험(삭제·프로세스 제어·동시성·보안·마이그레이션·공개 API) 변경의 리뷰는 cofa-reviewer(Sol) 필수. cofa-reviewer-terra는 추가 시각이지 대체가 아니다.

## 하향 조건
- 사양이 확정됐고 편집이 기계적이면 worker effort를 medium 그대로 두고 단위를 잘게 나눈다(모델을 내리지 않는다).
- 위치 찾기·초안은 Luna. 단, 결과를 리더가 반드시 확인한다.

## 폴백
0. **spawn 시 모델 검증 실패**: `spawn_agent`는 TOML의 `model`을 런타임 카탈로그와 대조한다. 카탈로그에 없으면 "Unknown model `X` for spawn_agent. Available models: ..." 오류로 spawn이 거부된다(2026-10-30 실측, codex 0.154에서 6.x ID). 오류에 찍힌 **Available models 목록이 캘리브레이션의 1차 입력**이다. 그 자리에서 (a) 해당 역할을 리더가 직접 수행하고, (b) 세션 시작 단계라면 TOML의 `model`을 목록에 있는 가장 가까운 등급(Sol 계열 → 가용 Sol, Luna → 가용 Luna/저가 모델)으로 맞춘 뒤 `docs/decision-log.md`에 "대체 모델·사유·영향 역할"을 적는다.
1. **모델 불가(404·권한)**: 첫 호출에서 가용성을 확인한다. Sol 불가 → 해당 역할을 Terra로 임시 대체하고 `docs/decision-log.md`에 "대체 모델·사유·영향 역할"을 적는다. Luna 불가 → explorer·writer 역할을 리더가 직접 수행한다.
2. **레이트리밋**: 같은 요청을 즉시 재시도하지 않는다. 대기(30초 → 60초 → 120초, 최대 3회) 후 재시도. 그래도 막히면 그 역할만 Terra로 폴백하고 기록. 검증 기준을 유지할 수 없으면 작업을 보류하고 사용자에게 알린다.
3. 폴백으로 만든 산출물은 Sol이 복구되면 리뷰·검증을 Sol로 다시 돈다(기준 유지).

## 캘리브레이션 (새 환경 첫 10분)
1. `scripts/probe.sh`로 Codex 버전과 환경 확인. 업데이트하지 않는다.
2. `/model` 목록으로 실제 노출된 모델·버전을 적는다. 특히 Terra가 5.6인지 6.1인지. 6.1 Terra($1/$5)면 결정 규칙이 바뀐다: 구현 기본을 Terra로, Sol은 계획·리뷰로.
3. 같은 소과제 묶음(검색 1·회상 1·구현 1·검증 1)을 역할별 에이전트로 한 번씩 돌린다. Luna에는 수정 과제를 주지 않는다.
4. 기록 항목: 실제 모델·effort, 입력/출력/캐시 토큰(알 수 있으면), 재시도 포함 비용·시간, 누락·오탐, 최종 성공 여부.
5. 기본 표와 다르면 TOML을 고치고 `docs/model-routing.md`와 `docs/decision-log.md`에 변경 이유와 측정값을 남긴다.

## 규칙
- 비용 수치는 참고값이다. 작은 표본의 실측을 보편 법칙으로 쓰지 않는다.
- 토큰이 충분해도 라우팅은 지킨다. 평가는 "효율적 활용 과정"을 본다. 낭비는 모델이 아니라 불필요한 재시도·spawn·장황한 출력에서 난다.
