// Rule: Never use if/else on ._tag; use Match.tag for discriminated unions
// Example: Simple event dispatch (bad example)
// @rule-id: rule-001
// @category: discriminated-unions
// @original-name: match-tag-dispatch

import type { AppEvent } from "../../_fixtures.js";
import { cleanupData, logEvent, notifyAdmin } from "../../_fixtures.js";

// ❌ Bad: Using if/else to check ._tag
const handleEventBad = (event: AppEvent) => {
	if (event._tag === "UserCreated") {
		return notifyAdmin(event.userId);
	} else if (event._tag === "UserDeleted") {
		return cleanupData(event.userId);
	} else {
		return logEvent(event);
	}
};

export { handleEventBad };
