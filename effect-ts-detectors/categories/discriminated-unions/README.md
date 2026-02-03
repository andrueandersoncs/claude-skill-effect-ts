# Discriminated Union Handling

NEVER access ._tag directly. Use Schema.is() for type guards on Schema types, Match.tag for exhaustive handling. Direct ._tag access, type extraction, and array predicates using ._tag are all FORBIDDEN.
