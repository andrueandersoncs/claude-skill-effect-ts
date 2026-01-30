// Rule: Never provide services ad-hoc; compose layers with Layer.mergeAll/provide
// Example: Building application layer stack

import { Effect, Layer } from "effect";
import {
	DatabaseLive,
	EmailServiceLive,
	HttpClientLive,
	LoggerLive,
	OrderRepositoryLive,
	OrderServiceLive,
	UserRepositoryLive,
	UserServiceLive,
} from "../_fixtures.js";

// ✅ Good: Compose layers bottom-up in a dedicated module

// Infrastructure layer (no dependencies)
const InfraLive = Layer.mergeAll(DatabaseLive, HttpClientLive, LoggerLive);

// Repository layer (depends on Infrastructure)
const RepositoriesLive = Layer.mergeAll(
	UserRepositoryLive,
	OrderRepositoryLive,
).pipe(Layer.provide(InfraLive));

// Service layer (depends on Repositories)
const ServicesLive = Layer.mergeAll(
	UserServiceLive,
	OrderServiceLive,
	EmailServiceLive,
).pipe(Layer.provide(RepositoriesLive));

// Application entry point
export const AppLive = ServicesLive;

// Usage at boundary
declare const program: Effect.Effect<void>;
const run = () => Effect.runPromise(program.pipe(Effect.provide(AppLive)));

export { run };
