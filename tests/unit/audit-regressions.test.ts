/**
 * Regression tests for false positives and misses found in a review of the
 * detection engine. Each case is a realistic message or address.
 */
import { describe, expect, it } from "vitest";
import {
  analyzeText,
  analyzeUrlInput,
  type CheckerKind,
  type TextAnalysisResult,
  type UrlToolResult,
} from "@/lib/detection";
import { extractUrls } from "@/lib/detection/url-analysis";

function text(input: string, kind: CheckerKind = "message", sender?: string): TextAnalysisResult {
  const result = analyzeText(input, kind, { sender });
  if (!result.ok) throw new Error(result.message);
  return result;
}

function url(input: string): UrlToolResult {
  const result = analyzeUrlInput(input);
  if (!result.ok) throw new Error(result.message);
  return result;
}

const ids = (result: TextAnalysisResult) => result.findings.map((finding) => finding.id);
const checkIds = (result: UrlToolResult) =>
  result.analysis.checks.filter((check) => check.weight > 0).map((check) => check.id);

describe("links hidden behind the '@' trick", () => {
  it("still extracts and checks a link with userinfo in a message", () => {
    expect(extractUrls("Verify your account here: https://www.paypal.com@evil.com/login")).toEqual([
      "https://www.paypal.com@evil.com/login",
    ]);
    const result = text("Verify your account here: https://www.paypal.com@evil.com/login");
    expect(result.links).toHaveLength(1);
    expect(ids(result)).toContain("link-deceptive");
    expect(result.riskLevel).toBe("high");
  });

  it("does not treat a plain email address as a link", () => {
    expect(extractUrls("Email support@example.com for help")).toEqual([]);
  });

  it("ignores '@' in the query string or fragment", () => {
    expect(checkIds(url("https://news.example.com?email=bob@example.org"))).not.toContain("userinfo");
    expect(checkIds(url("https://www.irs.gov#contact@irs.gov"))).not.toContain("userinfo");
    expect(checkIds(url("https://user@evil.com"))).toContain("userinfo");
  });
});

describe("genuine security advice is not flagged", () => {
  it.each([
    "Barclays will never ask you to move money to a safe account. If anyone does, it's a scam. Call 159.",
    "Remember: we will never ask you to transfer money to a safe account.",
  ])("bank safe-account warning: %s", (input) => {
    const result = text(input);
    expect(ids(result)).not.toContain("safe-account");
    expect(result.riskLevel).toBe("low");
  });

  it.each([
    "Santander: Never tell anyone your PIN or online banking password",
    "Your code is 834211. Don't tell anyone this code.",
    "Please stay on the line and an agent will be with you",
  ])("secrecy advice or hold message: %s", (input) => {
    expect(ids(text(input, "phone"))).not.toContain("secrecy");
  });

  it("still flags a real request for secrecy", () => {
    expect(
      ids(text("Don't tell anyone at the bank about this transfer, they are part of the investigation.")),
    ).toContain("secrecy");
    expect(ids(text("Stay on the line while you drive to the bank."))).toContain("secrecy");
  });
});

describe("negation only applies within its own clause", () => {
  it.each([
    ["You won't lose access if you send us the code now.", "code-request"],
    ["We will never call you but please reply with the code we sent to confirm.", "code-request"],
    ["We do not accept bank transfers so pay with Google Play cards today.", "gift-card-payment"],
    ["I can't access the system so please read me the code from your phone.", "code-request"],
  ])("%s", (input, rule) => {
    expect(ids(text(input))).toContain(rule);
  });

  it("keeps genuine negations", () => {
    expect(ids(text("We will never ask you to share your code."))).not.toContain("code-request");
    expect(ids(text("Never share this code with anyone, even someone claiming to be from us."))).not.toContain(
      "code-request",
    );
  });
});

