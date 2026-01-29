export interface Change {
  lineNumber: number;
  violationType: string;
  currentCode: string;
  proposedFix: string;
  explanation: string;
}

export interface ChangeDescriptor {
  category: string;
  rule: string;
  targetFile: string;
  changes: Change[];
}

export interface MergedDescriptor {
  targetFile: string;
  changes: Change[];
  categories: string[];
  rules: string[];
}

export interface QueryResult {
  success: boolean;
  result?: string;
  cost?: number;
}
