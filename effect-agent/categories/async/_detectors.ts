/**
 * async category detectors
 *
 * Auto-generated index of all rule detectors in this category
 */

import { detector as callback_api } from "./rule-001/rule-001.detector.js";
import { detector as generator_yield } from "./rule-002/rule-002.detector.js";
import { detector as http_handler_boundary } from "./rule-003/rule-003.detector.js";
import { detector as parallel_results } from "./rule-004/rule-004.detector.js";
import { detector as promise_chain } from "./rule-005/rule-005.detector.js";
import { detector as race_operations } from "./rule-006/rule-006.detector.js";
import { detector as repeated_execution } from "./rule-007/rule-007.detector.js";
import { detector as wrap_external_async } from "./rule-008/rule-008.detector.js";

export const detectors = [
	callback_api,
	generator_yield,
	http_handler_boundary,
	parallel_results,
	promise_chain,
	race_operations,
	repeated_execution,
	wrap_external_async,
] as const;

export default detectors;
