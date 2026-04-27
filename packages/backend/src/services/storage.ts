import { mkdir, readdir, readFile, rm, writeFile } from "fs/promises";
import * as path from "path";

import type { CustomRegex } from "shared";

import type { CaidoBackendSDK } from "../types";
import { CustomRegexSchema, RegexIdSchema } from "../validation/schemas";

export class StorageService {
  private sdk: CaidoBackendSDK;
  private regexesDir: string;

  constructor(sdk: CaidoBackendSDK) {
    this.sdk = sdk;
    this.regexesDir = path.join(this.sdk.meta.path(), "regexes");
    this.ensureRegexesDirectory();
  }

  private async ensureRegexesDirectory(): Promise<void> {
    try {
      await mkdir(this.regexesDir, { recursive: true });
    } catch {
      // Directory might already exist
    }
  }

  async upsertCustomRegex(id: string, regex: CustomRegex): Promise<void> {
    const validatedId = RegexIdSchema.parse(id);
    const validatedRegex = CustomRegexSchema.parse(regex);

    await this.ensureRegexesDirectory();
    const filePath = path.join(this.regexesDir, `${validatedId}.json`);
    await writeFile(filePath, JSON.stringify(validatedRegex, null, 2));
  }

  async listCustomRegexes(): Promise<{ id: string; regex: CustomRegex }[]> {
    await this.ensureRegexesDirectory();

    try {
      const files = await readdir(this.regexesDir);
      const jsonFiles = files.filter((file) => file.endsWith(".json"));

      const regexes: { id: string; regex: CustomRegex }[] = [];

      for (const file of jsonFiles) {
        try {
          const id = path.basename(file, ".json");
          const validatedId = RegexIdSchema.parse(id);

          const filePath = path.join(this.regexesDir, file);
          const content = await readFile(filePath, "utf-8");
          const parsedData = JSON.parse(content);
          const validatedRegex = CustomRegexSchema.parse(parsedData);

          regexes.push({ id: validatedId, regex: validatedRegex });
        } catch {
          continue;
        }
      }

      return regexes;
    } catch {
      return [];
    }
  }

  async deleteCustomRegex(id: string): Promise<boolean> {
    try {
      const validatedId = RegexIdSchema.parse(id);
      const filePath = path.join(this.regexesDir, `${validatedId}.json`);
      await rm(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getCustomRegex(id: string): Promise<CustomRegex | undefined> {
    try {
      const validatedId = RegexIdSchema.parse(id);
      const filePath = path.join(this.regexesDir, `${validatedId}.json`);
      const content = await readFile(filePath, "utf-8");
      const parsedData = JSON.parse(content);
      const validatedRegex = CustomRegexSchema.parse(parsedData);
      return validatedRegex;
    } catch {
      return undefined;
    }
  }
}

let storageService: StorageService | undefined;

export function initStorageService(sdk: CaidoBackendSDK): void {
  if (storageService) {
    throw new Error("Storage service already initialized");
  }
  storageService = new StorageService(sdk);
}

export function getStorageService(): StorageService {
  if (!storageService) {
    throw new Error("Storage service not initialized");
  }
  return storageService;
}
