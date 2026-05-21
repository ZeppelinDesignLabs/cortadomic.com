#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

git checkout --orphan temp-squash 2>/dev/null || git checkout temp-squash
git add -A
git commit -m "Initial release of cortadomic.com"
git branch -M main
echo "Local history:"
git log --oneline
