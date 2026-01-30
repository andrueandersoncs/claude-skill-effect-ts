/**
 * Category detectors index
 *
 * Re-exports all category detectors
 */

export { asyncDetector } from "./async.js";
export { codeStyleDetector } from "./code-style.js";
export { commentsDetector } from "./comments.js";
export { conditionalsDetector } from "./conditionals.js";
export { discriminatedUnionsDetector } from "./discriminated-unions.js";
export { errorsDetector } from "./errors.js";
export { imperativeDetector } from "./imperative.js";
export { nativeApisDetector } from "./native-apis.js";
export { schemaDetector } from "./schema.js";
export { servicesDetector } from "./services.js";
export { testingDetector } from "./testing.js";

import type { CategoryDetector } from "../types.js";
import { asyncDetector } from "./async.js";
import { codeStyleDetector } from "./code-style.js";
import { commentsDetector } from "./comments.js";
import { conditionalsDetector } from "./conditionals.js";
import { discriminatedUnionsDetector } from "./discriminated-unions.js";
import { errorsDetector } from "./errors.js";
import { imperativeDetector } from "./imperative.js";
import { nativeApisDetector } from "./native-apis.js";
import { schemaDetector } from "./schema.js";
import { servicesDetector } from "./services.js";
import { testingDetector } from "./testing.js";

/**
 * All available category detectors
 */
export const allDetectors: CategoryDetector[] = [
	asyncDetector,
	codeStyleDetector,
	commentsDetector,
	conditionalsDetector,
	discriminatedUnionsDetector,
	errorsDetector,
	imperativeDetector,
	nativeApisDetector,
	schemaDetector,
	servicesDetector,
	testingDetector,
];

/**
 * Get detector by category name
 */
export const getDetector = (category: string): CategoryDetector | undefined => {
	return allDetectors.find((d) => d.category === category);
};

/**
 * Get all category names
 */
export const getCategoryNames = (): string[] => {
	return allDetectors.map((d) => d.category);
};
