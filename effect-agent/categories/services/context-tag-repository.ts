// Rule: Never access database directly; use a Context.Tag repository
// Example: Database operations

import { Arbitrary } from "@effect/schema"
import {
  Array,
  Context,
  Effect,
  HashMap,
  Layer,
  Option,
  pipe,
  Ref,
  Schema,
} from "effect"
import * as fc from "effect/FastCheck"
import { Database, DatabaseError, Email, User, UserId, UserNotFound } from "../_fixtures.js"

class UserNotFoundByEmail extends Schema.TaggedError<UserNotFoundByEmail>()(
  "UserNotFoundByEmail",
  { email: Email }
) {}

// ✅ Good: Context.Tag repository for database access
class UserRepository extends Context.Tag("UserRepository")<
  UserRepository,
  {
    readonly findById: (id: UserId) => Effect.Effect<User, UserNotFound>
    readonly findByEmail: (email: Email) => Effect.Effect<User, UserNotFoundByEmail>
    readonly save: (user: User) => Effect.Effect<void, DatabaseError>
    readonly delete: (id: UserId) => Effect.Effect<void, DatabaseError>
  }
>() {}

// Live layer implementation
const UserRepositoryLive = Layer.effect(
  UserRepository,
  Effect.gen(function* () {
    const db = yield* Database
    return {
      findById: (id) =>
        db.query<User>("SELECT * FROM users WHERE id = ?", [id]).pipe(
          Effect.mapError(() => new UserNotFound({ userId: id }))
        ),
      findByEmail: (email) =>
        db.query<User>("SELECT * FROM users WHERE email = ?", [email]).pipe(
          Effect.mapError(() => new UserNotFoundByEmail({ email }))
        ),
      save: (user) =>
        db.query("INSERT INTO users VALUES (?)", [user]).pipe(
          Effect.asVoid,
          Effect.mapError((e) => new DatabaseError({ cause: e }))
        ),
      delete: (id) =>
        db.query("DELETE FROM users WHERE id = ?", [id]).pipe(
          Effect.asVoid,
          Effect.mapError((e) => new DatabaseError({ cause: e }))
        ),
    }
  })
)

// Test layer implementation with in-memory store
const UserRepositoryTest = Layer.effect(
  UserRepository,
  Effect.gen(function* () {
    const store = yield* Ref.make(HashMap.empty<UserId, User>())

    return {
      findById: (id: UserId) =>
        Ref.get(store).pipe(
          Effect.flatMap((users) =>
            pipe(
              HashMap.get(users, id),
              Option.match({
                onNone: () => Effect.fail(new UserNotFound({ userId: id })),
                onSome: Effect.succeed,
              })
            )
          )
        ),
      findByEmail: (email: Email) =>
        Ref.get(store).pipe(
          Effect.flatMap((users) =>
            pipe(
              HashMap.values(users),
              Array.fromIterable,
              Array.findFirst((u) => u.email === email),
              Option.match({
                onNone: () => Effect.fail(new UserNotFoundByEmail({ email })),
                onSome: Effect.succeed,
              })
            )
          )
        ),
      save: (user: User) => Ref.update(store, HashMap.set(user.id, user)),
      delete: (id: UserId) => Ref.update(store, HashMap.remove(id)),
    }
  })
)

export { UserRepository, UserRepositoryLive, UserRepositoryTest }
