export interface GrepOptions {
  includeRequests: boolean;
  includeResponses: boolean;
  maxResults: number | null;
  matchGroups: number[] | null;
  onlyInScope: boolean;
  skipLargeResponses: boolean;
  customHTTPQL: string | null;
  cleanupOutput: boolean;
  transformScript: string | null;
}

export interface GrepStatus {
  isSearching: boolean;
  progress: number;
}

export interface MatchResult {
  value: string;
  requestId: string;
  source: "request" | "response";
  startIndex: number;
  endIndex: number;
}

export interface GrepResults {
  searchResults: MatchResult[] | null;
  uniqueMatchesCount: number;
  searchTime: number;
  cancelled: boolean;
}

export interface CustomRegex {
  name: string;
  description: string;
  regex: string;
  matchGroups?: number[];
}
