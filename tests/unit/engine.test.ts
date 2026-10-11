import { describe, expect, it } from "vitest";
import {
  analyzeText,
  formatTextReport,
  MAX_TEXT_LENGTH,
  TEXT_EXAMPLES,
  type CheckerKind,
  type TextAnalysisResult,
} from "@/lib/detection";
import { isNegated } from "@/lib/detection/engine";

function ok(result: ReturnType<typeof analyzeText>): TextAnalysisResult {
  if (!result.ok) throw new Error(`Expected success, got ${result.error}: ${result.message}`);
  return result;
}

function ids(result: TextAnalysisResult): string[] {
  return result.findings.map((finding) => finding.id);
}

describe("input validation", () => {
  it.each(["", "   ", "\n\t  \n"])("rejects empty input %j", (input) => {
    const result = analyzeText(input, "message");
    expect(result).toMatchObject({ ok: false, error: "empty" });
  });

  it("rejects non-string input without throwing", () => {
    expect(analyzeText(undefined, "message")).toMatchObject({ ok: false, error: "invalid" });
    expect(analyzeText(42, "email")).toMatchObject({ ok: false, error: "invalid" });
    expect(analyzeText({ text: "hi" }, "job")).toMatchObject({ ok: false, error: "invalid" });
  });

  it("accepts input exactly at the length limit", () => {
    const input = "a".repeat(MAX_TEXT_LENGTH);
    expect(analyzeText(input, "message").ok).toBe(true);
  });

  it("rejects oversized input with a helpful message", () => {
    const result = analyzeText("a".repeat(MAX_TEXT_LENGTH + 1), "message");
    expect(result).toMatchObject({ ok: false, error: "too_long", limit: MAX_TEXT_LENGTH });
    if (!result.ok) expect(result.message).toContain("10,000");
  });
});

describe("illustrative examples shown on the site", () => {
  for (const [kind, examples] of Object.entries(TEXT_EXAMPLES) as [
    CheckerKind,
    (typeof TEXT_EXAMPLES)[CheckerKind],
  ][]) {
    for (const example of examples) {
      it(`${kind}/${example.id} is ${example.expected}`, () => {
        const result = ok(analyzeText(example.text, kind, { sender: example.sender }));
        expect(result.riskLevel).toBe(example.expected);
        if (example.kind === "legitimate") {
          expect(result.findings.filter((finding) => finding.weight >= 3)).toEqual([]);
        }
      });
    }
  }
});

describe("ordinary legitimate messages (false-positive checks)", () => {
  const legitimate: [CheckerKind, string][] = [
    ["message", "Hey, are we still on for dinner at 7? I'll book the table."],
    ["message", "Your Google verification code is 552910. Don't share this code with anyone."],
    [
      "message",
      "Chase Fraud Alert: Did you attempt a $45.00 purchase at TARGET on 10/10? Reply YES or NO. To opt out, reply STOP.",
    ],
    [
      "message",
      "Royal Mail: Your parcel from ASOS will be delivered today between 10:00 and 13:00. Track at royalmail.com/track",
    ],
    ["message", "Our autumn sale ends tonight! Use code AUTUMN20 at checkout for 20% off."],
    ["message", "Hi Mum, I'll be home late tonight. Can you save me some dinner?"],
    [
      "email",
      "Hi Alex,\n\nThanks for your order. Your receipt is below. Delivery fee: $4.99. We'll deliver your order on Tuesday.\n\nThe Shop Team",
    ],
    ["email", "Reminder: the library will be closed on Monday for the public holiday. Normal hours resume on Tuesday."],
    [
      "job",
      "Registered Nurse (Band 5), Brighton. Full-time, permanent. Salary £29,970 to £36,483 a year. Interviews held on site. Apply via the NHS Jobs website.",
    ],
    [
      "job",
      "We cover the visa fee and relocation costs for successful candidates. Interviews are conducted by video call with the engineering team.",
    ],
    ["phone", "Hi, it's the pharmacy. Your prescription is ready for collection. We're open until 6pm today."],
  ];

  it.each(legitimate)("%s: %s", (kind, text) => {
    const result = ok(analyzeText(text, kind));
    expect(result.riskLevel).toBe("low");
  });

  it("does not flag 'never share your code' style warnings as a code request", () => {
    const result = ok(
      analyzeText("We will never ask you to send us your code. Never share your PIN with anyone.", "message"),
    );
    expect(ids(result)).not.toContain("code-request");
    expect(ids(result)).not.toContain("password-request");
  });

  it("still flags a code request after an unrelated negative clause", () => {
    const result = ok(analyzeText("Don't worry, just send me the code we texted you.", "message"));
    expect(ids(result)).toContain("code-request");
  });

  it("isNegated only looks at the current clause", () => {
    const text = "Do not panic. Send the code now";
    expect(isNegated(text, text.indexOf("Send"))).toBe(false);
    const negated = "We will never ask you to send the code";
    expect(isNegated(negated, negated.indexOf("send"))).toBe(true);
  });
});

