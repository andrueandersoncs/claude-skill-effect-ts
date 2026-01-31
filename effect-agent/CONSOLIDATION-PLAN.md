# Rule Consolidation Plan

This document outlines the consolidation of 121 rules into ~75 focused rules, eliminating redundancy while preserving all guidance.

---

## Overview

| Category | Before | After | Reduction |
|----------|--------|-------|-----------|
| async | 8 | 7 | -1 |
| code-style | 14 | 10 | -4 |
| comments | 8 | 4 | -4 |
| conditionals | 11 | 5 | -6 |
| discriminated-unions | 7 | 4 | -3 |
| errors | 12 | 9 | -3 |
| imperative | 9 | 8 | -1 |
| native-apis | 15 | 9 | -6 |
| schema | 14 | 12 | -2 |
| services | 8 | 4 | -4 |
| testing | 15 | 9 | -6 |
| **TOTAL** | **121** | **81** | **-40** |

---

## Consolidation Groups

### Group 1: Schema-Based Conditionals

**Problem**: 6 rules all teach the same pattern - "Define Schema types, use Match.when(Schema.is())"

**Merge Into**: `conditionals/rule-002-schema-conditionals.ts`

| Rule | Current Name | Status |
|------|--------------|--------|
| conditionals/rule-002 | match-literal-union | **KEEP** (base) |
| conditionals/rule-003 | match-struct-conditions | MERGE |
| conditionals/rule-004 | multi-condition-assignment | MERGE |
| conditionals/rule-005 | multi-condition-matching | MERGE |
| conditionals/rule-007 | numeric-classification | MERGE |
| conditionals/rule-011 | type-predicate-union-schema | MERGE |

**New Rule Structure**:
```
Name: schema-conditionals
Description: Use Schema types with Match.when(Schema.is()) for all conditional logic

Examples to include:
- Literal unions (string literals like "admin" | "user")
- Struct conditions (object shape matching)
- Numeric ranges (Schema.Int.pipe(Schema.between()))
- Multi-condition assignment
- Type predicate replacement
```

**Files to Delete After Merge**:
- `conditionals/rule-003-match-struct-conditions.ts`
- `conditionals/rule-004-multi-condition-assignment.ts`
- `conditionals/rule-005-multi-condition-matching.ts`
- `conditionals/rule-007-numeric-classification.ts`
- `conditionals/rule-011-type-predicate-union-schema.ts`

---

### Group 2: Discriminated Union Dispatch

**Problem**: 4 rules teach Match.tag for discriminated unions with nearly identical examples

**Merge Into**: `discriminated-unions/rule-001-match-tag-dispatch.ts`

| Rule | Current Name | Status |
|------|--------------|--------|
| discriminated-unions/rule-001 | match-tag-dispatch | **KEEP** (base) |
| discriminated-unions/rule-006 | switch-on-tag | MERGE |
| discriminated-unions/rule-007 | use-union-directly | MERGE |
| conditionals/rule-009 | switch-to-match-tag | **DELETE** (duplicate) |

**New Rule Structure**:
```
Name: match-tag-dispatch
Description: Use Match.tag for discriminated union dispatch

Examples to include:
- Basic tag dispatch (AppEvent example)
- Multiple actions per tag
- Nested discriminated unions
- When to use Match.tag vs Match.when(Schema.is())
```

**Files to Delete After Merge**:
- `discriminated-unions/rule-006-switch-on-tag.ts`
- `discriminated-unions/rule-007-use-union-directly.ts`
- `conditionals/rule-009-switch-to-match-tag.ts`

---

### Group 3: Array Operations

**Problem**: 7 rules scattered across categories all teach "Use Effect's Array module"

**Merge Into**: `native-apis/rule-001-array-operations.ts` (new comprehensive rule)

| Rule | Current Name | Status |
|------|--------------|--------|
| native-apis/rule-005 | filter-and-transform-single-pass | **KEEP** (base) |
| native-apis/rule-006 | finding-with-default | MERGE |
| native-apis/rule-008 | grouping-items-by-key | MERGE |
| native-apis/rule-009 | head-and-tail-access | MERGE |
| native-apis/rule-011 | removing-duplicates | MERGE |
| imperative/rule-001 | array-splice-modification | MOVE & MERGE |
| imperative/rule-009 | splitting-array-by-condition | MOVE & MERGE |

