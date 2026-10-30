# 모델 라우팅 근거

규칙은 `.agents/skills/model-routing/SKILL.md`, 실제 배치는 `.codex/config.toml`과 `.codex/agents/*.toml`에 있다. 이 문서는 **근거 수치와 출처**만 담는다. 수치는 2026-10-28 기준 공개 자료이며, 대회 환경 캘리브레이션 결과가 다르면 이 문서와 `decision-log`를 갱신한다.

## 공지 모델과 단가

| 공지 표기 | ID | 입력 $/M | 출력 $/M | 비고 |
|---|---|---|---|---|
| 6.1 Sol | `gpt-6.1-sol` | 2 | 10 (캐시 입력 0.10) | 2026-09-29 출시. Codex 0.161(2026-10-07)부터 기본 모델 |
| 5.6 Terra | `gpt-5.6-terra` | 2 | 12 | 2026-08 공개 자료 기준. **Sol보다 출력이 20% 비쌈** |
| 6.0 Luna | `gpt-6-luna` | 0.10 | 0.50 (캐시 0.01) | 1M 컨텍스트. 소규모 실측 정확도 6/9, 장문맥 회상 약함 |

## 결론: Sol 기본, effort로 비용 조절

- 가격만 보면 Sol이 Terra를 지배한다(입력 같음, 출력 더 쌈). 같은 작업에서 Sol이 토큰을 약 13% 더 쓰고 시간은 1.8배 걸린다는 소규모 실측이 있으나, 단가를 합치면 과제당 비용은 Sol ≈ 5.6 Terra다. 같은 돈이면 더 강한 모델을 쓴다.
- OpenAI는 6.1 Sol이 **낮은 reasoning effort에서도 강하다**고 명시했다. 그래서 비용 레버는 모델 교체가 아니라 effort다: **리더 medium**, 구현 medium, 계획·리뷰·검증 high, 깊은 설계 검토만 xhigh. 리더를 medium으로 둔 근거(2026-10-31, `decision-log` [12]): 평가 환경이 지원자별 토큰·비용을 추적하고 평가자가 "잘하는 사람일수록 비용을 적게 쓴다"고 밝혔다. 리더의 일은 인터뷰·조정·위임이라 깊은 추론은 high 에이전트가 맡는다.
- Terra가 남는 이유는 둘이다. 작성 모델(Sol)과 **다른 모델의 독립 리뷰**(`cofa-reviewer-terra`), 그리고 Sol **레이트리밋 폴백**.
- Luna는 20배 싸지만 조용히 틀린다. 틀려도 바로 드러나고 싼 일(위치 찾기, 커밋 메시지·요약 초안)에만 쓰고 결과는 리더가 확인한다.

## 정정 기록
초기 표는 "Terra = Sol의 44% 비용"을 근거로 구현·검증을 Terra에 배치했다. 그 수치는 **6.1 Terra($1/$5)** 실측(Nerd's Chalk 2026-10-26~27: Terra $0.078 vs Sol $0.178/라운드, 정확도 9/9 동일, 시간 27.6초 vs 49.7초)에서 온 것이라 공지의 5.6 Terra에는 맞지 않는다. 2026-10-30 Codex 격리 리뷰가 이 점을 지적해 Sol 기본으로 바꿨다(`decision-log` [4]·[5]).

## 결정 규칙 (환경에서 확인 후 적용)
- 노출된 Terra가 **5.6**이면 위 표 그대로.
- 노출된 Terra가 **6.1**($1/$5)이면 구현(`cofa-worker`)·검증(`cofa-verifier`)을 Terra로 되돌리고 Sol은 계획·리뷰에 집중한다. TOML 두 파일의 `model`만 바꾸면 된다.
- 평가는 토큰과 비용을 모두 추적한다(평가자 발언, 2026-10). 어느 쪽이든 결론은 Sol 기본이며, 효율은 불필요한 재시도·spawn·장황한 출력·과제 직후 `/goal`을 줄이는 데서 난다.

## 환경 전제
- Codex 버전 업데이트 금지. 라우팅은 버전과 무관하게 설정 파일로 선언한다.
- 모델이 없거나 레이트리밋이면 `$model-routing`의 폴백 절을 따른다.

## 출처
- OpenAI GPT-6.1 Sol 출시(단가·"낮은 effort에서도 강함"): https://openai.com/index/introducing-gpt-6-1-sol/
- Codex 0.161 기본 모델 전환: https://dev.to/piekwerk/codex-0161-flipped-the-default-model-to-gpt-61-sol-if-you-never-set-model-you-already-switched-577b
- GPT-5.6 세대 단가(Terra $2/$12): https://continuumcode.ai/guides/codex-models/
- GPT-6 Luna 단가·컨텍스트: https://apidog.com/blog/what-is-gpt-6-luna/
- 6.1 Terra/6.1 Sol/6 Luna Codex 작업 비용 실측: https://nerdschalk.com/gpt-6-1-terra-api-task-cost/
- Sol/Terra/Luna 라우팅 프레임워크: https://codex.danielvaughan.com/2026/07/26/codex-cli-model-routing-patterns-gpt56-sol-terra-luna-decision-framework/
