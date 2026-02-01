
import { Effect } from 'effect';

const x = Effect.gen(function* () {
  yield doSomething(); // Wrong - missing *
  yield* getValue(); // Correct
});
