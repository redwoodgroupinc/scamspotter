/**
 * Text normalisation applied before any rule runs.
 *
 * Scam messages sometimes hide keywords with invisible characters, "fancy"
 * Unicode letters or lookalike letters from other alphabets. Normalising first
 * means the rules see the text the way a reader does.
 */

// Zero-width characters, bidirectional controls and soft hyphens. The
// zero-width joiner and non-joiner (U+200C, U+200D) are handled separately:
// emoji sequences and scripts such as Persian and Hindi rely on them.
const INVISIBLE_CHARS = /[\u00AD\u200B\u200E\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF]/g;
// A joiner between two Latin letters or digits has no purpose except to hide a word.
const JOINER_IN_LATIN_WORD = /(?<=[A-Za-z0-9])[\u200C\u200D]+(?=[A-Za-z0-9])/g;
const BIDI_OVERRIDES = /[‪-‮⁦-⁩]/;
const SPACE_VARIANTS = /[   -   　\t]/g;
const SINGLE_QUOTES = /[‘’‚‛′`´]/g;
const DOUBLE_QUOTES = /[“”„‟″]/g;
const DASHES = /[‐-―−]/g;

export interface NormalizedText {
  /** Text ready for rule matching. */
  text: string;
  /** True when invisible characters were removed. */
  hadInvisibleCharacters: boolean;
  /** True when right-to-left override characters were present. */
  hadBidiControls: boolean;
  /** Words mixing Latin letters with Cyrillic or Greek lookalikes. */
  mixedScriptWords: string[];
  /** Share of letters that are not Latin script (0–1). */
  nonLatinShare: number;
  /** Rough share of common English function words among all words (0–1). */
  englishWordShare: number;
  letterCount: number;
  wordCount: number;
}

const COMMON_ENGLISH_WORDS = new Set([
  "the",
  "and",
  "you",
  "your",
  "to",
  "is",
  "of",
  "for",
  "a",
  "an",
  "in",
  "on",
  "this",
  "that",
  "we",
  "our",
  "please",
  "it",
  "be",
  "are",
  "with",
  "will",
  "have",
  "has",
  "can",
  "if",
  "or",
  "not",
  "at",
  "from",
  "by",
  "my",
  "me",
  "i",
  "us",
  "account",
  "click",
  "here",
  "now",
  "today",
  "send",
  "pay",
  "call",
  "hi",
  "hello",
  "dear",
  "thanks",
  "thank",
]);

const MIXED_SCRIPT_WORD = /[\p{L}\p{M}]+/gu;
const LATIN = /\p{Script=Latin}/u;
const LOOKALIKE_SCRIPTS = /[\p{Script=Cyrillic}\p{Script=Greek}]/u;

/** Cyrillic and Greek letters that look like Latin ones, mapped to the Latin letter a reader sees. */
const LOOKALIKE_TO_LATIN: Record<string, string> = {
  // Cyrillic
  а: "a",
  в: "b",
  е: "e",
  ё: "e",
  к: "k",
  м: "m",
  н: "h",
  о: "o",
  р: "p",
  с: "c",
  т: "t",
  у: "y",
  х: "x",
  ѕ: "s",
  і: "i",
  ї: "i",
  ј: "j",
  ԁ: "d",
  ԛ: "q",
  ԝ: "w",
  һ: "h",
  ӏ: "l",
  А: "A",
  В: "B",
  Е: "E",
  Ё: "E",
  К: "K",
  М: "M",
  Н: "H",
  О: "O",
  Р: "P",
  С: "C",
  Т: "T",
  У: "Y",
  Х: "X",
  Ѕ: "S",
  І: "I",
  Ї: "I",
  Ј: "J",
  Ԛ: "Q",
  Ԝ: "W",
  Һ: "H",
  Ӏ: "I",
  // Greek
  α: "a",
  ε: "e",
  ι: "i",
  κ: "k",
  ν: "v",
  ο: "o",
  ρ: "p",
  τ: "t",
  υ: "u",
  χ: "x",
  Α: "A",
  Β: "B",
  Ε: "E",
  Ζ: "Z",
  Η: "H",
  Ι: "I",
  Κ: "K",
  Μ: "M",
  Ν: "N",
  Ο: "O",
  Ρ: "P",
  Τ: "T",
  Υ: "Y",
  Χ: "X",
};

/**
 * Spell a word with plain Latin letters the way a reader would see it:
 * Cyrillic and Greek look-alikes become Latin letters and accents are
 * dropped ("аpple" -> "apple", "amazön" -> "amazon"). Used for domain names.
 */
export function foldToLatin(value: string): string {
  return Array.from(value, (ch) => LOOKALIKE_TO_LATIN[ch] ?? ch)
    .join("")
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/**
 * In words that mix Latin letters with Cyrillic or Greek look-alikes, replace
 * the look-alikes with Latin letters so rules match what a reader sees.
 * Words written entirely in Cyrillic or Greek are left alone. Every
 * replacement is one UTF-16 unit for one, so text positions don't move.
 */
function foldLookalikes(text: string): string {
  return text.replace(MIXED_SCRIPT_WORD, (word) => {
    let hasLatin = false;
    let hasLookalike = false;
    for (const ch of word) {
      if (LATIN.test(ch)) hasLatin = true;
      else if (LOOKALIKE_SCRIPTS.test(ch)) hasLookalike = true;
    }
    if (!hasLatin || !hasLookalike) return word;
    return Array.from(word, (ch) => LOOKALIKE_TO_LATIN[ch] ?? ch).join("");
  });
}

export function normalizeText(input: string): NormalizedText {
  const hadBidiControls = BIDI_OVERRIDES.test(input);
  const withoutInvisible = input.replace(INVISIBLE_CHARS, "").replace(JOINER_IN_LATIN_WORD, "");
  const hadInvisibleCharacters = withoutInvisible.length !== input.length;

  // Detect mixed-script words before NFKC (NFKC does not fold Cyrillic to Latin).
  const mixedScriptWords: string[] = [];
  let letters = 0;
  let latinLetters = 0;
  for (const match of withoutInvisible.matchAll(MIXED_SCRIPT_WORD)) {
    const word = match[0];
    let hasLatin = false;
    let hasLookalike = false;
    for (const ch of word) {
      if (LATIN.test(ch)) {
        hasLatin = true;
        latinLetters += 1;
      } else if (LOOKALIKE_SCRIPTS.test(ch)) {
        hasLookalike = true;
      }
      letters += 1;
    }
    if (hasLatin && hasLookalike && mixedScriptWords.length < 5 && !mixedScriptWords.includes(word)) {
      mixedScriptWords.push(word);
    }
  }

  const text = foldLookalikes(withoutInvisible.normalize("NFKC"))
    .replace(SPACE_VARIANTS, " ")
    .replace(SINGLE_QUOTES, "'")
    .replace(DOUBLE_QUOTES, '"')
    .replace(DASHES, "-")
    .replace(/\r\n?/g, "\n")
    .replace(/ {2,}/g, " ");

  const words = text.toLowerCase().match(/[a-z']+/g) ?? [];
  const englishHits = words.reduce((count, word) => count + (COMMON_ENGLISH_WORDS.has(word) ? 1 : 0), 0);

  return {
    text,
    hadInvisibleCharacters,
    hadBidiControls,
    mixedScriptWords,
    nonLatinShare: letters === 0 ? 0 : 1 - latinLetters / letters,
    englishWordShare: words.length === 0 ? 0 : englishHits / words.length,
    letterCount: letters,
    wordCount: words.length,
  };
}

/**
 * Heuristic: is this text probably not English? Used only to show a notice
 * that ScamSpotter's rules are written for English text.
 */
export function looksNonEnglish(normalized: NormalizedText): boolean {
  if (normalized.letterCount >= 20 && normalized.nonLatinShare > 0.4) return true;
  return normalized.wordCount >= 12 && normalized.englishWordShare < 0.06;
}

/** Collapse whitespace and trim a snippet for display. */
export function tidySnippet(snippet: string, maxLength: number): string {
  const collapsed = snippet.replace(/\s+/g, " ").trim();
  if (collapsed.length <= maxLength) return collapsed;
  return `${collapsed.slice(0, maxLength - 1).trimEnd()}…`;
}
