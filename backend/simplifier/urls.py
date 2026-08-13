from django.urls import path

from .views import (
    simplify_text,
    upload_file,
    download_simplified_text
)


urlpatterns = [

    path(
        "simplify/",
        simplify_text
    ),

    path(
        "upload/",
        upload_file
    ),

    path(
        "download/",
        download_simplified_text
    ),

]