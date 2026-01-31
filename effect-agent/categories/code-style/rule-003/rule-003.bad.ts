// Rule: Never use eslint-disable for any-type errors; use Schema
// Example: Using eslint-disable to suppress any-type errors (bad example)
// @rule-id: rule-003
// @category: code-style
// @original-name: eslint-disable-any-type

// BAD: Using eslint-disable to suppress any-type errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseJson = (input: string): any => JSON.parse(input);

// BAD: Disabling unsafe member access checks
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const getValue = (obj: unknown): string => (obj as { value: string }).value;

// BAD: Disabling unsafe assignment checks
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const data: unknown[] = JSON.parse("[]");

// BAD: Disabling unsafe call checks
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export const callUnknown = (fn: unknown) => (fn as () => void)();

// BAD: Disabling unsafe return checks
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
export const returnAny = (x: unknown) => x;
