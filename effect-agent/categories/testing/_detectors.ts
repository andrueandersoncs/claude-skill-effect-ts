/**
 * testing category detectors
 *
 * Auto-generated index of all rule detectors in this category
 */

import { detector as arbitrary_responses } from "./rule-001/rule-001.detector.js";
import { detector as arbitrary_test_layer } from "./rule-002/rule-002.detector.js";
import { detector as effect_exit } from "./rule-003/rule-003.detector.js";
import { detector as effect_vitest_imports } from "./rule-004/rule-004.detector.js";
import { detector as equality_testers } from "./rule-005/rule-005.detector.js";
import { detector as it_effect_prop } from "./rule-006/rule-006.detector.js";
import { detector as it_effect } from "./rule-007/rule-007.detector.js";
import { detector as it_live } from "./rule-008/rule-008.detector.js";
import { detector as it_prop_schema } from "./rule-009/rule-009.detector.js";
import { detector as it_scoped } from "./rule-010/rule-010.detector.js";
import { detector as layer_effect_prop } from "./rule-011/rule-011.detector.js";
import { detector as layer_test } from "./rule-012/rule-012.detector.js";
import { detector as property_based } from "./rule-013/rule-013.detector.js";
import { detector as schema_constraints } from "./rule-014/rule-014.detector.js";
import { detector as test_clock } from "./rule-015/rule-015.detector.js";

export const detectors = [
	arbitrary_responses,
	arbitrary_test_layer,
	effect_exit,
	effect_vitest_imports,
	equality_testers,
	it_effect_prop,
	it_effect,
	it_live,
	it_prop_schema,
	it_scoped,
	layer_effect_prop,
	layer_test,
	property_based,
	schema_constraints,
	test_clock,
] as const;

export default detectors;
