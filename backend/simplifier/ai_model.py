import json
import os
import random
import time

from dotenv import load_dotenv
from google import genai
from google.genai import types


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError(
        "GEMINI_API_KEY is not configured in the .env file."
    )


# ============================================================
# GEMINI CLIENT
# ============================================================

client = genai.Client(
    api_key=API_KEY
)


# ============================================================
# MODEL
# ============================================================

MODEL_NAME = "gemini-3.6-flash"


# ============================================================
# READING LEVEL INSTRUCTIONS
# ============================================================

def get_level_instructions(level):

    # --------------------------------------------------------
    # BEGINNER
    # --------------------------------------------------------

    if level == "Beginner":

        return """
BEGINNER READING LEVEL

Goal:
Make the text easy for a general reader to understand.

Vocabulary:
- Prefer common everyday English.
- Replace genuinely difficult words with simple natural words.
- Do not replace words that are already simple.
- Do not simplify just for the sake of changing words.
- Keep important technical terms when changing them would reduce accuracy.
- Avoid childish vocabulary.

Sentences:
- Prefer short and clear sentences.
- Break very long sentences when this improves readability.
- Use simple grammar.
- Prefer active voice when natural.
- Keep the same ideas as the original.

Style:
- Natural.
- Clear.
- Mature.
- Easy to understand.

IMPORTANT:
Beginner means simpler language, NOT less information.
Do NOT summarize.
"""


    # --------------------------------------------------------
    # INTERMEDIATE
    # --------------------------------------------------------

    if level == "Intermediate":

        return """
INTERMEDIATE READING LEVEL

Goal:
Make the text clearer and moderately easier to understand.

Vocabulary:
- Replace genuinely difficult vocabulary with familiar alternatives.
- Keep useful academic vocabulary when appropriate.
- Keep important technical terminology.
- Do not replace simple words unnecessarily.
- Do not make every word simpler.

Sentences:
- Use clear medium-length sentences.
- Simplify complicated grammar.
- Improve sentence flow.
- Break very long sentences when useful.
- Prefer natural active voice.

Style:
- Clear.
- Natural.
- Mature.
- Educational.

IMPORTANT:
The result should still sound like normal educated English.
Do NOT summarize.
"""


    # --------------------------------------------------------
    # ADVANCED
    # --------------------------------------------------------

    if level == "Advanced":

        return """
ADVANCED READING LEVEL

Goal:
Provide light simplification while preserving professional quality.

Vocabulary:
- Keep most academic and professional vocabulary.
- Replace only unnecessarily difficult words.
- Preserve technical, scientific, legal and medical terminology when needed.
- Do not simplify words that are already suitable.

Sentences:
- Improve unnecessarily complicated structures.
- Improve clarity and flow.
- Break extremely long sentences only when necessary.

Style:
- Professional.
- Natural.
- Clear.
- Slightly easier than the original.

IMPORTANT:
Advanced must NOT become Beginner-level English.
Do NOT summarize.
"""


    # --------------------------------------------------------
    # DEFAULT
    # --------------------------------------------------------

    return """
Use clear natural English while preserving the complete meaning,
important information and factual accuracy.

Do NOT summarize.
"""


# ============================================================
# MAIN AI FUNCTION
# ============================================================

