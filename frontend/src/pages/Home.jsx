import Navbar from "../components/layout/Navbar";
import Hero from "../components/home/Hero";
import Features from "../components/home/Features";

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main>
        <Hero />
        <Features />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950">

        <div className="w-full px-10 lg:px-16 xl:px-20 py-8">

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">

            {/* Brand */}
            <div className="text-center md:text-left">

              <p className="text-lg font-bold text-white">
                ReadEase{" "}
                <span className="text-cyan-400">
                  AI
                </span>
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Making complex English easier to understand.
              </p>

            </div>

            {/* Copyright */}
            <p className="text-sm text-slate-600">
              © {new Date().getFullYear()} ReadEase AI. All rights reserved.
            </p>

          </div>

        </div>

      </footer>

    </div>
  );
}

export default Home;