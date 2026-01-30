// Rule: Never create a service without both *Live and *Test layers
// Example: Complete layer setup (bad example)
// @rule-id: rule-006
// @category: services
// @original-name: live-and-test-layers

import { Context, Effect, Layer } from "effect";

interface Email {
	to: string;
	subject: string;
	body: string;
}

interface EmailServiceType {
	send: (email: Email) => Effect.Effect<void>;
}

const EmailService = Context.GenericTag<EmailServiceType>("EmailService");

declare const sendRealEmail: (email: Email) => Effect.Effect<void>;
declare const user: { email: string; name: string };
declare const sendWelcomeEmail: (user: {
	email: string;
	name: string;
}) => Effect.Effect<void, never, EmailServiceType>;

// ❌ Bad: Only has live implementation, no test layer
const EmailServiceLive = Layer.succeed(EmailService, {
	send: (email) => sendRealEmail(email),
});

// Tests hit real email service!
const testBad = () =>
	Effect.gen(function* () {
		yield* sendWelcomeEmail(user);
	}).pipe(Effect.provide(EmailServiceLive));

export { EmailServiceLive, testBad };
