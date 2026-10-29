# vendor — 원본 스킬 저장소 (폴백용, 커밋 안 함)

`$vendored-skill`이 읽는 원본이다. 이 디렉터리의 내용물은 `.gitignore`로 제외되고(README만 추적), 필요할 때 환경에서 clone한다. 두 저장소 모두 MIT 라이선스, 공개 상태다.

## clone (포크, 태그 고정)

대회 규정상 사용한 공개 저장소는 결과 통지까지 공개여야 한다. 제3자 저장소가 비공개·삭제되는 위험을 피하려고 본인 계정에 공개 포크를 만들어 두었다(2026-10-30, 태그 `v5.5.0`·`v0.21.40` 존재 확인). **포크에서 clone한다.**

```bash
git clone --depth 1 --branch v5.5.0  https://github.com/bladem0117/oh-my-claudecode vendor/omc
git clone --depth 1 --branch v0.21.40 https://github.com/bladem0117/oh-my-codex     vendor/omx
```

포크가 닿지 않을 때만 원본으로 대체한다:

```bash
git clone --depth 1 --branch v5.5.0  https://github.com/Yeachan-Heo/oh-my-claudecode vendor/omc
git clone --depth 1 --branch v0.21.40 https://github.com/Yeachan-Heo/oh-my-codex     vendor/omx
```

태그명이 다르면 `git ls-remote --tags <url> | tail -5`로 확인한다. 태그가 없으면 커밋 해시로 고정하고 그 해시를 `docs/decision-log.md`에 적는다.

## 안에서 볼 것

| 경로 | 내용 |
|---|---|
| `vendor/omc/skills/<name>/SKILL.md` | OMC 스킬 44종(plan, execute, review, verify, ralph, ultragoal, deep-interview, ralplan, ai-slop-cleaner, trace, research, remember, minimal-*-discipline …) |
| `vendor/omc/agents/<name>.md` | OMC 에이전트 19종(planner, architect, executor, verifier, code-reviewer, debugger, tracer, test-engineer, explore, writer …) |
| `vendor/omx/skills/<name>/SKILL.md` | OMX 스킬(analyze, ralplan, ultragoal, team, ultraqa, code-review, best-practice-research …) |
| `vendor/omx/prompts/` | OMX 네이티브 에이전트 프롬프트 |

## 쓰지 않는 것
- `vendor/omx`의 `omx` CLI 설치·실행(플랜 A는 `omx/README.md`에서 따로 다룬다)
- hooks·HUD·tmux 팀 런타임 관련 파일

## 출처 표기
kit `README.md`의 "참고한 공개 자료"에 두 저장소와 라이선스를 적었다. `$vendored-skill`로 원본을 쓸 때마다 `docs/decision-log.md`에 경로와 태그를 남긴다.
