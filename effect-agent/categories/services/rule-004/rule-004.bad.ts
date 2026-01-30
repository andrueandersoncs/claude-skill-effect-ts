// Rule: Never provide services ad-hoc; compose layers with Layer.mergeAll/provide
// Example: Building application layer stack (bad example)
// @rule-id: rule-004
// @category: services
// @original-name: layer-composition

import { Context, Effect } from "effect";

interface LoggerService {
	log: (msg: string) => Effect.Effect<void>;
}
interface UserRepoService {
	find: (id: string) => Effect.Effect<unknown>;
}
interface EmailServiceType {
	send: (to: string, msg: string) => Effect.Effect<void>;
}

const Logger = Context.GenericTag<LoggerService>("Logger");
const UserRepo = Context.GenericTag<UserRepoService>("UserRepo");
const EmailService = Context.GenericTag<EmailServiceType>("EmailService");

declare const loggerImpl: LoggerService;
declare const userRepoImpl: UserRepoService;
declare const emailImpl: EmailServiceType;

const myEffect = Effect.gen(function* () {
	const logger = yield* Logger;
	const repo = yield* UserRepo;
	const email = yield* EmailService;
	yield* logger.log("Starting");
	const user = yield* repo.find("123");
	yield* email.send("test@example.com", "Found user");
	return user;
});

// ❌ Bad: Providing services ad-hoc throughout codebase
const runBad = () =>
	Effect.gen(function* () {
		const result = yield* myEffect.pipe(
			Effect.provideService(Logger, loggerImpl),
			Effect.provideService(UserRepo, userRepoImpl),
			Effect.provideService(EmailService, emailImpl),
		);
		return result;
	});

export { runBad };
