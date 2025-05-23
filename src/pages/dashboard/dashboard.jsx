import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "./dashboard.css";
import { fetchLatestCarbonEmissionHistory } from "../../CarbonCalculator";
import { useLocation } from "react-router-dom";
import Footer from "../../components/footer/footer";
import CarbonEmissionGraph from "../../components/CarbonEmissionGraph/CarbonEmissionGraph";

const Dashboard = () => {
  const [dietType, setDietType] = useState("");
  const [wasteGeneration, setWasteGeneration] = useState("");
  const [recycling, setRecycling] = useState("");
  const [composting, setComposting] = useState("");
  const [greenEnergy, setGreenEnergy] = useState("");
  const [uniqueEmail, setUniqueEmail] = useState("");
  const [totalCarbonEmission, setTotalCarbonEmission] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const fallbackUid = location.state?.uid;

  useEffect(() => {
    const auth = getAuth();
    const fetchLatestCarbonData = async (userUid) => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user email from profile
        const userProfileRef = doc(db, "users", userUid);
        const userProfileSnap = await getDoc(userProfileRef);

        if (!userProfileSnap.exists()) {
          throw new Error("User profile not found");
        }

        const userData = userProfileSnap.data();
        setUniqueEmail(userData.email || "");

        // Fetch latest carbon emission record
        const latestData = await fetchLatestCarbonEmissionHistory();
        if (latestData) {
          // Validate emission data
          const emission = parseFloat(latestData.carbonEmission);
          if (isNaN(emission) || emission < 0) {
            console.warn("Invalid emission value found:", latestData);
            setTotalCarbonEmission(0);
          } else {
            setTotalCarbonEmission(emission);
          }

          // Set other fields with validation
          setDietType(latestData.dietType || "");
          setWasteGeneration(latestData.wasteGeneration || "");
          setRecycling(latestData.recycling || "");
          setComposting(latestData.composting || "");
          setGreenEnergy(latestData.greenEnergy || "");
        } else {
          setTotalCarbonEmission(0);
        }
      } catch (error) {
        console.error("Error fetching latest carbon data:", error);
        setError(error.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const currentUid = user ? user.uid : fallbackUid;
      if (currentUid) {
        fetchLatestCarbonData(currentUid);
      } else {
        setError("No authenticated user found");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fallbackUid]);

  const renderLoadingState = () => (
    <div className="unique-dashboard-container">
      <div className="unique-box loading-box">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="unique-dashboard-container">
      <div className="unique-box error-box">
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="IamYash" style={{ paddingTop: "9rem" }}>
      <header className="unique-dashboard-header">
        <h1>Carbon Footprint Dashboard</h1>
      </header>

      {loading ? (
        renderLoadingState()
      ) : error ? (
        renderErrorState()
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
                {totalCarbonEmission.toFixed(2)} tons of CO<sub>2</sub>
              </p>
            </div>

            <div className="unique-box unique-box-graph">
              <CarbonEmissionGraph />
            </div>

            <div className="unique-box unique-box-suggestions">
              <div className="unique-h3">
                Suggestions to Reduce Your Footprint
              </div>
              <ul>
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
