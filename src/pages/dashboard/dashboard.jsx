import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import "./dashboard.css";
import { fetchAndSumCarbonEmissionHistory } from "../../CarbonCalculator";
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
        // Fetch latest carbon emission record
        const latestRef = doc(
          db,
          "users",
          userUid,
          "carbonEmissionHistory",
          "latestRecord"
        );
        const latestSnap = await getDoc(latestRef);
        if (latestSnap.exists()) {
          const data = latestSnap.data();
          setDietType(data.dietType || "");
          setWasteGeneration(data.wasteGeneration || "");
          setRecycling(data.recycling || "");
          setComposting(data.composting || "");
          setGreenEnergy(data.greenEnergy || "");
        }
      } catch (error) {
        console.error("Error fetching latest carbon data:", error);
      }
    };

    onAuthStateChanged(auth, (user) => {
      const currentUid = user ? user.uid : fallbackUid;
      if (currentUid) {
        fetchLatestCarbonData(currentUid);
      }
    });

    const fetchData = async () => {
      try {
        const { totalCarbonEmission } =
          await fetchAndSumCarbonEmissionHistory();
        setTotalCarbonEmission(totalCarbonEmission || 0);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [fallbackUid]);

  return (
    <div className="IamYash" style={{ paddingTop: "3rem" }}>
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

            <div className="unique-box unique-box3">
              <div className="unique-h3">Reduce Carbon Footprint</div>
              <div className="unique-b3">Click here</div>
            </div>
          </div>
        </>
      )}
      <Footer />
    </div>
  );
};

export default Dashboard;
