import type { Category } from "./types.js";

export const tagAccess: Category = {
  id: "tag-access",
  name: "Direct ._tag Access",
  patterns: [
    'if (x._tag === "Foo") → Match.tag("Foo", ...) or Schema.is(Foo)',
    "x._tag === in predicates → Schema.is(Foo) as predicate",
    'type FooTag = Foo["_tag"] → Never extract _tag as type',
    'array.filter(x => x._tag === "Foo") → array.filter(Schema.is(Foo))',
  ],
};
