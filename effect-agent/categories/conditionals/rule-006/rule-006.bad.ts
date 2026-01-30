// Rule: Never use null checks (if x != null); use Option.match
// Example: Effectful handling of nullable (bad example)
// @rule-id: rule-006
// @category: conditionals
// @original-name: nullable-option-match

interface UserInput {
	email: string;
}

declare const maybeUser: UserInput | null;
declare function sendEmail(email: string): Promise<void>;

// Bad: Using null checks instead of Option.match
const notifyUser = async (user: UserInput | null): Promise<void> => {
	if (user != null) {
		await sendEmail(user.email);
	} else {
		console.log("No user to notify");
	}
};

export { notifyUser, maybeUser };
