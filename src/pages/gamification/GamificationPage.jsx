import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  increment,
} from "firebase/firestore";
import { db } from "../../firebase";
import "./GamificationPage.css";

const challenges = [
  {
    id: "first_calculation",
    title: "First Carbon Calculation",
    description:
      "Complete your first carbon emission calculation to understand your environmental impact",
    points: 100,
    type: "one_time",
    icon: "📊",
    category: "Getting Started",
  },
  {
    id: "zero_waste_week",
    title: "Zero Waste Week",
    description:
      "Track and maintain zero waste practices for 7 consecutive days",
    points: 300,
    type: "recurring",
    icon: "♻️",
    category: "Waste Management",
  },
  {
    id: "carbon_reduction",
    title: "Carbon Reduction Milestone",
    description:
      "Achieve a 10% reduction in your carbon emissions compared to last month",
    points: 500,
    type: "achievement",
    icon: "🌱",
    category: "Emission Reduction",
  },
  {
    id: "sustainable_transport",
    title: "Sustainable Transport Week",
    description: "Use sustainable transport methods for 7 consecutive days",
    points: 250,
    type: "recurring",
    icon: "🚲",
    category: "Transportation",
  },
  {
    id: "energy_saving",
    title: "Energy Saving Champion",
    description:
      "Implement and track 5 energy-saving practices in your daily routine",
    points: 400,
    type: "achievement",
    icon: "💡",
    category: "Energy Efficiency",
  },
  {
    id: "recycling_master",
    title: "Recycling Master",
    description: "Maintain a recycling rate of 80% or higher for 30 days",
    points: 600,
    type: "achievement",
    icon: "🔄",
    category: "Waste Management",
  },
];

const GamificationPage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completingChallenge, setCompletingChallenge] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          setError("Please log in to view challenges");
          setLoading(false);
          return;
        }

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          console.log("User data from database:", data);
          console.log("Current points in database:", data.points);
          setUserData(data);
        } else {
          console.log("No user document found in database");
          setError("User data not found");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Error fetching user data: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChallengeComplete = async (challengeId) => {
    try {
      setCompletingChallenge(challengeId);
      setError(null);
      setSuccessMessage("");

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error("Please log in to complete challenges");
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error("User data not found");
      }

      const userData = userSnap.data();
      console.log("User data before update:", userData);
      console.log("Current points before update:", userData.points);

      const completedChallenges = userData.completedChallenges || [];

      if (completedChallenges.includes(challengeId)) {
        throw new Error("Challenge already completed");
      }

      const challenge = challenges.find((c) => c.id === challengeId);
      if (!challenge) {
        throw new Error("Challenge not found");
      }

      await updateDoc(userRef, {
        points: increment(challenge.points),
        completedChallenges: arrayUnion(challengeId),
        lastChallengeCompleted: new Date(),
      });

      const updatedSnap = await getDoc(userRef);
      const updatedData = updatedSnap.data();
      console.log("User data after update:", updatedData);
      console.log("Points after update:", updatedData.points);

      setSuccessMessage(
        `Congratulations! You earned ${challenge.points} points!`
      );

      setUserData((prev) => ({
        ...prev,
        points: (prev.points || 0) + challenge.points,
        completedChallenges: [...(prev.completedChallenges || []), challengeId],
      }));
    } catch (err) {
      console.error("Error completing challenge:", err);
      setError(err.message);
    } finally {
      setCompletingChallenge(null);
    }
  };

  const categories = ["All", ...new Set(challenges.map((c) => c.category))];
  const filteredChallenges =
    selectedCategory === "All"
      ? challenges
      : challenges.filter((c) => c.category === selectedCategory);

  if (loading) {
    return (
      <div className="gamification-page loading">
        <div className="loading-spinner">Loading challenges...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gamification-page error">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="gamification-page">
      <div className="gamification-header">
        <h1>Challenges & Achievements</h1>
        <div className="total-points">
          <span className="points-value">{userData?.points || 0} Points</span>
        </div>
      </div>

      {successMessage && (
        <div className="success-message">
          <span className="success-icon">✨</span>
          {successMessage}
        </div>
      )}

      <div className="category-filter">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-button ${
              selectedCategory === category ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="challenges-grid">
        {filteredChallenges.map((challenge) => {
          const isCompleted = userData?.completedChallenges?.includes(
            challenge.id
          );
          const isCompleting = completingChallenge === challenge.id;

          return (
            <div
              key={challenge.id}
              className={`challenge-card ${isCompleted ? "completed" : ""}`}
            >
              <div className="challenge-icon">{challenge.icon}</div>
              <div className="challenge-content">
                <div className="challenge-header">
                  <h3>{challenge.title}</h3>
                  <span className="challenge-points">
                    +{challenge.points} pts
                  </span>
                </div>
                <p className="challenge-description">{challenge.description}</p>
                <div className="challenge-footer">
                  <span className="challenge-type">
                    {challenge.type.replace("_", " ")}
                  </span>
                  <span className="challenge-category">
                    {challenge.category}
                  </span>
                  <button
                    className={`complete-button ${
                      isCompleted ? "completed" : ""
                    }`}
                    onClick={() => handleChallengeComplete(challenge.id)}
                    disabled={isCompleted || isCompleting}
                  >
                    {isCompleted
                      ? "Completed ✓"
                      : isCompleting
                      ? "Completing..."
                      : "Complete Challenge"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GamificationPage;
