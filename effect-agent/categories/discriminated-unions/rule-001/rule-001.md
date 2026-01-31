# rule-001: match-tag-dispatch

**Category:** discriminated-unions
**Rule ID:** rule-001

## Rule

Never use if/else, switch/case, or direct ._tag access on discriminated unions; use Match.tag or Schema.is

## Description

This rule covers all aspects of discriminated union handling in Effect-TS:

1. **Simple event dispatch** - Use Match.tag instead of if/else chains
2. **Switch statements on ._tag** - Replace with Match.tag for exhaustive matching
3. **Extracting ._tag as a type** - Use the union type directly with Match.tag
4. **Type narrowing** - Use Schema.is() for single-variant checks

## Anti-Patterns Detected

- `if (value._tag === "...")` - Direct tag comparisons
- `switch (value._tag)` - Switch statements on discriminant
- `type T = Union["_tag"]` - Extracting tag type loses type safety
- Direct `._tag` property access outside of Schema.is or Match.tag

## Good Patterns

### Match.tag for exhaustive dispatch
```typescript
const handleEvent = Match.type<AppEvent>().pipe(
  Match.tag("UserCreated", (e) => notifyAdmin(e.userId)),
  Match.tag("UserDeleted", (e) => cleanupData(e.userId)),
  Match.tag("OrderPlaced", (e) => processOrderEvent(e.orderId)),
  Match.exhaustive,
);
```

### Match.when with Schema.is for type narrowing
```typescript
const getOrderStatus = (order: OrderStatus) =>
  Match.value(order).pipe(
    Match.when(Schema.is(Pending), () => "Awaiting shipment"),
    Match.when(Schema.is(Shipped), (o) => `Tracking: ${o.trackingNumber}`),
    Match.when(Schema.is(Delivered), (o) => `Delivered ${o.deliveredAt}`),
    Match.exhaustive,
  );
```

### Schema.is for single-variant checks
```typescript
const isUserCreated = Schema.is(UserCreated);
```

## Detection

See `rule-001.detector.ts` for the comprehensive detection logic.
