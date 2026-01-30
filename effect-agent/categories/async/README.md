# Async & Promises

NEVER mix async/await with Effect. Convert all Promise-based code to Effect. Use Effect.gen with yield* for sequential async operations.
