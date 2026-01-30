// Rule: Never use direct file I/O; use a Context.Tag service
// Example: File system operations (bad example)
// @rule-id: rule-002
// @category: services
// @original-name: context-tag-filesystem

import * as fs from "node:fs/promises";
import { Effect } from "effect";

// ❌ Bad: Direct file system access without a Context.Tag service
const readConfig = () =>
	Effect.tryPromise(() => fs.readFile("config.json", "utf-8"));

const writeLog = (message: string) =>
	Effect.tryPromise(() => fs.appendFile("app.log", message));

export { readConfig, writeLog };
