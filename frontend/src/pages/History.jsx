import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

import { auth, db } from "../services/firebase";


function History() {

  const navigate = useNavigate();

  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedItem, setSelectedItem] = useState(null);


  // =====================================================
  // LOAD HISTORY
  // =====================================================

  const loadHistory = async () => {

    try {

      setLoading(true);

      const user = auth.currentUser;


      if (!user) {

        setHistory([]);

        return;
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
            user.uid
          ),

          orderBy(
            "createdAt",
            "desc"
          )
        );


      const snapshot =
        await getDocs(
          historyQuery
        );


      const historyData =
        snapshot.docs.map(
          (historyDoc) => ({

            id:
              historyDoc.id,

            ...historyDoc.data()

          })
        );


      setHistory(
        historyData
      );


    } catch (error) {

      console.error(
        "History loading error:",
        error
      );


      if (
        error.code ===
        "failed-precondition"
      ) {

        alert(
          "Firebase needs an index for this history query. Check the browser console for the Firebase index link."
        );

      } else {

        alert(
          "Unable to load your history."
        );

      }

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
  // DELETE HISTORY
  // =====================================================

  const handleDelete = async (id) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this history item?"
      );


    if (!confirmed) {
      return;
    }


    try {

      await deleteDoc(
        doc(
          db,
          "history",
          id
        )
      );


      setHistory(
        (previousHistory) =>
          previousHistory.filter(
            (item) =>
              item.id !== id
          )
      );


      if (
        selectedItem?.id === id
      ) {

        setSelectedItem(null);

      }


    } catch (error) {

      console.error(
        "Delete error:",
        error
      );


      alert(
        "Unable to delete this history item."
      );

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

      const date =
        timestamp.toDate
          ? timestamp.toDate()
          : new Date(timestamp);


      return date.toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }
      );

    } catch {

      return "Unknown date";

    }

  };


  // =====================================================
  // LOADING
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


          {/* Logo */}

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="text-2xl sm:text-3xl font-bold text-cyan-400 hover:text-cyan-300 transition w-fit"
          >
            ReadEase AI
          </button>


          {/* Navigation */}

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
              readability improvements, and vocabulary changes.
            </p>

          </div>


          {/* Total */}

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
            EMPTY STATE
        ================================================= */}

        {history.length === 0 && (

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


                  {/* =========================================
                      TOP SECTION
                  ========================================= */}

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">


                    {/* Level + Date */}

                    <div>

                      <div className="flex flex-wrap items-center gap-3">

                        <span className="bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 px-3 py-1.5 rounded-lg text-sm font-semibold">
                          {item.readingLevel}
                        </span>


                        {item.grammarScore && (

                          <span className="bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-sm">
                            Grammar: {item.grammarScore}
                          </span>

                        )}

                      </div>


                      <p className="text-slate-500 text-sm mt-3">
                        {formatDate(
                          item.createdAt
                        )}
                      </p>

                    </div>


                    {/* Improvement + Actions */}

                    <div className="flex flex-wrap items-center gap-3">


                      <div className="bg-cyan-400/5 border border-cyan-400/10 rounded-xl px-4 py-2">

                        <p className="text-slate-500 text-xs">
                          Reading Improvement
                        </p>


                        <p className="text-cyan-400 text-lg font-bold mt-1">

                          {Number(
                            item.readabilityImprovement
                          ) > 0
                            ? `+${item.readabilityImprovement}`
                            : item.readabilityImprovement}

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


                      <button
                        onClick={() =>
                          handleDelete(
                            item.id
                          )
                        }
                        className="border border-red-400/70 text-red-400 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-400 hover:text-black transition"
                      >
                        Delete
                      </button>

                    </div>

                  </div>


                  {/* =========================================
                      TEXT PREVIEW
                  ========================================= */}

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


                  {/* =========================================
                      STATISTICS
                  ========================================= */}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">


                    {/* Before */}

                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">

                      <p className="text-slate-500 text-xs">
                        Before Ease
                      </p>

                      <p className="text-xl font-bold mt-2">
                        {item.beforeReadability ?? "--"}
                      </p>

                    </div>


                    {/* After */}

                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">

                      <p className="text-slate-500 text-xs">
                        After Ease
                      </p>

                      <p className="text-xl font-bold text-cyan-400 mt-2">
                        {item.afterReadability ?? "--"}
                      </p>

                    </div>


                    {/* Grade */}

                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">

                      <p className="text-slate-500 text-xs">
                        Reading Grade
                      </p>

                      <p className="text-xl font-bold mt-2">

                        {item.beforeGrade ?? "--"}

                        <span className="text-slate-600 mx-1">
                          →
                        </span>

                        {item.afterGrade ?? "--"}

                      </p>

                    </div>


                    {/* Grammar */}

                    <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">

                      <p className="text-slate-500 text-xs">
                        Grammar
                      </p>

                      <p className="text-xl font-bold mt-2">
                        {item.grammarScore ?? "--"}
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

            {/* =============================================
                MODAL HEADER
            ============================================= */}

            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-6 sm:px-8 py-5 flex items-start justify-between gap-5">

              <div>

                <div className="flex flex-wrap items-center gap-3">

                  <span className="bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 px-3 py-1.5 rounded-lg text-sm font-semibold">
                    {selectedItem.readingLevel}
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
              >
                ✕
              </button>

            </div>


            {/* =============================================
                MODAL CONTENT
            ============================================= */}

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


              {/* =========================================
                  STATISTICS
              ========================================= */}

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-8">


                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">

                  <p className="text-slate-500 text-xs">
                    Before Ease
                  </p>

                  <p className="text-xl font-bold mt-2">
                    {selectedItem.beforeReadability ?? "--"}
                  </p>

                </div>


                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">

                  <p className="text-slate-500 text-xs">
                    After Ease
                  </p>

                  <p className="text-xl font-bold text-cyan-400 mt-2">
                    {selectedItem.afterReadability ?? "--"}
                  </p>

                </div>


                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">

                  <p className="text-slate-500 text-xs">
                    Reading Grade
                  </p>

                  <p className="text-xl font-bold mt-2">

                    {selectedItem.beforeGrade ?? "--"}

                    <span className="text-slate-600 mx-1">
                      →
                    </span>

                    {selectedItem.afterGrade ?? "--"}

                  </p>

                </div>


                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">

                  <p className="text-slate-500 text-xs">
                    Improvement
                  </p>

                  <p className="text-xl font-bold text-cyan-400 mt-2">

                    {Number(
                      selectedItem.readabilityImprovement
                    ) > 0
                      ? `+${selectedItem.readabilityImprovement}`
                      : selectedItem.readabilityImprovement ?? "--"}

                  </p>

                </div>


                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">

                  <p className="text-slate-500 text-xs">
                    Grammar
                  </p>

                  <p className="text-xl font-bold mt-2">
                    {selectedItem.grammarScore ?? "--"}
                  </p>

                </div>

              </div>


              {/* =========================================
                  DIFFICULT WORDS
              ========================================= */}

              {selectedItem.difficultWords &&
                selectedItem.difficultWords.length > 0 && (

                  <div className="mt-9">

                    <div className="flex items-center justify-between gap-4">

                      <div>

                        <h3 className="text-xl font-bold">
                          Difficult Words
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                          Words identified as difficult in the original text.
                        </p>

                      </div>

                    </div>


                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">

                      {selectedItem.difficultWords.map(
                        (word, index) => (

                          <div
                            key={index}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 hover:border-cyan-400/30 transition"
                          >

                            <p className="text-yellow-400 font-semibold">
                              {word.word}
                            </p>


                            {word.replacement && (

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


              {/* =========================================
                  CLOSE
              ========================================= */}

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

    </div>

  );

}


export default History;