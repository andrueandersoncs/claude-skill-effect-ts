# Effect-TS Rule Violation Detectors

Static analysis tools for detecting Effect-TS anti-patterns in TypeScript code.

## Overview

These detectors use the TypeScript Compiler API to analyze AST patterns and identify code that violates Effect-TS best practices. Each category detector focuses on a specific set of rules from the `categories/` folder.

## Usage

```bash
# Run detection on current directory (warnings and errors)
bun run detect

# Run all checks including info-level (most verbose)
bun run detect:all

# Run only definite errors (strictest)
bun run detect:errors

# Output as JSON
bun run detect:json

# Specific directory
bun run detect ./src

# Specific categories only
bun run detect -c imperative,conditionals ./src

# Help
bun run detect --help
```

## Categories

| Category | Description | Certainty |
|----------|-------------|-----------|
| `async` | async/await, Promises, setTimeout/setInterval | Mostly definite |
| `code-style` | Non-null assertions, type casts, function declarations | Mixed |
| `comments` | TODO comments, redundant comments | Mixed |
| `conditionals` | if/else, switch/case, ternary operators | Definite |
| `discriminated-unions` | Direct `._tag` access, switch on tag | Definite |
| `errors` | try/catch, throw, untyped Error | Definite |
| `imperative` | for/while loops, mutation operators | Definite |
| `native-apis` | Object.keys, JSON.parse, Array methods | Mixed |
| `schema` | Interfaces/types that should be Schema | Potential |
| `services` | Direct fetch/fs calls without Context.Tag | Mixed |
| `testing` | Effect.runPromise in tests, missing @effect/vitest | Mixed |

## Certainty Levels

- **Definite**: 100% certain violations that must be fixed (e.g., `for` loops, `try/catch`)
- **Potential**: Likely violations that require human review (e.g., interfaces that might be okay)

## Severity Levels

- **Error**: Must fix - clearly violates Effect-TS patterns
- **Warning**: Should fix - likely a problem but context matters
- **Info**: Consider fixing - suggestions for improvement

## Output Formats

### Text (default)
```
/path/to/file.ts
────────────────────────────────────
  ❌ 10:5 [imperative/effectful-iteration]
     Use Effect.forEach or Array methods instead of for loops
     💡 Replace with Effect.forEach() or Array.map/filter/reduce
     for (let i = 0; i < items.length; i++) { ...
```

### JSON (`--json`)
```json
{
  "filesAnalyzed": 10,
  "violations": [
    {
      "ruleId": "effectful-iteration",
      "category": "imperative",
      "message": "Use Effect.forEach or Array methods instead of for loops",
      "filePath": "/path/to/file.ts",
      "line": 10,
      "column": 5,
      "snippet": "for (let i = 0; ...",
      "severity": "error",
      "certainty": "definite",
      "suggestion": "Replace with Effect.forEach() or Array.map/filter/reduce"
    }
  ],
  "errors": []
}
```

## Programmatic API

```typescript
import { detectDirectory, detectFile, formatViolations } from "./detectors";

// Detect on directory
const result = detectDirectory("./src", {
  categories: ["imperative", "conditionals"],
  minSeverity: "warning",
  includePotential: true,
});

// Detect on single file
const { violations, error } = detectFile("./src/index.ts", allDetectors);

// Format for display
console.log(formatViolations(result.violations));
```

## Architecture

```
detectors/
├── types.ts              # TypeScript interfaces
├── runner.ts             # CLI and main runner
├── index.ts              # Public API exports
└── categories/
    ├── index.ts          # Category registry
    ├── async.ts          # async/await detection
    ├── code-style.ts     # Style issue detection
    ├── comments.ts       # Comment pattern detection
    ├── conditionals.ts   # if/else/ternary detection
    ├── discriminated-unions.ts
    ├── errors.ts         # try/catch/throw detection
    ├── imperative.ts     # Loop/mutation detection
    ├── native-apis.ts    # Native API detection
    ├── schema.ts         # Schema pattern detection
    ├── services.ts       # Service pattern detection
    └── testing.ts        # Test pattern detection
```

## Limitations

1. **Heuristic-based**: Some patterns require human judgment
2. **No type information**: Uses AST only, not full TypeScript type checker
3. **False positives**: Some detections may flag valid code
4. **Context-blind**: Cannot understand business logic context

For comprehensive checking, combine with:
- TypeScript strict mode
- ESLint with Effect rules
- Code review by experienced Effect developers
