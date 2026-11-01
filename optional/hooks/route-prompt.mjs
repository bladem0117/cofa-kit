// cofa-kit UserPromptSubmit hook — 차단 없음. 사용자 문장에 kit 스킬의 자연어 트리거가 보이면
// "해당 SKILL.md를 읽어 따르라"는 한 줄을 컨텍스트로 넣는다. 명시 호출($이름)이 있으면 개입하지 않는다.
// stdin: Codex hook JSON({ cwd, hook_event_name, prompt, ... }). stdout: { hookSpecificOutput: { hookEventName, additionalContext } }
// 표는 AGENTS.md 9절과 같은 내용이다. 바꾸면 양쪽을 같이 바꾼다.
import { readFileSync } from 'node:fs';

function readStdin() {
  try { return JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch { return {}; }
}

const input = readStdin();
const prompt = String(input.prompt ?? input.user_prompt ?? input.message ?? '').trim();
if (!prompt) process.exit(0);
if (/\$[a-z][a-z0-9-]+/.test(prompt)) process.exit(0); // 명시 호출 우선

const ROUTES = [
  ['stakeholder-interview', ['요구사항부터', '뭘 물을까', '뭘 물어', '문제 정의', '인터뷰', '실무자에게']],
  ['onboard', ['구조 설명', '어디서 처리', '어떻게 돌아가', '코드베이스 파악']],
  ['plan', ['계획 세워', '작업 나눠', '순서 잡아', '기준을 어떻게 잡', '어떤 방식으로 풀', '최적화 기준']],
  ['design-review', ['설계 비교', '대안 검토', '구조 괜찮', '설계 검토']],
  ['execute', ['구현해', '만들어줘', '만들어 줘', '고쳐줘', '고쳐 줘', '추가해줘', '추가해 줘']],
  ['debug', ['오류 고쳐', '빌드 안 돼', '왜 실패', '에러 나', '안 돌아가']],
  ['research', ['어떻게 쓰지', '공식 문서', '사용법', '라이브러리 확인']],
  ['test-strategy', ['테스트 추가', '간헐적', 'TDD', '테스트부터']],
  ['review', ['리뷰해', '코드 검토', '버그 찾아']],
  ['crosscheck', ['독립 검증', '반례 찾아', '다른 모델로', '교차 검증', '교차검증']],
  ['verify', ['제대로 돼', '검증해', '충족 확인', '진짜 되는지']],
  ['qa-adversarial', ['엣지 케이스', '이상 입력', '깨뜨려']],
  ['cleanup', ['정리해', '군더더기', '간소화']],
  ['git-hygiene', ['커밋해', '이력 정리']],
  ['handoff', ['새 세션', '인계', '이어가기']],
  ['cognition-prep', ['예상 질문', '설명 연습', '확인 문제 대비']],
  ['submission-check', ['제출해도', '마감 점검', '제출 전']],
  ['submission-notes', ['내가 한 일 정리', '수정 내역']],
  ['goal-loop', ['끝까지 진행', '알아서 계속']],
  ['model-routing', ['모델이 안 돼', '어떤 모델']],
  ['go', ['다음 뭐 해', '이제 뭐', '이어서 해', '다음 단계']],
];

const hits = [];
for (const [skill, keywords] of ROUTES) {
  const kw = keywords.find((k) => prompt.includes(k));
  if (kw) hits.push({ skill, kw });
}
if (hits.length === 0) process.exit(0);

const list = hits.slice(0, 2).map((h) => `$${h.skill}("${h.kw}")`).join(', ');
const additionalContext =
  `[cofa-kit 라우팅] 이 요청은 ${list} 에 해당할 가능성이 높다. ` +
  '명시 $이름이 없으므로 AGENTS.md 9절 표로 확정하고 해당 .agents/skills/<이름>/SKILL.md를 읽어 따르라. ' +
  '둘 이상이면 흐름상 앞선 것부터. 확신이 없으면 $go 절차(상태 감지)로 고른다. 이 힌트는 상기일 뿐 강제가 아니다.';

process.stdout.write(JSON.stringify({
  hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext },
}));
process.exit(0);
