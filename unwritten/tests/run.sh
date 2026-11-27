#!/bin/sh
# The Unwritten (rebuild): regression tests. Run from anywhere:  sh tests/run.sh
# Starts a local server on port 8766 if none is running, then runs each test in turn.
# Each test prints its own log; the lines to watch are "BAD n", "issues" and "errors [...]" (both should be 0 / empty).
cd "$(dirname "$0")/.." || exit 1
if ! curl -s -o /dev/null http://127.0.0.1:8766/index.html; then
  (setsid nohup python3 -m http.server 8766 --bind 127.0.0.1 >/tmp/http2.log 2>&1 &); sleep 1.2
fi
for t in qnew qinside qmill qmenus qshops qbankdlg qloan qstore qmus7 qmus9 qlong qedu qsummon ${EXTRA_TESTS}; do
  echo "=================== $t"
  timeout 600 python3 "tests/$t.py" 2>&1 | tail -25
done
