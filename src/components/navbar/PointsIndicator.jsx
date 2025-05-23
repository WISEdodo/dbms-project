import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import "./PointsIndicator.css";

const PointsIndicator = () => {
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    let unsubscribe = () => {};

    const setupPointsListener = (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        unsubscribe = onSnapshot(
          userRef,
          (doc) => {
            if (doc.exists()) {
              const userData = doc.data();
              setPoints(userData.points || 0);
            }
            setLoading(false);
          },
          (error) => {
            console.error("Error listening to points updates:", error);
            setLoading(false);
          }
        );
      } else {
        setPoints(0);
        setLoading(false);
      }
    };

    // Initial setup
    const user = auth.currentUser;
    setupPointsListener(user);

    // Listen for auth state changes
    const authUnsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe(); // Clean up previous listener
      setupPointsListener(user);
    });

    return () => {
      unsubscribe();
      authUnsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="points-indicator loading">...</div>;
  }

  return (
    <div className="points-indicator" title="Your Points">
      <span className="points-icon">🏆</span>
      <span className="points-value">{points.toLocaleString()}</span>
    </div>
  );
};

export default PointsIndicator;
