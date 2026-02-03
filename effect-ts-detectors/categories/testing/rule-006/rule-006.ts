// Rule: Use property-based testing with Schema: it.prop, it.effect.prop, and Arbitrary.make
// Example: Comprehensive property-based testing patterns
// @rule-id: rule-006
// @category: testing
// @original-name: property-based-testing

import { expect, it, layer } from "@effect/vitest";
import {
	Arbitrary,
	Array,
	Context,
	Effect,
	Layer,
	Option,
	pipe,
	Schema,
} from "effect";
import * as fc from "effect/FastCheck";
import {
	Order,
	type PaymentError,
	processOrder,
	User,
	type UserId,
} from "../../_fixtures.js";

// === Pattern 1: Test Layer with Arbitrary-Generated Responses ===
// Instead of stubbing methods as "not implemented", generate valid responses

class UserService extends Context.Tag("UserService")<
	UserService,
	{
		readonly getUser: (id: UserId) => Effect.Effect<User>;
		readonly updateUser: (user: User) => Effect.Effect<void>;
		readonly deleteUser: (id: UserId) => Effect.Effect<void>;
	}
>() {}

// Good: Generate valid responses so all code paths can be exercised
const UserServiceTest = Layer.effect(
	UserService,
	Effect.sync(() => {
		const UserArb = Arbitrary.make(User);
		return {
			getUser: (_id: UserId) =>
				Effect.succeed(
					pipe(fc.sample(UserArb, 1), Array.head, Option.getOrThrow),
				),
			updateUser: (_user: User) => Effect.void,
			deleteUser: (_id: UserId) => Effect.void,
		};
	}),
);

// === Pattern 2: Property-Based Tests with Schema ===
// Use Schema types directly as arbitraries instead of raw fc.integer/fc.string

it.prop(
	"should be commutative",
	{ a: Schema.Int, b: Schema.Int },
	({ a, b }) => {
		expect(a + b).toBe(b + a);
	},
);

// === Pattern 3: Effect Property Tests ===
// Use it.effect.prop for async/Effect-based property tests

it.effect.prop(
	"should process all valid orders",
	{ order: Order },
	({ order }) =>
		Effect.gen(function* () {
			const result = yield* processOrder(order);
			expect(result).toBeDefined();
		}),
);

// === Pattern 4: Combining layer() with Property-Based Tests ===
// For full integration test coverage with services and generated data

class PaymentGateway extends Context.Tag("PaymentGateway")<
	PaymentGateway,
	{
		readonly charge: (amount: number) => Effect.Effect<void, PaymentError>;
	}
>() {}

const PaymentGatewayTest = Layer.succeed(PaymentGateway, {
	charge: (_amount: number) => Effect.void,
});

const TestEnv = Layer.mergeAll(UserServiceTest, PaymentGatewayTest);

const processOrderWithServices = (order: Order) =>
	Effect.gen(function* () {
		const gateway = yield* PaymentGateway;
		yield* gateway.charge(order.total);
		return { status: "completed" as const };
	});

// Good: 100% coverage with test layers + generated data
layer(TestEnv)("Order Processing", (it) => {
	it.effect.prop(
		"should process any valid order",
		{ order: Order },
		({ order }) =>
			Effect.gen(function* () {
				const result = yield* processOrderWithServices(order);
				expect(result.status).toBe("completed");
			}),
	);
});

export { UserServiceTest, PaymentGatewayTest, TestEnv };
