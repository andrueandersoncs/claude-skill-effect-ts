#!/usr/bin/env bash
#
# Unit 3: Analyze effect-check output and classify result
#
# Usage: ./analyze-output.sh <input-log> <output-analysis>
# Output: Writes analysis to <output-analysis> with fields:
#   RESULT: SUCCESS|PARTIAL|FAILURE|EXCUSES
#   REASON: explanation
#   SUGGESTION: what to fix (if not SUCCESS)
#

set -e

INPUT_LOG="${1:?Usage: $0 <input-log> <output-analysis>}"
OUTPUT_ANALYSIS="${2:?Usage: $0 <input-log> <output-analysis>}"

echo "=== Analyzing effect-check output ==="
echo "Input: $INPUT_LOG"
echo "Output: $OUTPUT_ANALYSIS"

if [ ! -f "$INPUT_LOG" ]; then
    echo "ERROR: Input log not found: $INPUT_LOG"
    exit 1
fi

# Ensure output directory exists
mkdir -p "$(dirname "$OUTPUT_ANALYSIS")"

# Truncate log if too large (Claude context limit)
TRUNCATED_LOG=$(mktemp)
tail -c 50000 "$INPUT_LOG" > "$TRUNCATED_LOG"

ANALYSIS_PROMPT='Analyze the effect-check --fix execution log and determine the outcome.

TASK: Review the log and classify the result:

1. SUCCESS - All 4 phases completed AND fixes merged to main:
   - Phase 1 (Detection) ran - look for "detect:all" or violation listings
   - Phase 2 (Task Creation) - look for "TaskCreate"
   - Phase 3 (Spawn Agents) - look for Task tool calls with "task-worker"
   - Phase 4 (Tournament Merge) - look for "merge-worker" AND "git merge" to main

2. PARTIAL - Some phases but not all:
   - Stopped after Phase 3 (workers returned but no merge)
   - Tournament started but incomplete

3. FAILURE - Errors during execution

4. EXCUSES - Claude avoided fixing:
   - "false positive", "cannot be fixed", "skip this"

OUTPUT FORMAT (exactly):
RESULT: [SUCCESS|PARTIAL|FAILURE|EXCUSES]
REASON: [1-2 sentence explanation]
SUGGESTION: [If not SUCCESS, what to change in effect-check.md]

Be strict: SUCCESS requires ALL phases AND merge to main.'

# Run analysis
echo "Running Claude analysis..."
claude -p "$ANALYSIS_PROMPT

Log to analyze:

$(cat "$TRUNCATED_LOG")" \
    --output-format text \
    2>&1 > "$OUTPUT_ANALYSIS" || true

rm -f "$TRUNCATED_LOG"

echo "=== Analysis complete ==="

# Extract and display results
RESULT=$(grep "^RESULT:" "$OUTPUT_ANALYSIS" | head -1 | sed 's/RESULT: *//' | tr -d '[:space:]')
REASON=$(grep "^REASON:" "$OUTPUT_ANALYSIS" | head -1 | sed 's/REASON: *//')
SUGGESTION=$(grep "^SUGGESTION:" "$OUTPUT_ANALYSIS" | head -1 | sed 's/SUGGESTION: *//')

echo "Result: $RESULT"
echo "Reason: $REASON"
echo "Suggestion: $SUGGESTION"

# Validate result
case "$RESULT" in
    SUCCESS|PARTIAL|FAILURE|EXCUSES)
        echo "Analysis output: $OUTPUT_ANALYSIS"
        exit 0
        ;;
    *)
        echo "WARNING: Could not parse result. Raw output:"
        cat "$OUTPUT_ANALYSIS"
        exit 1
        ;;
esac
