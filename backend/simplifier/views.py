from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt

import json
import re
import io


from django.core.mail import send_mail
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .otp import generate_otp, store_otp, verify_otp

from docx import Document
from pypdf import PdfReader
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

from .pipeline import simplify_pipeline
from .grammar import grammar_score


# =========================================================
# READABILITY CALCULATION
# =========================================================

def calculate_readability(text):

    if not isinstance(text, str):
        text = str(text)

    # -----------------------------------------------------
    # Find sentences
    # -----------------------------------------------------

    sentences = re.split(
        r"[.!?]+",
        text
    )

    sentences = [
        sentence.strip()
        for sentence in sentences
        if sentence.strip()
    ]

    # -----------------------------------------------------
    # Find words
    # -----------------------------------------------------

    words = re.findall(
        r"\b[a-zA-Z]+\b",
        text
    )

    if not words:
        return {
            "reading_ease": 0,
            "grade_level": 0
        }

    sentence_count = max(
        len(sentences),
        1
    )

    word_count = len(words)

    # -----------------------------------------------------
    # Syllable Counter
    # -----------------------------------------------------

    def count_syllables(word):

        word = word.lower()

        vowels = "aeiouy"

        syllables = 0
        previous_was_vowel = False

        for character in word:

            is_vowel = character in vowels

            if is_vowel and not previous_was_vowel:
                syllables += 1

            previous_was_vowel = is_vowel

        # Handle silent "e"

        if word.endswith("e") and syllables > 1:
            syllables -= 1

        return max(
            syllables,
            1
        )

    # -----------------------------------------------------
    # Count total syllables
    # -----------------------------------------------------

    total_syllables = sum(
        count_syllables(word)
        for word in words
    )

    # -----------------------------------------------------
    # Average values
    # -----------------------------------------------------

    words_per_sentence = (
        word_count / sentence_count
    )

    syllables_per_word = (
        total_syllables / word_count
    )

    # -----------------------------------------------------
    # Flesch Reading Ease
    # -----------------------------------------------------

    reading_ease = (
        206.835
        - (1.015 * words_per_sentence)
        - (84.6 * syllables_per_word)
    )

    # -----------------------------------------------------
    # Flesch-Kincaid Grade Level
    # -----------------------------------------------------

    grade_level = (
        (0.39 * words_per_sentence)
        + (11.8 * syllables_per_word)
        - 15.59
    )

    return {
        "reading_ease": round(
            reading_ease,
            2
        ),

        "grade_level": max(
            round(grade_level, 1),
            0
        )
    }


# =========================================================
# SIMPLIFY TEXT
# =========================================================

