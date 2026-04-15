import type { CustomRegex } from "shared";

import { useSDK } from "@/plugins/sdk";

export const useCustomRegexRepository = () => {
  const sdk = useSDK();

  const listCustomRegexes = async () => {
    const { data, error } = await sdk.backend.listCustomRegexes();

    if (error !== undefined) {
      sdk.window.showToast(`Error while listing custom regexes: ${error}`, {
        variant: "error",
      });
      return [];
    }

    return data ?? [];
  };

  const upsertCustomRegex = async (id: string, regex: CustomRegex) => {
    const { error } = await sdk.backend.upsertCustomRegex(id, regex);

    if (error !== undefined) {
      sdk.window.showToast(`Error while saving custom regex: ${error}`, {
        variant: "error",
      });
      return false;
    }

    sdk.window.showToast("Custom regex saved successfully", {
      variant: "success",
    });
    return true;
  };

  const deleteCustomRegex = async (id: string) => {
    const { error } = await sdk.backend.deleteCustomRegex(id);

    if (error !== undefined) {
      sdk.window.showToast(`Error while deleting custom regex: ${error}`, {
        variant: "error",
      });
      return false;
    }

    sdk.window.showToast("Custom regex deleted successfully", {
      variant: "success",
    });
    return true;
  };

  return {
    listCustomRegexes,
    upsertCustomRegex,
    deleteCustomRegex,
  };
};
