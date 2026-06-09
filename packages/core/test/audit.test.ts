import { beforeEach, describe, expect, it } from "vitest";
import { defaultAuditLogger, AuditLogger } from "../src/audit.js";

describe("AuditLogger", () => {
  beforeEach(() => {
    defaultAuditLogger.clear();
  });

  it("logs and retrieves entries", () => {
    defaultAuditLogger.log({
      timestamp: "2026-01-01T00:00:00Z",
      operation: "POST /campaigns/list",
      workspace: "dev",
      endpoint: "/campaigns/list",
      status: "success",
      durationMs: 42,
    });

    const entries = defaultAuditLogger.getEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].operation).toBe("POST /campaigns/list");
    expect(entries[0].status).toBe("success");
  });

  it("logs error entries", () => {
    defaultAuditLogger.log({
      timestamp: "2026-01-01T00:00:00Z",
      operation: "POST /campaigns/list",
      workspace: "prod",
      endpoint: "/campaigns/list",
      status: "error",
      durationMs: 120,
      errorMessage: "Braze API 401: Unauthorized",
    });

    const entries = defaultAuditLogger.getEntries();
    expect(entries[0].status).toBe("error");
    expect(entries[0].errorMessage).toBe("Braze API 401: Unauthorized");
  });

  it("clear removes all entries", () => {
    defaultAuditLogger.log({
      timestamp: "2026-01-01T00:00:00Z",
      operation: "POST /test",
      workspace: "dev",
      endpoint: "/test",
      status: "success",
      durationMs: 1,
    });

    defaultAuditLogger.clear();
    expect(defaultAuditLogger.getEntries()).toHaveLength(0);
  });

  it("works with a standalone instance", () => {
    const logger = new AuditLogger();
    logger.log({
      timestamp: "2026-01-01T00:00:00Z",
      operation: "POST /test",
      workspace: "staging",
      endpoint: "/test",
      status: "success",
      durationMs: 5,
    });

    expect(logger.getEntries()).toHaveLength(1);
    expect(defaultAuditLogger.getEntries()).toHaveLength(0);
  });
});
