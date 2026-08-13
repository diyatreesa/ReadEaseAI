import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  signInWithEmailAndPassword
} from "firebase/auth";

import { auth } from "../services/firebase";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // =========================================================
  // LOGIN
  // =========================================================

  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");


    // -------------------------------------------------------
    // Validation
    // -------------------------------------------------------

    if (!email.trim() || !password) {

      setError(
        "Please enter your email and password."
      );

      return;
    }


    // -------------------------------------------------------
    // Firebase Login
    // -------------------------------------------------------

    try {

      setLoading(true);


      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


      navigate("/dashboard");


    } catch (error) {

      console.error(
        "Login error:",
        error
      );


      if (
        error.code ===
        "auth/invalid-credential"
      ) {

        setError(
          "Invalid email or password."
        );

      } else if (
        error.code ===
        "auth/user-not-found"
      ) {

        setError(
          "No account was found with this email."
        );

      } else if (
        error.code ===
        "auth/wrong-password"
      ) {

        setError(
          "Incorrect password."
        );

      } else if (
        error.code ===
        "auth/invalid-email"
      ) {

        setError(
          "Please enter a valid email address."
        );

      } else {

        setError(
          "Unable to login. Please try again."
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


          {/* Main heading */}

          <h2 className="text-5xl xl:text-6xl font-bold leading-tight mt-10">

            Make complex text

            <span className="block text-cyan-400">
              easier to understand.
            </span>

          </h2>


          {/* Description */}

          <p className="text-slate-400 text-lg leading-relaxed mt-6 max-w-xl">

            ReadEase AI transforms difficult English into
            clear, easy-to-read language while preserving
            the original meaning.

          </p>


          {/* Features */}

          <div className="mt-10 space-y-5">

            <div className="flex items-center gap-4">

              <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
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


            <div className="flex items-center gap-4">

              <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
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


            <div className="flex items-center gap-4">

              <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
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


          {/* Login Card */}

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
                Welcome Back
              </h1>

              <p className="text-slate-400 mt-3">
                Login to continue using ReadEase AI
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
              onSubmit={handleLogin}
              className="mt-8 space-y-5"
            >

              {/* Email */}

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
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10"
                />

              </div>


              {/* Forgot Password */}

              <div className="flex justify-end">

                <button
                  type="button"
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition"
                  onClick={() =>
                    alert(
                      "Password reset will be added next."
                    )
                  }
                >
                  Forgot Password?
                </button>

              </div>


              {/* Login Button */}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-400 text-black py-3.5 rounded-xl font-semibold hover:bg-cyan-300 transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >

                {loading
                  ? "Logging in..."
                  : "Login"}

              </button>

            </form>


            {/* Register */}

            <div className="mt-8 pt-6 border-t border-slate-800 text-center">

              <p className="text-slate-400 text-sm">

                Don't have an account?{" "}

                <Link
                  to="/register"
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition"
                >
                  Create Account
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


export default Login;