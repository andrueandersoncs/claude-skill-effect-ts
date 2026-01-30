// Rule: Never create a service without both *Live and *Test layers
// Example: Complete layer setup

import { Array, Context, Effect, Layer, Option, pipe, Ref, Schema } from "effect"
import { Email, sendRealEmail, User } from "../_fixtures.js"

interface EmailData {
  to: Email
  subject: string
  body: string
}

// ✅ Good: Service with both Live and Test layers
class EmailService extends Context.Tag("EmailService")<
  EmailService,
  {
    readonly send: (email: EmailData) => Effect.Effect<void>
    readonly getSentEmails: () => Effect.Effect<ReadonlyArray<EmailData>>
  }
>() {}

// Live layer
const EmailServiceLive = Layer.succeed(EmailService, {
  send: (email) => sendRealEmail(email),
  getSentEmails: () => Effect.succeed([]),
})

// Test layer with state tracking
const EmailServiceTest = Layer.effect(
  EmailService,
  Effect.gen(function* () {
    const sentEmails = yield* Ref.make<ReadonlyArray<EmailData>>([])

    return {
      send: (email: EmailData) => Ref.update(sentEmails, Array.append(email)),
      getSentEmails: () => Ref.get(sentEmails),
    }
  })
)

// Example test usage
const testSendWelcomeEmail = (user: User) =>
  Effect.gen(function* () {
    const service = yield* EmailService
    yield* service.send({
      to: user.email,
      subject: "Welcome",
      body: `Hello ${user.name}`,
    })
    const sent = yield* service.getSentEmails()
    const firstEmail = pipe(sent, Array.head, Option.getOrThrow)
    return firstEmail.to === user.email
  })

export { EmailService, EmailServiceLive, EmailServiceTest, testSendWelcomeEmail }
