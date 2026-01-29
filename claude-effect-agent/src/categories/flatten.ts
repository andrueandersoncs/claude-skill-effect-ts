import type { Category, FlattenedPattern } from "./types.js";

export function flattenCategories(categories: Category[]): FlattenedPattern[] {
  const patterns: FlattenedPattern[] = [];

  for (const category of categories) {
    for (const pattern of category.patterns) {
      patterns.push({
        patternId: pattern.id,
        categoryId: category.id,
        categoryName: category.name,
        rule: pattern.rule,
        example: pattern.example,
      });
    }
  }

  return patterns;
}

export function getPatternKey(pattern: FlattenedPattern): string {
  return `${pattern.categoryId}-${pattern.patternId}`;
}

export function getPatternLabel(pattern: FlattenedPattern): string {
  return `${pattern.categoryName}/${pattern.patternId}`;
}
