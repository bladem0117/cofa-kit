# cofa-kit

Codex CLI용 작업 하네스. **설치 없이 `git clone`만으로** 역할 분리 서브에이전트, 모델 라우팅(Sol/Terra/Luna), 4단계 작업 루프(plan → execute → review → verify), 증거 기록을 제공한다.

AI 협업 과정 평가 환경(브라우저 워크스페이스 + Codex CLI, 설치 가능 여부 미확인)을 전제로 설계했다. 그래서 핵심 경로는 Codex 네이티브 기능(`.codex/agents`, `.agents/skills`, `.codex/config.toml`, `/goal`)만 쓴다. OMX(oh-my-codex)는 환경이 허용할 때만 얹는 옵션이다(`omx/`).

## 5분 시작

```bash
git clone <this-repo> work && cd work
codex                      # 첫 실행 시 "프로젝트 신뢰" 승인 → .codex/ 설정이 로드된다
```

Codex 안에서:

```
$workstyle            # 작업 방식·보고 형식 확인
$onboard              # 낯선 저장소: 기준선 실행 + 1쪽 지도(증거/추론/미확인)
$plan <과제>          # Scoped 이상 과제. Trivial은 바로 수정 → $verify
$design-review        # Complex·고위험 계획: architect → reviewer 독립 검토, 작성자만 종합
$execute              # 계획 구현 ($minimal-code-discipline, 새 동작은 $test-strategy 먼저)
$debug                # 버그·실패: 재현 → 경쟁 가설 → 구별 프로브 → 최소 수정
$review / $verify     # 작성 컨텍스트와 다른 에이전트가 수행. 고위험 검증은 별도 read-only 프로세스
$qa-adversarial       # 제출 전 적대적 QA(상한 3사이클)
$cleanup              # 변경 파일의 AI 흔적 정리(동작 보존)
$git-hygiene          # 단계별 원자 커밋, 현재 브랜치만
$evidence-log         # 단계마다 결정·증거·한계 기록
$submission-check     # 제출 직전
$vendored-skill       # 폴백: vendor/의 OMC·OMX 원문을 읽어 Codex 도구로 번역해 수행
```

환경 확인(선택): `bash scripts/probe.sh` 또는 `pwsh scripts/probe.ps1`. Codex 버전·node·npm·tmux·네트워크를 **확인만** 한다. Codex를 업데이트하지 않는다.

## 구조

```
AGENTS.md                 운영 규칙(항상 적용). 작업 루프·라우팅·위임·검증·안전·보고 형식
.codex/config.toml        리더 모델(Sol high), 서브에이전트 기본값(Sol medium), /goal 활성화. 모델 배치의 단일 진실원
.codex/agents/*.toml      cofa-planner·cofa-architect·cofa-reviewer·cofa-verifier(Sol high) / cofa-architect-deep(Sol xhigh) / cofa-worker(Sol medium)
                          / cofa-reviewer-terra(Terra, 교차 리뷰 전용) / cofa-explorer·cofa-writer(Luna low, 위치 찾기·초안만)
.agents/skills/*/SKILL.md 21개 스킬. 과정 13(plan·design-review·execute·minimal-code-discipline·review·verify·crosscheck·goal-loop·model-routing·evidence-log·remember·submission-check·workstyle)
                          + 풀이 7(onboard·debug·test-strategy·research·qa-adversarial·cleanup·git-hygiene) + 폴백 1(vendored-skill). $이름으로 호출, description으로 자동 선택
vendor/                   폴백용 원본(OMC·OMX) clone 위치. README만 추적, 내용물은 환경에서 태그 고정 clone
optional/                 상기 전용 hook(SessionStart 컨텍스트 주입, Stop 검증 상기). 차단 없음. 복사 후 /hooks 승인
docs/model-routing.md     라우팅 근거 수치와 출처
docs/decision-log.md      결정·증거·한계 기록(사후 Q&A 재료)
docs/notepad.md           세션 간 작업 메모
docs/rehearsal-checklist.md  대회 환경에서 기능별 동작 시험 체크리스트
templates/                계획·리뷰 라운드 템플릿
scripts/probe.*           환경 확인 스크립트(읽기 전용)
omx/                      플랜 A: OMX 0.21.40 핀 + Sol/Terra/Luna 덮어쓰기 설정
```

## 설계 원칙

- **선언으로 충분한 것은 선언으로.** 에이전트·스킬·설정은 파일이다. 런타임 설치가 필요한 것은 옵션으로 격리한다.
- **작성과 승인은 다른 에이전트.** reviewer·verifier는 작성 컨텍스트와 분리한다. 고위험 변경은 다른 모델의 독립 리뷰를 추가한다.
- **증거 없는 완료는 없다.** 신선한 명령 출력만 증거다.
- **Sol 기본, 비용은 effort로 조절.** 공지 단가 기준 6.1 Sol이 5.6 Terra보다 싸거나 같다. Terra는 교차 리뷰어와 레이트리밋 폴백에만, Luna는 위치 찾기·초안에만. 모델명은 설정 파일에만 두고 스킬은 에이전트 이름만 부른다.
- **루프에는 상한이 있다.** `/goal`에 토큰 예산·반복 상한·종료 조건을 함께 적는다.
- **확인 불가 시 삭제하지 않는다.**

