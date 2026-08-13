from wordfreq import zipf_frequency
from .parser import parse_text


COMMON_WORDS = {
    "about", "above", "across", "after", "again", "against",
    "almost", "always", "among", "another", "around", "because",
    "before", "between", "both", "called", "change", "changes",
    "changed", "clear", "clearly", "different", "during", "early",
    "enough", "every", "example", "first", "following", "found",
    "general", "given", "good", "great", "group", "groups", "help",
    "important", "include", "including", "information", "instead",
    "large", "later", "little", "many", "modern", "most", "much",
    "need", "needs", "often", "other", "people", "possible",
    "present", "provide", "provided", "really", "same", "several",
    "should", "simple", "since", "small", "some", "something",
    "still", "such", "system", "systems", "their", "there", "these",
    "they", "those", "through", "together", "under", "used", "using",
    "usually", "very", "well", "where", "which", "while", "within",
    "without", "work", "works", "world"
}


def is_difficult_word(word, level="Beginner"):
    """Return True only when a word is uncommon enough for the level."""

    if not word:
        return False

    word = word.lower().strip()

    if len(word) <= 4:
        return False

    if word in COMMON_WORDS:
        return False

    frequency = zipf_frequency(word, "en")

    thresholds = {
        "Beginner": 4.25,
        "Intermediate": 3.80,
        "Advanced": 3.40,
    }

    return frequency < thresholds.get(level, 4.25)


def find_difficult_words(text, level="Beginner"):
    """
    Detect difficult vocabulary across the complete input.

    The lexical layer only detects words.
    Gemini supplies meanings and actual replacements.
    """

    doc = parse_text(text)

    difficult_words = []
    seen = set()

    for token in doc:

        if not token.is_alpha:
            continue

        if token.is_stop:
            continue

        base_word = token.lemma_.lower().strip()

        if not base_word or base_word in seen:
            continue

        if is_difficult_word(base_word, level):

            difficult_words.append(
                {
                    "word": token.text
                }
            )

            seen.add(base_word)

    return difficult_words