// Rule: Never test with partial coverage; combine layer() with it.effect.prop
// Example: Full property-based integration test
// @rule-id: rule-011
// @category: testing
// @original-name: layer-effect-prop

import { expect, layer } from "@effect/vitest";
import { Arbitrary, Array, Context, Effect, Layer, Option, pipe } from "effect";
import * as fc from "effect/FastCheck";
import {
	Order,
	type PaymentError,
	User,
	type UserId,
} from "../../_fixtures.js";

// Define test services
class UserApi extends Context.Tag("UserApi")<
	UserApi,
	{
		readonly getUser: (id: UserId) => Effect.Effect<User>;
	}
>() {}

class PaymentGateway extends Context.Tag("PaymentGateway")<
	PaymentGateway,
	{
		readonly charge: (amount: number) => Effect.Effect<void, PaymentError>;
	}
>() {}

// Test layers with generated data
const UserApiTest = Layer.effect(
	UserApi,
	Effect.sync(() => {
		const UserArb = Arbitrary.make(User);
		return {
			getUser: (_id: UserId) =>
				Effect.succeed(
					pipe(fc.sample(UserArb, 1), Array.head, Option.getOrThrow),
				),
		};
	}),
);

const PaymentGatewayTest = Layer.succeed(PaymentGateway, {
	charge: (_amount: number) => Effect.void,
});

// Combined test environment
const TestEnv = Layer.mergeAll(UserApiTest, PaymentGatewayTest);

// Process order function
const processOrder = (order: Order) =>
	Effect.gen(function* () {
		const gateway = yield* PaymentGateway;
		yield* gateway.charge(order.total);
		return { status: "completed" as const };
	});

// ✅ Good: 100% coverage with test layers + generated data
layer(TestEnv)("Order Processing", (it) => {
	it.effect.prop(
		"should process any valid order",
		{ order: Order },
		({ order }) =>
			Effect.gen(function* () {
				const result = yield* processOrder(order);
				expect(result.status).toBe("completed");
			}),
	);
});
