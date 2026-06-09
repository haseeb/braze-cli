export const computeDiff = (oldContent: string, newContent: string): string => {
  const oldRaw = oldContent ?? "";
  const newRaw = newContent ?? "";

  if (oldRaw === newRaw) return "(no changes)";

  const oldLines = oldRaw === "" ? [] : oldRaw.split("\n");
  const newLines = newRaw === "" ? [] : newRaw.split("\n");

  const result: string[] = [];

  let i = 0;
  let j = 0;

  while (i < oldLines.length || j < newLines.length) {
    if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
      result.push(`  ${oldLines[i]}`);
      i += 1;
      j += 1;
    } else if (i < oldLines.length && j < newLines.length) {
      result.push(`- ${oldLines[i]}`);
      result.push(`+ ${newLines[j]}`);
      i += 1;
      j += 1;
    } else if (i < oldLines.length) {
      result.push(`- ${oldLines[i]}`);
      i += 1;
    } else if (j < newLines.length) {
      result.push(`+ ${newLines[j]}`);
      j += 1;
    }
  }

  return result.join("\n");
};

export const applyDiff = (oldContent: string, diff: string): string => {
  const lines = diff.split("\n");
  const result: string[] = [];

  for (const line of lines) {
    if (line.startsWith("+ ")) {
      result.push(line.slice(2));
    } else if (line.startsWith("  ") || (!line.startsWith("- ") && !line.startsWith("+ "))) {
      result.push(line.startsWith("  ") ? line.slice(2) : line);
    }
  }

  return result.join("\n");
};
