from .grammar import correct_grammar
from .lexical import find_difficult_words
from .ai_model import simplify_text_ai


def simplify_pipeline(text, level):
    """
    Complete text simplification pipeline.
    """

    # =====================================================
    # 1. Correct grammar
    # =====================================================

    corrected_text = correct_grammar(
        text
    )


    # =====================================================
    # 2. Detect difficult words
    #
    # This only detects difficult words.
    # It does NOT define replacements.
    # =====================================================

    difficult_words = find_difficult_words(
        corrected_text,
        level
    )


    # =====================================================
    # 3. Ask Gemini to simplify the text
    # and generate the actual replacements
    # =====================================================

    ai_result = simplify_text_ai(
        corrected_text,
        level,
        difficult_words
    )


    # =====================================================
    # 4. Extract AI results
    # =====================================================

    simplified_text = ai_result.get(
        "simplified_text",
        ""
    )


    word_mappings = ai_result.get(
        "difficult_words",
        []
    )


    # =====================================================
    # 5. Return complete pipeline result
    # =====================================================

    return {
        "corrected_text": corrected_text,

        "simplified_text": simplified_text,

        "difficult_words": word_mappings
    }