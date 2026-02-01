import * as ts from "typescript";

// Current implementation - type guard returns boolean
const isCallExpressionV1 = (node: ts.Node): node is ts.CallExpression => {
  return ts.isCallExpression(node);
};

// PROBLEM: Using Match would require Effect return type
// But Match returns Effect, not a type predicate
// const isCallExpressionV2 = (node: ts.Node): node is ts.CallExpression => {
//   return Match.value(node).pipe(
//     Match.when(ts.isCallExpression, () => true),
//     Match.orElse(() => false),
//   ); // ERROR: Effect<boolean> is not assignable to boolean
// };

// The type predicate requires DIRECT boolean, not Effect
const testUsage = (n: ts.Node) => {
  if (isCallExpressionV1(n)) {
    // After this check, TypeScript knows n is CallExpression
    // This is a key feature of type guards - they narrow the type
    const expr: ts.CallExpression = n;
  }
};

console.log("Type guard constraint confirmed: type predicates REQUIRE boolean return, not Effect");
