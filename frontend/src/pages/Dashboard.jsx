import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "../services/firebase";


function Dashboard() {

  const navigate = useNavigate();

  const user = auth.currentUser;


  // =========================================================
  // USER DATA
  // =========================================================

  const [userName, setUserName] = useState("User");


  // =========================================================
  // DASHBOARD STATISTICS
  // =========================================================

  const [totalTexts, setTotalTexts] = useState(0);

  const [averageImprovement, setAverageImprovement] =
    useState("--");

  const [loadingStats, setLoadingStats] =
    useState(true);


  // =========================================================
  // LOAD USER DATA + HISTORY STATISTICS
  // =========================================================

  useEffect(() => {

    const loadStatistics = async () => {

      try {

        const currentUser = auth.currentUser;


        // -----------------------------------------------------
        // CHECK LOGIN
        // -----------------------------------------------------

        if (!currentUser) {

          setLoadingStats(false);

          return;
        }


        // =====================================================
        // LOAD USER NAME
        // =====================================================

        try {

          const userDocRef = doc(
            db,
            "users",
            currentUser.uid
          );


          const userDocSnap = await getDoc(
            userDocRef
          );


          if (userDocSnap.exists()) {

            const userData =
              userDocSnap.data();


            setUserName(
              currentUser.displayName ||
              userData.name ||
              currentUser.email?.split("@")[0] ||
              "User"
            );

          } else {

            setUserName(
              currentUser.displayName ||
              "User"
            );

          }


        } catch (nameError) {

          console.error(
            "Unable to load user name:",
            nameError
          );


          setUserName(
            currentUser.displayName ||
            "User"
          );

        }


        // =====================================================
        // LOAD HISTORY
        // =====================================================

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


        // =====================================================
        // TOTAL TEXTS
        // =====================================================

        setTotalTexts(
          historyData.length
        );


        // =====================================================
        // AVERAGE READING IMPROVEMENT
        // =====================================================

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


  // =========================================================
  // LOGOUT
  // =========================================================

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


  // =========================================================
  // DASHBOARD UI
  // =========================================================

  return (

    <div
      className="
        min-h-screen
        bg-[#020617]
        text-white
        relative
        overflow-hidden
      "
    >


      {/* =====================================================
          BACKGROUND EFFECTS
      ===================================================== */}

      <div
        className="
          fixed
          top-0
          left-0
          w-[500px]
          h-[500px]
          bg-cyan-400/5
          rounded-full
          blur-[120px]
          pointer-events-none
        "
      />


      <div
        className="
          fixed
          top-[30%]
          right-0
          w-[500px]
          h-[500px]
          bg-blue-500/5
          rounded-full
          blur-[120px]
          pointer-events-none
        "
      />


      <div
        className="
          fixed
          bottom-0
          left-1/2
          -translate-x-1/2
          w-[700px]
          h-[300px]
          bg-cyan-500/[0.03]
          rounded-full
          blur-[100px]
          pointer-events-none
        "
      />


      {/* =====================================================
          MAIN CONTAINER
      ===================================================== */}

      <div
        className="
          relative
          z-10
          max-w-[1500px]
          mx-auto
          px-5
          sm:px-8
          lg:px-12
          xl:px-16
          py-7
        "
      >


        {/* ===================================================
            TOP NAVIGATION
        =================================================== */}

        <header
          className="
            flex
            items-center
            justify-between
            gap-5
          "
        >


          {/* LOGO */}

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="
              flex
              items-center
              gap-3
              hover:opacity-90
              transition
            "
          >

            <img
              src="/logo.png"
              alt="ReadEase AI Logo"
              className="
                w-11
                h-11
                sm:w-12
                sm:h-12
                object-contain
              "
            />


            <span
              className="
                text-xl
                sm:text-2xl
                font-bold
                tracking-tight
                text-cyan-400
              "
            >
              ReadEase AI
            </span>

          </button>


          {/* NAVIGATION */}

          <nav
            className="
              flex
              items-center
              gap-1
              sm:gap-3
            "
          >

            <button
              onClick={() =>
                navigate("/history")
              }
              className="
                px-3
                sm:px-4
                py-2
                text-sm
                text-slate-400
                hover:text-white
                transition
              "
            >
              History
            </button>


            <button
              onClick={() =>
                navigate("/simplify")
              }
              className="
                px-3
                sm:px-4
                py-2
                text-sm
                text-slate-400
                hover:text-white
                transition
              "
            >
              Simplify
            </button>


            <button
              onClick={handleLogout}
              className="
                px-4
                py-2
                rounded-xl
                border
                border-red-400/40
                text-red-400
                text-sm
                hover:bg-red-400
                hover:text-black
                transition
              "
            >
              Logout
            </button>

          </nav>

        </header>



        {/* ===================================================
            HERO SECTION
        =================================================== */}

        <section
          className="
            relative
            mt-14
            sm:mt-16
            min-h-[300px]
            flex
            items-center
          "
        >


          {/* HERO TEXT */}

          <div
            className="
              relative
              z-10
              w-full
              lg:w-[62%]
            "
          >

            <p
              className="
                text-cyan-400
                font-semibold
                text-xs
                sm:text-sm
                uppercase
                tracking-[0.18em]
              "
            >
              Your Workspace
            </p>


            <h1
              className="
                text-4xl
                sm:text-5xl
                lg:text-5xl
                xl:text-5xl
                font-bold
                tracking-tight
                leading-[1.05]
                mt-3
              "
            >

              Welcome,{" "}

              <span
                className="
                  text-transparent
                  bg-clip-text
                  bg-gradient-to-r
                  from-cyan-400
                  to-blue-400
                "
              >
                {userName}
              </span>

            </h1>


            <p
              className="
                text-slate-400
                text-base
                sm:text-lg
                mt-5
                max-w-2xl
                leading-relaxed
              "
            >
              Simplify complex English, improve
              readability, and make information
              easier to understand.
            </p>



            {/* FEATURE PILLS */}

            <div
              className="
                flex
                flex-wrap
                gap-2
                sm:gap-3
                mt-6
              "
            >

              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-slate-800
                  bg-slate-900/60
                  px-3
                  py-2
                  text-xs
                  text-slate-300
                "
              >

                <span
                  className="
                    text-cyan-400
                    text-sm
                  "
                >
                  ✦
                </span>

                AI-powered simplification

              </div>


              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-slate-800
                  bg-slate-900/60
                  px-3
                  py-2
                  text-xs
                  text-slate-300
                "
              >

                <span
                  className="
                    text-blue-400
                    text-sm
                  "
                >
                  ◈
                </span>

                Readability analysis

              </div>


              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-slate-800
                  bg-slate-900/60
                  px-3
                  py-2
                  text-xs
                  text-slate-300
                "
              >

                <span
                  className="
                    text-yellow-400
                    text-sm
                  "
                >
                  ◇
                </span>

                Vocabulary insights

              </div>

            </div>

          </div>



          {/* =================================================
              HERO DECORATION
          ================================================= */}

          <div
            className="
              hidden
              lg:flex
              absolute
              right-4
              xl:right-10
              top-1/2
              -translate-y-1/2
              w-[330px]
              h-[240px]
              items-center
              justify-center
            "
          >

            {/* Glow */}

            <div
              className="
                absolute
                w-52
                h-52
                rounded-full
                bg-cyan-400/10
                blur-3xl
              "
            />


            {/* Decorative document */}

            <div
              className="
                relative
                w-52
                h-36
                rounded-2xl
                border
                border-cyan-400/40
                bg-gradient-to-br
                from-blue-950
                via-slate-900
                to-slate-950
                shadow-[0_0_45px_rgba(34,211,238,0.15)]
                rotate-[-6deg]
              "
            >

              {/* Document lines */}

              <div
                className="
                  absolute
                  top-7
                  left-7
                  w-24
                  h-2
                  rounded-full
                  bg-cyan-400/70
                "
              />

              <div
                className="
                  absolute
                  top-14
                  left-7
                  w-32
                  h-2
                  rounded-full
                  bg-blue-400/60
                "
              />

              <div
                className="
                  absolute
                  top-21
                  left-7
                  w-20
                  h-2
                  rounded-full
                  bg-purple-400/60
                "
              />


              {/* AI badge */}

              <div
                className="
                  absolute
                  right-5
                  top-7
                  w-12
                  h-12
                  rounded-xl
                  border
                  border-cyan-300/30
                  bg-cyan-400/10
                  flex
                  items-center
                  justify-center
                  text-cyan-300
                  font-bold
                  text-sm
                "
              >
                AI
              </div>


              {/* Check */}

              <div
                className="
                  absolute
                  right-5
                  bottom-5
                  w-9
                  h-9
                  rounded-full
                  bg-cyan-400
                  text-slate-950
                  flex
                  items-center
                  justify-center
                  font-bold
                "
              >
                ✓
              </div>

            </div>


            {/* Orbit */}

            <div
              className="
                absolute
                w-72
                h-28
                border
                border-cyan-400/20
                rounded-[50%]
                rotate-[12deg]
              "
            />


            {/* Stars */}

            <span
              className="
                absolute
                top-5
                right-20
                text-cyan-300
                text-xl
              "
            >
              ✦
            </span>

            <span
              className="
                absolute
                bottom-8
                right-8
                text-blue-300
                text-sm
              "
            >
              ✦
            </span>

            <span
              className="
                absolute
                top-20
                left-5
                text-cyan-400
                text-xs
              "
            >
              ✦
            </span>

          </div>

        </section>



        {/* ===================================================
            MAIN ACTION CARDS
        =================================================== */}

        <section
          className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-5
            mt-4
          "
        >


          {/* =================================================
              SIMPLIFY CARD
          ================================================= */}

          <div
            className="
              group
              relative
              overflow-hidden
              rounded-3xl
              border
              border-cyan-400/25
              bg-gradient-to-br
              from-slate-900
              via-slate-900
              to-cyan-950/20
              p-5
              sm:p-6
              transition-all
              duration-300
              hover:border-cyan-400/60
              hover:-translate-y-1
              hover:shadow-[0_20px_60px_rgba(34,211,238,0.08)]
            "
          >

            {/* Glow */}

            <div
              className="
                absolute
                -top-24
                -right-24
                w-64
                h-64
                rounded-full
                bg-cyan-400/10
                blur-3xl
                group-hover:bg-cyan-400/15
                transition
              "
            />


            <div
              className="
                relative
                z-10
              "
            >

              {/* TOP CONTENT */}

              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  gap-5
                  items-center
                  sm:items-start
                "
              >


                {/* IMAGE */}

                <div
                  className="
                    shrink-0
                    w-32
                    h-32
                    rounded-2xl
                    bg-slate-950/70
                    border
                    border-cyan-400/20
                    flex
                    items-center
                    justify-center
                    overflow-hidden
                    group-hover:border-cyan-400/40
                    transition
                  "
                >

                  <img
                    src="/sim.png"
                    alt="AI text simplification"
                    className="
                      w-full
                      h-full
                      object-contain
                      p-2
                      transition-transform
                      duration-500
                      group-hover:scale-105
                    "
                  />

                </div>



                {/* TEXT */}

                <div
                  className="
                    flex-1
                    text-center
                    sm:text-left
                  "
                >

                  {/* BADGE */}

                  <span
                    className="
                      inline-flex
                      items-center
                      rounded-full
                      border
                      border-cyan-400/25
                      bg-cyan-400/10
                      px-3
                      py-1
                      text-[11px]
                      font-medium
                      text-cyan-300
                    "
                  >
                    AI Simplification
                  </span>


                  <h2
                    className="
                      text-2xl
                      font-bold
                      text-white
                      mt-3
                    "
                  >
                    Simplify New Text
                  </h2>


                  <p
                    className="
                      text-slate-400
                      text-sm
                      leading-relaxed
                      mt-2
                    "
                  >
                    Transform complex English into
                    clear, easy-to-understand language
                    while preserving the original meaning.
                  </p>

                </div>

              </div>



              {/* DIVIDER */}

              <div
                className="
                  border-t
                  border-slate-800
                  mt-6
                  pt-5
                "
              >


                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                  "
                >

                  <div>

                    <p
                      className="
                        text-xs
                        font-medium
                        text-cyan-400
                      "
                    >
                      Start a new analysis
                    </p>

                    <p
                      className="
                        text-xs
                        text-slate-500
                        mt-1
                      "
                    >
                      Improve readability instantly
                    </p>

                  </div>


                  <button
                    onClick={() =>
                      navigate("/simplify")
                    }
                    className="
                      shrink-0
                      bg-cyan-400
                      text-slate-950
                      px-5
                      py-2.5
                      rounded-xl
                      text-sm
                      font-semibold
                      hover:bg-cyan-300
                      hover:shadow-[0_0_25px_rgba(34,211,238,0.25)]
                      transition-all
                    "
                  >
                    Start →
                  </button>

                </div>

              </div>

            </div>

          </div>



          {/* =================================================
              HISTORY CARD
          ================================================= */}

          <div
            className="
              group
              relative
              overflow-hidden
              rounded-3xl
              border
              border-blue-400/25
              bg-gradient-to-br
              from-slate-900
              via-slate-900
              to-blue-950/20
              p-5
              sm:p-6
              transition-all
              duration-300
              hover:border-blue-400/60
              hover:-translate-y-1
              hover:shadow-[0_20px_60px_rgba(59,130,246,0.08)]
            "
          >

            {/* Glow */}

            <div
              className="
                absolute
                -top-24
                -right-24
                w-64
                h-64
                rounded-full
                bg-blue-500/10
                blur-3xl
                group-hover:bg-blue-500/15
                transition
              "
            />


            <div
              className="
                relative
                z-10
              "
            >

              {/* TOP CONTENT */}

              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  gap-5
                  items-center
                  sm:items-start
                "
              >


                {/* IMAGE */}

                <div
                  className="
                    shrink-0
                    w-32
                    h-32
                    rounded-2xl
                    bg-slate-950/70
                    border
                    border-blue-400/20
                    flex
                    items-center
                    justify-center
                    overflow-hidden
                    group-hover:border-blue-400/40
                    transition
                  "
                >

                  <img
                    src="/his.png"
                    alt="ReadEase history"
                    className="
                      w-full
                      h-full
                      object-contain
                      p-2
                      transition-transform
                      duration-500
                      group-hover:scale-105
                    "
                  />

                </div>



                {/* TEXT */}

                <div
                  className="
                    flex-1
                    text-center
                    sm:text-left
                  "
                >

                  {/* BADGE */}

                  <span
                    className="
                      inline-flex
                      items-center
                      rounded-full
                      border
                      border-blue-400/25
                      bg-blue-400/10
                      px-3
                      py-1
                      text-[11px]
                      font-medium
                      text-blue-300
                    "
                  >
                    Saved Analyses
                  </span>


                  <h2
                    className="
                      text-2xl
                      font-bold
                      text-white
                      mt-3
                    "
                  >
                    Your History
                  </h2>


                  <p
                    className="
                      text-slate-400
                      text-sm
                      leading-relaxed
                      mt-2
                    "
                  >
                    Review your previous simplifications,
                    compare readability improvements,
                    and revisit your saved texts.
                  </p>

                </div>

              </div>



              {/* DIVIDER */}

              <div
                className="
                  border-t
                  border-slate-800
                  mt-6
                  pt-5
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                  "
                >

                  <div>

                    <p
                      className="
                        text-xs
                        font-medium
                        text-blue-400
                      "
                    >
                      Your reading journey
                    </p>

                    <p
                      className="
                        text-xs
                        text-slate-500
                        mt-1
                      "
                    >
                      Review your previous results
                    </p>

                  </div>


                  <button
                    onClick={() =>
                      navigate("/history")
                    }
                    className="
                      shrink-0
                      border
                      border-blue-400/60
                      text-blue-300
                      px-5
                      py-2.5
                      rounded-xl
                      text-sm
                      font-semibold
                      hover:bg-blue-400
                      hover:text-slate-950
                      hover:border-blue-400
                      transition-all
                    "
                  >
                    View →
                  </button>

                </div>

              </div>

            </div>

          </div>

        </section>



        {/* ===================================================
            YOUR PROGRESS
        =================================================== */}

        <section
          className="
            mt-16
          "
        >

          {/* SECTION HEADER */}

          <div>

            <p
              className="
                text-cyan-400
                font-semibold
                text-xs
                uppercase
                tracking-[0.18em]
              "
            >
              Your Progress
            </p>


            <h2
              className="
                text-2xl
                sm:text-3xl
                font-bold
                mt-2
              "
            >
              Your Statistics
            </h2>


            <p
              className="
                text-slate-500
                text-sm
                mt-2
              "
            >
              A quick look at your ReadEase activity.
            </p>

          </div>



          {/* STAT CARDS */}

          <div
            className="
              grid
              sm:grid-cols-2
              lg:grid-cols-3
              gap-4
              mt-6
            "
          >


            {/* TOTAL TEXTS */}

            <div
              className="
                group
                rounded-2xl
                border
                border-slate-800
                bg-slate-900/60
                p-6
                hover:border-cyan-400/30
                transition
              "
            >

              <div
                className="
                  flex
                  items-start
                  justify-between
                "
              >

                <div>

                  <p
                    className="
                      text-slate-400
                      text-sm
                    "
                  >
                    Texts Simplified
                  </p>


                  <p
                    className="
                      text-4xl
                      font-bold
                      mt-4
                    "
                  >
                    {loadingStats
                      ? "..."
                      : totalTexts}
                  </p>

                </div>


                <div
                  className="
                    w-11
                    h-11
                    rounded-xl
                    bg-cyan-400/10
                    border
                    border-cyan-400/20
                    flex
                    items-center
                    justify-center
                    text-cyan-400
                    font-semibold
                  "
                >
                  Aa
                </div>

              </div>


              <p
                className="
                  text-xs
                  text-slate-500
                  mt-4
                "
              >
                Total simplifications
              </p>

            </div>



            {/* READING IMPROVEMENT */}

            <div
              className="
                group
                rounded-2xl
                border
                border-slate-800
                bg-slate-900/60
                p-6
                hover:border-cyan-400/30
                transition
              "
            >

              <div
                className="
                  flex
                  items-start
                  justify-between
                "
              >

                <div>

                  <p
                    className="
                      text-slate-400
                      text-sm
                    "
                  >
                    Reading Improvement
                  </p>


                  <p
                    className="
                      text-4xl
                      font-bold
                      mt-4
                      text-cyan-400
                    "
                  >

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

                </div>


                <div
                  className="
                    w-11
                    h-11
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
                  ↗
                </div>

              </div>


              <p
                className="
                  text-xs
                  text-slate-500
                  mt-4
                "
              >
                Average improvement
              </p>

            </div>



            {/* ACCOUNT */}

            <div
              className="
                group
                rounded-2xl
                border
                border-slate-800
                bg-slate-900/60
                p-6
                hover:border-green-400/30
                transition
              "
            >

              <div
                className="
                  flex
                  items-start
                  justify-between
                "
              >

                <div>

                  <p
                    className="
                      text-slate-400
                      text-sm
                    "
                  >
                    Account
                  </p>


                  <p
                    className="
                      text-3xl
                      font-bold
                      mt-5
                      text-green-400
                    "
                  >
                    Active
                  </p>

                </div>


                <div
                  className="
                    w-11
                    h-11
                    rounded-xl
                    bg-green-400/10
                    border
                    border-green-400/20
                    flex
                    items-center
                    justify-center
                    text-green-400
                    text-lg
                  "
                >
                  ✓
                </div>

              </div>


              <p
                className="
                  text-xs
                  text-slate-500
                  mt-4
                "
              >
                Firebase authenticated
              </p>

            </div>

          </div>

        </section>



        {/* ===================================================
            ACCOUNT INFORMATION
        =================================================== */}

        <section
          className="
            mt-6
            rounded-2xl
            border
            border-slate-800
            bg-slate-900/40
            p-5
            sm:p-6
          "
        >

          <div
            className="
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-5
            "
          >

            <div>

              <p
                className="
                  text-xs
                  text-slate-500
                  uppercase
                  tracking-wider
                "
              >
                Logged in as
              </p>


              <p
                className="
                  text-white
                  font-medium
                  mt-1
                  break-all
                "
              >
                {user?.email}
              </p>

            </div>


            <div>

              <p
                className="
                  text-xs
                  text-slate-500
                  uppercase
                  tracking-wider
                "
              >
                Account status
              </p>


              <p
                className="
                  text-green-400
                  font-medium
                  mt-1
                "
              >
                <span className="mr-1">
                  ●
                </span>
                Active
              </p>

            </div>

          </div>

        </section>



        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer
          className="
            mt-14
            pt-6
            border-t
            border-slate-800
            flex
            flex-col
            sm:flex-row
            items-center
            justify-between
            gap-3
          "
        >

          <p
            className="
              text-xs
              text-slate-600
            "
          >
            ReadEase AI
          </p>


          <p
            className="
              text-xs
              text-slate-600
              text-center
            "
          >
            Making complex English easier to understand.
          </p>

        </footer>


      </div>

    </div>

  );

}


export default Dashboard;