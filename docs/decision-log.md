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
