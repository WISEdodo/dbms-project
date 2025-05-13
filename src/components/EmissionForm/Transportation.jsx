import React, { useState, useEffect } from "react";
import Nav from "./Nav";
import Dropdown from "./Dropdown";
import "./Transportation.css";
import Input from "./Input";
import { useNavigate } from "react-router-dom";
import {
  CarbonEmissionFromFuel,
  CarbonEmissionFromElectricity,
} from "../../CarbonCalculator";

const Transportation = () => {
  const navigate = useNavigate();

  // Initialize state with values from localStorage, if they exist
  const [inputValues, setInputValues] = useState({
    fuelUnit: localStorage.getItem("fuelUnit") || "",
    fuelEmissions: localStorage.getItem("fuelEmissions") || "",
    electricityUnit: localStorage.getItem("electricityUnit") || "",
    electricityEmissions: localStorage.getItem("electricityEmissions") || "",
    flightHours: localStorage.getItem("flightHours") || "",
  });

  const [selectedFuel, setSelectedFuel] = useState(
    localStorage.getItem("selectedFuel") || ""
  );

  // Save input values to localStorage whenever they change (except emissions)
  useEffect(() => {
    Object.keys(inputValues).forEach((key) => {
      if (key !== "fuelEmissions" && key !== "electricityEmissions") {
        localStorage.setItem(key, inputValues[key]);
      }
    });
    localStorage.setItem("selectedFuel", selectedFuel);
  }, [inputValues, selectedFuel]);

  // Update car travel emission only when relevant fields change
  useEffect(() => {
    if (selectedFuel && inputValues.fuelUnit) {
      const newFuelEmission = CarbonEmissionFromFuel(
        selectedFuel,
        parseFloat(inputValues.fuelUnit) || 0
      );
      setInputValues((prev) => ({
        ...prev,
        fuelEmissions: newFuelEmission,
      }));
      localStorage.setItem("fuelEmissions", newFuelEmission);
    } else {
      setInputValues((prev) => ({
        ...prev,
        fuelEmissions: "",
      }));
      localStorage.setItem("fuelEmissions", "");
    }
  }, [selectedFuel, inputValues.fuelUnit]);

  // Handler to update state
  const handleInputChange = (field) => (e) => {
    setInputValues({ ...inputValues, [field]: e.target.value });
  };

  const handleDropdownChange = (e) => {
    setSelectedFuel(e.target.value);
  };

  return (
    <>
      <Nav />
      <div className="box">
        <div className="fueli">
          <div className="headingF">
            <h3>1. Car Travel</h3>
          </div>
          <div className="inputF">
            <Dropdown
              value={selectedFuel}
              onChange={handleDropdownChange}
              options={["Petrol", "Diesel", "CNG", "Electric"]}
            />
            <Input
              title="Distance Travelled [km/month]"
              value={inputValues.fuelUnit}
              onChange={handleInputChange("fuelUnit")}
            />
            <Input
              title="Emission [kgCO2]"
              value={inputValues.fuelEmissions}
              readonly
            />
          </div>
        </div>
        <div className="electri">
          <div className="headingE">
            <h3>2. Public Transport Usage</h3>
          </div>
          <div className="inputE">
            <Input
              title="Distance by Bus/Train [km/month]"
              value={inputValues.electricityUnit}
              onChange={handleInputChange("electricityUnit")}
            />
            <Input
              title="Emission [kgCO2]"
              value={inputValues.electricityEmissions}
              readonly
            />
          </div>
        </div>
        <div className="electri">
          <div className="headingE">
            <h3>3. Flights</h3>
          </div>
          <div className="inputE">
            <Input
              title="Flight Hours per Year"
              value={inputValues.flightHours || ""}
              onChange={handleInputChange("flightHours")}
            />
            {/* You can add emission calculation for flights if needed */}
          </div>
        </div>
        <div className="footerr">
          <button
            onClick={() => navigate("/carbonform/equipment")}
            className="btn4"
          >
            Next
          </button>
          <button onClick={() => navigate(-1)} className="btn">
            Prev
          </button>
        </div>
      </div>
    </>
  );
};

export default Transportation;
