# -*- coding: utf-8 -*-
"""스킬 머리말(frontmatter) 점검. 의존성 없음. 저장소 루트에서: python scripts/check-skills.py

따옴표 없는 값에 '콜론+공백'이나 ' #'가 있으면 표준 YAML 파서가 거부한다
(mapping values are not allowed here). Codex 버전에 따라 스킬이 누락되거나 경고가 난다.
"""
import glob
import io
import os
import re
import sys

errors = []
files = sorted(glob.glob(os.path.join(".agents", "skills", "*", "SKILL.md")))
for path in files:
    name_dir = os.path.basename(os.path.dirname(path))
    raw = io.open(path, "rb").read()
    if raw[:3] == b"\xef\xbb\xbf":
        errors.append("%s: BOM" % name_dir)
    if b"\r" in raw:
        errors.append("%s: CR" % name_dir)
    text = raw.decode("utf-8")
    m = re.match(r"---\n(.*?)\n---\n", text, re.S)
    if not m:
        errors.append("%s: frontmatter 없음" % name_dir)
        continue
    fields = {}
    for line in m.group(1).split("\n"):
        if ":" not in line:
            errors.append("%s: 해석 불가 줄 %r" % (name_dir, line[:40]))
            continue
        key, value = line.split(":", 1)
        fields[key.strip()] = value.strip()
    if fields.get("name") != name_dir:
        errors.append("%s: name이 디렉터리명과 다름" % name_dir)
    for key, value in fields.items():
        if not value:
            errors.append("%s: %s 비어 있음" % (name_dir, key))
            continue
        quoted = (value[0] == value[-1] == "'" and len(value) >= 2) or (value[0] == value[-1] == '"' and len(value) >= 2)
        if quoted:
            inner = value[1:-1]
            if value[0] == "'" and re.search(r"(?<!')'(?!')", inner.replace("''", "")):
                errors.append("%s: %s 작은따옴표 이스케이프('') 누락" % (name_dir, key))
            continue
        if ": " in value or " #" in value or value[0] in "[]{}&*!|>%@`\"'":
            errors.append("%s: %s 값에 따옴표 필요(콜론+공백·#·특수 시작)" % (name_dir, key))
    if len(text.split("\n")) > 81:
        errors.append("%s: 80줄 초과" % name_dir)

print("skills: %d" % len(files))
if errors:
    print("ERRORS:")
    for e in errors:
        print(" -", e)
    sys.exit(1)
print("ERRORS none")
