/**
 * Punycode decoding (RFC 3492) for internationalised domain names.
 *
 * Browsers show "xn--pple-43d.com" as "аpple.com" (with a Cyrillic "а").
 * Decoding lets the URL checks compare what a reader actually sees with the
 * brand names they imitate. Runs locally; nothing is looked up.
 */

const BASE = 36;
const T_MIN = 1;
const T_MAX = 26;
const SKEW = 38;
const DAMP = 700;
const INITIAL_BIAS = 72;
const INITIAL_N = 128;
const MAX_INT = 0x7fffffff;

function adapt(delta: number, numPoints: number, firstTime: boolean): number {
  let value = firstTime ? Math.floor(delta / DAMP) : delta >> 1;
  value += Math.floor(value / numPoints);
  let k = 0;
  while (value > ((BASE - T_MIN) * T_MAX) >> 1) {
    value = Math.floor(value / (BASE - T_MIN));
    k += BASE;
  }
  return k + Math.floor(((BASE - T_MIN + 1) * value) / (value + SKEW));
}

function digitValue(code: number): number {
  if (code >= 48 && code <= 57) return code - 22; // 0-9 -> 26-35
  if (code >= 65 && code <= 90) return code - 65; // A-Z -> 0-25
  if (code >= 97 && code <= 122) return code - 97; // a-z -> 0-25
  return BASE;
}

/** Decode the part of a label after "xn--". Returns null for invalid input. */
export function decodePunycode(input: string): string | null {
  const output: number[] = [];
  const delimiter = input.lastIndexOf("-");
  const basicLength = Math.max(delimiter, 0);
  for (let j = 0; j < basicLength; j += 1) {
    const code = input.charCodeAt(j);
    if (code >= 0x80) return null;
    output.push(code);
  }

  let n = INITIAL_N;
  let bias = INITIAL_BIAS;
  let i = 0;
  for (let index = delimiter > 0 ? delimiter + 1 : 0; index < input.length;) {
    const oldI = i;
    for (let w = 1, k = BASE; ; k += BASE) {
      if (index >= input.length) return null;
      const digit = digitValue(input.charCodeAt(index));
      index += 1;
      if (digit >= BASE || digit > Math.floor((MAX_INT - i) / w)) return null;
      i += digit * w;
      const t = k <= bias ? T_MIN : k >= bias + T_MAX ? T_MAX : k - bias;
      if (digit < t) break;
      if (w > Math.floor(MAX_INT / (BASE - t))) return null;
      w *= BASE - t;
    }
    const length = output.length + 1;
    bias = adapt(i - oldI, length, oldI === 0);
    if (Math.floor(i / length) > MAX_INT - n) return null;
    n += Math.floor(i / length);
    i %= length;
    if (n > 0x10ffff) return null;
    output.splice(i, 0, n);
    i += 1;
  }
  return String.fromCodePoint(...output);
}

/**
 * Decode one hostname label. Labels that aren't "xn--", or that decode to
 * something a browser wouldn't display (control or formatting characters),
 * are returned unchanged.
 */
export function labelToUnicode(label: string): string {
  if (!label.toLowerCase().startsWith("xn--")) return label;
  const decoded = decodePunycode(label.slice(4));
  return decoded && !/[\p{Cc}\p{Cf}]/u.test(decoded) ? decoded : label;
}

/** Show a hostname the way a browser's address bar would ("xn--pple-43d.com" -> "аpple.com"). */
export function hostnameToUnicode(hostname: string): string {
  return hostname.split(".").map(labelToUnicode).join(".");
}
