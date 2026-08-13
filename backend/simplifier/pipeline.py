from .grammar import correct_grammar
from .lexical import find_difficult_words
from .ai_model import simplify_text_ai


# ============================================================
# NORMALIZE DETECTED WORDS
# ============================================================

def normalize_difficult_words(words):

    """
    Convert lexical detector output into:

    [
        {
            "word": "example"
        }
    ]

    Duplicate words are removed.
    """

    if not isinstance(
        words,
        list
    ):

        return []


    cleaned = []

    seen = set()


    for item in words:

        if isinstance(
            item,
            dict
        ):

            word = item.get(
                "word",
                ""
            )

        else:

            word = item


        if word is None:
            continue


        word = str(
            word
        ).strip()


        if not word:
            continue


        key = word.lower()


        if key in seen:
            continue


        seen.add(
            key
        )


        cleaned.append(
            {
                "word":
                    word
            }
        )


    return cleaned


# ============================================================
# CLEAN AI RESULTS
# ============================================================

def clean_ai_results(
    ai_words,
    detected_words
):
    """
    Make sure the AI vocabulary results correspond to words
    actually detected by the lexical analysis.
    """

    if not isinstance(
        ai_words,
        list
    ):

        ai_words = []


    detected_lookup = {
        item["word"].lower()
        for item in detected_words
    }


    cleaned = []

    seen = set()


    for item in ai_words:

        if not isinstance(
            item,
            dict
        ):

            continue


        word = str(
            item.get(
                "word",
                ""
            )
        ).strip()


        meaning = str(
            item.get(
                "meaning",
                ""
            )
        ).strip()


        replacement = str(
            item.get(
                "replacement",
                ""
            )
        ).strip()


        if not word:
            continue


        # ----------------------------------------------------
        # Only keep detected words
        # ----------------------------------------------------

        if word.lower() not in detected_lookup:
            continue


        # ----------------------------------------------------
        # Remove duplicates
        # ----------------------------------------------------

        key = word.lower()


        if key in seen:
            continue


        seen.add(
            key
        )


        # ----------------------------------------------------
        # Meaning fallback
        # ----------------------------------------------------

        if not meaning:

            meaning = (
                "Meaning not available."
            )


        cleaned.append(
            {
                "word":
                    word,

                "meaning":
                    meaning,

                "replacement":
                    replacement
            }
        )


    # ========================================================
    # MAKE SURE EVERY DETECTED WORD APPEARS
    # ========================================================

    existing = {
        item["word"].lower()
        for item in cleaned
    }


    for item in detected_words:

        word = item["word"]


        if word.lower() not in existing:

            cleaned.append(
                {
                    "word":
                        word,

                    "meaning":
                        "Meaning not available.",

                    "replacement":
                        ""
                }
            )


    return cleaned


# ============================================================
# MAIN PIPELINE
# ============================================================

def simplify_pipeline(
    text,
    level
):
    """
    Complete ReadEase NLP pipeline.

    Flow:

    1. Grammar correction
    2. Difficult vocabulary detection
    3. Gemini simplification
    4. Vocabulary meaning generation
    5. Replacement extraction

    Returns:

    {
        "corrected_text": "...",

        "simplified_text": "...",

        "difficult_words": [
            {
                "word": "...",
                "meaning": "...",
                "replacement": "..."
            }
        ],

        "changes": [
            {
                "word": "...",
                "replacement": "..."
            }
        ]
    }
    """


    # ========================================================
    # 1. GRAMMAR CORRECTION
    # ========================================================

    corrected_text = correct_grammar(
        text
    )


    if not isinstance(
        corrected_text,
        str
    ):

        corrected_text = str(
            corrected_text
        )


    corrected_text = corrected_text.strip()


    if not corrected_text:

        corrected_text = text.strip()


    # ========================================================
    # 2. DIFFICULT WORD DETECTION
    # ========================================================

    detected_words = find_difficult_words(
        corrected_text,
        level
    )


    # ========================================================
    # 3. NORMALIZE
    # ========================================================

    detected_words = normalize_difficult_words(
        detected_words
    )


    # ========================================================
    # DEBUG
    # ========================================================

    print()
    print("=" * 70)

    print(
        "READEASE NLP PIPELINE"
    )

    print(
        "Reading level:",
        level
    )

    print(
        "Difficult words detected:",
        len(detected_words)
    )

    print(
        [
            item["word"]
            for item
            in detected_words
        ]
    )

    print("=" * 70)


    # ========================================================
    # 4. GEMINI
    # ========================================================

    ai_result = simplify_text_ai(
        corrected_text,
        level,
        detected_words
    )


    # ========================================================
    # 5. VALIDATE AI RESPONSE
    # ========================================================

    if not isinstance(
        ai_result,
        dict
    ):

        raise ValueError(
            "Gemini returned an invalid response."
        )


    # ========================================================
    # 6. SIMPLIFIED TEXT
    # ========================================================

    simplified_text = ai_result.get(
        "simplified_text",
        ""
    )


    if not isinstance(
        simplified_text,
        str
    ):

        simplified_text = str(
            simplified_text
        )


    simplified_text = simplified_text.strip()


    if not simplified_text:

        raise ValueError(
            "Gemini returned empty simplified text."
        )


    # ========================================================
    # 7. VOCABULARY + MEANINGS
    # ========================================================

    vocabulary = clean_ai_results(
        ai_result.get(
            "difficult_words",
            []
        ),

        detected_words
    )


    # ========================================================
    # 8. BUILD ACTUAL CHANGES
    # ========================================================

    changes = []


    for item in vocabulary:

        word = item.get(
            "word",
            ""
        )

        replacement = item.get(
            "replacement",
            ""
        )


        if not word:
            continue


        if not replacement:
            continue


        if (
            word.lower()
            ==
            replacement.lower()
        ):

            continue


        # ----------------------------------------------------
        # Replacement must exist in simplified text
        # ----------------------------------------------------

        if (
            replacement.lower()
            not in simplified_text.lower()
        ):

            continue


        changes.append(
            {
                "word":
                    word,

                "replacement":
                    replacement
            }
        )


    # ========================================================
    # DEBUG
    # ========================================================

    print()
    print(
        "SIMPLIFIED TEXT:"
    )

    print(
        simplified_text
    )


    print()
    print(
        "VOCABULARY:"
    )

    for item in vocabulary:

        print(
            f"{item['word']} "
            f"-> "
            f"{item['meaning']} "
            f"-> "
            f"{item['replacement']}"
        )


    print()
    print(
        "ACTUAL CHANGES:"
    )

    print(
        changes
    )

    print("=" * 70)


    # ========================================================
    # RETURN
    # ========================================================

    return {

        "corrected_text":
            corrected_text,

        "simplified_text":
            simplified_text,

        # Complete vocabulary information
        "difficult_words":
            vocabulary,

        # Only actual replacements
        "changes":
            changes
    }