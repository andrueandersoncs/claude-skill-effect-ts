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
      const response = yield* Effect.tryPromise({
        try: () => fetch(`https://api.example.com/users/${id}`).then((r) => r.json()),
        catch: (e) => new ApiError({ url: `https://api.example.com/users/${id}`, cause: e }),
      })
      return yield* Schema.decodeUnknown(User)(response).pipe(
        Effect.mapError((e) => new ApiError({ url: `https://api.example.com/users/${id}`, cause: e }))
      )
    }),
  updateUser: (user) =>
    Effect.tryPromise({
      try: () =>
        fetch(`https://api.example.com/users/${user.id}`, {
          method: "PUT",
          body: JSON.stringify(user),
        }).then(() => undefined),
      catch: (e) => new ApiError({ url: `https://api.example.com/users/${user.id}`, cause: e }),
    }),
})

// Test layer implementation with Arbitrary
const UserApiTest = Layer.effect(
  UserApi,
  Effect.sync(() => {
    const UserArb = Arbitrary.make(User)
    return {
      getUser: (_id: UserId): Effect.Effect<User, ApiError> =>
        Effect.succeed(
          pipe(fc.sample(UserArb, 1), Array.head, Option.getOrThrow)
        ),
      updateUser: (_user: User): Effect.Effect<void, ApiError> => Effect.void,
    }
  })
)

export { UserApi, processUser, UserApiLive, UserApiTest }
