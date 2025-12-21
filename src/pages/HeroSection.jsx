import React from "react";
import { Link } from "react-router-dom";
import Ballpit from "./Ballpit";

const HeroSection = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // ✅ HARD LOCK BODY SCROLL (mobile-safe)
  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap");
        * { font-family: "Poppins", sans-serif; }
      `}</style>

      <section className="relative flex flex-col items-center bg-gradient-to-b from-black to-[#3B006E] text-white px-4 pb-10 overflow-hidden">
        {/* 🔮 BALLPIT BACKGROUND (TOUCH DISABLED) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="w-full h-full">
            <Ballpit
              count={100}
              gravity={0.01}
              friction={0.9975}
              wallBounce={0.95}
              followCursor={true}
              colors={["#5D009F", "#8B5CF6", "#A855F7", "#C084FC"]}
            />
          </div>
        </div>

        {/* CONTENT (TOUCH ENABLED) */}
        <div className="relative z-10 w-full pointer-events-auto">
          {/* ✅ NAVBAR */}
          <nav className="flex items-center justify-between py-3 md:px-16 lg:px-24 xl:px-32 w-full">
            <span className="text-xl font-semibold">LOGO</span>

            {/* DESKTOP LOGIN */}
            <Link
              to="/login"
              className="hidden md:flex items-center bg-purple-600 hover:bg-purple-700 px-10 h-10 rounded-full"
            >
              Login
            </Link>

            {/* ✅ MOBILE MENU BUTTON (CLICK + TOUCH FIX) */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              onTouchStart={() => setMobileOpen(true)}
              className="md:hidden bg-gray-900/80 hover:bg-gray-800 p-2 rounded-md z-[101] pointer-events-auto"
            >
              ☰
            </button>
          </nav>

          {/* ✅ MOBILE MENU */}
          {mobileOpen && (
            <div className="fixed inset-0 z-[9999] pointer-events-auto">
              {/* Overlay */}
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setMobileOpen(false)}
                onTouchStart={() => setMobileOpen(false)}
              />

              {/* Menu Panel */}
              <div className="absolute top-0 right-0 h-full w-3/4 max-w-xs bg-[#12001f] p-6 flex flex-col gap-6 animate-slideIn">
                <button
                  onClick={() => setMobileOpen(false)}
                  onTouchStart={() => setMobileOpen(false)}
                  className="self-end text-xl hover:text-gray-300"
                >
                  ✕
                </button>

                {["Home", "Features", "Pricing", "Contact"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setMobileOpen(false)}
                    onTouchStart={() => setMobileOpen(false)}
                    className="text-lg text-gray-200 hover:text-white py-2"
                  >
                    {item}
                  </a>
                ))}

                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  onTouchStart={() => setMobileOpen(false)}
                  className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full text-center"
                >
                  Login
                </Link>
              </div>
            </div>
          )}

          {/* HERO CONTENT */}
          <div className="flex flex-col items-center text-center min-h-[500px] justify-center">
            <h1 className="text-[42px] md:text-6xl font-semibold max-w-[840px] mt-24 bg-gradient-to-r from-white to-[#C084FC] text-transparent bg-clip-text">
              Connect with your circle in a fun way!
            </h1>

            <p className="text-gray-200 text-sm max-w-sm mt-4">
              Unlock AI-powered features to level up your experience.
            </p>

            <div className="mt-8 flex items-center bg-white h-12 border rounded-md w-full max-w-md">
              <input
                type="search"
                placeholder="Search"
                className="px-3 w-full h-full outline-none text-gray-600 rounded-l-md"
              />
              <button className="bg-purple-600 hover:bg-purple-700 px-6 h-full text-white rounded-r-md">
                Search
              </button>
            </div>

            <p className="text-gray-200 mt-4 text-sm">
              2000+ users already connected
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;




//fjsdifijdsijffdkfkdsfkjd