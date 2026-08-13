import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";

import { auth, db } from "../services/firebase";


function Dashboard() {

  const navigate = useNavigate();

  const user = auth.currentUser;

  const [userName, setUserName] = useState("User");
  // =====================================================
  // DASHBOARD DATA
  // =====================================================

  const [totalTexts, setTotalTexts] = useState(0);

  const [averageImprovement, setAverageImprovement] =
    useState("--");

  const [loadingStats, setLoadingStats] =
    useState(true);


  // =====================================================
  // LOAD USER HISTORY
  // =====================================================

  useEffect(() => {

    const loadStatistics = async () => {

      try {

        const currentUser = auth.currentUser;


        if (!currentUser) {

          setLoadingStats(false);

          return;
        }

        // =====================================================
// LOAD USER NAME
// =====================================================

try {
  const userDocRef = doc(db, "users", currentUser.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    const userData = userDocSnap.data();

    setUserName(
      userData.name ||
      currentUser.displayName ||
      currentUser.email?.split("@")[0] ||
      "User"
    );
  } else {
    setUserName(
      currentUser.displayName ||
      currentUser.email?.split("@")[0] ||
      "User"
    );
  }
} catch (nameError) {
  console.error("Unable to load user name:", nameError);

  setUserName(
    currentUser.displayName ||
    currentUser.email?.split("@")[0] ||
    "User"
  );
}


        const historyRef =
          collection(
            db,
            "history"
          );


        const historyQuery =
          query(
            historyRef,
            where(
              "userId",
              "==",
              currentUser.uid
            )
          );


        const snapshot =
          await getDocs(
            historyQuery
          );


        const historyData =
          snapshot.docs.map(
            (document) =>
              document.data()
          );


        // =============================================
        // TOTAL TEXTS
        // =============================================

        setTotalTexts(
          historyData.length
        );


        // =============================================
        // AVERAGE READING IMPROVEMENT
        // =============================================

        if (
          historyData.length === 0
        ) {

          setAverageImprovement("--");

        } else {

          const improvements =
            historyData
              .map(
                (item) =>
                  Number(
                    item.readabilityImprovement
                  )
              )
              .filter(
                (value) =>
                  !Number.isNaN(value)
              );


          if (
            improvements.length === 0
          ) {

            setAverageImprovement("--");

          } else {

            const total =
              improvements.reduce(
                (sum, value) =>
                  sum + value,
                0
              );


            const average =
              total /
              improvements.length;


            setAverageImprovement(
              average.toFixed(2)
            );

          }

        }

      } catch (error) {

        console.error(
          "Dashboard statistics error:",
          error
        );

      } finally {

        setLoadingStats(false);

      }

    };


    loadStatistics();

  }, []);


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {

    try {

      await signOut(auth);

      navigate("/login");

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );

      alert(
        "Unable to logout. Please try again."
      );

    }

  };


  // =====================================================
  // USER NAME
  // =====================================================


  // =====================================================
  // DASHBOARD
  // =====================================================

  return (

    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">


      {/* =================================================
          BACKGROUND GLOW
      ================================================= */}

      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute top-96 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />


      {/* =================================================
          MAIN CONTAINER
      ================================================= */}

      <div className="relative z-10 w-full px-6 sm:px-10 lg:px-16 xl:px-20 py-10">


        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">


          {/* Logo */}

<button
  onClick={() => navigate("/dashboard")}
  className="flex items-center gap-3 hover:opacity-90 transition"
>
  <img
    src="/logo.png"
    alt="ReadEase AI Logo"
    className="w-15 h-15 sm:w-16 sm:h-16 object-contain"
  />

  <span className="text-2xl sm:text-3xl font-bold text-cyan-400">
    ReadEase AI
  </span>
</button>


          {/* Navigation */}

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                navigate("/history")
              }
              className="hidden sm:block text-sm text-slate-400 hover:text-cyan-400 transition px-4 py-2"
            >
              History
            </button>


            <button
              onClick={() =>
                navigate("/simplify")
              }
              className="hidden sm:block text-sm text-slate-400 hover:text-cyan-400 transition px-4 py-2"
            >
              Simplify
            </button>


            <button
              onClick={handleLogout}
              className="border border-red-400/60 text-red-400 px-4 py-2 rounded-xl text-sm hover:bg-red-400 hover:text-black transition"
            >
              Logout
            </button>

          </div>

        </div>


        {/* =================================================
    WELCOME SECTION
================================================= */}

<div className="mt-14">

  <p className="text-cyan-400 font-semibold text-sm uppercase tracking-wider">
    Your Workspace
  </p>

  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mt-3 leading-tight">

    Welcome,{" "}

    <span className="text-cyan-400">
      {userName}
    </span>{" "}

    

  </h1>

  <p className="text-slate-400 text-lg mt-4 max-w-2xl">
    Simplify complex English, improve readability,
    and make information easier to understand.
  </p>

