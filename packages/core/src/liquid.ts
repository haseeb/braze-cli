export type LiquidIssue = {
  line: number;
  column: number;
  message: string;
  severity: "error" | "warning";
};

export type LiquidLintResult = {
  valid: boolean;
  issues: LiquidIssue[];
  preview: string | null;
};

const LIQUID_SYNTAX_CHECKS: Array<{
  pattern: RegExp;
  message: string;
  severity: "error" | "warning";
}> = [
  { pattern: /\{\{(?![\s/%}])/, message: "Missing space after '{{'", severity: "warning" },
  { pattern: /(?<![\s])\}\}/, message: "Missing space before '}}'", severity: "warning" },
  { pattern: /\{%(?![\s-])/, message: "Missing space after '{%'", severity: "warning" },
  { pattern: /(?<![\s-])%\}/, message: "Missing space before '%}'", severity: "warning" },
  { pattern: /\{\{[^}]{300,}\}\}/, message: "Liquid expression exceeds 300 characters", severity: "warning" },
  { pattern: /\{%\s*if\s+(?!.*%})/, message: "Unclosed '{% if %}' block", severity: "error" },
  { pattern: /\{%\s*for\s+(?!.*%})/, message: "Unclosed '{% for %}' block", severity: "error" },
  { pattern: /(?<!{%\s*if\s+.*)\{%\s*endif\s*%\}/, message: "'{% endif %}' without matching 'if'", severity: "error" },
  { pattern: /(?<!{%\s*for\s+.*)\{%\s*endfor\s*%\}/, message: "'{% endfor %}' without matching 'for'", severity: "error" },
];

export const lintLiquid = (template: string): LiquidLintResult => {
  const issues: LiquidIssue[] = [];
  const lines = template.split("\n");

  for (const check of LIQUID_SYNTAX_CHECKS) {
    let match: RegExpExecArray | null;
    const regex = new RegExp(check.pattern.source, check.pattern.flags + "g");

    while ((match = regex.exec(template)) !== null) {
      const pos = match.index;
      let line = 1;
      let column = 1;

      for (let i = 0; i < pos; i++) {
        if (template[i] === "\n") {
          line += 1;
          column = 1;
        } else {
          column += 1;
        }
      }

      issues.push({
        line,
        column,
        message: check.message,
        severity: check.severity,
      });
    }
  }

  const openBraces = (template.match(/\{\{/g) ?? []).length;
  const closeBraces = (template.match(/\}\}/g) ?? []).length;
  if (openBraces !== closeBraces) {
    issues.push({
      line: lines.length,
      column: 1,
      message: `Mismatched '{{ }}' pairs: ${openBraces} open, ${closeBraces} close`,
      severity: "error",
    });
  }

  return {
    valid: issues.every((i) => i.severity !== "error"),
    issues,
    preview: template.slice(0, 200),
  };
};

export const previewLiquid = (template: string, sampleData?: Record<string, unknown>): string => {
  let result = template;

  result = result.replace(
    /\{\{\s*(\w+(?:\.\w+)*)(?:\s*\|\s*default:\s*'([^']*)')?\s*\}\}/g,
    (_match, path: string, fallback: string | undefined) => {
      if (sampleData) {
        const keys = path.split(".");
        let value: unknown = sampleData;
        for (const key of keys) {
          if (value && typeof value === "object" && key in value) {
            value = (value as Record<string, unknown>)[key];
          } else {
            return fallback ?? `{{${path}}}`;
          }
        }
        return String(value);
      }
      return fallback ?? `{{${path}}}`;
    },
  );

  return result;
};
