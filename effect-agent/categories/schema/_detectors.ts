/**
 * schema category detectors
 *
 * Auto-generated index of all rule detectors in this category
 */

import { detector as branded_ids } from "./rule-001/rule-001.detector.js";
import { detector as no_plain_error } from "./rule-002/rule-002.detector.js";
import { detector as parse_json } from "./rule-003/rule-003.detector.js";
import { detector as schema_class_methods } from "./rule-004/rule-004.detector.js";
import { detector as schema_class } from "./rule-005/rule-005.detector.js";
import { detector as schema_constructor } from "./rule-006/rule-006.detector.js";
import { detector as schema_filters } from "./rule-007/rule-007.detector.js";
import { detector as schema_literal } from "./rule-008/rule-008.detector.js";
import { detector as schema_tagged_error } from "./rule-009/rule-009.detector.js";
import { detector as schema_transform } from "./rule-010/rule-010.detector.js";
import { detector as schema_union } from "./rule-011/rule-011.detector.js";
import { detector as schema_unknown_legitimate } from "./rule-012/rule-012.detector.js";
import { detector as tagged_union_state } from "./rule-013/rule-013.detector.js";

export const detectors = [
	branded_ids,
	no_plain_error,
	parse_json,
	schema_class_methods,
	schema_class,
	schema_constructor,
	schema_filters,
	schema_literal,
	schema_tagged_error,
	schema_transform,
	schema_union,
	schema_unknown_legitimate,
	tagged_union_state,
] as const;

export default detectors;
