/**
 * Shared fixtures for Effect-TS examples
 *
 * These declarations provide typed stubs for external dependencies
 * used across rule examples. They ensure examples type-check without
 * requiring actual implementations.
 */

import { Context, Effect, Layer, Schema } from "effect";

// =============================================================================
// Branded IDs
// =============================================================================

export const UserId = Schema.String.pipe(Schema.brand("UserId"));
export type UserId = typeof UserId.Type;

export const OrderId = Schema.String.pipe(Schema.brand("OrderId"));
export type OrderId = typeof OrderId.Type;

export const OperationId = Schema.String.pipe(Schema.brand("OperationId"));
export type OperationId = typeof OperationId.Type;

export const RecordId = Schema.String.pipe(Schema.brand("RecordId"));
export type RecordId = typeof RecordId.Type;

export const ChargeId = Schema.String.pipe(Schema.brand("ChargeId"));
export type ChargeId = typeof ChargeId.Type;

export const TrackingNumber = Schema.String.pipe(
	Schema.brand("TrackingNumber"),
);
export type TrackingNumber = typeof TrackingNumber.Type;

// =============================================================================
// Validated Types
// =============================================================================

export const Email = Schema.String.pipe(Schema.pattern(/^[^@]+@[^@]+\.[^@]+$/));
export type Email = typeof Email.Type;

export const Age = Schema.Number.pipe(
	Schema.int(),
	Schema.between(0, 150),
	Schema.annotations({ identifier: "Age" }),
);
export type Age = typeof Age.Type;

// =============================================================================
// Domain Classes
// =============================================================================

export class User extends Schema.Class<User>("User")({
	id: UserId,
	name: Schema.NonEmptyString,
	email: Email,
	role: Schema.optional(Schema.Literal("admin", "user")),
	active: Schema.optional(Schema.Boolean),
	age: Schema.optional(Age),
	verified: Schema.optional(Schema.Boolean),
}) {}

export class OrderItem extends Schema.Class<OrderItem>("OrderItem")({
	id: Schema.String,
	price: Schema.Number,
	quantity: Schema.Number,
}) {}

export class Order extends Schema.Class<Order>("Order")({
	id: OrderId,
	userId: UserId,
	items: Schema.Array(Schema.String),
	total: Schema.Number,
	status: Schema.optional(Schema.Literal("pending", "completed", "cancelled")),
	isPremium: Schema.optional(Schema.Boolean),
}) {}

// =============================================================================
// Tagged Classes for State Machines
// =============================================================================

export class Pending extends Schema.TaggedClass<Pending>()("Pending", {
	orderId: OrderId,
	items: Schema.Array(Schema.String),
}) {}

export class Shipped extends Schema.TaggedClass<Shipped>()("Shipped", {
	orderId: OrderId,
	items: Schema.Array(Schema.String),
	trackingNumber: TrackingNumber,
	shippedAt: Schema.Date,
}) {}

export class Delivered extends Schema.TaggedClass<Delivered>()("Delivered", {
	orderId: OrderId,
	items: Schema.Array(Schema.String),
	deliveredAt: Schema.Date,
}) {}

export const OrderStatus = Schema.Union(Pending, Shipped, Delivered);
export type OrderStatus = typeof OrderStatus.Type;

// =============================================================================
// Event Types
// =============================================================================

export class UserCreated extends Schema.TaggedClass<UserCreated>()(
	"UserCreated",
	{
		userId: UserId,
		email: Email,
	},
) {}

export class UserDeleted extends Schema.TaggedClass<UserDeleted>()(
	"UserDeleted",
	{
		userId: UserId,
	},
) {}

export class OrderPlaced extends Schema.TaggedClass<OrderPlaced>()(
	"OrderPlaced",
	{
		orderId: OrderId,
		userId: UserId,
	},
) {}

export const AppEvent = Schema.Union(UserCreated, UserDeleted, OrderPlaced);
export type AppEvent = typeof AppEvent.Type;

// =============================================================================
// Shape Types (for Match examples)
// =============================================================================

export class Circle extends Schema.TaggedClass<Circle>()("Circle", {
	radius: Schema.Number,
}) {
	get area(): number {
		return Math.PI * this.radius * this.radius;
	}
}

export class Rectangle extends Schema.TaggedClass<Rectangle>()("Rectangle", {
	width: Schema.Number,
	height: Schema.Number,
}) {
	get area(): number {
		return this.width * this.height;
	}
}

export const Shape = Schema.Union(Circle, Rectangle);
export type Shape = typeof Shape.Type;

// =============================================================================
// Error Types
// =============================================================================

