import { detect } from "./effect-agent/categories/async/rule-001/rule-001.detector.ts";
import * as ts from "typescript";

const testCode = `
const myFunc = new Promise((resolve, reject) => {
  resolve("done");
});
`;

const sourceFile = ts.createSourceFile(
  "test.ts",
  testCode,
  ts.ScriptTarget.Latest,
  true
);

const violations = detect("test.ts", sourceFile);
console.log("Violations found:", violations.length);
if (violations.length > 0) {
  console.log("First violation:", violations[0].message);
}
console.log("✓ Detector works correctly");
