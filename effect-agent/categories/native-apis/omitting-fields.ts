// Rule: Never use destructuring to omit fields; use Struct.omit
// Example: Omitting fields

import { Struct } from "effect"

interface UserWithSecrets {
  id: string
  name: string
  password: string
  ssn: string
}

declare const user: UserWithSecrets

// ✅ Good: Struct.omit for removing fields
const publicUser = Struct.omit(user, "password", "ssn")

export { publicUser }
