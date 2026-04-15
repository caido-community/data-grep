import type { GrepOptions } from "shared";

import { useSDK } from "@/plugins/sdk";

export const useGrepRepository = () => {
  const sdk = useSDK();

  const downloadResults = async () => {
    const { data, error } = await sdk.backend.downloadResults();

    if (error !== undefined) {
      sdk.window.showToast(`Error while downloading results: ${error}`, {
        variant: "error",
      });
      return;
    }

    return data;
  };

  const stopGrep = async () => {
    const { error } = await sdk.backend.stopGrep();
    if (error !== undefined) {
      sdk.window.showToast(`Failed to stop grep: ${error}`, {
        variant: "error",
      });
      return false;
    }

    sdk.window.showToast("Grep stopped successfully", {
      variant: "success",
    });
    return true;
  };

  const searchGrepRequests = async (pattern: string, options: GrepOptions) => {
    let cancelled = false;

    const { error, data } = await sdk.backend.grepRequests(pattern, options);

    if (error !== undefined) {
      if (error === "Grep operation was stopped") {
        cancelled = true;
      } else {
        sdk.window.showToast(error, {
          variant: "error",
        });
        return { matchesCount: 0, timeTaken: 0, cancelled };
      }
    }

    return {
      matchesCount: data?.matchesCount,
      timeTaken: data?.timeTaken,
      cancelled,
    };
  };

  return {
    downloadResults,
    stopGrep,
    searchGrepRequests,
  };
};
