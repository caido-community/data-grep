import { describe, it, expect, vi } from "vitest";
import { grepService } from "./grep";
import type { GrepOptions } from "shared";

function createMockRequest(id: string, raw: string) {
  return {
    getId: () => id,
    getRaw: () => ({ toText: () => raw }),
  };
}

function createMockResponse(raw: string) {
  return {
    getRaw: () => ({ toText: () => raw }),
  };
}

function createMockSDK(
  items: Array<{
    id: string;
    rawRequest: string;
    rawResponse?: string;
  }>,
  mockOptions?: { inScope?: boolean },
) {
  const mockItems = items.map((item) => ({
    cursor: item.id,
    request: createMockRequest(item.id, item.rawRequest),
    response: item.rawResponse
      ? createMockResponse(item.rawResponse)
      : undefined,
  }));

  let queryCallCount = 0;

  const createQueryBuilder = () => {
    const currentCall = ++queryCallCount;
    const builder: Record<string, unknown> = {};

    builder.filter = vi.fn(() => builder);
    builder.first = vi.fn(() => builder);
    builder.last = vi.fn(() => builder);
    builder.after = vi.fn(() => builder);
    builder.execute = vi.fn().mockResolvedValue(
      currentCall === 1
        ? {
            // getLastRequestID query
            items:
              mockItems.length > 0
                ? [
                    {
                      request: mockItems[mockItems.length - 1]!.request,
                    },
                  ]
                : [],
          }
        : {
            // Main fetch query
            items: mockItems,
            pageInfo: { hasNextPage: false, endCursor: "" },
          },
    );

    return builder;
  };

  const send = vi.fn();

  return {
    sdk: {
      api: { send },
      requests: {
        query: vi.fn(createQueryBuilder),
        inScope: vi.fn(() => mockOptions?.inScope ?? true),
      },
      projects: {
        getCurrent: vi.fn().mockResolvedValue({ id: "test-project" }),
      },
    } as unknown as Parameters<typeof grepService.grepRequests>[0],
    send,
  };
}

const defaultOptions: GrepOptions = {
  includeRequests: true,
  includeResponses: false,
  maxResults: null,
  matchGroups: [0],
  onlyInScope: false,
  skipLargeResponses: false,
  customHTTPQL: null,
  cleanupOutput: false,
  transformScript: null,
};

function getMatchValues(send: ReturnType<typeof vi.fn>): string[] {
  return send.mock.calls
    .filter(
      (call: unknown[]) =>
        call[0] === "caidogrep:matches" && Array.isArray(call[1]),
    )
    .flatMap((call: unknown[]) =>
      (call[1] as Array<{ value: string }>).map((m) => m.value),
    );
}