export class UserNotFound extends Schema.TaggedError<UserNotFound>()(
	"UserNotFound",
	{
		userId: UserId,
	},
) {}

export class OrderNotFound extends Schema.TaggedError<OrderNotFound>()(
	"OrderNotFound",
	{
		orderId: OrderId,
	},
) {}

export class ValidationError extends Schema.TaggedError<ValidationError>()(
	"ValidationError",
	{
		field: Schema.String,
		message: Schema.String,
	},
) {}

export class NotFoundError extends Schema.TaggedError<NotFoundError>()(
	"NotFoundError",
	{
		resource: Schema.String,
		id: Schema.String,
	},
) {}

export class ApiError extends Schema.TaggedError<ApiError>()("ApiError", {
	url: Schema.String,
	cause: Schema.Unknown,
}) {}

export class DatabaseError extends Schema.TaggedError<DatabaseError>()(
	"DatabaseError",
	{
		cause: Schema.Unknown,
	},
) {}

export class NetworkError extends Schema.TaggedError<NetworkError>()(
	"NetworkError",
	{
		cause: Schema.Unknown,
	},
) {}

export class TimeoutError extends Schema.TaggedError<TimeoutError>()(
	"TimeoutError",
	{
		operation: Schema.String,
	},
) {}

export class FileError extends Schema.TaggedError<FileError>()("FileError", {
	path: Schema.String,
	cause: Schema.Unknown,
}) {}

export class PaymentError extends Schema.TaggedError<PaymentError>()(
	"PaymentError",
	{
		cause: Schema.Unknown,
	},
) {}

export class RefundError extends Schema.TaggedError<RefundError>()(
	"RefundError",
	{
		cause: Schema.Unknown,
	},
) {}

export class LibraryError extends Schema.TaggedError<LibraryError>()(
	"LibraryError",
	{
		cause: Schema.Unknown,
	},
) {}

export class FetchError extends Schema.TaggedError<FetchError>()("FetchError", {
	cause: Schema.Unknown,
}) {}

export class BadRequest extends Schema.TaggedError<BadRequest>()("BadRequest", {
	message: Schema.String,
}) {}

export class ElementNotFound extends Schema.TaggedError<ElementNotFound>()(
	"ElementNotFound",
	{
		id: Schema.String,
	},
) {}

export class InvalidOrderJson extends Schema.TaggedError<InvalidOrderJson>()(
	"InvalidOrderJson",
	{
		data: Schema.String,
	},
) {}

export class SaveOrderError extends Schema.TaggedError<SaveOrderError>()(
	"SaveOrderError",
	{
		orderId: OrderId,
		cause: Schema.Unknown,
	},
) {}

export class OrderCancelled extends Schema.TaggedError<OrderCancelled>()(
	"OrderCancelled",
	{
		orderId: OrderId,
	},
) {}

export class InvalidTotal extends Schema.TaggedError<InvalidTotal>()(
	"InvalidTotal",
	{
		total: Schema.Number,
	},
) {}

export class FetchUserError extends Schema.TaggedError<FetchUserError>()(
	"FetchUserError",
	{
		userId: UserId,
		cause: Schema.Unknown,
	},
) {}

export class RawNetworkError extends Schema.TaggedError<RawNetworkError>()(
	"RawNetworkError",
	{
		cause: Schema.Unknown,
	},
) {}

// =============================================================================
// Result Types
// =============================================================================

export class ErrorResult extends Schema.TaggedClass<ErrorResult>()(
	"ErrorResult",
	{
		status: Schema.Literal("error"),
		message: Schema.String,
	},
) {}

export class SuccessResult extends Schema.TaggedClass<SuccessResult>()(
	"SuccessResult",
	{
		status: Schema.Literal("success"),
		user: User,
	},
) {}

export class ProcessedOrder extends Schema.Class<ProcessedOrder>(
	"ProcessedOrder",
)({
	order: Order,
	status: Schema.Literal("completed", "pending", "failed"),
}) {}

export class ChargeResult extends Schema.Class<ChargeResult>("ChargeResult")({
	id: ChargeId,
	amount: Schema.Number,
	currency: Schema.String,
	status: Schema.Literal("succeeded", "pending", "failed"),
}) {}

export class ErrorResponse extends Schema.Class<ErrorResponse>("ErrorResponse")(
	{
		error: Schema.String,
	},
) {}

// =============================================================================
// Services
// =============================================================================

