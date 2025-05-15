import React, { useState, useEffect } from "react";
import Nav from "./Nav";
import "./Offset.css";
import Input from "./Input";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the CSS
import { totalCarbonEmission } from "../../CarbonCalculator";

const Offset = () => {
  const navigate = useNavigate();

  // State to store input values, initialized from localStorage if available
  const [inputValues, setInputValues] = useState({
    dietType: localStorage.getItem("dietType") || "",
    wasteGeneration: localStorage.getItem("wasteGeneration") || "",
    recycling: localStorage.getItem("recycling") || "",
    composting: localStorage.getItem("composting") || "",
    greenEnergy: localStorage.getItem("greenEnergy") || "",
  });

  // Effect to save input values to localStorage whenever they change
  useEffect(() => {
    Object.keys(inputValues).forEach((key) => {
      localStorage.setItem(key, inputValues[key]);
    });
  }, [inputValues]);

  // Handler to update a specific field in inputValues
  const handleInputChange = (field) => (e) => {
    setInputValues({ ...inputValues, [field]: e.target.value });
  };

  // Handler for the RESULT button
  // Calculates total carbon emission, clears localStorage, shows a toast, and navigates to the result page
  const handleClick = () => {
    const finalResult = totalCarbonEmission();
    localStorage.clear();
    toast.success("Loading results...", {
      position: "bottom-center",
      autoClose: 1995,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
      transition: Bounce,
    });
    setTimeout(() => {
      navigate("/result", { state: { result: finalResult } });
    }, 2000);
  };

  return (
    <>
      {/* Navigation bar at the top */}
      <Nav />
      <div className="box">
        <div className="containerr">
          {/* Diet input section */}
          <div className="electri">
            <div className="headingE">
              <h3>Diet</h3>
            </div>
            <div className="inputo">
              <Input
                title="Diet Type (e.g., Omnivore, Vegetarian, Vegan)"
                value={inputValues.dietType}
                onChange={handleInputChange("dietType")}
                units=""
              />
            </div>
          </div>
          {/* Waste Generation input section */}
          <div className="electri">
            <div className="headingE">
              <h3>Waste Generation</h3>
            </div>
            <div className="inputE">
              <Input
                title="Waste Generated [kg/week]"
                value={inputValues.wasteGeneration}
                onChange={handleInputChange("wasteGeneration")}
                units="kg"
              />
            </div>
          </div>
          {/* Recycling input section */}
          <div className="electri">
            <div className="headingE">
              <h3>Recycling</h3>
            </div>
            <div className="inputE">
              <Input
                title="Do you recycle? (Yes/No)"
                value={inputValues.recycling}
                onChange={handleInputChange("recycling")}
                units=""
              />
            </div>
          </div>
          {/* Composting input section */}
          <div className="electri">
            <div className="headingE">
              <h3>Composting</h3>
            </div>
            <div className="inputE">
              <Input
                title="Do you compost? (Yes/No)"
                value={inputValues.composting}
                onChange={handleInputChange("composting")}
                units=""
              />
            </div>
          </div>
          {/* Green Energy input section */}
          <div className="electri">
            <div className="headingE">
              <h3>Green Energy Subscription</h3>
            </div>
            <div className="inputE">
              <Input
                title="Do you use green/renewable energy at home? (Yes/No)"
                value={inputValues.greenEnergy}
                onChange={handleInputChange("greenEnergy")}
                units=""
              />
            </div>
          </div>
        </div>
        {/* Footer with navigation buttons */}
        <div className="footerr">
          {/* Button to calculate and show result */}
          <button onClick={handleClick} className="btn4">
            RESULT
          </button>
          {/* Button to go to previous page */}
          <button onClick={() => navigate(-1)} className="btn">
            Prev
          </button>
        </div>
      </div>
      {/* Toast notification container for feedback */}
      <ToastContainer
        position="bottom-center"
        autoClose={1995}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce} // Correct prop format
      />
    </>
  );
};

export default Offset;
