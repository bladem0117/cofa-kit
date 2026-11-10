# 참조 저장소·라이브러리(최적화) — 언제 어떻게 읽나

규칙: 네트워크가 열려 있고 해당 문제군일 때만, **예제 파일 1개**를 읽는다. 저장소 전체 읽기 금지(토큰 = 비용). 설치는 환경이 허용할 때만 `pip install --user`, 실패하면 폴백 순위대로. 2차 예선 환경은 npm 전역 설치가 막혀 있었다 — pip도 막힌다고 가정하고 시작한다.

## 가용성 확인 — 입장 캘리브레이션에 한 줄 추가
```bash
python -c "import scipy; print('scipy', scipy.__version__)"; python -c "import ortools; print('ortools ok')"; python -c "import pulp; print('pulp ok')"; python -c "import simpy; print('simpy ok')"
# 분석·웹 라이브러리와 설치·패키징 도구까지 한 번에(계획의 기술 선택 표를 채우기 전에 본다). False·오류가 나온 것은 쓰지 않는 쪽으로 계획한다
python -c "import importlib.util as u; print({m: bool(u.find_spec(m)) for m in ['numpy','pandas','scipy','sklearn','statsmodels','matplotlib','flask','fastapi','uvicorn','streamlit','ortools','pulp','simpy']})"; pip --version; docker --version; docker info --format '{{.ServerVersion}}' 2>&1 | head -1; node -v
```

## 표
| 도구 / 저장소 | 문제군 | 폴백 순위 | 읽을 파일 1개 | 웜스타트·시간 상한 |
|---|---|---|---|---|
| SciPy `scipy.optimize` — `milp`(HiGHS), `linear_sum_assignment`, `linprog` | MILP, 배정, LP 상한 | 1 (거의 항상 설치돼 있음) | 공식 문서 `milp` 예제 | `milp(..., options={"time_limit": s})`. 웜스타트 없음 → 1단 해는 비교·폴백용 |
| google/or-tools — CP-SAT, routing | 스케줄링, 배정, VRP | 2 | `examples/python/` 의 jobshop 또는 vrp 하나 | `model.AddHint(var, v)`, `solver.parameters.max_time_in_seconds` |
| PuLP (CBC 내장) | MILP | 3 | 공식 예제 하나 | `PULP_CBC_CMD(timeLimit=s, warmStart=True)` + 변수 `setInitialValue` |
| SimPy | 이산 사건 시뮬레이션(라인·반송 검증) | 필요할 때만 | 공식 튜토리얼 첫 예제 | 해당 없음 |
| SMT2020 (semiconductor manufacturing testbed) | FAB 모델의 어휘·구조(스텝 수백, 설비군, 배치, re-entrant) | 참고용, 코드는 안 가져옴 | 논문 요약만 | 해당 없음 |

## 아무것도 없을 때
표준 라이브러리만으로 1단(그리디 + 교환 개선)을 만들고, `itertools.combinations`로 후보 ≤ 20인 소규모 인스턴스를 전수 비교해 보장을 보인다. 상한은 LP 완화 대신 단순 이론 하한(예: 필수 지점 수 ÷ 최대 커버 수)으로 적고 "약한 상한"이라고 표시한다.

## 기록
어느 도구를 썼고 왜 그 순위였는지(설치 확인 명령 출력 포함)는 `docs/decision-log.md` 캘리브레이션 엔트리에 한 줄. 외부 자료를 읽었으면 출처 URL과 읽은 범위(파일 1개)를 적는다 — 공개 자료만 허용되는 규정 대응.
