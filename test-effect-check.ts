// Test file with rule-004 violation
import { Effect } from "effect";

// This is the violation described in the task
// Effect.gen with single yield should be simplified

const test1 = "ok";
const test2 = "ok";
const test3 = "ok";
const test4 = "ok";
const numbers = Effect.forEach(Array.from({ length: 10 }, (_, i) => i), (i) => Effect.log(i));
