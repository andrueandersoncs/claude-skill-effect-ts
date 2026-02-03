# Agent Workflow: Step-by-Step Instructions

This document translates AGENTS.md into a concrete, executable workflow. Follow these steps in order for every task.

---

## Phase 1: Problem Definition

### Step 1.1: Restate the Problem

**Input:** User's request  
**Output:** A clear problem statement

1. Read the user's request carefully
2. Identify:
   - What is the current state?
   - What is the desired state?
   - What constraints exist?
3. Write a problem statement in this format:

```
**Problem Statement:**
- Current state: [what exists now]
- Desired state: [what should exist]
- Constraints: [any limitations or requirements]
- Success criteria: [how we know it's solved]
```

4. Present to user and ask: "Is this problem statement correct?"

### Step 1.2: Wait for Confirmation

**STOP.** Do not proceed until the user confirms the problem statement.

- If user says "yes" or confirms → proceed to Step 1.3
- If user corrects or clarifies → return to Step 1.1 with new information

### Step 1.3: Write a Reproduction Script

**Input:** Confirmed problem statement  
**Output:** A Bun script that proves the problem exists

1. Create a file: `repro-<problem-slug>.ts`
2. The script MUST:
   - Exit 0 (success) if the problem STILL EXISTS
   - Exit 1 (failure) if the problem IS SOLVED
3. Script template:

```typescript
#!/usr/bin/env bun
/**
 * Reproduction script for: [problem description]
 * 
 * Exit 0 = problem exists (we need to fix it)
 * Exit 1 = problem solved (we're done)
 */

async function main() {
  // Step 1: Set up test conditions
  // ...

  // Step 2: Attempt the operation that should fail/behave incorrectly
  // ...

  // Step 3: Check if the problem exists
  const problemExists = /* your check */;

  if (problemExists) {
    console.log("❌ Problem confirmed: [description]");
    process.exit(0); // Problem exists
  } else {
    console.log("✅ Problem solved: [description]");
    process.exit(1); // Problem gone
  }
}

main().catch((e) => {
  console.error("Script error:", e);
  process.exit(2); // Script itself failed
});
```

### Step 1.4: Run the Reproduction Script

```bash
bun run repro-<problem-slug>.ts
```

- If exit code is 0 → Problem confirmed, proceed to Phase 2
- If exit code is 1 → Problem doesn't exist, clarify with user
- If exit code is 2 → Fix the script first

---

## Phase 2: Type-Driven Design (Curry-Howard Proofs)

### Step 2.1: Identify the Core Transformation

**Input:** Confirmed problem statement  
**Output:** A description of what transformation(s) need to happen

1. Ask yourself:
   - What data goes in?
   - What data comes out?
   - What relationships must hold?
   - What can go wrong?

2. Write it in prose first:
   - "A [input type] should be convertible to [output type] when [conditions]"
   - "Every [X] must have exactly one [Y]"
   - "If [A] fails, we must have [B] as fallback"

### Step 2.2: Encode as TypeScript Types

**Input:** Prose description of transformation  
**Output:** Type definitions that represent your theory

1. Create a file: `theory-<problem-slug>.ts`
2. Write types that encode your reasoning:

```typescript
/**
 * Theory: [your prose description]
 */

// Define the input type
type Input = {
  // ...
};

// Define the output type
type Output = {
  // ...
};

// Define the transformation type (the theory)
type Theory = (input: Input) => Output;

// Attempt to implement it
const prove: Theory = (input) => {
  // If this compiles, your theory is sound
  // If it doesn't, your reasoning is flawed
};
```

### Step 2.3: Attempt Implementation

1. Try to write a function body that satisfies the type
2. **If it compiles:**
   - Your reasoning is sound
   - Proceed to Phase 3
3. **If it doesn't compile:**
   - Read the error carefully
   - The type checker is telling you your theory is wrong
   - Revise your types (Step 2.2), NOT the implementation
   - Repeat until it compiles

### Step 2.4: Document Your Proof

Add comments explaining:
- What the types prove
- What edge cases they handle
- What assumptions they encode

---

## Phase 3: Context Gathering (Parallel Analysis)

### Step 3.1: Identify the Target Code

**Input:** Problem statement + type theory  
**Output:** List of files/functions to modify

1. Identify the specific files, functions, or modules that need to change
2. Create a list: `targets = [file1, file2, ...]`

### Step 3.2: Spawn Parallel Context Subagents

**Input:** Target list  
**Output:** Context from 5 parallel analyses

