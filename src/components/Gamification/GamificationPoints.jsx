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
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";
import "./GamificationPoints.css";

const GamificationPoints = () => {
  const [userPoints, setUserPoints] = useState(0);
  const [challenges, setChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

        if (!user) {
          setError("Please log in to view your points and challenges");
          setLoading(false);
          return;
        }

        const userId = user.uid;
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          // Initialize user document if it doesn't exist
          await updateDoc(userRef, {
            points: 0,
            completedChallenges: [],
            createdAt: new Date(),
          });
          setUserPoints(0);
          setCompletedChallenges([]);
        } else {
          const userData = userDoc.data();
          // Validate and set points
          const points =
            typeof userData.points === "number" ? userData.points : 0;
          // Validate and set completed challenges
          const challenges = Array.isArray(userData.completedChallenges)
            ? userData.completedChallenges
            : [];

          setUserPoints(points);
          setCompletedChallenges(challenges);
        }

        // Check for new challenge completions
        await checkChallengeCompletions(userId);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(
          "Failed to load your points and challenges. Please try again later."
        );
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const isChallengeEligible = (challenge, emissions) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    // Check if challenge is already completed
    if (completedChallenges.includes(challenge.id)) {
      return false;
    }

    switch (challenge.type) {
      case "oneTime":
        // One-time challenges can only be completed once
        return !completedChallenges.includes(challenge.id);

      case "monthly":
        // Monthly challenges can be completed once per month
        const lastCompletion = completedChallenges
          .filter((c) => c.id === challenge.id)
          .map((c) => c.completedAt)
          .sort((a, b) => b - a)[0];

        return !lastCompletion || lastCompletion < thirtyDaysAgo;

      case "weekly":
        // Weekly challenges can be completed once per week
        const lastWeeklyCompletion = completedChallenges
          .filter((c) => c.id === challenge.id)
          .map((c) => c.completedAt)
          .sort((a, b) => b - a)[0];

        return !lastWeeklyCompletion || lastWeeklyCompletion < sevenDaysAgo;

      default:
        return false;
    }
  };

  const checkChallengeCompletions = async (userId) => {
    try {
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
        ),
        orderBy("createdAt", "asc")
      );
      const querySnapshot = await getDocs(q);

      const emissions = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Validate emission data and include timestamp
        const emission = parseFloat(data.carbonEmission);
        if (!isNaN(emission)) {
          emissions.push({
            value: emission,
            timestamp: data.createdAt.toDate(), // Convert Firestore timestamp to Date
          });
        }
      });

      // No need to sort manually as we're using orderBy in the query
      const newCompletedChallenges = [];
      let pointsToAdd = 0;

      // Check each challenge based on its type
      for (const challenge of availableChallenges) {
        if (!isChallengeEligible(challenge, emissions)) {
          continue;
        }

        let completed = false;

        switch (challenge.id) {
          case "challenge1": // First Carbon Calculation
            completed = emissions.length > 0;
            break;

          case "challenge2": // Reduce Emissions
            if (emissions.length >= 2) {
              const lastMonth = emissions[emissions.length - 1].value;
              const previousMonth = emissions[emissions.length - 2].value;

              if (previousMonth > 0 && lastMonth >= 0) {
                const reduction =
                  ((previousMonth - lastMonth) / previousMonth) * 100;
                completed = reduction >= 10;
              }
            }
            break;

          case "challenge3": // Green Energy Switch
            // Check if user has switched to green energy
            const userDoc = await getDoc(doc(db, "users", userId));
            const userData = userDoc.data();
            completed = userData?.greenEnergy === "Yes";
            break;

          case "challenge4": // Sustainable Diet
            // Check if user has adopted a sustainable diet
            const dietDoc = await getDoc(doc(db, "users", userId));
            const dietData = dietDoc.data();
            completed =
              dietData?.dietType === "Vegetarian" ||
              dietData?.dietType === "Vegan";
            break;

          case "challenge5": // Zero Waste Week
            // Check if user has completed a week with minimal waste
            const wasteDoc = await getDoc(doc(db, "users", userId));
            const wasteData = wasteDoc.data();
            completed = wasteData?.wasteGeneration === "Minimal";
            break;
        }

        if (completed) {
          newCompletedChallenges.push({
            id: challenge.id,
            completedAt: new Date(),
          });
          pointsToAdd += challenge.points;
        }
      }

      // Update user points and completed challenges if there are new completions
      if (newCompletedChallenges.length > 0) {
        const userRef = doc(db, "users", userId);
        const newPoints = userPoints + pointsToAdd;
        const newCompletedChallengesList = [
          ...completedChallenges,
          ...newCompletedChallenges,
        ];

        await updateDoc(userRef, {
          points: newPoints,
          completedChallenges: newCompletedChallengesList,
          lastUpdated: new Date(),
        });

        setUserPoints(newPoints);
        setCompletedChallenges(newCompletedChallengesList);
      }
    } catch (error) {
      console.error("Error checking challenge completions:", error);
      setError("Failed to update your points. Please try again later.");
    }
  };

  if (loading) {
    return <div className="gamification-loading">Loading challenges...</div>;
  }

  if (error) {
    return <div className="gamification-error">{error}</div>;
  }

  return (
    <div className="gamification-container">
      <div className="points-display">
        <h2>Your Points</h2>
        <div className="points-value">{userPoints.toLocaleString()}</div>
      </div>

      <div className="challenges-section">
        <h2>Available Challenges</h2>
        <div className="challenges-grid">
          {availableChallenges.map((challenge) => {
            const isCompleted = completedChallenges.some(
              (c) => c.id === challenge.id
            );
            const lastCompletion = completedChallenges
              .filter((c) => c.id === challenge.id)
              .map((c) => c.completedAt)
              .sort((a, b) => b - a)[0];

            return (
              <div
                key={challenge.id}
                className={`challenge-card ${isCompleted ? "completed" : ""}`}
              >
                <div className="challenge-header">
                  <h3>{challenge.title}</h3>
                  <span className={`challenge-type ${challenge.type}`}>
                    {challenge.type.charAt(0).toUpperCase() +
                      challenge.type.slice(1)}
                  </span>
                </div>
                <p>{challenge.description}</p>
                <div className="challenge-points">
                  <span>{challenge.points.toLocaleString()} points</span>
                  {isCompleted && (
                    <div className="completion-info">
                      <span className="completed-badge">Completed!</span>
                      {lastCompletion && (
                        <span className="completion-date">
                          {new Date(lastCompletion).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GamificationPoints;
