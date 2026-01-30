// Rule: Never call external APIs directly; use a Context.Tag service
// Example: HTTP API call

import { Arbitrary } from "effect"
import { Array, Context, Effect, Layer, Option, pipe, Schema } from "effect"
import * as fc from "effect/FastCheck"
import { ApiError, User, UserId } from "../_fixtures.js"

// ✅ Good: Context.Tag service for external API
class UserApi extends Context.Tag("UserApi")<
  UserApi,
  {
    readonly getUser: (id: UserId) => Effect.Effect<User, ApiError>
    readonly updateUser: (user: User) => Effect.Effect<void, ApiError>
  }
>() {}

const processUser = (id: UserId) =>
  Effect.gen(function* () {
    const api = yield* UserApi
    const user = yield* api.getUser(id)
    return user
  })

// Live layer implementation
const UserApiLive = Layer.succeed(UserApi, {
  getUser: (id) =>
    Effect.gen(function* () {
      const url = `https://api.example.com/users/${id}`
      const response = yield* Effect.tryPromise({
        try: () => fetch(url),
        catch: (e) => new ApiError({ url, cause: e }),
      })
      const json = yield* Effect.tryPromise({
        try: () => response.json(),
        catch: (e) => new ApiError({ url, cause: e }),
      })
      return yield* Schema.decodeUnknown(User)(json).pipe(
        Effect.mapError((e) => new ApiError({ url, cause: e }))
      )
    }),
  updateUser: (user) =>
    Effect.gen(function* () {
      const url = `https://api.example.com/users/${user.id}`
      const response = yield* Effect.tryPromise({
        try: () =>
          fetch(url, {
            method: "PUT",
            body: JSON.stringify(user),
          }),
        catch: (e) => new ApiError({ url, cause: e }),
      })
      yield* Effect.tryPromise({
        try: () => response.json(),
        catch: (e) => new ApiError({ url, cause: e }),
      })
    }),
})

// Test layer implementation with Arbitrary
const UserApiTest = Layer.effect(
  UserApi,
  Effect.gen(function* () {
    const UserArb = Arbitrary.make(User)
    return {
      getUser: (_id: UserId): Effect.Effect<User, ApiError> =>
        pipe(
          Effect.sync(() => fc.sample(UserArb, 1)),
          Effect.flatMap((samples) =>
            pipe(
              Array.head(samples),
              Option.match({
                onNone: () => Effect.die("Failed to generate arbitrary user"),
                onSome: Effect.succeed,
              })
            )
          )
        ),
      updateUser: (_user: User): Effect.Effect<void, ApiError> => Effect.void,
    }
  })
)

export { UserApi, processUser, UserApiLive, UserApiTest }
