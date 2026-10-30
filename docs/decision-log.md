# decision-log

결정·근거·증거·잔여 한계의 시간순 기록. 형식은 `.agents/skills/evidence-log/SKILL.md`. 이전 엔트리는 고치지 않고 새 엔트리로 정정한다.

사후 질문 "왜 그렇게 했나 / 무엇으로 확인했나 / 무엇이 남았나"에 이 파일만 보고 답할 수 있어야 한다.

---

### [0] 세팅 하네스 초기화 — (날짜)
- 분류/모델: 해당 없음 / 리더 `gpt-6.1-sol`(high)
- 가설·의도: Codex 네이티브 선언만으로 역할 분리·라우팅·검증 루프를 재현한다. 설치 없이 clone으로 동작해야 한다.
- 조치: `AGENTS.md`, `.codex/config.toml`, `.codex/agents/*.toml` 7종, `.agents/skills/*` 11종 작성
- 재검증: `docs/rehearsal-checklist.md` 항목별 결과를 여기 아래 엔트리로 추가
- 한계·잔여: 대회 환경의 Codex 버전·모델 가용성 미확인 → 세션 시작 시 `$model-routing` 캘리브레이션
- 비용(선택): 해당 없음

### [1] 로컬 리허설 — 구조 검증·프로브·스모크 테스트 — 2026-10-29 22:30
- 분류/모델: 해당 없음 / 스모크 테스트는 로컬 codex-cli 0.154.0, `-m gpt-5.6-sol`(로컬은 6.x ID 미인식 가능성)
- 가설·의도: kit 파일이 Codex 스키마에 맞고, clone 상태에서 에이전트·스킬이 발견되는지 확인한다.
- 조치: TOML 8개·SKILL.md 11개·JSON 1개 파싱, 제어문자 스캔, `scripts/probe.sh` 실행, `codex exec -s read-only`로 "인식된 에이전트·스킬 나열" 요청
- 재검증: 파서 검증 → ERRORS none, control-char none / `bash scripts/probe.sh` → codex 0.154.0, node 24, npm prefix 쓰기 가능, tmux(psmux) 있음, registry·github 200 / `codex exec` → 7 에이전트·11 스킬 이름을 정확히 나열, 종료 0, 30,374 토큰
- 한계·잔여: 스모크 테스트에서 Codex는 **셸로 디렉터리를 스캔해** 목록을 만들었다(stderr의 PowerShell 스크립트 확인). 즉 "파일이 발견됨"은 증명됐지만 "런타임이 네이티브 에이전트·스킬로 로드함"은 미증명 — 프로젝트 신뢰 승인이 없었고(비대화형 exec), 버전도 대회 추정치(0.161+)와 다르다. 리허설 체크리스트 #2·#3·#6을 대화형 `codex`에서 신뢰 승인 후 다시 수행해야 한다. "현재 리더 모델: gpt-6.1-sol" 답변도 config.toml을 읽은 것이지 실제 실행 모델(-m gpt-5.6-sol)이 아니다 → 모델 확인은 `/status`류 런타임 표시로만 신뢰.
- 비용: 스모크 테스트 30,374 토큰(실측)

