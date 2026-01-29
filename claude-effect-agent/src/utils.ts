import type { Query } from "@anthropic-ai/claude-agent-sdk";
import type { QueryResult } from "./types.js";

export async function consumeQuery(q: Query, label: string): Promise<QueryResult> {
  console.log(`  [${label}] Starting...`);

  for await (const message of q) {
    if (message.type === "result") {
      const success = message.subtype === "success";
      const result = success ? (message as { result: string }).result : undefined;
      const cost = (message as { total_cost_usd?: number }).total_cost_usd;

      console.log(`  [${label}] ${success ? "Done" : "Failed"} ($${cost?.toFixed(4) ?? "?"})`);

      return { success, result, cost };
    }
  }

  console.log(`  [${label}] No result received`);
  return { success: false };
}

export function sanitizeFilename(path: string): string {
  return path.replace(/[/\\:]/g, "_").replace(/^_+/, "");
}
