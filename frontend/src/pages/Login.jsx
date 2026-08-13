import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { auth, db } from "../services/firebase";


function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");


  // =========================================================
  // EMAIL + PASSWORD LOGIN
  // =========================================================

  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");

    // -------------------------------------------------------
    // Validate fields
    // -------------------------------------------------------

    if (!email.trim() || !password) {

      setError(
        "Please enter your email and password."
      );

      return;
    }


    try {

      setLoading(true);

      // -----------------------------------------------------
      // Firebase email/password login
      // -----------------------------------------------------

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );


      // -----------------------------------------------------
      // Login successful
      // -----------------------------------------------------

      navigate("/dashboard");


    } catch (error) {

      console.error(
        "Login error:",
        error
      );


      switch (error.code) {

        case "auth/invalid-credential":

          setError(
            "Invalid email or password."
          );

          break;


        case "auth/user-not-found":

          setError(
            "No account was found with this email. Please register first."
          );

          break;


        case "auth/wrong-password":

          setError(
            "Incorrect password."
          );

          break;


        case "auth/invalid-email":

          setError(
            "Please enter a valid email address."
          );

          break;


        case "auth/too-many-requests":

          setError(
            "Too many unsuccessful attempts. Please try again later."
          );

          break;


        case "auth/network-request-failed":

          setError(
            "Network error. Please check your internet connection."
          );

          break;


        default:

          setError(
            "Unable to login. Please try again."
          );

      }

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // GOOGLE LOGIN
  //
  // IMPORTANT:
  // A Google account must already exist in the
  // ReadEase Firestore "users" collection.
  // =========================================================

  const handleGoogleLogin = async () => {

    setError("");

    setGoogleLoading(true);


    try {

      // -----------------------------------------------------
      // STEP 1 — Open Google login
      // -----------------------------------------------------

      const provider =
        new GoogleAuthProvider();


      provider.setCustomParameters({
        prompt: "select_account",
      });


      const result =
        await signInWithPopup(
          auth,
          provider
        );


      const googleUser =
        result.user;


      // -----------------------------------------------------
      // STEP 2 — Get Google email
      // -----------------------------------------------------

      const googleEmail =
        googleUser.email
          ?.trim()
          .toLowerCase();


      if (!googleEmail) {

        setError(
          "Unable to get your Google email address."
        );

        await auth.signOut();

        return;
      }


      // -----------------------------------------------------
      // STEP 3 — Check Firestore
      //
      // We search for this email inside:
      //
      // users
      //
      // If the email doesn't exist there,
      // the person has NOT registered in ReadEase.
      // -----------------------------------------------------

      const usersRef =
        collection(
          db,
          "users"
        );


      const userQuery =
        query(
          usersRef,
          where(
            "email",
            "==",
            googleEmail
          )
        );


      const userSnapshot =
        await getDocs(
          userQuery
        );


      // -----------------------------------------------------
      // STEP 4 — User NOT registered
      // -----------------------------------------------------

      if (userSnapshot.empty) {

        // Immediately sign the Google user out.
        await auth.signOut();


        setError(
          "No ReadEase account was found with this Google email. Please register first."
        );


        return;
      }


      // -----------------------------------------------------
      // STEP 5 — User exists
      // -----------------------------------------------------

      console.log(
        "Existing ReadEase user:",
        googleEmail
      );


      // -----------------------------------------------------
      // STEP 6 — Allow access
      // -----------------------------------------------------

      navigate("/dashboard");


    } catch (error) {

      console.error(
        "Google login error:",
        error
      );


      switch (error.code) {

        case "auth/popup-closed-by-user":

          setError(
            "Google sign-in was cancelled."
          );

          break;


        case "auth/popup-blocked":

          setError(
            "Google sign-in popup was blocked. Please allow popups for this site."
          );

          break;


        case "auth/cancelled-popup-request":

          setError(
            "Google sign-in was cancelled."
          );

          break;


        case "auth/account-exists-with-different-credential":

          setError(
            "An account already exists with this email using another login method."
          );

          break;


        case "auth/network-request-failed":

          setError(
            "Network error. Please check your internet connection."
          );

          break;


        default:

          setError(
            "Unable to sign in with Google. Please try again."
          );

      }

    } finally {

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
          LEFT SIDE — BRAND / INFORMATION
      ===================================================== */}

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">


        {/* Background glow */}

        <div
          className="
            absolute
            top-20
            left-20
            w-72
            h-72
            bg-cyan-400/10
            rounded-full
            blur-3xl
          "
        />


        <div
          className="
            absolute
            bottom-20
            right-20
            w-80
            h-80
            bg-blue-500/10
            rounded-full
            blur-3xl
          "
        />


        {/* Left content */}

        <div
          className="
            relative
            z-10
            flex
            flex-col
            justify-start
            px-16
            xl:px-24
            pt-10
            xl:pt-14
          "
        >


          {/* =================================================
              LOGO
          ================================================= */}

          <Link
            to="/"
            className="
              flex
              items-center
              gap-3
              w-fit
              group
            "
          >

            <img
              src="/logo.png"
              alt="ReadEase AI Logo"
              className="
                w-12
                h-12
                object-contain
                transition
                duration-200
                group-hover:scale-105
              "
            />


            <span
              className="
                text-4xl
                font-bold
                text-cyan-400
                group-hover:text-cyan-300
                transition
              "
            >
              ReadEase AI
            </span>

          </Link>


          {/* =================================================
              HEADING
          ================================================= */}

          <h2
            className="
              text-5xl
              xl:text-6xl
              font-bold
              leading-tight
              mt-10
            "
          >

            Make complex text

            <span className="block text-cyan-400">
              easier to understand.
            </span>

          </h2>


          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <p
            className="
              text-slate-400
              text-lg
              leading-relaxed
              mt-6
              max-w-xl
            "
          >

            ReadEase AI transforms difficult English into
            clear, easy-to-read language while preserving
            the original meaning.

          </p>


          {/* =================================================
              FEATURES
          ================================================= */}

          <div className="mt-9 space-y-5">


            {/* FEATURE 1 */}

            <div className="flex items-center gap-4">

              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-cyan-400/10
                  border
                  border-cyan-400/20
                  flex
                  items-center
                  justify-center
                  text-cyan-400
                  text-lg
                "
              >
                ✓
              </div>


              <div>

                <p className="font-semibold">
                  AI Text Simplification
                </p>

                <p className="text-sm text-slate-500">
                  Make difficult text easier to read.
                </p>

              </div>

            </div>


            {/* FEATURE 2 */}

            <div className="flex items-center gap-4">

              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-cyan-400/10
                  border
                  border-cyan-400/20
                  flex
                  items-center
                  justify-center
                  text-cyan-400
                  text-lg
                "
              >
                ✓
              </div>


              <div>

                <p className="font-semibold">
                  Difficult Word Detection
                </p>

                <p className="text-sm text-slate-500">
                  Identify complex vocabulary instantly.
                </p>

              </div>

            </div>


            {/* FEATURE 3 */}

            <div className="flex items-center gap-4">

              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-cyan-400/10
                  border
                  border-cyan-400/20
                  flex
                  items-center
                  justify-center
                  text-cyan-400
                  text-lg
                "
              >
                ✓
              </div>


              <div>

                <p className="font-semibold">
                  Text-to-Speech
                </p>

                <p className="text-sm text-slate-500">
                  Listen to your original and simplified text.
                </p>

              </div>

            </div>


          </div>


        </div>

      </div>



      {/* =====================================================
          RIGHT SIDE — LOGIN
      ===================================================== */}

      <div
        className="
          w-full
          lg:w-1/2
          flex
          items-center
          justify-center
          px-6
          py-12
        "
      >

        <div className="w-full max-w-md">


          {/* =================================================
              MOBILE LOGO
          ================================================= */}

          <div className="lg:hidden text-center mb-8">

            <Link
              to="/"
              className="
                inline-flex
                items-center
                gap-2
              "
            >

              <img
                src="/logo.png"
                alt="ReadEase AI Logo"
                className="
                  w-12
                  h-12
                  object-contain
                "
              />


              <span
                className="
                  text-3xl
                  font-bold
                  text-cyan-400
                "
              >
                ReadEase AI
              </span>

            </Link>

          </div>



          {/* =================================================
              LOGIN CARD
          ================================================= */}

          <div
            className="
              bg-slate-900/80
              border
              border-slate-800
              rounded-3xl
              p-8
              sm:p-10
              shadow-2xl
              backdrop-blur-sm
            "
          >


            {/* =================================================
                HEADING
            ================================================= */}

            <div className="text-center">


              <div
                className="
                  inline-flex
                  items-center
                  justify-center
                  w-20
                  h-20
                  rounded-2xl
                  bg-cyan-400/10
                  border
                  border-cyan-400/20
                  mb-5
                "
              >

                <img
                  src="/logo.png"
                  alt="ReadEase AI Logo"
                  className="
                    w-16
                    h-16
                    object-contain
                  "
                />

              </div>


              <h1
                className="
                  text-3xl
                  sm:text-4xl
                  font-bold
                  text-white
                "
              >
                Welcome Back
              </h1>


              <p className="text-slate-400 mt-3">
                Login to continue using ReadEase AI
              </p>


            </div>



            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error && (

              <div
                className="
                  mt-6
                  bg-red-500/10
                  border
                  border-red-500/30
                  text-red-400
                  rounded-xl
                  p-4
                  text-sm
                  leading-relaxed
                "
              >

                <div className="flex items-start gap-3">

                  <span className="text-red-400 text-base">
                    !
                  </span>

                  <p>
                    {error}
                  </p>

                </div>

              </div>

            )}



            {/* =================================================
                EMAIL LOGIN FORM
            ================================================= */}

            <form
              onSubmit={handleLogin}
              className="mt-8 space-y-5"
            >


              {/* EMAIL */}

              <div>

                <label
                  className="
                    block
                    text-sm
                    font-medium
                    text-slate-300
                    mb-2
                  "
                >
                  Email
                </label>


                <input
                  type="email"
                  value={email}
                  onChange={(e) => {

                    setEmail(
                      e.target.value
                    );

                    setError("");

                  }}
                  placeholder="Enter your email"
                  autoComplete="email"
                  disabled={
                    loading ||
                    googleLoading
                  }
                  className="
                    w-full
                    px-4
                    py-3.5
                    rounded-xl
                    bg-slate-800/80
                    border
                    border-slate-700
                    text-white
                    placeholder-slate-500
                    outline-none
                    transition
                    focus:border-cyan-400
                    focus:ring-2
                    focus:ring-cyan-400/10
                    disabled:opacity-60
                  "
                />

              </div>



              {/* PASSWORD */}

              <div>

                <label
                  className="
                    block
                    text-sm
                    font-medium
                    text-slate-300
                    mb-2
                  "
                >
                  Password
                </label>


                <input
                  type="password"
                  value={password}
                  onChange={(e) => {

                    setPassword(
                      e.target.value
                    );

                    setError("");

                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={
                    loading ||
                    googleLoading
                  }
                  className="
                    w-full
                    px-4
                    py-3.5
                    rounded-xl
                    bg-slate-800/80
                    border
                    border-slate-700
                    text-white
                    placeholder-slate-500
                    outline-none
                    transition
                    focus:border-cyan-400
                    focus:ring-2
                    focus:ring-cyan-400/10
                    disabled:opacity-60
                  "
                />

              </div>



              {/* FORGOT PASSWORD */}

              <div className="flex justify-end">

                <button
                  type="button"
                  className="
                    text-sm
                    text-cyan-400
                    hover:text-cyan-300
                    transition
                  "
                  onClick={() => {

                    alert(
                      "Password reset will be added next."
                    );

                  }}
                >
                  Forgot Password?
                </button>

              </div>



              {/* EMAIL LOGIN BUTTON */}

              <button
                type="submit"
                disabled={
                  loading ||
                  googleLoading
                }
                className="
                  w-full
                  bg-cyan-400
                  text-black
                  py-3.5
                  rounded-xl
                  font-semibold
                  hover:bg-cyan-300
                  transition
                  duration-200
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                "
              >

                {loading
                  ? "Logging in..."
                  : "Login"
                }

              </button>


            </form>



            {/* =================================================
                OR DIVIDER
            ================================================= */}

            <div
              className="
                flex
                items-center
                gap-4
                my-7
              "
            >

              <div className="flex-1 h-px bg-slate-800" />

              <span className="text-sm text-slate-500">
                OR
              </span>

              <div className="flex-1 h-px bg-slate-800" />

            </div>



            {/* =================================================
                GOOGLE LOGIN
            ================================================= */}

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={
                loading ||
                googleLoading
              }
              className="
                w-full
                bg-slate-800/80
                border
                border-slate-700
                text-white
                py-3.5
                rounded-xl
                font-semibold
                hover:bg-slate-700
                hover:border-cyan-400
                transition
                duration-200
                flex
                items-center
                justify-center
                gap-3
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >

              {googleLoading ? (

                <>

                  <div
                    className="
                      w-5
                      h-5
                      border-2
                      border-white/30
                      border-t-white
                      rounded-full
                      animate-spin
                    "
                  />

                  <span>
                    Checking Google account...
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
                REGISTER
            ================================================= */}

            <div
              className="
                mt-8
                pt-6
                border-t
                border-slate-800
                text-center
              "
            >

              <p className="text-slate-400 text-sm">

                Don't have an account?{" "}

                <Link
                  to="/register"
                  className="
                    text-cyan-400
                    hover:text-cyan-300
                    font-medium
                    transition
                  "
                >
                  Create Account
                </Link>

              </p>

            </div>


          </div>



          {/* =================================================
              BACK TO HOME
          ================================================= */}

          <div className="text-center mt-6">

            <Link
              to="/"
              className="
                text-sm
                text-slate-500
                hover:text-slate-300
                transition
              "
            >
              ← Back to Home
            </Link>

          </div>


        </div>

      </div>


    </div>

  );

}


export default Login;