@csrf_exempt
def simplify_text(request):

    # -----------------------------------------------------
    # Only allow POST
    # -----------------------------------------------------

    if request.method != "POST":

        return JsonResponse(
            {
                "error":
                    "Only POST requests are allowed."
            },
            status=405
        )

    try:

        # =================================================
        # READ REQUEST DATA
        # Supports JSON + FormData
        # =================================================

        content_type = request.content_type or ""

        # -------------------------------------------------
        # JSON request
        # -------------------------------------------------

        if "application/json" in content_type:

            try:

                body = request.body.decode(
                    "utf-8"
                )

                if not body.strip():

                    return JsonResponse(
                        {
                            "error":
                                "Request body is empty."
                        },
                        status=400
                    )

                data = json.loads(body)

            except (
                json.JSONDecodeError,
                UnicodeDecodeError
            ):

                return JsonResponse(
                    {
                        "error":
                            "Invalid JSON request."
                    },
                    status=400
                )

            text = str(
                data.get(
                    "text",
                    ""
                )
            ).strip()

            level = data.get(
                "level",
                "Beginner"
            )

        # -------------------------------------------------
        # FormData / multipart/form-data
        # -------------------------------------------------

        else:

            text = request.POST.get(
                "text",
                ""
            ).strip()

            level = request.POST.get(
                "level",
                "Beginner"
            )

        # -------------------------------------------------
        # Validate reading level
        # -------------------------------------------------

        allowed_levels = {
            "Beginner",
            "Intermediate",
            "Advanced"
        }

        if level not in allowed_levels:

            level = "Beginner"

        # -------------------------------------------------
        # Validate text
        # -------------------------------------------------

        if not text:

            return JsonResponse(
                {
                    "error":
                        "Text is required."
                },
                status=400
            )

        # -------------------------------------------------
        # DEBUG
        # -------------------------------------------------

        print(
            "Received text:"
        )

        print(text)

        print(
            "Reading level:"
        )

        print(level)

        # =================================================
        # BEFORE SIMPLIFICATION
        # =================================================

        before_readability = calculate_readability(
            text
        )

        print(
            "Before readability:",
            before_readability
        )

        # =================================================
        # GRAMMAR SCORE
        # =================================================

        try:

            grammar_result = grammar_score(
                text
            )

        except Exception as grammar_error:

            print(
                "Grammar score error:",
                grammar_error
            )

            grammar_result = 0

        # =================================================
        # AI SIMPLIFICATION
        # =================================================

        simplified_result = simplify_pipeline(
            text,
            level
        )

        print(
            "Pipeline result:",
            simplified_result
        )

        # =================================================
        # HANDLE PIPELINE RESULT
        # =================================================

        if isinstance(
            simplified_result,
            dict
        ):

            simplified = simplified_result.get(
                "simplified_text",
                ""
            )

            # Get difficult words and replacements
            difficult_words = (
                simplified_result.get(
                    "difficult_words",
                    []
                )
            )

        else:

            simplified = simplified_result

            difficult_words = []

        # =================================================
        # MAKE SURE SIMPLIFIED TEXT IS A STRING
        # =================================================

        if not isinstance(
            simplified,
            str
        ):

            simplified = str(
                simplified
            )

        simplified = simplified.strip()

        print(
            "Final simplified text:"
        )

        print(simplified)

        # =================================================
        # SAFETY CHECK
        # =================================================

        if not simplified:

            return JsonResponse(
                {
                    "error":
                        "The AI returned empty text."
                },
                status=500
            )

        # =================================================
        # CLEAN DIFFICULT WORD MAPPINGS
        # =================================================

        if not isinstance(
            difficult_words,
            list
        ):

            difficult_words = []

        clean_difficult_words = []

        for item in difficult_words:

            if not isinstance(
                item,
                dict
            ):
                continue

            word = item.get(
                "word",
                ""
            )

            replacement = item.get(
                "replacement",
                ""
            )

            if word is None:
                continue

            if replacement is None:
                continue

            word = str(
                word
            ).strip()

            replacement = str(
                replacement
            ).strip()

            # Only keep mappings where BOTH
            # original word and replacement exist.

            if not word:
                continue

            if not replacement:
                continue

            clean_difficult_words.append(
                {
                    "word": word,
                    "replacement": replacement
                }
            )

        difficult_words = clean_difficult_words

        # =================================================
        # DEBUG
        # =================================================

        print(
            "FINAL DIFFICULT WORD MAPPINGS:"
        )

        print(
            difficult_words
        )

        # =================================================
        # AFTER SIMPLIFICATION
        # =================================================

        after_readability = calculate_readability(
            simplified
        )

        print(
            "After readability:",
            after_readability
        )

        # =================================================
        # READING TIME
        # =================================================

        word_count = len(
            text.split()
        )

        # Approximately 200 words per minute

        reading_time = max(
            round(
                word_count / 200
            ),
            1
        )

        # =================================================
        # READABILITY IMPROVEMENT
        # =================================================

        readability_improvement = round(
            after_readability[
                "reading_ease"
            ]
            -
            before_readability[
                "reading_ease"
            ],
            2
        )

        # =================================================
        # GRADE LEVEL CHANGE
        # =================================================

        grade_change = round(
            before_readability[
                "grade_level"
            ]
            -
            after_readability[
                "grade_level"
            ],
            1
        )

        # =================================================
        # RESPONSE
        # =================================================

        response_data = {

            # -------------------------------------------------
            # Text
            # -------------------------------------------------

            "original_text":
                text,

            "simplified_text":
                simplified,

            "reading_level":
                level,

            # -------------------------------------------------
            # BEFORE
            # -------------------------------------------------

            "before_readability":
                before_readability[
                    "reading_ease"
                ],

            "before_grade":
                before_readability[
                    "grade_level"
                ],

            # -------------------------------------------------
            # AFTER
            # -------------------------------------------------

            "after_readability":
                after_readability[
                    "reading_ease"
                ],

            "after_grade":
                after_readability[
                    "grade_level"
                ],

            # -------------------------------------------------
            # IMPROVEMENT
            # -------------------------------------------------

            "readability_improvement":
                readability_improvement,

            "grade_change":
                grade_change,

            # -------------------------------------------------
            # OTHER STATISTICS
            # -------------------------------------------------

            "reading_time":
                f"{reading_time} min",

            "grammar_score":
                f"{grammar_result}%",

            # -------------------------------------------------
            # DIFFICULT WORDS
            # -------------------------------------------------

            "difficult_words":
                difficult_words
        }

        # =================================================
        # DEBUG
        # =================================================

        print(
            "FINAL API RESPONSE:"
        )

        print(
            json.dumps(
                response_data,
                indent=2
            )
        )

        # =================================================
        # RETURN RESPONSE
        # =================================================

        return JsonResponse(
            response_data
        )

    except Exception as error:

        print(
            "Simplification error:",
            error
        )

        return JsonResponse(
            {
                "error":
                    "Unable to simplify the text.",

                "details":
                    str(error)
            },
            status=500
        )


