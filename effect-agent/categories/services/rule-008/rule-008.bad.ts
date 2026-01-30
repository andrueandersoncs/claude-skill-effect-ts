// Rule: Never call third-party SDKs directly; wrap in a Context.Tag service
// Example: Third-party SDK usage (Stripe, SendGrid, AWS, etc.) (bad example)
// @rule-id: rule-008
// @category: services
// @original-name: wrap-third-party-sdk

import { Effect } from "effect";

interface StripeClient {
	charges: {
		create: (params: {
			amount: number;
			currency: string;
		}) => Promise<{ id: string }>;
	};
}

declare const Stripe: new (key: string | undefined) => StripeClient;

const stripe = new Stripe(process.env["STRIPE_KEY"]);

// ❌ Bad: Direct SDK call in business logic - untestable!
const processPayment = (amount: number) =>
	Effect.tryPromise(() => stripe.charges.create({ amount, currency: "usd" }));

export { processPayment };
