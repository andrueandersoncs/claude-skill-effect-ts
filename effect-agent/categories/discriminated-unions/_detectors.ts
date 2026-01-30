/**
 * discriminated-unions category detectors
 *
 * Auto-generated index of all rule detectors in this category
 */

import { detector as match_tag_dispatch } from "./rule-001/rule-001.detector.js";
import { detector as partitioning_by_tag } from "./rule-002/rule-002.detector.js";
import { detector as runtime_validation } from "./rule-003/rule-003.detector.js";
import { detector as schema_is_vs_match_tag } from "./rule-004/rule-004.detector.js";
import { detector as schema_tagged_error } from "./rule-005/rule-005.detector.js";
import { detector as switch_on_tag } from "./rule-006/rule-006.detector.js";
import { detector as use_union_directly } from "./rule-007/rule-007.detector.js";

export const detectors = [
	match_tag_dispatch,
	partitioning_by_tag,
	runtime_validation,
	schema_is_vs_match_tag,
	schema_tagged_error,
	switch_on_tag,
	use_union_directly,
] as const;

export default detectors;
