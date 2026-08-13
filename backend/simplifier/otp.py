import random
import time


# Store OTPs temporarily in memory
otp_storage = {}


OTP_EXPIRY_SECONDS = 10 * 60  # 10 minutes


def generate_otp():
    """
    Generate a random 6-digit OTP.
    """
    return str(random.randint(100000, 999999))


def store_otp(email, otp):
    """
    Store OTP and its creation time.
    """

    otp_storage[email] = {
        "otp": otp,
        "created_at": time.time()
    }


def verify_otp(email, entered_otp):
    """
    Verify the OTP and check whether it has expired.
    """

    email = email.lower().strip()

    if email not in otp_storage:
        return False, "No verification code was found."


    stored_data = otp_storage[email]

    stored_otp = stored_data["otp"]
    created_at = stored_data["created_at"]


    # Check expiry
    if time.time() - created_at > OTP_EXPIRY_SECONDS:

        del otp_storage[email]

        return False, "Verification code has expired. Please request a new code."


    # Check OTP
    if entered_otp != stored_otp:

        return False, "Incorrect verification code."


    # OTP is correct
    del otp_storage[email]

    return True, "Email verified successfully."