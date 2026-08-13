import os
import time
import random
import json

from google import genai
from dotenv import load_dotenv


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()


# ============================================================
# GEMINI CLIENT
# ============================================================

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


# ============================================================
# SIMPLIFY TEXT
# ============================================================

def simplify_text_ai(
    text,
    level,
    difficult_words
):
    """
    Simplifies the given text using Gemini.

    Gemini returns:
    1. The complete simplified text
    2. The actual difficult-word replacements

    No vocabulary is hardcoded.
    """

    # ========================================================
    # READING LEVEL INSTRUCTIONS
    # ========================================================

    if level == "Beginner":

        level_instructions = """
BEGINNER LEVEL:

- Use very simple, everyday English.
- Replace difficult, technical, academic, or formal
  words with easier words or phrases.
- Use short and clear sentences.
- Break long sentences into shorter sentences when needed.
- Write as if explaining the text to someone learning English.
- Keep all important information.
- Do not summarize the text.
"""

    elif level == "Intermediate":

        level_instructions = """
INTERMEDIATE LEVEL:

- Use clear and moderately simple English.
- Replace unnecessarily difficult words with easier alternatives.
- Keep important academic or technical terms when necessary.
- Use medium-length sentences.
- Break very long or confusing sentences when necessary.
- Keep all important information.
- Do not summarize the text.
"""

    elif level == "Advanced":

        level_instructions = """
ADVANCED LEVEL:

- Keep a mature and natural writing style.
- Preserve important academic and technical vocabulary
  when appropriate.
- Simplify unnecessarily difficult words or sentence
  structures.
- Maintain the original level of detail.
- Do not make the text overly simple.
- Do not summarize the text.
"""

    else:

        level_instructions = """
Use clear and simple English while preserving
the original meaning and all important information.
"""


    # ========================================================
    # GET DIFFICULT WORDS
    # ========================================================

    difficult_word_list = [
        item["word"]
        for item in difficult_words
        if item.get("word")
    ]


    # ========================================================
    # GEMINI PROMPT
    # ========================================================

    prompt = f"""
You are an English text simplification assistant.

Your task is to rewrite the original text according
to the selected reading level.

SELECTED READING LEVEL:
{level}

READING LEVEL INSTRUCTIONS:
{level_instructions}

ORIGINAL TEXT:
{text}

DIFFICULT WORDS DETECTED IN THE ORIGINAL TEXT:
{json.dumps(difficult_word_list)}

IMPORTANT RULES:

1. Preserve the original meaning completely.

2. Do NOT summarize the text.

3. Do NOT remove important information.

4. Do NOT add new information.

5. Simplify difficult words when appropriate.

6. Make the simplified text natural and grammatically correct.

7. If you replace a difficult word, the replacement must
   actually appear in the simplified text.

8. A replacement can be one word or multiple words.

9. The replacement must use the exact wording that appears
   in the simplified text.

10. Do not invent replacement words that are not present
    in the simplified text.

11. If a difficult word does not need to be changed,
    you may leave it out of the mapping.

12. Do not provide explanations.

13. Do not provide definitions.

14. Do not provide a separate list outside the JSON.

15. Return ONLY valid JSON.

Return exactly this structure:

{{
    "simplified_text": "complete simplified text",

    "difficult_words": [
        {{
            "word": "original difficult word",
            "replacement": "actual replacement used"
        }}
    ]
}}
"""


    # ========================================================
    # GEMINI REQUEST
    # ========================================================

    max_attempts = 4


    for attempt in range(
        max_attempts
    ):

        try:

            response = client.models.generate_content(
                model="gemini-3.5-flash",
                contents=prompt
            )


            # =================================================
            # CHECK RESPONSE
            # =================================================

            if not response.text:

                raise Exception(
                    "Gemini returned an empty response."
                )


            result = response.text.strip()


            # =================================================
            # REMOVE MARKDOWN CODE BLOCKS
            # =================================================

            if result.startswith("```"):

                result = result.replace(
                    "```json",
                    ""
                )

                result = result.replace(
                    "```",
                    ""
                )

                result = result.strip()


            # =================================================
            # PARSE JSON
            # =================================================

            data = json.loads(
                result
            )


            # =================================================
            # GET SIMPLIFIED TEXT
            # =================================================

            simplified_text = str(
                data.get(
                    "simplified_text",
                    ""
                )
            ).strip()


            if not simplified_text:

                raise Exception(
                    "Gemini returned empty simplified text."
                )


            # =================================================
            # GET MAPPINGS
            # =================================================

            mappings = data.get(
                "difficult_words",
                []
            )


            if not isinstance(
                mappings,
                list
            ):

                mappings = []


            # =================================================
            # VALIDATE MAPPINGS
            # =================================================

            valid_mappings = []


            for mapping in mappings:

                if not isinstance(
                    mapping,
                    dict
                ):

                    continue


                word = str(
                    mapping.get(
                        "word",
                        ""
                    )
                ).strip()


                replacement = str(
                    mapping.get(
                        "replacement",
                        ""
                    )
                ).strip()


                # ---------------------------------------------
                # Ignore empty mappings
                # ---------------------------------------------

                if not word:

                    continue


                if not replacement:

                    continue


                # ---------------------------------------------
                # Make sure the word was actually detected
                # as a difficult word
                # ---------------------------------------------

                detected = any(

                    item["word"].lower()
                    ==
                    word.lower()

                    for item
                    in difficult_words

                )


                if not detected:

                    continue


                # ---------------------------------------------
                # Store mapping
                # ---------------------------------------------

                valid_mappings.append({

                    "word":
                        word,

                    "replacement":
                        replacement

                })


            # =================================================
            # DEBUG OUTPUT
            # =================================================

            print()
            print(
                "=========================================="
            )

            print(
                "GEMINI SIMPLIFIED TEXT:"
            )

            print(
                simplified_text
            )


            print()
            print(
                "GEMINI WORD MAPPINGS:"
            )


            print(
                json.dumps(
                    valid_mappings,
                    indent=2
                )
            )


            print(
                "=========================================="
            )

            print()


            # =================================================
            # RETURN RESULT
            # =================================================

            return {

                "simplified_text":
                    simplified_text,

                "difficult_words":
                    valid_mappings

            }


        # =====================================================
        # INVALID JSON
        # =====================================================

        except json.JSONDecodeError as e:

            print()
            print(
                "Gemini returned invalid JSON."
            )

            print(
                "JSON error:",
                str(e)
            )


            print(
                "Raw Gemini response:"
            )

            print(
                result
            )

            print()


            if attempt < max_attempts - 1:

                wait_time = (
                    2 ** attempt
                    +
                    random.uniform(
                        0,
                        1
                    )
                )


                print(
                    f"Retrying in "
                    f"{wait_time:.1f} seconds..."
                )


                time.sleep(
                    wait_time
                )


                continue


            raise Exception(
                "Gemini returned an invalid response."
            )


        # =====================================================
        # OTHER ERRORS
        # =====================================================

        except Exception as e:

            error_message = str(e)


            print()
            print(
                f"Gemini attempt "
                f"{attempt + 1} failed:"
            )

            print(
                error_message
            )


            # -------------------------------------------------
            # Retry temporary server errors
            # -------------------------------------------------

            if (

                "503"
                in error_message

                or

                "UNAVAILABLE"
                in error_message

                or

                "429"
                in error_message

                or

                "500"
                in error_message

            ):

                if attempt < max_attempts - 1:

                    wait_time = (
                        2 ** attempt
                        +
                        random.uniform(
                            0,
                            1
                        )
                    )


                    print(
                        f"Retrying in "
                        f"{wait_time:.1f} seconds..."
                    )


                    time.sleep(
                        wait_time
                    )


                    continue


            # -------------------------------------------------
            # Non-temporary error
            # -------------------------------------------------

            raise


    # ========================================================
    # ALL ATTEMPTS FAILED
    # ========================================================

    raise Exception(
        "Gemini is currently unavailable. "
        "Please try again later."
    )