### [2] 보강 — 스킬 2종 추가·verify 하드 읽기전용 경로·상기 hook(옵션) — 2026-10-29 23:05
- 분류/모델: 해당 없음 / 작성 리더
- 가설·의도: 스킬은 온디맨드 로드되는 프롬프트이므로, 자주 쓰는 축(서브에이전트 조정·설계·검증)에서 OMC/OMX 스킬의 계약을 더 충실히 옮기면 Technique/Intent 점수에 직결된다. deep-interview는 제외(소유자 결정).
- 조치: `.agents/skills/minimal-code-discipline`(YAGNI 사다리·비협상), `.agents/skills/design-review`(ralplan 핵심: 고정 스냅샷·검토자 독립·작성자만 종합·3라운드 상한) 추가. `verify`에 고위험 시 별도 `codex exec -s read-only` 경로와 중첩 실행 불가 시 리더 직접 재실행 폴백 추가. `optional/hooks.json` + `optional/hooks/{session-start,stop-reminder}.mjs`(차단 없음). AGENTS/README/체크리스트(#12 샌드박스 상속, #13 hook, #14 중첩 exec) 갱신.
- 재검증: 파서 검증 → 스킬 13·에이전트 7, ERRORS none, 제어문자 none / `node --check` 2개 통과 / 샘플 stdin으로 hook 실행: session-start → notepad 현재 위치 + decision-log 마지막 엔트리 주입(1,077자), stop-reminder → 변경 있음·검증 기록 없음 조건에서 상기 1줄 출력(차단 아님)
- 한계·잔여: hook 로컬 시험에서 Git Bash의 POSIX 경로(`/c/...`)를 cwd로 주면 Node가 파일을 못 찾아 빈 결과가 났다(Windows 경로로 재시험해 통과). Codex가 넘기는 cwd는 OS 네이티브 경로이므로 영향 없을 것으로 **추정** — 체크리스트 #13에서 실제 hook 경유로 확인. 커스텀 에이전트 샌드박스 재정의 가능 여부(#12)는 공식 문서상 불가로 보이나 실측 전.
- 비용: 해당 없음(Codex 호출 없음)

### [3] 풀이용 스킬 7종 + 원본 참조 폴백 — 2026-10-29 23:40
- 분류/모델: 해당 없음 / 작성 리더
- 가설·의도: kit에 "과정 관리" 스킬만 있고 "문제 풀이" 스킬이 없었다. 평가 3축에 직접 걸리는 OMC/OMX 계약(분석·디버그·테스트·조사·적대 QA·정리·커밋)을 40~60줄로 옮기면 과제 풀이 품질과 과정 증거가 같이 좋아진다. 원문이 더 필요할 때를 위해 clone+번역 폴백도 둔다.
- 조치: `.agents/skills/` 추가 — onboard(OMX analyze + OMC deepinit/architecture-survey), debug(OMC debugger+tracer), test-strategy(OMC test-engineer), research(OMC research), qa-adversarial(OMX ultraqa, 상한 3사이클·상태 CLI 제거), cleanup(OMC ai-slop-cleaner, 변경 파일 범위), git-hygiene(git-master + 소유자 브랜치 규칙), vendored-skill(폴백: vendor/ 원문 1파일 읽기 + Claude/OMX→Codex 번역표). `vendor/README.md`(태그 고정 clone, 포크 권고), `.gitignore`에 vendor/* 제외. AGENTS.md 작업 루프를 7단계(분류→지도→계획→구현→리뷰·검증→마감→기록)로, 스킬 표 21개. README 갱신.
- 재검증: 파서 검증 → skill 21(디렉터리명=name, 설명 40자+, 80줄 이하), toml 8, json 4, 제어문자 none, AGENTS 표 ↔ 디렉터리 불일치 none / `git ls-remote --tags` → OMC `v5.5.0` 존재(최신 v5.7.19), OMX `v0.21.40` 존재 — vendor/README의 핀 유효 / 추적 후보 파일 49
- 한계·잔여: 새 스킬 7종은 구조 검증만 했고 실제 과제에서 돌려보지 않았다(모의 과제 리허설 필요). `vendored-skill`의 번역표는 OMC 5.5.0·OMX 0.21.x 기준이며 상위 버전 원문에서 도구명이 바뀌면 표를 갱신해야 한다. deep-interview·prose-discipline은 소유자 결정으로 제외.
- 비용: 해당 없음(Codex 호출 없음)

### [4] [review] 모델 배치·호출 메커니즘 Codex 격리 리뷰 — 2026-10-30 00:20
- 분류/모델: 해당 없음 / 리뷰어 codex exec(read-only, --ignore-user-config, effort high), 29,215 토큰
- 가설·의도: 스킬이 모델을 명시해야 하는지, 에이전트 TOML 고정·config 기본값·리더 모델이 어떻게 상호작용하는지, Sol/Terra/Luna 배치가 모델 특성에 맞는지 독립 검토받는다.
- 조치: 공식 문서 사실(스킬은 모델·에이전트 지정 필드 없음, openai.yaml은 UI·호출 정책·MCP 의존성만, 서브에이전트 모델 미지정 시 부모 상속, 내장 default/worker/explorer 존재)을 전제로 config·7 TOML·AGENTS 2·3절·스킬 발췌를 제공.
- 재검증(리뷰 판정): A1 낮음 — 스킬 본문 "(Terra)" 괄호는 TOML과 이중 진실원 → 삭제·AGENTS로 통일 / A2 중간 — worker·explorer가 Codex 내장 에이전트와 이름 충돌 → 접두사 이름으로 변경, 스킬에 "등록된 커스텀 에이전트를 실제 spawn하고 적용 모델 기록" 명시 / A3 문제 없음(명시 모델 우선) + 상속 설명 문구 교체 / A4 문제 없음, "부모(Sol)"→"현재 부모 모델" / A 높음 — crosscheck 스킬의 "-m으로 새 스레드" 우회가 고정 Sol reviewer와 충돌 → Terra 고정 리뷰어 TOML 추가, "작성 모델과 다른 리뷰어 + 고위험은 Sol 필수" / B 중간 — explorer(Luna)는 참조 위치만 보고·관계 해석은 Terra, 검색 강제 완화; verifier Terra 유지하되 고위험 충분성은 Sol 별도 검토; writer Luna는 짧은 초안만; architect xhigh 상시→기본 high, 복잡 설계만 xhigh / C 중간 — 5.6 Terra 출력 단가($12)가 6.1 Sol($10)보다 높아 "Terra가 싸다"는 전제 성립 안 함, Terra 리더+Sol 계획·리뷰 역구성을 리허설에서 실험; Trivial 리더 직접 처리는 적절, execute 13행 문구 수정 / D 중간 — 404·레이트리밋 폴백, "3회 실패"→증거 기반 상향, 캘리브레이션 측정 항목(실제 모델·effort·입출력/캐시 토큰·재시도 포함 비용·시간·누락/오탐·성공률) 추가
- 한계·잔여: 반영은 소유자 승인 대기. docs/model-routing.md의 "Terra = Sol의 44% 비용" 수치는 6.1 Terra($1/$5) 실측에서 온 것이라 공지의 5.6 Terra에는 맞지 않음 → 근거 문서 정정 필요. 실행 도중 교훈: 리뷰 프롬프트를 `cut -c`로 자르면 한글 멀티바이트가 깨져 codex가 "input is not valid UTF-8"로 거부함(2회 실패 후 제거).
- 비용: 29,215 토큰(실측, 실패 2회분 제외)

### [5] 라우팅 재설계 반영 — Sol 기본·effort 조절, 에이전트 접두사·분리, 스킬 모델명 제거 — 2026-10-30 01:10
- 분류/모델: 해당 없음 / 작성 리더. 소유자 결정: "Terra는 레이트리밋·다른 리뷰어일 때만, Luna는 위치 찾기·초안만, 실제 모델은 공지대로"
- 가설·의도: 공지 단가 기준 6.1 Sol($2/$10) ≤ 5.6 Terra($2/$12)이므로 구현·검증을 Terra로 내릴 가격상 이유가 없다. Codex 리뷰([4]) 지적을 모두 반영하면 설정이 단일 진실원이 되고 호출 경로(스킬 → 에이전트 이름 → TOML 모델)가 명확해진다.
- 조치: (a) 에이전트 7종을 `cofa-` 접두사로 개명(내장 worker/explorer 충돌 회피), cofa-worker·cofa-verifier를 Sol로, cofa-architect를 high로 내리고 `cofa-architect-deep`(xhigh, $design-review 전용)과 `cofa-reviewer-terra`(Terra, $crosscheck 전용) 추가 → 9종. cofa-explorer는 위치 찾기만·관계 해석은 리더, cofa-writer는 짧은 초안만. (b) config.toml `default_subagent_model=gpt-6.1-sol`, 해석 순서 주석. (c) 스킬 21개에서 "(Sol)/(Terra)/(Luna)" 제거, 백틱 에이전트명 `cofa-*`로, 위임 문구를 "등록된 커스텀 에이전트를 spawn하고 적용 모델 기록"으로. crosscheck: `-m` 우회 삭제, cofa-reviewer-terra + 고위험은 cofa-reviewer 필수. verify: 고위험 검증 충분성은 리더 재검토. execute: Trivial 직접·Scoped 이상 위임, 상향은 증거 기반. design-review: cofa-architect-deep. model-routing: 표·폴백(404·레이트리밋 백오프·보류)·캘리브레이션 측정 항목·Terra 6.1 결정 규칙. (d) AGENTS 2·3절, README, 체크리스트 #3·#4·#5·#15·#16, omx/.omx-config.json(standard=Sol), docs/model-routing.md 비용 근거 정정·정정 기록.
- 재검증: TOML 9개 파싱·필수 필드·name=파일명 통과, 스킬 21개 frontmatter·80줄 이하 통과, 스킬·문서가 참조하는 `cofa-*` 이름 9개 모두 TOML 존재, AGENTS 스킬 표 ↔ 디렉터리 불일치 none, 스킬 본문(model-routing 제외) 모델 괄호 잔존 none, JSON 파싱 통과, 제어문자 none, 추적 후보 파일 51
- 한계·잔여: README·AGENTS 2절·docs에는 요약 표로 모델명이 남아 있다(설정의 요약이며 설명 목적, 이중 진실원 아님). 새 에이전트 이름·라우팅은 구조 검증만 했고 실제 spawn은 리허설 #3·#4·#5에서 확인해야 한다. Terra 리더 역구성은 체크리스트 #16 실험으로만 둠.
- 비용: 해당 없음(Codex 호출 없음)

### [6] [verify] 비대화형 리허설 — 에이전트 등록·spawn·모델 카탈로그·중첩 exec, 공개 repo·포크 — 2026-10-30 01:40
- 분류/모델: 해당 없음 / 리더 `codex exec -m gpt-5.6-sol`(로컬 codex-cli 0.154.0, Windows). 신뢰 등록: ~/.codex/config.toml에 kit 경로 trust_level=trusted 추가
- 가설·의도: 신뢰된 프로젝트에서 `.codex/agents`의 cofa-* 9종이 spawn 도구에 등록되고, 스킬이 부른 이름으로 spawn되어 TOML 모델이 적용되는지 실측한다.
- 조치: (1) kit 원본에서 #3·#4·#5·#14 실행. (2) 로컬 카탈로그에 맞춰 모델만 5.6으로 바꾼 임시 사본(Temp/cofa-kit-rehearsal, 별도 trust)에서 #4·#5·#9 재실행. (3) `-m gpt-6.1-sol / gpt-6-luna / gpt-5.6-terra` 단독 프로브. (4) GitHub API로 공개 repo `bladem0117/cofa-kit` 생성·push(main 2커밋), OMC/OMX 포크 생성(공개, v5.5.0·v0.21.40 태그 확인).
- 재검증: #3 PASS — spawn 도구의 agent_type 목록에 `cofa-architect, cofa-architect-deep, cofa-explorer, cofa-planner, cofa-reviewer, cofa-reviewer-terra, cofa-verifier, cofa-worker, cofa-writer` 9종 노출(내장 default/explorer/worker·OMX 설치분과 공존) / #4 원본: FAIL — "Unknown model `gpt-6.1-sol` for spawn_agent. Available models: gpt-6-astra, gpt-5.6-sol, gpt-5.6-terra, gpt-5.6-luna"(spawn이 TOML model을 런타임 카탈로그와 대조) / #4 사본: PASS — `cofa-explorer` spawn(JSONL `collab_tool_call` 2건) → `README.md:7` 반환 / #9 사본: PASS — `cofa-verifier` spawn, `bash -n scripts/probe.sh` 직접 실행, 종료 1을 FAIL로 사실 보고(원인은 Windows 샌드박스의 Git Bash CreateFileMapping 거부, kit 무관) / #5: 런타임 모델 표시 없음(exec 모드) / #14: FAIL — 세션 내 중첩 `codex exec` "failed to initialize in-process app-server client: 액세스가 거부되었습니다 (os error 5)" / 단독 프로브: gpt-5.6-terra exit 0 "ok", gpt-6.1-sol·gpt-6-luna exit 1 "Model metadata not found"(로컬 0.154 카탈로그 한계) / repo·포크 공개 확인 HTTP 200
- 한계·잔여: 로컬 버전이 대회 추정치(0.161+)와 달라 6.x ID는 로컬에서 검증 불가 — 메커니즘(등록·이름 spawn·TOML 모델 적용)은 5.6 사본으로 증명됨. `$verify`의 별도 read-only 프로세스 경로는 Windows 세션 안에서 차단됐고 Linux 환경은 미확인 → 폴백(리더 직접 재실행)이 기본일 가능성. 반영: `$model-routing` 폴백 0(spawn 모델 검증 실패 처리), 체크리스트 #4·#14 메모, vendor/omx README를 포크 기준으로. 서브에이전트 spawn은 JSONL에서 `item.*`/`collab_tool_call`로 관찰됨(향후 Disclaude 진행 표시에 활용 가능).
- 비용: 리허설 3회 + 프로브 3회(실측 토큰 미집계, exec 모드에서 usage는 turn.completed에만)

### [7] [verify] 모의 과제 1차 — 전체 루프 강제·위임 강제(한 줄 버그) — 2026-10-30 02:05
- 분류/모델: 모의. 리더 `-m gpt-5.6-sol`(로컬 카탈로그), 에이전트 TOML은 5.6으로 임시 치환한 사본(Temp/cofa-kit-rehearsal). 과제: `sample/stats.py` median이 짝수 길이에서 가운데 두 값 평균 대신 하나만 반환(테스트 7개 중 1개 실패)
- 가설·의도: kit의 AGENTS.md 루프를 실제 Codex가 따라가는지, 위임·기록이 실제로 일어나는지 본다. 프롬프트에서 "리더가 직접 고치지 말고 cofa-worker에 위임, 단계마다 엔트리"를 강제했다(루프 전체를 보기 위해).
- 조치: 540초 상한으로 비대화형 실행.
- 재검증: 540초 타임아웃(종료 124). 그 안에 기록된 것 — [분류] Scoped(이유: "문서 산출물까지 2개 이상 파일"), [지도·재현] `python -m unittest -q` 종료 1(1 실패 3 != 2.5) + 경쟁 가설 2개(구현 결함 vs 오래된 바이트코드 import)와 구별 프로브(`inspect.getsourcefile`) 실행으로 구현 결함 확정, [계획] 수용 기준 4·실행 단계 4·테스트 파일 SHA256 고정, 이어서 cofa-worker 위임 후 `wait` 중 타임아웃. 명령 22회, 파일 변경 3회(모두 docs). 테스트는 여전히 1 실패, median 미수정.
- 한계·잔여: 루프 품질(재현·반증·고정 해시)은 평가 기준에 부합하나, **한 줄 버그에 9분을 써도 구현에 못 도달**했다. kit 결함 2건 확인·수정: (1) 분류 기준이 "파일 수"라 기록 문서까지 세어 Trivial이 Scoped로 올라감 → AGENTS 1절 "코드·설정 변경 범위만 센다, Trivial은 2~5단계 건너뜀, 엔트리 1개"로 교체. (2) 단계마다 엔트리 작성이 명령을 늘림 → `$evidence-log`에 크기별 엔트리 수 표(Trivial 1 / Scoped ≤3 / Complex 단계마다)와 "기록은 파일 쓰기 1회" 추가. 리더가 자기 모델을 `gpt-6-astra`로 자가 보고 — exec 모드의 모델 자가 보고는 신뢰하지 않는다(체크리스트 #5와 일치). 2차 모의(Trivial 경로, 강제 없음)는 [8].
- 비용: exec 모드 usage 미출력(turn 미완료). 벽시계 540초

### [8] [verify] 모의 과제 2차 — Trivial 경로(강제 없음), 수정 반영 후 — 2026-10-30 02:20
- 분류/모델: 모의. 리더 `-m gpt-5.6-sol`, 에이전트 TOML 5.6 치환 사본. 같은 과제(median 짝수 길이 결함)
- 가설·의도: [7]에서 고친 분류 기준(코드 범위만)·엔트리 수 규칙이 실제로 Trivial 경로를 타게 하는지, 작성·검증 분리가 유지되는지 본다. 프롬프트는 "AGENTS.md 규칙 그대로, 강제 위임 없음".
- 조치: 480초 상한 비대화형 실행.
- 재검증: 종료 0, **109초**, 4단계(분류·재현 → 직접 수정 → `cofa-verifier` 독립 검증 → 기록). 분류 Trivial("구현 파일 1개의 자명한 수식 결함"). `sample/stats.py` 짝수 분기 추가, 테스트 파일 불변. `cd sample && python -m unittest -q` → 종료 0, `Ran 7 tests`, `OK`(리더·verifier 양쪽). JSONL: 명령 5회, 파일 변경 3회, `collab_tool_call` 1건(verifier spawn), decision-log 엔트리 1개 추가. usage: 입력 435,101(캐시 407,808) / 출력 3,900(추론 1,520).
- 한계·잔여: 수정된 함수 위에 결함을 설명하던 옛 주석이 그대로 남음 — Trivial은 `$cleanup`을 건너뛰므로 생기는 공백. `$verify`/Trivial 규칙에 "수정한 줄 주변의 낡은 주석도 같이 고친다" 한 줄을 추가할지 검토. 입력 토큰의 94%가 캐시 읽기(AGENTS·스킬·TOML 반복 로드) — 사용량 평가가 토큰 수 기준이면 kit 문서 길이가 곧 비용이다. 현재 AGENTS 약 70줄·스킬 21개(선택 시에만 본문 로드)는 유지하되 더 늘리지 않는다. 1차 [7] 대비: 540초 미완 → 109초 완료.
- 비용: 입력 435k(캐시 408k)·출력 3.9k 토큰(실측, turn.completed usage)

### [9] 대회 환경 1차 접속 실측 반영 — 스킬 설명 축소, 사람 기록(submission-notes), Codex 명령 요약 — 2026-10-31
- 분류/모델: 해당 없음 / 소유자 실측 보고 기반
- 가설·의도: 소유자가 실제 환경에서 확인한 사실 — (a) GitHub 공개 repo 3개(cofa-kit·포크 2) 인식, kit clone 가능, (b) 스킬이 "몇 개만" 인식, (c) 서브에이전트 모델 적용 여부 확인 어려움, (d) Codex는 거의 최신, 리더 기본 6.1 Sol, `/effort` 명령 없음, (e) 터미널 `npm install` 권한 없음 → OMX 설치 불가, (f) 평가는 마지막에 사람이 "구현한 것 / AI 제안 중 수정한 것"을 수동 기입. 각각에 kit이 답을 갖게 한다.
- 조치: (b) 22개 스킬 description을 100~130자로 축소(합계 4,900→2,316자, 초기 목록 예산 8,000자/컨텍스트 2%) + 체크리스트 #17(`/skills` 전체 노출). (c) 체크리스트 #2(`/status`로 리더 모델·effort·토큰), #18(spawn 성공=TOML 모델 수락). (d) README "Codex 내장 명령 요약" 표 — effort는 `/model` 픽커에서 선택(공식 문서: 별도 /effort 없음), `/status`·`/compact`·`/plan`·`/goal`·`/review`·`/diff`·`/mention`·`/skills`·`/hooks`·`/permissions`·`/new`·`/fork`·`/resume`, 토큰을 더 쓰는 것(xhigh·/review·/compact 미실행). (e) `omx/`는 옵션 그대로, 플랜 B가 기본임을 재확인(설치 0). (f) `docs/submission-notes.md`(6절 템플릿) + `$submission-notes` 스킬 + AGENTS 1절 7단계 규칙("사용자가 AI 제안을 수정·거부하면 즉시 2절 한 행") + plan/execute/review/verify/crosscheck/submission-check에 행 추가 지시. README "대회 당일 절차" 절.
- 재검증: 파서 검증 → 스킬 22(디렉터리=name, 설명 40자+, 80줄 이하), TOML 9+config, JSON 2, 제어문자 none, AGENTS 표 ↔ 디렉터리 불일치 none
- 한계·잔여: 스킬 일부만 인식된 원인이 설명 예산인지 환경 설정인지는 소유자가 `/skills`로 재확인해야 확정. 서브에이전트에 적용된 모델은 런타임 표시가 없을 수 있어 "spawn 성공"을 증거로 쓴다. 사람 기록 기능은 스킬 지시문 수준이라 리더가 빼먹을 수 있음 → 제출 전 `$submission-check` 8단계가 안전망.
- 비용: 해당 없음

### [10] 참가자 후기 반영 — 실무자 인터뷰·합의문, 확인 문제 대비, handoff — 2026-10-31
- 분류/모델: 해당 없음 / 웹 조사(공개 후기는 brunch 1편뿐: 크래프톤 FDE 코파톤 2026-07-30)
- 가설·의도: 후기의 사실 — E2B 샌드박스 웹 IDE(우측 실무자 AI 채팅), 빌드 225분 후 AI 없이 3분×5문항 확인 문제(왜 그렇게 만들었나·장애 대응, 모범답안 약점→파급→다음 검증), 평가 4축 중 Intent 최고 변별·Cognition 전원 최저, README에 해법이 있어 산출물 수렴, Top3는 handoff 스킬 보유, 실수는 리허설 부족·handoff 타이밍 미설정. kit이 각 사실에 대응 수단을 갖게 한다.
- 조치: 스킬 3종 추가 — `stakeholder-interview`(README 먼저·간극 하나·에피소드→워크어라운드→정량화→당사자→경계·합의문 숫자 기준·실무자 확인 인용), `cognition-prep`(마감 20분 전 결정 지점 8~12개→문항 10~15개→3단계 답 초안→사람 검수·암기 카드), `handoff`(컨텍스트 60%·단계 전환·제출 전, 현재 위치·결정 포인터·검증 상태·다음 행동·환경 메모). `templates/agreement.md`. AGENTS 1절에 0단계(발굴·합의)와 225분 시간 배분(30/25/110/25/35, 추정), 6단계 마감에 handoff·cognition-prep. README "실측 후기에서 배운 것" 표. 체크리스트 #19(풀타임 리허설 2회)·#20(확인 문제 모의, AI 없이 3분 타이핑).
- 재검증: 파서 검증 → 스킬 25(디렉터리=name, 설명 합계 2,937/8,000자, 80줄 이하), AGENTS 표 ↔ 디렉터리 불일치 none, `$스킬` 참조 미존재 none, TOML 10·JSON 2 파싱, 제어문자 none
- 한계·잔여: 후기는 1편(2026-07, GPT-5.5 시절)이라 현재 환경과 다를 수 있음(소유자 1차 접속에서 6.1 Sol 기본·npm 불가 확인). 확인 문제의 실제 문항·채점은 비공개라 cognition-prep의 3단계 형식은 후기의 "모범답안 형식" 서술에 의존. 시간 배분은 추정이며 리허설 #19로 보정해야 함.
- 비용: 해당 없음

### [11] [review] 스킬 25종 충분성·자동 호출·산출물 Codex 격리 리뷰 반영 — 2026-10-31
- 분류/모델: 해당 없음 / 리뷰어 codex exec(read-only, --ignore-user-config, effort high), 47,603 토큰, 입력 78KB(스킬 전문 25개)
- 가설·의도: 소유자 우려 — "낯선 스킬명이라 자연어로는 자동 실행이 안 될 것 같다" + 각 스킬 프롬프트가 충분한지 외부 시각으로 점검.
- 조치(리뷰 판정 → 반영): [최상] 사람 기여 귀속 — submission-notes 1절에 주체 열(AI 구현(지시)/AI 구현(승인)/직접 수정), 기록 없는 개입은 추정 금지; cognition-prep에 "실제 무AI 평가 중 사용 금지, 재심문은 AI 허용 확인 후" / [높음] 거짓 완료 — verify 판정식(기준별 PASS/FAIL/INCOMPLETE/N/A, 전부 PASS일 때만 PASS, `docs/verification.md` 블록 저장), execute "구현 종료≠검증 통과, 실패 잔존=미완" / [높음] 승인 왕복 — plan 6단계 "구현 요청+범위 명확이면 기록 후 진행, 불명확·고위험만 승인 대기", execute 1단계 동일, plan 5단계 단일 분기(Scoped 선택 비판 / Complex·고위험 → design-review), design-review 최종본 재승인 / 흐름 공백 — interview 다음은 onboard→plan, 실무자 부재 경로, AGENTS 6단계 "T+190 기능 동결·마지막 변경 뒤 verify 재실행·무AI 평가 시작 시 Codex 종료" / 개별 — review 재현 불가 고위험=차단 후보, crosscheck 다른 모델 불가=미충족·갱신 diff 재리뷰, qa 수정 후 verify 재진입·qa-report.md, test-strategy 첫 GREEN 점검, git-hygiene 비대화형 add·오탐 사유, onboard docs 예외, goal-loop /goal 가용성·잔여 시간 상한, model-routing 캘리브레이션 표 고정, submission-check PARTIAL 규칙·8행, vendored-skill 재귀 1단계·개수 정정, remember decision-log 정정 엔트리, handoff 재개 시 git 대조 / 자동 호출 — 25개 description에 한국어 트리거 2~3개+구분 조건(합계 3,267/8,000자), AGENTS 9절 "사용자 표현 → 스킬 → 구분 조건" 라우팅 표 22행(명시 `$이름` 우선, 복합 요청은 현재 단계 우선) / `docs/skill-map.md`(흐름 19행·분기 7행·산출물 파일 표).
- 재검증: 파서 검증 → 스킬 25(name=dir, 80줄 이하), 설명 합계 3,267자, AGENTS 8절 표 ↔ 디렉터리 불일치 none, `$스킬` 참조 미존재 none, TOML 10·JSON 2, 제어문자 none
- 한계·잔여: 자연어 자동 호출은 description 매칭에 의존하므로 환경에서 "리뷰해"·"검증해" 같은 표현으로 실제 로드되는지 #17 뒤에 추가 확인 필요(안 되면 `$이름` 명시가 기본). 미반영: review 결과의 별도 파일(docs/review.md)은 decision-log 라운드 기록으로 대체(토큰·IO 절약), workstyle의 상시 규칙 AGENTS 이관은 중복 허용(설명 목적).
- 비용: 리뷰 47,603 토큰(실측)

### [12] 평가자 발언 반영 — 비용 규율·실무자 질문법·과설계 통제·클린 기동 — 2026-10-31
- 분류/모델: 해당 없음 / 유튜브 자막(yt-dlp 2026.10.26, ko 자동 자막 28,815자) 전문 분석. 외부 모델 리뷰 없음(저장소 밖 사실이라 crosscheck는 "확인 불가"만 냄)
- 가설·의도: 영상은 하우와이 AI 팟캐스트(크래프톤 Cofa-Probe PO 구한모·AI 프로덕트 엔지니어 조정석), 즉 평가자 본인의 설명이다. 사실: (a) 지원자별 도구·토큰·비용 추적, "잘하는 사람일수록 비용 적게 쓴다", 과제문 복붙+goal 일괄 실행은 10분 산출물→3시간 수동 수정으로 토큰 소진; (b) 실무자 AI는 사소한 질문부터 점점 깊게 가는 지원자에게 점수가 잘 나오도록 "깎아 놓음", "할 일 1·2·3 알려 달라"는 막힘, "뭘 답해 줄 수 있나"는 허용, 요구는 질문마다 하나씩 풀림, 과제문은 두어 문장; (c) 3축 = 기술 부채·의도 부채·인지 부채 연구 기반. Intent 고득점은 과제문 조목조목 따지기·위험 부분 세부 설계·긴 구현 서브에이전트 분리; Cognition은 산출물에서 문항 생성("왜 이 패턴, 왜 이 라이프사이클에서 유효"), AI 과설계 통제가 중심(읽기 전용 API 뒤 DB에 쓰기 가드 촘촘 = 범용 설계일 뿐); (d) 평가는 지원자당 20개+ 에이전트 병렬, 세부 역량별 루브릭+소스 근거, 화면 캡처·실행 상태 점검, Opus/Sonnet/Haiku 풀이로 루브릭 신뢰도 검증, Top3는 "왜 이렇게 했나" 면접; (e) 평소 하네스·스킬 업로드 허용·가중치, "에고를 버려라", 도메인 지식 있는 비개발자(매장 2년) 상위권.
- 조치: `.codex/config.toml` 리더 `model_reasoning_effort` high→**medium**([4][5] "비용 레버는 effort" 결정의 연장. high 에이전트 4종·xhigh 1종은 유지). AGENTS 1절 0단계 질문 방식 한 줄, 2절 표 리더 행 분리 + "비용은 점수다" 낭비 패턴 7개, 3절 Intent 고득점 행동, 5절 "과제 직후 /goal 금지". 스킬 5종: `stakeholder-interview` "묻는 법" 절 6항, `cognition-prep` 4번째 질문 틀·가져온 스킬 결정 지점·"요구 기준으로 답" 규칙, `minimal-code-discipline` 1단 "범용 모범사례만으로 넣지 않는다"+뺀 과설계 submission-notes 2절 기록, `goal-loop` "과제 직후 금지", `submission-check` 1항 클린 기동. `docs/submission-notes.md` 5절 "쓴 것/바꾼 것", `docs/model-routing.md` 리더 medium 근거, README 설계 원칙 1항·평가자 발언 표 6행·`/skills` 25개 정정, 체크리스트 #2 effort medium·#17 25개·#21 토큰 측정 추가.
- 재검증: 파서 검증 → 스킬 25(name=dir, 80줄 이하), 설명 합계 3,267자(변경 없음), AGENTS 8절 표 ↔ 디렉터리 불일치 none, `$스킬` 참조 미존재 none, TOML 10·JSON 2 파싱, 제어문자 none, 리더 effort 표기 high 잔존 none
- 한계·잔여: 자동 자막이라 고유명사·일부 어구 오인식 가능(요지로만 인용). 영상 사례는 코파톤(6시간, 올리브영 협업, Claude Code 언급) 중심이라 2차 예선(225분, Codex 전용, 모델 3종)과 다를 수 있음. "비용 적게 쓴다"는 상관 관찰이지 채점식 공개가 아님 → 리더 medium으로 품질이 떨어지면 역효과이므로 리허설 #21로 확인하고, 되돌리기는 config.toml 한 줄. 실무자 AI의 동작은 고객사·과제별로 다를 수 있음.
- 비용: 해당 없음(자막 다운로드·로컬 분석)
