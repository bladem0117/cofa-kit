# cofa-kit 환경 확인 스크립트(PowerShell) — 읽기 전용. 설치·수정·업데이트하지 않는다.
$ErrorActionPreference = 'Continue'
function Check($name, [scriptblock]$cmd) {
  try { $out = (& $cmd 2>&1 | Select-Object -First 1); "{0,-18} OK   {1}" -f $name, $out }
  catch { "{0,-18} MISS {1}" -f $name, $_.Exception.Message }
}
"----------------------------------------"
"cofa-kit probe  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
"----------------------------------------"
Check 'codex'      { codex --version }
Check 'node'       { node -v }
Check 'npm'        { npm -v }
Check 'npm prefix' { npm config get prefix }
Check 'git'        { git --version }
Check 'python'     { python --version }
Check 'tmux/psmux' { if (Get-Command tmux -ErrorAction SilentlyContinue) { 'tmux' } elseif (Get-Command psmux -ErrorAction SilentlyContinue) { 'psmux' } else { throw 'none' } }
"----------------------------------------"
Check 'npm registry' { (Invoke-WebRequest -Uri 'https://registry.npmjs.org/' -Method Head -TimeoutSec 5 -UseBasicParsing).StatusCode }
Check 'github'       { (Invoke-WebRequest -Uri 'https://github.com/' -Method Head -TimeoutSec 5 -UseBasicParsing).StatusCode }
"----------------------------------------"
if (Test-Path '.codex/config.toml') { 'project .codex/config.toml  있음 (신뢰 승인 후 로드됨)' } else { 'project .codex/config.toml  없음' }
$agents = (Get-ChildItem '.codex/agents/*.toml' -ErrorAction SilentlyContinue | Measure-Object).Count
$skills = (Get-ChildItem '.agents/skills' -Directory -ErrorAction SilentlyContinue | Measure-Object).Count
"custom agents: ${agents}개  skills: ${skills}개"
$userCfg = Join-Path $HOME '.codex/config.toml'
if (Test-Path $userCfg) { "user ~/.codex/config.toml 있음: " + ((Select-String -Path $userCfg -Pattern '^model' | ForEach-Object { $_.Line }) -join ' ') }
"----------------------------------------"
'판단 기준: codex OK + git OK → 플랜 B 가능. npm prefix 쓰기 가능 + registry 200 + tmux OK → 플랜 A 고려(omx/README.md).'
'주의: Codex 업데이트 금지. 이 스크립트는 확인만 한다.'