describe("obvious phishing and scam messages", () => {
  it("flags a bank phishing text as High with transparent evidence", () => {
    const result = ok(
      analyzeText(
        "Chase: We detected unusual activity and your account has been temporarily locked. Verify your identity at https://chase-secure-verify.top/login within 24 hours to avoid permanent suspension.",
        "message",
      ),
    );
    expect(result.riskLevel).toBe("high");
    expect(ids(result)).toEqual(
      expect.arrayContaining(["account-verify-request", "account-threat", "urgency", "link-deceptive"]),
    );
    const verify = result.findings.find((finding) => finding.id === "account-verify-request");
    expect(verify?.evidence[0]).toMatch(/Verify your identity/i);
    expect(result.links[0]?.registrableDomain).toBe("chase-secure-verify.top");
  });

  it("flags gift card payment demands", () => {
    const result = ok(
      analyzeText(
        "This is the IRS. You owe back taxes. Buy Google Play cards and send me photos of the back of the cards today.",
        "phone",
      ),
    );
    expect(ids(result)).toContain("gift-card-payment");
    expect(ids(result)).toContain("combo-authority-payment");
    expect(result.riskLevel).toBe("high");
  });

  it("flags crypto ATM and safe-account requests as critical", () => {
    const result = ok(
      analyzeText(
        "Withdraw cash and deposit it at a Bitcoin ATM. It's the only way to move funds to the safe account.",
        "phone",
      ),
    );
    const critical = result.findings.filter((finding) => finding.severity === "critical").map((finding) => finding.id);
    expect(critical).toEqual(expect.arrayContaining(["crypto-atm", "safe-account"]));
  });

  it("flags remote-access tools", () => {
    const result = ok(
      analyzeText("Your computer has a virus. Please install AnyDesk so our technician can fix it.", "phone"),
    );
    expect(ids(result)).toEqual(expect.arrayContaining(["remote-access", "tech-support-scare"]));
  });

  it("flags requests to install apps from outside the store", () => {
    const result = ok(
      analyzeText("Download the attached security.apk and allow installs from unknown sources.", "message"),
    );
    expect(ids(result)).toContain("sideload-app");
  });

  it("detects shortened links as an unresolved risk", () => {
    const result = ok(analyzeText("Your package is waiting. Track it: bit.ly/3Example", "message"));
    expect(ids(result)).toContain("link-shortened");
    expect(result.links[0]?.unresolved).toBe(true);
  });

  it("does not treat a single keyword as proof", () => {
    const result = ok(analyzeText("URGENT", "message"));
    expect(result.riskLevel).toBe("low");
    expect(ids(result)).toEqual(["urgency"]);
  });
});

