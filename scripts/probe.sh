#!/usr/bin/env bash
# cofa-kit 환경 확인 스크립트 — 읽기 전용. 아무것도 설치·수정·업데이트하지 않는다.
# 용도: 새 환경(대회 워크스페이스) 시작 직후 플랜 B(네이티브)만 쓸지, 플랜 A(OMX)도 가능한지 판단.
set -u

line() { printf '%s\n' "----------------------------------------"; }
check() { # 이름, 명령
  local name="$1"; shift
  if out=$("$@" 2>&1); then printf '%-18s OK   %s\n' "$name" "$(printf '%s' "$out" | head -1)"
  else printf '%-18s MISS %s\n' "$name" "$(printf '%s' "$out" | head -1)"; fi
}

line; echo "cofa-kit probe  $(date '+%Y-%m-%d %H:%M:%S')"; line
check "codex"      codex --version
check "node"       node -v
check "npm"        npm -v
check "npm prefix" npm config get prefix
check "git"        git --version
check "python"     bash -c 'python3 --version 2>/dev/null || python --version'
check "tmux"       bash -c 'command -v tmux'
check "rg"         bash -c 'command -v rg'
line
# 네트워크: 상태 코드만 본다(5초 제한). 실패해도 계속.
check "npm registry" bash -c 'curl -s -o /dev/null -w "%{http_code}" --max-time 5 https://registry.npmjs.org/'
check "github"       bash -c 'curl -s -o /dev/null -w "%{http_code}" --max-time 5 https://github.com/'
line
# Codex 설정 상태
if [ -f .codex/config.toml ]; then echo "project .codex/config.toml  있음 (신뢰 승인 후 로드됨)"; else echo "project .codex/config.toml  없음"; fi
echo "custom agents: $(ls .codex/agents/*.toml 2>/dev/null | wc -l | tr -d ' ')개  skills: $(ls -d .agents/skills/*/ 2>/dev/null | wc -l | tr -d ' ')개"
[ -f "$HOME/.codex/config.toml" ] && echo "user ~/.codex/config.toml 있음: $(grep -E '^model' "$HOME/.codex/config.toml" | tr '\n' ' ')"
line
echo "판단 기준: codex OK + git OK → 플랜 B 가능. npm prefix 쓰기 가능 + registry 200 + tmux OK → 플랜 A 고려(omx/README.md)."
echo "주의: Codex 업데이트 금지. 이 스크립트는 확인만 한다."
