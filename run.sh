#!/bin/bash
# ╔══════════════════════════════════════════════════════╗
# ║  MMA NEWS ENGINE v3.0 — Quick Commands              ║
# ╚══════════════════════════════════════════════════════╝

DIR="$(cd "$(dirname "$0")" && pwd)"

case "$1" in
  schedule)
    echo "🕐 Starting scheduler (9 AM IST daily)..."
    nohup node "$DIR/scheduler.js" > "$DIR/output/scheduler.out" 2>&1 &
    echo $! > "$DIR/output/scheduler.pid"
    echo "✅ Running in background (PID: $(cat $DIR/output/scheduler.pid))"
    echo "   Stop: bash $0 stop"
    ;;
  stop)
    if [ -f "$DIR/output/scheduler.pid" ]; then
      kill $(cat "$DIR/output/scheduler.pid") 2>/dev/null
      rm "$DIR/output/scheduler.pid"
      echo "⏹️  Stopped"
    else
      echo "⚠️  Not running"
    fi
    ;;
  latest)
    echo "📁 Latest news:"
    ls -la "$DIR/output/latest/"
    ;;
  status)
    if [ -f "$DIR/output/scheduler.pid" ] && kill -0 $(cat "$DIR/output/scheduler.pid") 2>/dev/null; then
      echo "✅ Running (PID: $(cat $DIR/output/scheduler.pid))"
    else
      echo "⏹️  Not running"
    fi
    ;;
  *)
    echo "🚀 Generating today's news..."
    node "$DIR/generate.js"
    ;;
esac
