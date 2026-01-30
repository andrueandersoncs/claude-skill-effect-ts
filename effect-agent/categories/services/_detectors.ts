/**
 * services category detectors
 *
 * Auto-generated index of all rule detectors in this category
 */

import { detector as context_tag_api } from "./rule-001/rule-001.detector.js";
import { detector as context_tag_filesystem } from "./rule-002/rule-002.detector.js";
import { detector as context_tag_repository } from "./rule-003/rule-003.detector.js";
import { detector as layer_composition } from "./rule-004/rule-004.detector.js";
import { detector as layer_effect } from "./rule-005/rule-005.detector.js";
import { detector as live_and_test_layers } from "./rule-006/rule-006.detector.js";
import { detector as stateful_test_layer } from "./rule-007/rule-007.detector.js";
import { detector as wrap_third_party_sdk } from "./rule-008/rule-008.detector.js";

export const detectors = [
	context_tag_api,
	context_tag_filesystem,
	context_tag_repository,
	layer_composition,
	layer_effect,
	live_and_test_layers,
	stateful_test_layer,
	wrap_third_party_sdk,
] as const;

export default detectors;
