import { resolveWorkspace } from "@braze-oss/core";
import type { Request, Response, NextFunction } from "express";

const AUTH_HEADER = "authorization";

const getExpectedApiKey = (): string | undefined => {
  return process.env.BRAZE_MCP_API_KEY;
};

export const bearerAuth = () => {
  const expectedKey = getExpectedApiKey();

  if (!expectedKey) {
    return (_req: Request, _res: Response, next: NextFunction) => next();
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers[AUTH_HEADER];
    if (!authHeader || typeof authHeader !== "string") {
      res.status(401).json({ error: "Missing Authorization header" });
      return;
    }

    const [scheme, token] = authHeader.split(" ");
    if (scheme.toLowerCase() !== "bearer" || token !== expectedKey) {
      res.status(403).json({ error: "Invalid API key" });
      return;
    }

    next();
  };
};

export const resolveWorkspaceFromEnv = (): ReturnType<typeof resolveWorkspace> => {
  const workspaceName = process.env.BRAZE_WORKSPACE;
  return resolveWorkspace(workspaceName);
};
