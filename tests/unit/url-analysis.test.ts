import { describe, expect, it } from "vitest";
import { analyzeUrlInput, formatUrlReport, MAX_URL_LENGTH, URL_EXAMPLES, type UrlToolResult } from "@/lib/detection";
import {
  editDistance,
  extractUrls,
  findLookalike,
  getRegistrableDomain,
  parseUrlInput,
} from "@/lib/detection/url-analysis";

function ok(result: ReturnType<typeof analyzeUrlInput>): UrlToolResult {
  if (!result.ok) throw new Error(`Expected success, got ${result.error}: ${result.message}`);
  return result;
}

function checkIds(result: UrlToolResult): string[] {
  return result.analysis.checks.filter((check) => check.weight > 0).map((check) => check.id);
}

describe("URL input validation and malformed URLs", () => {
  it.each(["", "   "])("rejects empty input %j", (input) => {
    expect(analyzeUrlInput(input)).toMatchObject({ ok: false, error: "empty" });
  });

  it("rejects oversized input", () => {
    const result = analyzeUrlInput(`https://example.com/${"a".repeat(MAX_URL_LENGTH)}`);
    expect(result).toMatchObject({ ok: false, error: "too_long" });
  });

  it.each([
    ["javascript:alert(1)", /isn't a normal website address/],
    ["data:text/html;base64,PHNjcmlwdD4=", /isn't a normal website address/],
    ["ftp://files.example.com/a", /isn't a normal website address/],
    ["paypal.com login page", /can't contain spaces/],
    ["localhostnope", /incomplete/],
    ["http://", /valid web address/],
    ["http://exa mple.com", /can't contain spaces/],
    ["https://exa..mple.com", /valid web address/],
    ["someone@example.com", /email address/],
  ])("explains why %j can't be checked", (input, message) => {
    const result = analyzeUrlInput(input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(message);
  });

  it("never throws on random malformed input", () => {
    const samples = [
      "%%%",
      "http://[::1",
      "https://\u0000",
      "http://-.-",
      "://",
      "https://a.b/%E0%A4%A",
      "http://1.2.3.4.5",
    ];
    for (const sample of samples) expect(() => analyzeUrlInput(sample)).not.toThrow();
  });
});

describe("HTTPS and scheme handling", () => {
  it("passes HTTPS but explains that it doesn't prove legitimacy", () => {
    const result = ok(analyzeUrlInput("https://www.example.com"));
    const scheme = result.analysis.checks.find((check) => check.id === "scheme");
    expect(scheme?.status).toBe("pass");
    expect(scheme?.detail).toMatch(/does NOT mean the site is legitimate/);
    expect(result.analysis.riskLevel).toBe("low");
  });

  it("warns about plain HTTP", () => {
    expect(checkIds(ok(analyzeUrlInput("http://www.example.com")))).toContain("scheme");
  });

  it("notes when no scheme was entered", () => {
    const result = ok(analyzeUrlInput("example.co.uk/shop"));
    expect(result.analysis.schemeProvided).toBe(false);
    expect(result.analysis.checks.find((check) => check.id === "scheme")?.status).toBe("info");
  });

  it("converts defanged addresses back before checking", () => {
    const result = ok(analyzeUrlInput("hxxps://paypa1[.]example/login"));
    expect(result.notices.join(" ")).toMatch(/defanged/);
    expect(checkIds(result)).toContain("lookalike");
  });
});

describe("suspicious URL structures", () => {
  it("flags raw IPv4 addresses, including disguised decimal forms", () => {
    expect(checkIds(ok(analyzeUrlInput("http://203.0.113.9/login")))).toContain("ip-address");
    const decimal = ok(analyzeUrlInput("http://3405803785/"));
    expect(decimal.analysis.hostname).toBe("203.0.113.9");
    expect(checkIds(decimal)).toContain("ip-address");
  });

  it("flags the @ userinfo trick", () => {
    const result = ok(analyzeUrlInput("https://www.paypal.com@login-check.example/"));
    expect(checkIds(result)).toContain("userinfo");
    expect(result.analysis.hostname).toBe("login-check.example");
  });

  it("treats shortened links as unresolved", () => {
    const result = ok(analyzeUrlInput("https://tinyurl.com/abc123"));
    expect(result.analysis.unresolved).toBe(true);
    expect(result.recommendations[0]).toMatch(/destination is hidden/);
  });

  it("flags punycode domains", () => {
    expect(checkIds(ok(analyzeUrlInput("https://xn--pple-43d.com")))).toContain("punycode");
  });

  it.each([
    ["http://paypa1.example", "PayPal"],
    ["https://arnazon-orders.example", "Amazon"],
    ["https://micros0ft-support.example", "Microsoft"],
    ["https://pay-pal.example/login", "PayPal"],
    ["https://netfIix-billing.example".toLowerCase(), "Netflix"],
    ["https://wellsfargo-secure.example.wellsfarg0.example", "Wells Fargo"],
  ])("detects lookalike domain %s", (url, brand) => {
    const result = ok(analyzeUrlInput(url));
    const ids = checkIds(result);
    expect(ids.some((id) => id === "lookalike" || id === "brand-mismatch")).toBe(true);
    const check = result.analysis.checks.find((item) => item.id === "lookalike" || item.id === "brand-mismatch");
    expect(check?.label).toContain(brand);
  });

  it("flags brand names on unrelated domains and disguised subdomains", () => {
    const result = ok(analyzeUrlInput("https://paypal.com.secure-login.example/webscr"));
    const check = result.analysis.checks.find((item) => item.id === "brand-mismatch");
    expect(check?.detail).toMatch(/starts with "paypal.com"/);
  });

  it("flags government-sounding names on non-government domains", () => {
    expect(checkIds(ok(analyzeUrlInput("https://gov-uk-tax-refund.example")))).toContain("brand-mismatch");
    expect(checkIds(ok(analyzeUrlInput("https://refunds.gov.example.com")))).toContain("gov-mismatch");
  });

  it("flags app downloads", () => {
    const result = ok(analyzeUrlInput("https://delivery-update.example/tracking.apk"));
    expect(result.analysis.checks.find((check) => check.id === "download")?.status).toBe("fail");
  });

  it("flags free hosting, embedded redirects and unusual ports", () => {
    expect(checkIds(ok(analyzeUrlInput("https://bank-login-help.web.app")))).toContain("free-hosting");
    expect(checkIds(ok(analyzeUrlInput("https://example.com/out?url=https://evil.example")))).toContain("redirect");
    expect(checkIds(ok(analyzeUrlInput("http://example.com:8081/")))).toContain("port");
  });
});

describe("false-positive checks for URLs", () => {
  it.each([
    "https://www.paypal.com/signin",
    "https://www.amazon.co.uk/gp/your-account",
    "https://www.royalmail.com/track-your-item",
    "https://www.gov.uk/report-suspicious-emails-websites-phishing",
    "https://www.canada.ca/en/revenue-agency.html",
    "https://my.gov.au",
    "https://finance.yahoo.com/quote",
    "https://cloud.example.com/dashboard",
    "https://apple-recipes.example/pie",
    "https://groups.example.org/ups-and-downs",
  ])("%s is Low", (url) => {
    const result = ok(analyzeUrlInput(url));
    expect(result.analysis.riskLevel).toBe("low");
    expect(checkIds(result).filter((id) => id === "lookalike" || id === "brand-mismatch")).toEqual([]);
  });
});

describe("domain helpers", () => {
  it.each([
    ["www.example.com", "example.com"],
    ["a.b.example.co.uk", "example.co.uk"],
    ["shop.example.com.au", "example.com.au"],
    ["cra-arc.gc.ca", "cra-arc.gc.ca"],
    ["someone.github.io", "someone.github.io"],
    ["203.0.113.5", "203.0.113.5"],
  ])("registrable domain of %s is %s", (host, expected) => {
    expect(getRegistrableDomain(host)).toBe(expected);
  });

  it("computes edit distance with transpositions", () => {
    expect(editDistance("paypal", "paypal")).toBe(0);
    expect(editDistance("paypal", "paypla")).toBe(1);
    expect(editDistance("amazon", "amazom")).toBe(1);
    expect(editDistance("amazon", "banana")).toBeGreaterThan(1);
  });

  it("does not confuse ordinary words with brands", () => {
    expect(findLookalike("finance.example.com")).toBeNull();
    expect(findLookalike("interact.example")).toBeNull();
  });

  it("parses inputs without a scheme", () => {
    const parsed = parseUrlInput("example.org/path");
    expect(parsed.ok && parsed.schemeProvided).toBe(false);
  });
});

describe("extracting links from text", () => {
  it("finds full URLs, www links and bare domains, trimming punctuation", () => {
    const urls = extractUrls("Visit https://example.com/a?b=1, or www.example.org. Also bit.ly/abc! (see t.co/xyz)");
    expect(urls).toEqual(["https://example.com/a?b=1", "www.example.org", "bit.ly/abc", "t.co/xyz"]);
  });

  it("ignores email addresses and abbreviations", () => {
    expect(extractUrls("Email help@example.com, e.g. for refunds, or call 3.5 hours later. Mr.Smith said hi.")).toEqual(
      [],
    );
  });

  it("de-duplicates and caps the number of links", () => {
    const text = Array.from({ length: 15 }, (_, index) => `https://site${index}.example.com`).join(" ");
    expect(extractUrls(`${text} https://site0.example.com`)).toHaveLength(10);
  });
});

describe("URL examples shown on the site", () => {
  it.each(URL_EXAMPLES)("$id is $expected", (example) => {
    expect(ok(analyzeUrlInput(example.url)).analysis.riskLevel).toBe(example.expected);
  });

  it("formats a report that says the site was not visited", () => {
    const report = formatUrlReport(ok(analyzeUrlInput("http://paypa1-login.top/verify")));
    expect(report).toContain("does not visit links");
    expect(report).toContain("[FAIL]");
  });
});