# =========================================================
# UPLOAD FILE
# =========================================================

@csrf_exempt
def upload_file(request):

    # -----------------------------------------------------
    # Only allow POST
    # -----------------------------------------------------

    if request.method != "POST":

        return JsonResponse(
            {
                "error":
                    "Only POST requests are allowed."
            },
            status=405
        )

    try:

        # -------------------------------------------------
        # Get uploaded file
        # -------------------------------------------------

        uploaded_file = request.FILES.get(
            "file"
        )

        if not uploaded_file:

            return JsonResponse(
                {
                    "error":
                        "No file was uploaded."
                },
                status=400
            )

        filename = uploaded_file.name.lower()

        print(
            "Uploaded file:",
            filename
        )

        # =================================================
        # TXT
        # =================================================

        if filename.endswith(".txt"):

            try:

                text = uploaded_file.read().decode(
                    "utf-8"
                )

            except UnicodeDecodeError:

                uploaded_file.seek(0)

                text = uploaded_file.read().decode(
                    "latin-1"
                )

        # =================================================
        # DOCX
        # =================================================

        elif filename.endswith(".docx"):

            document = Document(
                uploaded_file
            )

            paragraphs = []

            for paragraph in document.paragraphs:

                if paragraph.text.strip():

                    paragraphs.append(
                        paragraph.text
                    )

            text = "\n".join(
                paragraphs
            )

        # =================================================
        # PDF
        # =================================================

        elif filename.endswith(".pdf"):

            reader = PdfReader(
                uploaded_file
            )

            pages = []

            for page in reader.pages:

                page_text = page.extract_text()

                if page_text:

                    pages.append(
                        page_text
                    )

            text = "\n".join(
                pages
            )

        # =================================================
        # UNSUPPORTED FILE
        # =================================================

        else:

            return JsonResponse(
                {
                    "error":
                        "Unsupported file type. "
                        "Please upload a PDF, DOCX, or TXT file."
                },
                status=400
            )

        # -------------------------------------------------
        # Clean extracted text
        # -------------------------------------------------

        text = text.strip()

        if not text:

            return JsonResponse(
                {
                    "error":
                        "Unable to extract text from the uploaded file."
                },
                status=400
            )

        # -------------------------------------------------
        # Debug
        # -------------------------------------------------

        print(
            "Extracted text:"
        )

        print(text)

        # -------------------------------------------------
        # Return extracted text
        # -------------------------------------------------

        return JsonResponse(
            {
                "filename":
                    uploaded_file.name,

                "text":
                    text
            }
        )

    except Exception as error:

        print(
            "File upload error:",
            error
        )

        return JsonResponse(
            {
                "error":
                    "Unable to read the uploaded file.",

                "details":
                    str(error)
            },
            status=500
        )


