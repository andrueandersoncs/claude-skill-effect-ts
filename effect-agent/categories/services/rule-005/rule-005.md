# rule-005: layer-implementation

**Category:** services
**Rule ID:** rule-005

## Rule

Never create services inline; use Layer.effect or Layer.succeed with proper Live/Test patterns

## Description

Comprehensive layer implementation patterns including:
- Layer.effect for services with dependencies
- Layer.succeed for simple services
- Live layers for production implementations
- Test layers for testing with mocked/in-memory implementations
- Stateful test layers using Ref for state management

## Good Pattern

See `rule-005.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-005.detector.ts` file.
