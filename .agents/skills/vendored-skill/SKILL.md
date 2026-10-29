---
name: vendored-skill
description: 폴백. kit에 없는 워크플로우가 oh-my-claudecode(OMC)나 oh-my-codex(OMX)에 있을 때, vendor/에 clone한 원본 SKILL.md·에이전트 문서 한 편을 읽고 Claude/OMX 전용 도구를 Codex 도구로 번역해 수행한다. Use as $vendored-skill <omc|omx> <skill-or-agent-name> when no kit skill covers the need. Reads one file per use; never copies large text into the kit.
---

# vendored-skill — 원본 스킬 참조 폴백

kit의 스킬은 OMC/OMX 계약을 40~60줄로 다시 쓴 것이다. 거기 없는 기능이 필요하면 원본을 **읽고 번역해서** 쓴다. 두 저장소 모두 공개 MIT이므로 대회 규정(공개 저장소 자료 활용)에 맞는다. 다만 원문은 Claude Code·OMX 런타임을 전제하므로 그대로 실행되지 않는다.

## 준비 (`vendor/README.md`)
`vendor/omc`(oh-my-claudecode, 태그 고정)와 `vendor/omx`(oh-my-codex, 태그 고정)가 있어야 한다. 없고 네트워크도 막혀 있으면 이 스킬을 쓰지 말고 kit 스킬로 대체한 뒤 그 사실을 기록한다.

## 절차
1. **필요한 기능을 한 문장으로** 적고, kit 스킬 13+8개 중 정말 없는지 `AGENTS.md` 8절 표로 확인한다. 완료 기준: "kit에 없는 이유" 한 줄.
2. **원본 찾기**: `vendor/omc/skills/<name>/SKILL.md`, `vendor/omc/agents/<name>.md`, `vendor/omx/skills/<name>/SKILL.md`, `vendor/omx/prompts/`. 필요한 **한 파일만** 읽는다. 500줄이 넘으면 "When to use / Workflow(절차) / Rules / Output" 절만 읽는다.
3. **번역표 적용**:

| 원문 표현 | Codex에서 |
|---|---|
| `Task(subagent_type=...)`, `explore agent`, `/team` | `.codex/agents`의 해당 역할 spawn(planner·architect·worker·explorer·reviewer·verifier·writer). 없으면 리더가 직접 |
| `TodoWrite`, `.omc/notepads/`, `.omc/plans/` | `docs/notepad.md`, `docs/plans/` |
| `AskUserQuestion` | 평문 질문 한 번에 하나 |
| `lsp_diagnostics`, `lsp_diagnostics_directory` | 프로젝트 타입체크·빌드 명령 |
| `ast_grep_search/replace` | `rg`로 찾고 수동 편집 |
| `/oh-my-claudecode:<skill>` | kit `$<skill>`이 있으면 그것, 없으면 이 절차 재귀 |
| `omx state|ultragoal|question|exec ...` CLI | 없음. `/goal` + `$goal-loop`, `$evidence-log`로 대체 |
| HUD·알림·tmux·팀 런타임·consensus 가드 절 | 건너뛴다 |
| `ralph`/`ultragoal` 루프 | `$goal-loop`(예산·반복 상한 필수) |

4. **실행**: 번역된 절차대로 수행한다. 원문의 완료 기준과 출력 형식은 유지한다.
5. **기록**: `$evidence-log`에 사용한 원본 경로·커밋/태그, 번역한 항목, 건너뛴 절, 결과를 한 단락으로. 이유: 심사자가 도구 설정을 읽을 때 "왜 외부 프롬프트를 썼고 무엇을 바꿨는지" 설명할 수 있어야 한다.

## 규칙
- 원문 텍스트를 kit 파일에 통째로 복사하지 않는다(토큰·설명 가능성·"통째 대체 금지" 규정).
- 한 번에 한 파일. 저장소 전체를 읽지 않는다.
- 원문이 요구하는 설치(omx, 플러그인)는 하지 않는다. 설치가 전제인 기능이면 "대체 불가"로 기록하고 kit 스킬로 돌아간다.
- 반복해서 같은 원본을 쓰게 되면 kit 스킬로 승격한다(`$remember` → 40~60줄 재작성).

## 출력
- 사용한 원본(경로, 태그/커밋)
- 번역·생략 항목
- 수행 결과(원문 출력 계약대로)
- 승격 후보 여부