## 대회 당일 절차 (과제 저장소 루트에서)

```bash
git clone --depth 1 https://github.com/bladem0117/cofa-kit /tmp/kit
cp -r /tmp/kit/.codex /tmp/kit/.agents /tmp/kit/docs /tmp/kit/templates /tmp/kit/scripts .
# 과제에 AGENTS.md가 이미 있으면 덮어쓰지 말고 이어 붙인다
[ -f AGENTS.md ] && { printf '\n\n' >> AGENTS.md; cat /tmp/kit/AGENTS.md >> AGENTS.md; } || cp /tmp/kit/AGENTS.md .
bash scripts/probe.sh     # 확인만. Codex 업데이트·npm 전역 설치 금지(권한도 없음)
codex                     # "프로젝트 신뢰" 승인 → .codex/ 로드
```

Codex 안에서 10분 캘리브레이션: `/status`(리더 모델·effort·토큰) → `/model`(노출 모델·버전 확인, 필요 시 effort 선택) → `/skills`(22개 노출 확인) → "커스텀 에이전트 `cofa-explorer`를 spawn해 README 제목 위치를 경로:줄로 보고해"(spawn 성공 = TOML 모델 수락; `Unknown model … Available models: …`면 그 목록으로 `.codex/agents/*.toml` 수정) → 결과를 `docs/decision-log.md` 엔트리 1개로. 이후는 AGENTS.md 1절 루프. kit 파일은 제출 시 **별도 커밋**(`chore(harness): …`)으로 넣어 과제 diff와 분리한다.

## Codex 내장 명령 요약 (Claude Code 사용자용)

| 하고 싶은 것 | Codex | 비고 |
|---|---|---|
| 모델·reasoning effort 바꾸기 | `/model` → 모델 선택 → effort(low/medium/high/xhigh) 선택 | **`/effort` 명령은 없다.** 시작 시 `codex -c model_reasoning_effort="xhigh"`로도 가능. kit은 config/TOML로 이미 지정 |
| 토큰 사용량·컨텍스트 확인 | `/status` | 모델·승인 정책·쓰기 가능 루트·토큰 사용량 |
| 컨텍스트 줄이기 | `/compact` | 긴 세션에서 토큰 절약. 요약 후 진행 |
| 계획 모드 | `/plan <목표>` | 구현 전에 계획만. kit의 `$plan`은 수용 기준·승인 대기까지 |
| 지속 목표 | `/goal` | 토큰 예산·자동 계속. kit의 `$goal-loop` 형식으로 등록 |
| 작업 트리 리뷰 | `/review` | 토큰을 더 쓴다. kit은 `$review`(cofa-reviewer) 사용 |
| 변경 보기 | `/diff` | 스테이징·미스테이징·미추적 |
| 파일 첨부 | `/mention <path>` | 다음 턴에서 직접 참조 |
| 스킬·훅·MCP | `/skills`, `/hooks`, `/mcp` | 훅은 여기서 신뢰 승인 |
| 승인 정책 | `/permissions` | Read Only / Auto 등 |
| 새 대화·복제·재개 | `/new`, `/fork`, `/resume` | `/clear`는 터미널까지 초기화 |
| 토큰을 더 태우는 것 | 높은 effort(xhigh), `/review`, `/compact` 미실행 | Claude의 ultrathink 같은 키워드는 없고 effort가 유일한 레버 |

## 사람 기록 (제출 시 직접 써야 하는 것)

평가 환경은 마지막에 사람이 "내가 구현한 것"과 "AI 제안 중 내가 수정한 것"을 적게 한다. `docs/submission-notes.md`가 그 초안이다. `$execute`가 구현 단위마다 1절에, 사용자가 AI 제안을 수정·거부하면 그 자리에서 2절에, `$verify`가 3절에 행을 쌓고, 제출 전 `$submission-notes`가 6절 최종 문장 초안을 만든다. 사람은 읽고 고치기만 한다.

## 참고한 공개 자료

구조와 역할 분리는 [oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)(MIT)와 [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex)(MIT)의 에이전트·스킬 설계를 참고해 Codex 네이티브 선언으로 다시 썼다. 원문을 복사하지 않았다. 구체적으로 참고한 것: OMC 스킬 execute·review·verify·research·remember·ralplan·minimal-code-discipline·ai-slop-cleaner, OMC 에이전트 planner·architect·executor·verifier·code-reviewer·explore·writer·debugger·tracer·test-engineer, OMX 스킬 analyze·ultraqa·ultragoal·plan·git-master와 OMX 에이전트 정의(frontier/standard/fast 계층). 폴백으로 원문이 필요할 때는 `vendor/`에 태그 고정 clone 후 `$vendored-skill`로 번역해 쓴다. Codex 기능은 [Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents.md), [Agent Skills](https://developers.openai.com/codex/skills.md), [Config basics](https://developers.openai.com/codex/config-basic), [Using Goals](https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex) 문서를 따른다.

## 라이선스

MIT. `LICENSE` 참조.