# =========================================================
# DOWNLOAD SIMPLIFIED TEXT
# =========================================================

@csrf_exempt
def download_simplified_text(request):

    # -----------------------------------------------------
    # Only allow POST
    # -----------------------------------------------------

    if request.method != "POST":

        return JsonResponse(
            {
                "error":
                    "Only POST requests are allowed."
            },
            status=405
        )

    try:

        # -------------------------------------------------
        # Read request
        # -------------------------------------------------

        content_type = request.content_type or ""

        if "application/json" in content_type:

            try:

                body = request.body.decode(
                    "utf-8"
                )

                if not body.strip():

                    return JsonResponse(
                        {
                            "error":
                                "Request body is empty."
                        },
                        status=400
                    )

                data = json.loads(body)

            except (
                json.JSONDecodeError,
                UnicodeDecodeError
            ):

                return JsonResponse(
                    {
                        "error":
                            "Invalid JSON request."
                    },
                    status=400
                )

            text = str(
                data.get(
                    "text",
                    ""
                )
            ).strip()

            file_format = str(
                data.get(
                    "format",
                    "txt"
                )
            ).lower()

        else:

            text = request.POST.get(
                "text",
                ""
            ).strip()

            file_format = request.POST.get(
                "format",
                "txt"
            ).lower()

        # -------------------------------------------------
        # Validate text
        # -------------------------------------------------

        if not text:

            return JsonResponse(
                {
                    "error":
                        "No simplified text provided."
                },
                status=400
            )

        # =================================================
        # TXT
        # =================================================

        if file_format == "txt":

            response = HttpResponse(
                text,
                content_type="text/plain; charset=utf-8"
            )

            response[
                "Content-Disposition"
            ] = (
                'attachment; '
                'filename="simplified_text.txt"'
            )

            return response

        # =================================================
        # DOCX
        # =================================================

        elif file_format == "docx":

            document = Document()

            document.add_heading(
                "Simplified Text",
                level=1
            )

            paragraphs = text.split(
                "\n"
            )

            for paragraph in paragraphs:

                if paragraph.strip():

                    document.add_paragraph(
                        paragraph.strip()
                    )

            file_stream = io.BytesIO()

            document.save(
                file_stream
            )

            file_stream.seek(0)

            response = HttpResponse(
                file_stream.getvalue(),
                content_type=(
                    "application/vnd.openxmlformats-officedocument."
                    "wordprocessingml.document"
                )
            )

            response[
                "Content-Disposition"
            ] = (
                'attachment; '
                'filename="simplified_text.docx"'
            )

            return response

        # =================================================
        # PDF
        # =================================================

        elif file_format == "pdf":

            file_stream = io.BytesIO()

            pdf = canvas.Canvas(
                file_stream,
                pagesize=A4
            )

            width, height = A4

            x = 50
            y = height - 50

            # -------------------------------------------------
            # Title
            # -------------------------------------------------

            pdf.setFont(
                "Helvetica-Bold",
                16
            )

            pdf.drawString(
                x,
                y,
                "Simplified Text"
            )

            y -= 35

            # -------------------------------------------------
            # Text
            # -------------------------------------------------

            pdf.setFont(
                "Helvetica",
                11
            )

            max_width = width - 100

            paragraphs = text.split(
                "\n"
            )

            for paragraph in paragraphs:

                words = paragraph.split()

                line = ""

                for word in words:

                    test_line = (
                        line + " " + word
                    ).strip()

                    line_width = pdf.stringWidth(
                        test_line,
                        "Helvetica",
                        11
                    )

                    if line_width <= max_width:

                        line = test_line

                    else:

                        if line:

                            pdf.drawString(
                                x,
                                y,
                                line
                            )

                            y -= 18

                        line = word

                    # New page

                    if y < 50:

                        pdf.showPage()

                        pdf.setFont(
                            "Helvetica",
                            11
                        )

                        y = height - 50

                # Remaining line

                if line:

                    pdf.drawString(
                        x,
                        y,
                        line
                    )

                    y -= 18

                # Paragraph spacing

                y -= 8

                # New page if necessary

                if y < 50:

                    pdf.showPage()

                    pdf.setFont(
                        "Helvetica",
                        11
                    )

                    y = height - 50

            pdf.save()

            file_stream.seek(0)

            response = HttpResponse(
                file_stream.getvalue(),
                content_type="application/pdf"
            )

            response[
                "Content-Disposition"
            ] = (
                'attachment; '
                'filename="simplified_text.pdf"'
            )

            return response

        # =================================================
        # INVALID FORMAT
        # =================================================

        else:

            return JsonResponse(
                {
                    "error":
                        "Unsupported download format."
                },
                status=400
            )

    except Exception as error:

        print(
            "Download error:",
            error
        )

        return JsonResponse(
            {
                "error":
                    "Unable to create the file.",

                "details":
                    str(error)
            },
            status=500
        )
    
