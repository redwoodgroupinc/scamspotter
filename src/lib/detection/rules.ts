/**
 * ScamSpotter's text rules.
 *
 * Every rule is a set of transparent regular expressions with a documented
 * severity. A rule firing means "this text contains a pattern often seen in
 * scams", never "this text is a scam". Rules in the same `group` describe the
 * same tactic, and only the strongest one in a group counts toward the score.
 *
 * Performance note: patterns avoid nested quantifiers and use bounded gaps
 * such as [^.!?\n]{0,40} so analysis stays fast on long input.
 */

import type { CheckerKind, FindingCategory, Severity } from "./types";

export interface TextRule {
  id: string;
  title: string;
  category: FindingCategory;
  severity: Severity;
  group: string;
  appliesTo: readonly CheckerKind[];
  /** Each pattern MUST use the global (g) flag. */
  patterns: readonly RegExp[];
  explanation: string;
  /** Ignore matches preceded by a negation in the same clause (e.g. "never share your code"). */
  negatable?: boolean;
  /**
   * Rules normally run on the text with web and email addresses blanked out,
   * because links are analysed separately. Set this to also match inside them.
   */
  includeAddresses?: boolean;
}

const ALL: readonly CheckerKind[] = ["message", "email", "job", "phone"];
const COMMS: readonly CheckerKind[] = ["message", "email", "phone"];
const WRITTEN: readonly CheckerKind[] = ["message", "email"];
const JOB: readonly CheckerKind[] = ["job"];

const MONEY = String.raw`(?:[$£€]|\b(?:usd|gbp|cad|aud|eur)\b ?|\b[ca]\$)`;

