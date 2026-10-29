# 리허설 체크리스트 — 기능별 동작 시험

버전 번호는 동작을 보증하지 않는다. 새 환경(로컬 리허설, 대회 당일)마다 아래 항목을 **각 1회 실행**하고 결과를 `decision-log.md`에 엔트리로 남긴다. 실패한 기능은 끄거나 우회하고, 그 결정도 기록한다.

| # | 기능 | 시험 방법 | 기대 | 실패 시 우회 |
|---|---|---|---|---|
| 1 | 환경 확인 | `bash scripts/probe.sh` | Codex 버전·node·npm prefix·tmux·네트워크 출력 | 없음(정보 수집) |
| 2 | 프로젝트 설정 로드 | `codex` 실행 → 신뢰 승인 → `/status` 또는 모델 표시 확인 | 리더 모델이 `gpt-6.1-sol` | 신뢰 안 되면 `~/.codex/config.toml`에 수동 복사 |
| 3 | 커스텀 에이전트 인식 | "사용 가능한 커스텀 에이전트를 나열해" | cofa-planner/architect/architect-deep/worker/explorer/reviewer/reviewer-terra/verifier/writer 9종 | `.codex/agents`를 `~/.codex/agents`로 복사 |
| 4 | 서브에이전트 spawn | "커스텀 에이전트 `cofa-explorer`를 spawn해 README의 제목 위치만 찾아 보고해" | cofa-explorer가 돌고 경로:줄이 돌아옴(내장 explorer가 아님을 확인). spawn은 TOML `model`을 런타임 카탈로그와 대조하므로 "Unknown model … Available models: …" 오류가 나면 그 목록을 #15의 입력으로 쓴다 | 모델 불일치면 `$model-routing` 폴백 0, `[agents] enabled` 확인, 안 되면 리더가 직접 |
| 5 | 모델 선택 | 4의 결과에 사용 모델이 Luna인지(런타임 표시 기준, config 파일 읽기 아님) | `gpt-6-luna` | 모델 404면 `$model-routing` 폴백·캘리브레이션 |
| 6 | 스킬 인식 | `$workstyle` 입력 | 스킬 본문이 로드되고 요약이 나옴 | `.agents/skills`를 `~/.codex/skills`로 복사 |
| 7 | /goal | `$goal-loop` 형식으로 작은 목표(예: 파일 1개에 주석 추가 후 grep 확인) 등록 | 자동 계속 → 완료 감사 → 종료 | goals 기능 없으면 수동 반복 + 상한 기록 |
| 8 | 중단·재개 | 7 진행 중 중단 → 재시작 → `docs/notepad.md`로 위치 복구 | 같은 지점에서 이어짐 | notepad 수동 갱신 |
| 9 | 검증 분리 | worker가 바꾼 파일을 verifier에게 넘김 | verifier가 명령을 직접 실행하고 판정 | 리더가 다른 스레드에서 검증 |
| 10 | 비밀값 스캔 | `$submission-check` 3번 항목 | 0건 | 발견 시 제거 |
| 11 | (옵션) OMX | `omx/README.md` 절차 | `omx doctor` 통과, 모델이 Sol/Terra/Luna | 실패 시 OMX 미사용, 플랜 B 유지 |
| 12 | 서브에이전트 읽기 전용 강제 여부 | explorer에 "README 첫 줄에 글자 하나 추가해 봐"(테스트용 임시 파일로) | 공식 문서대로면 부모 샌드박스를 상속해 **수정이 가능**함 → 지시문만으로 막힘 | 고위험 검증은 `$verify`의 별도 `codex exec -s read-only` 경로 |
| 13 | (옵션) 상기 hook | `optional/README.md` 절차로 `.codex/hooks.json` 설치 → `/hooks` 승인 → 세션 재시작 | SessionStart에 notepad 요약 주입, 턴 종료 시 verify 미기록 상기(차단 없음) | 승인 불가·오류 시 파일 삭제, AGENTS.md 규칙만으로 운용 |
| 14 | 중첩 `codex exec` 허용 여부 | 리더 셸에서 `codex exec -s read-only "echo ok"` | 종료 0 | 막히면 #12 우회 불가 → 리더가 핵심 명령 직접 재실행. 로컬(Windows, 0.154) 실측은 종료 1 "failed to initialize in-process app-server client: 액세스가 거부되었습니다 (os error 5)" — 세션 안 중첩 실행이 차단됨. 대회 환경(Linux 추정)에서 재확인 |
| 15 | 노출 모델·버전 확인 | `/model` 목록을 적는다. Terra가 5.6인지 6.1인지 | 공지대로 6.1 Sol·5.6 Terra·6 Luna | 6.1 Terra면 `docs/model-routing.md` 결정 규칙대로 worker·verifier를 Terra로 전환 |
| 16 | (선택) 리더 Terra 역구성 실험 | 같은 소과제를 리더 Sol 구성과 `-m gpt-5.6-terra` 리더 구성으로 각 1회 | 토큰·시간·정확도 비교표 | 결과를 decision-log에만 기록, 기본 구성은 바꾸지 않음 |

## 로컬 리허설 메모
- 로컬 Codex 0.154는 `gpt-6.1-sol`·`gpt-6-luna`를 모를 수 있다. 로컬 시험 때는 `-m gpt-5.6-sol` 등으로 바꿔 돌리고, 모델 ID 차이는 설정 파일만 고치면 된다는 점을 확인한다.
- 대회 Codex는 0.161 이상으로 추정(기본 모델이 6.1 Sol). 추정이다.

## 기록 형식
`decision-log.md`에 `### [n] 리허설 — 항목 #k` 엔트리로, 재검증 칸에 실제 명령과 출력을 쓴다.
