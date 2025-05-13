import React from "react";
import "./Input.css";

const Input = ({ value, onChange, title, units, readonly }) => {
  return (
    <div className="boxes">
      <div className="parameter">{title}</div>
      <div className="box">
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={units}
          readOnly={readonly}
        />
      </div>
    </div>
  );
};

export default Input;
