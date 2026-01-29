import { query } from "@anthropic-ai/claude-agent-sdk";
import { consumeQuery } from "../utils.js";

const SYSTEM_PROMPT = `You are an Effect-TS code editor. Your job is to apply changes described in a change descriptor file.

## Instructions

1. Read the change descriptor JSON file provided in the prompt
2. Read the target source file
3. Apply ALL changes described in the descriptor using the Edit tool
4. Verify the changes maintain valid TypeScript syntax

## Rules

- Apply changes in reverse line order (bottom to top) to preserve line numbers
- Use the Edit tool for each change
- If a change cannot be applied exactly, make your best approximation
- Report completion with "CHANGES_APPLIED" or "CHANGES_FAILED" if errors occurred`;

function buildPrompt(descriptorPath: string): string {
  return `Apply the changes described in "${descriptorPath}".

Steps:
1. Read the change descriptor file at "${descriptorPath}"
2. Read the target source file specified in the descriptor
3. Apply each change using the Edit tool
4. Report "CHANGES_APPLIED" when done`;
}

export async function runApplyPhase(mergedFiles: string[]): Promise<void> {
  console.log("\n✏️  Phase 3: Apply (parallel by file)");

  if (mergedFiles.length === 0) {
    console.log("  No files to update");
    return;
  }

  const queries = mergedFiles.map((mergedFile) =>
    query({
      prompt: buildPrompt(mergedFile),
      options: {
        allowedTools: ["Read", "Edit"],
        permissionMode: "acceptEdits",
        systemPrompt: SYSTEM_PROMPT,
        cwd: process.cwd(),
        maxTurns: 20,
      },
    })
  );

  const results = await Promise.all(
    queries.map((q, i) => {
      const file = mergedFiles[i]!;
      const filename = file.split("/").pop() ?? file;
      return consumeQuery(q, filename);
    })
  );

  const succeeded = results.filter((r) => r.success).length;
  const totalCost = results.reduce((sum, r) => sum + (r.cost ?? 0), 0);

  console.log(`\n  Apply complete: ${succeeded}/${mergedFiles.length} files ($${totalCost.toFixed(4)})`);
}