**New Rule Structure**:
```
Name: array-operations
Description: Use Effect's Array module instead of native array methods

Decision Matrix:
- .filter().map() → Array.filterMap
- .find() ?? default → Array.findFirst + Option.getOrElse
- .reduce() for grouping → Array.groupBy
- arr[0], arr[arr.length-1] → Array.head, Array.last
- [...new Set(arr)] → Array.dedupe
- .splice() → Array.remove, Array.insertAt
- .filter(predicate) for split → Array.partition
```

**Files to Delete After Merge**:
- `native-apis/rule-006-finding-with-default.ts`
- `native-apis/rule-008-grouping-items-by-key.ts`
- `native-apis/rule-009-head-and-tail-access.ts`
- `native-apis/rule-011-removing-duplicates.ts`
- `imperative/rule-001-array-splice-modification.ts`
- `imperative/rule-009-splitting-array-by-condition.ts`

---

### Group 4: Error Handling with catchTag

**Problem**: 4 rules teach the same catchTag/catchTags pattern

**Merge Into**: `errors/rule-002-catch-tag.ts`

| Rule | Current Name | Status |
|------|--------------|--------|
| errors/rule-002 | catch-tag | **KEEP** (base) |
| errors/rule-003 | catch-tags | MERGE |
| errors/rule-012 | typed-errors | **DELETE** (duplicate of rule-002) |
| discriminated-unions/rule-005 | schema-tagged-error | MOVE & MERGE |

**New Rule Structure**:
```
Name: catch-tag-recovery
Description: Use Effect.catchTag/catchTags for typed error recovery

Examples to include:
- Single error type with catchTag
- Multiple error types with catchTags
- Schema.TaggedError definition
- Recovery strategies (retry, fallback, rethrow)
```

**Files to Delete After Merge**:
- `errors/rule-003-catch-tags.ts`
- `errors/rule-012-typed-errors.ts`
- `discriminated-unions/rule-005-schema-tagged-error.ts`

---

### Group 5: Service Wrapping with Context.Tag

**Problem**: 4 rules teach identical Context.Tag wrapping for different domains

**Merge Into**: `services/rule-001-context-tag.ts`

| Rule | Current Name | Status |
|------|--------------|--------|
| services/rule-001 | context-tag-api | **KEEP** (base) |
| services/rule-002 | context-tag-filesystem | MERGE |
| services/rule-003 | context-tag-repository | MERGE |
| services/rule-008 | wrap-third-party-sdk | MERGE |

**New Rule Structure**:
```
Name: context-tag-dependencies
Description: Wrap external dependencies in Context.Tag for testability

Examples to include:
- External HTTP APIs
- File system operations
- Database repositories
- Third-party SDKs
- Test layer creation pattern
```

**Files to Delete After Merge**:
- `services/rule-002-context-tag-filesystem.ts`
- `services/rule-003-context-tag-repository.ts`
- `services/rule-008-wrap-third-party-sdk.ts`

---

### Group 6: Service Implementation Layers

**Problem**: 3 rules teach service layer patterns with overlap

**Merge Into**: `services/rule-005-layer-implementation.ts`

| Rule | Current Name | Status |
|------|--------------|--------|
| services/rule-005 | layer-effect | **KEEP** (base) |
| services/rule-006 | live-and-test-layers | MERGE |
| services/rule-007 | stateful-test-layer | MERGE |

**New Rule Structure**:
```
Name: layer-implementation
Description: Implement services with Layer.effect, providing Live and Test variants

Examples to include:
- Layer.effect for services with dependencies
- Live layer with real implementations
- Test layer with Ref-based state
- Layer composition with Layer.provide
```

**Files to Delete After Merge**:
- `services/rule-006-live-and-test-layers.ts`
- `services/rule-007-stateful-test-layer.ts`

---

### Group 7: Property-Based Testing

**Problem**: 6 rules teach Arbitrary/property-based testing with Schema

**Merge Into**: `testing/rule-006-property-based-testing.ts`

| Rule | Current Name | Status |
|------|--------------|--------|
| testing/rule-006 | it-effect-prop | **KEEP** (base) |
| testing/rule-001 | arbitrary-responses | MERGE |
| testing/rule-002 | arbitrary-test-layer | MERGE |
| testing/rule-009 | it-prop-schema | MERGE |
| testing/rule-011 | layer-effect-prop | MERGE |
| testing/rule-013 | property-based | **DELETE** (duplicate of rule-006) |

