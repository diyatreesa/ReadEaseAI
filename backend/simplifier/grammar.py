import language_tool_python


tool = language_tool_python.LanguageTool("en-US")


def correct_grammar(text):
    return tool.correct(text)


def grammar_score(text):

    matches = tool.check(text)

    words = text.split()

    word_count = len(words)

    if word_count == 0:
        return 100

    error_count = len(matches)

    # Calculate percentage of words affected by errors
    error_rate = error_count / word_count

    # Convert error rate into a score
    score = 100 - (error_rate * 100)

    # Keep score between 0 and 100
    score = max(
        0,
        min(
            100,
            round(score)
        )
    )

    return score