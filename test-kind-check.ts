import { Schema } from "effect";

// Create a schema for checking if kind is a number
const KindNumberSchema = Schema.Number;

// Test with direct use
const obj = { kind: 263 };
const result = Schema.is(KindNumberSchema)(obj.kind);
console.log("Is kind (263) a number?", result);

// In a type predicate
const isKindNumber = (u: unknown): u is { kind: number } & Record<string, unknown> => {
  if (typeof u === "object" && u !== null && "kind" in u) {
    return Schema.is(Schema.Number)(u.kind);
  }
  return false;
};

const testObj = { kind: 263, other: "data" };
const testObj2 = { kind: "not a number" };

console.log("testObj has kind as number:", isKindNumber(testObj));
console.log("testObj2 has kind as number:", isKindNumber(testObj2));
