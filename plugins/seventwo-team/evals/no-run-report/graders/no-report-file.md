---
type: regex
target: trace
pattern: '"file_path"\s*:\s*"[^"]*(?:report|summary|outcome|diary|completion)[^"]*"'
flags: i
match: not_contains
---
