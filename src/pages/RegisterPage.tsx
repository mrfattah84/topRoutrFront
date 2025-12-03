import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import heroBackground from "../assets/top-route-final-1.png";
import logoImage from "../assets/top-route-final-2.png";

const HERO_BG = heroBackground;

// Eye icon for password visibility toggle
const EyeIcon = ({ isVisible }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {isVisible ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

// Google logo SVG
const GoogleLogo = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g fill="none" fillRule="evenodd">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.96-2.18l-2.908-2.258c-.806.54-1.837.86-3.052.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712 0-.595.102-1.173.282-1.712V4.956H.957C.348 6.174 0 7.55 0 9s.348 2.826.957 4.044l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.956L3.964 7.288C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </g>
  </svg>
);

function RegisterPage() {
  const [form, setForm] = useState({
    email: "balamia@gmail.com",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Placeholder: send credentials to backend once auth is ready
    alert(`Thanks ${form.email || "there"}! Auth service is coming soon.`);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="auth-hero" style={{ backgroundImage: `url(${HERO_BG})` }}>
      <div className="auth-overlay" />
      <div className="auth-container">
        <header className="auth-nav">
          <div className="auth-nav-left">
            <nav>
              <a href="#about">About us</a>
              <a href="#contact">Contact us</a>
            </nav>
          </div>
          <div className="auth-nav-right">
            <button
              type="button"
              className="navLogoBtn"
              onClick={() => navigate("/home")}
            >
              <img src={logoImage} alt="Top Route" className="auth-logo" />
            </button>
          </div>
        </header>

        <main className="auth-content">
          <div>
            <h1 className="auth-hero-copy-title">Smarter</h1>
            <h1 className="auth-hero-copy">
              Routes, Faster
              <br />
              Deliveries
            </h1>
          </div>
          <div className="auth-frame">
            <div className="auth-card">
              <h2>Create an account</h2>
              <form onSubmit={handleSubmit}>
                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@email.com"
                    required
                  />
                </label>
                <label className="password-row">
                  <div className="label-row">
                    <span>Password</span>
                    <button type="button" className="ghost">
                      Forgot?
                    </button>
                  </div>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={togglePasswordVisibility}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      <EyeIcon isVisible={showPassword} />
                    </button>
                  </div>
                </label>
                <button type="submit" className="primary block">
                  Create account
                </button>
                <button type="button" className="google-button block">
                  <GoogleLogo />
                  Continue with Google
                </button>
              </form>
              <p className="auth-footer">
                Already Have An Account?{" "}
                <button
                  type="button"
                  className="link"
                  onClick={() => alert("Login coming soon!")}
                >
                  Log In
                </button>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default RegisterPage;
