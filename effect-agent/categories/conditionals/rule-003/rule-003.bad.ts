// Rule: Never use combined AND conditions (&&); define a Schema.Struct capturing all conditions and use Match.when with Schema.is
// Example: Matching multiple conditions with Schema.Struct (bad example)
// @rule-id: rule-003
// @category: conditionals
// @original-name: match-struct-conditions

interface UserInput {
	role: string;
	verified: boolean;
}

declare const user: UserInput;

// Bad: Using combined AND conditions instead of Schema.Struct with Match.when
const isVerifiedAdmin = (u: UserInput): boolean => {
	if (u.role === "admin" && u.verified) {
		return true;
	}
	return false;
};

export { isVerifiedAdmin, user };