describe("grepService.grepRequests", () => {
  it("matches a simple pattern in request data", async () => {
    const { sdk, send } = createMockSDK([
      {
        id: "1",
        rawRequest: "GET /test HTTP/1.1\r\nHost: example.com\r\n\r\n",
      },
    ]);

    const result = await grepService.grepRequests(
      sdk,
      "example\\.com",
      defaultOptions,
    );

    expect(result.data?.matchesCount).toBe(1);
    expect(getMatchValues(send)).toContain("example.com");
  });

  it("matches the user-reported regex across CRLF boundaries", async () => {
    const { sdk, send } = createMockSDK([
      {
        id: "1",
        rawRequest:
          "GET /path/to/resource HTTP/1.1\r\nHost: example.com\r\nUser-Agent: Mozilla\r\n\r\n",
      },
    ]);

    const result = await grepService.grepRequests(
      sdk,
      "(?:GET|POST)\\s+(\\S+)\\s+HTTP.*?\\nHost:\\s*(\\S+)",
      { ...defaultOptions, matchGroups: [1] },
    );

    expect(result.data?.matchesCount).toBe(1);
    expect(getMatchValues(send)).toContain("/path/to/resource");
  });

  it("extracts host via capture group 2 from the user-reported regex", async () => {
    const { sdk, send } = createMockSDK([
      {
        id: "1",
        rawRequest:
          "POST /api/login HTTP/1.1\r\nHost: api.example.com\r\nContent-Type: application/json\r\n\r\n",
      },
    ]);

    const result = await grepService.grepRequests(
      sdk,
      "(?:GET|POST)\\s+(\\S+)\\s+HTTP.*?\\nHost:\\s*(\\S+)",
      { ...defaultOptions, matchGroups: [2] },
    );

    expect(result.data?.matchesCount).toBe(1);
    expect(getMatchValues(send)).toContain("api.example.com");
  });

  it("uses first available capture group when multiple groups specified", async () => {
    const { sdk, send } = createMockSDK([
      {
        id: "1",
        rawRequest:
          "GET /users/profile HTTP/1.1\r\nHost: mysite.org\r\nAccept: */*\r\n\r\n",
      },
    ]);

    // When matchGroups: [1, 2] is specified, it uses the first available group (group 1)
    const result = await grepService.grepRequests(
      sdk,
      "(?:GET|POST)\\s+(\\S+)\\s+HTTP.*?\\nHost:\\s*(\\S+)",
      { ...defaultOptions, matchGroups: [1, 2] },
    );

    expect(result.data?.matchesCount).toBe(1);
    const values = getMatchValues(send);
    expect(values).toContain("/users/profile");
  });

  it("is case-insensitive by default", async () => {
    const { sdk, send } = createMockSDK([
      {
        id: "1",
        rawRequest: "GET /test HTTP/1.1\r\nHost: Example.COM\r\n\r\n",
      },
    ]);

    const result = await grepService.grepRequests(sdk, "example\\.com", {
      ...defaultOptions,
    });

    expect(result.data?.matchesCount).toBe(1);
    expect(getMatchValues(send)).toContain("Example.COM");
  });

  it("matches across multiple requests and deduplicates", async () => {
    const { sdk } = createMockSDK([
      {
        id: "1",
        rawRequest: "GET /a HTTP/1.1\r\nHost: example.com\r\n\r\n",
      },
      {
        id: "2",
        rawRequest: "GET /b HTTP/1.1\r\nHost: example.com\r\n\r\n",
      },
    ]);

    const result = await grepService.grepRequests(
      sdk,
      "(?:GET|POST)\\s+(\\S+)\\s+HTTP.*?\\nHost:\\s*(\\S+)",
      { ...defaultOptions, matchGroups: [2] },
    );

    // Both have "example.com" as host, deduplicated to 1
    expect(result.data?.matchesCount).toBe(1);
  });

  it("returns distinct matches from multiple requests", async () => {
    const { sdk, send } = createMockSDK([
      {
        id: "1",
        rawRequest: "GET /a HTTP/1.1\r\nHost: one.com\r\n\r\n",
      },
      {
        id: "2",
        rawRequest: "POST /b HTTP/1.1\r\nHost: two.com\r\n\r\n",
      },
    ]);

    const result = await grepService.grepRequests(
      sdk,
      "(?:GET|POST)\\s+(\\S+)\\s+HTTP.*?\\nHost:\\s*(\\S+)",
      { ...defaultOptions, matchGroups: [2] },
    );

    expect(result.data?.matchesCount).toBe(2);
    const values = getMatchValues(send);
    expect(values).toContain("one.com");
    expect(values).toContain("two.com");
  });

  it("searches response data when includeResponses is true", async () => {
    const { sdk, send } = createMockSDK([
      {
        id: "1",
        rawRequest: "GET / HTTP/1.1\r\nHost: x.com\r\n\r\n",
        rawResponse:
          "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n<title>Secret</title>",
      },
    ]);

    const result = await grepService.grepRequests(sdk, "<title>(.*?)</title>", {
      ...defaultOptions,
      includeRequests: false,
      includeResponses: true,
      matchGroups: [1],
    });

    expect(result.data?.matchesCount).toBe(1);
    expect(getMatchValues(send)).toContain("Secret");
  });

  it("respects maxResults limit", async () => {
    const { sdk } = createMockSDK([
      {
        id: "1",
        rawRequest: "GET /a HTTP/1.1\r\nHost: one.com\r\n\r\n",
      },
      {
        id: "2",
        rawRequest: "GET /b HTTP/1.1\r\nHost: two.com\r\n\r\n",
      },
      {
        id: "3",
        rawRequest: "GET /c HTTP/1.1\r\nHost: three.com\r\n\r\n",
      },
    ]);

    const result = await grepService.grepRequests(
      sdk,
      "(?:GET|POST)\\s+(\\S+)\\s+HTTP.*?\\nHost:\\s*(\\S+)",
      { ...defaultOptions, matchGroups: [2], maxResults: 2 },
    );

    expect(result.data?.matchesCount).toBe(2);
  });

  it("skips out-of-scope requests when onlyInScope is true", async () => {
    const { sdk } = createMockSDK(
      [
        {
          id: "1",
          rawRequest: "GET /a HTTP/1.1\r\nHost: example.com\r\n\r\n",
        },
      ],
      { inScope: false },
    );

    const result = await grepService.grepRequests(sdk, "example\\.com", {
      ...defaultOptions,
      onlyInScope: true,
    });

    expect(result.data?.matchesCount).toBe(0);
  });

  it("returns error when no project is selected", async () => {
    const { sdk } = createMockSDK([]);
    (sdk.projects.getCurrent as ReturnType<typeof vi.fn>).mockResolvedValue(
      null,
    );

    const result = await grepService.grepRequests(sdk, "test", defaultOptions);

    expect(result.data?.error).toBe("No project selected");
  });

  it("returns error when no requests exist", async () => {
    const { sdk } = createMockSDK([]);

    const result = await grepService.grepRequests(sdk, "test", defaultOptions);

    expect(result.data?.error).toBe("No requests found");
  });

  it("strips non-printable characters when cleanupOutput is enabled", async () => {
    const { sdk } = createMockSDK([
      {
        id: "1",
        rawRequest:
          "GET /test HTTP/1.1\r\nHost: example.com\r\n\r\nhello\x00world",
      },
    ]);

    const result = await grepService.grepRequests(sdk, "hello.*world", {
      ...defaultOptions,
      cleanupOutput: true,
    });

    // Match contains non-printable \x00, should be filtered out
    expect(result.data?.matchesCount).toBe(0);
  });

  it("applies transform script to matched values", async () => {
    const { sdk, send } = createMockSDK([
      {
        id: "1",
        rawRequest: "GET /test HTTP/1.1\r\nHost: example.com\r\n\r\n",
      },
    ]);

    const result = await grepService.grepRequests(sdk, "Host:\\s*(\\S+)", {
      ...defaultOptions,
      matchGroups: [1],
      transformScript: "return match.toUpperCase();",
    });

    expect(result.data?.matchesCount).toBe(1);
    expect(getMatchValues(send)).toContain("EXAMPLE.COM");
  });
});
