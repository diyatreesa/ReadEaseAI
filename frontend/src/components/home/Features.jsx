import { FaBookOpen } from "react-icons/fa";
import { MdOutlineAnalytics } from "react-icons/md";
import { BsRobot } from "react-icons/bs";

function Features() {
  return (
    <section
      id="features"
      className="w-full bg-slate-950"
    >
      <div className="max-w-screen-xl mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-24 lg:py-28">

        {/* Section Heading */}
        <h2
          className="
            text-3xl
            sm:text-4xl
            lg:text-5xl
            font-bold
            text-center
            mb-12
            sm:mb-16
            lg:mb-20
            leading-tight
          "
        >
          Why Choose ReadEase AI?
        </h2>


        {/* Feature Cards */}
        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            gap-6
            sm:gap-8
            lg:gap-10
          "
        >

          {/* =================================================
              TEXT SIMPLIFICATION
          ================================================= */}
          <div
            className="
              group
              cursor-pointer
              bg-slate-900
              rounded-2xl
              p-6
              sm:p-8
              lg:p-10
              border
              border-slate-800
              hover:border-cyan-400
              hover:-translate-y-2
              hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]
              transition-all
              duration-300
            "
          >
            <h3
              className="
                flex
                items-center
                gap-3
                text-xl
                sm:text-2xl
                font-bold
                mb-4
                leading-snug
              "
            >
              <FaBookOpen
                className="
                  text-cyan-400
                  text-2xl
                  sm:text-3xl
                  flex-shrink-0
                "
              />

              <span>
                Text Simplification
              </span>
            </h3>

            <p
              className="
                text-slate-400
                text-sm
                sm:text-base
                leading-relaxed
              "
            >
              Convert complex text into simple and easy-to-read language.
            </p>
          </div>


          {/* =================================================
              READABILITY SCORE
          ================================================= */}
          <div
            className="
              group
              cursor-pointer
              bg-slate-900
              rounded-2xl
              p-6
              sm:p-8
              lg:p-10
              border
              border-slate-800
              hover:border-cyan-400
              hover:-translate-y-2
              hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]
              transition-all
              duration-300
            "
          >
            <h3
              className="
                flex
                items-center
                gap-3
                text-xl
                sm:text-2xl
                font-bold
                mb-4
                leading-snug
              "
            >
              <MdOutlineAnalytics
                className="
                  text-cyan-400
                  text-2xl
                  sm:text-3xl
                  flex-shrink-0
                "
              />

              <span>
                Readability Score
              </span>
            </h3>

            <p
              className="
                text-slate-400
                text-sm
                sm:text-base
                leading-relaxed
              "
            >
              Measure how easy your content is to understand.
            </p>
          </div>


          {/* =================================================
              AI POWERED
          ================================================= */}
          <div
            className="
              group
              cursor-pointer
              bg-slate-900
              rounded-2xl
              p-6
              sm:p-8
              lg:p-10
              border
              border-slate-800
              hover:border-cyan-400
              hover:-translate-y-2
              hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]
              transition-all
              duration-300
            "
          >
            <h3
              className="
                flex
                items-center
                gap-3
                text-xl
                sm:text-2xl
                font-bold
                mb-4
                leading-snug
              "
            >
              <BsRobot
                className="
                  text-cyan-400
                  text-2xl
                  sm:text-3xl
                  flex-shrink-0
                "
              />

              <span>
                AI Powered
              </span>
            </h3>

            <p
              className="
                text-slate-400
                text-sm
                sm:text-base
                leading-relaxed
              "
            >
              Uses Natural Language Processing to preserve meaning while simplifying text.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}

export default Features;