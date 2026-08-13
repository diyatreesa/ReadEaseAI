function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 pt-20">

      <h1 className="text-6xl md:text-8xl font-extrabold leading-tight tracking-tight">

        Simplify Complex Text

        <br />

        <span className="text-cyan-400">

          Without Losing Meaning

        </span>

      </h1>

      <p className="mt-8 max-w-3xl text-xl leading-9 text-slate-400">

        ReadEase AI transforms difficult English into
        simple, easy-to-read language while preserving
        the original meaning.

      </p>

      <div className="mt-12 flex gap-6">

        <button className="bg-cyan-400 text-black px-8 py-4 rounded-xl font-semibold hover:bg-cyan-300 transition">

          Try Now

        </button>

        <button className="border border-cyan-400 px-8 py-4 rounded-xl hover:bg-cyan-400 hover:text-black transition">

          Learn More

        </button>

      </div>

    </section>
  );
}

export default Hero;