import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-slate-950">

      {/* =====================================================
          BACKGROUND GLOW
      ===================================================== */}

      <div className="absolute top-20 right-[-120px] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />

      <div className="absolute bottom-[-150px] right-[25%] w-[500px] h-[300px] bg-blue-600/10 rounded-full blur-[120px]" />

      <div className="absolute top-[35%] left-[-150px] w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[100px]" />


      {/* =====================================================
          HERO CONTENT
      ===================================================== */}

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 xl:px-12 pt-10">

        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] items-center min-h-[calc(100vh-120px)] gap-4 lg:gap-6">


          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="w-full">

            {/* =================================================
                MAIN HEADING
            ================================================= */}

            <h1 className="font-extrabold tracking-tight leading-[1.05]">

              <span className="block text-white text-[clamp(2.4rem,3.5vw,3.6rem)]">
                Simplify Complex Text
              </span>

              <span className="block text-cyan-400 text-[clamp(2.4rem,3.5vw,3.6rem)] mt-2">
                Without Losing Meaning
              </span>

            </h1>


            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <p className="text-slate-400 text-base sm:text-lg lg:text-xl leading-relaxed mt-7 max-w-xl">

              ReadEase AI transforms difficult English into simple,
              easy-to-read language while preserving the original meaning.

            </p>


            {/* =================================================
                BUTTONS
            ================================================= */}

            <div className="flex flex-wrap gap-4 mt-8">

              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-cyan-400 text-black px-7 py-4 rounded-xl font-semibold hover:bg-cyan-300 transition duration-300 shadow-lg shadow-cyan-400/10"
              >
                Try Now
                <span>→</span>
              </Link>


              <a
                href="#features"
                className="inline-flex items-center bg-transparent border border-cyan-400 text-white px-7 py-4 rounded-xl font-semibold hover:bg-cyan-400 hover:text-black transition duration-300"
              >
                Learn More
              </a>

            </div>

          </div>


          {/* =================================================
              RIGHT SIDE VISUAL
          ================================================= */}

          <div className="relative hidden lg:flex items-center justify-center h-[420px] xl:h-[460px]">


            {/* =================================================
                LARGE GLOW
            ================================================= */}

            <div className="absolute w-[330px] h-[330px] xl:w-[380px] xl:h-[380px] bg-cyan-400/10 rounded-full blur-[80px]" />


            {/* =================================================
                DECORATIVE RINGS
            ================================================= */}

            <div className="absolute w-[370px] h-[370px] xl:w-[420px] xl:h-[420px] border border-cyan-400/10 rounded-full" />

            <div className="absolute w-[300px] h-[300px] xl:w-[340px] xl:h-[340px] border border-blue-400/10 rounded-full" />

            <div className="absolute w-[240px] h-[240px] xl:w-[270px] xl:h-[270px] border border-cyan-400/10 rounded-full" />


            {/* =================================================
                FLOATING DOCUMENT - RIGHT
            ================================================= */}

            <div className="absolute top-4 right-10 xl:right-16 w-28 xl:w-32 h-36 xl:h-40 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 border border-cyan-400/40 rounded-2xl rotate-12 backdrop-blur-md shadow-2xl shadow-cyan-400/10">

              <div className="p-5 space-y-3">

                <div className="h-2 bg-cyan-300/80 rounded-full" />

                <div className="h-2 bg-blue-300/60 rounded-full" />

                <div className="h-2 bg-cyan-300/60 rounded-full" />

                <div className="h-2 bg-blue-300/50 rounded-full w-2/3" />

              </div>

            </div>


            {/* =================================================
                FLOATING DOCUMENT - LEFT
            ================================================= */}

            <div className="absolute top-24 left-6 xl:left-12 w-24 xl:w-28 h-32 xl:h-36 bg-gradient-to-br from-blue-400/20 to-cyan-400/10 border border-blue-400/30 rounded-2xl -rotate-12 backdrop-blur-md">

              <div className="p-4 space-y-3">

                <div className="h-2 bg-blue-300/70 rounded-full" />

                <div className="h-2 bg-cyan-300/60 rounded-full" />

                <div className="h-2 bg-blue-300/50 rounded-full" />

              </div>

            </div>


            {/* =================================================
                OPEN BOOK
            ================================================= */}

            <div className="relative z-10 mt-16">

              {/* Book glow */}

              <div className="absolute inset-0 bg-cyan-400/20 blur-3xl rounded-full" />


              <div className="relative w-[300px] h-[195px] xl:w-[340px] xl:h-[215px]">


                {/* LEFT PAGE */}

                <div className="absolute left-0 bottom-0 w-1/2 h-[82%] bg-gradient-to-br from-white via-blue-50 to-blue-200 rounded-l-[80%] rounded-r-2xl rotate-[-7deg] shadow-2xl shadow-blue-500/20">

                  <div className="absolute top-10 left-9 right-6 space-y-3">

                    <div className="h-2 bg-blue-300 rounded-full" />

                    <div className="h-2 bg-cyan-300 rounded-full" />

                    <div className="h-2 bg-blue-200 rounded-full" />

                    <div className="h-2 bg-blue-300 rounded-full w-3/4" />

                  </div>

                </div>


                {/* RIGHT PAGE */}

                <div className="absolute right-0 bottom-0 w-1/2 h-[82%] bg-gradient-to-bl from-white via-blue-50 to-cyan-100 rounded-r-[80%] rounded-l-2xl rotate-[7deg] shadow-2xl shadow-cyan-500/20">

                  <div className="absolute top-10 left-6 right-9 space-y-3">

                    <div className="h-2 bg-cyan-300 rounded-full" />

                    <div className="h-2 bg-blue-300 rounded-full" />

                    <div className="h-2 bg-cyan-200 rounded-full" />

                    <div className="h-2 bg-blue-300 rounded-full w-3/4" />

                  </div>

                </div>


                {/* BOOK SPINE */}

                <div className="absolute left-1/2 bottom-1 w-1 h-[80%] bg-cyan-400/70 -translate-x-1/2 rounded-full" />

              </div>

            </div>


            {/* =================================================
                BRAIN
            ================================================= */}

            <div className="absolute top-[-5px] right-8 xl:right-16 text-5xl xl:text-6xl">
              🧠
            </div>


            {/* =================================================
                SPARKLES
            ================================================= */}

            <div className="absolute top-20 left-2 xl:left-6 text-cyan-400 text-2xl xl:text-3xl animate-pulse">
              ✦
            </div>

            <div className="absolute top-44 right-0 text-yellow-300 text-xl xl:text-2xl animate-pulse">
              ✦
            </div>

            <div className="absolute bottom-8 left-4 xl:left-8 text-blue-400 text-xl xl:text-2xl animate-pulse">
              ✦
            </div>

            <div className="absolute bottom-20 right-8 xl:right-12 text-cyan-300 text-2xl xl:text-3xl animate-pulse">
              ✦
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Hero;