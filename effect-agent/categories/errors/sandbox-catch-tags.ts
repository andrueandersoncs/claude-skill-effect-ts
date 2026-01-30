// Rule: Never use try/catch for Effect errors; use Effect.sandbox with catchTags
// Example: Handling defects and expected errors

import { Console, Effect } from "effect"

declare const program: Effect.Effect<string, Error>
declare const fallback: string

// ✅ Good: Effect.sandbox with catchTags for all cause types
const sandboxed = Effect.sandbox(program)

const handled = Effect.catchTags(sandboxed, {
  Fail: (cause) =>
    // Expected error - recover gracefully
    Console.log(`Caught failure: ${cause.error}`).pipe(Effect.as(fallback)),
  Die: (cause) =>
    // Defect (bug) - log and recover
    Console.log(`Caught defect: ${cause.defect}`).pipe(Effect.as(fallback)),
  Interrupt: (cause) =>
    // Interruption - clean shutdown
    Console.log(`Caught interrupt: ${cause.fiberId}`).pipe(Effect.as(fallback)),
})

// Restore original error handling
const result = Effect.unsandbox(handled)

export { result }
