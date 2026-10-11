/**
 * Registry of external sources cited on ScamSpotter.
 *
 * Every URL here was checked against the publisher's own site on the date in
 * `SOURCES_LAST_VERIFIED`. Guides and country pages cite sources by id, and an
 * automated test fails if content references an id that isn't listed here.
 * When adding a source, verify the page exists and says what we cite it for.
 */

export type CountryCode = "us" | "uk" | "ca" | "au";

export interface Source {
  id: string;
  title: string;
  publisher: string;
  url: string;
  country: CountryCode | "intl";
}

export const SOURCES_LAST_VERIFIED = "2026-10-11";

export const SOURCES = [
  // United States
  { id: "ftc-spam-texts", title: "How To Recognize and Report Spam Text Messages", publisher: "Federal Trade Commission", url: "https://consumer.ftc.gov/articles/how-recognize-and-report-spam-text-messages", country: "us" },
  { id: "ftc-phishing", title: "How To Recognize and Avoid Phishing Scams", publisher: "Federal Trade Commission", url: "https://consumer.ftc.gov/articles/how-recognize-avoid-phishing-scams", country: "us" },
  { id: "ftc-avoid-scam", title: "How To Avoid a Scam", publisher: "Federal Trade Commission", url: "https://consumer.ftc.gov/articles/how-avoid-scam", country: "us" },
  { id: "ftc-job-scams", title: "Job Scams", publisher: "Federal Trade Commission", url: "https://consumer.ftc.gov/articles/job-scams", country: "us" },
  { id: "ftc-task-scams", title: "Task scams create the illusion of making money", publisher: "Federal Trade Commission", url: "https://consumer.ftc.gov/consumer-alerts/2024/11/task-scams-create-illusion-making-money", country: "us" },
  { id: "ftc-job-texts", title: "That job offer text is probably a scam", publisher: "Federal Trade Commission", url: "https://consumer.ftc.gov/consumer-alerts/2026/04/job-offer-text-probably-scam", country: "us" },
  { id: "ftc-gift-cards", title: "Avoiding and Reporting Gift Card Scams", publisher: "Federal Trade Commission", url: "https://consumer.ftc.gov/articles/avoiding-and-reporting-gift-card-scams", country: "us" },
  { id: "ftc-crypto", title: "What To Know About Cryptocurrency and Scams", publisher: "Federal Trade Commission", url: "https://consumer.ftc.gov/articles/what-know-about-cryptocurrency-scams", country: "us" },
  { id: "ftc-online-shopping", title: "Online Shopping", publisher: "Federal Trade Commission", url: "https://consumer.ftc.gov/articles/online-shopping", country: "us" },
  { id: "ftc-marketplace", title: "Buying From an Online Marketplace", publisher: "Federal Trade Commission", url: "https://consumer.ftc.gov/articles/buying-online-marketplace", country: "us" },
  { id: "ftc-bank-calls", title: "Got a call about fraud activity on your bank account? It could be a scammer", publisher: "Federal Trade Commission", url: "https://consumer.ftc.gov/consumer-alerts/2024/06/got-call-about-fraud-activity-your-bank-account-it-could-be-scammer", country: "us" },
  { id: "ftc-unexpected-text", title: "Is that unexpected text a scam?", publisher: "Federal Trade Commission", url: "https://consumer.ftc.gov/consumer-alerts/2025/04/unexpected-text-scam", country: "us" },
  { id: "ftc-reportfraud", title: "ReportFraud.ftc.gov", publisher: "Federal Trade Commission", url: "https://reportfraud.ftc.gov/", country: "us" },
  { id: "identitytheft-gov", title: "IdentityTheft.gov", publisher: "Federal Trade Commission", url: "https://www.identitytheft.gov/", country: "us" },
  { id: "ic3", title: "Internet Crime Complaint Center (IC3)", publisher: "Federal Bureau of Investigation", url: "https://www.ic3.gov/", country: "us" },
  { id: "irs-report-phishing", title: "Report fake IRS, Treasury or tax-related emails and messages", publisher: "Internal Revenue Service", url: "https://www.irs.gov/help/report-fraud/report-fake-irs-treasury-or-tax-related-emails-and-messages", country: "us" },
  { id: "irs-recognize-scams", title: "Tips to help taxpayers recognize tax scams", publisher: "Internal Revenue Service", url: "https://www.irs.gov/newsroom/tips-to-help-taxpayers-recognize-tax-scams", country: "us" },
  { id: "ssa-scam", title: "Protect Yourself from Scams", publisher: "Social Security Administration", url: "https://www.ssa.gov/scam/", country: "us" },
  { id: "ssa-oig", title: "Office of the Inspector General: Scam Awareness", publisher: "Social Security Administration OIG", url: "https://oig.ssa.gov/scam-awareness/scam-alert/", country: "us" },
  { id: "doj-elder-fraud", title: "Find Help or Report Abuse (National Elder Fraud Hotline)", publisher: "U.S. Department of Justice", url: "https://www.justice.gov/elderjustice/find-help-or-report-abuse", country: "us" },

  // United Kingdom
  { id: "govuk-report-phishing", title: "Avoid and report internet scams and phishing", publisher: "GOV.UK", url: "https://www.gov.uk/report-suspicious-emails-websites-phishing", country: "uk" },
  { id: "govuk-hmrc-scams", title: "Report scam HMRC messages, calls and social media accounts", publisher: "GOV.UK", url: "https://www.gov.uk/report-suspicious-emails-websites-phishing/report-scam-HMRC-messages-calls-social-media", country: "uk" },
  { id: "report-fraud-uk", title: "Report Fraud (formerly Action Fraud)", publisher: "City of London Police", url: "https://www.reportfraud.police.uk/", country: "uk" },
  { id: "report-fraud-uk-faq", title: "Report Fraud: frequently asked questions", publisher: "City of London Police", url: "https://www.reportfraud.police.uk/faqs/", country: "uk" },
  { id: "ncsc-report-website", title: "Report a suspicious website", publisher: "National Cyber Security Centre", url: "https://www.ncsc.gov.uk/section/about-this-website/report-scam-website", country: "uk" },
  { id: "ncsc-phishing", title: "Phishing scams: how to spot and report them", publisher: "National Cyber Security Centre", url: "https://www.ncsc.gov.uk/collection/phishing-scams", country: "uk" },
  { id: "ncsc-parcel-sms", title: "Scam 'missed parcel' SMS messages: advice on avoiding malware", publisher: "National Cyber Security Centre", url: "https://www.ncsc.gov.uk/guidance/scam-missed-parcel-sms-messages", country: "uk" },
  { id: "ncsc-shopping", title: "Shopping and paying safely online", publisher: "National Cyber Security Centre", url: "https://www.ncsc.gov.uk/guidance/shopping-online-securely", country: "uk" },
  { id: "stop-scams-159", title: "159: Stop, hang up, call 159", publisher: "Stop Scams UK", url: "https://stopscamsuk.org.uk/campaign/get-help-now/", country: "uk" },
  { id: "take-five", title: "Take Five to Stop Fraud", publisher: "Take Five (UK Finance)", url: "https://www.takefive-stopfraud.org.uk/", country: "uk" },
  { id: "citizens-advice-scams", title: "Check if something might be a scam", publisher: "Citizens Advice", url: "https://www.citizensadvice.org.uk/consumer/scams/check-if-something-might-be-a-scam/", country: "uk" },
  { id: "fca-warning-list", title: "About the FCA Warning List", publisher: "Financial Conduct Authority", url: "https://www.fca.org.uk/scamsmart/about-fca-warning-list", country: "uk" },
  { id: "jobsaware", title: "JobsAware", publisher: "JobsAware", url: "https://www.jobsaware.co.uk/", country: "uk" },
  { id: "govuk-job-scam-signs", title: "New Year jobseekers urged to watch out for 7 signs of job scams", publisher: "GOV.UK (Disclosure and Barring Service)", url: "https://www.gov.uk/government/news/new-year-jobseekers-urged-to-watch-out-for-7-signs-of-job-scams", country: "uk" },

  // Canada
  { id: "cafc", title: "Canadian Anti-Fraud Centre", publisher: "Canadian Anti-Fraud Centre", url: "https://antifraudcentre-centreantifraude.ca/index-eng.htm", country: "ca" },
  { id: "cafc-report-system", title: "Report Cybercrime and Fraud", publisher: "RCMP National Cybercrime Coordination Centre and the Canadian Anti-Fraud Centre", url: "https://reportcyberandfraud.canada.ca/", country: "ca" },
  { id: "cafc-protect", title: "Protect yourself from fraud", publisher: "Canadian Anti-Fraud Centre", url: "https://antifraudcentre-centreantifraude.ca/protect-protegez-eng.htm", country: "ca" },
  { id: "cafc-job", title: "Job fraud", publisher: "Canadian Anti-Fraud Centre", url: "https://antifraudcentre-centreantifraude.ca/scams-fraudes/job-emploi-eng.htm", country: "ca" },
  { id: "cafc-bank-investigator", title: "Bank investigator fraud", publisher: "Canadian Anti-Fraud Centre", url: "https://antifraudcentre-centreantifraude.ca/scams-fraudes/b-investigator-enqueteur-eng.htm", country: "ca" },
  { id: "cafc-phishing", title: "Phishing", publisher: "Canadian Anti-Fraud Centre", url: "https://antifraudcentre-centreantifraude.ca/scams-fraudes/phishing-hameconnage-eng.htm", country: "ca" },
  { id: "cra-recognize-scam", title: "Recognize a scam: CRA scams and fraud", publisher: "Canada Revenue Agency", url: "https://www.canada.ca/en/revenue-agency/corporate/scams-fraud/recognize-scam.html", country: "ca" },
  { id: "cra-verify-contact", title: "Verify it's the CRA calling", publisher: "Canada Revenue Agency", url: "https://www.canada.ca/en/revenue-agency/corporate/scams-fraud/verify-cra-contact.html", country: "ca" },
  { id: "getcybersafe-7726", title: "Reporting spam text messages to 7726", publisher: "Get Cyber Safe (Government of Canada)", url: "https://www.getcybersafe.gc.ca/en/blogs/reporting-spam-text-messages-7726", country: "ca" },
  { id: "canada-spam-reporting", title: "Recognizing and reporting spam", publisher: "Innovation, Science and Economic Development Canada", url: "https://ised-isde.canada.ca/site/canada-anti-spam-legislation/en/recognizing-and-reporting-spam", country: "ca" },
  { id: "competition-bureau-black-book", title: "The Little Black Book of Scams (2nd edition)", publisher: "Competition Bureau Canada", url: "https://competition-bureau.canada.ca/en/little-black-book-scams-2nd-edition", country: "ca" },

  // Australia
  { id: "scamwatch", title: "Scamwatch", publisher: "National Anti-Scam Centre (ACCC)", url: "https://www.scamwatch.gov.au/", country: "au" },
  { id: "scamwatch-report", title: "Report a scam", publisher: "Scamwatch", url: "https://www.scamwatch.gov.au/report-a-scam", country: "au" },
  { id: "scamwatch-stop-check-protect", title: "Stop. Check. Protect.", publisher: "Scamwatch", url: "https://www.scamwatch.gov.au/stop-check-protect", country: "au" },
  { id: "scamwatch-jobs", title: "Jobs and employment scams", publisher: "Scamwatch", url: "https://www.scamwatch.gov.au/types-of-scams/jobs-and-employment-scams", country: "au" },
  { id: "scamwatch-buying-selling", title: "Buying and selling scams", publisher: "Scamwatch", url: "https://www.scamwatch.gov.au/types-of-scams/buying-and-selling-scams", country: "au" },
  { id: "scamwatch-bank-impersonation", title: "Scam alert: scammers impersonating banks in text messages, phone calls and emails", publisher: "Scamwatch", url: "https://www.scamwatch.gov.au/about-us/news-and-alerts/scam-alert-scammers-impersonating-banks-in-text-messages-phone-calls-and-emails", country: "au" },
  { id: "reportcyber", title: "ReportCyber", publisher: "Australian Signals Directorate's Australian Cyber Security Centre", url: "https://www.cyber.gov.au/report", country: "au" },
  { id: "idcare", title: "IDCARE", publisher: "IDCARE", url: "https://www.idcare.org/", country: "au" },
  { id: "ato-verify-report", title: "Verify or report an ATO scam", publisher: "Australian Taxation Office", url: "https://www.ato.gov.au/online-services/scams-cyber-safety-and-identity-protection/verify-or-report-an-ato-scam", country: "au" },
  { id: "servicesaustralia-mygov-scams", title: "myGov scams", publisher: "Services Australia", url: "https://www.servicesaustralia.gov.au/mygov-scams", country: "au" },

  // International tools
  { id: "google-safe-browsing", title: "Safe Browsing site status", publisher: "Google Transparency Report", url: "https://transparencyreport.google.com/safe-browsing/search", country: "intl" },
  { id: "icann-lookup", title: "ICANN Lookup (domain registration data)", publisher: "ICANN", url: "https://lookup.icann.org/", country: "intl" },
] as const satisfies readonly Source[];

export type SourceId = (typeof SOURCES)[number]["id"];

const BY_ID = new Map<string, Source>(SOURCES.map((source) => [source.id, source]));

export function getSource(id: string): Source | undefined {
  return BY_ID.get(id);
}

export function requireSource(id: SourceId): Source {
  const source = BY_ID.get(id);
  if (!source) throw new Error(`Unknown source id: ${id}`);
  return source;
}
