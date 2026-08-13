import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { auth, db } from "../services/firebase";

import {
  doc,
  setDoc,
} from "firebase/firestore";


function Register() {

  const navigate = useNavigate();


  // =========================================================
  // FORM STATE
  // =========================================================

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");


  // =========================================================
  // OTP STATE
  // =========================================================

  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);


  // =========================================================
  // LOADING STATE
  // =========================================================

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);


  // =========================================================
  // ERROR / SUCCESS
  // =========================================================

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // =========================================================
  // EMAIL VALIDATION
  // =========================================================

  const isValidEmail = (email) => {

    const emailPattern =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    return emailPattern.test(email);
  };


  // =========================================================
  // REGISTER BUTTON
  // FIRST CLICK = SEND OTP
  // SECOND CLICK = VERIFY OTP + CREATE ACCOUNT
  // =========================================================

  const handleRegister = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail =
      email.trim().toLowerCase();


    // =======================================================
    // STEP 1 — SEND OTP
    // =======================================================

    if (!otpSent) {

      // Validate name

      if (!name.trim()) {

        setError(
          "Please enter your full name."
        );

        return;
      }


      // Validate email

      if (!cleanEmail) {

        setError(
          "Please enter your email address."
        );

        return;
      }


      if (!isValidEmail(cleanEmail)) {

        setError(
          "Please enter a valid email address."
        );

        return;
      }


      // Validate password

      if (password.length < 6) {

        setError(
          "Password must contain at least 6 characters."
        );

        return;
      }


      // Confirm password

      if (password !== confirmPassword) {

        setError(
          "Passwords do not match."
        );

        return;
      }


      try {

        setLoading(true);


        // ---------------------------------------------------
        // SEND OTP FROM DJANGO
        // ---------------------------------------------------

        const response = await fetch(
          "http://127.0.0.1:8000/api/auth/send-otp/",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              email: cleanEmail,
            }),
          }
        );


        const data =
          await response.json();


        if (!response.ok) {

          setError(
            data.message ||
            data.detail ||
            "Unable to send verification code."
          );

          return;
        }


        // OTP sent successfully

        setOtpSent(true);

        setSuccess(
          "A verification code has been sent to your email."
        );

      }


      catch (error) {

        console.error(
          "Send OTP error:",
          error
        );


        setError(
          "Unable to send verification code. Please make sure the backend server is running."
        );

      }


      finally {

        setLoading(false);

      }

      return;
    }


    // =======================================================
    // STEP 2 — VERIFY OTP
    // =======================================================

    if (!otp.trim()) {

      setError(
        "Please enter the verification code."
      );

      return;
    }


    if (!/^\d{6}$/.test(otp.trim())) {

      setError(
        "Verification code must contain 6 digits."
      );

      return;
    }


    try {

      setLoading(true);


      // ---------------------------------------------------
      // VERIFY OTP WITH DJANGO
      // ---------------------------------------------------

      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/verify-otp/",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: cleanEmail,
            otp: otp.trim(),
          }),
        }
      );


      const data =
        await response.json();


      // Wrong OTP

      if (!response.ok) {

        setError(
          data.message ||
          data.detail ||
          "Incorrect verification code."
        );

        return;
      }


      // OTP correct

      setOtpVerified(true);

      setSuccess(
        "Email verified successfully. Creating your account..."
      );


      // ===================================================
      // CREATE FIREBASE ACCOUNT
      // ===================================================

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );


      const user =
        userCredential.user;


      // ===================================================
      // SAVE NAME IN FIREBASE AUTH
      // ===================================================

      await updateProfile(
        user,
        {
          displayName: name.trim(),
        }
      );


      // ===================================================
      // SAVE USER IN FIRESTORE
      // ===================================================

      await setDoc(
        doc(
          db,
          "users",
          user.uid
        ),
        {
          name: name.trim(),

          email: cleanEmail,

          provider: "email",

          createdAt: new Date(),
        }
      );


      // ===================================================
      // GO TO DASHBOARD
      // ===================================================

      navigate("/dashboard");

    }


    catch (error) {

      console.error(
        "Registration / OTP error:",
        error
      );


      if (
        error.code ===
        "auth/email-already-in-use"
      ) {

        setError(
          "An account with this email already exists. Please login instead."
        );

      }

      else if (
        error.code ===
        "auth/invalid-email"
      ) {

        setError(
          "Please enter a valid email address."
        );

      }

      else if (
        error.code ===
        "auth/weak-password"
      ) {

        setError(
          "Password is too weak. Use at least 6 characters."
        );

      }

      else {

        setError(
          "Unable to complete registration. Please try again."
        );

      }

    }


    finally {

      setLoading(false);

    }

  };


  // =========================================================
  // GOOGLE REGISTER / LOGIN
  // =========================================================

  const handleGoogleRegister = async () => {

    setError("");
    setSuccess("");

    setGoogleLoading(true);


    try {

      const googleProvider =
        new GoogleAuthProvider();


      // Show Google account selection

      googleProvider.setCustomParameters({
        prompt: "select_account",
      });


      const result =
        await signInWithPopup(
          auth,
          googleProvider
        );


      const user =
        result.user;


      // -----------------------------------------------------
      // SAVE GOOGLE USER
      // -----------------------------------------------------

      await setDoc(
        doc(
          db,
          "users",
          user.uid
        ),
        {

          name:
            user.displayName ||
            "Google User",

          email:
            user.email,

          photoURL:
            user.photoURL ||
            "",

          provider:
            "google",

          updatedAt:
            new Date(),

        },
        {
          merge: true,
        }
      );


      // -----------------------------------------------------
      // DASHBOARD
      // -----------------------------------------------------

      navigate("/dashboard");

    }


    catch (error) {

      console.error(
        "Google registration error:",
        error
      );


      if (
        error.code ===
        "auth/popup-closed-by-user"
      ) {

        setError(
          "Google sign-in was cancelled."
        );

      }

      else if (
        error.code ===
        "auth/popup-blocked"
      ) {

        setError(
          "Google sign-in popup was blocked. Please allow popups and try again."
        );

      }

      else if (
        error.code ===
        "auth/account-exists-with-different-credential"
      ) {

        setError(
          "An account already exists with this email using another login method."
        );

      }

      else {

        setError(
          "Google registration failed. Please try again."
        );

      }

    }


    finally {

      setGoogleLoading(false);

    }

  };


  // =========================================================
  // GOOGLE ICON
  // =========================================================

  const GoogleIcon = () => (

    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >

      {/* Blue */}

      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.79-.07-1.55-.23-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.7 2.92-4.2 2.92-7.39Z"
      />


      {/* Green */}

      <path
        fill="#34A853"
        d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.5A9.75 9.75 0 0 0 12 21.75Z"
      />


      {/* Yellow */}

      <path
        fill="#FBBC05"
        d="M6.54 13.85A5.86 5.86 0 0 1 6.23 12c0-.64.11-1.26.31-1.85v-2.5H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.35l3.24-2.5Z"
      />


      {/* Red */}

      <path
        fill="#EA4335"
        d="M12 6.12c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.23 14.63 2.25 12 2.25A9.75 9.75 0 0 0 3.3 7.65l3.24 2.5C7.31 7.84 9.46 6.12 12 6.12Z"
      />

    </svg>

  );


  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="min-h-screen bg-slate-950 text-white flex">


      {/* =====================================================
          LEFT SIDE
      ===================================================== */}

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">


        {/* Background glow */}

        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl" />

        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />


        {/* LEFT CONTENT */}

        <div className="relative z-10 flex flex-col justify-start px-16 xl:px-24 pt-20 xl:pt-24">


          {/* Logo */}

          <Link
            to="/"
            className="flex items-center gap-3 text-4xl font-bold text-cyan-400 hover:text-cyan-300 transition w-fit"
          >

            <img
              src="/logo.png"
              alt="ReadEase AI Logo"
              className="w-14 h-14 object-contain"
            />

            <span>
              ReadEase AI
            </span>

          </Link>


          {/* Heading */}

          <h2 className="text-5xl xl:text-6xl font-bold leading-tight mt-10">

            Start making

            <span className="block text-cyan-400">
              reading easier.
            </span>

          </h2>


          {/* Description */}

          <p className="text-slate-400 text-lg leading-relaxed mt-6 max-w-xl">

            Create your ReadEase AI account and make
            difficult English easier to understand,
            one text at a time.

          </p>


          {/* Features */}

          <div className="mt-10 space-y-5">


            {/* Feature 1 */}

            <div className="flex items-center gap-4">

              <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
                ✓
              </div>

              <div>

                <p className="font-semibold">
                  Simplify at Your Level
                </p>

                <p className="text-sm text-slate-500">
                  Choose Beginner, Intermediate, or Advanced.
                </p>

              </div>

            </div>


            {/* Feature 2 */}

            <div className="flex items-center gap-4">

              <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
                ✓
              </div>

              <div>

                <p className="font-semibold">
                  Track Your History
                </p>

                <p className="text-sm text-slate-500">
                  Keep your previous simplifications in one place.
                </p>

              </div>

            </div>


            {/* Feature 3 */}

            <div className="flex items-center gap-4">

              <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
                ✓
              </div>

              <div>

                <p className="font-semibold">
                  Listen and Learn
                </p>

                <p className="text-sm text-slate-500">
                  Listen to both original and simplified text.
                </p>

              </div>

            </div>


          </div>


        </div>

      </div>



      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <div className="w-full lg:w-1/2 flex items-start justify-center px-4 sm:px-6 py-8 lg:py-10">


        <div className="w-full max-w-md">


          {/* Mobile Logo */}

          <div className="lg:hidden text-center mb-8">

            <Link
              to="/"
              className="flex items-center justify-center gap-2 text-3xl font-bold text-cyan-400"
            >

              <img
                src="/logo.png"
                alt="ReadEase AI Logo"
                className="w-12 h-12 object-contain"
              />

              <span>
                ReadEase AI
              </span>

            </Link>

          </div>



          {/* =================================================
              REGISTER CARD
          ================================================= */}

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">


            {/* Heading */}

            <div className="text-center">


              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 mb-5">

                <img
                  src="/logo.png"
                  alt="ReadEase AI Logo"
                  className="w-16 h-16 object-contain"
                />

              </div>


              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Create Account
              </h1>


              <p className="text-slate-400 mt-3">
                Join ReadEase AI and simplify reading.
              </p>


            </div>



            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

              <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm">

                {error}

              </div>

            )}



            {/* =================================================
                SUCCESS
            ================================================= */}

            {success && (

              <div className="mt-6 bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 rounded-xl p-3 text-sm">

                {success}

              </div>

            )}



            {/* =================================================
                REGISTER FORM
            ================================================= */}

            <form
              onSubmit={handleRegister}
              className="mt-8 space-y-5"
            >


              {/* FULL NAME */}

              <div>

                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                  disabled={otpSent}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10 disabled:opacity-60"
                />

              </div>



              {/* EMAIL */}

              <div>

                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  autoComplete="email"
                  disabled={otpSent}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10 disabled:opacity-60"
                />

              </div>



              {/* PASSWORD */}

              <div>

                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Create a password"
                  autoComplete="new-password"
                  disabled={otpSent}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10 disabled:opacity-60"
                />

              </div>



              {/* CONFIRM PASSWORD */}

              <div>

                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  disabled={otpSent}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10 disabled:opacity-60"
                />

              </div>



              {/* =================================================
                  OTP FIELD
              ================================================= */}

              {otpSent && (

                <div>

                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Verification Code
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                    placeholder="Enter 6-digit code"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10 tracking-[0.3em] text-center"
                  />

                  <p className="text-xs text-slate-500 mt-2 text-center">
                    A verification code has been sent to your email.
                  </p>

                </div>

              )}



              {/* =================================================
                  MAIN BUTTON
              ================================================= */}

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full bg-cyan-400 text-black py-3.5 rounded-xl font-semibold hover:bg-cyan-300 transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >

                {loading

                  ? otpSent
                    ? "Verifying..."
                    : "Sending Code..."

                  : otpSent
                    ? "Verify & Create Account"
                    : "Register"

                }

              </button>


            </form>



            {/* =================================================
                OR
            ================================================= */}

            <div className="flex items-center gap-3 my-6">

              <div className="flex-1 h-px bg-slate-800" />

              <span className="text-slate-500 text-sm">
                OR
              </span>

              <div className="flex-1 h-px bg-slate-800" />

            </div>



            {/* =================================================
                GOOGLE BUTTON
            ================================================= */}

            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={loading || googleLoading}
              className="
                w-full
                py-3.5
                rounded-xl
                bg-slate-800/80
                border border-slate-700
                text-white
                font-semibold
                transition duration-200
                hover:bg-slate-800
                hover:border-cyan-400
                flex items-center justify-center gap-3
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >

              {googleLoading ? (

                <>

                  <div className="w-5 h-5 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>

                  <span>
                    Connecting to Google...
                  </span>

                </>

              ) : (

                <>

                  <GoogleIcon />

                  <span>
                    Continue with Google
                  </span>

                </>

              )}

            </button>



            {/* =================================================
                LOGIN
            ================================================= */}

            <div className="mt-8 pt-6 border-t border-slate-800 text-center">

              <p className="text-slate-400 text-sm">

                Already have an account?{" "}

                <Link
                  to="/login"
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition"
                >
                  Login
                </Link>

              </p>

            </div>


          </div>



          {/* BACK TO HOME */}

          <div className="text-center mt-6">

            <Link
              to="/"
              className="text-sm text-slate-500 hover:text-slate-300 transition"
            >
              ← Back to Home
            </Link>

          </div>


        </div>

      </div>


    </div>

  );

}


export default Register;