Spawn these 5 subagents **simultaneously in a single message**:

```typescript
import { analyzeSubagent } from "./subagent-utils";

const targets = ["path/to/file1.ts", "path/to/file2.ts"];
const targetList = targets.join(", ");

const [callers, tests, types, patterns, docs] = await Promise.all([
  // Subagent 1: Find all callers/consumers
  analyzeSubagent(`
    Find all files that import or call functions from: ${targetList}
    For each caller, provide:
    - File path
    - Function/method that calls the target
    - One-line summary of how it uses the target
    - Any assumptions it makes about the target's behavior
  `),

  // Subagent 2: Find all tests
  analyzeSubagent(`
    Find all tests for: ${targetList}
    For each test file, provide:
    - File path
    - Test names/descriptions
    - What behaviors are being asserted
    - Any edge cases being tested
  `),

  // Subagent 3: Analyze type contracts
  analyzeSubagent(`
    Identify all types, interfaces, and schemas that: ${targetList} implements or depends on.
    For each type, provide:
    - Type name and location
    - The contract it defines
    - Any constraints or invariants
  `),

  // Subagent 4: Find similar code patterns
  analyzeSubagent(`
    Find 2-3 files similar to: ${targetList} in this codebase.
    For each similar file, provide:
    - File path
    - What patterns it follows
    - How ${targetList} should match these patterns
  `),

  // Subagent 5: Find documentation
  analyzeSubagent(`
    Find any documentation related to: ${targetList}
    Look for:
    - README files in the same directory
    - Doc comments in the code
    - Design documents
    - Related CHANGELOG entries
  `),
]);
```

### Step 3.3: Synthesize Context

**Input:** Results from 5 subagents  
**Output:** A context summary

Create a context document:

```markdown
## Context Summary for [target files]

### Callers (who depends on this code)
- [caller1]: [how it uses the target]
- [caller2]: [how it uses the target]

### Tests (what behavior is expected)
- [test1]: asserts [behavior]
- [test2]: asserts [behavior]

### Type Contracts (what constraints exist)
- Must implement: [interface]
- Must satisfy: [schema]

### Patterns (how similar code works)
- Pattern 1: [description]
- Pattern 2: [description]

### Documentation
- [any relevant docs]

### Impact Assessment
- Changes will affect: [N] callers
- Tests that may need updating: [list]
- Type contracts to maintain: [list]
```

### Step 3.4: Verify Context Completeness

Before proceeding, verify:
- [ ] I know what calls this code
- [ ] I know what tests cover this code
- [ ] I know the type contracts this code must satisfy
- [ ] I know how similar code in this codebase is structured

If any answer is "no", spawn another subagent to fill the gap.

---

## Phase 4: Task Decomposition

### Step 4.1: Break Down the Work

**Input:** Problem statement + context summary  
**Output:** List of independent tasks

1. Identify all changes needed
2. Group into independent units (can be done in parallel)
3. Create task list:

```markdown
## Task List

- [ ] Task 1: [description] - affects [files]
- [ ] Task 2: [description] - affects [files]
- [ ] Task 3: [description] - affects [files]

Dependencies:
- Task 2 depends on Task 1 (must complete first)
- Task 3 is independent (can run in parallel)
```

### Step 4.2: Identify Parallelizable Tasks

1. Draw a dependency graph (mental or actual)
2. Tasks with no dependencies on each other → parallel
3. Tasks that depend on others → sequential after dependencies

### Step 4.3: Spawn Parallel Worker Subagents

For each independent task, spawn a worker subagent:

```typescript
import { taskWorker } from "./subagent-utils";

// Spawn workers for independent tasks in parallel
const results = await Promise.all([
  taskWorker({
    taskId: "task-1",
    description: "Implement X in file Y",
    files: ["path/to/file.ts"],
    context: contextSummary,
    constraints: [
      "Must maintain type contract Z",
      "Must pass existing tests",
    ],
  }),
  taskWorker({
    taskId: "task-2",
    description: "Update tests for X",
    files: ["path/to/file.test.ts"],
    context: contextSummary,
    constraints: [
      "Test all edge cases from context",
    ],
  }),
  // ... more parallel tasks
]);
```

### Step 4.4: Handle Sequential Dependencies

For tasks with dependencies:

```typescript
// Task 1 must complete first
const task1Result = await taskWorker({ taskId: "task-1", ... });

// Now Task 2 can run (depends on Task 1)
const task2Result = await taskWorker({ 
  taskId: "task-2",
  dependsOn: task1Result,
  ...
});
```

