export interface Change {
  lineNumber: number;
  violationType: string;
  currentCode: string;
  proposedFix: string;
  explanation: string;
}

export interface ChangeDescriptor {
  category: string;
  pattern: string;
  targetFile: string;
  changes: Change[];
}

export interface MergedDescriptor {
  targetFile: string;
  changes: Change[];
  categories: string[];
  patterns: string[];
}

export interface QueryResult {
  success: boolean;
  result?: string;
  cost?: number;
}