export class Database extends Context.Tag("Database")<
	Database,
	{
		readonly query: <A>(
			sql: string,
			params?: ReadonlyArray<unknown>,
		) => Effect.Effect<A, DatabaseError>;
		readonly findUser: (id: UserId) => Effect.Effect<User, UserNotFound>;
	}
>() {}

export class UserApi extends Context.Tag("UserApi")<
	UserApi,
	{
		readonly getUser: (id: UserId) => Effect.Effect<User, ApiError>;
		readonly updateUser: (user: User) => Effect.Effect<void, ApiError>;
	}
>() {}

export class UserRepository extends Context.Tag("UserRepository")<
	UserRepository,
	{
		readonly findById: (id: UserId) => Effect.Effect<User, UserNotFound>;
		readonly findByEmail: (email: Email) => Effect.Effect<User, UserNotFound>;
		readonly save: (user: User) => Effect.Effect<void, DatabaseError>;
		readonly delete: (id: UserId) => Effect.Effect<void, DatabaseError>;
	}
>() {}

export class OrderRepository extends Context.Tag("OrderRepository")<
	OrderRepository,
	{
		readonly findById: (id: OrderId) => Effect.Effect<Order, OrderNotFound>;
		readonly save: (order: Order) => Effect.Effect<void, DatabaseError>;
	}
>() {}

export class UserService extends Context.Tag("UserService")<
	UserService,
	{
		readonly getUser: (id: UserId) => Effect.Effect<User, UserNotFound>;
	}
>() {}

export class OrderService extends Context.Tag("OrderService")<
	OrderService,
	{
		readonly getOrder: (id: OrderId) => Effect.Effect<Order, OrderNotFound>;
	}
>() {}

export class EmailService extends Context.Tag("EmailService")<
	EmailService,
	{
		readonly send: (email: {
			to: Email;
			subject: string;
			body: string;
		}) => Effect.Effect<void>;
		readonly getSentEmails: () => Effect.Effect<
			Array<{ to: Email; subject: string; body: string }>
		>;
	}
>() {}

export class FileSystem extends Context.Tag("FileSystem")<
	FileSystem,
	{
		readonly readFile: (path: string) => Effect.Effect<string, FileError>;
		readonly writeFile: (
			path: string,
			content: string,
		) => Effect.Effect<void, FileError>;
		readonly appendFile: (
			path: string,
			content: string,
		) => Effect.Effect<void, FileError>;
		readonly exists: (path: string) => Effect.Effect<boolean>;
	}
>() {}

export class PaymentGateway extends Context.Tag("PaymentGateway")<
	PaymentGateway,
	{
		readonly charge: (
			amount: number,
			currency: string,
		) => Effect.Effect<ChargeResult, PaymentError>;
		readonly refund: (chargeId: ChargeId) => Effect.Effect<void, RefundError>;
	}
>() {}

export class Cache extends Context.Tag("Cache")<
	Cache,
	{
		readonly get: <A>(key: string) => Effect.Effect<A | undefined>;
		readonly set: <A>(key: string, value: A) => Effect.Effect<void>;
	}
>() {}

export class Logger extends Context.Tag("Logger")<
	Logger,
	{
		readonly log: (message: string) => Effect.Effect<void>;
		readonly error: (message: string) => Effect.Effect<void>;
	}
>() {}

export class HttpClient extends Context.Tag("HttpClient")<
	HttpClient,
	{
		readonly get: <A>(url: string) => Effect.Effect<A, NetworkError>;
		readonly post: <A>(
			url: string,
			body: unknown,
		) => Effect.Effect<A, NetworkError>;
	}
>() {}

// =============================================================================
// Layer Stubs (for examples that need AppLive reference)
// =============================================================================

export const DatabaseLive: Layer.Layer<Database> = Layer.succeed(Database, {
	query: () => Effect.die("Not implemented"),
	findUser: () => Effect.die("Not implemented"),
});

export const UserRepositoryLive: Layer.Layer<UserRepository, never, Database> =
	Layer.succeed(UserRepository, {
		findById: () => Effect.die("Not implemented"),
		findByEmail: () => Effect.die("Not implemented"),
		save: () => Effect.die("Not implemented"),
		delete: () => Effect.die("Not implemented"),
	});

export const OrderRepositoryLive: Layer.Layer<
	OrderRepository,
	never,
	Database
> = Layer.succeed(OrderRepository, {
	findById: () => Effect.die("Not implemented"),
	save: () => Effect.die("Not implemented"),
});

export const UserServiceLive: Layer.Layer<UserService, never, UserRepository> =
	Layer.succeed(UserService, {
		getUser: () => Effect.die("Not implemented"),
	});

