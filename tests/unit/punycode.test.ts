import { domainToASCII, domainToUnicode } from "node:url";
import { describe, expect, it } from "vitest";
import { analyzeUrlInput, type UrlToolResult } from "@/lib/detection";
import { decodePunycode, hostnameToUnicode } from "@/lib/detection/punycode";

function url(input: string): UrlToolResult {
  const result = analyzeUrlInput(input);
  if (!result.ok) throw new Error(result.message);
  return result;
}

describe("punycode decoding", () => {
  it.each(["аpple.com", "münchen.de", "bücher.de", "παράδειγμα.gr", "例え.jp", "пример.рф", "amazön.co.uk"])(
    "matches Node's decoder for %s",
    (domain) => {
      const ascii = domainToASCII(domain) || domain;
      expect(hostnameToUnicode(ascii)).toBe(domainToUnicode(ascii));
    },
  );

  it("rejects invalid input without throwing", () => {
    expect(hostnameToUnicode("xn--abc.com")).toBe("xn--abc.com");
    expect(decodePunycode("!!!")).toBeNull();
    expect(decodePunycode("zzzzzzzzzzzzzzzzzzzzzzzz")).toBeNull();
  });
});

describe("international look-alike domains", () => {
  it("flags a brand spelled with Cyrillic letters", () => {
    const result = url(`https://${domainToASCII("аpple.com")}/`);
    const lookalike = result.analysis.checks.find((check) => check.id === "lookalike");
    expect(lookalike?.status).toBe("fail");
    expect(lookalike?.detail).toContain("аpple");
    expect(result.analysis.riskLevel).not.toBe("low");
  });

  it("flags a brand spelled with accented letters", () => {
    const result = url(`https://${domainToASCII("amazön-login.com")}/`);
    expect(result.analysis.checks.find((check) => check.id === "lookalike")?.status).toBe("fail");
  });

  it("shows how the browser displays the domain", () => {
    const result = url(`https://${domainToASCII("münchen.de")}/`);
    expect(result.analysis.checks.find((check) => check.id === "punycode")?.detail).toContain("münchen.de");
    expect(result.analysis.checks.find((check) => check.id === "lookalike")?.status).not.toBe("fail");
  });
});
