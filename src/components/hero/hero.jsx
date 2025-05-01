import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import './hero.css'; // Import the updated CSS

function Hero3() {
  return (
    <section className="hero-section">
      <div className="hero-content">
        {/* Large text (p1) split into two lines */}
        <p className="p5">
        Driving Sustainable Transformation <br />in the Mining Industry.
        </p>
        {/* Smaller text (p2) */}
        <p className="p6">
        
  EcoStep helps companies <strong>track and reduce carbon emissions</strong>, <br />
  earn rewards for eco-friendly actions, and connect with a community of changemakers.
</p>

      </div>

      {/* Sign Up button using Link to route to /signup */}
      <Link to="/signup">
        <button className="signup-button">Sign Up</button>
      </Link>
    </section>
  );
}

export default Hero3;
