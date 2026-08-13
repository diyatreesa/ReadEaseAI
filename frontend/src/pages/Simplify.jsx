import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../App.css";

import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../services/firebase";


function UIIcon({ name, size = 18, className = "" }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
  };

  const icons = {
    file: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8M8 17h6" />
      </>
    ),
    clip: (
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    ),
    volume: (
      <>
        <path d="M11 5 6 9H2v6h4l5 4z" />
        <path d="M19 9a5 5 0 0 1 0 6M16.5 6.5a9 9 0 0 1 0 11" />
      </>
    ),
    sparkle: (
      <>
        <path d="m12 3-1.2 4.1L7 8.4l3.8 1.3L12 14l1.2-4.3L17 8.4l-3.8-1.3z" />
        <path d="m19 14-.6 2.4L16 17l2.4.6L19 20l.6-2.4L22 17l-2.4-.6z" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5M4 19h16" />
        <path d="m7 15 3-4 3 2 5-6" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    trash: (
      <>
        <path d="M3 6h18M8 6V4h8v2" />
        <path d="m19 6-1 15H6L5 6M10 11v6M14 11v6" />
      </>
    ),
    back: (
      <>
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </>
    ),
    next: (
      <>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </>
    ),
  };

  return <svg {...props}>{icons[name] || null}</svg>;
}

