import Filter from "bad-words";

const filter = new Filter({
    placeHolder: "*",
    splitRegex: /\b/,
});

/**
 * ⚠️ IMPORTANT
 * These are NOT just profanity words.
 * These are HIGH-RISK / BLOCKED terms based on:
 * - OpenAI Image policies
 * - Google Gemini Imagen behavior
 * - MidJourney rejection patterns
 *
 * Word-based filtering is a FIRST LINE of DEFENSE.
 */

// EXTENDED AI IMAGE MODERATION WORD LIST
const AI_BLOCKED_WORDS = [
    /* ---------------- SEXUAL / ADULT ---------------- */
    "porn",
    "pornography",
    "nude",
    "nudity",
    "naked",
    "explicit",
    "sexual",
    "sexual act",
    "sex scene",
    "fetish",
    "orgasm",
    "genitals",
    "penis",
    "vagina",
    "masturbation",
    "oral sex",
    "intercourse",

    // ZERO TOLERANCE
    "rape",
    "incest",
    "pedophilia",
    "pedophile",
    "child nude",
    "minor sexual",
    "underage",

    /* ---------------- VIOLENCE / GORE ---------------- */
    "bloodbath",
    "gore",
    "gory",
    "dismember",
    "beheading",
    "decapitation",
    "torture",
    "mutilation",
    "organs exposed",
    "severed head",
    "dead body",
    "corpse",

    /* ---------------- SELF HARM ---------------- */
    "suicide",
    "kill myself",
    "self harm",
    "cutting wrists",
    "hanging myself",
    "overdose",

    /* ---------------- HATE / EXTREMISM ---------------- */
    "nazi",
    "terrorist",
    "terrorism",
    "extremist",
    "isis",
    "al-qaeda",
    "kkk",
    "white supremacy",
    "genocide",
    "ethnic cleansing",

    /* ---------------- ILLEGAL ACTIVITIES ---------------- */
    "drug deal",
    "selling drugs",
    "cocaine",
    "heroin",
    "meth",
    "lsd",
    "bomb making",
    "explosives",
    "weapons trafficking",
    "assassination",
    "how to kill",

    /* ---------------- PRIVACY / IDENTITY ---------------- */
    "celebrity nude",
    "leaked photos",
    "private images",
    "deepfake",
    "face swap",
];

// Add blocked words to filter
filter.addWords(...AI_BLOCKED_WORDS);

/**
 * Image Prompt Safety Check
 * @param {string} prompt
 * @returns {{ safe: boolean, blockedWords: string[] }}
 */
export function checkImagePromptSafety(prompt = "") {
    if (!prompt.trim()) {
        return { safe: true, blockedWords: [] };
    }

    const lowerPrompt = prompt.toLowerCase();

    const isProfane = filter.isProfane(lowerPrompt);

    const foundWords = AI_BLOCKED_WORDS.filter(word =>
        lowerPrompt.includes(word)
    );

    return {
        safe: !isProfane,
        blockedWords: [...new Set(foundWords)],
    };
}
