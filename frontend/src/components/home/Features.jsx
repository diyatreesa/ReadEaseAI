import { FaBookOpen } from "react-icons/fa";
import { MdOutlineAnalytics } from "react-icons/md";
import { BsRobot } from "react-icons/bs";
function Features() {
  return (
    <section id="features" className="max-w-screen-xl mx-auto py-32 px-8">

      <h2 className="text-5xl font-bold text-center mb-20">
        Why Choose ReadEase AI?
      </h2>

      <div className="grid md:grid-cols-3 gap-10">

        <div className="group cursor-pointer bg-slate-900 rounded-2xl p-10 border border-slate-800 hover:border-cyan-400 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] transition-all duration-300">
        <h3 className="flex items-center gap-3 text-2xl font-bold mb-4">
    <FaBookOpen className="text-cyan-400 text-3xl" />
    Text Simplification
</h3>

          <p className="text-slate-400">
            Convert complex text into simple and easy-to-read language.
          </p>
        </div>

        <div className="group cursor-pointer bg-slate-900 rounded-2xl p-8 border border-slate-800 hover:border-cyan-400 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] transition-all duration-300">
         <h3 className="flex items-center gap-3 text-2xl font-bold mb-4">
  <MdOutlineAnalytics className="text-cyan-400 text-3xl" />
  Readability Score
</h3>

          <p className="text-slate-400">
            Measure how easy your content is to understand.
          </p>
        </div>

        <div className="group cursor-pointer bg-slate-900 rounded-2xl p-8 border border-slate-800 hover:border-cyan-400 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] transition-all duration-300">
          <h3 className="flex items-center gap-3 text-2xl font-bold mb-4">
  <BsRobot className="text-cyan-400 text-3xl" />
  AI Powered
</h3>

          <p className="text-slate-400">
            Uses Natural Language Processing to preserve meaning while simplifying text.
          </p>
        </div>

      </div>

    </section>
  );
}

export default Features;