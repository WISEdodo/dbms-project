import React from "react";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import "./navbar.css";

function Navbar() {
  const auth = getAuth();
  const user = auth.currentUser;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="logo">
          <img
            src={`${process.env.PUBLIC_URL}/logo2.jpg.png`}
            alt="Logo"
            className="logo-img"
          />
        </div>

        {/* Right-side menu */}
        <div className="menu-right">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/carbonform" className="nav-link">
            Carbon Form
          </Link>
          {/* <Link to="/carbon" className="nav-link">Marketplace</Link> */}
          {/* <Link to="/result" className="nav-link">Result</Link> */}
          <Link to="/challenges" className="nav-link">
            Challenges
          </Link>
          <Link to="/dashboard" className="nav-link">
            Profile
          </Link>{" "}
          {/* Profile now links to Dashboard */}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
