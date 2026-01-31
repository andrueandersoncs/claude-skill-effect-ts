#!/usr/bin/env bash
#
# Unit 4: Verify that a file is actually fixed (no violations, no type errors)
#
# Usage: ./verify-fix.sh <target-file> <output-log>
# Output: Writes verification result to <output-log> with fields:
#   VERIFIED: YES|NO
#   VIOLATIONS: count
#   TYPE_ERRORS: YES|NO
#   DETAILS: explanation
#

set -e

TARGET_FILE="${1:?Usage: $0 <target-file> <output-log>}"
OUTPUT_LOG="${2:?Usage: $0 <target-file> <output-log>}"

echo "=== Verifying fix for $TARGET_FILE ==="

# Ensure output directory exists
mkdir -p "$(dirname "$OUTPUT_LOG")"

# Get the effect-agent directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
EFFECT_AGENT_DIR="$REPO_ROOT/effect-agent"

# Resolve target file path relative to repo root if needed
if [[ "$TARGET_FILE" == /* ]]; then
    FULL_PATH="$TARGET_FILE"
else
    FULL_PATH="$REPO_ROOT/$TARGET_FILE"
fi

# Check if file exists
if [ ! -f "$FULL_PATH" ]; then
    echo "VERIFIED: NO" > "$OUTPUT_LOG"
    echo "VIOLATIONS: -1" >> "$OUTPUT_LOG"
    echo "TYPE_ERRORS: YES" >> "$OUTPUT_LOG"
    echo "DETAILS: Target file not found: $FULL_PATH" >> "$OUTPUT_LOG"
    echo "Target file not found: $FULL_PATH"
    exit 0
fi

# Run detector and count definite violations
echo "Running detector..."

# Strip effect-agent/ prefix if present since we cd into effect-agent
DETECTOR_TARGET="$TARGET_FILE"
if [[ "$TARGET_FILE" == effect-agent/* ]]; then
    DETECTOR_TARGET="${TARGET_FILE#effect-agent/}"
fi

# Filter out bun prefix line ($) and error line at end, extract just JSON
DETECTOR_OUTPUT=$(cd "$EFFECT_AGENT_DIR" && bun run detect:json "$DETECTOR_TARGET" 2>/dev/null | grep -v '^\$' | grep -v '^error:' || echo '{"violations":[]}')

# Count definite violations
DEFINITE_COUNT=$(echo "$DETECTOR_OUTPUT" | bun -e '
const input = await Bun.stdin.text();
try {
    const result = JSON.parse(input);
    const violations = result.violations || [];
    const definite = violations.filter((v: any) => v.certainty === "definite");
    console.log(definite.length);
} catch (e) {
    console.error("Parse error:", e);
    console.log("-1");
}
')

echo "Definite violations: $DEFINITE_COUNT"

# Run type check on the specific file
echo "Running type check..."
TYPE_CHECK_OUTPUT=$(cd "$EFFECT_AGENT_DIR" && bun run check 2>&1 || true)

# Check if there are type errors in the target file
TARGET_BASENAME=$(basename "$TARGET_FILE")
if echo "$TYPE_CHECK_OUTPUT" | grep -q "$TARGET_BASENAME.*error TS"; then
    HAS_TYPE_ERRORS="YES"
    TYPE_ERROR_LINES=$(echo "$TYPE_CHECK_OUTPUT" | grep "$TARGET_BASENAME.*error TS" | head -3)
else
    HAS_TYPE_ERRORS="NO"
    TYPE_ERROR_LINES=""
fi

echo "Has type errors: $HAS_TYPE_ERRORS"

# Determine verification result
if [ "$DEFINITE_COUNT" = "0" ] && [ "$HAS_TYPE_ERRORS" = "NO" ]; then
    VERIFIED="YES"
    DETAILS="File has no definite violations and no type errors"
else
    VERIFIED="NO"
    DETAILS=""
    if [ "$DEFINITE_COUNT" != "0" ]; then
        DETAILS="$DEFINITE_COUNT definite violation(s) remaining"
    fi
    if [ "$HAS_TYPE_ERRORS" = "YES" ]; then
        if [ -n "$DETAILS" ]; then
            DETAILS="$DETAILS; has type errors"
        else
            DETAILS="Has type errors"
        fi
    fi
fi

# Write output
{
    echo "VERIFIED: $VERIFIED"
    echo "VIOLATIONS: $DEFINITE_COUNT"
    echo "TYPE_ERRORS: $HAS_TYPE_ERRORS"
    echo "DETAILS: $DETAILS"
    if [ -n "$TYPE_ERROR_LINES" ]; then
        echo ""
        echo "Type error samples:"
        echo "$TYPE_ERROR_LINES"
    fi
} > "$OUTPUT_LOG"

echo "=== Verification complete ==="
echo "Result: $VERIFIED"
echo "Details: $DETAILS"
cat "$OUTPUT_LOG"