export const OrderServiceLive: Layer.Layer<
	OrderService,
	never,
	OrderRepository
> = Layer.succeed(OrderService, {
	getOrder: () => Effect.die("Not implemented"),
});

export const EmailServiceLive: Layer.Layer<EmailService> = Layer.succeed(
	EmailService,
	{
		send: () => Effect.die("Not implemented"),
		getSentEmails: () => Effect.die("Not implemented"),
	},
);

export const HttpClientLive: Layer.Layer<HttpClient> = Layer.succeed(
	HttpClient,
	{
		get: () => Effect.die("Not implemented"),
		post: () => Effect.die("Not implemented"),
	},
);

export const LoggerLive: Layer.Layer<Logger> = Layer.succeed(Logger, {
	log: () => Effect.die("Not implemented"),
	error: () => Effect.die("Not implemented"),
});

export const CacheLive: Layer.Layer<Cache> = Layer.succeed(Cache, {
	get: () => Effect.die("Not implemented"),
	set: () => Effect.die("Not implemented"),
});

// Combined application layer for examples
export const AppLive = Layer.mergeAll(
	DatabaseLive,
	HttpClientLive,
	LoggerLive,
	CacheLive,
);

// =============================================================================
// Helper Types for Examples
// =============================================================================

export interface Item {
	id: string;
	key: string;
	value: number;
	price: number;
	quantity: number;
	active: boolean;
}

export interface Post {
	id: string;
	tags: ReadonlyArray<string>;
}

export interface TreeNode {
	value: unknown;
	children: ReadonlyArray<TreeNode>;
}

export type Result = unknown;
export type Data = unknown;

// =============================================================================
// Stub Functions (declared for examples)
// =============================================================================

export declare const getUser: (id: UserId) => Effect.Effect<User, UserNotFound>;
export declare const getOrder: (
	id: OrderId,
) => Effect.Effect<Order, OrderNotFound>;
export declare const getOrders: (
	userId: UserId,
) => Effect.Effect<ReadonlyArray<Order>>;
export declare const validateOrder: (
	order: Order,
) => Effect.Effect<Order, ValidationError>;
export declare const saveOrder: (order: Order) => Promise<Order>;
export declare const processItem: <A>(item: A) => Effect.Effect<A>;
export declare const processLeaf: (node: TreeNode) => Effect.Effect<Result>;
export declare const combineResults: (
	results: ReadonlyArray<Result>,
) => Effect.Effect<Result>;
export declare const fetchData: () => Effect.Effect<{
	items: ReadonlyArray<Item>;
}>;
export declare const fetchFromPrimary: () => Effect.Effect<
	unknown,
	NetworkError
>;
export declare const fetchFromBackup: () => Effect.Effect<
	unknown,
	NetworkError
>;
export declare const processOrder: (
	order: Order,
) => Effect.Effect<ProcessedOrder, OrderNotFound | ValidationError>;
export declare const pollForUpdates: Effect.Effect<void>;
export declare const notifyAdmin: (userId: UserId) => Effect.Effect<void>;
export declare const cleanupData: (userId: UserId) => Effect.Effect<void>;
export declare const processOrderEvent: (
	orderId: OrderId,
) => Effect.Effect<void>;
export declare const logEvent: (event: AppEvent) => Effect.Effect<void>;
export declare const sendEmail: (email: Email) => Effect.Effect<void>;
export declare const sendWelcomeEmail: (user: User) => Effect.Effect<void>;
export declare const calculateTotal: (price: number) => Effect.Effect<number>;
export declare const validate: <A>(
	value: A,
) => Effect.Effect<A, ValidationError>;
export declare const transform: <A>(value: A) => A;
export declare const parse: (input: string) => unknown;
export declare const isValidEmail: (email: string) => boolean;
export declare const myTransform: <A>(value: A) => A;
export declare const shouldTransform: boolean;
export declare const defaultUser: User;
export declare const defaultItem: Item;
export declare const defaultOrder: Order;
export declare const sendRealEmail: (email: {
	to: Email;
	subject: string;
	body: string;
}) => Effect.Effect<void>;
export declare const acquireDbConnection: Effect.Effect<
	{ query: (sql: string) => Effect.Effect<unknown> },
	never,
	never
>;
export declare const createUser: (data: unknown) => Effect.Effect<User>;
export declare const processData: (data: unknown) => unknown;
export declare const compatibleFunction: (
	input: unknown,
) => Effect.Effect<unknown>;
export declare const someFunction: () => unknown;
export declare const processResult: (result: unknown) => unknown;
export declare const processValidOrder: (order: Order) => Effect.Effect<Order>;
