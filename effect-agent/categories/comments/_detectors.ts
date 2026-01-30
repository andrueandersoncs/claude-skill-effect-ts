/**
 * comments category detectors
 *
 * Auto-generated index of all rule detectors in this category
 */

import { detector as branded_type_definition } from "./rule-001/rule-001.detector.js";
import { detector as code_organization } from "./rule-002/rule-002.detector.js";
import { detector as effect_pipeline } from "./rule-003/rule-003.detector.js";
import { detector as function_documentation } from "./rule-004/rule-004.detector.js";
import { detector as function_implementation } from "./rule-005/rule-005.detector.js";
import { detector as legitimate_why_comment } from "./rule-006/rule-006.detector.js";
import { detector as naming_over_commenting } from "./rule-007/rule-007.detector.js";
import { detector as todo_comments } from "./rule-008/rule-008.detector.js";

export const detectors = [
	branded_type_definition,
	code_organization,
	effect_pipeline,
	function_documentation,
	function_implementation,
	legitimate_why_comment,
	naming_over_commenting,
	todo_comments,
] as const;

export default detectors;
