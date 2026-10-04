import { describe, expect, it } from "@jest/globals";
import { sessionsToCsv, SESSIONS_CSV_HEADER } from "./dataExport";
import type { FocusSession } from "../loop/SessionLog";

const SESSION: FocusSession = {
  id: "s-1",
  loopId: "l-1",
  roundIndex: 1,
  intention: null,
  outcome: "finished",
  startedAt: "2026-10-03T09:00:00.000Z",
  endedAt: "2026-10-03T09:25:00.000Z",
  plannedSeconds: 1500,
  focusedSeconds: 1500,
  partial: false,
};

const rowFor = (intention: string): string =>
  sessionsToCsv([{ ...SESSION, intention }]).split("\n")[1]!;

describe("sessionsToCsv", () => {
  it("prefixes spreadsheet-formula characters in free text (S9-04)", () => {
    for (const bad of ["=cmd|' /C calc'!A1", "+1+1", "-5"]) {
      expect(rowFor(bad)).toContain(`,'${bad},`);
    }
    // @SUM carries a comma → the guarded field is also RFC-4180 quoted.
    expect(rowFor("@SUM(1,2)")).toContain(`,"'@SUM(1,2)",`);
  });

  it("leaves ordinary text untouched", () => {
    expect(rowFor("emails")).toContain(",emails,");
  });

  it("quotes fields containing commas or newlines (RFC 4180)", () => {
    const csv = sessionsToCsv([{ ...SESSION, intention: 'a,b\n"c"' }]);
    // the newline lives inside the quoted field — assert on the whole output.
    expect(csv).toContain(`1,"a,b\n""c""",finished`);
  });

  it("quote-escapes a guarded formula field too", () => {
    // '=x,y' guards to '=x,y' then quotes on the embedded comma.
    expect(rowFor("=x,y")).toContain(`1,"'=x,y",finished`);
  });

  it("emits the header line", () => {
    expect(sessionsToCsv([])).toBe(SESSIONS_CSV_HEADER);
  });
});
