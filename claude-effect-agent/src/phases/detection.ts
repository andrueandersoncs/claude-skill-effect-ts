import { query } from "@anthropic-ai/claude-agent-sdk";
import { mkdir, rm } from "node:fs/promises";
import {
  loadCategories,
  flattenCategories,
  getPatternKey,
  getPatternLabel,
  type FlattenedPattern,
} from "../categories/index.js";
import { consumeQuery } from "../utils.js";

function buildSystemPrompt(pattern: FlattenedPattern): string {
  const patternKey = getPatternKey(pattern);

  return `You are an Effect-TS code style expert. Your ONLY job is to detect ONE specific violation pattern.

## Your Pattern: ${pattern.rule}
## Category: ${pattern.categoryName}

### What to Look For:
${pattern.example.description}

### Bad Code (detect this):
\`\`\`typescript
${pattern.example.bad}
\`\`\`

### Good Code (suggest this):
\`\`\`typescript
${pattern.example.good}
\`\`\`

## Output Format

For EACH violation found, write a JSON file to .change-queue/ with this structure:
\`\`\`json
{
  "category": "${pattern.categoryId}",
  "pattern": "${pattern.patternId}",
  "targetFile": "/absolute/path/to/file.ts",
  "changes": [
    {
      "lineNumber": 42,
      "violationType": "${pattern.rule}",
      "currentCode": "the current code snippet",
      "proposedFix": "the proposed replacement code",
      "explanation": "why this change is needed"
    }
  ]
}
\`\`\`

## Rules

1. ONLY detect violations of this specific pattern: ${pattern.rule}
2. DO NOT edit source files - only write to .change-queue/
3. Write one JSON file per source file with violations
4. Use filename format: .change-queue/${patternKey}-{source-filename}.json
5. If no violations found, respond with: "NO_VIOLATIONS_FOUND"
6. Use Glob to find .ts files, Grep to search for patterns, Read to examine code
7. Use Write to create the change descriptor JSON files
8. Be precise - only flag code that clearly matches the anti-pattern`;
}

function buildPrompt(pattern: FlattenedPattern, target: string): string {
  return `Scan all TypeScript files in "${target}" for this specific violation:

**Pattern**: ${pattern.rule}
**Description**: ${pattern.example.description}

Steps:
1. Use Glob to find all .ts files in "${target}"
2. Use Grep to search for potential violations matching this pattern
3. Use Read to examine each file with matches
4. For each actual violation, write a change descriptor to .change-queue/

Focus ONLY on this specific pattern. If no violations found, respond with: "NO_VIOLATIONS_FOUND"`;
}

export async function runDetectionPhase(target: string): Promise<void> {
  console.log("\n📡 Phase 1: Detection (parallel by pattern)");

  // Load categories and flatten to patterns
  const categories = await loadCategories();
  const patterns = flattenCategories(categories);

  console.log(`  Loaded ${categories.length} categories with ${patterns.length} patterns`);

  // Clear and recreate change queue
  await rm(".change-queue", { recursive: true, force: true });
  await mkdir(".change-queue", { recursive: true });

  const queries = patterns.map((pattern) =>
    query({
      prompt: buildPrompt(pattern, target),
      options: {
        allowedTools: ["Read", "Glob", "Grep", "Write"],
        permissionMode: "acceptEdits",
        systemPrompt: buildSystemPrompt(pattern),
        cwd: process.cwd(),
        maxTurns: 20,
      },
    })
  );

  const results = await Promise.all(
    queries.map((q, i) => consumeQuery(q, getPatternLabel(patterns[i]!)))
  );

  const succeeded = results.filter((r) => r.success).length;
  const totalCost = results.reduce((sum, r) => sum + (r.cost ?? 0), 0);

  console.log(`\n  Detection complete: ${succeeded}/${patterns.length} patterns ($${totalCost.toFixed(4)})`);
}
