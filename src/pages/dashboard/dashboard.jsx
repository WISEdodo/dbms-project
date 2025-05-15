import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "./dashboard.css";
import { fetchLatestCarbonEmissionHistory } from "../../CarbonCalculator";
import { useLocation } from "react-router-dom";
import Footer from "../../components/footer/footer"; // Ensure the path is correct

const Dashboard = () => {
  const [dietType, setDietType] = useState("");
  const [wasteGeneration, setWasteGeneration] = useState("");
  const [recycling, setRecycling] = useState("");
  const [composting, setComposting] = useState("");
  const [greenEnergy, setGreenEnergy] = useState("");
  const [uniqueEmail, setUniqueEmail] = useState("");
  const [totalCarbonEmission, setTotalCarbonEmission] = useState(0);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const fallbackUid = location.state?.uid;

  useEffect(() => {
    const auth = getAuth();
    const fetchLatestCarbonData = async (userUid) => {
      try {
        // Fetch user email from profile
        const userProfileRef = doc(db, "users", userUid);
        const userProfileSnap = await getDoc(userProfileRef);
        if (userProfileSnap.exists()) {
          const userData = userProfileSnap.data();
          setUniqueEmail(userData.email || "");
        }
        // Fetch latest carbon emission record using the new function
        const latestData = await fetchLatestCarbonEmissionHistory();
        if (latestData) {
          setDietType(latestData.dietType || "");
          setWasteGeneration(latestData.wasteGeneration || "");
          setRecycling(latestData.recycling || "");
          setComposting(latestData.composting || "");
          setGreenEnergy(latestData.greenEnergy || "");
          setTotalCarbonEmission(latestData.carbonEmission || 0);
        } else {
          setTotalCarbonEmission(0);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching latest carbon data:", error);
        setLoading(false);
      }
    };

    onAuthStateChanged(auth, (user) => {
      const currentUid = user ? user.uid : fallbackUid;
      if (currentUid) {
        fetchLatestCarbonData(currentUid);
      }
    });
  }, [fallbackUid]);

  return (
    <div className="IamYash" style={{ paddingTop: "9rem" }}>
      <header className="unique-dashboard-header">
        <h1>Carbon Footprint Dashboard</h1>
      </header>
      {loading ? (
        <div className="unique-input-container">
          <div className="unique-input-box">Loading user data...</div>
        </div>
      ) : (
        <>
          <div className="unique-input-container">
            <div className="unique-input-box email">
              Email ID: {uniqueEmail || "Not set"}
            </div>
            <div className="unique-input-box">
              Diet Type: {dietType || "Not set"}
            </div>
            <div className="unique-input-box">
              Waste Generation:{" "}
              {wasteGeneration ? `${wasteGeneration} kg/week` : "Not set"}
            </div>
            <div className="unique-input-box">
              Recycling: {recycling || "Not set"}
            </div>
            <div className="unique-input-box">
              Composting: {composting || "Not set"}
            </div>
            <div className="unique-input-box">
              Green Energy: {greenEnergy || "Not set"}
            </div>
          </div>
          <div className="unique-dashboard-container">
            <div className="unique-box unique-box1">
              <div className="unique-h1">Monthly Carbon Emission</div>
              <p>
                {totalCarbonEmission} tons of CO<sub>2</sub>
              </p>
            </div>

            {/* New Suggestions Box */}
            <div className="unique-box unique-box-suggestions">
              <div className="unique-h3">
                Suggestions to Reduce Your Footprint
              </div>
              <ul>
                {/* Suggestions will be dynamically inserted here */}
                <li>Consider using public transport more often.</li>
                <li>Explore plant-based meal options.</li>
                <li>Improve home insulation to save energy.</li>
              </ul>
            </div>
          </div>
        </>
      )}
      <Footer />
    </div>
  );
};

export default Dashboard;
