import { describe, expect, it } from "vitest";
import { COMBINATION_RULES, SEVERITY_WEIGHTS, TEXT_RULES } from "@/lib/detection";

describe("rule definitions", () => {
  it("have unique ids", () => {
    const ids = TEXT_RULES.map((rule) => rule.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("use global regular expressions (required by matchAll)", () => {
    for (const rule of TEXT_RULES) {
      for (const pattern of rule.patterns) {
        expect(pattern.flags, `${rule.id}: ${pattern.source}`).toContain("g");
      }
    }
  });

  it("each have a title, an explanation and at least one target tool", () => {
    for (const rule of TEXT_RULES) {
      expect(rule.title.length, rule.id).toBeGreaterThan(5);
      expect(rule.explanation.length, rule.id).toBeGreaterThan(40);
      expect(rule.appliesTo.length, rule.id).toBeGreaterThan(0);
      expect(SEVERITY_WEIGHTS[rule.severity], rule.id).toBeGreaterThan(0);
    }
  });

  it("avoid nested quantifiers that could cause catastrophic backtracking", () => {
    const nested = /\((?:[^()\\]|\\.)*[+*](?:[^()\\]|\\.)*\)[+*{]/;
    for (const rule of TEXT_RULES) {
      for (const pattern of rule.patterns) {
        expect(nested.test(pattern.source), `${rule.id}: ${pattern.source}`).toBe(false);
      }
    }
  });

  it("combination rules give small, documented bonuses", () => {
    for (const rule of COMBINATION_RULES) {
      expect(SEVERITY_WEIGHTS[rule.severity]).toBeLessThanOrEqual(2);
      expect(rule.requires.length).toBeGreaterThanOrEqual(2);
      expect(rule.explanation.length).toBeGreaterThan(20);
    }
  });
});
