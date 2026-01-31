# rule-005: schema-class

**Category:** schema
**Rule ID:** rule-005

## Rule

Use Schema.Class for data structures: prefer it over TypeScript types/interfaces, use it with methods instead of Schema.Struct, and always use class constructors.

## Description

This comprehensive rule covers proper Schema.Class usage:

1. **Data Structure Definition**: Never use TypeScript `type` or `interface` for data structures; use `Schema.Class` or `Schema.TaggedClass` for runtime validation
2. **Entities with Methods**: Never use `Schema.Struct` for entities that need methods; use `Schema.Class` with class methods
3. **Instance Construction**: Never construct object literals with type assertions; use Schema class constructors (`new ClassName()` or `ClassName.make()`)

## Bad Patterns

### Using TypeScript types/interfaces
```typescript
// Bad: No runtime validation
type User = { id: string; name: string; };
interface Order { orderId: string; items: string[]; }
```

### Using Schema.Struct with separate functions
```typescript
// Bad: Loses encapsulation
const Order = Schema.Struct({ items: Schema.Array(OrderItem), discount: Schema.Number });
const getTotal = (order: Order) => order.items.reduce((sum, i) => sum + i.price, 0);
```

### Using object literals instead of constructors
```typescript
// Bad: Bypasses validation
const user: User = { id: "123", name: "Alice" };
const order = { orderId: "456", items: [] } satisfies Order;
```

## Good Pattern

See `rule-005.ts` for the correct implementation pattern.

```typescript
// Good: Schema.Class with runtime validation, methods, and proper construction
class Order extends Schema.Class<Order>("Order")({
  items: Schema.Array(OrderItem),
  discount: Schema.Number,
}) {
  get total() {
    return this.subtotal * (1 - this.discount);
  }
}

const order = new Order({ items: [...], discount: 0.1 });
```

## Detection

This rule can be detected by the `rule-005.detector.ts` file. It detects:
- TypeScript interface declarations
- Type aliases with object literal types
- Schema.Struct with methods added separately
- Functions that operate on Schema.Struct types
- Object literals cast as Schema class types
- Object literals with `satisfies` for Schema classes
