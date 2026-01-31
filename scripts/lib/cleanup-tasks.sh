#!/usr/bin/env bash
#
# Unit 1: Clean up leftover task branches and worktrees
#
# Usage: ./cleanup-tasks.sh
# Output: Lists what was cleaned up
#

set -e

echo "=== Cleaning up task branches and worktrees ==="

# Clean up worktrees
WORKTREES=$(git worktree list | grep worktree-task | awk '{print $1}' || true)
if [ -n "$WORKTREES" ]; then
    echo "Removing worktrees:"
    echo "$WORKTREES" | while read -r wt; do
        echo "  - $wt"
        git worktree remove "$wt" --force 2>/dev/null || true
    done
else
    echo "No task worktrees found."
fi

# Clean up branches
BRANCHES=$(git branch | grep "task-" | tr -d ' ' || true)
if [ -n "$BRANCHES" ]; then
    echo "Removing branches:"
    echo "$BRANCHES" | while read -r branch; do
        echo "  - $branch"
        git branch -D "$branch" 2>/dev/null || true
    done
else
    echo "No task branches found."
fi

echo "=== Cleanup complete ==="

# Verify cleanup
REMAINING_WT=$(git worktree list | grep worktree-task || true)
REMAINING_BR=$(git branch | grep "task-" || true)

if [ -n "$REMAINING_WT" ] || [ -n "$REMAINING_BR" ]; then
    echo "WARNING: Some items could not be cleaned:"
    [ -n "$REMAINING_WT" ] && echo "  Worktrees: $REMAINING_WT"
    [ -n "$REMAINING_BR" ] && echo "  Branches: $REMAINING_BR"
    exit 1
fi

exit 0
