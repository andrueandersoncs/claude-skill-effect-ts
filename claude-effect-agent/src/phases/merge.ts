import { mkdir, readdir } from "fs/promises";
import type { ChangeDescriptor, MergedDescriptor } from "../types.js";
import { sanitizeFilename } from "../utils.js";

export async function runMergePhase(): Promise<string[]> {
  console.log("\n🔀 Phase 2: Merge (group by target file)");

  await mkdir(".change-queue/merged", { recursive: true });

  // Read all descriptor files
  const files = await readdir(".change-queue");
  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  if (jsonFiles.length === 0) {
    console.log("  No change descriptors found");
    return [];
  }

  const descriptors: ChangeDescriptor[] = [];

  for (const file of jsonFiles) {
    try {
      const content = await Bun.file(`.change-queue/${file}`).text();
      const parsed = JSON.parse(content) as ChangeDescriptor;
      descriptors.push(parsed);
    } catch {
      console.log(`  Warning: Failed to parse ${file}`);
    }
  }

  // Group by target file
  const byFile = new Map<string, ChangeDescriptor[]>();
  for (const desc of descriptors) {
    const existing = byFile.get(desc.targetFile) ?? [];
    existing.push(desc);
    byFile.set(desc.targetFile, existing);
  }

  // Write merged descriptors
  const mergedFiles: string[] = [];

  for (const [targetFile, descs] of byFile) {
    const merged: MergedDescriptor = {
      targetFile,
      changes: descs.flatMap((d) => d.changes),
      categories: [...new Set(descs.map((d) => d.category))],
      rules: [...new Set(descs.map((d) => d.rule).filter(Boolean))],
    };

    const mergedPath = `.change-queue/merged/${sanitizeFilename(targetFile)}.json`;
    await Bun.write(mergedPath, JSON.stringify(merged, null, 2));
    mergedFiles.push(mergedPath);

    const ruleInfo = merged.rules.length > 0 ? ` [${merged.rules.length} rules]` : "";
    console.log(`  ${targetFile} (${merged.changes.length} changes from ${merged.categories.join(", ")}${ruleInfo})`);
  }

  return mergedFiles;
}
