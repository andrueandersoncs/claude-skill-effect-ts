// Rule: Never use Match.tag when you need class methods; use Schema.is()
// Example: Choosing between Schema.is() and Match.tag

import { Match, Schema } from "effect"
import { Circle, Rectangle, Shape } from "../_fixtures.js"

// ✅ Good: Match.tag - when you just need the data
const getShapeName = (shape: Shape) =>
  Match.value(shape).pipe(
    Match.tag("Circle", () => "circle"),
    Match.tag("Rectangle", () => "rectangle"),
    Match.exhaustive
  )

// ✅ Good: Schema.is() - when you need class methods or rich type narrowing
const processShape = (shape: Shape) =>
  Match.value(shape).pipe(
    Match.when(Schema.is(Circle), (c) => c.area), // Can use .area method
    Match.when(Schema.is(Rectangle), (r) => r.area), // Can use .area method
    Match.exhaustive
  )

export { getShapeName, processShape }
