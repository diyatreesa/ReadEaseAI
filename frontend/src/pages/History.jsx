import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { auth, db } from "../services/firebase";


// =====================================================
// HISTORY PAGE
// =====================================================

function History() {

  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState("");

  // Delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);


  // =====================================================
  // LOAD HISTORY
  // =====================================================

  const loadHistory = async () => {

    try {

      setLoading(true);
      setError("");

      const user = auth.currentUser;


      // -------------------------------------------------
      // USER NOT LOGGED IN
      // -------------------------------------------------

      if (!user) {

        setHistory([]);
        setLoading(false);

        return;
      }


      // -------------------------------------------------
      // FIRESTORE HISTORY COLLECTION
      // -------------------------------------------------

      const historyRef = collection(
        db,
        "history"
      );


      // -------------------------------------------------
      // GET ONLY CURRENT USER'S HISTORY
      // -------------------------------------------------

      const historyQuery = query(
        historyRef,
        where(
          "userId",
          "==",
          user.uid
        )
      );


      const snapshot = await getDocs(
        historyQuery
      );


      // -------------------------------------------------
      // CONVERT FIRESTORE DOCUMENTS
      // -------------------------------------------------

      const historyData = snapshot.docs.map(
        (historyDoc) => {

          const data = historyDoc.data();

          return {
            id: historyDoc.id,
            ...data,
          };

        }
      );


      // -------------------------------------------------
      // SORT NEWEST FIRST
      // -------------------------------------------------

      historyData.sort(
        (a, b) => {

          const getTime = (timestamp) => {

            if (!timestamp) {
              return 0;
            }

            try {

              if (
                typeof timestamp.toMillis ===
                "function"
              ) {
                return timestamp.toMillis();
              }

              if (
                typeof timestamp.toDate ===
                "function"
              ) {
                return timestamp.toDate().getTime();
              }

              const date =
                new Date(timestamp);

              const time =
                date.getTime();

              return Number.isNaN(time)
                ? 0
                : time;

            } catch {

              return 0;

            }

          };


          return (
            getTime(b.createdAt) -
            getTime(a.createdAt)
          );

        }
      );


      // -------------------------------------------------
      // SAVE HISTORY
      // -------------------------------------------------

      setHistory(historyData);

      console.log(
        "History loaded successfully:",
        historyData
      );


    } catch (error) {

      console.error(
        "History loading error:",
        error
      );

      setHistory([]);

      setError(
        "Unable to load history right now."
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // LOAD WHEN PAGE OPENS
  // =====================================================

  useEffect(() => {

    loadHistory();

  }, []);


  // =====================================================
  // OPEN DELETE CONFIRMATION
  // =====================================================

  const handleDelete = (id) => {

    setDeleteTarget(id);

  };


  // =====================================================
  // CONFIRM DELETE
  // =====================================================

  const confirmDelete = async () => {

    if (!deleteTarget) {
      return;
    }


    try {

      setDeleting(true);
      setError("");


      // -------------------------------------------------
      // DELETE FROM FIRESTORE
      // -------------------------------------------------

      await deleteDoc(
        doc(
          db,
          "history",
          deleteTarget
        )
      );


      // -------------------------------------------------
      // REMOVE FROM SCREEN
      // -------------------------------------------------

      setHistory(
        (previousHistory) =>
          previousHistory.filter(
            (item) =>
              item.id !== deleteTarget
          )
      );


      // -------------------------------------------------
      // CLOSE FULL TEXT MODAL IF OPEN
      // -------------------------------------------------

      if (
        selectedItem?.id === deleteTarget
      ) {

        setSelectedItem(null);

      }


      // -------------------------------------------------
      // CLOSE DELETE MODAL
      // -------------------------------------------------

      setDeleteTarget(null);


    } catch (error) {

      console.error(
        "Delete error:",
        error
      );

      setError(
        "Unable to delete this history item. Please try again."
      );

    } finally {

      setDeleting(false);

    }

  };


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (timestamp) => {

    if (!timestamp) {
      return "Just now";
    }


    try {

      let date;


      if (
        typeof timestamp.toDate ===
        "function"
      ) {

        date =
          timestamp.toDate();

      } else if (
        typeof timestamp.toMillis ===
        "function"
      ) {

        date =
          new Date(
            timestamp.toMillis()
          );

      } else {

        date =
          new Date(timestamp);

      }


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

        return "Unknown date";

      }


      return date.toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );

    } catch {

      return "Unknown date";

    }

  };


  // =====================================================
  // FORMAT NUMBER
  // =====================================================

  const formatNumber = (value) => {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {

      return "--";

    }


    const number =
      Number(value);


    return Number.isFinite(number)
      ? number.toFixed(2)
      : String(value);

  };


  // =====================================================
  // FORMAT IMPROVEMENT
  // =====================================================

  const formatImprovement = (value) => {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {

      return "--";

    }


    const number =
      Number(value);


    if (!Number.isFinite(number)) {

      return String(value);

    }


    return number > 0
      ? `+${number.toFixed(2)}`
      : number.toFixed(2);

  };


  // =====================================================
  // FORMAT GRAMMAR
  // =====================================================

  const formatGrammar = (value) => {

    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {

      return "--";

    }


    return (
      typeof value === "string" &&
      value.includes("%")
    )
      ? value
      : `${value}%`;

  };


  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {

    return (

      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

        <div className="text-center">

          <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto" />

          <p className="text-slate-400 mt-5">
            Loading your history...
          </p>

        </div>

      </div>

    );

  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">


      {/* =================================================
          BACKGROUND GLOW
      ================================================= */}

      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute top-[500px] right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />


      {/* =================================================
          MAIN CONTAINER
      ================================================= */}

      <div className="relative z-10 w-full px-6 sm:px-10 lg:px-16 xl:px-20 py-10">


        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">


          {/* LOGO + BRAND NAME */}
<div className="flex items-center gap-3">

  <button
    type="button"
    onClick={() => navigate("/dashboard")}
    className="flex items-center gap-3 group"
  >

    <img
      src="/logo.png"
      alt="ReadEase AI Logo"
      className="
        w-15 h-15
        sm:w-15 sm:h-15
        object-contain
        shrink-0
      "
    />

    <span
      className="
        text-2xl
        sm:text-2xl
        font-bold
        text-cyan-400
        group-hover:text-cyan-300
        transition
        whitespace-nowrap
      "
    >
      ReadEase AI
    </span>

  </button>

</div>

          {/* NAVIGATION */}

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                navigate("/dashboard")
              }
              className="text-sm text-slate-400 hover:text-cyan-400 transition px-4 py-2"
            >
              Dashboard
            </button>


            <button
              onClick={() =>
                navigate("/simplify")
              }
              className="bg-cyan-400 text-black px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-cyan-300 transition"
            >
              Simplify Text
            </button>

          </div>

        </div>


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mt-14 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">


          <div>

            <p className="text-cyan-400 font-semibold text-sm uppercase tracking-wider">
              Your Activity
            </p>


            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mt-3">
              Simplification History
            </h1>


            <p className="text-slate-400 text-lg mt-4 max-w-2xl">
              Review your previous simplifications,
              readability improvements, and vocabulary
              changes.
            </p>

          </div>


          {/* TOTAL */}

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-7 py-5 min-w-[180px]">

            <p className="text-slate-500 text-sm">
              Total Simplifications
            </p>


            <p className="text-4xl font-bold text-cyan-400 mt-2">
              {history.length}
            </p>

          </div>

        </div>


        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (

          <div className="mt-8 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-5 py-4">

            {error}

          </div>

        )}


        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {!error && history.length === 0 && (

          <div className="mt-10 bg-slate-900/80 border border-slate-800 rounded-3xl p-12 sm:p-16 text-center">


            <div className="w-20 h-20 mx-auto rounded-3xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-4xl">
              📚
            </div>


            <h2 className="text-2xl sm:text-3xl font-bold mt-7">
              No history yet
            </h2>


            <p className="text-slate-400 mt-3 max-w-md mx-auto">
              Your simplified texts will appear here after
              you simplify your first piece of text.
            </p>


            <button
              onClick={() =>
                navigate("/simplify")
              }
              className="mt-7 bg-cyan-400 text-black px-7 py-3.5 rounded-xl font-semibold hover:bg-cyan-300 transition"
            >
              Simplify Your First Text →
            </button>

          </div>

        )}


        {/* =================================================
            HISTORY LIST
        ================================================= */}

        {history.length > 0 && (

          <div className="space-y-6 mt-10">

            {history.map(
              (item) => (

                <div
                  key={item.id}
                  className="group bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 hover:border-slate-700 transition duration-300"
                >


                  {/* =================================================
                      TOP SECTION
                  ================================================= */}

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">


                    {/* LEVEL + DATE */}

                    <div>

                      <div className="flex flex-wrap items-center gap-3">

                        <span className="bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 px-3 py-1.5 rounded-lg text-sm font-semibold">
                          {item.readingLevel || "Beginner"}
                        </span>


                        {item.grammarScore !== undefined &&
                          item.grammarScore !== null &&
                          item.grammarScore !== "" && (

                            <span className="bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-sm">
                              Grammar: {formatGrammar(item.grammarScore)}
                            </span>

                          )}

                      </div>


                      <p className="text-slate-500 text-sm mt-3">
                        {formatDate(item.createdAt)}
                      </p>

                    </div>


                    {/* IMPROVEMENT + ACTIONS */}

                    <div className="flex flex-wrap items-center gap-3">


                      <div className="bg-cyan-400/5 border border-cyan-400/10 rounded-xl px-4 py-2">

                        <p className="text-slate-500 text-xs">
                          Reading Improvement
                        </p>


                        <p className="text-cyan-400 text-lg font-bold mt-1">
                          {formatImprovement(
                            item.readabilityImprovement
                          )}
                        </p>

                      </div>


                      <button
                        onClick={() =>
                          setSelectedItem(item)
                        }
                        className="border border-cyan-400 text-cyan-400 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-cyan-400 hover:text-black transition"
                      >
                        View Full Text
                      </button>


                      {/* DELETE BUTTON */}

                      <button
                        onClick={() =>
                          handleDelete(item.id)
                        }
                        disabled={deleting}
                        className="border border-red-400/70 text-red-400 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-400 hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Delete
                      </button>

                    </div>

                  </div>


                  {/* =================================================
                      TEXT PREVIEW
                  ================================================= */}

                  <div className="grid lg:grid-cols-2 gap-5 mt-7">


                    {/* ORIGINAL */}

                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6">

                      <div className="flex items-center justify-between">

                        <p className="text-slate-400 text-sm font-semibold">
                          Original Text
                        </p>

                        <span className="text-xs text-slate-600">
                          BEFORE
                        </span>

                      </div>


                      <p className="text-slate-300 mt-4 leading-relaxed whitespace-pre-wrap line-clamp-5">
                        {item.originalText}
                      </p>

                    </div>


                    {/* SIMPLIFIED */}

                    <div className="bg-cyan-400/[0.03] border border-cyan-400/10 rounded-2xl p-6">

                      <div className="flex items-center justify-between">

                        <p className="text-cyan-400 text-sm font-semibold">
                          Simplified Text
                        </p>

                        <span className="text-xs text-cyan-400/40">
                          AFTER
                        </span>

                      </div>


                      <p className="text-slate-300 mt-4 leading-relaxed whitespace-pre-wrap line-clamp-5">
                        {item.simplifiedText}
                      </p>

                    </div>

                  </div>


                  {/* =================================================
                      STATISTICS
                  ================================================= */}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">


                    {/* BEFORE */}

                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">

                      <p className="text-slate-500 text-xs">
                        Before Ease
                      </p>


                      <p className="text-xl font-bold mt-2">
                        {formatNumber(
                          item.beforeReadability
                        )}
                      </p>

                    </div>


                    {/* AFTER */}

                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">

                      <p className="text-slate-500 text-xs">
                        After Ease
                      </p>


                      <p className="text-xl font-bold text-cyan-400 mt-2">
                        {formatNumber(
                          item.afterReadability
                        )}
                      </p>

                    </div>


                    {/* GRADE */}

                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">

                      <p className="text-slate-500 text-xs">
                        Reading Grade
                      </p>


                      <p className="text-xl font-bold mt-2">

                        {formatNumber(
                          item.beforeGrade
                        )}

                        <span className="text-slate-600 mx-1">
                          →
                        </span>

                        {formatNumber(
                          item.afterGrade
                        )}

                      </p>

                    </div>


                    {/* GRAMMAR */}

                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">

                      <p className="text-slate-500 text-xs">
                        Grammar
                      </p>


                      <p className="text-xl font-bold mt-2">
                        {formatGrammar(
                          item.grammarScore
                        )}
                      </p>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>


      {/* =====================================================
          FULL TEXT MODAL
      ===================================================== */}

      {selectedItem && (

        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() =>
            setSelectedItem(null)
          }
        >

          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >


            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-6 sm:px-8 py-5 flex items-start justify-between gap-5">

              <div>

                <div className="flex flex-wrap items-center gap-3">

                  <span className="bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 px-3 py-1.5 rounded-lg text-sm font-semibold">
                    {selectedItem.readingLevel || "Beginner"}
                  </span>

                  <span className="text-slate-500 text-sm">
                    {formatDate(
                      selectedItem.createdAt
                    )}
                  </span>

                </div>


                <h2 className="text-2xl font-bold mt-3">
                  Simplification Result
                </h2>

              </div>


              <button
                onClick={() =>
                  setSelectedItem(null)
                }
                className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition text-xl flex items-center justify-center"
                aria-label="Close"
              >
                ✕
              </button>

            </div>


            {/* MODAL CONTENT */}

            <div className="p-6 sm:p-8">


              {/* TEXT */}

              <div className="grid lg:grid-cols-2 gap-6">


                {/* ORIGINAL */}

                <div>

                  <div className="flex items-center gap-3">

                    <div className="w-2 h-6 bg-slate-500 rounded-full" />

                    <h3 className="text-xl font-bold">
                      Original Text
                    </h3>

                  </div>


                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mt-4 max-h-[45vh] overflow-y-auto">

                    <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {selectedItem.originalText}
                    </p>

                  </div>

                </div>


                {/* SIMPLIFIED */}

                <div>

                  <div className="flex items-center gap-3">

                    <div className="w-2 h-6 bg-cyan-400 rounded-full" />

                    <h3 className="text-xl font-bold text-cyan-400">
                      Simplified Text
                    </h3>

                  </div>


                  <div className="bg-cyan-400/[0.03] border border-cyan-400/10 rounded-2xl p-6 mt-4 max-h-[45vh] overflow-y-auto">

                    <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {selectedItem.simplifiedText}
                    </p>

                  </div>

                </div>

              </div>


              {/* STATISTICS */}

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-8">


                {/* BEFORE */}

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">

                  <p className="text-slate-500 text-xs">
                    Before Ease
                  </p>

                  <p className="text-xl font-bold mt-2">
                    {formatNumber(
                      selectedItem.beforeReadability
                    )}
                  </p>

                </div>


                {/* AFTER */}

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">

                  <p className="text-slate-500 text-xs">
                    After Ease
                  </p>

                  <p className="text-xl font-bold text-cyan-400 mt-2">
                    {formatNumber(
                      selectedItem.afterReadability
                    )}
                  </p>

                </div>


                {/* READING GRADE */}

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">

                  <p className="text-slate-500 text-xs">
                    Reading Grade
                  </p>

                  <p className="text-xl font-bold mt-2">

                    {formatNumber(
                      selectedItem.beforeGrade
                    )}

                    <span className="text-slate-600 mx-1">
                      →
                    </span>

                    {formatNumber(
                      selectedItem.afterGrade
                    )}

                  </p>

                </div>


                {/* IMPROVEMENT */}

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">

                  <p className="text-slate-500 text-xs">
                    Improvement
                  </p>

                  <p className="text-xl font-bold text-cyan-400 mt-2">
                    {formatImprovement(
                      selectedItem.readabilityImprovement
                    )}
                  </p>

                </div>


                {/* GRAMMAR */}

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">

                  <p className="text-slate-500 text-xs">
                    Grammar
                  </p>

                  <p className="text-xl font-bold mt-2">
                    {formatGrammar(
                      selectedItem.grammarScore
                    )}
                  </p>

                </div>

              </div>


              {/* =================================================
                  DIFFICULT WORDS
              ================================================= */}

              {selectedItem.difficultWords &&
                Array.isArray(
                  selectedItem.difficultWords
                ) &&
                selectedItem.difficultWords.length > 0 && (

                  <div className="mt-9">

                    <h3 className="text-xl font-bold">
                      Difficult Words
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      Words identified as difficult in the original text.
                    </p>


                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">

                      {selectedItem.difficultWords.map(
                        (word, index) => (

                          <div
                            key={index}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 hover:border-cyan-400/30 transition"
                          >

                            <p className="text-yellow-400 font-semibold">
                              {typeof word === "string"
                                ? word
                                : word.word}
                            </p>


                            {typeof word !== "string" &&
                              word.replacement && (

                                <p className="text-slate-400 text-sm mt-2">

                                  Simpler:

                                  <span className="text-cyan-400 ml-1">
                                    {word.replacement}
                                  </span>

                                </p>

                              )}

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}


              {/* CLOSE */}

              <div className="flex justify-end mt-9 pt-6 border-t border-slate-800">

                <button
                  onClick={() =>
                    setSelectedItem(null)
                  }
                  className="bg-cyan-400 text-black px-7 py-3 rounded-xl font-semibold hover:bg-cyan-300 transition"
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          PROFESSIONAL DELETE CONFIRMATION MODAL
      ===================================================== */}

      {deleteTarget && (

        <div
          className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => {

            if (!deleting) {
              setDeleteTarget(null);
            }

          }}
        >

          <div
            className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >


            {/* MODAL CONTENT */}

            <div className="p-6">


              {/* ICON + TITLE */}

              <div className="flex items-start gap-4">


                {/* DELETE ICON */}

                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-8 0h10"
                    />

                  </svg>

                </div>


                {/* TITLE */}

                <div className="flex-1">

                  <h2 className="text-xl font-bold text-white">
                    Delete History Item?
                  </h2>

                  <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                    Are you sure you want to permanently
                    delete this simplification from your
                    history?
                  </p>

                </div>

              </div>


              {/* WARNING */}

              <div className="mt-5 bg-red-500/5 border border-red-500/10 rounded-xl px-4 py-3">

                <p className="text-red-300/80 text-xs leading-relaxed">
                  This action cannot be undone. The original
                  text, simplified text, and analysis results
                  will be permanently removed.
                </p>

              </div>


              {/* BUTTONS */}

              <div className="flex justify-end gap-3 mt-6">


                {/* CANCEL */}

                <button
                  type="button"
                  disabled={deleting}
                  onClick={() =>
                    setDeleteTarget(null)
                  }
                  className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-semibold text-sm hover:bg-slate-800 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>


                {/* DELETE */}

                <button
                  type="button"
                  disabled={deleting}
                  onClick={confirmDelete}
                  className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >

                  {deleting ? (

                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />

                      Deleting...
                    </>

                  ) : (

                    <>
                      Delete
                    </>

                  )}

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}


export default History;