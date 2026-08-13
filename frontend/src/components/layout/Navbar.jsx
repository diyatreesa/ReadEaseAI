import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-slate-950/85 backdrop-blur-md z-50 border-b border-slate-800">

      <div className="w-full px-8 lg:px-12 xl:px-16 py-2.5 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 text-2xl font-bold text-cyan-400 hover:text-cyan-300 transition"
        >
          <img
            src="/logo.png"
            alt="ReadEase AI Logo"
            className="w-12 h-12 object-contain"
          />

          <span>ReadEase AI</span>
        </Link>


        {/* Navigation Links */}
        <div className="flex items-center gap-9">

          

          <a
            href="#features"
            className="text-white hover:text-cyan-400 transition"
          >
            Features
          </a>

          <Link
            to="/login"
            className="text-white hover:text-cyan-400 transition"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="bg-cyan-400 text-black px-6 py-2.5 rounded-xl font-semibold hover:bg-cyan-300 transition"
          >
            Get Started
          </Link>

        </div>

      </div>

    </nav>
  );
}

export default Navbar;