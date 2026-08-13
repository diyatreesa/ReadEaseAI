import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../services/firebase";

function Simplify() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [text, setText] = useState("");
  const [simplifiedText, setSimplifiedText] = useState("");

  const [level, setLevel] = useState("Beginner");

  const [difficultWords, setDifficultWords] = useState([]);

  const [loading, setLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);

  const [error, setError] = useState("");

  // =====================================================
  // READABILITY DATA
  // =====================================================

  const [beforeReadability, setBeforeReadability] =
    useState("--");

  const [afterReadability, setAfterReadability] =
    useState("--");

  const [beforeGrade, setBeforeGrade] =
    useState("--");

  const [afterGrade, setAfterGrade] =
    useState("--");

  const [readabilityImprovement, setReadabilityImprovement] =
    useState("--");

  const [grammarScore, setGrammarScore] =
    useState("--");

  const [readingTime, setReadingTime] =
    useState("--");

  // =====================================================
  // FILE UPLOAD
  // =====================================================

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);
    setError("");

    // For TXT files, immediately show the content
    if (file.name.toLowerCase().endsWith(".txt")) {
      const reader = new FileReader();

      reader.onload = (e) => {
        setText(e.target.result || "");
      };

      reader.readAsText(file);
    }
  };

  // =====================================================
  // SPEECH
  // =====================================================

  const speakText = (content) => {
    if (!content) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(content);

    utterance.rate = 0.9;
    utterance.pitch = 1;

    window.speechSynthesis.speak(
      utterance
    );
  };

  // =====================================================
  // RESET SCORES
  // =====================================================

  const resetScores = () => {
    setBeforeReadability("--");
    setAfterReadability("--");

    setBeforeGrade("--");
    setAfterGrade("--");

    setReadabilityImprovement("--");

    setGrammarScore("--");

    setReadingTime("--");
  };

  // =====================================================
  // SIMPLIFY TEXT
  // =====================================================

  const handleSimplify = async () => {
    setError("");

    if (!text.trim() && !selectedFile) {
      setError(
        "Please enter some text or upload a document."
      );

      return;
    }

    try {
      setLoading(true);

      // =================================================
      // REQUEST DATA
      // =================================================

      const formData = new FormData();

      formData.append(
        "text",
        text
      );

      formData.append(
        "level",
        level
      );

      // Some backends use reading_level
      formData.append(
        "reading_level",
        level
      );

      if (selectedFile) {
        formData.append(
          "file",
          selectedFile
        );
      }

      // =================================================
      // API REQUEST
      // =================================================

      const response = await fetch(
        "http://127.0.0.1:8000/api/simplify/",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        "API RESPONSE:",
        data
      );

      // =================================================
      // GET RESPONSE OBJECT
      // =================================================

      const result =
        data.result ||
        data;

      // =================================================
      // ORIGINAL TEXT
      // =================================================

      const original =
        result.original_text ||
        text;

      // =================================================
      // SIMPLIFIED TEXT
      // =================================================

      const simplified =
        result.simplified_text ||
        "";

      setText(original);

      setSimplifiedText(
        simplified
      );

      // =================================================
      // DIFFICULT WORDS
      // =================================================

      setDifficultWords(
        Array.isArray(
          result.difficult_words
        )
          ? result.difficult_words
          : []
      );

      // =================================================
      // READABILITY
      // =================================================

      setBeforeReadability(
        result.before_readability ??
          result.before_readability_score ??
          "--"
      );

      setAfterReadability(
        result.after_readability ??
          result.after_readability_score ??
          "--"
      );

      // =================================================
      // GRADE
      // =================================================

      setBeforeGrade(
        result.before_grade ??
          "--"
      );

      setAfterGrade(
        result.after_grade ??
          "--"
      );

      // =================================================
      // IMPROVEMENT
      // =================================================

      setReadabilityImprovement(
        result.readability_improvement ??
          "--"
      );

      // =================================================
      // GRAMMAR
      // =================================================

      setGrammarScore(
        result.grammar_score ??
          "--"
      );

      // =================================================
      // READING TIME
      // =================================================

      setReadingTime(
        result.reading_time ??
          "--"
      );

      // =================================================
      // SAVE TO FIRESTORE
      // =================================================

      const currentUser =
        auth.currentUser;

      if (currentUser) {
        try {
          await addDoc(
            collection(
              db,
              "history"
            ),
            {
              userId:
                currentUser.uid,

              originalText:
                original,

              simplifiedText:
                simplified,

              readingLevel:
                level,

              beforeReadability:
                Number(
                  result.before_readability
                ) || 0,

              afterReadability:
                Number(
                  result.after_readability
                ) || 0,

              readabilityImprovement:
                Number(
                  result.readability_improvement
                ) || 0,

              beforeGrade:
                Number(
                  result.before_grade
                ) || 0,

              afterGrade:
                Number(
                  result.after_grade
                ) || 0,

              grammarScore:
                result.grammar_score ??
                "--",

              readingTime:
                result.reading_time ??
                "--",

              difficultWords:
                Array.isArray(
                  result.difficult_words
                )
                  ? result.difficult_words
                  : [],

              createdAt:
                serverTimestamp(),
            }
          );

          console.log(
            "Simplification saved to Firestore."
          );
        } catch (firestoreError) {
          console.error(
            "Firestore save error:",
            firestoreError
          );
        }
      }

    } catch (error) {
      console.error(
        "Simplification error:",
        error
      );

      setError(
        "Unable to simplify the text. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CLEAR
  // =====================================================

  const handleClear = () => {
    setText("");
    setSimplifiedText("");

    setSelectedFile(null);

    setDifficultWords([]);

    setError("");

    resetScores();

    const fileInput =
      document.getElementById(
        "document-upload"
      );

    if (fileInput) {
      fileInput.value = "";
    }
  };

  // =====================================================
  // HIGHLIGHT ORIGINAL TEXT
  // =====================================================

  const highlightOriginalText = () => {
    if (!text) {
      return null;
    }

    if (
      !Array.isArray(
        difficultWords
      ) ||
      difficultWords.length === 0
    ) {
      return text;
    }

    const mappings =
      difficultWords
        .map((item) => ({
          word:
            item.word ||
            "",
          replacement:
            item.replacement ||
            "",
        }))
        .filter(
          (item) =>
            item.word.trim()
        );

    if (
      mappings.length === 0
    ) {
      return text;
    }

    const escapedWords =
      mappings.map(
        (item) =>
          item.word.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          )
      );

    const regex =
      new RegExp(
        `(${escapedWords.join("|")})`,
        "gi"
      );

    const parts =
      text.split(regex);

    return parts.map(
      (part, index) => {
        const mapping =
          mappings.find(
            (item) =>
              item.word.toLowerCase() ===
              part.toLowerCase()
          );

        if (mapping) {
          return (
            <span
              key={index}
              className="bg-yellow-500/30 text-yellow-200 px-1 rounded"
              title={
                mapping.replacement
                  ? `Simpler word: ${mapping.replacement}`
                  : undefined
              }
            >
              {part}
            </span>
          );
        }

        return (
          <span key={index}>
            {part}
          </span>
        );
      }
    );
  };

  // =====================================================
  // HIGHLIGHT SIMPLIFIED TEXT
  // =====================================================

  const highlightSimplifiedText = () => {
    if (!simplifiedText) {
      return null;
    }

    if (
      !Array.isArray(
        difficultWords
      ) ||
      difficultWords.length === 0
    ) {
      return simplifiedText;
    }

    const mappings =
      difficultWords
        .map((item) => ({
          word:
            item.word ||
            "",
          replacement:
            item.replacement ||
            "",
        }))
        .filter(
          (item) =>
            item.replacement.trim()
        );

    if (
      mappings.length === 0
    ) {
      return simplifiedText;
    }

    const escapedWords =
      mappings.map(
        (item) =>
          item.replacement.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          )
      );

    const regex =
      new RegExp(
        `(${escapedWords.join("|")})`,
        "gi"
      );

    const parts =
      simplifiedText.split(
        regex
      );

    return parts.map(
      (part, index) => {
        const mapping =
          mappings.find(
            (item) =>
              item.replacement.toLowerCase() ===
              part.toLowerCase()
          );

        if (mapping) {
          return (
            <span
              key={index}
              className="bg-cyan-400/20 text-cyan-200 px-1 rounded"
              title={`Simpler replacement for "${mapping.word}"`}
            >
              {part}
            </span>
          );
        }

        return (
          <span key={index}>
            {part}
          </span>
        );
      }
    );
  };

  // =====================================================
  // FORMAT NUMBER
  // =====================================================

  const formatNumber = (value) => {
    if (
      value === "--" ||
      value === null ||
      value === undefined
    ) {
      return "--";
    }

    const number =
      Number(value);

    if (Number.isNaN(number)) {
      return value;
    }

    return number.toFixed(2);
  };

  // =====================================================
  // IMPROVEMENT DISPLAY
  // =====================================================

  const improvementDisplay =
    readabilityImprovement === "--"
      ? "--"
      : Number(
          readabilityImprovement
        ) > 0
        ? `+${formatNumber(
            readabilityImprovement
          )}`
        : formatNumber(
            readabilityImprovement
          );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white px-5 md:px-8 py-10">

      <div className="max-w-[1400px] mx-auto">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">

          <div>

            <p className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">
              ReadEase Workspace
            </p>

            <h1 className="text-4xl md:text-5xl font-bold mt-2">
              Simplify Your Text
            </h1>

            <p className="text-slate-400 mt-3">
              Transform complex English into clear,
              easy-to-understand language.
            </p>

          </div>


          {/* READING LEVEL */}

          <div className="w-full lg:w-48">

            <label
              htmlFor="reading-level"
              className="block text-slate-500 text-xs uppercase tracking-wider mb-2"
            >
              Reading Level
            </label>

            <div className="relative">

              <select
                id="reading-level"
                value={level}
                onChange={(e) =>
                  setLevel(
                    e.target.value
                  )
                }
                className="appearance-none w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 pr-10 rounded-xl outline-none focus:border-cyan-400 cursor-pointer"
              >

                <option value="Beginner">
                  Beginner
                </option>

                <option value="Intermediate">
                  Intermediate
                </option>

                <option value="Advanced">
                  Advanced
                </option>

              </select>

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400">
                ⌄
              </span>

            </div>

          </div>

        </div>


        {/* =================================================
            UPLOAD
        ================================================= */}

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 mb-8">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="flex items-center gap-4">

              <div className="w-11 h-11 rounded-xl bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-xl">
                📄
              </div>

              <div>

                <p className="font-semibold">
                  Upload a document
                </p>

                <p className="text-slate-500 text-sm mt-1">
                  PDF, DOCX or TXT
                </p>

                {selectedFile && (
                  <p className="text-cyan-400 text-xs mt-1">
                    {selectedFile.name}
                  </p>
                )}

              </div>

            </div>


            <label
              htmlFor="document-upload"
              className="cursor-pointer bg-slate-800 border border-slate-700 px-5 py-3 rounded-xl font-semibold hover:border-cyan-400 hover:text-cyan-400 transition text-center"
            >
              📎 Choose File
            </label>

            <input
              id="document-upload"
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={
                handleFileChange
              }
              className="hidden"
            />

          </div>

        </div>


        {/* =================================================
            TEXT EDITORS
        ================================================= */}

        <div className="grid lg:grid-cols-2 gap-6">

          {/* ORIGINAL */}

          <div>

            <div className="flex items-center justify-between mb-3">

              <div className="flex items-center gap-3">

                <span className="w-1.5 h-6 bg-yellow-400 rounded-full"></span>

                <h2 className="font-bold text-lg">
                  Original Text
                </h2>

              </div>

              <span className="text-xs text-yellow-300 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1 rounded-full">
                Difficult words
              </span>

            </div>


            <div className="relative bg-slate-900 border border-slate-700 rounded-2xl min-h-[360px]">

              <div className="absolute top-4 right-4 z-10">

                <button
                  type="button"
                  onClick={() =>
                    speakText(text)
                  }
                  disabled={!text}
                  title="Listen to original text"
                  className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-white flex items-center justify-center hover:border-cyan-400 hover:text-cyan-400 transition disabled:opacity-40"
                >
                  🔊
                </button>

              </div>


              <div
                className="absolute inset-0 p-5 pr-16 overflow-y-auto text-[15px] leading-7 whitespace-pre-wrap"
              >
                {text ? (
                  highlightOriginalText()
                ) : (
                  <span className="text-slate-600">
                    Enter your text here...
                  </span>
                )}
              </div>


              <textarea
                value={text}
                onChange={(e) =>
                  setText(
                    e.target.value
                  )
                }
                className="absolute inset-0 w-full h-full resize-none p-5 pr-16 bg-transparent text-transparent caret-white outline-none leading-7 text-[15px]"
                spellCheck="false"
                aria-label="Original text"
              />

            </div>

            <p className="text-slate-600 text-xs mt-2">
              Difficult words are highlighted automatically.
            </p>

          </div>


          {/* SIMPLIFIED */}

          <div>

            <div className="flex items-center justify-between mb-3">

              <div className="flex items-center gap-3">

                <span className="w-1.5 h-6 bg-cyan-400 rounded-full"></span>

                <h2 className="font-bold text-lg">
                  Simplified Text
                </h2>

              </div>

              <span className="text-xs text-cyan-300 bg-cyan-400/10 border border-cyan-400/20 px-3 py-1 rounded-full">
                Simpler words
              </span>

            </div>


            <div className="relative bg-slate-900 border border-slate-700 rounded-2xl min-h-[360px]">

              <div className="absolute top-4 right-4 z-10">

                <button
                  type="button"
                  onClick={() =>
                    speakText(
                      simplifiedText
                    )
                  }
                  disabled={
                    !simplifiedText
                  }
                  title="Listen to simplified text"
                  className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-white flex items-center justify-center hover:border-cyan-400 hover:text-cyan-400 transition disabled:opacity-40"
                >
                  🔊
                </button>

              </div>


              <div className="p-5 pr-16 text-[15px] leading-7 whitespace-pre-wrap min-h-[360px] overflow-y-auto">

                {simplifiedText ? (
                  highlightSimplifiedText()
                ) : (
                  <span className="text-slate-600">
                    Your simplified text will appear here...
                  </span>
                )}

              </div>

            </div>

            <p className="text-slate-600 text-xs mt-2">
              Simpler replacements are highlighted after simplification.
            </p>

          </div>

        </div>


        {/* =================================================
            ACTION BUTTONS
        ================================================= */}

        <div className="flex flex-col sm:flex-row gap-3 mt-6">

          <button
            onClick={handleSimplify}
            disabled={loading}
            className="flex-1 bg-cyan-400 text-black py-3.5 rounded-xl font-semibold hover:bg-cyan-300 transition disabled:opacity-60"
          >
            {loading
              ? "✨ Simplifying..."
              : "✨ Simplify Text"}
          </button>


          <button
            onClick={handleClear}
            className="sm:w-32 border border-slate-700 text-white py-3.5 rounded-xl hover:bg-slate-900 transition"
          >
            Clear
          </button>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mt-5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}


        {/* =================================================
            ANALYSIS / SCORES
        ================================================= */}

        <div className="grid lg:grid-cols-2 gap-5 mt-8">

          {/* READABILITY */}

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                  Analysis
                </p>

                <h2 className="text-xl font-bold mt-1">
                  Readability Score
                </h2>

              </div>

              <span className="text-2xl">
                📊
              </span>

            </div>


            <div className="grid grid-cols-2 gap-3 mt-5">

              <div className="bg-slate-950/70 rounded-xl p-4">

                <p className="text-slate-500 text-xs">
                  Before
                </p>

                <p className="text-3xl font-bold mt-2">
                  {formatNumber(
                    beforeReadability
                  )}
                </p>

                <p className="text-slate-600 text-xs mt-1">
                  Reading Ease
                </p>

              </div>


              <div className="bg-cyan-400/[0.05] border border-cyan-400/10 rounded-xl p-4">

                <p className="text-cyan-400 text-xs">
                  After
                </p>

                <p className="text-3xl font-bold text-cyan-400 mt-2">
                  {formatNumber(
                    afterReadability
                  )}
                </p>

                <p className="text-slate-600 text-xs mt-1">
                  Reading Ease
                </p>

              </div>

            </div>

          </div>


          {/* IMPROVEMENT */}

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                  Results
                </p>

                <h2 className="text-xl font-bold mt-1">
                  Improvement
                </h2>

              </div>

              <span className="text-2xl">
                📈
              </span>

            </div>


            <div className="grid grid-cols-2 gap-3 mt-5">

              <div className="bg-slate-950/70 rounded-xl p-4">

                <p className="text-slate-500 text-xs">
                  Reading Improvement
                </p>

                <p className="text-3xl font-bold text-cyan-400 mt-2">
                  {improvementDisplay}
                </p>

              </div>


              <div className="bg-slate-950/70 rounded-xl p-4">

                <p className="text-slate-500 text-xs">
                  Grade Level
                </p>

                <p className="text-2xl font-bold mt-2">

                  {beforeGrade !== "--" &&
                  afterGrade !== "--"
                    ? `${formatNumber(
                        beforeGrade
                      )} → ${formatNumber(
                        afterGrade
                      )}`
                    : "--"}

                </p>

              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            EXTRA METRICS
        ================================================= */}

        <div className="grid sm:grid-cols-2 gap-5 mt-5">

          {/* READING TIME */}

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">

            <div>

              <p className="text-slate-500 text-xs uppercase tracking-wider">
                Reading Time
              </p>

              <p className="text-2xl font-bold mt-2">
                {readingTime}
              </p>

            </div>

            <span className="text-2xl">
              ⏱️
            </span>

          </div>


          {/* GRAMMAR */}

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">

            <div>

              <p className="text-slate-500 text-xs uppercase tracking-wider">
                Grammar Score
              </p>

              <p className="text-2xl font-bold mt-2">

                {grammarScore === "--"
                  ? "--"
                  : typeof grammarScore ===
                      "string" &&
                    grammarScore.includes("%")
                    ? grammarScore
                    : `${grammarScore}%`}

              </p>

            </div>

            <span className="text-2xl">
              ✓
            </span>

          </div>

        </div>


        {/* =================================================
            DIFFICULT WORDS
        ================================================= */}

        {difficultWords.length > 0 && (
          <div className="mt-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-6">

            <div className="flex items-center justify-between mb-5">

              <div>

                <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wider">
                  Vocabulary
                </p>

                <h2 className="text-xl font-bold mt-1">
                  Difficult Words
                </h2>

              </div>

              <span className="text-slate-500 text-sm">
                {difficultWords.length} words
              </span>

            </div>


            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">

              {difficultWords.map(
                (item, index) => (
                  <div
                    key={index}
                    className="bg-slate-950/70 border border-slate-800 rounded-xl p-4"
                  >

                    <p className="text-yellow-300 font-semibold">
                      {item.word}
                    </p>

                    {item.replacement && (
                      <p className="text-slate-500 text-sm mt-2">
                        →{" "}
                        <span className="text-cyan-400">
                          {item.replacement}
                        </span>
                      </p>
                    )}

                  </div>
                )
              )}

            </div>

          </div>
        )}


        {/* =================================================
            BOTTOM NAVIGATION
        ================================================= */}

        <div className="flex justify-between items-center mt-8 pb-10">

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="text-slate-500 hover:text-cyan-400 transition text-sm"
          >
            ← Back to Dashboard
          </button>


          <button
            onClick={() =>
              navigate("/history")
            }
            className="text-slate-500 hover:text-cyan-400 transition text-sm"
          >
            View History →
          </button>

        </div>

      </div>

    </div>
  );
}

export default Simplify;