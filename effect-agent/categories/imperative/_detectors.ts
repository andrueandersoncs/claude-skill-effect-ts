/**
 * imperative category detectors
 *
 * Auto-generated index of all rule detectors in this category
 */

import { detector as array_splice_modification } from "./rule-001/rule-001.detector.js";
import { detector as building_object_mutation } from "./rule-002/rule-002.detector.js";
import { detector as chunked_processing } from "./rule-003/rule-003.detector.js";
import { detector as conditional_accumulation } from "./rule-004/rule-004.detector.js";
import { detector as effectful_iteration } from "./rule-005/rule-005.detector.js";
import { detector as flattening_nested_arrays } from "./rule-006/rule-006.detector.js";
import { detector as limited_concurrency } from "./rule-007/rule-007.detector.js";
import { detector as recursive_effect_processing } from "./rule-008/rule-008.detector.js";
import { detector as splitting_array_by_condition } from "./rule-009/rule-009.detector.js";

export const detectors = [
	array_splice_modification,
	building_object_mutation,
	chunked_processing,
	conditional_accumulation,
	effectful_iteration,
	flattening_nested_arrays,
	limited_concurrency,
	recursive_effect_processing,
	splitting_array_by_condition,
] as const;

export default detectors;
