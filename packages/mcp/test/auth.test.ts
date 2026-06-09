import { afterEach, describe, expect, it, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { bearerAuth } from "../src/auth.js";

const makeRes = () => {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res as unknown as Response & { statusCode: number; body: unknown };
};

const makeReq = (authHeader?: string): Request =>
  ({ headers: authHeader ? { authorization: authHeader } : {} }) as unknown as Request;

describe("bearerAuth", () => {
  afterEach(() => {
    delete process.env.BRAZE_MCP_API_KEY;
  });

  it("passes through when no API key is configured", () => {
    delete process.env.BRAZE_MCP_API_KEY;
    const middleware = bearerAuth();
    const next = vi.fn() as unknown as NextFunction;
    const res = makeRes();

    middleware(makeReq(), res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.statusCode).toBe(0);
  });

  it("rejects a missing Authorization header with 401", () => {
    process.env.BRAZE_MCP_API_KEY = "secret";
    const middleware = bearerAuth();
    const next = vi.fn() as unknown as NextFunction;
    const res = makeRes();

    middleware(makeReq(), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
  });

  it("rejects a wrong token with 403", () => {
    process.env.BRAZE_MCP_API_KEY = "secret";
    const middleware = bearerAuth();
    const next = vi.fn() as unknown as NextFunction;
    const res = makeRes();

    middleware(makeReq("Bearer nope"), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
  });

  it("rejects a non-bearer scheme with 403", () => {
    process.env.BRAZE_MCP_API_KEY = "secret";
    const middleware = bearerAuth();
    const next = vi.fn() as unknown as NextFunction;
    const res = makeRes();

    middleware(makeReq("Basic secret"), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
  });

  it("accepts a correct bearer token", () => {
    process.env.BRAZE_MCP_API_KEY = "secret";
    const middleware = bearerAuth();
    const next = vi.fn() as unknown as NextFunction;
    const res = makeRes();

    middleware(makeReq("Bearer secret"), res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.statusCode).toBe(0);
  });
});
