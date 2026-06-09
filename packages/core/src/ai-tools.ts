import type { BrazeClient } from "./braze-client.js";

export type CopyVariant = {
  subject: string;
  body: string;
  preview: string;
  rationale: string;
};

export type GenerateCopyInput = {
  templateId?: string;
  campaignId?: string;
  goal: string;
  audience: string;
  tone?: string;
  count?: number;
};

export type GenerateCopyResult = {
  input: GenerateCopyInput;
  variants: CopyVariant[];
  draftToken: string;
};

export type OptimizationAuditInput = {
  workspace?: string;
  campaignIds?: string[];
  canvasIds?: string[];
};

export type OptimizationFinding = {
  id: string;
  resourceType: "campaign" | "canvas";
  resourceName: string;
  severity: "high" | "medium" | "low";
  category: "deliverability" | "engagement" | "targeting" | "content";
  description: string;
  recommendation: string;
};

export type OptimizationAuditResult = {
  summary: string;
  findings: OptimizationFinding[];
  generatedAt: string;
};

export type WeeklyInsightsInput = {
  workspace?: string;
  daysBack?: number;
};

export type WeeklyInsightsResult = {
  period: string;
  summary: string;
  wins: string[];
  risks: string[];
  actions: string[];
  metrics: {
    campaignsActive: number;
    canvasesActive: number;
    segmentsCount: number;
  };
  generatedAt: string;
};

export type DecisioningScaffoldInput = {
  name: string;
  goal: string;
  audience: string;
  variants: string[];
};

export type DecisioningScaffoldResult = {
  name: string;
  variants: Array<{ name: string; content: string }>;
  settings: Record<string, unknown>;
  summary: string;
};

export const generateCopy = async (
  client: BrazeClient,
  input: GenerateCopyInput,
): Promise<GenerateCopyResult> => {
  const count = input.count ?? 3;
  const tone = input.tone ?? "professional";
  const variants: CopyVariant[] = [];

  for (let i = 0; i < count; i++) {
    variants.push({
      subject: `[DRAFT ${i + 1}] ${input.goal.slice(0, 50)} — ${tone} tone for ${input.audience}`,
      body: `[DRAFT ${i + 1}] Generated copy variant targeting ${input.audience}. Goal: ${input.goal}. Tone: ${tone}.`,
      preview: `Variant ${i + 1}: ${tone} approach for ${input.audience}`,
      rationale: `Created for ${input.audience} with ${tone} tone to achieve: ${input.goal}`,
    });
  }

  const token = `draft_${Math.random().toString(36).slice(2, 10)}`;

  return {
    input,
    variants,
    draftToken: token,
  };
};

export const runOptimizationAudit = async (
  client: BrazeClient,
  input: OptimizationAuditInput,
): Promise<OptimizationAuditResult> => {
  const campaigns = input.campaignIds?.length
    ? await Promise.all(input.campaignIds.map((id) => client.getCampaign(id).catch(() => null)))
    : await client.listCampaigns();

  const findings: OptimizationFinding[] = [];
  const campaignList = (Array.isArray(campaigns) ? campaigns : [campaigns]).filter(Boolean) as Array<{
    id: string;
    name: string;
    status?: string;
  }>;

  for (const campaign of campaignList) {
    if (campaign.status === "draft") {
      findings.push({
        id: campaign.id,
        resourceType: "campaign",
        resourceName: campaign.name,
        severity: "medium",
        category: "content",
        description: `Campaign '${campaign.name}' is still in draft status.`,
        recommendation: "Review and launch or archive this campaign.",
      });
    }
  }

  return {
    summary: `Audited ${campaignList.length} resources. Found ${findings.length} optimization opportunities.`,
    findings,
    generatedAt: new Date().toISOString(),
  };
};

export const generateWeeklyInsights = async (
  client: BrazeClient,
  input: WeeklyInsightsInput,
): Promise<WeeklyInsightsResult> => {
  const campaigns = await client.listCampaigns();
  const canvases = await client.listCanvases();
  const segments = await client.listSegments();

  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const activeCanvases = canvases.filter((c) => !c.archived).length;

  return {
    period: `Last ${input.daysBack ?? 7} days`,
    summary: `Across ${campaigns.length} campaigns, ${canvases.length} canvases, and ${segments.length} segments.`,
    wins: [`${activeCampaigns} active campaigns running`, `${activeCanvases} active canvases`],
    risks: [`${campaigns.length - activeCampaigns} inactive campaigns`, "Review segments for outdated targeting"],
    actions: ["Archive unused campaigns", "Audit segment membership", "Review canvas entry criteria"],
    metrics: {
      campaignsActive: activeCampaigns,
      canvasesActive: activeCanvases,
      segmentsCount: segments.length,
    },
    generatedAt: new Date().toISOString(),
  };
};

export const scaffoldDecisioning = async (
  _client: BrazeClient,
  input: DecisioningScaffoldInput,
): Promise<DecisioningScaffoldResult> => {
  const variants = input.variants.map((v, i) => ({
    name: v,
    content: `[DRAFT] Decisioning variant '${v}' — ${input.goal} for ${input.audience}`,
  }));

  return {
    name: input.name,
    variants,
    settings: {
      goal: input.goal,
      audience: input.audience,
      randomizationUnit: "user",
      metric: "conversion",
    },
    summary: `Scaffolded ${variants.length} variants for experiment '${input.name}'. All content is draft-staged.`,
  };
};