---

## Phase 5: Implementation Loop (Scientific Method)

### Step 5.1: Form a Hypothesis

For each task/change:
1. State what you expect to happen
2. Predict the outcome

```markdown
**Hypothesis:** If I change [X] to [Y], then [expected outcome]
```

### Step 5.2: Encode as Type (if applicable)

If the hypothesis involves data transformation:
1. Write the type signature
2. Verify it compiles

### Step 5.3: Implement the Change

1. Make the code change
2. Keep changes minimal and focused
3. One logical change at a time

### Step 5.4: Run Verification

After each change:

```bash
# Type check
bun run check

# Lint
bun run lint

# Run specific tests
bun test path/to/file.test.ts

# Run reproduction script
bun run repro-<problem-slug>.ts
```

### Step 5.5: Evaluate Results

- **If all checks pass and repro script exits 1 (problem solved):**
  → Proceed to Phase 6

- **If type check fails:**
  → Your implementation doesn't match your theory
  → Revisit Phase 2, fix types or implementation

- **If tests fail:**
  → Your change broke expected behavior
  → Analyze which behavior, decide if test or code is wrong

- **If repro script still exits 0 (problem exists):**
  → Change didn't solve the problem
  → Form new hypothesis, repeat from Step 5.1

### Step 5.6: Iterate Until Solved

```
while (reproScript.exitCode === 0) {
  formNewHypothesis();
  implement();
  verify();
}
```

---

## Phase 6: Verification & Hardening

### Step 6.1: Run Full Verification Suite

```bash
# All type checks
bun run check

# All linting
bun run lint

# All tests
bun test

# Reproduction script (must fail = problem solved)
bun run repro-<problem-slug>.ts
echo "Exit code: $?"  # Must be 1
```

### Step 6.2: Self-Critique (Find One Flaw)

**REQUIRED:** Find at least one flaw in your solution and fix it.

1. Review your changes with fresh eyes
2. Ask yourself:
   - What edge cases might break this?
   - What assumptions am I making that might be wrong?
   - Is there a simpler way to do this?
   - Did I introduce any new problems?

3. If you find a flaw:
   - Fix it
   - Re-run verification
   - Repeat until you can't find more flaws

### Step 6.3: Verify Against Context

Check your changes against the context gathered in Phase 3:

- [ ] All callers still work correctly
- [ ] All tests pass (or were intentionally updated)
- [ ] All type contracts are satisfied
- [ ] Code follows established patterns
- [ ] Documentation is updated if needed

### Step 6.4: Write a "Can't Improve" Justification

Before marking done, write:

```markdown
**Why this solution can't be easily improved:**
1. [Reason 1]
2. [Reason 2]
3. [Reason 3]

**Flaws found and fixed:**
1. [Flaw 1]: [How it was fixed]
```

---

## Phase 7: Completion

### Step 7.1: Final Reproduction Script Run

```bash
bun run repro-<problem-slug>.ts
# MUST exit with code 1 (problem solved)
```

### Step 7.2: Commit Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "fix: [problem description]

- [change 1]
- [change 2]
- [change 3]

Closes: [issue reference if applicable]"
```

### Step 7.3: Report Results

Provide a summary to the user:

```markdown
## Solution Summary

**Problem:** [original problem statement]

**Solution:** [what was done]

**Changes made:**
- [file1]: [what changed]
- [file2]: [what changed]

**Verification:**
- Type check: ✅
- Lint: ✅
- Tests: ✅
- Reproduction script: ✅ (exits 1, problem solved)

