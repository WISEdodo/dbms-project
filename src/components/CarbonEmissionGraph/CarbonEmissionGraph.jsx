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
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const userId = user.uid;
          const carbonEmissionHistoryRef = collection(
            db,
            "users",
            userId,
            "carbonEmissionHistory"
          );
          const q = query(
            carbonEmissionHistoryRef,
            orderBy("createdAt", "asc")
          );
          const querySnapshot = await getDocs(q);

          const labels = [];
          const data = [];

          querySnapshot.forEach((doc) => {
            const emissionData = doc.data();
            const date = new Date(emissionData.createdAt.toDate());
            labels.push(date.toLocaleDateString());
            data.push(parseFloat(emissionData.carbonEmission));
          });

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
        }
      } catch (error) {
        console.error("Error fetching emission history:", error);
      }
    };

    fetchEmissionHistory();
  }, []);

  return (
    <div className="carbon-emission-graph">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default CarbonEmissionGraph;
