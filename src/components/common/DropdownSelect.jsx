import React from "react";

const DropdownSelect = ({ label, name, options = [], value, onChange }) => {
  return (
    <div className="mb-2 w-full">
      {label && (
        <label className="block text-sm font-medium mb-1" htmlFor={name}>
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value || ""}  // ensure empty string if undefined
        onChange={onChange}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select {label}</option>
        {options
          .filter(Boolean) // skip null/undefined
          .map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name.replace(/_/g, " ")}
            </option>
          ))}
      </select>
    </div>
  );
};

export default DropdownSelect;
