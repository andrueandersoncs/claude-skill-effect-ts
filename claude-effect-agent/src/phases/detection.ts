import { query } from "@anthropic-ai/claude-agent-sdk";
import { mkdir, rm } from "node:fs/promises";
import { CATEGORIES, type Category } from "../categories/index.js";
import { consumeQuery } from "../utils.js";

function buildSystemPrompt(category: Category): string {
  return `You are an Effect-TS code style expert. Your ONLY job is to detect violations in the "${category.name}" category.

## Your Category: ${category.name}

### Violations to Find:
${category.patterns.map((p) => `- ${p}`).join("\n")}

## Output Format

For EACH violation found, write a JSON file to .change-queue/ with this structure:
\`\`\`json
{
  "category": "${category.id}",
  "targetFile": "/absolute/path/to/file.ts",
  "changes": [
    {
      "lineNumber": 42,
      "violationType": "description of the violation",
      "currentCode": "the current code snippet",
      "proposedFix": "the proposed replacement code",
      "explanation": "why this change is needed"
    }
  ]
}
\`\`\`

## Rules

1. ONLY detect violations in your category (${category.name})
2. DO NOT edit source files - only write to .change-queue/
3. Write one JSON file per source file with violations
4. Use filename format: .change-queue/${category.id}-{source-filename}.json
5. If no violations found, respond with: "NO_VIOLATIONS_IN_CATEGORY"
6. Use Glob to find .ts files, Grep to search for patterns, Read to examine code
7. Use Write to create the change descriptor JSON files`;
}

function buildPrompt(category: Category, target: string): string {
  return `Scan all TypeScript files in "${target}" for ${category.name} violations.

Steps:
1. Use Glob to find all .ts files in "${target}"
2. Use Grep to search for potential violations based on the patterns
3. Use Read to examine each file with matches
4. For each actual violation, write a change descriptor to .change-queue/

If no violations found, respond with: "NO_VIOLATIONS_IN_CATEGORY"`;
}

export async function runDetectionPhase(target: string): Promise<void> {
  console.log("\n📡 Phase 1: Detection (parallel by category)");

  // Clear and recreate change queue
  await rm(".change-queue", { recursive: true, force: true });
  await mkdir(".change-queue", { recursive: true });

  const queries = CATEGORIES.map((category) =>
    query({
      prompt: buildPrompt(category, target),
      options: {
        allowedTools: ["Read", "Glob", "Grep", "Write"],
        permissionMode: "acceptEdits",
        systemPrompt: buildSystemPrompt(category),
        cwd: process.cwd(),
        maxTurns: 30,
      },
    })
  );

  const results = await Promise.all(queries.map((q, i) => consumeQuery(q, CATEGORIES[i]!.name)));

  const succeeded = results.filter((r) => r.success).length;
  const totalCost = results.reduce((sum, r) => sum + (r.cost ?? 0), 0);

  console.log(`\n  Detection complete: ${succeeded}/${CATEGORIES.length} categories ($${totalCost.toFixed(4)})`);
}
