const PII_FIELDS = new Set([
  "email",
  "first_name",
  "last_name",
  "phone",
  "phone_number",
  "address",
  "address_line1",
  "address_line2",
  "city",
  "state",
  "zip",
  "zip_code",
  "postal_code",
  "external_id",
  "external_user_id",
  "push_token",
  "device_id",
  "dob",
  "date_of_birth",
  "gender",
  "ssn",
  "passport",
  "credit_card",
  "token",
  "api_key",
  "secret",
  "password",
]);

const SENSITIVE_VALUE_PATTERNS = [
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,
];

const REDACTED = "[REDACTED]";

const isPiiField = (key: string): boolean => {
  const lower = key.toLowerCase().replace(/[_-]/g, "");
  for (const field of PII_FIELDS) {
    if (lower === field.replace(/[_-]/g, "")) return true;
  }
  return false;
};

const looksLikeEmail = (value: string): boolean => {
  return SENSITIVE_VALUE_PATTERNS.some((pattern) => pattern.test(value));
};

export function redact(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (typeof value === "string") {
    return looksLikeEmail(value) ? REDACTED : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redact(item));
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(record)) {
      if (isPiiField(key)) {
        result[key] = REDACTED;
      } else {
        result[key] = redact(val);
      }
    }

    return result;
  }

  return value;
}
