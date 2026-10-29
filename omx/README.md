# 플랜 A — OMX(oh-my-codex) 옵션

기본은 플랜 B(Codex 네이티브, 설치 없음)다. OMX는 **아래 조건이 모두 확인되고, 리허설에서 특정 기능(ralplan 합의 계획, team 병렬)의 이득이 입증됐을 때만** 얹는다. 심사자가 도구 설정을 읽으므로, 설명할 수 없는 오버레이는 넣지 않는다.

## 전제 조건 (scripts/probe.sh로 확인)
- `npm config get prefix` 경로에 쓰기 가능
- `https://registry.npmjs.org/` 응답 200
- team을 쓸 경우 `tmux` 존재(Windows psmux는 공식적으로 less-supported)
- Codex 업데이트는 하지 않는다. OMX 설치가 Codex 재설치를 유도하면 중단한다.

## 설치 (버전 핀)

```bash
npm install -g oh-my-codex@0.21.40        # 핀. latest 금지(일 1~3회 릴리스)
cp omx/.omx-config.json ~/.codex/.omx-config.json
omx setup --scope project --merge-agents  # 이 저장소 루트에서. AGENTS.md의 OMX 섹션은 마커 사이에만 들어간다
omx doctor
```

설치 뒤 `~/.codex/agents/*.toml`이 생성된다. `architect.toml`의 `model`이 `gpt-6.1-sol`, `explore.toml`이 `gpt-6-luna`인지 확인한다. 기본값(`gpt-6-astra`)이 보이면 `.omx-config.json` 복사가 안 된 것이다.

## 왜 덮어쓰기가 필수인가
OMX 0.21.40의 `DEFAULT_FRONTIER_MODEL`·`DEFAULT_STANDARD_MODEL`·`DEFAULT_SPARK_MODEL`은 모두 `gpt-6-astra`다. 그대로 두면 모든 서브에이전트가 최고가 모델로 돌아 권장 모델을 벗어나고 사용량 평가에 불리하다. `.omx-config.json`의 `env`·`agentModels`·`agentReasoning`이 이를 덮어쓴다(해석 순서: agentModels > env > 기본값).

## 쓰는 기능과 쓰지 않는 기능
| 기능 | 사용 | 이유 |
|---|---|---|
| `$ralplan` | 고위험·Complex 과제의 합의 계획에만 | Planner → Architect → Critic 독립 리뷰. 단, 트리거어가 `consensus` 가드에 걸리는 버전이 있으므로 실패하면 플랜 B의 `$plan` + architect 비판으로 대체 |
| `$ultragoal` | 사용 안 함 | 네이티브 `/goal` + `$goal-loop`로 충분하고 설명이 쉽다 |
| `$team` | tmux가 있고 독립 단위가 3개 이상일 때만 | 없으면 `[agents]` 병렬 spawn |
| HUD·알림 | 사용 안 함 | 평가와 무관 |

## 공개 유지 조건
대회 규정상 사용한 공개 저장소는 결과 통지까지 공개 상태여야 한다. 제3자 저장소(oh-my-codex)가 비공개로 바뀌는 위험을 피하려면 본인 계정으로 포크해 `0.21.40` 태그를 고정하고, 설치 출처를 포크로 바꾼다:

```bash
npm install -g github:<내계정>/oh-my-codex#v0.21.40
```

## 제거
```bash
omx uninstall
npm uninstall -g oh-my-codex
```
`AGENTS.md`의 `<!-- OMX:AGENTS:START -->` ~ `END` 구간을 지우면 플랜 B 상태로 돌아간다.
