import type { CountryCode, SourceId } from "./sources";

/**
 * Country-specific scam prevention content.
 *
 * Every factual statement about an official organisation is tied to a source
 * in src/data/sources.ts, verified on SOURCES_LAST_VERIFIED. Scam examples
 * written by ScamSpotter are labelled as illustrations, not real messages.
 */

export interface ReportingChannel {
  name: string;
  useFor: string;
  how: string;
  source: SourceId;
}

export interface OfficialStatement {
  organisation: string;
  statement: string;
  source: SourceId;
}

export interface CountryScam {
  title: string;
  description: string;
}

export interface CountryProfile {
  code: CountryCode;
  slug: string;
  name: string;
  shortName: string;
  /** Name as used mid-sentence, e.g. "the UK". */
  placeName: string;
  demonym: string;
  currency: { code: string; symbol: string };
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  firstSteps: string[];
  reporting: ReportingChannel[];
  officialStatements: OfficialStatement[];
  scams: CountryScam[];
  illustration: { message: string; whyItsSuspicious: string };
  sources: SourceId[];
}

export const COUNTRIES: CountryProfile[] = [
  {
    code: "us",
    slug: "united-states",
    name: "United States",
    shortName: "USA",
    placeName: "the United States",
    demonym: "American",
    currency: { code: "USD", symbol: "$" },
    metaTitle: "USA Scam Prevention: Where to Report Scams and What to Watch For",
    metaDescription:
      "How to report scam texts, phishing emails, IRS and Social Security impersonation and identity theft in the United States, with links to the FTC, FBI IC3 and other official resources.",
    intro: [
      "In the United States, the Federal Trade Commission (FTC) collects scam reports through ReportFraud.ftc.gov and publishes consumer advice on spotting them. Different scams also have their own reporting routes: the FBI's Internet Crime Complaint Center (IC3) for internet-enabled crime, IdentityTheft.gov for identity theft, and dedicated channels for IRS and Social Security impersonation.",
      "A useful habit is to separate the message from the organisation it claims to come from. If a text says your bank account is locked, your package is held or you owe the IRS, close the message and contact the organisation through a phone number or website you already know is genuine.",
    ],
    firstSteps: [
      "If you sent money or shared card or bank details, call your bank or card issuer using the number on your card, and ask about stopping or reversing the payment.",
      "If you paid with a gift card, contact the company that issued the card straight away and ask whether the funds can be frozen. The FTC keeps a list of issuer contacts on its gift card scams page.",
      "If someone has your Social Security number or opened accounts in your name, use IdentityTheft.gov to create a recovery plan.",
      "Report the scam to the FTC at ReportFraud.ftc.gov. If it happened online and you lost money, also file with the FBI's IC3.",
    ],
    reporting: [
      {
        name: "ReportFraud.ftc.gov",
        useFor: "Most scams, fraud and bad business practices.",
        how: "Report online at ReportFraud.ftc.gov. The FTC asks you to paste a scam text into the comments field rather than forwarding it.",
        source: "ftc-reportfraud",
      },
      {
        name: "Forward scam texts to 7726 (SPAM)",
        useFor: "Unwanted or scam text messages.",
        how: "Forward the text to 7726 so your mobile carrier can block similar messages, or use your messaging app's report junk option.",
        source: "ftc-spam-texts",
      },
      {
        name: "Anti-Phishing Working Group",
        useFor: "Phishing emails.",
        how: "The FTC recommends forwarding phishing emails to reportphishing@apwg.org, then reporting them at ReportFraud.ftc.gov.",
        source: "ftc-phishing",
      },
      {
        name: "FBI Internet Crime Complaint Center (IC3)",
        useFor: "Internet-enabled crime, especially if you lost money or crypto.",
        how: "File a complaint at ic3.gov as soon as possible and include transaction details you have.",
        source: "ic3",
      },
      {
        name: "IdentityTheft.gov",
        useFor: "Identity theft, such as accounts opened in your name.",
        how: "Report online or call 1-877-438-4338 to get an Identity Theft Report and a personal recovery plan.",
        source: "identitytheft-gov",
      },
      {
        name: "IRS impersonation",
        useFor: "Fake IRS or Treasury emails, texts and social media accounts.",
        how: "Send details to phishing@irs.gov as the IRS describes on its reporting page. Don't click links or open attachments.",
        source: "irs-report-phishing",
      },
      {
        name: "Social Security impersonation",
        useFor: "Calls, texts or letters claiming to be from Social Security.",
        how: "Report to the Social Security Office of the Inspector General at oig.ssa.gov.",
        source: "ssa-oig",
      },
      {
        name: "National Elder Fraud Hotline",
        useFor: "People aged 60 and over, and their families.",
        how: "Call 1-833-FRAUD-11 (1-833-372-8311). Check the Department of Justice site for current hours.",
        source: "doj-elder-fraud",
      },
    ],
    officialStatements: [
      {
        organisation: "Internal Revenue Service",
        statement:
          "The IRS says it doesn't start contact by email to request personal or financial information, and doesn't use text messages or social media to discuss personal tax issues such as bills or refunds.",
        source: "irs-recognize-scams",
      },
      {
        organisation: "Social Security Administration",
        statement:
          "Social Security says it will never tell you your Social Security number is suspended, threaten you with arrest, or demand immediate payment, and that government fees are never paid with gift cards, cash, wire transfers or prepaid debit cards.",
        source: "ssa-scam",
      },
      {
        organisation: "Federal Trade Commission",
        statement: "The FTC says anyone who demands payment by gift card is a scammer.",
        source: "ftc-gift-cards",
      },
      {
        organisation: "Federal Trade Commission",
        statement: "The FTC says only scammers demand payment in cryptocurrency.",
        source: "ftc-crypto",
      },
      {
        organisation: "Federal Trade Commission",
        statement:
          "The FTC warns that no caller from your bank's fraud department will ask for your verification code or tell you to move money to protect it.",
        source: "ftc-bank-calls",
      },
    ],
    scams: [
      {
        title: "Fake bank fraud alerts",
        description:
          "A text asks you to confirm a large purchase you didn't make, then a 'fraud specialist' calls and asks for a code or tells you to move money. The FTC has repeatedly warned about this pattern.",
      },
      {
        title: "Unpaid toll and delivery texts",
        description:
          "Messages claim you owe a small toll balance or redelivery fee and link to a payment page that harvests card details. Check through your toll agency's or carrier's official website instead.",
      },
      {
        title: "IRS and Social Security impersonation",
        description:
          "Calls or messages claim you owe back taxes or that your Social Security number is suspended, and demand urgent payment. Both agencies say they don't operate this way.",
      },
      {
        title: "Job and task scams",
        description:
          "Unexpected texts or WhatsApp messages offer remote work, sometimes paying small amounts for 'tasks' before asking you to deposit your own money, often in crypto.",
      },
    ],
    illustration: {
      message:
        "Toll Services: Your vehicle has an outstanding toll balance of $4.15. Pay within 12 hours to avoid a $50 late fee: https://toll-payment-portal.example",
      whyItsSuspicious:
        "A tiny unpaid amount, a short deadline, a threatened penalty and a link to a non-government web address are all classic smishing features. Check any toll balance by going to your state toll agency's website yourself.",
    },
    sources: [
      "ftc-reportfraud",
      "ftc-spam-texts",
      "ftc-phishing",
      "ftc-gift-cards",
      "ftc-crypto",
      "ftc-bank-calls",
      "ic3",
      "identitytheft-gov",
      "irs-recognize-scams",
      "irs-report-phishing",
      "ssa-scam",
      "ssa-oig",
      "doj-elder-fraud",
    ],
  },
  {
    code: "uk",
    slug: "united-kingdom",
    name: "United Kingdom",
    shortName: "UK",
    placeName: "the UK",
    demonym: "British",
    currency: { code: "GBP", symbol: "£" },
    metaTitle: "UK Scam Prevention: Report Fraud, 7726, 159 and Where to Get Help",
    metaDescription:
      "How to report scam texts, phishing emails, fake websites and fraud in the UK, including Report Fraud (which replaced Action Fraud), 7726, report@phishing.gov.uk and the 159 bank line.",
    intro: [
      "The UK has several free, official reporting routes, each with a different job. Suspicious emails go to the National Cyber Security Centre (NCSC), scam texts go to 7726, and crimes where you've lost money go to Report Fraud, the police reporting service that replaced Action Fraud in December 2025 for England, Wales and Northern Ireland. In Scotland, you report fraud to Police Scotland on 101.",
      "If a call or message claims to be from your bank, the 159 service from Stop Scams UK connects you to most UK banks' fraud lines safely. Hang up, then dial 159 yourself.",
    ],
    firstSteps: [
      "If you've sent money or shared bank details, contact your bank immediately. Call 159 or use the number on the back of your card.",
      "If you've lost money in England, Wales or Northern Ireland, report it to Report Fraud online or on 0300 123 2040. In Scotland, contact Police Scotland on 101.",
      "If you entered a password on a fake site, change it on the real site and anywhere else you've used it.",
      "Forward the scam message (7726 for texts, report@phishing.gov.uk for emails) so it can be investigated and blocked.",
    ],
    reporting: [
      {
        name: "Report Fraud (formerly Action Fraud)",
        useFor: "Fraud and cyber crime in England, Wales and Northern Ireland, especially if you've lost money.",
        how: "Report at reportfraud.police.uk or call 0300 123 2040.",
        source: "report-fraud-uk",
      },
      {
        name: "Police Scotland",
        useFor: "Fraud and cyber crime if you live in Scotland.",
        how: "Report Fraud says Police Scotland hasn't joined its process, so call 101 (or 999 in an emergency).",
        source: "report-fraud-uk-faq",
      },
      {
        name: "Suspicious Email Reporting Service",
        useFor: "Phishing and scam emails.",
        how: "Forward the email to report@phishing.gov.uk. The NCSC analyses it and can have malicious sites taken down.",
        source: "govuk-report-phishing",
      },
      {
        name: "7726",
        useFor: "Scam text messages.",
        how: "Forward the text to 7726. It's free and passes the report to your mobile provider.",
        source: "govuk-report-phishing",
      },
      {
        name: "NCSC suspicious website reporting",
        useFor: "Scam or fake websites.",
        how: "Paste the address into the NCSC's report form without opening the site.",
        source: "ncsc-report-website",
      },
      {
        name: "159",
        useFor: "A call or message that claims to be from your bank.",
        how: "Hang up and dial 159 to be connected to your bank. Stop Scams UK says 159 will never call you.",
        source: "stop-scams-159",
      },
      {
        name: "HMRC phishing",
        useFor: "Texts, emails and calls pretending to be HMRC.",
        how: "Forward texts to 60599 (charged at your network rate) and emails to phishing@hmrc.gov.uk.",
        source: "govuk-hmrc-scams",
      },
      {
        name: "Citizens Advice consumer helpline",
        useFor: "Advice on whether something might be a scam and what to do next.",
        how: "Use the online scam checker guidance or call 0808 223 1133.",
        source: "citizens-advice-scams",
      },
    ],
    officialStatements: [
      {
        organisation: "Take Five to Stop Fraud",
        statement:
          "The banking industry's Take Five campaign advises: Stop and think before parting with money or information, Challenge requests (it's fine to refuse or ignore them), and Protect yourself by contacting your bank and reporting it if you think you've been scammed.",
        source: "take-five",
      },
      {
        organisation: "Stop Scams UK",
        statement:
          "Stop Scams UK says the 159 number will never call you, so a caller who discourages you from hanging up and dialling 159 should be treated with suspicion.",
        source: "stop-scams-159",
      },
      {
        organisation: "Financial Conduct Authority",
        statement:
          "The FCA Warning List shows firms it knows are operating without authorisation or running scams, but the FCA notes a firm can still be a scam even if it isn't on the list, so also check the Financial Services Register.",
        source: "fca-warning-list",
      },
      {
        organisation: "National Cyber Security Centre",
        statement:
          "The NCSC advises not to click the link or install any apps if a 'missed parcel' text prompts you to, and to forward the message to 7726.",
        source: "ncsc-parcel-sms",
      },
    ],
    scams: [
      {
        title: "'Missed parcel' and redelivery fee texts",
        description:
          "Texts claiming to be from Royal Mail, Evri, DPD or another courier ask for a small fee or new address details. Some links try to install malicious apps on Android phones.",
      },
      {
        title: "HMRC tax rebate messages",
        description:
          "Emails and texts promise a tax refund and link to a fake form that collects bank details. HMRC has its own reporting addresses for these.",
      },
      {
        title: "Bank impersonation and 'safe account' calls",
        description:
          "A caller claiming to be from your bank's fraud team, or even the police, says your account is at risk and asks you to move money. Hang up and call 159.",
      },
      {
        title: "Investment and crypto 'opportunities'",
        description:
          "Social media adverts and unsolicited contacts promote high returns. Check any firm on the FCA Warning List and Financial Services Register before investing.",
      },
    ],
    illustration: {
      message:
        "HMRC: You are eligible for a tax rebate of £326.40. Claim before midnight to avoid losing your refund: https://hmrc-rebate-claim.example",
      whyItsSuspicious:
        "An unexpected refund, a midnight deadline and a link that isn't on gov.uk are typical of HMRC phishing. Forward HMRC scam texts to 60599 and check your tax account by signing in through GOV.UK yourself.",
    },
    sources: [
      "report-fraud-uk",
      "report-fraud-uk-faq",
      "govuk-report-phishing",
      "govuk-hmrc-scams",
      "ncsc-report-website",
      "ncsc-parcel-sms",
      "stop-scams-159",
      "take-five",
      "fca-warning-list",
      "citizens-advice-scams",
    ],
  },
  {
    code: "ca",
    slug: "canada",
    name: "Canada",
    shortName: "Canada",
    placeName: "Canada",
    demonym: "Canadian",
    currency: { code: "CAD", symbol: "$" },
    metaTitle: "Canada Scam Prevention: CAFC Reporting, CRA Scams and Bank Investigator Fraud",
    metaDescription:
      "How to report fraud in Canada through the Canadian Anti-Fraud Centre and the national reporting system, how to recognize CRA scams, and how to handle bank investigator and job scams.",
    intro: [
      "In Canada, the Canadian Anti-Fraud Centre (CAFC) collects fraud reports and publishes warnings about current scams. Since November 2025, the RCMP's National Cybercrime Coordination Centre and the CAFC have run a national online reporting system, Report Cybercrime and Fraud, which also accepts reports from people who saw a scam but weren't victimized. The RCMP asks victims to report to their local police as well.",
      "Many Canadian scams impersonate the Canada Revenue Agency (CRA), banks and Interac e-Transfer. Knowing how these organizations really contact you makes fake messages much easier to spot.",
    ],
    firstSteps: [
      "If you sent money or shared banking details, contact your financial institution right away using the number on the back of your card.",
      "Report the incident to your local police and to the CAFC through the national reporting system or by phone at 1-888-495-8501.",
      "If your CRA account might be compromised, contact the CRA directly using contact information from canada.ca.",
      "Gather copies of messages, receipts and transaction details before they disappear.",
    ],
    reporting: [
      {
        name: "Report Cybercrime and Fraud",
        useFor: "Fraud and cybercrime anywhere in Canada, including suspicious activity you witnessed.",
        how: "Report online at reportcyberandfraud.canada.ca. You can report anonymously. Also report to your local police if you're a victim.",
        source: "cafc-report-system",
      },
      {
        name: "Canadian Anti-Fraud Centre",
        useFor: "Reporting fraud by phone and checking current fraud warnings.",
        how: "Call 1-888-495-8501. The CAFC says it doesn't accept fraud reports by email.",
        source: "cafc",
      },
      {
        name: "7726 (SPAM)",
        useFor: "Scam and spam text messages.",
        how: "Forward the text to 7726. Get Cyber Safe says this is free in Canada and doesn't count towards your plan.",
        source: "getcybersafe-7726",
      },
      {
        name: "Spam Reporting Centre",
        useFor: "Spam messages covered by Canada's anti-spam legislation.",
        how: "Use the Government of Canada's online spam reporting form.",
        source: "canada-spam-reporting",
      },
      {
        name: "CRA scam reporting",
        useFor: "Messages or calls pretending to be the CRA.",
        how: "Follow the CRA's guidance on recognizing and verifying CRA contact before you respond.",
        source: "cra-verify-contact",
      },
    ],
    officialStatements: [
      {
        organisation: "Canada Revenue Agency",
        statement:
          "The CRA says it does not send or request Interac e-Transfers, and that the only text messages it sends are one-time sign-in codes for multi-factor authentication. Texts with links about refunds or benefits are not from the CRA.",
        source: "cra-recognize-scam",
      },
      {
        organisation: "Canada Revenue Agency",
        statement:
          "The CRA says it will never threaten you with arrest or send police, and won't demand immediate payment by e-transfer, cryptocurrency, prepaid credit cards or gift cards.",
        source: "cra-recognize-scam",
      },
      {
        organisation: "Canadian Anti-Fraud Centre",
        statement:
          "The CAFC says neither it nor the police will ask you to transfer money, give remote access to your device, or share passwords or verification codes, and that you should never move money to a so-called safe account.",
        source: "cafc-bank-investigator",
      },
      {
        organisation: "Canadian Anti-Fraud Centre",
        statement:
          "If you get a suspicious call about your bank account, the CAFC advises hanging up and calling the number on the back of your card, ideally from a different phone or after waiting 10 minutes.",
        source: "cafc-bank-investigator",
      },
    ],
    scams: [
      {
        title: "CRA refund and debt scams",
        description:
          "Texts offer a refund 'by e-Transfer', or callers claim you owe taxes and face arrest. The CRA says it does neither.",
      },
      {
        title: "Bank investigator fraud",
        description:
          "A call that appears to come from your bank, the police or a retailer reports fraud on your account, then asks for a one-time code, remote access to your computer or even for someone to collect your bank card.",
      },
      {
        title: "Job scams",
        description:
          "The CAFC describes fake 'boosting' jobs that pay small amounts before asking for crypto deposits, 'financial agent' roles that move stolen money, and counterfeit cheque schemes.",
      },
      {
        title: "Phishing for Interac e-Transfer and banking logins",
        description:
          "Fake deposit notifications and bank alerts lead to lookalike login pages. Sign in through your bank's app or by typing its address yourself.",
      },
    ],
    illustration: {
      message:
        "CRA: You have an unclaimed tax refund of $612.80. Accept your refund by Interac e-Transfer within 24 hours: https://cra-refund-deposit.example",
      whyItsSuspicious:
        "The CRA says it doesn't send or request e-Transfers and that its only texts are sign-in codes, so a refund link by text is not from the CRA. The address also isn't on canada.ca.",
    },
    sources: [
      "cafc-report-system",
      "cafc",
      "cafc-protect",
      "cafc-bank-investigator",
      "cafc-job",
      "cra-recognize-scam",
      "cra-verify-contact",
      "getcybersafe-7726",
      "canada-spam-reporting",
      "competition-bureau-black-book",
    ],
  },
  {
    code: "au",
    slug: "australia",
    name: "Australia",
    shortName: "Australia",
    placeName: "Australia",
    demonym: "Australian",
    currency: { code: "AUD", symbol: "$" },
    metaTitle: "Australia Scam Prevention: Scamwatch, ReportCyber, IDCARE and ATO Scams",
    metaDescription:
      "How to report scams in Australia through Scamwatch and ReportCyber, get identity support from IDCARE, and recognise fake ATO, myGov and bank messages.",
    intro: [
      "In Australia, Scamwatch is run by the National Anti-Scam Centre within the ACCC. It publishes scam alerts and takes reports, and it promotes three simple steps: Stop, Check, Protect. Cybercrime such as hacked accounts can also be reported to ReportCyber, run by the Australian Signals Directorate's Australian Cyber Security Centre.",
      "If you've given personal information to a scammer, IDCARE, Australia's national identity and cyber support service, can help you work out what to do next.",
    ],
    firstSteps: [
      "If you've sent money or shared bank details, contact your bank immediately.",
      "If you've given away personal information, call IDCARE on 1800 595 160.",
      "Report the scam to Scamwatch so it can be used to warn others and disrupt scammers.",
      "If your accounts or devices have been compromised, report it through ReportCyber and change your passwords.",
    ],
    reporting: [
      {
        name: "Scamwatch",
        useFor: "Any scam or suspicious contact, whether or not you lost money.",
        how: "Use the Report a scam form at scamwatch.gov.au.",
        source: "scamwatch-report",
      },
      {
        name: "ReportCyber",
        useFor: "Cybercrime such as hacked accounts, malware and online fraud.",
        how: "Report at cyber.gov.au/report or call the Australian Cyber Security Hotline on 1300 CYBER1 (1300 292 371).",
        source: "reportcyber",
      },
      {
        name: "IDCARE",
        useFor: "Support if your identity or personal information has been compromised.",
        how: "Call 1800 595 160 or visit idcare.org.",
        source: "idcare",
      },
      {
        name: "ATO scams",
        useFor: "Emails, texts and calls pretending to be the Australian Taxation Office.",
        how: "Forward suspicious emails to ReportScams@ato.gov.au, or call 1800 008 540 to check whether contact is genuine.",
        source: "ato-verify-report",
      },
      {
        name: "Services Australia and myGov scams",
        useFor: "Fake myGov, Centrelink or Medicare messages.",
        how: "Follow Services Australia's guidance on reporting myGov scams.",
        source: "servicesaustralia-mygov-scams",
      },
    ],
    officialStatements: [
      {
        organisation: "Scamwatch",
        statement:
          "Scamwatch's Stop. Check. Protect. advice is to pause before giving money or information, check who you're dealing with using contact details you find yourself, and act quickly by contacting your bank and reporting if something feels wrong.",
        source: "scamwatch-stop-check-protect",
      },
      {
        organisation: "Services Australia",
        statement:
          "Services Australia says it won't send you a link to sign in to myGov. Sign in by typing my.gov.au into your browser or using the official myGov app.",
        source: "servicesaustralia-mygov-scams",
      },
      {
        organisation: "Scamwatch",
        statement:
          "Scamwatch reports that banks say they will never ask you to move money to keep it safe, or ask over the phone for online banking passwords or one-time codes.",
        source: "scamwatch-bank-impersonation",
      },
      {
        organisation: "Australian Taxation Office",
        statement:
          "If you're unsure whether contact from the ATO is genuine, the ATO advises not responding and calling 1800 008 540 to check.",
        source: "ato-verify-report",
      },
    ],
    scams: [
      {
        title: "Bank impersonation",
        description:
          "Scammers can spoof bank phone numbers and even make texts appear in the same thread as genuine bank messages, then pressure you to move money or share codes.",
      },
      {
        title: "Task-based job scams",
        description:
          "Scamwatch describes recruiters who move you to WhatsApp or Telegram, pay small amounts for rating products, then ask you to 'top up' a crypto account to unlock earnings.",
      },
      {
        title: "Fake online shops",
        description:
          "Scamwatch warns that fake stores can look professional, use .com.au addresses and even stolen ABNs. Very low prices and requests for direct bank deposits are warning signs.",
      },
      {
        title: "ATO and myGov impersonation",
        description:
          "Messages about refunds, debts or account problems link to fake sign-in pages. Go to my.gov.au or the ATO app yourself instead.",
      },
    ],
    illustration: {
      message:
        "myGov: Your account will be suspended due to unverified details. Sign in within 24 hours to keep access: https://mygov-account-verify.example",
      whyItsSuspicious:
        "Services Australia says it won't send a link to sign in to myGov, so this message is a scam whatever it looks like. The address also doesn't end in gov.au.",
    },
    sources: [
      "scamwatch",
      "scamwatch-report",
      "scamwatch-stop-check-protect",
      "scamwatch-bank-impersonation",
      "scamwatch-jobs",
      "scamwatch-buying-selling",
      "reportcyber",
      "idcare",
      "ato-verify-report",
      "servicesaustralia-mygov-scams",
    ],
  },
];

export function getCountry(slug: string): CountryProfile | undefined {
  return COUNTRIES.find((country) => country.slug === slug);
}
