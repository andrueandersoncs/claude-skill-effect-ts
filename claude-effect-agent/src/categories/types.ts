export interface Example {
  bad: string;
  good: string;
  description: string;
}

export interface Pattern {
  rule: string;
  examples: Example[];
}

export interface Category {
  id: string;
  name: string;
  patterns: Pattern[];
}
