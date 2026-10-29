// cofa-kit SessionStart hook — 차단 없음. docs/notepad.md의 "현재 위치" 절과 decision-log 마지막 엔트리를 컨텍스트로 주입한다.
// stdin: Codex hook JSON({ cwd, hook_event_name, ... }). stdout: { hookSpecificOutput: { hookEventName, additionalContext } }
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

function readStdin() {
  try { return JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch { return {}; }
}
function readText(path) {
  try { return existsSync(path) ? readFileSync(path, 'utf8') : ''; } catch { return ''; }
}
function section(text, heading) {
  // "## heading" 부터 다음 "## " 전까지
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => l.trim() === `## ${heading}`);
  if (start < 0) return '';
  const out = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) break;
    out.push(lines[i]);
  }
  return out.join('\n').trim();
}
function lastEntry(text) {
  const idx = text.lastIndexOf('\n### [');
  return idx < 0 ? '' : text.slice(idx + 1).trim();
}
function clip(s, n) { return s.length > n ? `${s.slice(0, n)}…` : s; }

const input = readStdin();
const cwd = input.cwd || process.cwd();
const notepad = readText(join(cwd, 'docs', 'notepad.md'));
const log = readText(join(cwd, 'docs', 'decision-log.md'));

const parts = [];
const position = section(notepad, '현재 위치');
if (position) parts.push(`[notepad 현재 위치]\n${clip(position, 700)}`);
const pending = section(notepad, '보류·막힘');
if (pending && pending.replace(/[-\s]/g, '').length > 0) parts.push(`[보류·막힘]\n${clip(pending, 400)}`);
const last = lastEntry(log);
if (last) parts.push(`[decision-log 마지막 엔트리]\n${clip(last, 900)}`);
parts.push('규칙: AGENTS.md 1절 작업 루프(분류→계획→구현→리뷰·검증→기록). 세션 시작 시 $workstyle 참조.');

const output = {
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext: parts.join('\n\n'),
  },
};
process.stdout.write(JSON.stringify(output));
process.exit(0);
