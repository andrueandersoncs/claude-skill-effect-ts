#!/usr/bin/env bash
#
# Debug loop for effect-check --fix command
# Uses modular units from scripts/lib/
#

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LIB_DIR="$SCRIPT_DIR/lib"

# Configuration
TARGET_FILE="${1:-effect-agent/categories/async/rule-001/rule-001.detector.ts}"
MAX_ITERATIONS="${2:-10}"
LOG_DIR="logs/debug-effect-check"

# Create log directory
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SESSION_LOG="$LOG_DIR/session_$TIMESTAMP.log"

log() {
    echo "[$(date '+%H:%M:%S')] $*" | tee -a "$SESSION_LOG"
}

log "=== Debug Session Started ==="
log "Target: $TARGET_FILE"
log "Max iterations: $MAX_ITERATIONS"
log "Log dir: $LOG_DIR"
log ""

iteration=0

while [ $iteration -lt $MAX_ITERATIONS ]; do
    iteration=$((iteration + 1))
    log "=== Iteration $iteration of $MAX_ITERATIONS ==="

    # Define log files for this iteration
    ITER_LOG="$LOG_DIR/iter_${iteration}_run.log"
    ANALYSIS_LOG="$LOG_DIR/iter_${iteration}_analysis.log"
    UPDATE_LOG="$LOG_DIR/iter_${iteration}_update.log"

    # Step 1: Cleanup
    log "Step 1: Cleanup..."
    "$LIB_DIR/cleanup-tasks.sh" >> "$SESSION_LOG" 2>&1 || true

    # Step 2: Run effect-check
    log "Step 2: Running effect-check --fix (this takes a while)..."
    "$LIB_DIR/run-effect-check.sh" "$TARGET_FILE" "$ITER_LOG" 2>&1 | tee -a "$SESSION_LOG"

    # Step 3: Analyze output
    log "Step 3: Analyzing output..."
    "$LIB_DIR/analyze-output.sh" "$ITER_LOG" "$ANALYSIS_LOG" 2>&1 | tee -a "$SESSION_LOG" || true

    # Parse results
    RESULT=$(grep "^RESULT:" "$ANALYSIS_LOG" 2>/dev/null | head -1 | sed 's/RESULT: *//' | tr -d '[:space:]')
    REASON=$(grep "^REASON:" "$ANALYSIS_LOG" 2>/dev/null | head -1 | sed 's/REASON: *//')
    SUGGESTION=$(grep "^SUGGESTION:" "$ANALYSIS_LOG" 2>/dev/null | head -1 | sed 's/SUGGESTION: *//')

    log "Result: $RESULT"
    log "Reason: $REASON"

    # Step 4: Check result
    if [ "$RESULT" = "SUCCESS" ]; then
        log ""
        log "=== SUCCESS! ==="
        log "Effect-check --fix is working correctly."
        log "Total iterations: $iteration"
        log "Session log: $SESSION_LOG"
        exit 0
    fi

    # Step 5: Update command file
    log "Step 4: Updating effect-check.md..."
    if "$LIB_DIR/update-command.sh" "$RESULT" "$REASON" "${SUGGESTION:-No suggestion}" "$UPDATE_LOG" 2>&1 | tee -a "$SESSION_LOG"; then
        # Step 6: Commit and update
        log "Step 5: Committing and updating plugin..."
        "$LIB_DIR/commit-and-update.sh" "$iteration" "$RESULT" "$REASON" 2>&1 | tee -a "$SESSION_LOG" || true
    else
        log "No changes made. Continuing anyway..."
    fi

    log "Ready for next iteration..."
    log ""
done

log "=== Max iterations reached ==="
log "Effect-check may still need manual fixes."
log "Review logs in: $LOG_DIR"
exit 1
