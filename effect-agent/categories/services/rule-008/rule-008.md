# rule-008: wrap-third-party-sdk

**Category:** services
**Rule ID:** rule-008

## Rule

Never call third-party SDKs directly; wrap in a Context.Tag service

## Description

Third-party SDK usage (Stripe, SendGrid, AWS, etc.)

## Good Pattern

See `rule-008.ts` for the correct implementation pattern.

## Detection

This rule can be detected by the `rule-008.detector.ts` file.
