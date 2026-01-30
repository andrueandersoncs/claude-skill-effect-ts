/**
 * rule-006: live-and-test-layers
 *
 * Rule: Never create a service without both *Live and *Test layers
 */

import type * as ts from "typescript";
import type { Violation } from "../../../detectors/types.js";

const meta = {
	id: "rule-006",
	category: "services",
	name: "live-and-test-layers",
};

export const detect = (
	filePath: string,
	sourceFile: ts.SourceFile,
): Violation[] => {
	const violations: Violation[] = [];
	const fullText = sourceFile.getFullText();

	// Track service definitions and their layers
	const services = new Set<string>();
	const liveLayerFor = new Set<string>();
	const testLayerFor = new Set<string>();

	// Find Context.Tag definitions to identify services
	const servicePattern = /(\w+)\s*=\s*Context\.Tag/g;
	for (const match of fullText.matchAll(servicePattern)) {
		services.add(match[1]);
	}

	// Find Layer definitions
	const livePattern = /(\w+)Live\s*=\s*Layer\./g;
	for (const match of fullText.matchAll(livePattern)) {
		liveLayerFor.add(match[1]);
	}

	const testPattern = /(\w+)Test\s*=\s*Layer\./g;
	for (const match of fullText.matchAll(testPattern)) {
		testLayerFor.add(match[1]);
	}

	// Check each service
	for (const service of services) {
		const hasLive = liveLayerFor.has(service);
		const hasTest = testLayerFor.has(service);

		if (hasLive && !hasTest) {
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: `Service ${service} has Live layer but no Test layer`,
				filePath,
				line: 1,
				column: 1,
				snippet: `${service}Live exists but ${service}Test is missing`,
				severity: "warning",
				certainty: "potential",
				suggestion: `Create ${service}Test layer for testing with mocked/in-memory implementation`,
			});
		} else if (!hasLive && hasTest) {
			violations.push({
				ruleId: meta.id,
				category: meta.category,
				message: `Service ${service} has Test layer but no Live layer`,
				filePath,
				line: 1,
				column: 1,
				snippet: `${service}Test exists but ${service}Live is missing`,
				severity: "warning",
				certainty: "potential",
				suggestion: `Create ${service}Live layer with real implementation`,
			});
		}
	}

	return violations;
};
