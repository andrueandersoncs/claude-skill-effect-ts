// Test file with known violations
const x = null;
if (x === null) {
  console.log("null check - should use Match");
}

Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
  console.log(i); // loop - should use Array methods
});

const result = x ? "yes" : "no"; // ternary - should use Match
