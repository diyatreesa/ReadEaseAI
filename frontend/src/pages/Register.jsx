import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";

import { auth, db } from "../services/firebase";

import {
  doc,
  setDoc
} from "firebase/firestore";


function Register() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // =========================================================
  // REGISTER
  // =========================================================

  const handleRegister = async (e) => {

    e.preventDefault();

    setError("");


    // -------------------------------------------------------
    // Validate name
    // -------------------------------------------------------

    if (!name.trim()) {

      setError(
        "Please enter your full name."
      );

      return;
    }


    // -------------------------------------------------------
    // Validate email
    // -------------------------------------------------------

    if (!email.trim()) {

      setError(
        "Please enter your email."
      );

      return;
    }


    // -------------------------------------------------------
    // Validate password
    // -------------------------------------------------------

    if (password.length < 6) {

      setError(
        "Password must contain at least 6 characters."
      );

      return;
    }


    // -------------------------------------------------------
    // Confirm password
    // -------------------------------------------------------

    if (password !== confirmPassword) {

      setError(
        "Passwords do not match."
      );

      return;
    }


    // =======================================================
    // FIREBASE REGISTRATION
    // =======================================================

    try {

      setLoading(true);


      // -----------------------------------------------------
      // Create Firebase account
      // -----------------------------------------------------

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );


      const user =
        userCredential.user;


      // -----------------------------------------------------
      // Store user's name in Firebase Auth
      // -----------------------------------------------------

      await updateProfile(
        user,
        {
          displayName:
            name.trim()
        }
      );


      // -----------------------------------------------------
      // Store user information in Firestore
      // -----------------------------------------------------

      await setDoc(
        doc(
          db,
          "users",
          user.uid
        ),
        {
          name:
            name.trim(),

          email:
            email.trim(),

          createdAt:
            new Date()
        }
      );


      // -----------------------------------------------------
      // Go to dashboard
      // -----------------------------------------------------

      navigate(
        "/dashboard"
      );


    } catch (error) {

      console.error(
        "Registration error:",
        error
      );


      // -----------------------------------------------------
      // Firebase error handling
      // -----------------------------------------------------

      if (
        error.code ===
        "auth/email-already-in-use"
      ) {

        setError(
          "An account with this email already exists."
        );

      } else if (
        error.code ===
        "auth/invalid-email"
      ) {

        setError(
          "Please enter a valid email address."
        );

      } else if (
        error.code ===
        "auth/weak-password"
      ) {

        setError(
          "Password is too weak. Use at least 6 characters."
        );

      } else {

        setError(
          "Unable to create your account. Please try again."
        );
      }

    } finally {

      setLoading(false);

    }
  };


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

        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl" />

        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />


        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">

          {/* Logo */}

          <Link
            to="/"
            className="text-4xl font-bold text-cyan-400 hover:text-cyan-300 transition w-fit"
          >
            ReadEase AI
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
          RIGHT SIDE — REGISTER
          ===================================================== */}

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          {/* Mobile Logo */}

          <div className="lg:hidden text-center mb-10">

            <Link
              to="/"
              className="text-3xl font-bold text-cyan-400"
            >
              ReadEase AI
            </Link>

          </div>


          {/* Register Card */}

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-sm">

            {/* Heading */}

            <div className="text-center">

              <div className="inline-flex items-center justify-center w-22 h-22 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 text-2xl mb-5">
                <img
  src="/logo.png"
  alt="ReadEase AI Logo"
  className="w-20 h-20 object-contain"
/>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Create Account
              </h1>

              <p className="text-slate-400 mt-3">
                Join ReadEase AI and simplify reading.
              </p>

            </div>


            {/* Error */}

            {error && (

              <div className="mt-6 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm">
                {error}
              </div>

            )}


            {/* Form */}

            <form
              onSubmit={handleRegister}
              className="mt-8 space-y-5"
            >

              {/* Full Name */}

              <div>

                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10"
                />

              </div>


              {/* Email */}

              <div>

                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10"
                />

              </div>


              {/* Password */}

              <div>

                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="Create a password"
                  autoComplete="new-password"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10"
                />

              </div>


              {/* Confirm Password */}

              <div>

                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10"
                />

              </div>


              {/* Create Account Button */}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-400 text-black py-3.5 rounded-xl font-semibold hover:bg-cyan-300 transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >

                {loading
                  ? "Creating Account..."
                  : "Create Account"}

              </button>

            </form>


            {/* Login */}

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


          {/* Back to Home */}

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