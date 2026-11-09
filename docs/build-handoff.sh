#!/usr/bin/env bash
# Rebuild the hotel handoff PDF from docs/handoff.tex.
# Run twice on first build (so the Table of Contents resolves);
# once is enough on subsequent edits that do not change section structure.
set -euo pipefail
cd "$(dirname "$0")"
pdflatex -interaction=nonstopmode handoff.tex >/dev/null
pdflatex -interaction=nonstopmode handoff.tex >/dev/null
rm -f handoff.aux handoff.log handoff.out handoff.toc
echo "handoff.pdf rebuilt ($(wc -c < handoff.pdf) bytes, $(pdfinfo handoff.pdf 2>/dev/null | awk '/^Pages:/ {print $2}') pages)"
