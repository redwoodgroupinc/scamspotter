/** Input limits. Keeping inputs bounded keeps analysis fast and predictable. */
export const MAX_TEXT_LENGTH = 10_000;
export const MAX_SENDER_LENGTH = 320;
export const MAX_URL_LENGTH = 2_048;
/** Maximum number of links extracted from a single message. */
export const MAX_LINKS_PER_TEXT = 10;
/** Maximum evidence snippets shown per finding. */
export const MAX_EVIDENCE_PER_FINDING = 3;
/** Maximum length of a single evidence snippet. */
export const MAX_SNIPPET_LENGTH = 140;
