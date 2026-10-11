import type { CheckerKind, Finding, FindingCategory, RiskLevel } from "./types";

const BY_CATEGORY: Partial<Record<FindingCategory, string>> = {
  credentials:
    "Don't share one-time codes, passwords or PINs with anyone who contacts you, even if they say they're from your bank, a government agency or a tech company.",
  "personal-data":
    "Don't send ID numbers, bank details or photos of documents in reply to a message or call you didn't expect.",
  payment:
    "Don't send money, gift cards or crypto until you've confirmed the request through a contact method you already trust.",
  link: "Don't open the link. To check an account, type the organisation's web address into your browser yourself or use its official app.",
  impersonation:
    "Contact the organisation using details from its official website, a statement or the back of your card, not the contact details in the message.",
  software:
    "Don't install apps, open unexpected attachments or allow remote access because a message asked you to. If you already did, disconnect from the internet and get trusted help.",
  employment:
    "Research the employer independently: find its official website and contact its HR or recruitment team using details listed there.",
  secrecy: "Talk to someone you trust before you act. Scammers rely on secrecy and isolation.",
  threat:
    "Don't let threats rush you. Agencies and companies have formal processes and won't demand instant payment by message or phone.",
  lure: "If you didn't enter a competition or expect a refund, delivery or payment, assume the offer isn't real until you've checked it independently.",
  sender:
    "Look closely at the full sender address, not just the display name, and remember that addresses can be forged.",
  contact:
    "If the message claims to be from someone you know, call them on the number you already have before doing anything it asks.",
  obfuscation: "Hidden or look-alike characters are used to slip past filters. Treat the message with extra caution.",
};

const BY_KIND: Record<CheckerKind, string[]> = {
  message: [
    "Don't reply to a message you think is a scam, even to say STOP. Replying confirms your number is active.",
    "Forward scam texts to 7726 (SPAM) if you're in the US, UK or Canada, then delete them. In Australia, report scam messages to Scamwatch.",
  ],
  email: [
    "Don't reply, click links or open attachments in a suspicious email.",
    "Report phishing emails: in the UK forward them to report@phishing.gov.uk; in the US forward them to reportphishing@apwg.org and report at ReportFraud.ftc.gov. See the reporting options for your country below.",
  ],
  job: [
    "Never pay to get a job, and don't deposit cheques or move money for an employer you haven't verified.",
    "Keep copies of the advert and messages in case you need to report them.",
  ],
  phone: [
    "Hang up and call the organisation back on a number you find yourself. If you can, use a different phone, because some scammers keep the line open.",
    "Caller ID can be faked, so a familiar or official-looking number doesn't prove who is calling.",
  ],
};

const ALWAYS = [
  "If you've already shared details or sent money, contact your bank or card provider straight away using the number on your card.",
  "Report the scam using the official reporting options for your country (listed below).",
];

export function buildRecommendations(kind: CheckerKind, riskLevel: RiskLevel, findings: readonly Finding[]): string[] {
  const recommendations: string[] = [];

  if (findings.length === 0) {
    recommendations.push(
      "We didn't find common warning signs, but that does not mean the message is safe. If it asks you to do anything unexpected, such as pay, log in or share details, verify it through an official channel first.",
    );
  } else if (riskLevel === "low") {
    recommendations.push(
      "Only weak or isolated warning signs were found. That's common in legitimate messages too, but verify anything unexpected through an official channel before acting.",
    );
  } else if (riskLevel === "high") {
    recommendations.push(
      "Several strong warning signs appear together. Don't act on this message until you've independently confirmed it's genuine.",
    );
  }

  const seen = new Set<FindingCategory>();
  for (const finding of findings) {
    if (seen.has(finding.category)) continue;
    seen.add(finding.category);
    const advice = BY_CATEGORY[finding.category];
    if (advice) recommendations.push(advice);
  }

  recommendations.push(...BY_KIND[kind], ...ALWAYS);
  return Array.from(new Set(recommendations));
}

export function buildUrlRecommendations(unresolved: boolean, hasWarnings: boolean): string[] {
  const recommendations = [
    "Don't enter passwords, codes or payment details on a site you reached from an unexpected message.",
    "Type the organisation's address yourself or use its official app instead of following links.",
  ];
  if (unresolved) {
    recommendations.unshift(
      "This is a shortened link, so its destination is hidden. Ask the sender for the full address, or don't open it.",
    );
  }
  if (hasWarnings) {
    recommendations.push(
      "If you already entered details on this site, change that password (and anywhere you reuse it) and contact your bank if you entered card or bank information.",
    );
  }
  recommendations.push(
    "For a second opinion, check the address with Google Safe Browsing's site status tool and look up the domain's registration date with ICANN Lookup. A very new domain is a warning sign for shops and banks.",
  );
  return recommendations;
}