</div>


        {/* =================================================
            MAIN ACTIONS
        ================================================= */}

        <div className="grid lg:grid-cols-2 gap-6 mt-12">


          {/* =================================================
              SIMPLIFY CARD
          ================================================= */}

          <div className="group relative overflow-hidden bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-10 hover:border-cyan-400/40 transition duration-300">

            {/* Glow */}

            <div className="absolute -top-20 -right-20 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl group-hover:bg-cyan-400/15 transition" />


            <div className="relative z-10">

              <div className="w-14 h-14 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-2xl">
                ✨
              </div>


              <h2 className="text-2xl sm:text-3xl font-bold mt-6">
                Simplify New Text
              </h2>


              <p className="text-slate-400 mt-3 max-w-lg leading-relaxed">
                Transform difficult English into clear,
                easy-to-understand language while keeping
                the original meaning.
              </p>


              <button
                onClick={() =>
                  navigate("/simplify")
                }
                className="mt-7 bg-cyan-400 text-black px-7 py-3.5 rounded-xl font-semibold hover:bg-cyan-300 transition"
              >
                Simplify Text →
              </button>

            </div>

          </div>


          {/* =================================================
              HISTORY CARD
          ================================================= */}

          <div className="group relative overflow-hidden bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-10 hover:border-cyan-400/40 transition duration-300">

            <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/15 transition" />


            <div className="relative z-10">

              <div className="w-14 h-14 rounded-2xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center text-2xl">
                📚
              </div>


              <h2 className="text-2xl sm:text-3xl font-bold mt-6">
                Your History
              </h2>


              <p className="text-slate-400 mt-3 max-w-lg leading-relaxed">
                View your previous simplifications,
                compare readability results, and revisit
                your saved texts.
              </p>


              <button
                onClick={() =>
                  navigate("/history")
                }
                className="mt-7 border border-cyan-400 text-cyan-400 px-7 py-3.5 rounded-xl font-semibold hover:bg-cyan-400 hover:text-black transition"
              >
                View History →
              </button>

            </div>

          </div>

        </div>


        {/* =================================================
            STATISTICS
        ================================================= */}

        <div className="mt-12">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-cyan-400 font-semibold text-sm uppercase tracking-wider">
                Your Progress
              </p>

              <h2 className="text-2xl font-bold mt-2">
                Your Statistics
              </h2>

            </div>

          </div>


          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">


            {/* =================================================
                TOTAL TEXTS
            ================================================= */}

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-7 hover:border-slate-700 transition">

              <div className="flex items-center justify-between">

                <p className="text-slate-400">
                  Texts Simplified
                </p>

                <span className="text-xl">
                  📝
                </span>

              </div>


              <p className="text-4xl font-bold mt-5 text-white">

                {loadingStats
                  ? "..."
                  : totalTexts}

              </p>


              <p className="text-sm text-slate-500 mt-2">
                Total simplifications
              </p>

            </div>


            {/* =================================================
                READING IMPROVEMENT
            ================================================= */}

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-7 hover:border-slate-700 transition">

              <div className="flex items-center justify-between">

                <p className="text-slate-400">
                  Reading Improvement
                </p>

                <span className="text-xl">
                  📈
                </span>

              </div>


              <p className="text-4xl font-bold mt-5 text-cyan-400">

                {loadingStats
                  ? "..."
                  : averageImprovement === "--"
                    ? "--"
                    : Number(
                        averageImprovement
                      ) > 0
                      ? `+${averageImprovement}`
                      : averageImprovement}

              </p>


              <p className="text-sm text-slate-500 mt-2">
                Average improvement
              </p>

            </div>


            {/* =================================================
                ACCOUNT
            ================================================= */}

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-7 hover:border-slate-700 transition">

              <div className="flex items-center justify-between">

                <p className="text-slate-400">
                  Account
                </p>

                <span className="text-xl">
                  ✓
                </span>

              </div>


              <p className="text-3xl font-bold mt-6 text-green-400">
                Active
              </p>


              <p className="text-sm text-slate-500 mt-2">
                Firebase authenticated
              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            ACCOUNT INFORMATION
        ================================================= */}

        <div className="mt-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>

              <p className="text-sm text-slate-500">
                Logged in as
              </p>

              <p className="text-white font-medium mt-1">
                {user?.email}
              </p>

            </div>


            <div className="text-left sm:text-right">

              <p className="text-sm text-slate-500">
                Account status
              </p>

              <p className="text-green-400 font-medium mt-1">
                ● Active
              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="mt-16 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">

          <p className="text-sm text-slate-600">
            ReadEase AI
          </p>

          <p className="text-sm text-slate-600">
            Making complex English easier to understand.
          </p>

        </div>

      </div>

    </div>
  );
}


export default Dashboard;