@api_view(["POST"])
def send_verification_otp(request):

    email = request.data.get("email", "").strip().lower()


    # --------------------------------------------------
    # Validate email
    # --------------------------------------------------

    email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$"

    if not re.match(email_pattern, email):

        return Response(
            {
                "success": False,
                "message": "Please enter a valid email address."
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    # --------------------------------------------------
    # Generate OTP
    # --------------------------------------------------

    otp = generate_otp()


    # --------------------------------------------------
    # Store OTP
    # --------------------------------------------------

    store_otp(email, otp)


    # --------------------------------------------------
    # Send email
    # --------------------------------------------------

    try:

        send_mail(
            subject="ReadEase AI - Email Verification Code",

            message=(
                "Hello,\n\n"
                "Your ReadEase AI verification code is:\n\n"
                f"{otp}\n\n"
                "This code will expire in 10 minutes.\n\n"
                "If you did not request this code, "
                "you can safely ignore this email.\n\n"
                "Regards,\n"
                "ReadEase AI Team"
            ),

            from_email=None,

            recipient_list=[email],

            fail_silently=False,
        )


        return Response(
            {
                "success": True,
                "message": "Verification code sent successfully."
            },
            status=status.HTTP_200_OK
        )


    except Exception as error:

        print("Email sending error:", error)

        return Response(
            {
                "success": False,
                "message": "Unable to send verification email."
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
@api_view(["POST"])
def send_verification_otp(request):

    email = request.data.get("email", "").strip().lower()


    # --------------------------------------------------
    # Validate email
    # --------------------------------------------------

    email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$"

    if not re.match(email_pattern, email):

        return Response(
            {
                "success": False,
                "message": "Please enter a valid email address."
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    # --------------------------------------------------
    # Generate OTP
    # --------------------------------------------------

    otp = generate_otp()


    # --------------------------------------------------
    # Store OTP
    # --------------------------------------------------

    store_otp(email, otp)


    # --------------------------------------------------
    # Send email
    # --------------------------------------------------

    try:

        send_mail(
            subject="ReadEase AI - Email Verification Code",

            message=(
                "Hello,\n\n"
                "Your ReadEase AI verification code is:\n\n"
                f"{otp}\n\n"
                "This code will expire in 10 minutes.\n\n"
                "If you did not request this code, "
                "you can safely ignore this email.\n\n"
                "Regards,\n"
                "ReadEase AI Team"
            ),

            from_email=None,

            recipient_list=[email],

            fail_silently=False,
        )


        return Response(
            {
                "success": True,
                "message": "Verification code sent successfully."
            },
            status=status.HTTP_200_OK
        )


    except Exception as error:

        print("Email sending error:", error)

        return Response(
            {
                "success": False,
                "message": "Unable to send verification email."
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
@api_view(["POST"])
def verify_verification_otp(request):

    email = request.data.get("email", "").strip().lower()
    entered_otp = request.data.get("otp", "").strip()


    # --------------------------------------------------
    # Validate input
    # --------------------------------------------------

    if not email or not entered_otp:

        return Response(
            {
                "success": False,
                "message": "Email and verification code are required."
            },
            status=status.HTTP_400_BAD_REQUEST
        )


    # --------------------------------------------------
    # Verify OTP
    # --------------------------------------------------

    verified, message = verify_otp(
        email,
        entered_otp
    )


    if verified:

        return Response(
            {
                "success": True,
                "message": message
            },
            status=status.HTTP_200_OK
        )


    return Response(
        {
            "success": False,
            "message": message
        },
        status=status.HTTP_400_BAD_REQUEST
    )

# ============================================================
# EMAIL VERIFICATION OTP
# ============================================================

@api_view(["POST"])
def send_verification_otp(request):

    email = request.data.get("email", "").strip().lower()

    # --------------------------------------------------------
    # Validate email format
    # --------------------------------------------------------

    email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$"

    if not re.match(email_pattern, email):

        return Response(
            {
                "success": False,
                "message": "Please enter a valid email address."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # --------------------------------------------------------
    # Generate OTP
    # --------------------------------------------------------

    otp = generate_otp()

    # --------------------------------------------------------
    # Store OTP
    # --------------------------------------------------------

    store_otp(email, otp)

    # --------------------------------------------------------
    # Send OTP email
    # --------------------------------------------------------

    try:

        send_mail(
            subject="ReadEase AI - Email Verification Code",

            message=(
                "Hello,\n\n"
                "Your ReadEase AI verification code is:\n\n"
                f"{otp}\n\n"
                "This code will expire in 10 minutes.\n\n"
                "If you did not request this code, "
                "you can safely ignore this email.\n\n"
                "Regards,\n"
                "ReadEase AI Team"
            ),

            from_email=None,

            recipient_list=[email],

            fail_silently=False,
        )

        return Response(
            {
                "success": True,
                "message": "Verification code sent successfully."
            },
            status=status.HTTP_200_OK
        )

    except Exception as error:

        print("Email sending error:", error)

        return Response(
            {
                "success": False,
                "message": "Unable to send verification email."
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================================
# VERIFY EMAIL OTP
# ============================================================

@api_view(["POST"])
def verify_verification_otp(request):

    email = request.data.get("email", "").strip().lower()

    entered_otp = request.data.get("otp", "").strip()

    # --------------------------------------------------------
    # Check input
    # --------------------------------------------------------

    if not email or not entered_otp:

        return Response(
            {
                "success": False,
                "message": "Email and verification code are required."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # --------------------------------------------------------
    # Verify OTP
    # --------------------------------------------------------

    verified, message = verify_otp(
        email,
        entered_otp
    )

    if verified:

        return Response(
            {
                "success": True,
                "message": message
            },
            status=status.HTTP_200_OK
        )

    return Response(
        {
            "success": False,
            "message": message
        },
        status=status.HTTP_400_BAD_REQUEST
    )