**Self-critique:** Found and fixed [N] flaws:
1. [flaw and fix]
```

---

## Quick Reference: Decision Points

| Situation | Action |
|-----------|--------|
| User request received | → Phase 1: Restate as problem |
| Problem statement unclear | → Ask for clarification, do NOT proceed |
| Need to understand code | → Phase 3: Spawn parallel context subagents |
| Multiple files to change | → Phase 4: Spawn parallel worker subagents |
| Change doesn't compile | → Phase 2: Fix types first, not implementation |
| Tests fail | → Analyze: is test wrong or code wrong? |
| Repro script still passes | → Phase 5: Form new hypothesis, iterate |
| Think you're done | → Phase 6: Find one flaw first |
| Can't find any flaws | → Write justification, then Phase 7 |

---

## Anti-Patterns to Avoid

| Anti-Pattern | Correct Behavior |
|--------------|------------------|
| Editing without context | Spawn context subagents FIRST |
| Reading many files yourself | Delegate to subagents |
| Sequential work on independent tasks | Parallel subagents |
| Asking "should I proceed?" | Just proceed and show results |
| Minimal fix when proper fix exists | Do the proper fix |
| Declaring "impossible" | Escalate abstraction level |
| Marking done without self-critique | Find and fix one flaw first |
| Reasoning in prose then coding | Encode reasoning as types FIRST |

---

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     PHASE 1: PROBLEM DEFINITION                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ Restate  │───▶│  Wait    │───▶│  Write   │───▶│   Run    │  │
│  │ Problem  │    │  Confirm │    │  Repro   │    │  Repro   │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PHASE 2: TYPE-DRIVEN DESIGN                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                   │
│  │ Identify │───▶│ Encode   │───▶│ Attempt  │──┐                │
│  │ Transform│    │ as Types │    │ Implement│  │                │
│  └──────────┘    └──────────┘    └──────────┘  │                │
│                        ▲              │        │                │
│                        └──────────────┘        │                │
│                      (doesn't compile)         │                │
└─────────────────────────────────────────────────────────────────┘
                              │ (compiles)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 PHASE 3: CONTEXT GATHERING                       │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Spawn 5 Parallel Subagents                 │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐│    │
│  │  │Callers │ │ Tests  │ │ Types  │ │Patterns│ │  Docs  ││    │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘│    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│                    ┌──────────────────┐                         │
│                    │ Synthesize       │                         │
│                    │ Context Summary  │                         │
│                    └──────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  PHASE 4: TASK DECOMPOSITION                     │
│  ┌──────────┐    ┌──────────┐    ┌─────────────────────────┐   │
│  │ Break    │───▶│ Identify │───▶│ Spawn Parallel Workers  │   │
│  │ Down     │    │ Parallel │    │ ┌─────┐ ┌─────┐ ┌─────┐│   │
│  │ Work     │    │ Tasks    │    │ │ W1  │ │ W2  │ │ W3  ││   │
│  └──────────┘    └──────────┘    │ └─────┘ └─────┘ └─────┘│   │
│                                   └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              PHASE 5: IMPLEMENTATION LOOP                        │
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  Form    │───▶│ Encode   │───▶│Implement │───▶│  Verify  │  │
│  │Hypothesis│    │ as Type  │    │ Change   │    │  Change  │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│       ▲                                               │         │
│       │                                               ▼         │
│       │                                        ┌──────────┐     │
│       │                                        │ Repro    │     │
│       │                                        │ Passes?  │     │
│       │                                        └──────────┘     │
│       │                                          │     │        │
│       └──────────────────────────────────────────┘     │        │
│                    (yes, problem exists)               │        │
│                                                        │        │
└────────────────────────────────────────────────────────│────────┘
                                                         │ (no, solved)
                                                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                 PHASE 6: VERIFICATION                            │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  Full    │───▶│  Self    │───▶│ Verify   │───▶│ Write    │  │
│  │  Suite   │    │ Critique │    │ Context  │    │"Can't    │  │
│  │  Run     │    │ (1 flaw) │    │ Match    │    │ Improve" │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 7: COMPLETION                           │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                   │
│  │  Final   │───▶│  Commit  │───▶│  Report  │                   │
│  │  Repro   │    │ Changes  │    │ Results  │                   │
│  └──────────┘    └──────────┘    └──────────┘                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Appendix: Subagent Templates

### Context Analysis Subagent

```typescript
const prompt = `
You are a context analysis subagent. Your job is to gather specific information about code.

Target files: ${targets.join(", ")}

Your task: ${specificTask}

Instructions:
1. Search the codebase thoroughly
2. Provide concrete, specific findings
3. Include file paths and line numbers where relevant
4. Summarize in a structured format

Output format:
- Finding 1: [description] (file:line)
- Finding 2: [description] (file:line)
...
`;
```

### Task Worker Subagent

```typescript
const prompt = `
You are a task worker subagent. Your job is to complete a specific implementation task.

Task ID: ${taskId}
Task: ${description}
Files to modify: ${files.join(", ")}

Context:
${contextSummary}

Constraints:
${constraints.map(c => `- ${c}`).join("\n")}

Instructions:
1. Make ONLY the changes needed for this task
2. Maintain all type contracts
3. Follow existing code patterns
4. Do NOT modify files outside your scope

When complete, output:
- Files modified: [list]
- Changes made: [description]
- Tests to run: [list]
`;
```
