import { Schema } from "effect";

const buildViolation = (data: unknown): Violation => {
  try {
    const result = Schema.validate(ValidViolationUnion)(data);
    if (result._tag === "Failure") {
      throw new Error("Invalid violation data");
    }
    return result.value;
  } catch {
    throw new Error("Invalid violation data structure");
  }
};

export { buildViolation };
