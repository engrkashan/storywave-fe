import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav className="flex items-center justify-between px-6 sticky top-5 w-11/12 md:w-3/4 mx-auto bg-secondary-dark backdrop-blur-md rounded-full shadow-xl z-50 transition-all duration-300 ease-in-out transform md:space-x-8 space-y-2 md:space-y-0">
            <img src="/logo.png" alt="Story Wave" className="w-auto h-24" />

            <div className="hidden md:flex items-center space-x-8 text-secondary-light font-medium text-lg">
                <Link to="#features" className="hover:text-primary transition-all duration-300">Features</Link>
                <Link to="#how-it-works" className="hover:text-primary transition-all duration-300">How It Works</Link>
                <Link to="#examples" className="hover:text-primary transition-all duration-300">Examples</Link>
                <Link to="#pricing" className="hover:text-primary transition-all duration-300">Pricing</Link>
                <Link to="#testimonials" className="hover:text-primary transition-all duration-300">Reviews</Link>
            </div>

            <Link to="/auth/login">
                <button className="text-white hover:text-primary transition-all duration-300 font-medium btn-gradient px-8 py-3 rounded-full">Sign In</button>
            </Link>
        </nav>
    )
}

export default Navbar;