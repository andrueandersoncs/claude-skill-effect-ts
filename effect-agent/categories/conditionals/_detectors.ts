/**
 * conditionals category detectors
 *
 * Auto-generated index of all rule detectors in this category
 */

import { detector as array_empty_check } from "./rule-001/rule-001.detector.js";
import { detector as match_literal_union } from "./rule-002/rule-002.detector.js";
import { detector as match_struct_conditions } from "./rule-003/rule-003.detector.js";
import { detector as multi_condition_assignment } from "./rule-004/rule-004.detector.js";
import { detector as multi_condition_matching } from "./rule-005/rule-005.detector.js";
import { detector as nullable_option_match } from "./rule-006/rule-006.detector.js";
import { detector as numeric_classification } from "./rule-007/rule-007.detector.js";
import { detector as result_effect_match } from "./rule-008/rule-008.detector.js";
import { detector as switch_to_match_tag } from "./rule-009/rule-009.detector.js";
import { detector as ternary_to_match } from "./rule-010/rule-010.detector.js";

export const detectors = [
	array_empty_check,
	match_literal_union,
	match_struct_conditions,
	multi_condition_assignment,
	multi_condition_matching,
	nullable_option_match,
	numeric_classification,
	result_effect_match,
	switch_to_match_tag,
	ternary_to_match,
] as const;

export default detectors;
