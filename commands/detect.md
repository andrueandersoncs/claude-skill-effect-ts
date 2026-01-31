---
name: detect
description: Run Effect-TS detectors and output violations without spawning agents
argument-hint: "<file-or-directory> [--json] [--errors]"
allowed-tools:
  - Bash
---

# Effect-TS Detector

Run AST-based detectors to find Effect-TS violations. Outputs results directly without spawning agents.

## Usage

```
/detect <path>              # All violations (errors, warnings, info)
/detect <path> --json       # JSON output
/detect <path> --errors     # Only definite errors (no warnings, no potential)
```

## Looking Up Examples

To see good/bad examples for any rule, use the examples command:

```bash
cd ${CLAUDE_PLUGIN_ROOT}/effect-agent && bun run detect:examples <category/rule-id>
```

Example:
```bash
bun run detect:examples code-style/rule-002
bun run detect:examples schema/rule-010
```

This shows the full bad example (anti-pattern) and good example (idiomatic Effect-TS) for the specified rule.

## Implementation

Parse arguments from the user's input:
- `<path>` - file or directory to scan (required)
- `--json` - output as JSON
- `--errors` - only show definite errors

Run the appropriate detector command:

```bash
cd ${CLAUDE_PLUGIN_ROOT}/effect-agent && bun run detect:all <path>        # default
cd ${CLAUDE_PLUGIN_ROOT}/effect-agent && bun run detect:json <path>       # --json
cd ${CLAUDE_PLUGIN_ROOT}/effect-agent && bun run detect:errors <path>     # --errors
```

## Output

Display the detector output directly. Do NOT:
- Create tasks
- Spawn agents
- Offer to fix violations

Just show the violations and let the user decide what to do next.
