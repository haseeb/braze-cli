import { randomUUID } from "node:crypto";
import { computeDiff } from "./diff.js";
import type { BrazeClient } from "./braze-client.js";

export type PlanStatus = "pending" | "applied" | "rejected";

export type ContentBlockPlan = {
  id: string;
  contentBlockId: string;
  workspace: string;
  oldContent: string;
  newContent: string;
  diff: string;
  token: string;
  status: PlanStatus;
  createdAt: string;
};

export type PlanResult = {
  planId: string;
  token: string;
  diff: string;
  contentBlockId: string;
  workspace: string;
};

class ChangeEngineImpl {
  private plans = new Map<string, ContentBlockPlan>();

  createPlan(
    contentBlockId: string,
    workspace: string,
    oldContent: string,
    newContent: string,
  ): PlanResult {
    const id = `plan_${randomUUID().slice(0, 8)}`;
    const token = `ct_${randomUUID().slice(0, 12)}`;
    const diff = computeDiff(oldContent, newContent);

    const plan: ContentBlockPlan = {
      id,
      contentBlockId,
      workspace,
      oldContent,
      newContent,
      diff,
      token,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    this.plans.set(id, plan);

    return {
      planId: id,
      token,
      diff,
      contentBlockId,
      workspace,
    };
  }

  getPlan(planId: string): ContentBlockPlan | undefined {
    return this.plans.get(planId);
  }

  approvePlan(planId: string, token: string): ContentBlockPlan {
    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error(`Plan '${planId}' not found.`);
    }

    if (plan.token !== token) {
      throw new Error(`Invalid confirmation token for plan '${planId}'.`);
    }

    if (plan.status !== "pending") {
      throw new Error(`Plan '${planId}' has already been ${plan.status}.`);
    }

    return plan;
  }

  validateToken(planId: string, token: string): ContentBlockPlan {
    const plan = this.plans.get(planId);
    if (!plan) {
      throw new Error(`Plan '${planId}' not found.`);
    }

    if (plan.token !== token) {
      throw new Error(`Invalid confirmation token for plan '${planId}'.`);
    }

    return plan;
  }

  markApplied(planId: string): void {
    const plan = this.plans.get(planId);
    if (plan) {
      plan.status = "applied";
    }
  }

  markRejected(planId: string): void {
    const plan = this.plans.get(planId);
    if (plan) {
      plan.status = "rejected";
    }
  }

  listPlans(workspace?: string): ContentBlockPlan[] {
    const all = Array.from(this.plans.values());
    if (!workspace) return all;
    return all.filter((p) => p.workspace === workspace);
  }

  clear(): void {
    this.plans.clear();
  }
}

export const changeEngine = new ChangeEngineImpl();

export const planContentBlockUpdate = async (
  client: BrazeClient,
  contentBlockId: string,
  newContent: string,
): Promise<PlanResult> => {
  const current = await client.getContentBlock(contentBlockId);
  const oldContent = current.content ?? "";

  return changeEngine.createPlan(
    contentBlockId,
    client.workspaceName,
    oldContent,
    newContent,
  );
};

export const applyPlan = async (
  client: BrazeClient,
  planId: string,
  token: string,
): Promise<{ id: string; message: string }> => {
  const plan = changeEngine.approvePlan(planId, token);
  const response = await client.updateContentBlock(plan.contentBlockId, plan.newContent);
  changeEngine.markApplied(planId);

  return {
    id: plan.contentBlockId,
    message: response.message ?? "updated",
  };
};

export const rollbackPlan = async (
  client: BrazeClient,
  planId: string,
  token: string,
): Promise<{ id: string; message: string }> => {
  changeEngine.validateToken(planId, token);
  const plan = changeEngine.getPlan(planId);
  if (!plan) {
    throw new Error(`Plan '${planId}' not found.`);
  }

  if (plan.status !== "applied") {
    throw new Error(
      `Plan '${planId}' cannot be rolled back because it has not been applied (status: ${plan.status}).`
    );
  }

  const response = await client.updateContentBlock(plan.contentBlockId, plan.oldContent);

  return {
    id: plan.contentBlockId,
    message: response.message ?? "rolled back",
  };
};
