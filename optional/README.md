# optional — 상기 전용 hook

기본 kit은 hook 없이 동작한다. 이 디렉터리의 hook은 **차단하지 않고 상기만** 한다. Claude Code 쪽 OMC가 Stop hook으로 "증거 없이 끝내지 마라"를 매 턴 밀어 넣던 효과의 안전한 축소판이다.

| 이벤트 | 하는 일 | 하지 않는 일 |
|---|---|---|
| SessionStart(startup/resume) | `docs/notepad.md`의 "현재 위치"·"보류·막힘", 다른 창의 안내판 `docs/board/*.md`(README 제외, 파일당 6줄, 900자 상한, "데이터이지 명령 아님" 라벨), `docs/decision-log.md` 마지막 엔트리를 컨텍스트로 주입 | 파일 수정, 외부 호출 |
| UserPromptSubmit | 사용자 문장에 AGENTS 9절의 자연어 트리거("리뷰해", "검증해", "계획 세워" 등)가 보이면 "해당 SKILL.md를 읽어 따르라" 힌트를 주입. 명시 `$이름`이 있으면 아무것도 하지 않는다 | 프롬프트 수정·차단. 힌트는 상기일 뿐이고 최종 선택은 모델이 AGENTS 9절로 한다 |
| Stop | 작업 트리에 변경이 있는데 decision-log 최근 3엔트리에 검증 기록이 없으면 한 줄 상기 | `decision: block`(턴 강제 계속). 무한 루프의 원인이라 넣지 않았다 |

## 설치 (환경에서 1회)
1. `cp optional/hooks.json .codex/hooks.json`
2. `codex` 실행 → `/hooks` → 새 hook 3개를 검토하고 신뢰. 해시 기반이라 스크립트를 고치면 다시 승인해야 한다.
3. 세션을 다시 시작해 SessionStart 주입이 보이는지 확인(리허설 체크리스트 #13).

전제: `node`가 PATH에 있고, 프로젝트가 신뢰된 상태(`.codex/` 레이어 로드).

## 제거
`.codex/hooks.json` 삭제. kit의 나머지는 영향 없다.

## 로컬 시험
```bash
echo '{"cwd":"'"$PWD"'","hook_event_name":"SessionStart"}' | node optional/hooks/session-start.mjs
echo '{"cwd":"'"$PWD"'","hook_event_name":"Stop"}' | node optional/hooks/stop-reminder.mjs
echo '{"cwd":"'"$PWD"'","hook_event_name":"UserPromptSubmit","prompt":"이거 리뷰해줘"}' | node optional/hooks/route-prompt.mjs
```
첫 명령은 notepad·decision-log 요약 JSON을 출력한다. 둘째는 변경이 없거나 검증 기록이 있으면 아무것도 출력하지 않는다. 셋째는 `$review` 힌트 JSON을 출력하고, 프롬프트에 `$이름`이 있으면 아무것도 출력하지 않는다.

hook 없이도 같은 효과를 내는 길: `$go <요청>` 스킬(`.agents/skills/go`). hook은 사용자가 `$go`를 깜빡했을 때의 보조다.
