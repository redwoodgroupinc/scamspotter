/**
 * Text normalisation applied before any rule runs.
 *
 * Scam messages sometimes hide keywords with invisible characters, "fancy"
 * Unicode letters or lookalike letters from other alphabets. Normalising first
 * means the rules see the text the way a reader does.
 */

// Zero-width characters, bidirectional controls and soft hyphens.
const INVISIBLE_CHARS = /[­​-‏‪-‮⁠-⁤⁦-⁩﻿]/g;
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
  "the", "and", "you", "your", "to", "is", "of", "for", "a", "an", "in", "on", "this",
  "that", "we", "our", "please", "it", "be", "are", "with", "will", "have", "has", "can",
  "if", "or", "not", "at", "from", "by", "my", "me", "i", "us", "account", "click", "here",
  "now", "today", "send", "pay", "call", "hi", "hello", "dear", "thanks", "thank",
]);

const MIXED_SCRIPT_WORD = /[\p{L}\p{M}]+/gu;
const LATIN = /\p{Script=Latin}/u;
const LOOKALIKE_SCRIPTS = /[\p{Script=Cyrillic}\p{Script=Greek}]/u;

export function normalizeText(input: string): NormalizedText {
  const hadBidiControls = BIDI_OVERRIDES.test(input);
  const withoutInvisible = input.replace(INVISIBLE_CHARS, "");
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

  const text = withoutInvisible
    .normalize("NFKC")
    .replace(SPACE_VARIANTS, " ")
    .replace(SINGLE_QUOTES, "'")
    .replace(DOUBLE_QUOTES, '"')
    .replace(DASHES, "-")
    .replace(/\r\n?/g, "\n")
    .replace(/ {2,}/g, " ");

  const words = text.toLowerCase().match(/[a-z']+/g) ?? [];
  const englishHits = words.reduce(
    (count, word) => count + (COMMON_ENGLISH_WORDS.has(word) ? 1 : 0),
    0,
  );

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
