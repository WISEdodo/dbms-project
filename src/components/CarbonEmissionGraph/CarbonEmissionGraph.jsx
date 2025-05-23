import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth } from "firebase/auth";
import "./CarbonEmissionGraph.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CarbonEmissionGraph = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Carbon Emissions (tons)",
        data: [],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.4,
      },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#e0e0e0",
        },
      },
      title: {
        display: true,
        text: "Carbon Emission History",
        color: "#e0e0e0",
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "#e0e0e0",
        },
      },
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        ticks: {
          color: "#e0e0e0",
        },
      },
    },
  };

  useEffect(() => {
    const fetchEmissionHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          throw new Error("No authenticated user found");
        }

        const userId = user.uid;
        const carbonEmissionHistoryRef = collection(
          db,
          "users",
          userId,
          "carbonEmissionHistory"
        );
        const q = query(carbonEmissionHistoryRef, orderBy("createdAt", "asc"));
        const querySnapshot = await getDocs(q);

        const labels = [];
        const data = [];

        querySnapshot.forEach((doc) => {
          const emissionData = doc.data();
          // Validate emission data
          const emission = parseFloat(emissionData.carbonEmission);
          if (isNaN(emission) || emission < 0) {
            console.warn("Invalid emission value found:", emissionData);
            return;
          }

          // Validate date
          if (!emissionData.createdAt?.toDate) {
            console.warn("Invalid date found:", emissionData);
            return;
          }

          const date = emissionData.createdAt.toDate();
          if (isNaN(date.getTime())) {
            console.warn("Invalid date conversion:", emissionData.createdAt);
            return;
          }

          labels.push(date.toLocaleDateString());
          data.push(emission);
        });

        if (data.length === 0) {
          setError("No emission data available");
          return;
        }

        setChartData({
          labels,
          datasets: [
            {
              label: "Carbon Emissions (tons)",
              data,
              borderColor: "rgb(75, 192, 192)",
              backgroundColor: "rgba(75, 192, 192, 0.5)",
              tension: 0.4,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching emission history:", error);
        setError(error.message || "Failed to load emission data");
      } finally {
        setLoading(false);
      }
    };

    fetchEmissionHistory();
  }, []);

  if (loading) {
    return (
      <div className="carbon-emission-graph loading">
        <div className="loading-spinner">Loading emission data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="carbon-emission-graph error">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="carbon-emission-graph">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default CarbonEmissionGraph;