export const TEXT_RULES: readonly TextRule[] = [
  // ---------------------------------------------------------------- credentials
  {
    id: "code-request",
    title: "Asks you to share a verification code",
    category: "credentials",
    severity: "critical",
    group: "credentials",
    appliesTo: ALL,
    negatable: true,
    patterns: [
      /\b(?:send|share|give|tell|forward|read(?: out| back)?|provide|reply with|text (?:me|us|back)|confirm|repeat)\b[^.!?\n]{0,40}\b(?:codes?|otp|passcodes?|one[- ]time (?:pass(?:code|word)|pin|code)|verification (?:number|digits)|security (?:number|digits)|pin)\b/gi,
      /\bwhat(?:'s| is| was) the (?:code|otp|pin|passcode)\b/gi,
      /\b(?:codes?|otp|passcode)\b[^.!?\n]{0,30}\b(?:we|i) (?:just )?(?:sent|texted)\b[^.!?\n]{0,30}\b(?:to (?:me|us)|back to|verify (?:you|your identity))\b/gi,
      /\bi(?:'ve| have)? (?:accidentally |mistakenly )?(?:sent|forwarded|texted) (?:you |to you )?(?:my|a|the) (?:[\w-]{1,20} ){0,2}(?:codes?|otp|passcode)\b[^.!?\n]{0,30}\b(?:to you|to your (?:number|phone)|by mistake|by accident|accidentally)\b/gi,
      /\b(?:codes?|otp|passcode)\b[^\n]{0,80}\b(?:send|forward|text|pass) (?:it|that|this|the code) (?:back|to me)\b/gi,
    ],
    explanation:
      "One-time codes prove that you are the person signing in or approving a payment. Banks, government agencies and tech companies don't ask you to read out or forward these codes. Anyone who gets your code can take over an account or approve a transaction.",
  },
  {
    id: "password-request",
    title: "Asks for a password, PIN or login details",
    category: "credentials",
    severity: "critical",
    group: "credentials",
    appliesTo: ALL,
    negatable: true,
    patterns: [
      /\b(?:send|share|give|tell|provide|confirm|verify|reply with|submit)\b[^.!?\n]{0,30}\b(?:your|ur|the)\s(?:password|passcode|login (?:details|credentials|info)|log-in details|sign[- ]in details|username and password|pin(?: number)?|security (?:questions?|answers?)|memorable (?:word|information)|card pin|online banking (?:details|password|login))\b/gi,
    ],
    explanation:
      "Legitimate organisations never need you to send them your password, PIN or full login details. Anyone who asks for them by message or phone is trying to get into your account.",
  },
  {
    id: "account-verify-request",
    title: "Pushes you to 'verify' or 'update' account details",
    category: "credentials",
    severity: "strong",
    group: "credentials",
    appliesTo: COMMS,
    negatable: true,
    patterns: [
      /\b(?:verify|confirm|validate|update|re-?activate|unlock|restore|reconfirm|re-?validate)\s(?:your|ur|the)\s(?:account|identity|details|information|info|billing(?: (?:details|information|address))?|payment (?:details|information|method)|card(?: details)?|bank(?:ing)? (?:details|information)|personal (?:details|information)|delivery (?:details|address|information)|address)\b/gi,
      /\b(?:log ?in|sign ?in|log on)\b[^.!?\n]{0,30}\bto (?:avoid|prevent|restore|unlock|reactivate|keep|stop|verify|confirm|secure|cancel|claim|receive|release)\b/gi,
    ],
    explanation:
      "Messages that push you to 'verify' or 'update' details through a link or a reply are a common way to steal logins and card numbers. If you think there's a real problem, open the official app or type the organisation's website address yourself.",
  },
  {
    id: "personal-id-request",
    title: "Asks for ID numbers or bank details",
    category: "personal-data",
    severity: "strong",
    group: "personal-data",
    appliesTo: COMMS,
    negatable: true,
    patterns: [
      /\b(?:send|provide|confirm|verify|give|share|update|reply with|need|require|tell (?:me|us))\b[^.!?\n]{0,40}\b(?:social security(?: number)?|ssn|social insurance number|national insurance(?: number)?|ni number|tax file number|tfn|medicare (?:card )?number|date of birth|mother'?s maiden name|passport (?:number|details|copy|photo)|driver'?s licen[cs]e(?: number)?|driving licen[cs]e|full card (?:number|details)|card number|cvv|cvc|security code on the back|expiry date|account number|routing number|sort code|bsb|bank (?:account )?details|banking (?:details|information))\b/gi,
      /\b(?:send|provide|confirm|verify|give|share|update|reply with)\b[^.!?\n]{0,40}\bSIN\b/g,
    ],
    explanation:
      "Identity numbers, card numbers and bank details are exactly what criminals need for identity theft and fraud. Don't send them in reply to a message or call you didn't expect; contact the organisation through its official website or phone number instead.",
  },

  // ---------------------------------------------------------------- payment
  {
    id: "gift-card-payment",
    title: "Asks for payment in gift cards",
    category: "payment",
    severity: "critical",
    group: "payment-method",
    appliesTo: ALL,
    negatable: true,
    patterns: [
      /\b(?:buy|purchase|pick up|pay(?: with| using| in| by)?|send(?: me| us)?|load|scratch)\b[^.!?\n]{0,40}\b(?:gift ?cards?|itunes(?: cards?| vouchers?)?|apple (?:gift )?cards?|google play(?: cards?)?|steam (?:cards?|wallet)|amazon (?:gift )?cards?|ebay (?:gift )?cards?|vanilla (?:visa|cards?)|prepaid (?:visa|mastercard|cards?|debit cards?)|paysafe ?cards?|razer gold|target (?:gift )?cards?|walmart (?:gift )?cards?)\b/gi,
      /\b(?:using|with|in|by) (?:[a-z]{1,20} ){0,2}(?:gift ?cards?|itunes cards?|google play cards?|apple gift cards?|steam cards?|prepaid (?:visa )?cards?)\b/gi,
      /\b(?:photos?|pictures?|pics?|images?|screenshots?) of (?:the )?(?:back of )?(?:the )?(?:gift )?(?:cards?|codes?|receipts?)\b/gi,
      /\b(?:card numbers?|claim codes?|redemption codes?) (?:on|from) the back\b/gi,
      /\bscratch (?:off )?(?:the )?(?:back|silver|panel|strip)\b/gi,
    ],
    explanation:
      "Gift cards are for presents, not payments. Government agencies, utilities, banks and legitimate businesses don't ask you to pay bills, fines or fees with gift cards. Once you share a card's number and PIN, the money is usually gone for good.",
  },
  {
    id: "crypto-atm",
    title: "Tells you to use a Bitcoin or crypto ATM",
    category: "payment",
    severity: "critical",
    group: "payment-method",
    appliesTo: ALL,
    negatable: true,
    patterns: [/\b(?:bitcoin|crypto(?:currency)?|btc) (?:atms?|machines?|kiosks?)\b/gi],
    explanation:
      "Being told to feed cash into a Bitcoin or crypto ATM is a strong sign of a scam, especially when someone stays on the phone with you or sends you a QR code to scan. Legitimate agencies and businesses don't take payment this way.",
  },
  {
    id: "crypto-payment",
    title: "Asks for payment or deposits in cryptocurrency",
    category: "payment",
    severity: "strong",
    group: "payment-method",
    appliesTo: ALL,
    negatable: true,
    patterns: [
      /\b(?:pay|send|deposit|transfer|invest|top ?up|buy|convert|move|paid)\b[^.!?\n]{0,40}\b(?:bitcoin|btc|crypto(?:currency|currencies)?|usdt|tether|ethereum|usdc|litecoin|dogecoin|digital currency|wallet address)\b/gi,
    ],
    explanation:
      "Crypto payments are fast, hard to trace and almost impossible to reverse. Scammers use them for fake investments, fake fines and fake jobs. Government agencies and legitimate businesses don't demand crypto, and nobody legitimate can guarantee crypto profits.",
  },
  {
    id: "wire-or-p2p",
    title: "Insists on a wire transfer or payment app",
    category: "payment",
    severity: "moderate",
    group: "payment-method",
    appliesTo: ALL,
    negatable: true,
    patterns: [
      /\b(?:wire (?:transfer|the (?:money|funds|payment))|western union|moneygram|ria money transfer|money orders?)\b/gi,
      /\b(?:send|pay|transfer)\b[^.!?\n]{0,30}\b(?:via|by|through|with|on|using) (?:zelle|venmo|cash ?app|paypal friends|friends (?:and|&) family|interac(?: e-?transfer)?|e-?transfer|payid|osko|bank transfer|direct (?:bank )?deposit)\b/gi,
    ],
    explanation:
      "Scammers prefer payment methods that move money instantly and are hard to reverse, such as wire transfers, money transfer services and payment apps. They're fine for paying people you know, but be careful when a stranger or a supposed company insists on them.",
  },
  {
    id: "safe-account",
    title: "Asks you to move money to a 'safe' account",
    category: "payment",
    severity: "critical",
    group: "safe-account",
    appliesTo: ALL,
    negatable: true,
    patterns: [
      /\bsafe (?:bank )?accounts?\b/gi,
      /\b(?:move|transfer|send|deposit)\b[^.!?\n]{0,30}\b(?:money|funds|savings|balance|cash)\b[^.!?\n]{0,40}\b(?:secure|protected|temporary|new|alternative|holding) (?:bank )?accounts?\b/gi,
      /\b(?:protect|safeguard|secure) your (?:money|funds|savings)\b[^.!?\n]{0,50}\b(?:move|transfer|withdraw|send)\b/gi,
    ],
    explanation:
      "Banks and police never ask you to move money into a 'safe', 'secure' or 'holding' account to protect it. The account belongs to the criminal. If someone asks you to do this, hang up and call your bank using the number on your card.",
  },
  {
    id: "courier-collect",
    title: "Says someone will collect your card, cash or valuables",
    category: "payment",
    severity: "critical",
    group: "safe-account",
    appliesTo: ["message", "phone"],
    patterns: [
      /\b(?:courier|driver|agent|officer|someone|representative|colleague)\b[^.!?\n]{0,30}\b(?:will|to|can) (?:come|collect|pick up|pickup|visit)\b[^.!?\n]{0,40}\b(?:cards?|cash|money|gold|valuables|pin)\b/gi,
    ],
    explanation:
      "Banks and police never send a courier to collect your bank card, PIN, cash or valuables. This is a well-known impersonation scam.",
  },
  {
    id: "money-request",
    title: "Asks you to send money",
    category: "payment",
    severity: "moderate",
    group: "money-request",
    appliesTo: COMMS,
    negatable: true,
    patterns: [
      new RegExp(
        String.raw`\b(?:can|could) you (?:please )?(?:send|lend|transfer|pay|loan|wire)\b[^.!?\n]{0,30}(?:\bmoney\b|\bcash\b|\bfunds\b|${MONEY}|\d)`,
        "gi",
      ),
      new RegExp(
        String.raw`\b(?:i|we) need (?:you to )?(?:send|transfer|pay)\b[^.!?\n]{0,30}(?:\bmoney\b|${MONEY}|\d|\bcash\b|\bfunds\b)`,
        "gi",
      ),
      /\bneed (?:some |the )?(?:money|cash|funds) (?:urgently|asap|today|now|right away|immediately|tonight)\b/gi,
      /\b(?:send|transfer)\b[^.!?\n]{0,20}\b(?:money|funds|the payment)\b[^.!?\n]{0,30}\b(?:urgently|asap|today|now|immediately|right away|tonight)\b/gi,
    ],
    explanation:
      "A request for money deserves extra care when it's unexpected, comes from a new number or account, or comes with a story you can't check. Contact the person through a number or account you already know before sending anything.",
  },

  // ---------------------------------------------------------------- pressure & threats
  {
    id: "urgency",
    title: "Creates urgency or a deadline",
    category: "pressure",
    severity: "moderate",
    group: "pressure",
    appliesTo: ALL,
    patterns: [
      /\b(?:urgent(?:ly)?|immediately|immediate action|act now|action required|right away|asap|as soon as possible|without delay|don'?t delay|time[- ]sensitive|respond (?:now|today|immediately)|final (?:notice|warning|reminder|attempt|demand)|last (?:chance|warning|notice|attempt|reminder)|expires? (?:today|tonight|soon|shortly)|today only|before it'?s too late|failure to (?:respond|comply|act|pay|update|verify))\b/gi,
      /\bwithin (?:the next )?(?:\d{1,3}|one|two|three|twelve|twenty[- ]four|forty[- ]eight) ?(?:hours?|hrs?|minutes?|mins?)\b/gi,
    ],
    explanation:
      "Deadlines and 'act now' language are designed to stop you pausing to check. Real organisations generally give you time and other ways to confirm a problem.",
  },
  {
    id: "account-threat",
    title: "Warns that an account is locked, suspended or compromised",
    category: "threat",
    severity: "moderate",
    group: "threat",
    appliesTo: COMMS,
    patterns: [
      /\b(?:account|card|service|access|subscription|membership|number|profile|mailbox|apple id|icloud|benefits?|payments?)\b[^.!?\n]{0,25}\b(?:has been|have been|will be|is being|is|are|was|being) (?:temporarily |permanently )?(?:suspended|locked|blocked|frozen|closed|disabled|restricted|deactivated|terminated|limited|on hold|cancell?ed|compromised|deleted)\b/gi,
      /\b(?:suspend|lock|block|freeze|close|disable|restrict|deactivate|terminate|cancel|delete)\s(?:your|ur)\s(?:account|card|service|access|number|mailbox|benefits?)\b/gi,
      /\bunusual (?:sign[- ]in |login |log-in )?activity\b|\bsuspicious (?:activity|login|sign[- ]in|transaction|charge|payment)s?\b|\bunauthori[sz]ed (?:access|transaction|charge|payment|purchase|login)s?\b/gi,
    ],
    explanation:
      "Warnings that your account is locked or has been hacked create alarm so you act before thinking. Check by opening the official app or typing the company's website address yourself, not through the message.",
  },
  {
    id: "legal-threat",
    title: "Threatens arrest, legal action or penalties",
    category: "threat",
    severity: "strong",
    group: "threat",
    appliesTo: ALL,
    negatable: true,
    patterns: [
      /\b(?:arrest(?:ed)?|arrest warrant|warrant (?:for|has been)|police (?:will|are coming|have been notified)|legal action|law ?suit|court (?:case|summons|order|hearing|action)|prosecut(?:e|ed|ion)|deport(?:ed|ation)?|jail|prison|criminal (?:charges?|case|investigation|record)|bailiffs?|debt collectors?|enforcement (?:agents?|action)|seiz(?:e|ed|ure) (?:of )?your)\b/gi,
    ],
    explanation:
      "Threats of arrest, deportation, court action or bailiffs are classic pressure tactics. Government agencies don't threaten immediate arrest by text or phone, and they don't demand on-the-spot payment to make a problem go away.",
  },
  {
    id: "tech-support-scare",
    title: "Claims your device is infected or hacked",
    category: "threat",
    severity: "strong",
    group: "tech-scare",
    appliesTo: COMMS,
    negatable: true,
    patterns: [
      /\b(?:your (?:computer|device|pc|laptop|phone|mac|iphone|system|router|ip address)|we (?:have )?detected)\b[^.!?\n]{0,40}\b(?:virus|viruses|malware|infected|hacked|compromised|trojan|spyware|pornographic|illegal (?:activity|content))\b/gi,
      /\b(?:virus|malware|trojan|spyware)\b[^.!?\n]{0,30}\b(?:detected|found|infected)\b/gi,
      /\b(?:call|contact) (?:microsoft|apple|windows|technical|tech) (?:support|help|security)\b/gi,
    ],
    explanation:
      "Messages or calls claiming your computer or phone is infected are a common tech-support scam. Microsoft, Apple and security companies don't contact you out of the blue about viruses. Never call a number from a pop-up or unexpected message.",
  },
  {
    id: "secrecy",
    title: "Asks you to keep it secret or stay on the line",
    category: "secrecy",
    severity: "strong",
    group: "secrecy",
    appliesTo: ALL,
    patterns: [
      /\b(?:don'?t|do not|never) (?:tell|inform|discuss (?:this )?with|mention (?:this|it) to|talk to|speak to|contact) (?:anyone|anybody|your (?:bank|family|husband|wife|partner|children|kids|son|daughter|friends|colleagues)|the bank|bank staff|the police|branch staff)\b(?![^.!?\n]{0,30}\b(?:pin|pins|password|passwords|passcode|codes?|otp|one[- ]time|security (?:code|number|details)|card (?:number|details)|log-?in|account details)\b)/gi,
      /\bkeep (?:this|it|our conversation|the matter) (?:confidential|secret|private|between us|to yourself)\b/gi,
      /\b(?:if|when) (?:the )?(?:bank|teller|cashier|staff|anyone) asks?\b[^.!?\n]{0,40}\b(?:say|tell (?:them|her|him))\b/gi,
      /\b(?:don'?t|do not) (?:hang up|end the call|disconnect)\b|\bstay on the (?:line|phone|call)\b(?! (?:and|while|until|for) (?:an?|the|our) (?:next )?(?:available )?(?:agent|advisor|adviser|representative|operator|team member|member of (?:our|the) team)\b)/gi,
    ],
    explanation:
      "Being told to keep a request secret, to give bank staff a cover story, or to stay on the line is a big red flag. Scammers isolate people so that friends, family or bank staff can't spot what's happening.",
  },

  // ---------------------------------------------------------------- lures
  {
    id: "prize-lure",
    title: "Unexpected prize, reward or giveaway",
    category: "lure",
    severity: "strong",
    group: "lure",
    appliesTo: COMMS,
    negatable: true,
    patterns: [
      /\b(?:you(?:'ve| have)? (?:won|been selected|been chosen|been picked) (?:a|an|the|our|for)|you are (?:a |our |the )?(?:lucky )?winner|you(?:'re| are) (?:our |the |a )?(?:lucky |selected )?winner|winning (?:number|ticket|entry|notification)|claim (?:your|the) (?:prize|reward|winnings|gift|bonus|cash|jackpot)|unclaimed (?:prize|reward|funds|winnings)|lottery|sweepstakes?|jackpot|prize draw|cash prize|free (?:iphone|ipad|gift card|prize|reward|trip|vacation|holiday|cruise))\b/gi,
    ],
    explanation:
      "Unexpected prizes, rewards and giveaways, especially for competitions you didn't enter, are a common hook. The 'prize' usually comes with a fee, a request for card details, or a link to a fake site.",
  },
  {
    id: "refund-lure",
    title: "Unexpected refund, rebate or compensation",
    category: "lure",
    severity: "moderate",
    group: "lure",
    appliesTo: COMMS,
    negatable: true,
    patterns: [
      /\b(?:you(?:'re| are) (?:eligible|entitled|due|owed)|you have (?:an? )?(?:pending|outstanding|unclaimed))\b[^.!?\n]{0,30}\b(?:refund|rebate|reimbursement|compensation|tax return|payment|credit|benefit|grant|stimulus|money)\b/gi,
      /\b(?:claim|receive|collect|process|get) (?:your|the) (?:tax )?(?:refund|rebate|reimbursement|compensation|overpayment)\b/gi,
      /\b(?:tax refund|overpaid tax|tax rebate)\b/gi,
    ],
    explanation:
      "Messages about refunds, rebates or compensation you weren't expecting often lead to fake forms that collect bank or card details. Tax agencies generally pay refunds automatically or through your official online account.",
  },
  {
    id: "advance-fee",
    title: "Asks for a fee to release money, a prize or a parcel",
    category: "lure",
    severity: "strong",
    group: "advance-fee",
    appliesTo: COMMS,
    negatable: true,
    patterns: [
      /\b(?:pay|paying|send|settle|cover)\b[^.!?\n]{0,25}\b(?:fees?|charges?|duty|duties|deposit|tax)\b[^.!?\n]{0,40}\b(?:to|before|so (?:that )?(?:we|you) can|in order to)\s(?:release|receive|claim|unlock|deliver|redeliver|withdraw|process|transfer|collect|get|access|activate)\b/gi,
      /\bto (?:release|receive|claim|unlock|withdraw|collect|deliver|redeliver|process) (?:your|the) (?:funds|money|prize|parcel|package|item|winnings|inheritance|payment|loan|order|delivery|shipment)\b[^.!?\n]{0,40}\b(?:pay|fee|charge|deposit)\b/gi,
      /\b(?:unpaid|outstanding|pending|small|missing) (?:shipping|delivery|postage|customs|redelivery|re-delivery|handling|courier|import) (?:fees?|charges?|costs?|duty|duties|payments?)\b/gi,
      /\b(?:inheritance|next of kin|unclaimed (?:funds|estate)|consignment box|diplomatic (?:bag|courier))\b/gi,
      /\b(?:won'?t|will not|wouldn'?t|refuse to) (?:let me|release me|allow me to)\b[^.!?\n]{0,40}\b(?:until|unless) (?:i|we) (?:pay|send|settle|clear)\b/gi,
    ],
    explanation:
      "Being asked to pay a small fee to receive a larger sum, a prize or a parcel is a classic advance-fee trick. Once you pay, there's always another fee, and the money or item never arrives.",
  },
  {
    id: "investment-lure",
    title: "Promises guaranteed or unusually high returns",
    category: "lure",
    severity: "strong",
    group: "investment",
    appliesTo: ALL,
    negatable: true,
    patterns: [
      /\b(?:guaranteed (?:returns?|profits?|income|earnings|payouts?)|risk[- ]free (?:investment|returns?|profits?|trading)|double your (?:money|investment|bitcoin|crypto)|passive income|trading (?:platform|signals|bot|account manager)|forex (?:trading|signals)|investment (?:opportunity|plan|package)|mining pool|liquidity mining)\b/gi,
      /\b\d{2,4} ?% (?:returns?|profit|roi|interest)\b/gi,
      /\b\d{1,3}(?:\.\d+)? ?% (?:(?:daily|weekly|monthly|guaranteed|fixed) (?:returns?|profits?|roi|interest|gains?)|(?:daily|weekly|per day|per week|a day|a week|every day|every week)\b)/gi,
    ],
    explanation:
      "Promises of guaranteed, high or 'risk-free' returns are a hallmark of investment fraud. Real investments carry risk, and nobody legitimate can guarantee profits.",
  },
  {
    id: "unexpected-charge",
    title: "Claims you've been charged and asks you to call or reply",
    category: "lure",
    severity: "moderate",
    group: "story",
    appliesTo: COMMS,
    patterns: [
      new RegExp(
        String.raw`\b(?:order|purchase|subscription|payment|charge|transaction|renewal|invoice)\b[^.!?\n]{0,40}${MONEY}\s?\d[\d,]*(?:\.\d{2})?[^.!?\n]{0,80}\b(?:if you did not|if you didn'?t|if this wasn'?t you|not you|to cancel|cancel this|dispute|call us|contact us)\b`,
        "gi",
      ),
      /\b(?:auto[- ]?renew(?:al|ed)?|renewal|subscription)\b[^.!?\n]{0,60}\b(?:call|contact|reply)\b[^.!?\n]{0,30}\b(?:cancel|refund|dispute)\b/gi,
    ],
    explanation:
      "Messages about a charge or renewal you don't recognise, with a number to call 'if this wasn't you', are a common opener for refund and tech-support scams. Check your account directly through the official app or website.",
  },
  {
    id: "toll-fine",
    title: "Claims you owe a toll, fine or penalty",
    category: "lure",
    severity: "moderate",
    group: "story",
    appliesTo: COMMS,
    patterns: [
      /\b(?:unpaid|outstanding|overdue) (?:tolls?|toll charges?|parking (?:fines?|tickets?|charges?)|traffic (?:fines?|tickets?|violations?)|penalt(?:y|ies)|fines?|road (?:tolls?|charges?)|congestion charges?|e-?tolls?)\b/gi,
      /\btoll (?:balance|violation|notice|bill)\b|\bpenalty charge notice\b/gi,
    ],
    explanation:
      "Texts about unpaid tolls, parking fines or traffic penalties are a widely reported scam lure. Check with the toll operator or issuing authority through its official website or app, not the link in the message.",
  },
  {
    id: "delivery-problem",
    title: "Claims there's a problem with a delivery",
    category: "lure",
    severity: "moderate",
    group: "story",
    appliesTo: COMMS,
    patterns: [
      /\b(?:package|parcel|delivery|shipment|item|order)\b[^.!?\n]{0,30}\b(?:could not be|couldn'?t be|cannot be|can'?t be|was not|wasn'?t|unable to be) (?:delivered|dispatched|processed)\b/gi,
      /\b(?:package|parcel|delivery|shipment)\b[^.!?\n]{0,30}\b(?:has been|is|was) (?:held|returned|suspended|stopped|on hold|undeliverable|detained)\b/gi,
      /\b(?:incomplete|invalid|incorrect|missing|unclear|wrong) (?:address|house number|street number|postcode|post code|zip ?code|delivery (?:address|information|details))\b/gi,
      /\b(?:re-?deliver(?:y)?|re-?schedule (?:your |the )?delivery|missed (?:delivery|parcel)|delivery (?:attempt|failed|failure))\b/gi,
    ],
    explanation:
      "'Missed delivery' and 'incomplete address' messages are among the most common scam texts. Check deliveries by going to the retailer's or courier's official website or app and entering your tracking number yourself.",
  },
  {
    id: "new-number",
    title: "Claims to be someone you know on a new number",
    category: "contact",
    severity: "moderate",
    group: "new-contact",
    appliesTo: ["message", "phone"],
    patterns: [
      /\b(?:this is|it'?s) my new (?:number|phone|mobile|cell)\b/gi,
      /\b(?:i |i've |i have )?(?:lost|broke|dropped|smashed|cracked) my (?:phone|mobile|cell)\b/gi,
      /\bmy (?:old )?(?:phone|mobile|cell) (?:is|was|got) (?:broken|lost|stolen|damaged)\b/gi,
      /\bsave (?:this|my new) number\b/gi,
    ],
    explanation:
      "'Hi Mum/Dad, this is my new number' is a well-known opener. If the message goes on to ask for money, call your family member on the number you already have, or ask a question only they would know.",
  },
  {
    id: "family-emergency",
    title: "Describes an emergency to rush you",
    category: "lure",
    severity: "moderate",
    group: "story",
    appliesTo: COMMS,
    patterns: [
      /\b(?:i'?m|i am|i've been|i have been|he'?s|she'?s|they'?ve been)\b[^.!?\n]{0,20}\b(?:in (?:an? )?(?:accident|hospital|jail|custody|trouble)|arrested|stranded|stuck abroad|robbed|kidnapped)\b/gi,
      /\bneed (?:bail|bail money|a lawyer)\b|\bdon'?t tell (?:mum|mom|dad|grandma|grandpa|the family)\b/gi,
    ],
    explanation:
      "Emergency stories, such as an accident, an arrest or being stranded, are used to rush relatives into sending money. Voice cloning and spoofed numbers can make these calls convincing. Hang up and call the person directly.",
  },

  // ---------------------------------------------------------------- impersonation
  {
    id: "impersonation-government",
    title: "Mentions a government agency",
    category: "impersonation",
    severity: "moderate",
    group: "impersonation",
    appliesTo: COMMS,
    patterns: [
      /\b(?:irs|internal revenue service|social security administration|medicare|federal trade commission|fbi|department of (?:justice|homeland security|labor)|uscis|us treasury|hmrc|hm revenue|dvla|dwp|home office|tv licensing|gov\.uk|council tax|canada revenue agency|service canada|rcmp|canada border services|cbsa|ircc|australian taxation office|mygov|centrelink|services australia|australian federal police|government (?:department|agency|official|grant)|tax (?:office|department|agency|authority))\b/gi,
      /\b(?:SSA|CRA|ATO|AFP|FTC)\b/g,
    ],
    explanation:
      "Scammers often pretend to be government agencies because people take them seriously. A message mentioning an agency isn't suspicious on its own, but contact the agency using details from its official website, not from the message.",
  },
  {
    id: "impersonation-financial",
    title: "Mentions a bank or payment service",
    category: "impersonation",
    severity: "moderate",
    group: "impersonation",
    appliesTo: COMMS,
    patterns: [
      /\b(?:your bank|the bank'?s|bank'?s (?:fraud|security) (?:team|department)|fraud (?:department|team|prevention team|investigations? (?:team|unit))|chase (?:bank|account|card|fraud|alert|security|online)|jpmorgan chase|bank of america|wells fargo|citibank|capital one|td bank|td canada trust|barclays|hsbc|lloyds bank|natwest|santander|halifax (?:bank|account)|nationwide (?:building society|account)|monzo|starling bank|revolut|royal bank of canada|rbc|scotiabank|bmo|bank of montreal|cibc|desjardins|commonwealth bank|commbank|westpac|national australia bank|st\.? ?george bank|bendigo bank|paypal|venmo|zelle|cash app|coinbase|binance|interac|american express|amex)\b/gi,
      /\b(?:NAB|ANZ)\b/g,
    ],
    explanation:
      "Banks do send genuine alerts, but scammers copy them closely and can even make texts appear in the same thread as real ones. Never use links or phone numbers from an unexpected message: use the number on the back of your card or the official app.",
  },
  {
    id: "impersonation-delivery",
    title: "Mentions a delivery company",
    category: "impersonation",
    severity: "moderate",
    group: "impersonation",
    appliesTo: COMMS,
    patterns: [
      /\b(?:usps|postal service|fedex|dhl|royal mail|parcelforce|evri|hermes|dpd|yodel|canada post|postes canada|purolator|australia post|auspost|startrack|aramex|couriers please|amazon (?:delivery|logistics|parcel))\b/gi,
      /\bUPS\b/g,
    ],
    explanation:
      "Delivery companies are among the most impersonated brands. Real delivery updates usually come from the retailer or courier you ordered with. Check by entering your tracking number on the official website or app.",
  },
  {
    id: "impersonation-tech",
    title: "Mentions a tech company or support team",
    category: "impersonation",
    severity: "moderate",
    group: "impersonation",
    appliesTo: COMMS,
    patterns: [
      /\b(?:microsoft|windows (?:support|defender|security)|apple (?:support|id|care)|icloud|google (?:support|account|security)|amazon (?:support|security|prime|account)|netflix|norton|mcafee|geek squad|tech(?:nical)? support|it (?:support|department|helpdesk)|help ?desk|whatsapp (?:team|support)|facebook (?:security|support)|instagram (?:support|team))\b/gi,
    ],
    explanation:
      "Tech companies and their support teams are frequently impersonated. They don't usually contact you unprompted about account problems, refunds or viruses. Go to the company's website or app yourself to check.",
  },

  // ---------------------------------------------------------------- software
  {
    id: "remote-access",
    title: "Mentions remote-access software",
    category: "software",
    severity: "critical",
    group: "software",
    appliesTo: ALL,
    patterns: [
      /\b(?:any ?desk|team ?viewer|ultra ?viewer|quicksupport|quick ?assist|logmein|rust ?desk|supremo|screen ?connect|connect ?wise|splashtop|ammyy|zoho assist|aeroadmin)\b/gi,
    ],
    explanation:
      "Remote-access apps let someone else see and control your device. Scammers posing as tech support, banks or refund teams use them to get into online banking or install malware. Only use remote access with an IT provider you contacted yourself.",
  },
  {
    id: "remote-access-request",
    title: "Asks for remote access or screen sharing",
    category: "software",
    severity: "strong",
    group: "software",
    appliesTo: ALL,
    negatable: true,
    patterns: [
      /\b(?:remote (?:access|desktop|control|support (?:app|tool|software))|(?:share|sharing) your screen|screen[- ]?shar(?:e|ing) (?:with (?:me|us)|so (?:i|we) can))\b/gi,
    ],
    explanation:
      "Giving a stranger remote access or showing them your screen lets them watch you log in to banking apps and see one-time codes. Only share your screen with someone you contacted through official channels.",
  },
  {
    id: "sideload-app",
    title: "Asks you to install an app from outside the app store",
    category: "software",
    severity: "critical",
    group: "software",
    appliesTo: ALL,
    patterns: [
      /\.apk\b|\bapk file\b|\b(?:unknown sources|install unknown apps|developer mode|testflight|mdm profile|configuration profile)\b/gi,
    ],
    explanation:
      "Installing apps or profiles from a link, rather than your phone's official app store, can give criminals access to your messages, banking apps and one-time codes.",
  },
  {
    id: "app-install",
    title: "Asks you to download or install something",
    category: "software",
    severity: "moderate",
    group: "software",
    appliesTo: ALL,
    negatable: true,
    patterns: [
      /\b(?:download|install)\b[^.!?\n]{0,30}\b(?:this|the|our|an?|new|security|following)\b[^.!?\n]{0,20}\b(?:app|application|software|program|plugin|extension|profile|certificate)\b/gi,
    ],
    explanation:
      "Plenty of legitimate companies promote their apps, but an unexpected message asking you to install something can be a route to malware. Only install apps from your device's official store, and search for them yourself rather than using a link.",
  },

  // ---------------------------------------------------------------- email-specific
  {
    id: "attachment-lure",
    title: "Pushes you to open an attachment",
    category: "software",
    severity: "moderate",
    group: "attachment",
    appliesTo: WRITTEN,
    patterns: [
      /\b(?:open|download|view|see|review|check) (?:the )?(?:attached|attachment|enclosed)\b[^.!?\n]{0,40}\b(?:invoice|payment|receipt|document|statement|voicemail|voice ?message|fax|order|remittance|contract|purchase order|shipping label|notice|bill)\b/gi,
      /\b(?:attached|enclosed) (?:is|are|please find) (?:the |your |an? )?(?:invoice|payment|receipt|statement|voicemail|voice ?message|fax|remittance|shipping label|notice|bill)\b/gi,
    ],
    explanation:
      "Unexpected invoices, voicemails, receipts and 'documents to sign' are common malware and phishing lures. If you weren't expecting it, contact the sender another way before opening it.",
  },
  {
    id: "risky-file-type",
    title: "Mentions a risky file type",
    category: "software",
    severity: "strong",
    group: "attachment",
    appliesTo: WRITTEN,
    patterns: [
      /\b[\w-]{1,60}\.(?:exe|scr|jse|vbs|vbe|bat|cmd|ps1|iso|img|vhd|html?|shtml|svg|zip|rar|7z|docm|xlsm|pptm|lnk|msi|jar|hta|one|apk|dmg)\b/gi,
    ],
    explanation:
      "Program files, archives, web pages and macro-enabled documents sent by email are common ways to deliver malware or fake login pages. Don't open them unless you were expecting them and have confirmed with the sender.",
  },
  {
    id: "enable-macros",
    title: "Tells you to enable macros or editing",
    category: "software",
    severity: "critical",
    group: "attachment",
    appliesTo: WRITTEN,
    patterns: [/\benable (?:the )?(?:macros?|content|editing)\b/gi],
    explanation:
      "Documents that ask you to 'enable content' or 'enable macros' to see them are a classic way of running malware on your computer.",
  },
  {
    id: "protected-attachment",
    title: "Supplies a password for an attachment",
    category: "software",
    severity: "moderate",
    group: "attachment-password",
    appliesTo: WRITTEN,
    patterns: [
      /\bpassword[- ]protected (?:attachment|file|zip|document|pdf|archive)\b/gi,
      /\b(?:attachment|file|zip|document|pdf|archive)\b[^.!?\n]{0,30}\bpassword (?:is|:)/gi,
    ],
    explanation:
      "Password-protected attachments can't be scanned by most email security filters, which is why scammers use them. Be cautious unless you expected the file.",
  },
  {
    id: "bank-details-change",
    title: "Says payment or bank details have changed",
    category: "payment",
    severity: "critical",
    group: "bank-change",
    appliesTo: WRITTEN,
    patterns: [
      /\b(?:our|my|the) (?:bank(?:ing)?|account|payment|remittance|wire) (?:details|information|info|instructions) (?:have|has) (?:changed|been (?:changed|updated))\b/gi,
      /\b(?:new|updated|change of|change in|changed) (?:bank(?:ing)?|account|payment|remittance|wire) (?:details|information|instructions)\b/gi,
      /\b(?:pay|send|remit|transfer)\b[^.!?\n]{0,30}\b(?:to|into) (?:our|the|a|this) new (?:bank )?account\b/gi,
    ],
    explanation:
      "A message saying a supplier, landlord, solicitor, builder or colleague has 'new bank details' is a common business email compromise trick. Always confirm by phone using a number you already have, never one from the message.",
  },
  {
    id: "boss-favour",
    title: "Asks for a quick favour or whether you're available",
    category: "pressure",
    severity: "moderate",
    group: "favour",
    appliesTo: WRITTEN,
    patterns: [
      /\b(?:are you (?:available|at your desk|free right now)|i need (?:you to )?(?:do me )?a (?:quick |small )?favou?r|quick favou?r)\b/gi,
    ],
    explanation:
      "'Are you available?' and 'I need a quick favour' are typical openers in scams that impersonate a manager or colleague, often leading to a request for gift cards or an urgent payment. Check with the person directly.",
  },
  {
    id: "mailbox-scare",
    title: "Warns about mailbox storage or password expiry",
    category: "threat",
    severity: "moderate",
    group: "threat",
    appliesTo: WRITTEN,
    patterns: [
      /\b(?:mailbox|email|inbox|storage|cloud storage|icloud storage|drive) (?:is |has )?(?:full|almost full|over (?:quota|limit)|exceeded|reached its limit)\b/gi,
      /\bpassword (?:expires|expiring|will expire|has expired)\b/gi,
      /\b(?:email|account) (?:will be|is scheduled to be) (?:deleted|deactivated|closed)\b/gi,
    ],
    explanation:
      "'Mailbox full' and 'password expiring' notices are popular ways to steal email passwords. Check storage or password settings by signing in to your email provider directly.",
  },
  {
    id: "generic-greeting",
    title: "Uses a generic greeting",
    category: "pressure",
    severity: "weak",
    group: "generic",
    appliesTo: WRITTEN,
    patterns: [
      /\b(?:dear|hello|hi|attention) (?:valued )?(?:customer|user|client|member|account ?holder|sir(?:\/| or )madam|sir|madam|beneficiary|recipient|subscriber|taxpayer|winner)\b/gi,
    ],
    explanation:
      "Generic greetings are common in mass scam messages. Many legitimate bulk emails use them too, so on its own this is a weak signal.",
  },
  {
    id: "click-link",
    title: "Pushes you to click a link",
    category: "link",
    severity: "weak",
    group: "call-to-action",
    appliesTo: WRITTEN,
    patterns: [/\b(?:click|tap|follow|open|visit) (?:on )?(?:the |this )?(?:link|here|below|button)\b/gi],
    explanation:
      "A request to click a link isn't suspicious on its own, but it's how most phishing works. It's safer to go to the website yourself than to use a link in an unexpected message.",
  },

  // ---------------------------------------------------------------- phone-specific
  {
    id: "id-number-suspended",
    title: "Claims your ID number is suspended or linked to a crime",
    category: "threat",
    severity: "critical",
    group: "id-number",
    appliesTo: COMMS,
    negatable: true,
    patterns: [
      /\b(?:social security|ssn|social insurance|sin|national insurance|tax file|tfn)\s?(?:number|card)?\b[^.!?\n]{0,30}\b(?:suspended|blocked|frozen|compromised|cancell?ed|deactivated|used (?:in|for) (?:a )?(?:crime|illegal|fraud|money laundering|drug))\b/gi,
    ],
    explanation:
      "Government agencies don't 'suspend' Social Security, Social Insurance, National Insurance or Tax File Numbers by phone, and they don't call to say your number was used in a crime. This is a well-known government-impersonation script.",
  },
  {
    id: "press-key",
    title: "Recorded message asking you to press a key",
    category: "contact",
    severity: "moderate",
    group: "robocall",
    appliesTo: ["message", "phone"],
    patterns: [/\bpress (?:1|one|2|two|5|five|9|nine|0|zero|the (?:number|key))\b/gi],
    explanation:
      "Pre-recorded calls asking you to 'press 1' to speak to someone about a problem are often robocall scams. Pressing a key can also confirm that your number is active.",
  },
  {
    id: "callback-number",
    title: "Asks you to call back on a number it provides",
    category: "contact",
    severity: "weak",
    group: "callback",
    appliesTo: COMMS,
    patterns: [/\b(?:call|ring|phone|contact)\b[^.!?\n]{0,30}\b(?:on|at)\s?\+?[\d(][\d\s().-]{6,18}\d/gi],
    explanation:
      "Scammers often provide their own 'helpline' number. If you need to call an organisation, use a number from its official website, a statement or the back of your card, not the number in the message.",
  },

  // ---------------------------------------------------------------- job-specific
  {
    id: "job-upfront-fee",
    title: "Asks you to pay to get or start the job",
    category: "employment",
    severity: "critical",
    group: "job-fee",
    appliesTo: JOB,
    negatable: true,
    patterns: [
      /\b(?:pay|paying|send|deposit|transfer)\b[^.!?\n]{0,25}\b(?:registration|application|training|onboarding|processing|placement|recruitment|enrol(?:l)?ment|membership|starter kit|background (?:check|screening)|dbs(?: check)?|police check|criminal record check|certification|uniform|equipment|admin(?:istration)?|security|activation|refundable|small|one[- ]time)\s(?:fees?|costs?|charges?|payments?|deposits?)\b/gi,
      new RegExp(
        String.raw`\b(?:registration|application|training|onboarding|processing|placement|recruitment|starter kit|background check|dbs|uniform|equipment|activation) (?:fees?|costs?|charges?|deposits?) (?:of|is|will be|:)\s?(?:${MONEY}|\d)`,
        "gi",
      ),
      /\b(?:registration|application|training|onboarding|processing|activation|starter|admin(?:istration)?|enrol(?:l)?ment|membership|background check)\b[^.!?\n]{0,15}\b(?:fees?|deposits?|payments?|charges?)\b[^.!?\n]{0,30}\b(?:required|needed|mandatory|necessary|payable)\b/gi,
      /\b(?:you|candidates?|applicants?|new (?:hires?|starters?|employees?)) (?:must|will (?:need to|have to)|need to|have to|are required to) (?:first )?(?:pay|purchase|buy|deposit|send money)\b/gi,
    ],
    explanation:
      "Genuine employers pay you; they don't charge you to get a job. Fees for registration, training, background checks, starter kits or equipment are one of the clearest signs of a job scam.",
  },
  {
    id: "job-equipment-cheque",
    title: "Involves buying equipment or depositing a cheque",
    category: "employment",
    severity: "critical",
    group: "job-fee",
    appliesTo: JOB,
    patterns: [
      /\b(?:buy|purchase|order|pay for)\b[^.!?\n]{0,40}\b(?:equipment|laptop|computer|software|office supplies|work ?station|starter kit|devices?|printer|materials)\b[^.!?\n]{0,50}\b(?:from|through|via) (?:our|the|a|an|this) (?:approved |designated |preferred |certified |authori[sz]ed |specific |recommended |official |trusted )?(?:vendor|supplier|seller|store|shop|provider|partner)\b/gi,
      /\b(?:we(?:'ll| will)?|the company will|company will) (?:send|mail|issue) (?:you )?(?:a )?(?:cheque|check|payment)\b[^.!?\n]{0,60}\b(?:to (?:buy|purchase|cover)|for (?:equipment|supplies|your (?:office|home office|workstation)))\b/gi,
      /\b(?:deposit|cash|mobile deposit) (?:the|this|a) (?:cheque|check)\b[^.!?\n]{0,60}\b(?:send|transfer|wire|forward|buy|purchase|pay|return)\b/gi,
    ],
    explanation:
      "A common job scam sends you a cheque to 'buy equipment' from a particular supplier. The cheque later bounces, and the money you sent to the 'supplier' is lost. Real employers supply equipment directly or reimburse you through normal payroll.",
  },
  {
    id: "job-sensitive-info",
    title: "Asks for sensitive personal or bank details early",
    category: "employment",
    severity: "strong",
    group: "personal-data",
    appliesTo: JOB,
    negatable: true,
    patterns: [
      /\b(?:send|provide|submit|share|upload|forward|email|text|need|require)\b[^.!?\n]{0,40}\b(?:social security|ssn|national insurance|ni number|social insurance|tax file number|tfn|bank (?:account|details|information|login)|banking (?:details|information|login)|online banking|routing number|sort code|bsb|account number|credit card|debit card|card details|passport|driver'?s licen[cs]e|driving licen[cs]e|photo id|id card|date of birth|selfie)\b/gi,
      /\b(?:send|provide|submit|share|upload|need|require)\b[^.!?\n]{0,40}\bSIN\b/g,
    ],
    explanation:
      "Employers do need ID and bank details eventually, but normally after a formal written offer and through a secure onboarding process. Being asked for your Social Security, National Insurance, SIN or TFN, bank login or ID photos before an interview, or over chat, is a warning sign of identity theft.",
  },
  {
    id: "job-chat-interview",
    title: "Interview or hiring happens over chat apps",
    category: "employment",
    severity: "strong",
    group: "job-process",
    appliesTo: JOB,
    includeAddresses: true,
    patterns: [
      /\b(?:interview|onboarding|training|hiring (?:process|manager)|recruit(?:er|ment)|hr (?:manager|department|team|representative|assistant))\b[^.!?\n]{0,60}\b(?:telegram|whatsapp|signal|wickr|wechat|google ?chat|hangouts|kik|text messages?|sms|instant messag(?:e|ing)|chat app|teams chat|skype chat|discord)\b/gi,
      /\b(?:telegram|whatsapp|signal|wickr|wechat|google ?chat|hangouts|kik|discord)\b[^.!?\n]{0,60}\b(?:interview|onboarding|hiring manager|recruiter|hr (?:manager|department|team)|job offer|position|vacancy)\b/gi,
      /\b(?:add|message|contact|text|chat with) (?:me|us|our (?:hr|recruiter|manager|team))\b[^.!?\n]{0,20}\b(?:on|via|at) (?:telegram|whatsapp|signal|wechat)\b/gi,
      /\b(?:wa\.me|t\.me)\/\S+/gi,
    ],
    explanation:
      "Real employers usually interview by phone, video or in person, with named staff and verifiable company accounts. Interviews held entirely by text chat on apps like Telegram or WhatsApp, often with an unnamed 'HR manager', are a common sign of a fake job.",
  },
  {
    id: "job-money-mule",
    title: "Job involves receiving or moving money for others",
    category: "employment",
    severity: "critical",
    group: "job-money",
    appliesTo: ["job", "message", "email"],
    patterns: [
      /\b(?:receive|accept|process|handle|transfer|forward|move|collect)\b[^.!?\n]{0,30}\b(?:payments?|funds|money|transfers|deposits?)\b[^.!?\n]{0,40}\b(?:on behalf of|for (?:our|the) (?:company|clients?|customers?)|into your (?:personal )?(?:bank )?account|through your (?:personal )?(?:bank )?account)\b/gi,
      /\b(?:payment processing|money transfer|funds transfer|transaction processing) (?:agents?|representatives?|processors?|assistants?)\b|\b(?:financial agent|remote cashier)\b/gi,
      /\b(?:use|using) your (?:own |personal )?(?:bank )?account\b[^.!?\n]{0,40}\b(?:receive|transfer|process|forward)\b/gi,
      /\b(?:keep|retain) (?:\d{1,2} ?%|a (?:percentage|commission|cut))\b[^.!?\n]{0,40}\b(?:send|transfer|forward|wire)\b/gi,
    ],
    explanation:
      "Jobs that involve receiving money into your own account and passing it on are often money-mule schemes. The money is usually stolen, and the person moving it can have their bank account closed and face a criminal investigation.",
  },
  {
    id: "job-task-scam",
    title: "Pays for online 'tasks' like rating or liking",
    category: "employment",
    severity: "strong",
    group: "job-task",
    appliesTo: ["job", "message"],
    patterns: [
      /\b(?:like|rate|review|rating|boost|optimi[sz]e|optimi[sz]ing|submit|complete|click) (?:youtube |tiktok |amazon )?(?:videos?|products?|apps?|hotels?|orders?|reviews?|posts?|merchants?|tasks?|data)\b[^.!?\n]{0,60}\b(?:commission|earn|paid|pay|income|per task|reward)\b/gi,
      /\b(?:commission|earn|paid|pay|income)\b[^.!?\n]{0,60}\b(?:like|rate|review|rating|boost|optimi[sz]e|optimi[sz]ing) (?:youtube |tiktok |amazon )?(?:videos?|products?|apps?|hotels?|orders?|reviews?|posts?|merchants?)\b/gi,
      /\b(?:top[- ]?up|recharge|prepay|pre-?fund)\b[^.!?\n]{0,40}\b(?:to (?:unlock|continue|complete|receive|withdraw)|tasks?|orders?|commissions?|level|vip)\b/gi,
      /\b(?:unlock|withdraw|release) (?:your )?(?:commissions?|earnings|tasks?|next (?:set|level|batch))\b|\btask[- ]based (?:job|work|role|position)\b/gi,
    ],
    explanation:
      "In 'task' scams you're paid small amounts to like videos, rate products or 'optimise' orders, then asked to deposit your own money, often crypto, to unlock more tasks or withdraw your earnings. That money doesn't come back.",
  },
  {
    id: "job-reshipping",
    title: "Job involves receiving and forwarding parcels",
    category: "employment",
    severity: "strong",
    group: "job-goods",
    appliesTo: JOB,
    patterns: [
      /\b(?:re-?ship(?:ping)?|re-?packag(?:e|ing)|package (?:forwarding|forwarder|inspector|handler|processor)|parcel (?:forwarding|agent|handler)|receive (?:packages|parcels) (?:at|to) your (?:home|address|house))\b/gi,
    ],
    explanation:
      "'Reshipping' or 'package inspector' jobs ask you to receive parcels at home and send them on, often overseas. The goods are usually bought with stolen cards, and you may never be paid.",
  },
  {
    id: "job-easy-money",
    title: "Promises easy money with little effort",
    category: "employment",
    severity: "moderate",
    group: "job-pay",
    appliesTo: JOB,
    patterns: [
      /\b(?:easy money|quick money|fast cash|make money from home|be your own boss|unlimited earning(?:s| potential)?|financial freedom|guaranteed (?:income|salary|pay|earnings)|work (?:just|only) \d{1,2} (?:hours?|minutes?|mins?) (?:a|per) day)\b/gi,
      new RegExp(
        String.raw`\bearn (?:up to |over |more than )?${MONEY}\s?\d[\d,]*\+? ?(?:daily|a day|per day|weekly|a week|per week)\b`,
        "gi",
      ),
    ],
    explanation:
      "Job ads that focus on how much and how easily you'll earn, rather than on the actual work, are typical of scams and pyramid-style schemes.",
  },
  {
    id: "job-vague-employer",
    title: "Employer is vague or unnamed",
    category: "employment",
    severity: "moderate",
    group: "job-employer",
    appliesTo: JOB,
    patterns: [
      /\b(?:our|the) (?:client|company|employer|firm) (?:wishes|wants|prefers|has asked) to remain (?:anonymous|confidential|unnamed)\b/gi,
      /\b(?:company name|employer name|company details|name of the company) (?:will be|is|are) (?:disclosed|shared|revealed|provided|given) (?:later|after|upon|once|when)\b/gi,
      /\b(?:a|an) (?:leading|well[- ]known|reputable|top|large|major|international|global|multinational|fortune 500) (?:company|firm|brand|organi[sz]ation|corporation) (?:is (?:hiring|looking|seeking|recruiting)|needs|seeks)\b/gi,
    ],
    explanation:
      "Legitimate job ads usually name the employer, the role, its location and who you'd report to. A hidden or vague company name makes the job impossible to verify, so research the employer independently before sharing anything.",
  },
  {
    id: "job-no-interview",
    title: "Offered a job without applying or interviewing",
    category: "employment",
    severity: "moderate",
    group: "job-process",
    appliesTo: JOB,
    patterns: [
      /\b(?:no interview (?:needed|required|necessary)|without (?:an )?interview|hired (?:immediately|on the spot|instantly|today))\b/gi,
      /\b(?:you(?:'ve| have)? been|you are) (?:selected|hired|chosen|approved) (?:for|as)\b/gi,
      /\bwe (?:found|saw|came across|got) your (?:resume|cv|profile|number|contact)\b/gi,
    ],
    explanation:
      "Being offered a job you didn't apply for, or being hired without an interview, is unusual. Scammers send these messages in bulk and often borrow well-known company names.",
  },
  {
    id: "job-pressure",
    title: "Pressure to accept quickly",
    category: "pressure",
    severity: "moderate",
    group: "pressure",
    appliesTo: JOB,
    patterns: [
      /\b(?:accept|confirm|sign|respond to|reply to)\b[^.!?\n]{0,30}\b(?:offer|position|contract|role)\b[^.!?\n]{0,30}\b(?:within|by|before|today|tonight|immediately|asap|now)\b/gi,
      /\b(?:limited|only \d+|few) (?:slots?|positions?|spots?|places?|openings?|vacanc(?:y|ies)) (?:left|remaining|available)\b/gi,
      /\b(?:position|role|offer|spot|slot) will be (?:given|offered) to (?:someone else|another (?:candidate|applicant))\b/gi,
    ],
    explanation:
      "Pressure to accept an offer immediately leaves no time to research the employer. Real employers expect questions and usually give you time to consider an offer.",
  },
  {
    id: "job-personal-email",
    title: "Recruiter uses a personal email address",
    category: "employment",
    severity: "moderate",
    group: "job-employer",
    appliesTo: JOB,
    includeAddresses: true,
    patterns: [
      /[\w.+-]{1,64}@(?:gmail|googlemail|yahoo|ymail|hotmail|outlook|live|aol|icloud|protonmail|proton|gmx|mail|yandex|zoho)\.[a-z.]{2,6}\b/gi,
    ],
    explanation:
      "Recruiters for real companies usually email from the company's own domain. A free webmail address isn't proof of a scam, but verify the person through the company's official website.",
  },
];

/** Low-effort cues used by the unrealistic-pay detector. */
export const LOW_EFFORT_CUES =
  /\b(?:no experience|without experience|part[- ]time|from home|work from home|easy|simple tasks?|just your (?:phone|smartphone)|few hours|students?|anyone can|no skills|beginner|stay[- ]at[- ]home)\b/i;

/**
 * Pay thresholds for the unrealistic-pay detector, applied only when the text
 * also contains a low-effort cue (above). Values are in the advertised
 * currency (USD, GBP, CAD, AUD and EUR are treated alike).
 */
export const UNREALISTIC_PAY_THRESHOLDS = {
  hour: 50,
  day: 300,
  week: 1_500,
  month: 6_000,
} as const;