describe("look-alike letters and invisible characters", () => {
  it("reads Cyrillic look-alike letters as Latin inside English words", () => {
    const latin = text("Paypal: Verify your account now. Send us the code we texted you.");
    const disguised = text("Pаypаl: Vеrify yоur аccount nоw. Sеnd us thе cоdе wе tеxtеd yоu.");
    expect(ids(disguised)).toEqual(expect.arrayContaining(["code-request", "hidden-characters"]));
    expect(disguised.score).toBeGreaterThanOrEqual(latin.score);
    expect(disguised.riskLevel).toBe("high");
  });

  it("leaves genuine Cyrillic text alone", () => {
    expect(ids(text("Привет, как дела? Увидимся завтра."))).not.toContain("hidden-characters");
  });

  it.each(["Happy birthday! 👨‍👩‍👧 Love from all of us", "Working late again 👩‍💻", "می‌خواهم فردا بیایم"])(
    "emoji and scripts that use joiners are not 'hidden characters': %s",
    (input) => {
      const result = text(input);
      expect(ids(result)).not.toContain("hidden-characters");
      expect(result.notices.join(" ")).not.toContain("Invisible characters");
    },
  );

  it("still flags zero-width characters inside English words", () => {
    expect(ids(text("Your Pay​pal account is locked"))).toContain("hidden-characters");
    expect(ids(text("Your Pay‍pal account is locked"))).toContain("hidden-characters");
  });
});

describe("ordinary web pages and international domains", () => {
  it.each([
    "https://www.canada.ca/en/revenue-agency.html",
    "https://antifraudcentre-centreantifraude.ca/report-signalez-eng.htm",
    "https://www.fedex.com/en-us/tracking.html",
  ])("does not treat %s as a download", (input) => {
    expect(checkIds(url(input))).not.toContain("download");
  });

  it("does not flag a genuine carrier tracking link as software", () => {
    const result = text("FedEx: Your package is on its way. Track at https://www.fedex.com/en-us/tracking.html");
    expect(result.findings.some((finding) => finding.category === "software")).toBe(false);
  });

  it("still flags real program downloads", () => {
    expect(checkIds(url("https://example.com/update.apk"))).toContain("download");
    expect(checkIds(url("https://example.com/invoice.zip"))).toContain("download");
  });

  it.each(["https://münchen.de", "https://bücher.de", "https://straße.de"])(
    "doesn't count punycode hyphens as a suspicious pattern: %s",
    (input) => {
      const result = url(input);
      expect(checkIds(result)).not.toContain("domain-pattern");
      expect(result.analysis.riskLevel).toBe("low");
    },
  );

  it("keeps closing brackets that belong to the address", () => {
    expect(extractUrls("See https://en.wikipedia.org/wiki/Phishing_(disambiguation) for more")).toEqual([
      "https://en.wikipedia.org/wiki/Phishing_(disambiguation)",
    ]);
    expect(extractUrls("(see https://example.com/page)")).toEqual(["https://example.com/page"]);
  });
});

describe("ordinary phrases that looked like scam signals", () => {
  it("'quick support' is not remote-access software", () => {
    expect(ids(text("Our team provides quick support 7 days a week."))).not.toContain("remote-access");
    expect(ids(text("Download QuickSupport so I can fix it"))).toContain("remote-access");
  });

  it.each(["Dad can you send me the photos", "Could you send me the address"])(
    "'%s' is not a money request",
    (input) => {
      expect(ids(text(input))).not.toContain("money-request");
    },
  );

  it("still catches money requests", () => {
    expect(ids(text("Mum can you send me £200 for the rent, it's urgent"))).toContain("money-request");
  });

  it("catches the WhatsApp 'I sent my code to you by mistake' scam", () => {
    const result = text(
      "Hi, I accidentally sent my verification code to your number. Can you send it back to me please?",
    );
    expect(ids(result)).toContain("code-request");
    expect(ids(result)).not.toContain("money-request");
  });

  it("programming languages aren't risky files", () => {
    expect(ids(text("We use Node.js and Vue.js for the dashboard.", "email"))).not.toContain("risky-file-type");
    expect(ids(text("Please open the attached invoice.html to view your bill.", "email"))).toContain("risky-file-type");
  });

  it.each(["Senior engineer, remote. $80 per hour contract", "Agency nurse, flexible hours, £55 per hour"])(
    "well-paid skilled work isn't unrealistic pay: %s",
    (input) => {
      expect(ids(text(input, "job"))).not.toContain("job-unrealistic-pay");
    },
  );

  it("still flags unrealistic pay for easy work", () => {
    expect(ids(text("No experience needed! Earn $90 per hour liking posts from home.", "job"))).toContain(
      "job-unrealistic-pay",
    );
  });
});

