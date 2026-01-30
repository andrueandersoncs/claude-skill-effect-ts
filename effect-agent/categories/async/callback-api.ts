// Rule: Never use new Promise(); use Effect.async for callback-based APIs
// Example: Converting callback-based API

import { Effect, Match, Predicate } from "effect"
import * as fs from "fs"

// ✅ Good: Effect.async for callback-based APIs
const readFileAsync = (path: string) =>
  Effect.async<Buffer, NodeJS.ErrnoException>((resume) => {
    fs.readFile(path, (err, data) =>
      resume(
        Match.value({ err, data }).pipe(
          Match.when({ err: Predicate.isNotNull }, ({ err }) =>
            Effect.fail(err!)
          ),
          Match.orElse(({ data }) => Effect.succeed(data!))
        )
      )
    )
  })

export { readFileAsync }
