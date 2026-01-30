# Testing Violations

ALL Effect tests MUST use @effect/vitest. NEVER use Effect.runPromise in tests. NEVER hand-craft test data - use Arbitrary.make(Schema). Combine service test layers with property testing for 100% coverage.
