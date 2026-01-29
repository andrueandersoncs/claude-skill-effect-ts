import type { Category, FlattenedRule } from "./types.js";

export function slugify(rule: string): string {
  return rule
    .toLowerCase()
    .replace(/[→\.\/\(\)]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function flattenCategories(categories: Category[]): FlattenedRule[] {
  const rules: FlattenedRule[] = [];

  for (const category of categories) {
    for (const rule of category.rules) {
      rules.push({
        categoryId: category.id,
        categoryName: category.name,
        rule: rule.rule,
        example: rule.example,
      });
    }
  }

  return rules;
}

export function getRuleKey(rule: FlattenedRule): string {
  return `${rule.categoryId}-${slugify(rule.rule)}`;
}

export function getRuleLabel(rule: FlattenedRule): string {
  return `${rule.categoryName}/${slugify(rule.rule)}`;
}
