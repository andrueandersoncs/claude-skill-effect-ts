# Schema Violations

ALL data types MUST be defined as Schema. Use Schema.Class for entities with methods, Schema.TaggedClass for discriminated unions, tagged unions over optional properties. NEVER use Schema.Any/Schema.Unknown except for genuinely unconstrained values.
