import type { GrepOptions } from "shared";

/**
 * Builds a regex filter based on the user's options
 */
export function buildRegexFilter(regex: RegExp, options: GrepOptions): string {
  const { includeRequests, includeResponses, customHTTPQL } = options;
  const CLEANUP_EXTENSIONS = [
    "%.apng",
    "%.avif",
    "%.gif",
    "%.jpg",
    "%.jpeg",
    "%.pjpeg",
    "%.pjp",
    "%.png",
    "%.svg",
    "%.webp",
    "%.bmp",
    "%.ico",
    "%.cur",
    "%.tif",
    "%.tiff",
    "%.mp4",
    "%.mp3",
    "%.ttf",
  ];

  const escapedRegexStr = regex.source
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');

  let regexFilter = "";
  const filters = [];

  if (includeRequests) {
    filters.push(`req.raw.regex:"${escapedRegexStr}"`);
  }

  if (includeResponses) {
    filters.push(`resp.raw.regex:"${escapedRegexStr}"`);
  }

  if (filters.length > 0) {
    regexFilter = `(${filters.join(" or ")})`;
  }

  if (customHTTPQL) {
    regexFilter = `${customHTTPQL} and ${regexFilter}`;
  }

  if (options.skipLargeResponses) {
    // Skip responses larger than 10MB
    regexFilter = `${regexFilter} and resp.len.lt:10485760`;
  } else {
    // 100MB limit
    regexFilter = `${regexFilter} and resp.len.lt:104857600`;
  }

  for (const ext of CLEANUP_EXTENSIONS) {
    regexFilter = `${regexFilter} and req.ext.nlike:"${ext}"`;
  }

  return regexFilter;
}

export interface ExtractedMatch {
  value: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Extract all matches from a string based on the regex and matchGroups
 * Returns match values with their positions in the text
 */
export function extractMatches(
  text: string,
  regex: RegExp,
  matchGroups: number[] | null
): ExtractedMatch[] {
  if (!text) return [];

  const matches = Array.from(text.matchAll(new RegExp(regex, "g")));
  if (!matches.length) return [];

  const results: ExtractedMatch[] = [];

  for (const match of matches) {
    const matchIndex = match.index ?? 0;
    
    if (!matchGroups || matchGroups.length === 0) {
      results.push({
        value: match[0],
        startIndex: matchIndex,
        endIndex: matchIndex + match[0].length,
      });
      continue;
    }

    let foundMatch = false;
    for (const groupIndex of matchGroups) {
      if (match[groupIndex] !== undefined) {
        // For capture groups, we need to find the position within the full match
        const groupValue = match[groupIndex];
        const groupOffset = match[0].indexOf(groupValue);
        const startIndex = matchIndex + (groupOffset >= 0 ? groupOffset : 0);
        
        results.push({
          value: groupValue,
          startIndex,
          endIndex: startIndex + groupValue.length,
        });
        foundMatch = true;
        break;
      }
    }

    if (!foundMatch) {
      results.push({
        value: match[0],
        startIndex: matchIndex,
        endIndex: matchIndex + match[0].length,
      });
    }
  }

  return results;
}

/**
 * Executes a query with periodic checks for cancellation
 */
export async function executeQueryWithCancellationCheck<T>(
  promise: Promise<T>,
  isActiveCheck: () => boolean
): Promise<T> {
  return new Promise<T>(async (resolve, reject) => {
    const checkInterval = setInterval(() => {
      if (!isActiveCheck()) {
        clearInterval(checkInterval);
        reject(new Error("Grep operation was stopped"));
      }
    }, 100);

    try {
      const result = await promise;
      clearInterval(checkInterval);
      resolve(result);
    } catch (error) {
      clearInterval(checkInterval);
      reject(error);
    }
  });
}
