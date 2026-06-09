import { beforeEach, describe, expect, it } from "vitest";
import { changeEngine } from "../src/change-engine.js";

describe("changeEngine", () => {
  beforeEach(() => {
    changeEngine.clear();
  });

  it("creates a plan and retrieves it", () => {
    const result = changeEngine.createPlan("block_1", "dev", "old", "new");

    expect(result.planId).toMatch(/^plan_/);
    expect(result.token).toMatch(/^ct_/);
    expect(result.diff).toBe("- old\n+ new");
    expect(result.contentBlockId).toBe("block_1");

    const plan = changeEngine.getPlan(result.planId);
    expect(plan).toBeDefined();
    expect(plan!.status).toBe("pending");
  });

  it("approves a plan with correct token", () => {
    const result = changeEngine.createPlan("block_1", "dev", "old", "new");
    const plan = changeEngine.approvePlan(result.planId, result.token);
    expect(plan.contentBlockId).toBe("block_1");
  });

  it("rejects plan with wrong token", () => {
    const result = changeEngine.createPlan("block_1", "dev", "old", "new");
    expect(() => changeEngine.approvePlan(result.planId, "wrong_token")).toThrow(
      "Invalid confirmation token"
    );
  });

  it("rejects plan that was already applied", () => {
    const result = changeEngine.createPlan("block_1", "dev", "old", "new");
    changeEngine.approvePlan(result.planId, result.token);
    changeEngine.markApplied(result.planId);

    expect(() => changeEngine.approvePlan(result.planId, result.token)).toThrow(
      "already been applied"
    );
  });

  it("rejects non-existent plan", () => {
    expect(() => changeEngine.approvePlan("nonexistent", "token")).toThrow("not found");
  });

  it("lists plans filtered by workspace", () => {
    changeEngine.createPlan("block_1", "dev", "old", "new");
    changeEngine.createPlan("block_2", "prod", "old", "new");

    const devPlans = changeEngine.listPlans("dev");
    expect(devPlans).toHaveLength(1);
    expect(devPlans[0].contentBlockId).toBe("block_1");

    const all = changeEngine.listPlans();
    expect(all).toHaveLength(2);
  });

  it("marks plans as rejected", () => {
    const result = changeEngine.createPlan("block_1", "dev", "old", "new");
    changeEngine.markRejected(result.planId);

    const plan = changeEngine.getPlan(result.planId);
    expect(plan!.status).toBe("rejected");
  });
});
