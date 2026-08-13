from wordfreq import zipf_frequency

from .parser import parse_text


def is_difficult_word(word, level="Beginner"):
    """
    Determines whether a word is difficult based on
    how frequently it is used in English.
    """

    if not word:
        return False

    word = word.lower().strip()

    # Ignore short words
    if len(word) <= 4:
        return False

    frequency = zipf_frequency(
        word,
        "en"
    )

    thresholds = {
        "Beginner": 4.8,
        "Intermediate": 4.2,
        "Advanced": 3.6
    }

    threshold = thresholds.get(
        level,
        4.8
    )

    return frequency < threshold


def find_difficult_words(text, level="Beginner"):
    """
    Detects difficult words dynamically.

    This function ONLY detects difficult words.
    It does NOT decide their replacements.
    """

    doc = parse_text(text)

    difficult_words = []

    seen_words = set()

    for token in doc:

        # Ignore punctuation and numbers
        if not token.is_alpha:
            continue

        # Ignore stop words
        if token.is_stop:
            continue

        # Get base form
        base_word = (
            token.lemma_
            .lower()
            .strip()
        )

        if not base_word:
            continue

        # Avoid duplicate words
        if base_word in seen_words:
            continue

        # Check difficulty
        if is_difficult_word(
            base_word,
            level
        ):

            difficult_words.append({
                "word": token.text
            })

            seen_words.add(
                base_word
            )

    # Maximum 12 difficult words
    return difficult_words[:12]