import { Function, Option } from "effect";

const x = null;

Option.fromNullable(x).pipe(
  Option.match({
    onNone: () => console.log("null check - should use Match"),
    onSome: Function.constant(undefined),
  })
);
