/**
 * code-style category detectors
 *
 * Auto-generated index of all rule detectors in this category
 */

import { detector as dom_element } from "./rule-001/rule-001.detector.js";
import { detector as dynamic_data } from "./rule-002/rule-002.detector.js";
import { detector as dynamic_property_access } from "./rule-003/rule-003.detector.js";
import { detector as effect_fn_single_step } from "./rule-004/rule-004.detector.js";
import { detector as effect_fn_transformation } from "./rule-005/rule-005.detector.js";
import { detector as effect_gen_multi_step } from "./rule-006/rule-006.detector.js";
import { detector as exhaustive_match } from "./rule-007/rule-007.detector.js";
import { detector as fat_arrow_syntax } from "./rule-008/rule-008.detector.js";
import { detector as fix_types } from "./rule-009/rule-009.detector.js";
import { detector as non_null_assertion } from "./rule-010/rule-010.detector.js";
import { detector as ts_imports } from "./rule-011/rule-011.detector.js";
import { detector as unknown_conversion } from "./rule-012/rule-012.detector.js";
import { detector as unused_variable } from "./rule-013/rule-013.detector.js";
import { detector as validate_api_response } from "./rule-014/rule-014.detector.js";

export const detectors = [
	dom_element,
	dynamic_data,
	dynamic_property_access,
	effect_fn_single_step,
	effect_fn_transformation,
	effect_gen_multi_step,
	exhaustive_match,
	fat_arrow_syntax,
	fix_types,
	non_null_assertion,
	ts_imports,
	unknown_conversion,
	unused_variable,
	validate_api_response,
] as const;

export default detectors;
