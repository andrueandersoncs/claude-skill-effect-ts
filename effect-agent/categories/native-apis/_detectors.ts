/**
 * native-apis category detectors
 *
 * Auto-generated index of all rule detectors in this category
 */

import { detector as composing_two_functions } from "./rule-001/rule-001.detector.js";
import { detector as conditional_transformation } from "./rule-002/rule-002.detector.js";
import { detector as converting_to_entries } from "./rule-003/rule-003.detector.js";
import { detector as data_transformation_pipeline } from "./rule-004/rule-004.detector.js";
import { detector as filter_and_transform_single_pass } from "./rule-005/rule-005.detector.js";
import { detector as finding_with_default } from "./rule-006/rule-006.detector.js";
import { detector as function_constant_value } from "./rule-007/rule-007.detector.js";
import { detector as grouping_items_by_key } from "./rule-008/rule-008.detector.js";
import { detector as head_and_tail_access } from "./rule-009/rule-009.detector.js";
import { detector as omitting_fields } from "./rule-010/rule-010.detector.js";
import { detector as removing_duplicates } from "./rule-011/rule-011.detector.js";
import { detector as reusable_pipeline } from "./rule-012/rule-012.detector.js";
import { detector as safe_property_access } from "./rule-013/rule-013.detector.js";
import { detector as struct_predicate } from "./rule-014/rule-014.detector.js";
import { detector as tuple_transformation } from "./rule-015/rule-015.detector.js";

export const detectors = [
	composing_two_functions,
	conditional_transformation,
	converting_to_entries,
	data_transformation_pipeline,
	filter_and_transform_single_pass,
	finding_with_default,
	function_constant_value,
	grouping_items_by_key,
	head_and_tail_access,
	omitting_fields,
	removing_duplicates,
	reusable_pipeline,
	safe_property_access,
	struct_predicate,
	tuple_transformation,
] as const;

export default detectors;
