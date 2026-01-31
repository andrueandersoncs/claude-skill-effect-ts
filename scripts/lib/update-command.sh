#!/usr/bin/env bash
#
# Unit 4: Update effect-check.md based on analysis
#
# Usage: ./update-command.sh <result> <reason> <suggestion> <output-log>
# Output: Modifies commands/effect-check.md and writes log to <output-log>
# Exit: 0 if changes made, 1 if no changes
#

set -e

RESULT="${1:?Usage: $0 <result> <reason> <suggestion> <output-log>}"
REASON="${2:?Usage: $0 <result> <reason> <suggestion> <output-log>}"
SUGGESTION="${3:?Usage: $0 <result> <reason> <suggestion> <output-log>}"
OUTPUT_LOG="${4:?Usage: $0 <result> <reason> <suggestion> <output-log>}"

COMMAND_FILE="commands/effect-check.md"

echo "=== Updating effect-check.md ==="
echo "Result: $RESULT"
echo "Reason: $REASON"
echo "Suggestion: $SUGGESTION"

if [ ! -f "$COMMAND_FILE" ]; then
    echo "ERROR: Command file not found: $COMMAND_FILE"
    exit 1
fi

# Ensure output directory exists
mkdir -p "$(dirname "$OUTPUT_LOG")"

UPDATE_PROMPT="The effect-check --fix command is not working correctly.

Problem: $RESULT
Reason: $REASON
Suggestion: $SUGGESTION

YOUR TASK:
1. Read commands/effect-check.md
2. Make SPECIFIC changes to fix the issue
3. Be aggressive - add more FORBIDDEN/REQUIRED sections if needed
4. Use the Edit tool to make changes
5. Output: CHANGES_MADE: [what you changed]

Focus on making Phase 4 (tournament merge) absolutely mandatory."

echo "Asking Claude to update $COMMAND_FILE..."
claude -p "$UPDATE_PROMPT" \
    --allowedTools "Read,Edit" \
    --output-format text \
    2>&1 > "$OUTPUT_LOG" || true

echo "Update log: $OUTPUT_LOG"

# Check if changes were made
if git diff --quiet "$COMMAND_FILE"; then
    echo "WARNING: No changes were made to $COMMAND_FILE"
    echo "Claude output:"
    cat "$OUTPUT_LOG"
    exit 1
fi

echo "=== Changes detected ==="
git diff --stat "$COMMAND_FILE"

exit 0
