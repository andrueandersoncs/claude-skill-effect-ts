#!/usr/bin/env bash
#
# Unit 2: Run effect-check --fix and save output
#
# Usage: ./run-effect-check.sh <target-file> <output-file>
# Output: Writes Claude Code output to <output-file>
# Exit: 0 on completion (regardless of Claude's result)
#

set -e

TARGET_FILE="${1:?Usage: $0 <target-file> <output-file>}"
OUTPUT_FILE="${2:?Usage: $0 <target-file> <output-file>}"

echo "=== Running effect-check --fix ==="
echo "Target: $TARGET_FILE"
echo "Output: $OUTPUT_FILE"

# Ensure output directory exists
mkdir -p "$(dirname "$OUTPUT_FILE")"

# Run Claude Code
echo "Executing: claude -p \"/effect-check $TARGET_FILE --fix\""
echo "This may take a few minutes..."

START_TIME=$(date +%s)

claude -p "/effect-check $TARGET_FILE --fix" \
    --output-format stream-json \
    --verbose \
    2>&1 > "$OUTPUT_FILE" || true

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "=== Execution complete ==="
echo "Duration: ${DURATION}s"
echo "Output size: $(wc -c < "$OUTPUT_FILE" | tr -d ' ') bytes"
echo "Output file: $OUTPUT_FILE"

# Basic validation
if [ ! -s "$OUTPUT_FILE" ]; then
    echo "ERROR: Output file is empty"
    exit 1
fi

exit 0