def simplify_text_ai(text, level, difficult_words):
    """
    Simplify text using Gemini.

    Returns:

    {
        "simplified_text": "...",

        "difficult_words": [
            {
                "word": "...",
                "meaning": "...",
                "replacement": "..."
            }
        ]
    }

    replacement is empty when the word was not changed.
    """

    # ========================================================
    # VALIDATE TEXT
    # ========================================================

    if not isinstance(text, str):
        text = str(text)

    text = text.strip()

    if not text:
        raise ValueError(
            "Text cannot be empty."
        )


    # ========================================================
    # VALIDATE LEVEL
    # ========================================================

    if level not in {
        "Beginner",
        "Intermediate",
        "Advanced"
    }:

        level = "Beginner"


    # ========================================================
    # CLEAN DIFFICULT WORD LIST
    # ========================================================

    if not isinstance(
        difficult_words,
        list
    ):

        difficult_words = []


    difficult_word_list = []

    seen = set()


    for item in difficult_words:

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


        # Remove accidental punctuation
        word = word.strip(
            ".,!?;:\"'()[]{}"
        )


        if not word:
            continue


        word_key = word.lower()


        if word_key in seen:
            continue


        seen.add(
            word_key
        )


        difficult_word_list.append(
            word
        )


    # ========================================================
    # LEVEL INSTRUCTIONS
    # ========================================================

    level_instructions = get_level_instructions(
        level
    )


    # ========================================================
    # DIFFICULT WORD LIST
    # ========================================================

    detected_text = ", ".join(
        difficult_word_list
    )


    if not detected_text:

        detected_text = (
            "No difficult words were detected."
        )


    # ========================================================
    # GEMINI PROMPT
    # ========================================================

    prompt = f"""

You are ReadEase, an AI-powered English
TEXT SIMPLIFICATION SYSTEM.

Your task is to simplify the ORIGINAL TEXT.

This is NOT a summarization task.

The final text must preserve the complete meaning
and all important information from the original.

============================================================
READING LEVEL
============================================================

{level}

============================================================
LEVEL INSTRUCTIONS
============================================================

{level_instructions}

============================================================
MOST IMPORTANT RULE
============================================================

SIMPLIFY THE LANGUAGE, NOT THE INFORMATION.

The simplified text must communicate the same ideas
as the original text.

Do not shorten the text just because it is easier.

Do not remove important information.

Do not invent information.

============================================================
MEANING PRESERVATION
============================================================

You MUST:

1. Preserve every important idea.

2. Preserve all factual information.

3. Preserve names.

4. Preserve organizations.

5. Preserve places.

6. Preserve dates.

7. Preserve numbers.

8. Preserve percentages.

9. Preserve measurements.

10. Preserve conditions.

11. Preserve comparisons.

12. Preserve relationships between ideas.

13. Preserve technical information.

14. Preserve uncertainty.

For example:

"may" must not become "will".

"often" must not become "always".

"approximately" must not become an exact number.

============================================================
DO NOT ADD INFORMATION
============================================================

Do NOT add:

- new facts
- new examples
- new explanations
- new adjectives
- new opinions
- new technical descriptions
- new conclusions

Only simplify what is already present.

For example:

Original:
"modern institutional discourse"

Bad:
"modern official technical communication"

Why bad?

Because "technical" and "official" may add information
that was not explicitly present.

Good:
"modern institutional communication"

============================================================
VOCABULARY SIMPLIFICATION
============================================================

Do NOT perform blind word replacement.

A difficult word should only be replaced when:

1. The replacement is genuinely easier.

2. The meaning is preserved.

3. The replacement fits the sentence.

4. The replacement sounds natural.

5. The replacement is appropriate for the selected level.

6. The replacement does not introduce a new meaning.

A difficult word MAY remain unchanged if replacing it
would make the sentence less accurate or unnatural.

============================================================
IMPORTANT: NATURAL ENGLISH
============================================================

The result must sound like something a real person
would naturally write.

Avoid:

- repeated words
- awkward synonyms
- unnecessary adjectives
- unnatural phrases
- word-for-word translation
- mechanical replacement
- redundant expressions

NEVER create phrases such as:

"widespread rapid spread"

"simple easy understandable"

"confusing technical jargon"

when the original does not contain all those ideas.

Choose ONE natural expression.

For example:

Original:
"The ubiquitous proliferation of..."

Natural:
"The widespread use of..."

NOT:
"The widespread rapid spread of..."

============================================================
SENTENCE STRUCTURE
============================================================

You may restructure sentences when necessary.

However:

- Do not remove ideas.
- Do not combine unrelated ideas.
- Do not create new ideas.
- Do not change the logical relationship.
- Do not change cause and effect.
- Do not change comparisons.

If the original contains multiple sentences,
try to preserve approximately the same number of sentences.

Breaking one very long sentence into two shorter sentences
is allowed when it improves readability.

============================================================
PARAGRAPH COMPLETENESS
============================================================

Process the ENTIRE original text.

Do not simplify only the first sentence.

Do not simplify only the difficult words.

Read and rewrite the complete paragraph.

Every sentence must be considered.

============================================================
DIFFICULT WORD MEANINGS
============================================================

For EVERY detected difficult word, provide:

- the original word
- a short plain-English meaning
- the replacement used, if any

The meaning should explain the word itself,
not merely repeat the replacement.

Example:

"ubiquitous"

Meaning:
"Found everywhere; very common."

Replacement:
"widespread"

============================================================
REPLACEMENTS
============================================================

Only report a replacement if:

1. The original word was actually changed.

2. The replacement appears in the simplified text.

3. The replacement is genuinely simpler.

4. The meaning is preserved.

If the word was NOT changed:

"replacement": ""

Do not invent a replacement just because
the word is difficult.

============================================================
DETECTED DIFFICULT WORDS
============================================================

{detected_text}

============================================================
FINAL QUALITY CHECK
============================================================

Before returning the answer, internally check:

[ ] Did I simplify the ENTIRE text?

[ ] Did I preserve every important idea?

[ ] Did I avoid summarizing?

[ ] Did I avoid removing information?

[ ] Did I avoid adding information?

[ ] Did I preserve names?

[ ] Did I preserve numbers?

[ ] Did I preserve dates?

[ ] Did I preserve technical information?

[ ] Did I preserve uncertainty?

[ ] Did I avoid repetitive vocabulary?

[ ] Did I avoid awkward synonyms?

[ ] Did I avoid unnecessary adjectives?

[ ] Does the result sound natural?

[ ] Is the selected reading level respected?

[ ] Did I provide a meaning for every detected word?

[ ] Does every reported replacement actually appear
    in the simplified text?

============================================================
OUTPUT FORMAT
============================================================

Return ONLY valid JSON.

Use exactly this structure:

{{
    "simplified_text": "complete simplified text",

    "difficult_words": [
        {{
            "word": "original difficult word",
            "meaning": "short plain-English meaning",
            "replacement": "actual replacement or empty string"
        }}
    ]
}}

============================================================
ORIGINAL TEXT
============================================================

{text}

"""


    # ========================================================
    # RESPONSE SCHEMA
    # ========================================================

    response_schema = {

        "type": "OBJECT",

        "properties": {

            "simplified_text": {
                "type": "STRING"
            },

            "difficult_words": {

                "type": "ARRAY",

                "items": {

                    "type": "OBJECT",

                    "properties": {

                        "word": {
                            "type": "STRING"
                        },

                        "meaning": {
                            "type": "STRING"
                        },

                        "replacement": {
                            "type": "STRING"
                        }

                    },

                    "required": [
                        "word",
                        "meaning",
                        "replacement"
                    ]
                }
            }
        },

        "required": [
            "simplified_text",
            "difficult_words"
        ]
    }


    # ========================================================
    # DEBUG INFORMATION
    # ========================================================

    print()
    print("=" * 70)
    print("READEASE AI REQUEST")
    print("=" * 70)

    print(
        "Model:",
        MODEL_NAME
    )

    print(
        "Reading level:",
        level
    )

    print(
        "Characters:",
        len(text)
    )

    print(
        "Detected difficult words:",
        difficult_word_list
    )

    print("=" * 70)


    # ========================================================
    # GEMINI REQUEST
    # ========================================================

    max_attempts = 3

    last_error = None


    for attempt in range(
        max_attempts
    ):

        try:

            print(
                f"Gemini attempt {attempt + 1}/{max_attempts}"
            )


            response = client.models.generate_content(

                model=MODEL_NAME,

                contents=prompt,

                config=types.GenerateContentConfig(

                    response_mime_type="application/json",

                    response_schema=response_schema,

                    temperature=0.10,

                    max_output_tokens=12000
                )
            )


            # =================================================
            # GET RESPONSE
            # =================================================

            result = response.text


            if not result:

                raise ValueError(
                    "Gemini returned an empty response."
                )


            # =================================================
            # PARSE JSON
            # =================================================

            data = json.loads(
                result.strip()
            )


            # =================================================
            # SIMPLIFIED TEXT
            # =================================================

            simplified_text = str(
                data.get(
                    "simplified_text",
                    ""
                )
            ).strip()


            if not simplified_text:

                raise ValueError(
                    "Gemini returned empty simplified text."
                )


            # =================================================
            # CLEAN DIFFICULT WORDS
            # =================================================

            returned_words = data.get(
                "difficult_words",
                []
            )


            if not isinstance(
                returned_words,
                list
            ):

                returned_words = []


            cleaned = []

            seen = set()


            # =================================================
            # PROCESS GEMINI VOCABULARY
            # =================================================

            for item in returned_words:

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


                word_key = word.lower()


                if word_key in seen:
                    continue


                # Only accept words detected by lexical.py
                if word_key not in {
                    w.lower()
                    for w in difficult_word_list
                }:

                    continue


                seen.add(
                    word_key
                )


                # ------------------------------------------------
                # Meaning fallback
                # ------------------------------------------------

                if not meaning:

                    meaning = (
                        "Meaning not available."
                    )


                # ------------------------------------------------
                # Validate replacement
                # ------------------------------------------------

                if replacement:

                    # Replacement must appear in output
                    if (
                        replacement.lower()
                        not in
                        simplified_text.lower()
                    ):

                        replacement = ""


                    # Replacement cannot equal original
                    elif (
                        replacement.lower()
                        == word.lower()
                    ):

                        replacement = ""


                # ------------------------------------------------
                # Store result
                # ------------------------------------------------

                cleaned.append(
                    {
                        "word": word,
                        "meaning": meaning,
                        "replacement": replacement
                    }
                )


            # =================================================
            # GUARANTEE EVERY DETECTED WORD IS REPRESENTED
            # =================================================

            existing_words = {
                item["word"].lower()
                for item in cleaned
            }


            for word in difficult_word_list:

                if (
                    word.lower()
                    not in existing_words
                ):

                    cleaned.append(
                        {
                            "word": word,
                            "meaning": (
                                "Meaning not available."
                            ),
                            "replacement": ""
                        }
                    )


            # =================================================
            # RETURN RESULT
            # =================================================

            print()
            print("=" * 70)
            print("READEASE AI RESPONSE")
            print("=" * 70)

            print(
                "Simplified text:"
            )

            print(
                simplified_text
            )

            print()

            print(
                "Vocabulary:"
            )

            print(
                cleaned
            )

            print("=" * 70)


            return {

                "simplified_text":
                    simplified_text,

                "difficult_words":
                    cleaned
            }


        # ====================================================
        # ERROR HANDLING
        # ====================================================

        except Exception as error:

            last_error = error


            print(
                "Gemini error:",
                repr(error)
            )


            if attempt < max_attempts - 1:

                time.sleep(
                    2 + random.random()
                )


    # ========================================================
    # ALL ATTEMPTS FAILED
    # ========================================================

    raise RuntimeError(
        f"Gemini simplification failed: {last_error}"
    )