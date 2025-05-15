import React, { useState, useEffect } from "react";
import styles from "./SingleEquipment.module.css"; // Importing the CSS module
import { ImBin2 } from "react-icons/im";

// SingleEquipment component for managing a list of appliances and their emissions
const SingleEquipment = ({ text = "Appliance Details" }) => {
  // Default equipment object structure
  const defaultEquipment = {
    powerSource: "electric",
    appliances: 0,
    load: 0,
    usage: 0,
    emissions: 0,
    applianceType: "TV",
  };

  // State to store the list of equipment, initialized from localStorage if available
  const [equipmentList, setEquipmentList] = useState(
    () =>
      JSON.parse(localStorage.getItem("equipmentList")) || [defaultEquipment]
  );

  // List of appliance types for the dropdown
  const applianceOptions = [
    "TV",
    "Refrigerator",
    "Washing Machine",
    "Computer",
    "Microwave",
    "Fan",
    "Air Conditioner",
    "Other",
  ];

  // Function to calculate emissions for a single equipment item
  // Uses different emission factors for electric and diesel
  const calculateEmissions = (equipment) => {
    const emissionFactor = equipment.powerSource === "electric" ? 0.03 : 0.25;
    const calculatedEmissions =
      equipment.load * equipment.appliances * equipment.usage * emissionFactor;
    return calculatedEmissions.toFixed(2);
  };

  // Effect to save equipment list to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("equipmentList", JSON.stringify(equipmentList));
  }, [equipmentList]);

  // Handler to add a new equipment entry
  const handleAddEquipment = () => {
    setEquipmentList([...equipmentList, defaultEquipment]);
  };

  // Handler to delete an equipment entry by index
  const handleDeleteEquipment = (index) => {
    const updatedList = equipmentList.filter((_, i) => i !== index);
    setEquipmentList(updatedList);
  };

  // Handler to update a field of an equipment entry
  const handleUpdateEquipment = (index, field, value) => {
    const updatedList = [...equipmentList];
    updatedList[index] = {
      ...updatedList[index],
      [field]: value,
    };
    // Recalculate emissions whenever a field changes
    updatedList[index].emissions = calculateEmissions(updatedList[index]);
    setEquipmentList(updatedList);
  };

  // Render the list of equipment forms
  return (
    <div>
      {equipmentList.map((equipment, index) => (
        <div key={index} className={styles.outerContainer}>
          {/* Display the section title */}
          <div className={styles.textAbove}>{text}</div>
          <div className={styles.formSection}>
            <div className={styles.leftyy}>
              {/* Dropdown for appliance type */}
              <div className={styles.inputGroup}>
                <label>Appliance Type</label>
                <select
                  className={styles.ip}
                  value={equipment.applianceType}
                  onChange={(e) =>
                    handleUpdateEquipment(
                      index,
                      "applianceType",
                      e.target.value
                    )
                  }
                >
                  {applianceOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              {/* Input for load in watts */}
              <div className={styles.inputGroup}>
                <label>Approx. Load (Watts)</label>
                <input
                  className={styles.ip}
                  type="number"
                  value={equipment.load}
                  onChange={(e) =>
                    handleUpdateEquipment(
                      index,
                      "load",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
              {/* Input for number of appliances */}
              <div className={styles.equipmentInputGroup}>
                <label>No. of Appliances</label>
                <input
                  className={styles.ip}
                  type="number"
                  value={equipment.appliances}
                  onChange={(e) =>
                    handleUpdateEquipment(
                      index,
                      "appliances",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
              {/* Input for average usage in hours per day */}
              <div className={styles.equipmentInputGroup}>
                <label>Avg. Usage (hrs/day)</label>
                <input
                  className={styles.ip}
                  type="number"
                  value={equipment.usage}
                  onChange={(e) =>
                    handleUpdateEquipment(
                      index,
                      "usage",
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
              {/* Display calculated emissions (read-only) */}
              <div className={styles.inputGroup}>
                <label>Emissions (Kg CO2)</label>
                <input
                  className={styles.ip}
                  type="text"
                  value={equipment.emissions}
                  readOnly
                />
              </div>
              {/* Button to delete this equipment entry */}
              <button
                onClick={() => handleDeleteEquipment(index)}
                className={styles.btnDeleteEquipment}
              >
                <ImBin2
                  style={{
                    color: "white",
                    alignItems: "center",
                    fontSize: "150%",
                  }}
                />
              </button>
            </div>
            <div className={styles.righty}>
              {/* Toggle for power source (electric or diesel) */}
              <div className={styles.powerSourceToggle}>
                <label className={styles.toggleLabel}>Power Source:</label>
                <div className={styles.toggleOptions}>
                  <label className={styles.optionLabel}>
                    <input
                      type="radio"
                      value="electric"
                      checked={equipment.powerSource === "electric"}
                      onChange={(e) =>
                        handleUpdateEquipment(
                          index,
                          "powerSource",
                          e.target.value
                        )
                      }
                    />
                    <p className={styles.optionText}>Electric</p>
                  </label>
                  <label className={styles.optionLabel}>
                    <input
                      type="radio"
                      value="diesel"
                      checked={equipment.powerSource === "diesel"}
                      onChange={(e) =>
                        handleUpdateEquipment(
                          index,
                          "powerSource",
                          e.target.value
                        )
                      }
                    />
                    <p className={styles.optionText}>Diesel</p>
                  </label>
                </div>
              </div>
            </div>
          </div>
          {/* Button to add a new appliance entry */}
          <button
            onClick={handleAddEquipment}
            className={styles.btnAddEquipment}
          >
            Add Appliance
          </button>
        </div>
      ))}
    </div>
  );
};

export default SingleEquipment;
