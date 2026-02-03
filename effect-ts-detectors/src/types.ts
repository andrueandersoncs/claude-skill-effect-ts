/**
 * Rule violation detection types - Schema-based
 */

import { Schema } from "effect";

export const SNIPPET_MAX_LENGTH = 200;

export const ViolationCertainty = Schema.Literal("definite", "potential");
export type ViolationCertainty = typeof ViolationCertainty.Type;

export const ViolationCategory = Schema.Literal(
	"async",
	"code-style",
	"comments",
	"conditionals",
	"discriminated-unions",
	"errors",
	"imperative",
	"native-apis",
	"schema",
	"services",
	"testing",
);
export type ViolationCategory = typeof ViolationCategory.Type;

const makeViolationFields = <C extends ViolationCategory>(category: C) => ({
	ruleId: Schema.String,
	category: Schema.Literal(category),
	message: Schema.String,
	filePath: Schema.String,
	// 1-indexed to match editor conventions
	line: Schema.Number,
	// 1-indexed to match editor conventions
	column: Schema.Number,
	snippet: Schema.String,
	certainty: ViolationCertainty,
	suggestion: Schema.optional(Schema.String),
});

export class AsyncViolation extends Schema.TaggedClass<AsyncViolation>()(
	"AsyncViolation",
	makeViolationFields("async"),
) {}

export class CodeStyleViolation extends Schema.TaggedClass<CodeStyleViolation>()(
	"CodeStyleViolation",
	makeViolationFields("code-style"),
) {}

export class CommentsViolation extends Schema.TaggedClass<CommentsViolation>()(
	"CommentsViolation",
	makeViolationFields("comments"),
) {}

export class ConditionalsViolation extends Schema.TaggedClass<ConditionalsViolation>()(
	"ConditionalsViolation",
	makeViolationFields("conditionals"),
) {}

export class DiscriminatedUnionsViolation extends Schema.TaggedClass<DiscriminatedUnionsViolation>()(
	"DiscriminatedUnionsViolation",
	makeViolationFields("discriminated-unions"),
) {}

export class ErrorsViolation extends Schema.TaggedClass<ErrorsViolation>()(
	"ErrorsViolation",
	makeViolationFields("errors"),
) {}

export class ImperativeViolation extends Schema.TaggedClass<ImperativeViolation>()(
	"ImperativeViolation",
	makeViolationFields("imperative"),
) {}

export class NativeApisViolation extends Schema.TaggedClass<NativeApisViolation>()(
	"NativeApisViolation",
	makeViolationFields("native-apis"),
) {}

export class SchemaViolation extends Schema.TaggedClass<SchemaViolation>()(
	"SchemaViolation",
	makeViolationFields("schema"),
) {}

export class ServicesViolation extends Schema.TaggedClass<ServicesViolation>()(
	"ServicesViolation",
	makeViolationFields("services"),
) {}

export class TestingViolation extends Schema.TaggedClass<TestingViolation>()(
	"TestingViolation",
	makeViolationFields("testing"),
) {}

export const Violation = Schema.Union(
	AsyncViolation,
	CodeStyleViolation,
	CommentsViolation,
	ConditionalsViolation,
	DiscriminatedUnionsViolation,
	ErrorsViolation,
	ImperativeViolation,
	NativeApisViolation,
	SchemaViolation,
	ServicesViolation,
	TestingViolation,
);
export type Violation = typeof Violation.Type;

export class DetectorResult extends Schema.Class<DetectorResult>(
	"DetectorResult",
)({
	filesAnalyzed: Schema.Number,
	violations: Schema.Array(Violation),
	errors: Schema.Array(
		Schema.Struct({ filePath: Schema.String, error: Schema.String }),
	),
}) {}

// Must remain an interface because Schema.Class cannot represent methods
export interface CategoryDetector {
	category: string;
	description: string;
	detect: (filePath: string, sourceCode: string) => Violation[];
}

export class DetectorConfig extends Schema.Class<DetectorConfig>(
	"DetectorConfig",
)({
	include: Schema.Array(Schema.String),
	exclude: Schema.Array(Schema.String),
	// Empty array means all categories
	categories: Schema.Array(Schema.String),
	includePotential: Schema.Boolean,
}) {}

export const defaultConfig = new DetectorConfig({
	include: ["**/*.ts", "**/*.tsx"],
	exclude: ["**/node_modules/**", "**/*.d.ts", "**/dist/**"],
	categories: [],
	includePotential: true,
});