describe("email checker", () => {
  it("checks the sender address when provided", () => {
    const result = ok(
      analyzeText("Please review the attached invoice.", "email", { sender: "billing@micros0ft-billing.example" }),
    );
    expect(result.sender?.valid).toBe(true);
    expect(ids(result)).toContain("sender-lookalike");
  });

  it("flags a display name that hides a different address", () => {
    const result = ok(analyzeText("Hello", "email", { sender: '"support@paypal.com" <help@random-mailer.example>' }));
    expect(ids(result)).toContain("sender-display-address");
  });

  it("flags organisations writing from personal mailboxes", () => {
    const result = ok(
      analyzeText("Your Netflix membership is on hold. Update your payment details.", "email", {
        sender: "Netflix Billing <netflix.billing2026@gmail.com>",
      }),
    );
    expect(ids(result)).toContain("sender-free-provider-org");
  });

  it("treats a personal address alone as neutral", () => {
    const result = ok(analyzeText("Lunch on Friday?", "email", { sender: "jamie.lee@gmail.com" }));
    expect(result.riskLevel).toBe("low");
    expect(result.sender?.observations.map((observation) => observation.id)).toContain("sender-free-provider");
  });

  it("handles a malformed sender gracefully", () => {
    const result = ok(analyzeText("Hello there", "email", { sender: "not an address" }));
    expect(result.sender?.valid).toBe(false);
    expect(result.notices.join(" ")).toMatch(/sender address couldn't be read/i);
  });

  it("detects risky attachments and macro prompts", () => {
    const result = ok(analyzeText("Open the attached invoice_8812.zip and click Enable Content to view it.", "email"));
    expect(ids(result)).toEqual(expect.arrayContaining(["risky-file-type", "enable-macros"]));
  });

  it("does not treat a website address as a file attachment", () => {
    const result = ok(analyzeText("Our policy is at https://example.com/policy.html for reference.", "email"));
    expect(ids(result)).not.toContain("risky-file-type");
  });
});

describe("job scam checker", () => {
  it("flags upfront fees", () => {
    const result = ok(analyzeText("You must pay a $95 training fee before your first shift.", "job"));
    expect(ids(result)).toContain("job-upfront-fee");
  });

  it("flags money-mule recruitment", () => {
    const result = ok(
      analyzeText(
        "As a payment processing agent you will receive payments into your personal bank account and forward them, keeping 10% commission.",
        "job",
      ),
    );
    expect(ids(result)).toContain("job-money-mule");
  });

  it("flags chat-only interviews and early requests for sensitive data", () => {
    const result = ok(
      analyzeText(
        "The interview will be conducted on Telegram. Please send your Social Security number and bank details so we can set up payroll.",
        "job",
      ),
    );
    expect(ids(result)).toEqual(expect.arrayContaining(["job-chat-interview", "job-sensitive-info"]));
  });

  it("only flags high pay when combined with low-effort cues", () => {
    const easy = ok(analyzeText("Work from home, no experience needed. Earn $350 per day.", "job"));
    expect(ids(easy)).toContain("job-unrealistic-pay");
    const senior = ok(
      analyzeText("Senior surgeon, salary $350 per day plus benefits. Ten years' experience required.", "job"),
    );
    expect(ids(senior)).not.toContain("job-unrealistic-pay");
  });

  it("flags reshipping and pressure to accept", () => {
    const result = ok(
      analyzeText(
        "Package inspector role: receive parcels at your home and reship them. Accept the offer within 2 hours or the position will be given to someone else.",
        "job",
      ),
    );
    expect(ids(result)).toEqual(expect.arrayContaining(["job-reshipping", "job-pressure"]));
  });
});

describe("unicode, non-English and hostile input", () => {
  it("sees through zero-width characters", () => {
    const result = ok(analyzeText("Please send me the ver​ification co​de now", "message"));
    expect(ids(result)).toContain("code-request");
    expect(ids(result)).toContain("hidden-characters");
  });

  it("flags words that mix Latin and Cyrillic letters", () => {
    const result = ok(analyzeText("Your раypal account is limited", "message"));
    const hidden = result.findings.find((finding) => finding.id === "hidden-characters");
    expect(hidden).toBeDefined();
  });

  it("normalises stylised Unicode letters", () => {
    const result = ok(analyzeText("𝐁𝐮𝐲 𝐠𝐢𝐟𝐭 𝐜𝐚𝐫𝐝𝐬 and send the codes", "message"));
    expect(ids(result)).toContain("gift-card-payment");
  });

  it("shows a notice for text that isn't English", () => {
    const spanish = ok(
      analyzeText(
        "Hola, su paquete está retenido en la aduana. Por favor pague la tarifa para liberar el envío lo antes posible gracias.",
        "message",
      ),
    );
    expect(spanish.notices.join(" ")).toMatch(/doesn't appear to be mainly in English/);
    const chinese = ok(
      analyzeText("您好，您的包裹因地址不完整无法投递，请点击链接更新地址信息，否则包裹将被退回。", "message"),
    );
    expect(chinese.notices.join(" ")).toMatch(/doesn't appear to be mainly in English/);
  });

  it("still checks links inside non-English text", () => {
    const result = ok(analyzeText("您好，请访问 http://paypa1-secure.example/login 更新信息", "message"));
    expect(ids(result)).toContain("link-deceptive");
  });

  it("handles emoji and right-to-left override characters", () => {
    const result = ok(analyzeText("🎉🎉 Congratulations! You have won a prize 🎁 invoice‮fdp.exe", "message"));
    expect(ids(result)).toContain("prize-lure");
    expect(ids(result)).toContain("hidden-characters");
  });

  it("returns HTML and script content as plain evidence text", () => {
    const html = '<img src=x onerror="alert(1)"> <script>alert("x")</script> Send me your password now';
    const result = ok(analyzeText(html, "message"));
    expect(ids(result)).toContain("password-request");
    expect(result.findings.flatMap((finding) => finding.evidence).join(" ")).not.toMatch(
      /<script>alert\("x"\)<\/script> Send me your password/,
    );
  });

  it("analyses maximum-length adversarial input quickly", () => {
    const chunks = [
      "send ",
      "the ",
      "code ",
      "verify ",
      "your ",
      "account ",
      "http://a.b.c.d.e.example/ ",
      "$1,000,000 per day ",
      "bit.ly/x ",
    ];
    let input = "";
    while (input.length < MAX_TEXT_LENGTH - 40) input += chunks[input.length % chunks.length];
    const kinds: CheckerKind[] = ["message", "email", "job", "phone"];
    const started = performance.now();
    for (const kind of kinds) ok(analyzeText(input.slice(0, MAX_TEXT_LENGTH), kind));
    const repeated = "a".repeat(MAX_TEXT_LENGTH);
    for (const kind of kinds) ok(analyzeText(repeated, kind));
    expect(performance.now() - started).toBeLessThan(3_000);
  });
});

describe("results and recommendations", () => {
  it("never describes a clean result as safe", () => {
    const result = ok(analyzeText("See you at the match on Saturday!", "message"));
    expect(result.findings).toEqual([]);
    expect(result.recommendations[0]).toMatch(/does not mean the message is safe/);
  });

  it("formats a copyable plain-text report with the limitation statement", () => {
    const result = ok(analyzeText(TEXT_EXAMPLES.message[0]!.text, "message"));
    const report = formatTextReport(result);
    expect(report).toContain("Warning-sign level: High");
    expect(report).toContain("not a trained AI model");
    expect(report).toContain("does not mean something is safe");
  });

  it("is deterministic", () => {
    const text = TEXT_EXAMPLES.email[0]!.text;
    expect(analyzeText(text, "email")).toEqual(analyzeText(text, "email"));
  });
});
