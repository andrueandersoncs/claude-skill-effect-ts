// Rule: Never use Effect.runPromise except at application boundaries
// Example: HTTP handler (boundary OK)

import { Effect, Either } from "effect"
import { AppLive, ErrorResponse, getUser, UserId } from "../_fixtures.js"

// Type for Express-like request/response
interface Request {
  params: { id: string }
}
interface Response {
  status: (code: number) => Response
  json: (data: unknown) => void
}
interface App {
  get: (path: string, handler: (req: Request, res: Response) => void) => void
}

declare const app: App

// ✅ Good: Effect.runPromise at HTTP handler boundary with Either
app.get("/users/:id", async (req, res) => {
  const result = await Effect.runPromise(
    getUser(req.params.id as UserId).pipe(Effect.provide(AppLive), Effect.either)
  )

  Either.match(result, {
    onLeft: (error) =>
      res.status(500).json(new ErrorResponse({ error: error.userId })),
    onRight: (user) => res.json(user),
  })
})

export { app }
