import type { Category } from "./types.js";

export const imperative: Category = {
  id: "imperative",
  name: "Imperative Constructs",
  patterns: [
    "if/else chains → Match.value + Match.when",
    "switch/case → Match.type + Match.tag",
    "Ternary operators (? :) → Match.value + Match.when",
    "for/while/do...while loops → Array.map/filter/reduce, Effect.forEach",
    "for...of/for...in → Array module functions",
    "Variable mutation (let, push, pop, splice) → Immutable operations",
  ],
};
