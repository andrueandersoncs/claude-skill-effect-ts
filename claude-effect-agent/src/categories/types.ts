export interface Example {
  bad: string;
  good: string;
  description: string;
}

export interface Rule {
  rule: string;
  example: Example;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  rules: Rule[];
}

export interface FlattenedRule {
  categoryId: string;
  categoryName: string;
  rule: string;
  example: Example;
}
