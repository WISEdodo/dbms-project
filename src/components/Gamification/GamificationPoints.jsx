import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase";
import "./GamificationPoints.css";

const GamificationPoints = () => {
  const [userPoints, setUserPoints] = useState(0);
  const [challenges, setChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define available challenges
  const availableChallenges = [
    {
      id: "challenge1",
      title: "First Carbon Calculation",
      description: "Complete your first carbon footprint calculation",
      points: 100,
      type: "oneTime",
    },
    {
      id: "challenge2",
      title: "Reduce Emissions",
      description: "Reduce your carbon emissions by 10% compared to last month",
      points: 200,
      type: "monthly",
    },
    {
      id: "challenge3",
      title: "Green Energy Switch",
      description: "Switch to green energy sources",
      points: 150,
      type: "oneTime",
    },
    {
      id: "challenge4",
      title: "Sustainable Diet",
      description: "Adopt a more sustainable diet",
      points: 100,
      type: "oneTime",
    },
    {
      id: "challenge5",
      title: "Zero Waste Week",
      description: "Complete a week with minimal waste generation",
      points: 300,
      type: "weekly",
    },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const userId = user.uid;
          const userRef = doc(db, "users", userId);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserPoints(userData.points || 0);
            setCompletedChallenges(userData.completedChallenges || []);
          }

          // Check for new challenge completions
          await checkChallengeCompletions(userId);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const checkChallengeCompletions = async (userId) => {
    try {
      // Get user's carbon emission history
      const carbonHistoryRef = collection(
        db,
        "users",
        userId,
        "carbonEmissionHistory"
      );
      const q = query(
        carbonHistoryRef,
        where(
          "createdAt",
          ">=",
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        )
      );
      const querySnapshot = await getDocs(q);

      const emissions = [];
      querySnapshot.forEach((doc) => {
        emissions.push(doc.data().carbonEmission);
      });

      // Check for challenge completions
      const newCompletedChallenges = [];
      let pointsToAdd = 0;

      // Check for first calculation challenge
      if (emissions.length > 0 && !completedChallenges.includes("challenge1")) {
        newCompletedChallenges.push("challenge1");
        pointsToAdd += availableChallenges.find(
          (c) => c.id === "challenge1"
        ).points;
      }

      // Check for emission reduction challenge
      if (emissions.length >= 2) {
        const lastMonth = emissions[emissions.length - 1];
        const previousMonth = emissions[emissions.length - 2];
        const reduction = ((previousMonth - lastMonth) / previousMonth) * 100;

        if (reduction >= 10 && !completedChallenges.includes("challenge2")) {
          newCompletedChallenges.push("challenge2");
          pointsToAdd += availableChallenges.find(
            (c) => c.id === "challenge2"
          ).points;
        }
      }

      // Update user points and completed challenges if there are new completions
      if (newCompletedChallenges.length > 0) {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          points: userPoints + pointsToAdd,
          completedChallenges: [
            ...completedChallenges,
            ...newCompletedChallenges,
          ],
        });

        setUserPoints((prev) => prev + pointsToAdd);
        setCompletedChallenges((prev) => [...prev, ...newCompletedChallenges]);
      }
    } catch (error) {
      console.error("Error checking challenge completions:", error);
    }
  };

  if (loading) {
    return <div className="gamification-loading">Loading challenges...</div>;
  }

  return (
    <div className="gamification-container">
      <div className="points-display">
        <h2>Your Points</h2>
        <div className="points-value">{userPoints}</div>
      </div>

      <div className="challenges-section">
        <h2>Available Challenges</h2>
        <div className="challenges-grid">
          {availableChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className={`challenge-card ${
                completedChallenges.includes(challenge.id) ? "completed" : ""
              }`}
            >
              <h3>{challenge.title}</h3>
              <p>{challenge.description}</p>
              <div className="challenge-points">
                <span>{challenge.points} points</span>
                {completedChallenges.includes(challenge.id) && (
                  <span className="completed-badge">Completed!</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GamificationPoints;
