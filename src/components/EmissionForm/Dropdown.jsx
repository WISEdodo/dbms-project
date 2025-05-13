import React from "react";
import styles from "./Dropdown.module.css"; // Import CSS module

const Dropdown = ({ value, onChange, options }) => {
  const defaultOptions = [
    "anthracite",
    "bituminous",
    "lignite",
    "subbituminous",
    "diesel",
    "Fuel Oil",
    "LPG",
    "Pet Coke",
    "Rice Husk",
    "Wood",
  ];
  const opts = options || defaultOptions;
  return (
    <div>
      <label htmlFor="fuelType" className={styles.label}>
        Fuel Type*
      </label>
      <select
        id="fuelType"
        className={styles.selectInput} // Apply the CSS module class
        value={value}
        onChange={onChange}
      >
        <option value="" disabled>
          Select Fuel Type
        </option>
        {opts.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
