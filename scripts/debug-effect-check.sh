#!/usr/bin/env bash
#
# Debug loop for effect-check --fix command
# Runs Claude Code repeatedly until fixes are applied correctly
#

set -e

# Configuration
TARGET_FILE="effect-agent/categories/async/rule-001/rule-001.detector.ts"
COMMAND_FILE="commands/effect-check.md"
LOG_DIR="logs/debug-effect-check"
MAX_ITERATIONS=10
PLUGIN_NAME="effect-ts"

# Create log directory
mkdir -p "$LOG_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SESSION_LOG="$LOG_DIR/session_$TIMESTAMP.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$SESSION_LOG"
}

log "=== Starting effect-check debug session ==="
log "Target file: $TARGET_FILE"
log "Command file: $COMMAND_FILE"
log "Max iterations: $MAX_ITERATIONS"

iteration=0

while [ $iteration -lt $MAX_ITERATIONS ]; do
    iteration=$((iteration + 1))
    ITER_LOG="$LOG_DIR/iteration_${TIMESTAMP}_${iteration}.log"
    ANALYSIS_LOG="$LOG_DIR/analysis_${TIMESTAMP}_${iteration}.log"

    log ""
    log "=== Iteration $iteration ==="

    # Step 1: Reset any leftover branches/worktrees from previous runs
    log "Cleaning up any leftover task branches and worktrees..."
    git worktree list | grep worktree-task | awk '{print $1}' | xargs -I {} git worktree remove {} --force 2>/dev/null || true
    git branch | grep "task-" | xargs -I {} git branch -D {} 2>/dev/null || true

    # Step 2: Run effect-check --fix
    log "Running: /effect-check $TARGET_FILE --fix"

    # Run Claude Code and capture output
    claude -p "/effect-check $TARGET_FILE --fix" \
        --output-format stream-json \
        --verbose \
        2>&1 > "$ITER_LOG" || true

    log "Claude Code completed. Output saved to: $ITER_LOG"

    # Step 3: Have Claude analyze the output and decide next steps
    log "Analyzing output with Claude..."

    ANALYSIS_PROMPT=$(cat <<'PROMPT_EOF'
Analyze the effect-check --fix execution log and determine the outcome.

TASK: Review the log output and classify the result into one of these categories:

1. SUCCESS - The command completed all 4 phases AND made meaningful fixes:
   - Phase 1 (Detection) ran
   - Phase 2 (Task Creation) created tasks
   - Phase 3 (Spawn Agents) spawned task-workers
   - Phase 4 (Tournament Merge) executed merge-workers AND merged to main
   - Fixes were actually applied (not just excuses or errors)

2. PARTIAL - Some phases completed but not all:
   - Stopped after Phase 3 (no tournament merge)
   - Tournament merge started but didn't complete
   - Merge to main didn't happen

3. FAILURE - Command didn't work properly:
   - Errors during execution
   - Task workers failed
   - Excuses about not being able to fix

4. EXCUSES - Claude decided not to fix violations:
   - "This violation is a false positive"
   - "This cannot be fixed because..."
   - "I'll skip this one"
   - Any reasoning that avoids applying fixes

OUTPUT FORMAT (exactly like this):
RESULT: [SUCCESS|PARTIAL|FAILURE|EXCUSES]
REASON: [1-2 sentence explanation]
PHASES_COMPLETED: [list which phases ran: 1,2,3,4]
FIXES_APPLIED: [yes|no|unknown]
SUGGESTION: [If not SUCCESS, what should be changed in effect-check.md to fix the issue? Be specific.]

Look for these indicators in the log:
- "Phase 1" / "detect:all" output
- "TaskCreate" calls
- "Task tool" with "task-worker"
- "merge-worker" agents
- "git merge" to main
- Any text containing excuses or refusals

Be strict: SUCCESS means ALL phases completed AND fixes were merged to main.
PROMPT_EOF
)

    # Get the last 50KB of the log (Claude context limit)
    tail -c 50000 "$ITER_LOG" > "${ITER_LOG}.truncated"

    claude -p "$ANALYSIS_PROMPT

Here is the execution log to analyze:

