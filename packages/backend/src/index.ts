import type { DefineAPI, SDK } from "caido:plugin";
import {
  downloadResults,
  grepRequests,
  stopGrep,
  upsertCustomRegex,
  listCustomRegexes,
  deleteCustomRegex,
  getRequestData,
} from "./api";
import { initStorageService } from "./services/storage";
import type { BackendEvents } from "./types";

export type { BackendEvents };

export type API = DefineAPI<{
  grepRequests: typeof grepRequests;
  stopGrep: typeof stopGrep;
  downloadResults: typeof downloadResults;
  upsertCustomRegex: typeof upsertCustomRegex;
  listCustomRegexes: typeof listCustomRegexes;
  deleteCustomRegex: typeof deleteCustomRegex;
  getRequestData: typeof getRequestData;
}>;

export function init(sdk: SDK<API, BackendEvents>) {
  initStorageService(sdk);

  sdk.api.register("grepRequests", grepRequests);
  sdk.api.register("stopGrep", stopGrep);
  sdk.api.register("downloadResults", downloadResults);
  sdk.api.register("upsertCustomRegex", upsertCustomRegex);
  sdk.api.register("listCustomRegexes", listCustomRegexes);
  sdk.api.register("deleteCustomRegex", deleteCustomRegex);
  sdk.api.register("getRequestData", getRequestData);
}
