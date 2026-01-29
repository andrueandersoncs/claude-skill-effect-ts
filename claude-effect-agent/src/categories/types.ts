export interface Example {
  bad: string;
  good: string;
  description: string;
}

export interface Pattern {
  id: string;
  rule: string;
  example: Example;
}

export interface Category {
  id: string;
  name: string;
  patterns: Pattern[];
}

export interface FlattenedPattern {
  patternId: string;
  categoryId: string;
  categoryName: string;
  rule: string;
  example: Example;
}
