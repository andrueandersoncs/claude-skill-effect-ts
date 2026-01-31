import { $ } from "bun";

// Test: run detector and check for rule-006 violations at line 128
const result = await $`cd effect-agent && bun run detect:errors categories/async/rule-001/rule-001.detector.ts 2>&1`.text();

// Count rule-006 violations at line 128
const violations = result.match(/Line: 128.*rule-006/g) || [];

if (violations.length > 0) {
    console.log("FAIL: rule-006 violation still exists at line 128");
    process.exit(0); // Exit 0 = problem exists
} else {
    console.log("PASS: rule-006 violation fixed at line 128");
    process.exit(1); // Exit 1 = problem fixed
}
