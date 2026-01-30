// Rule: Never call third-party SDKs directly; wrap in a Context.Tag service
// Example: Third-party SDK usage (Stripe, SendGrid, AWS, etc.)
// @rule-id: rule-008
// @category: services
// @original-name: wrap-third-party-sdk

import {
	Arbitrary,
	Array,
	Config,
	Context,
	Effect,
	Layer,
	Option,
	pipe,
	Schema,
} from "effect";
import * as fc from "effect/FastCheck";
import {
	type ChargeId,
	ChargeResult,
	PaymentError,
	RefundError,
} from "../_fixtures.js";

// Stripe SDK stub
interface Stripe {
	charges: {
		create: (params: { amount: number; currency: string }) => Promise<{
			id: string;
			amount: number;
			currency: string;
			status: string;
		}>;
	};
	refunds: {
		create: (params: { charge: string }) => Promise<unknown>;
	};
}
declare const StripeConstructor: new (key: string) => Stripe;

// ✅ Good: Context.Tag service for third-party SDK
class PaymentGateway extends Context.Tag("PaymentGateway")<
	PaymentGateway,
	{
		readonly charge: (
			amount: number,
			currency: string,
		) => Effect.Effect<ChargeResult, PaymentError>;
		readonly refund: (chargeId: ChargeId) => Effect.Effect<void, RefundError>;
	}
>() {}

// Live layer
const PaymentGatewayLive = Layer.effect(
	PaymentGateway,
	Effect.gen(function* () {
		const config = yield* Config.string("STRIPE_KEY");
		const stripe = new StripeConstructor(config);

		return {
			charge: (amount, currency) =>
				Effect.gen(function* () {
					const response = yield* Effect.tryPromise({
						try: () => stripe.charges.create({ amount, currency }),
						catch: (e) => new PaymentError({ cause: e }),
					});
					return yield* Schema.decodeUnknown(ChargeResult)(response).pipe(
						Effect.mapError((e) => new PaymentError({ cause: e })),
					);
				}),
			refund: (chargeId) =>
				Effect.tryPromise({
					try: () => stripe.refunds.create({ charge: chargeId }),
					catch: (e) => new RefundError({ cause: e }),
				}).pipe(Effect.asVoid),
		};
	}),
);

// Test layer
const PaymentGatewayTest = Layer.effect(
	PaymentGateway,
	Effect.sync(() => {
		const ChargeResultArb = Arbitrary.make(ChargeResult);
		return {
			charge: (
				_amount: number,
				_currency: string,
			): Effect.Effect<ChargeResult, PaymentError> =>
				Effect.succeed(
					pipe(fc.sample(ChargeResultArb, 1), Array.head, Option.getOrThrow),
				),
			refund: (_chargeId: ChargeId): Effect.Effect<void, RefundError> =>
				Effect.void,
		};
	}),
);

// Usage
const processPayment = (amount: number) =>
	Effect.gen(function* () {
		const gateway = yield* PaymentGateway;
		return yield* gateway.charge(amount, "usd");
	});

export {
	PaymentGateway,
	PaymentGatewayLive,
	PaymentGatewayTest,
	processPayment,
};
