import { FocusSession } from "../loop/SessionLog";

// P20 "Export sessions (CSV)": a flat row per logged focus — importable into
// Sheets/Excel without transformation. Columns are stable across versions; new
// fields append at the end.
export const SESSIONS_CSV_HEADER =
  "id,loop_id,round_index,intention,outcome,started_at,ended_at,planned_seconds,focused_seconds,partial";

function csvField(value: string | null): string {
  if (value == null) {
    return "";
  }
  // S9-04: free text that opens with a formula character (=, +, -, @) is
  // evaluated by Sheets/Excel — prefix it with a single quote so the export
  // stays inert when shared into a spreadsheet.
  const guarded = /^[=+\-@]/.test(value) ? `'${value}` : value;
  // RFC 4180: quote fields containing separators/quotes/newlines; double quotes.
  if (/[",\n\r]/.test(guarded)) {
    return `"${guarded.replace(/"/g, '""')}"`;
  }
  return guarded;
}

export function sessionsToCsv(sessions: FocusSession[]): string {
  const rows = sessions.map((s) =>
    [
      s.id,
      s.loopId,
      String(s.roundIndex),
      csvField(s.intention),
      s.outcome ?? "",
      s.startedAt,
      s.endedAt,
      String(s.plannedSeconds),
      String(s.focusedSeconds),
      s.partial ? "true" : "false",
    ].join(","),
  );
  return [SESSIONS_CSV_HEADER, ...rows].join("\n");
}
