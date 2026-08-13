import spacy

# Load the English language model
nlp = spacy.load("en_core_web_sm")


def parse_text(text):
    """
    Parses the input text using spaCy.
    Returns a spaCy Doc object.
    """
    return nlp(text)