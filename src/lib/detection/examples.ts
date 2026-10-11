import type { CheckerKind, RiskLevel } from "./types";

/**
 * Illustrative examples written by ScamSpotter. They are modelled on common,
 * publicly reported scam formats but are not copies of real messages. Links
 * use the reserved ".example" domain so they can never lead anywhere.
 *
 * The automated tests check every example still produces its expected level,
 * so the examples shown on the site can't silently drift from the engine.
 */

export interface TextExample {
  id: string;
  label: string;
  country: "US" | "UK" | "CA" | "AU" | "Any";
  kind: "suspicious" | "legitimate";
  text: string;
  sender?: string;
  expected: RiskLevel;
}

export const TEXT_EXAMPLES: Record<CheckerKind, TextExample[]> = {
  message: [
    {
      id: "uk-parcel-fee",
      label: "Parcel 'unpaid fee' text",
      country: "UK",
      kind: "suspicious",
      text: "Royal Mail: Your parcel is on hold due to an unpaid shipping fee of £1.45. Pay within 24 hours to avoid it being returned to sender: https://royalmail-redelivery.example/pay",
      expected: "high",
    },
    {
      id: "au-hi-mum",
      label: "'Hi Mum' new-number text",
      country: "AU",
      kind: "suspicious",
      text: "Hi Mum, I dropped my phone in the bath so this is my new number. Can you send me $950 for a bill? I'll pay you back tomorrow, it's urgent x",
      expected: "high",
    },
    {
      id: "ca-refund",
      label: "Tax refund by e-Transfer",
      country: "CA",
      kind: "suspicious",
      text: "CRA: You are eligible for a tax refund of $480.25. Accept your refund by Interac e-Transfer here: https://cra-refund-canada.example/claim",
      expected: "high",
    },
    {
      id: "us-delivery",
      label: "Delivery address problem",
      country: "US",
      kind: "suspicious",
      text: "USPS: Your package could not be delivered due to an incomplete address. Update your details here: https://usps-tracking-update.example/info",
      expected: "high",
    },
    {
      id: "legit-otp",
      label: "Genuine-style verification code",
      country: "Any",
      kind: "legitimate",
      text: "Your Acme Bank verification code is 482913. It expires in 10 minutes. We will never call or text you to ask for this code. Don't share it with anyone.",
      expected: "low",
    },
    {
      id: "legit-appointment",
      label: "Appointment reminder",
      country: "Any",
      kind: "legitimate",
      text: "Hi Sam, just a reminder that your dental check-up is on Tuesday 14 October at 3:15pm. Reply C to confirm or call the practice to rearrange.",
      expected: "low",
    },
  ],
  email: [
    {
      id: "paypal-phish",
      label: "'Account limited' phishing email",
      country: "Any",
      kind: "suspicious",
      sender: "PayPal Service <service@paypa1-support.example>",
      text: "Dear Customer,\n\nWe detected unusual activity on your account and it has been temporarily limited. To restore full access, verify your information within 48 hours:\n\nhttp://paypal.account-verify.example/login\n\nFailure to verify will result in permanent suspension.\n\nPayPal Security Team",
      expected: "high",
    },
    {
      id: "bank-change",
      label: "'New bank details' invoice email",
      country: "Any",
      kind: "suspicious",
      sender: "Accounts Team <accounts@supplier-invoices.example>",
      text: "Hello,\n\nPlease note that our bank details have changed. Kindly update your records and send this month's invoice payment to our new account below. This is urgent as the old account is being closed today.\n\nRegards,\nAccounts Team",
      expected: "high",
    },
    {
      id: "hmrc-refund",
      label: "Tax rebate email",
      country: "UK",
      kind: "suspicious",
      sender: "HMRC Refunds <refunds.hmrc@gmail.com>",
      text: "Dear Taxpayer,\n\nAfter the last annual calculation of your fiscal activity we have determined that you are eligible to receive a tax refund of £326.40. Click here to claim your refund: https://hmrc-gov-uk.example/refund\n\nHM Revenue & Customs",
      expected: "high",
    },
    {
      id: "legit-colleague",
      label: "Ordinary work email",
      country: "Any",
      kind: "legitimate",
      sender: "Priya Shah <priya.shah@northwind.example>",
      text: "Hi team,\n\nThe minutes from Thursday's planning meeting are attached. Let me know by Friday if anything needs correcting.\n\nThanks,\nPriya",
      expected: "low",
    },
  ],
  job: [
    {
      id: "task-scam",
      label: "Remote 'task' job",
      country: "Any",
      kind: "suspicious",
      text: "Hi! We found your resume online and you have been selected for a remote part-time assistant role with a leading company. Earn $400 per day, no experience needed. Simply rate products from your phone and earn commission on every task. Our HR manager will interview you on Telegram. A one-time $60 registration fee is required to activate your account. Limited slots available!",
      expected: "high",
    },
    {
      id: "equipment-cheque",
      label: "Cheque for home-office equipment",
      country: "Any",
      kind: "suspicious",
      text: "Congratulations on your new position as a Data Entry Clerk! We will send you a cheque to purchase your home-office equipment from our approved vendor. Once you deposit the cheque, transfer the funds to the vendor by Zelle so they can ship your laptop.",
      expected: "high",
    },
    {
      id: "legit-uk-job",
      label: "Ordinary UK job advert",
      country: "UK",
      kind: "legitimate",
      text: "Junior Accountant, Leeds. Smith & Co Chartered Accountants is hiring a Junior Accountant to join our audit team. Salary £26,000 to £29,000 per year plus pension. Apply through the careers page on our website. Shortlisted candidates will be invited to an interview at our Leeds office.",
      expected: "low",
    },
    {
      id: "legit-us-job",
      label: "Ordinary US job advert",
      country: "US",
      kind: "legitimate",
      text: "Part-time barista wanted at Riverside Coffee, Portland. $17.50 per hour plus tips. Weekend availability required. Apply in person or email jobs@riversidecoffee.example with your availability.",
      expected: "low",
    },
  ],
  phone: [
    {
      id: "ssn-suspended",
      label: "'Your number is suspended' call",
      country: "US",
      kind: "suspicious",
      text: "This is Officer Daniels from the Social Security Administration. Your Social Security number has been suspended due to suspicious activity linked to money laundering. To avoid arrest, press 1 now to speak with an agent. You must resolve this today using Target gift cards.",
      expected: "high",
    },
    {
      id: "safe-account-call",
      label: "'Move money to a safe account' call",
      country: "UK",
      kind: "suspicious",
      text: "Hello, this is the fraud team at your bank. We've noticed suspicious transactions on your account. To protect your money we need you to move your savings to a safe account we've set up for you. Please don't discuss this with branch staff, and read me the code we've just sent to verify you.",
      expected: "high",
    },
    {
      id: "legit-callback",
      label: "Ordinary voicemail",
      country: "Any",
      kind: "legitimate",
      text: "Hi, this is Jordan from Westside Dental returning your call about rescheduling. We have an opening on Thursday at 10am. Please call us back on the main practice number when you get a chance. Thanks!",
      expected: "low",
    },
  ],
};

export interface UrlExample {
  id: string;
  label: string;
  url: string;
  kind: "suspicious" | "legitimate";
  expected: RiskLevel;
}

export const URL_EXAMPLES: UrlExample[] = [
  { id: "typo", label: "Misspelled brand on an unencrypted page", url: "http://paypa1-login.top/verify", kind: "suspicious", expected: "high" },
  { id: "subdomain", label: "Brand name used as a subdomain", url: "https://amazon.account-security-check.example/signin", kind: "suspicious", expected: "medium" },
  { id: "ip", label: "Raw IP address", url: "http://203.0.113.45/bank/login", kind: "suspicious", expected: "medium" },
  { id: "punycode", label: "Look-alike international characters", url: "https://xn--pple-43d.com/", kind: "suspicious", expected: "medium" },
  { id: "short", label: "Shortened link", url: "https://bit.ly/3Example", kind: "suspicious", expected: "medium" },
  { id: "gov", label: "Official government address", url: "https://www.gov.uk/report-suspicious-emails-websites-phishing", kind: "legitimate", expected: "low" },
];
