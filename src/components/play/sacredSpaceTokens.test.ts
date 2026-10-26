import { describe, it, expect } from "vitest";
import { cycleSacredTokens, tokensAt } from "./sacredSpaceTokens";
describe("Sacred-space placement transitions", () => {
  it("cycles clear, Closed, Fire, Hallowed, clear with one atomic relocation", () => {
    let state = { closed: "none", fire: "holy", hallowed: "none" };
    let change = cycleSacredTokens(state, "burial")!;
    expect(change).toEqual({ closed: "burial" });
    state = { ...state, ...change };
    change = cycleSacredTokens(state, "burial")!;
    expect(change).toEqual({ closed: "none", fire: "burial" });
    state = { ...state, ...change };
    expect(tokensAt(state, "holy")).toEqual([]);
    change = cycleSacredTokens(state, "burial")!;
    expect(change).toEqual({ fire: "none", hallowed: "burial" });
    state = { ...state, ...change };
    expect(cycleSacredTokens(state, "burial")).toEqual({ hallowed: "none" });
  });
  it("requires explicit editing for combined or partially unknown observations", () => {
    expect(
      cycleSacredTokens(
        { closed: "burial", fire: "burial", hallowed: "none" },
        "burial",
      ),
    ).toBeNull();
    expect(
      cycleSacredTokens({ closed: "none", fire: "none" }, "burial"),
    ).toBeNull();
    expect(tokensAt({ closed: "burial", fire: "burial" }, "burial")).toEqual([
      "closed",
      "fire",
    ]);
  });
});
