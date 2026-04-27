import { type FrontendSDK } from "@/types";

export const copyToClipboard = (sdk: FrontendSDK, text: string): void => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      sdk.window.showToast("Content copied to clipboard", {
        variant: "success",
      });
    })
    .catch((err: Error) => {
      sdk.window.showToast("Failed to copy: " + err.message, {
        variant: "error",
      });
    });
};
