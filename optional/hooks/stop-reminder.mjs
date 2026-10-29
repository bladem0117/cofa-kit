// cofa-kit Stop hook — 차단 없음(decision=block을 절대 내지 않는다). 작업 트리에 변경이 있는데
// docs/decision-log.md에 최근 verify 기록이 없으면 한 줄 상기만 한다. 실패하면 조용히 종료(exit 0).
// stdin: Codex hook JSON({ cwd, ... }). stdout: { hookSpecificOutput: { hookEventName: 'Stop', additionalContext } } 또는 빈 출력.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

function readStdin() {
  try { return JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch { return {}; }
}
function readText(path) {
  try { return existsSync(path) ? readFileSync(path, 'utf8') : ''; } catch { return ''; }
}
function hasWorkingTreeChanges(cwd) {
  try {
    const out = execSync('git status --porcelain', { cwd, stdio: ['ignore', 'pipe', 'ignore'], timeout: 5000 }).toString();
    // decision-log·notepad만 바뀐 경우는 "작업 변경"으로 치지 않는다.
    return out.split(/\r?\n/).some((l) => l.trim() && !/docs\/(decision-log|notepad)\.md$/.test(l.trim()));
  } catch { return false; }
}
function recentVerify(log) {
  // 마지막 3개 엔트리 안에 verify/검증 기록이 있는지
  const entries = log.split(/\n(?=### \[)/).slice(-3).join('\n');
  return /\[verify\]|\bverify\b|검증\s*—|PASS|FAIL|PARTIAL/i.test(entries);
}

const input = readStdin();
const cwd = input.cwd || process.cwd();
const log = readText(join(cwd, 'docs', 'decision-log.md'));

let context = '';
if (hasWorkingTreeChanges(cwd) && !recentVerify(log)) {
  context = '상기: 작업 트리에 변경이 있지만 docs/decision-log.md 최근 엔트리에 검증(verify) 기록이 없습니다. 완료를 주장하기 전에 $verify를 실행하고 $evidence-log로 결과를 남기세요. (이 메시지는 차단하지 않습니다.)';
}

if (context) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'Stop', additionalContext: context } }));
}
process.exit(0);