describe("official domains that were flagged as impostors", () => {
  it.each([
    "https://www.gov.scot",
    "https://www.gov.wales",
    "https://www.llyw.cymru",
    "https://www.mygov.scot",
    "https://www.police.uk",
  ])("%s is a government domain", (input) => {
    const result = url(input);
    expect(checkIds(result)).not.toEqual(expect.arrayContaining(["gov-mismatch"]));
    expect(checkIds(result)).not.toContain("brand-mismatch");
    expect(result.analysis.riskLevel).toBe("low");
  });

  it.each(["https://www.paypal.co.uk", "https://www.paypal.com.au", "https://www.paypal.ca"])(
    "%s is a PayPal domain",
    (input) => {
      expect(checkIds(url(input))).not.toContain("brand-mismatch");
    },
  );

  it("government and Facebook sender addresses aren't flagged", () => {
    const scot = text("Your application has been received.", "email", "notifications@gov.scot");
    expect(scot.sender?.observations.filter((item) => item.status === "fail")).toEqual([]);
    const facebook = text("Someone tried to log in to your account.", "email", "security@facebookmail.com");
    expect(facebook.sender?.observations.filter((item) => item.status === "fail")).toEqual([]);
  });
});

describe("scams that were missed", () => {
  it("romance-scam customs fee paid by money transfer", () => {
    const result = text(
      "My love, customs at the airport won't let me leave until I pay the customs fee of $3,500. Please send it through Western Union.",
    );
    expect(result.riskLevel).not.toBe("low");
  });

  it("percentage-per-week investment returns", () => {
    expect(ids(text("Earn 20% weekly profit with our trading team. Deposit in USDT to start."))).toContain(
      "investment-lure",
    );
  });

  it("toll-service lookalike domains", () => {
    expect(checkIds(url("https://e-zpass-toll.com/pay"))).toContain("brand-mismatch");
    expect(checkIds(url("https://sunpass-tolls.info"))).toContain("brand-mismatch");
    expect(checkIds(url("https://www.sunpass.com"))).not.toContain("brand-mismatch");
  });
});

describe("link limit notice", () => {
  const links = (count: number) =>
    Array.from({ length: count }, (_, index) => `https://site${index}.example.com/page`).join(" ");

  it("doesn't claim links were skipped when exactly the limit was found", () => {
    expect(text(links(10)).notices.join(" ")).not.toContain("Only the first");
  });

  it("says so when there were more links than the limit", () => {
    const result = text(links(11));
    expect(result.links).toHaveLength(10);
    expect(result.notices.join(" ")).toContain("Only the first 10 links were checked");
  });
});

describe("long, repetitive input stays fast", () => {
  it.each([
    ["dots", "a.".repeat(4999)],
    ["letters", "a".repeat(10_000)],
    ["hyphenated", "a-b.".repeat(2499)],
    ["digits", "1".repeat(10_000)],
  ])("%s", (_, input) => {
    const start = performance.now();
    for (const kind of ["message", "email", "job"] as const) analyzeText(input, kind);
    // Generous bound: these took up to a second each before the patterns were capped.
    expect(performance.now() - start).toBeLessThan(750);
  });
});
