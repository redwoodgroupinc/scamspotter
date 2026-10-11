import { describe, expect, it } from "vitest";
import { RISK_THRESHOLDS, riskLevelForScore, SEVERITY_WEIGHTS } from "@/lib/detection";
import { scoreFindings } from "@/lib/detection/scoring";
import type { Finding } from "@/lib/detection";

function makeFinding(group: string, weight: number, id = `${group}-${weight}`): Finding {
  return {
    id,
    title: id,
    category: "pressure",
    severity: "moderate",
    weight,
    group,
    explanation: "",
    evidence: [],
  };
}

describe("risk-score boundaries", () => {
  it("documents the thresholds used by the engine", () => {
    expect(RISK_THRESHOLDS).toEqual({ medium: 3, high: 7 });
    expect(SEVERITY_WEIGHTS).toEqual({ weak: 1, moderate: 2, strong: 3, critical: 4 });
  });

  it.each([
    [0, "low"],
    [1, "low"],
    [2, "low"],
    [3, "medium"],
    [6, "medium"],
    [7, "high"],
    [25, "high"],
  ] as const)("score %i is %s", (score, level) => {
    expect(riskLevelForScore(score)).toBe(level);
  });

  it("never returns High when only one group of warning signs was found", () => {
    expect(riskLevelForScore(9, 1)).toBe("medium");
  });

  it("treats invalid scores as low", () => {
    expect(riskLevelForScore(Number.NaN)).toBe("low");
    expect(riskLevelForScore(-4)).toBe("low");
  });

  it("no single rule can reach the High threshold on its own", () => {
    const maxWeight = Math.max(...Object.values(SEVERITY_WEIGHTS));
    expect(maxWeight).toBeLessThan(RISK_THRESHOLDS.high);
  });
});

describe("scoreFindings", () => {
  it("counts only the strongest finding in each group", () => {
    const result = scoreFindings([
      makeFinding("payment-method", 4, "gift"),
      makeFinding("payment-method", 2, "wire"),
      makeFinding("pressure", 2),
    ]);
    expect(result).toEqual({ score: 6, groups: 2 });
  });

  it("returns zero for no findings", () => {
    expect(scoreFindings([])).toEqual({ score: 0, groups: 0 });
  });
});