function Simplify() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [text, setText] = useState("");
  const [simplifiedText, setSimplifiedText] = useState("");

  const [level, setLevel] = useState("Beginner");

  const [difficultWords, setDifficultWords] = useState([]);
  const [changes, setChanges] = useState([]);

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

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // =====================================================
  // FILE UPLOAD
  // =====================================================

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    const allowedExtensions = [".pdf", ".docx", ".txt"];

    if (!allowedExtensions.includes(extension)) {
      setSelectedFile(null);
      setError("Please upload a PDF, DOCX, or TXT file.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setError("");

    if (extension === ".txt") {
      const reader = new FileReader();

      reader.onload = (e) => {
        setText(String(e.target?.result || ""));
      };

      reader.onerror = () => {
        setError("Unable to read the TXT file.");
      };

      reader.readAsText(file);
    }
  };

  // =====================================================
  // SPEECH
  // =====================================================

  const speakText = (content) => {
    if (!content || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(content);
    utterance.rate = 0.9;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
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

  const toNumberOrFallback = (value, fallback = 0) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  };

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

      let data = {};

      try {
        data = await response.json();
      } catch {
        throw new Error("The server returned an invalid response.");
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            `Request failed with status ${response.status}`
        );
      }

      console.log("API RESPONSE:", data);

      // =================================================
      // GET RESPONSE OBJECT
      // =================================================

      const result =
        data?.result && typeof data.result === "object"
          ? data.result
          : data;

      // =================================================
      // ORIGINAL TEXT
      // =================================================

      const original = String(
        result?.original_text ?? text ?? ""
      );

      // =================================================
      // SIMPLIFIED TEXT
      // =================================================

      const simplified = String(
        result?.simplified_text ?? ""
      );

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
      setChanges(
  Array.isArray(result.changes)
    ? result.changes
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
                toNumberOrFallback(
                  result.before_readability ??
                    result.before_readability_score
                ),

              afterReadability:
                toNumberOrFallback(
                  result.after_readability ??
                    result.after_readability_score
                ),

              readabilityImprovement:
                toNumberOrFallback(
                  result.readability_improvement
                ),

              beforeGrade:
                toNumberOrFallback(
                  result.before_grade
                ),

              afterGrade:
                toNumberOrFallback(
                  result.after_grade
                ),

              grammarScore:
                result.grammar_score ??
                "--",

              readingTime:
                result.reading_time ??
                "--",

              difficultWords:
                Array.isArray(result.difficult_words)
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
  setChanges([]);

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
    !Array.isArray(difficultWords) ||
    difficultWords.length === 0
  ) {
    return text;
  }

  const words = difficultWords
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      if (item && typeof item === "object") {
        return String(item.word || "").trim();
      }

      return "";
    })
    .filter(Boolean);

  if (words.length === 0) {
    return text;
  }

  // Longest words first
  words.sort(
    (a, b) => b.length - a.length
  );

  const escapedWords = words.map((word) =>
    word.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    )
  );

  const regex = new RegExp(
    `\\b(${escapedWords.join("|")})\\b`,
    "gi"
  );

  const parts = text.split(regex);

  return parts.map(
    (part, index) => {

      const matchedWord = words.find(
        (word) =>
          word.toLowerCase() ===
          part.toLowerCase()
      );

      if (matchedWord) {
        return (
          <span
            key={index}
            className="bg-yellow-500/30 text-yellow-200 px-1 rounded"
            title="Difficult word"
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
    !Array.isArray(changes) ||
    changes.length === 0
  ) {
    return simplifiedText;
  }

  const mappings = changes
    .map((item) => ({
      word: String(item?.word || "").trim(),
      replacement: String(
        item?.replacement || ""
      ).trim(),
    }))
    .filter(
      (item) =>
        item.word &&
        item.replacement
    );

  if (mappings.length === 0) {
    return simplifiedText;
  }

  // Longest replacements first
  mappings.sort(
    (a, b) =>
      b.replacement.length -
      a.replacement.length
  );

  const escapedReplacements =
    mappings.map((item) =>
      item.replacement.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      )
    );

  const regex = new RegExp(
    `\\b(${escapedReplacements.join("|")})\\b`,
    "gi"
  );

  const parts =
    simplifiedText.split(regex);

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
    <div className="min-h-screen bg-[#020817] text-white px-4 sm:px-6 lg:px-8 py-5">
      <div className="max-w-[1500px] mx-auto">

        {/* TOP NAV */}
        <header className="flex items-center justify-between border-b border-slate-800/70 pb-4 mb-6">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3"
          >
            
            <img
              src="/logo.png"
              alt="ReadEase AI Logo"
              className="
                w-14
                h-14
                sm:w-14
                sm:h-14
                object-contain
              "
            />
            <span className="text-lg font-bold tracking-tight">
              ReadEase <span className="text-cyan-400">AI</span>
            </span>
          </button>

          <nav className="flex items-center gap-2 sm:gap-5 text-sm">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="hidden sm:block text-slate-400 hover:text-white transition"
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={() => navigate("/history")}
              className="text-slate-400 hover:text-cyan-400 transition"
            >
              History
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="border border-red-500/60 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </nav>
        </header>

        {/* PAGE HEADER */}
        <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-6">
          <div>
            <p className="text-cyan-400 text-[11px] font-bold uppercase tracking-[0.18em]">
              ReadEase Workspace
            </p>

            <h1 className="text-3xl sm:text-4xl lg:text-[42px] leading-tight font-bold tracking-tight mt-2">
              Simplify Your Text
              <span className="text-cyan-400"> ✨</span>
            </h1>

            <p className="text-slate-400 text-sm sm:text-base mt-2">
              Transform complex English into clear, easy-to-understand language.
            </p>
          </div>

          <div className="w-full lg:w-44">
            <label
              htmlFor="reading-level"
              className="block text-slate-500 text-[10px] uppercase tracking-[0.16em] mb-2"
            >
              Reading Level
            </label>

            <div className="relative">
              <select
                id="reading-level"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="appearance-none w-full bg-slate-900/90 border border-slate-700 hover:border-cyan-400/50 text-white px-4 py-2.5 pr-10 rounded-xl outline-none focus:border-cyan-400 transition cursor-pointer text-sm"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 text-xs">
                ▼
              </span>
            </div>
          </div>
        </section>

        {/* UPLOAD */}
        <section className="bg-slate-900/70 border border-slate-800 hover:border-cyan-400/20 rounded-2xl p-4 sm:p-5 mb-6 transition">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-cyan-400/10 border border-cyan-400/25 flex items-center justify-center text-cyan-300">
                <UIIcon name="file" size={20} />
              </div>

              <div>
                <p className="font-semibold text-sm sm:text-base">
                  Upload a document
                </p>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  PDF, DOCX or TXT
                </p>

                {selectedFile && (
                  <p className="text-cyan-400 text-[11px] mt-1 truncate max-w-[280px]">
                    {selectedFile.name}
                  </p>
                )}
              </div>
            </div>

            <label
              htmlFor="document-upload"
              className="cursor-pointer bg-slate-800/90 border border-slate-700 px-5 py-2.5 rounded-xl font-semibold text-sm hover:border-cyan-400 hover:text-cyan-400 transition text-center"
            >
              <span className="inline-flex items-center gap-2">
                <UIIcon name="clip" size={16} />
                Choose File
              </span>
            </label>

            <input
              id="document-upload"
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </section>

        {/* TEXT PANELS */}
        <section className="grid lg:grid-cols-2 gap-5">

          {/* ORIGINAL */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2.5">
                <span className="w-1 h-5 bg-yellow-400 rounded-full" />
                <h2 className="font-bold text-base sm:text-lg">
                  Original Text
                </h2>
              </div>

              <span className="text-[10px] sm:text-xs text-yellow-300 bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-1 rounded-full">
                Difficult words
              </span>
            </div>

            <div className="relative bg-slate-900/75 border border-slate-700 rounded-2xl h-[300px] sm:h-[330px] overflow-hidden focus-within:border-yellow-400/40 transition">

              <button
                type="button"
                onClick={() => speakText(text)}
                disabled={!text}
                title="Listen to original text"
                className="absolute top-3 right-3 z-20 w-9 h-9 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-300 flex items-center justify-center hover:border-cyan-400 hover:text-cyan-400 transition disabled:opacity-30"
              >
                <UIIcon name="volume" size={17} />
              </button>

              <div className="absolute inset-0 p-4 pr-14 overflow-y-auto text-sm leading-6 whitespace-pre-wrap pointer-events-none">
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
                onChange={(e) => setText(e.target.value)}
                className="absolute inset-0 w-full h-full resize-none p-4 pr-14 bg-transparent text-transparent caret-white outline-none leading-6 text-sm selection:bg-cyan-400/20"
                spellCheck="false"
                aria-label="Original text"
              />
            </div>

            <p className="text-slate-600 text-[11px] mt-1.5">
              Difficult words are highlighted automatically.
            </p>
          </div>

          {/* SIMPLIFIED */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2.5">
                <span className="w-1 h-5 bg-cyan-400 rounded-full" />
                <h2 className="font-bold text-base sm:text-lg">
                  Simplified Text
                </h2>
              </div>

              <span className="text-[10px] sm:text-xs text-cyan-300 bg-cyan-400/10 border border-cyan-400/20 px-2.5 py-1 rounded-full">
                Simpler words
              </span>
            </div>

            <div className="relative bg-slate-900/75 border border-slate-700 rounded-2xl h-[300px] sm:h-[330px] overflow-hidden focus-within:border-cyan-400/40 transition">

              <button
                type="button"
                onClick={() => speakText(simplifiedText)}
                disabled={!simplifiedText}
                title="Listen to simplified text"
                className="absolute top-3 right-3 z-20 w-9 h-9 rounded-lg bg-slate-800/90 border border-slate-700 text-slate-300 flex items-center justify-center hover:border-cyan-400 hover:text-cyan-400 transition disabled:opacity-30"
              >
                <UIIcon name="volume" size={17} />
              </button>

              <div className="p-4 pr-14 text-sm leading-6 whitespace-pre-wrap h-full overflow-y-auto">
                {simplifiedText ? (
                  highlightSimplifiedText()
                ) : (
                  <span className="text-slate-600">
                    Your simplified text will appear here...
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ACTIONS */}
        <section className="flex flex-col sm:flex-row gap-2.5 mt-5">
          <button
            type="button"
            onClick={handleSimplify}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 py-3 rounded-xl font-bold text-sm hover:from-cyan-300 hover:to-cyan-400 transition disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/10"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                Simplifying...
              </span>
            ) : (
              <span className="inline-flex items-center justify-center gap-2">
                <UIIcon name="sparkle" size={16} />
                Simplify Text
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="sm:w-28 border border-slate-700 text-slate-300 py-3 rounded-xl hover:bg-slate-900 hover:border-slate-600 transition text-sm font-semibold"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <UIIcon name="trash" size={15} />
              Clear
            </span>
          </button>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* ANALYSIS */}
        <section className="grid lg:grid-cols-2 gap-5 mt-7">

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-400 text-[10px] font-bold uppercase tracking-[0.16em]">
                  Analysis
                </p>
                <h2 className="text-lg sm:text-xl font-bold mt-1">
                  Readability Score
                </h2>
              </div>

              <div className="w-9 h-9 rounded-lg bg-cyan-400/10 border border-cyan-400/15 flex items-center justify-center text-cyan-400">
                <UIIcon name="chart" size={19} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800/70">
                <p className="text-slate-500 text-[11px]">Before</p>
                <p className="text-2xl sm:text-3xl font-bold mt-1.5">
                  {formatNumber(beforeReadability)}
                </p>
                <p className="text-slate-600 text-[11px] mt-1">
                  Reading Ease
                </p>
              </div>

              <div className="bg-cyan-400/[0.04] border border-cyan-400/15 rounded-xl p-4">
                <p className="text-cyan-400 text-[11px]">After</p>
                <p className="text-2xl sm:text-3xl font-bold text-cyan-400 mt-1.5">
                  {formatNumber(afterReadability)}
                </p>
                <p className="text-slate-600 text-[11px] mt-1">
                  Reading Ease
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-400 text-[10px] font-bold uppercase tracking-[0.16em]">
                  Results
                </p>
                <h2 className="text-lg sm:text-xl font-bold mt-1">
                  Improvement
                </h2>
              </div>

              <div className="w-9 h-9 rounded-lg bg-cyan-400/10 border border-cyan-400/15 flex items-center justify-center text-cyan-400">
                <UIIcon name="chart" size={19} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800/70">
                <p className="text-slate-500 text-[11px]">
                  Reading Improvement
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-cyan-400 mt-1.5">
                  {improvementDisplay}
                </p>
              </div>

              <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800/70">
                <p className="text-slate-500 text-[11px]">
                  Grade Level
                </p>
                <p className="text-xl sm:text-2xl font-bold mt-2">
                  {beforeGrade !== "--" && afterGrade !== "--"
                    ? `${formatNumber(beforeGrade)} → ${formatNumber(afterGrade)}`
                    : "--"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* EXTRA METRICS */}
        <section className="grid sm:grid-cols-2 gap-5 mt-5">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-[10px] uppercase tracking-[0.16em]">
                Reading Time
              </p>
              <p className="text-2xl font-bold mt-1.5">
                {readingTime}
              </p>
            </div>

            <div className="w-9 h-9 rounded-lg bg-cyan-400/10 border border-cyan-400/15 flex items-center justify-center text-cyan-400">
              <UIIcon name="clock" size={19} />
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-[10px] uppercase tracking-[0.16em]">
                Grammar Score
              </p>

              <p className="text-2xl font-bold mt-1.5">
                {grammarScore === "--"
                  ? "--"
                  : typeof grammarScore === "string" &&
                    grammarScore.includes("%")
                  ? grammarScore
                  : `${grammarScore}%`}
              </p>
            </div>

            <div className="w-9 h-9 rounded-lg bg-cyan-400/10 border border-cyan-400/15 flex items-center justify-center text-cyan-400">
              <UIIcon name="check" size={19} />
            </div>
          </div>
        </section>

        {/* VOCABULARY */}
        <section className="mt-5 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <p className="text-yellow-400 text-[10px] font-bold uppercase tracking-[0.16em]">
                Vocabulary
              </p>
              <h2 className="text-xl sm:text-2xl font-bold mt-1">
                Difficult Words
              </h2>
            </div>

            <div className="text-slate-500 text-xs">
              {difficultWords.length} words
            </div>
          </div>

          {difficultWords.length === 0 ? (
            <div className="border border-dashed border-slate-800 rounded-xl py-8 text-center text-slate-600 text-sm">
              Difficult words will appear here after simplification.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {difficultWords.map((item, index) => {
                const word =
                  typeof item === "string"
                    ? item
                    : item?.word || "";

                const meaning =
                  typeof item === "object"
                    ? item?.meaning || "Meaning not available."
                    : "Meaning not available.";

                return (
                  <div
                    className="bg-slate-950/75 border border-slate-800 rounded-xl p-4 hover:border-yellow-400/25 transition"
                    key={`${word}-${index}`}
                  >
                    <div className="text-yellow-300 font-bold text-sm break-words">
                      {word}
                    </div>

                    <div className="text-cyan-300 text-xs mt-2 leading-5">
                      → {meaning}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* FOOTER NAV */}
        <footer className="flex justify-between items-center mt-7 pb-8">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-cyan-400 transition text-sm"
          >
            <UIIcon name="back" size={15} />
            Back to Dashboard
          </button>

          <button
            type="button"
            onClick={() => navigate("/history")}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-cyan-400 transition text-sm"
          >
            View History
            <UIIcon name="next" size={15} />
          </button>
        </footer>

      </div>
    </div>
  );
}

export default Simplify;