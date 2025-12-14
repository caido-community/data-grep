import { DefineEvents, SDK } from "caido:plugin";
import type { MatchResult } from "shared";

export type BackendEvents = DefineEvents<{
  "caidogrep:progress": (progress: number) => void;

  /**
   * Under 25k matches, the matches are sent as an array of MatchResults.
   * Over 25k matches, the matches are sent as a number of matches
   */
  "caidogrep:matches": (matches: MatchResult[] | number) => void;
}>;

export type CaidoBackendSDK = SDK<never, BackendEvents>;
