#!/usr/bin/env bash
#
# Unit 5: Commit changes, push, and update plugin cache
#
# Usage: ./commit-and-update.sh <iteration> <result> <reason>
# Output: Commits effect-check.md, pushes, updates plugin cache
# Exit: 0 on success
#

set -e

ITERATION="${1:?Usage: $0 <iteration> <result> <reason>}"
RESULT="${2:?Usage: $0 <iteration> <result> <reason>}"
REASON="${3:?Usage: $0 <iteration> <result> <reason>}"

COMMAND_FILE="commands/effect-check.md"
PLUGIN_NAME="effect-ts"

echo "=== Committing and updating ==="
echo "Iteration: $ITERATION"
echo "Result: $RESULT"
echo "Reason: $REASON"

# Check for changes
if git diff --quiet "$COMMAND_FILE"; then
    echo "No changes to commit."
    exit 0
fi

# Stage changes
echo "Staging $COMMAND_FILE..."
git add "$COMMAND_FILE"

# Bump version in plugin files
PLUGIN_JSON=".claude-plugin/plugin.json"
MARKETPLACE_JSON=".claude-plugin/marketplace.json"

if [ -f "$PLUGIN_JSON" ]; then
    CURRENT_VERSION=$(grep '"version"' "$PLUGIN_JSON" | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
    # Increment patch version
    IFS='.' read -r major minor patch <<< "$CURRENT_VERSION"
    NEW_VERSION="$major.$minor.$((patch + 1))"
    echo "Bumping version: $CURRENT_VERSION -> $NEW_VERSION"

    sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$PLUGIN_JSON"
    sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" "$MARKETPLACE_JSON" 2>/dev/null || true

    git add "$PLUGIN_JSON" "$MARKETPLACE_JSON" 2>/dev/null || true
fi

# Commit
echo "Committing..."
git commit -m "Fix effect-check command (iteration $ITERATION): $RESULT

Reason: $REASON

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# Push
echo "Pushing to remote..."
git push

# Update plugin cache
echo "Updating plugin cache..."
CACHE_DIRS=$(find ~/.claude/plugins/cache/$PLUGIN_NAME/$PLUGIN_NAME -maxdepth 1 -type d 2>/dev/null | tail -5)
for cache_dir in $CACHE_DIRS; do
    if [ -d "$cache_dir/commands" ]; then
        echo "  Updating: $cache_dir/commands/"
        cp "$COMMAND_FILE" "$cache_dir/commands/"
    fi
done

echo "=== Update complete ==="
exit 0
