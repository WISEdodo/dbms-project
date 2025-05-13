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

  // Initialize state with values from localStorage, if they exist
  const [inputValues, setInputValues] = useState({
    dietType: localStorage.getItem("dietType") || "",
    wasteGeneration: localStorage.getItem("wasteGeneration") || "",
    recycling: localStorage.getItem("recycling") || "",
    composting: localStorage.getItem("composting") || "",
    greenEnergy: localStorage.getItem("greenEnergy") || "",
  });

  // Save input values to localStorage whenever they change
  useEffect(() => {
    Object.keys(inputValues).forEach((key) => {
      localStorage.setItem(key, inputValues[key]);
    });
  }, [inputValues]);

  // Handler to update state
  const handleInputChange = (field) => (e) => {
    setInputValues({ ...inputValues, [field]: e.target.value });
  };

  // Handler to show toast and navigate
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
      <Nav />
      <div className="box">
        <div className="containerr">
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
        <div className="footerr">
          <button onClick={handleClick} className="btn4">
            RESULT
          </button>
          <button onClick={() => navigate(-1)} className="btn">
            Prev
          </button>
        </div>
      </div>
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
