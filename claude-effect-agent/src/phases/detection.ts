import { query } from "@anthropic-ai/claude-agent-sdk";
import { mkdir, rm } from "fs/promises";
import {
  loadCategories,
  flattenCategories,
  getRuleKey,
  getRuleLabel,
  slugify,
  type FlattenedRule,
} from "../categories/index.js";
import { consumeQuery } from "../utils.js";

function buildSystemPrompt(rule: FlattenedRule): string {
  const ruleKey = getRuleKey(rule);
  const ruleSlug = slugify(rule.rule);

  return `You are an Effect-TS code style expert. Your ONLY job is to detect violations of ONE specific rule.

## Rule: ${rule.rule}
## Category: ${rule.categoryName}

### What to Look For:
${rule.example.description}

### Bad Code (detect this):
\`\`\`typescript
${rule.example.bad}
\`\`\`

### Good Code (suggest this):
\`\`\`typescript
${rule.example.good}
\`\`\`

## Output Format

For EACH violation found, write a JSON file to .change-queue/ with this structure:
\`\`\`json
{
  "category": "${rule.categoryId}",
  "rule": "${ruleSlug}",
  "targetFile": "/absolute/path/to/file.ts",
  "changes": [
    {
      "lineNumber": 42,
      "violationType": "${rule.rule}",
      "currentCode": "the current code snippet",
      "proposedFix": "the proposed replacement code",
      "explanation": "why this change is needed"
    }
  ]
}
\`\`\`

## Rules

1. ONLY detect violations of this specific rule: ${rule.rule}
2. DO NOT edit source files - only write to .change-queue/
3. Write one JSON file per source file with violations
4. Use filename format: .change-queue/${ruleKey}-{source-filename}.json
5. If no violations found, respond with: "NO_VIOLATIONS_FOUND"
6. Use Glob to find .ts files, Grep to search for relevant code, Read to examine files
7. Use Write to create the change descriptor JSON files
8. Be precise - only flag code that clearly violates this rule`;
}

function buildPrompt(rule: FlattenedRule, target: string): string {
  return `Scan all TypeScript files in "${target}" for violations of this rule:

**Rule**: ${rule.rule}
**Description**: ${rule.example.description}

Steps:
1. Use Glob to find all .ts files in "${target}"
2. Use Grep to search for code that may violate this rule
3. Use Read to examine each file with matches
4. For each violation, write a change descriptor to .change-queue/

Focus ONLY on this specific rule. If no violations found, respond with: "NO_VIOLATIONS_FOUND"`;
}

export async function runDetectionPhase(target: string): Promise<void> {
  console.log("\n📡 Phase 1: Detection (parallel by rule)");

  // Load categories and flatten to rules
  const categories = await loadCategories();
  const rules = flattenCategories(categories);

  console.log(`  Loaded ${categories.length} categories with ${rules.length} rules`);

  // Clear and recreate change queue
  await rm(".change-queue", { recursive: true, force: true });
  await mkdir(".change-queue", { recursive: true });

  const queries = rules.map((rule) =>
    query({
      prompt: buildPrompt(rule, target),
      options: {
        allowedTools: ["Read", "Glob", "Grep", "Write"],
        permissionMode: "acceptEdits",
        systemPrompt: buildSystemPrompt(rule),
        cwd: process.cwd(),
        maxTurns: 20,
      },
    })
  );

  const results = await Promise.all(
    queries.map((q, i) => consumeQuery(q, getRuleLabel(rules[i]!)))
  );

  const succeeded = results.filter((r) => r.success).length;
  const totalCost = results.reduce((sum, r) => sum + (r.cost ?? 0), 0);

  console.log(`\n  Detection complete: ${succeeded}/${rules.length} rules ($${totalCost.toFixed(4)})`);
}
