export type AuditEntry = {
  timestamp: string;
  operation: string;
  workspace: string;
  endpoint: string;
  status: "success" | "error";
  durationMs: number;
  errorMessage?: string;
};

export class AuditLogger {
  private entries: AuditEntry[] = [];

  log(entry: AuditEntry): void {
    const sanitized = { ...entry };
    this.entries.push(sanitized);
  }

  getEntries(): AuditEntry[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries = [];
  }
}

export const defaultAuditLogger = new AuditLogger();
