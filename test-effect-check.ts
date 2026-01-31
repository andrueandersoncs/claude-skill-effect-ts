// Test file with known violations
import { Option } from "effect";

const x = null;
Option.fromNullable(x).pipe(
  Option.match({
    onNone: () => {
      console.log("null check - should use Match");
    },
    onSome: (value) => {
      // Handle non-null case
    }
  })
);

for (let i = 0; i < 10; i++) {
  console.log(i); // loop - should use Array methods
}

const result = x ? "yes" : "no"; // ternary - should use Match
