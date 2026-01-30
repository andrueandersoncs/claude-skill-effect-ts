/**
 * errors category detectors
 *
 * Auto-generated index of all rule detectors in this category
 */

import { detector as all_either_mode } from "./rule-001/rule-001.detector.js";
import { detector as catch_tag } from "./rule-002/rule-002.detector.js";
import { detector as catch_tags } from "./rule-003/rule-003.detector.js";
import { detector as conditional_fail } from "./rule-004/rule-004.detector.js";
import { detector as effect_try_promise } from "./rule-005/rule-005.detector.js";
import { detector as effect_try } from "./rule-006/rule-006.detector.js";
import { detector as map_error } from "./rule-007/rule-007.detector.js";
import { detector as or_else_fallback } from "./rule-008/rule-008.detector.js";
import { detector as retry_schedule } from "./rule-009/rule-009.detector.js";
import { detector as sandbox_catch_tags } from "./rule-010/rule-010.detector.js";
import { detector as timeout_fail } from "./rule-011/rule-011.detector.js";
import { detector as typed_errors } from "./rule-012/rule-012.detector.js";

export const detectors = [
	all_either_mode,
	catch_tag,
	catch_tags,
	conditional_fail,
	effect_try_promise,
	effect_try,
	map_error,
	or_else_fallback,
	retry_schedule,
	sandbox_catch_tags,
	timeout_fail,
	typed_errors,
] as const;

export default detectors;