**New Rule Structure**:
```
Name: property-based-testing
Description: Use it.effect.prop with Schema.Arbitrary for property-based testing

Examples to include:
- Basic it.effect.prop usage
- Schema-derived Arbitrary values
- Multiple Schema parameters
- Test layers with Arbitrary data
- Combining with service layers
```

**Files to Delete After Merge**:
- `testing/rule-001-arbitrary-responses.ts`
- `testing/rule-002-arbitrary-test-layer.ts`
- `testing/rule-009-it-prop-schema.ts`
- `testing/rule-011-layer-effect-prop.ts`
- `testing/rule-013-property-based.ts`

---

### Group 8: Comments - Self-Documenting Code

**Problem**: 4 rules teach "don't add comments restating obvious code"

**Merge Into**: `comments/rule-001-self-documenting.ts`

| Rule | Current Name | Status |
|------|--------------|--------|
| comments/rule-001 | branded-type-definition | **KEEP** (base) |
| comments/rule-003 | effect-pipeline | MERGE |
| comments/rule-004 | function-documentation | MERGE |
| comments/rule-005 | function-implementation | MERGE |

**New Rule Structure**:
```
Name: self-documenting-code
Description: Code should be self-documenting; never add comments restating types or obvious operations

Examples to include:
- Branded types (no JSDoc restating the type)
- Effect pipelines (no inline comments for standard operations)
- Function signatures (no @param/@returns restating types)
- Implementation details (no comments describing WHAT)
```

**Files to Delete After Merge**:
- `comments/rule-003-effect-pipeline.ts`
- `comments/rule-004-function-documentation.ts`
- `comments/rule-005-function-implementation.ts`

---

### Group 9: Type Assertions Prevention

**Problem**: 4 rules teach "use Schema instead of type assertions"

**Merge Into**: `code-style/rule-002-no-type-assertions.ts`

| Rule | Current Name | Status |
|------|--------------|--------|
| code-style/rule-002 | dynamic-data | **KEEP** (base) |
| code-style/rule-001 | dom-element | MERGE |
| code-style/rule-012 | unknown-conversion | MERGE |
| code-style/rule-014 | validate-api-response | MERGE |

**New Rule Structure**:
```
Name: no-type-assertions
Description: Never use type assertions (as, <Type>); use Schema.decodeUnknown or type guards

Examples to include:
- JSON/API responses → Schema.decodeUnknown
- DOM elements → Option + type guards
- Unknown conversion → Schema.decodeUnknown
- "as any" escape hatch → Schema validation
```

**Files to Delete After Merge**:
- `code-style/rule-001-dom-element.ts`
- `code-style/rule-012-unknown-conversion.ts`
- `code-style/rule-014-validate-api-response.ts`

---

### Group 10: Schema Class Definition

**Problem**: 3 rules teach Schema.Class for data definition

**Merge Into**: `schema/rule-005-schema-class.ts`

| Rule | Current Name | Status |
|------|--------------|--------|
| schema/rule-005 | schema-class | **KEEP** (base) |
| schema/rule-004 | schema-class-methods | MERGE |
| schema/rule-006 | schema-constructor | MERGE |

**New Rule Structure**:
```
Name: schema-class
Description: Use Schema.Class for data types with validation and methods

Examples to include:
- Basic Schema.Class definition
- Adding methods to Schema classes
- Constructor usage for instantiation
- Extending Schema classes
```

**Files to Delete After Merge**:
- `schema/rule-004-schema-class-methods.ts`
- `schema/rule-006-schema-constructor.ts`

---

### Group 11: Async Promise Handling (Minor)

**Problem**: Overlap between async and errors categories on tryPromise

**Action**: Keep separate but add cross-reference

| Rule | Current Name | Status |
|------|--------------|--------|
| async/rule-008 | wrap-external-async | KEEP |
| errors/rule-005 | effect-try-promise | KEEP (add cross-ref) |

**No files deleted**, just add cross-reference comments.

---

## Remaining Rules (No Changes)

These rules are unique and should remain as-is:

### async (7 remaining)
- rule-001: callback-api
- rule-002: delay-timing
- rule-003: parallel-effects
- rule-004: parallel-validation
- rule-005: promise-chain
- rule-006: sequential-execution
- rule-007: timeout-handling

### code-style (10 remaining)
- rule-002: no-type-assertions (consolidated)
- rule-003: empty-object-type
- rule-004: effect-all
- rule-005: effect-fn-transformation
- rule-006: effect-gen
- rule-007: inferred-return-type
- rule-008: non-null-assertion
- rule-009: partial-record
- rule-010: record-string-key
- rule-011: tuple-type

### comments (4 remaining)
- rule-001: self-documenting-code (consolidated)
- rule-002: naming
- rule-006: why-comments
- rule-007: actionable-todo
- rule-008: descriptive-naming

### conditionals (5 remaining)
- rule-001: early-return
- rule-002: schema-conditionals (consolidated)
- rule-006: nullable-option-match
- rule-008: ternary-to-match
- rule-010: ternary-nested

### discriminated-unions (4 remaining)
- rule-001: match-tag-dispatch (consolidated)
- rule-002: data-tagged-class
- rule-003: data-tagged-enum
- rule-004: match-vs-schema-is

### errors (9 remaining)
- rule-001: catch-all
- rule-002: catch-tag-recovery (consolidated)
- rule-004: conditional-fail
- rule-005: effect-try-promise
- rule-006: effect-try-sync
- rule-007: error-mapping
- rule-008: error-retry
- rule-009: fallback-or-else
- rule-010: promise-rejection
- rule-011: tap-error-logging

### imperative (8 remaining)
- rule-002: break-early-return
- rule-003: callback-mutation
- rule-004: conditional-accumulation
- rule-005: counted-loop
- rule-006: for-in-record
- rule-007: for-each-loop
- rule-008: index-lookup

### native-apis (9 remaining)
- rule-001: array-operations (consolidated)
- rule-002: compose-functions
- rule-003: currying-partial-application
- rule-004: date-duration
- rule-007: negated-conditions
- rule-010: record-operations
- rule-012: string-template
- rule-013: tuple-access
- rule-014: type-guards-predicates
- rule-015: typeof-checks

### schema (12 remaining)
- rule-001: branded-ids
- rule-002: extends-base
- rule-003: filter-constraints
- rule-005: schema-class (consolidated)
- rule-007: schema-defaults
- rule-008: schema-enum
- rule-009: schema-literal-union
- rule-010: schema-optional
- rule-011: schema-pick-omit
- rule-012: schema-readonly
- rule-013: schema-transform
- rule-014: schema-union

### services (4 remaining)
- rule-001: context-tag-dependencies (consolidated)
- rule-004: layer-compose
- rule-005: layer-implementation (consolidated)

### testing (9 remaining)
- rule-003: describe-layer
- rule-004: effect-test-utility
- rule-005: exit-assertions
- rule-006: property-based-testing (consolidated)
- rule-007: it-scoped
- rule-008: it-live
- rule-010: layer-service-test
- rule-012: schema-constraint-testing
- rule-014: test-clock
- rule-015: service-testing

---

## Implementation Steps

### Phase 1: Create Consolidated Rules
For each consolidation group:
1. Read all source rules to understand full scope
2. Create new consolidated rule with comprehensive examples
3. Ensure all patterns from merged rules are represented

### Phase 2: Update Cross-References
1. Add cross-references between related rules
2. Update any rule that references deleted rules

### Phase 3: Delete Redundant Rules
1. Delete files listed in each group's "Files to Delete" section
2. Verify no broken imports or references

### Phase 4: Renumber Rules
1. Renumber remaining rules for consistency (optional)
2. Update _fixtures.ts in each category

### Phase 5: Verification
1. Run `bun run detect:all` on test files
2. Verify all detectors still function
3. Run linting and type checks

---

## Risk Mitigation

1. **Git branch**: Do all work on a feature branch
2. **Incremental commits**: Commit after each consolidation group
3. **Test after each change**: Run detection tests
4. **Recovery plan**: Use `git show HEAD~N:<path>` if needed

---

## Success Criteria

- [ ] Rule count reduced from 121 to ~81
- [ ] All detector tests pass
- [ ] No duplicate guidance across rules
- [ ] Each consolidated rule covers all patterns from merged rules
- [ ] Cross-references added where concepts overlap
