import { Glob } from "bun";
import { parseArgs } from "util";
import { loadCategories, flattenCategories } from "./categories/index.js";
import { runDetectionPhase } from "./phases/detection.js";
import { runMergePhase } from "./phases/merge.js";
import { runApplyPhase } from "./phases/apply.js";

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    "dry-run": { type: "boolean", short: "n", default: false },
    iterations: { type: "string", short: "i", default: "10" },
    help: { type: "boolean", short: "h", default: false },
  },
  allowPositionals: true,
});

const target = positionals[0] ?? "";
const maxIterations = parseInt(values.iterations!, 10);
const dryRun = values["dry-run"]!;
const showHelp = values.help!;

async function findTypeScriptFiles(target: string): Promise<string[]> {
  const glob = new Glob("**/*.ts");
  const files: string[] = [];
  for await (const file of glob.scan({ cwd: target, absolute: true })) {
    files.push(file);
  }
  return files.sort();
}

async function runDryRun(target: string): Promise<void> {
  const categories = await loadCategories();
  const rules = flattenCategories(categories);
  const files = await findTypeScriptFiles(target);

  console.log(`\n🔍 Effect Code Style Fixer - DRY RUN`);
  console.log(`${"━".repeat(50)}`);

  console.log(`\n📁 Target: ${target}`);
  console.log(`\n📋 Categories (${categories.length}):`);
  for (const cat of categories) {
    const catRules = rules.filter(r => r.categoryId === cat.id);
    console.log(`   • ${cat.name} (${catRules.length} rules)`);
  }

  console.log(`\n📏 Rules (${rules.length} total):`);
  for (const rule of rules) {
    console.log(`   • [${rule.categoryId}] ${rule.rule}`);
  }

  console.log(`\n📄 Files to analyze (${files.length}):`);
  for (const file of files) {
    console.log(`   • ${file}`);
  }

  console.log(`\n🤖 Agents to spawn:`);
  console.log(`   • Detection phase: ${rules.length} agents (one per rule)`);
  console.log(`   • Apply phase: up to ${files.length} agents (one per file with violations)`);

  console.log(`\n💡 Summary:`);
  console.log(`   • ${files.length} TypeScript files × ${rules.length} rules = ${files.length * rules.length} file-rule checks`);
  console.log(`   • Run without --dry-run to execute\n`);
}

function printUsage() {
  console.log(`
Usage: bun run src/index.ts <target> [options]

Arguments:
  target              File or directory to analyze

Options:
  -n, --dry-run       Show what would happen without running
  -i, --iterations N  Max iterations (default: 10)
  -h, --help          Show this help message

Examples:
  bun run src/index.ts ./src
  bun run src/index.ts ./src --dry-run
  bun run src/index.ts ./src -i 5
`);
}

async function main() {
  if (showHelp) {
    printUsage();
    return;
  }

  if (!target) {
    printUsage();
    process.exit(1);
  }

  if (dryRun) {
    await runDryRun(target);
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Error: ANTHROPIC_API_KEY not found in environment");
    console.error("Create a .env file with your API key or set it in your shell");
    process.exit(1);
  }

  if (isNaN(maxIterations) || maxIterations < 1) {
    console.error("Error: max-iterations must be a positive number");
    process.exit(1);
  }

  // Load categories and flatten to rules
  const categories = await loadCategories();
  const rules = flattenCategories(categories);

  console.log(`\n🔍 Effect Code Style Fixer (Parallel)`);
  console.log(`Target: ${target}`);
  console.log(`Max iterations: ${maxIterations}`);
  console.log(`Categories: ${categories.map((c) => c.id).join(", ")}`);
  console.log(`Rules: ${rules.length} total`);

  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    console.log(`\n${"━".repeat(50)}`);
    console.log(`Iteration ${iteration}`);
    console.log(`${"━".repeat(50)}`);

    // Phase 1: Detection (parallel by rule)
    await runDetectionPhase(target);

    // Phase 2: Merge (sequential, in-process)
    const mergedFiles = await runMergePhase();

    if (mergedFiles.length === 0) {
      console.log("\n✅ No violations found! All files pass.");
      break;
    }

    // Phase 3: Apply (parallel by file)
    await runApplyPhase(mergedFiles);

    if (iteration === maxIterations) {
      console.log(`\n⚠️  Max iterations reached. Some issues may remain.`);
    }
  }
}

main().catch(console.error);
