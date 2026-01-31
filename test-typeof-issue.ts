import { Schema } from "effect";

// Current approach: using typeof
const checkTypeOfNumber = (val: unknown): boolean => {
  return typeof val === "number";
};

// Try to create a schema for "number"
const NumberSchema = Schema.Number;

// Test Schema.is
const checkSchemaIsNumber = (val: unknown): boolean => {
  return Schema.is(NumberSchema)(val);
};

// Test in type predicate context
const isNumberTypeGuard = (u: unknown): u is number => {
  return Schema.is(NumberSchema)(u);
};

// Test values
const testVal1 = 42;
const testVal2 = "hello";

console.log("typeof check for 42:", checkTypeOfNumber(testVal1));
console.log("typeof check for 'hello':", checkTypeOfNumber(testVal2));
console.log("Schema.is check for 42:", checkSchemaIsNumber(testVal1));
console.log("Schema.is check for 'hello':", checkSchemaIsNumber(testVal2));
console.log("Type guard for 42:", isNumberTypeGuard(testVal1));
console.log("Type guard for 'hello':", isNumberTypeGuard(testVal2));
