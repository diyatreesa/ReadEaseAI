from django.urls import path

from .views import (
    simplify_text,
    upload_file,
    download_simplified_text,
    send_verification_otp,
    verify_verification_otp,
)


urlpatterns = [

    # Text simplification
    path(
        "simplify/",
        simplify_text
    ),

    # File upload
    path(
        "upload/",
        upload_file
    ),

    # Download simplified text
    path(
        "download/",
        download_simplified_text
    ),

    # Email verification
    path(
        "auth/send-otp/",
        send_verification_otp
    ),

    path(
        "auth/verify-otp/",
        verify_verification_otp
    ),

]