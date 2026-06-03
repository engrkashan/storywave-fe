import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const navLinks = [
  { to: "#features", label: "Features" },
  { to: "#how-it-works", label: "How It Works" },
  { to: "#examples", label: "Examples" },
  { to: "#pricing", label: "Pricing" },
  { to: "#testimonials", label: "Reviews" },
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="sticky top-3 sm:top-5 w-[95%] sm:w-11/12 md:w-3/4 mx-auto z-50">
      <nav className="flex items-center justify-between px-4 sm:px-6 bg-secondary-dark backdrop-blur-md rounded-full shadow-xl transition-all duration-300 ease-in-out">
        {/* Logo */}
        <img src="/logo.png" alt="Story Wave" className="w-auto h-16 md:h-24 flex-shrink-0" />

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center space-x-8 text-secondary-light font-medium text-lg">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="hover:text-primary transition-all duration-300"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link to="/auth/login">
            <button className="text-white hover:text-primary transition-all duration-300 font-medium btn-gradient px-5 sm:px-8 py-2.5 sm:py-3 rounded-full text-sm sm:text-base">
              Sign In
            </button>
          </Link>
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            className="md:hidden text-white p-2 rounded-full hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 mx-2 bg-secondary-dark/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 overflow-hidden">
          <ul className="py-2">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-6 py-3 text-secondary-light hover:text-primary hover:bg-white/5 transition-all duration-200 font-medium min-h-[48px] flex items-center"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;