$(cat "${ITER_LOG}.truncated")" \
        --output-format text \
        2>&1 > "$ANALYSIS_LOG" || true

    log "Analysis saved to: $ANALYSIS_LOG"

    # Parse the analysis result
    RESULT=$(grep "^RESULT:" "$ANALYSIS_LOG" | head -1 | sed 's/RESULT: //' | tr -d '[:space:]')
    REASON=$(grep "^REASON:" "$ANALYSIS_LOG" | head -1 | sed 's/REASON: //')
    SUGGESTION=$(grep "^SUGGESTION:" "$ANALYSIS_LOG" | head -1 | sed 's/SUGGESTION: //')

    log "Result: $RESULT"
    log "Reason: $REASON"

    # Step 4: Decide what to do based on result
    case "$RESULT" in
        SUCCESS)
            log "SUCCESS! Effect-check --fix is working correctly."
            log "Terminating loop."

            # Final summary
            echo ""
            echo "=== DEBUG SESSION COMPLETE ==="
            echo "Iterations: $iteration"
            echo "Result: SUCCESS"
            echo "Session log: $SESSION_LOG"
            exit 0
            ;;

        PARTIAL|FAILURE|EXCUSES)
            log "Issue detected: $RESULT"
            log "Suggestion: $SUGGESTION"

            if [ -z "$SUGGESTION" ] || [ "$SUGGESTION" = "null" ]; then
                log "No specific suggestion provided. Asking Claude for fix..."
                SUGGESTION="Make Phase 4 more explicit and mandatory"
            fi

            # Step 5: Have Claude update the command file
            log "Asking Claude to update $COMMAND_FILE..."

            UPDATE_PROMPT=$(cat <<UPDATE_EOF
The effect-check --fix command is not working correctly.

Problem: $RESULT
Reason: $REASON
Suggestion: $SUGGESTION

Previous analysis log shows the issue.

YOUR TASK:
1. Read the current $COMMAND_FILE
2. Make specific changes to fix the issue described above
3. The changes should ensure Claude Code:
   - Completes ALL 4 phases
   - Does NOT make excuses or skip violations
   - Actually applies fixes and merges them to main
4. Use the Edit tool to make the changes
5. After editing, output: CHANGES_MADE: [brief description of what you changed]

Be aggressive in the instructions. Add more FORBIDDEN/REQUIRED sections if needed.
UPDATE_EOF
)

            UPDATE_LOG="$LOG_DIR/update_${TIMESTAMP}_${iteration}.log"
            claude -p "$UPDATE_PROMPT" \
                --allowedTools "Read,Edit" \
                --output-format text \
                2>&1 > "$UPDATE_LOG" || true

            log "Update log: $UPDATE_LOG"

            # Check if changes were made
            if git diff --quiet "$COMMAND_FILE"; then
                log "WARNING: No changes were made to $COMMAND_FILE"
                log "Trying a more direct approach..."

                # Fallback: Add more explicit instructions
                echo "" >> "$COMMAND_FILE"
                echo "## ITERATION $iteration FIX" >> "$COMMAND_FILE"
                echo "" >> "$COMMAND_FILE"
                echo "Issue: $RESULT - $REASON" >> "$COMMAND_FILE"
                echo "" >> "$COMMAND_FILE"
            fi

            # Step 6: Commit and push
            log "Committing changes..."
            git add "$COMMAND_FILE"
            git commit -m "Fix effect-check command (iteration $iteration): $RESULT

Reason: $REASON
Suggestion: $SUGGESTION

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>" || log "Nothing to commit"

            log "Pushing to remote..."
            git push || log "Push failed or nothing to push"

            # Step 7: Update plugin cache
            log "Updating plugin cache..."
            cp "$COMMAND_FILE" ~/.claude/plugins/cache/$PLUGIN_NAME/$PLUGIN_NAME/*/commands/ 2>/dev/null || true

            log "Ready for next iteration..."
            sleep 2
            ;;

        *)
            log "Unknown result: $RESULT"
            log "Check analysis log: $ANALYSIS_LOG"
            log "Continuing to next iteration..."
            ;;
    esac
done

log "=== Max iterations ($MAX_ITERATIONS) reached ==="
log "Effect-check --fix may still need manual fixes."
log "Review logs in: $LOG_DIR"
exit 1
