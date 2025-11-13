    import React, { useState,useEffect } from "react";

const EducationEntry = ({ entry, onChange, onRemove }) => {
  const [educationLevels, setGradetype] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchEducationList = async () => {
      try {
        const response = await fetch("http://localhost:8080/dropdown/grades");
        if (response.ok) {
          const data = await response.json();
          setGradetype(data);
        }
      } catch (err) {
        console.log("Error fetching grades:", err.message);
      }
    };
    fetchEducationList();
  }, []);

  const validateFields = () => {
    const errors = {};
    if (!entry.educationGrade) errors.educationGrade = "Education level is required.";
    if (!entry.institution.trim()) errors.institution = "Institution name is required.";
    if (!entry.educationName.trim()) errors.educationName = "Field of study is required.";
    if (!entry.dateObtained) errors.dateObtained = "Date completed is required.";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateFields()) return;
    onChange("viewOnly", true);
  };

  return (
    <div className="border p-4 rounded space-y-4">
      <div>
        <label className="block text-sm font-medium">Education Level</label>
        <select
          value={entry.educationGrade ? JSON.stringify(entry.educationGrade) : ""}
          onChange={(e) => onChange("educationGrade", JSON.parse(e.target.value))}
          className={`w-full mt-1 border p-2 rounded ${
            validationErrors.educationGrade ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select Education Level</option>
          {educationLevels.map((level) => (
          <option key={level.id} value={JSON.stringify(level)}>
            {level.name}
          </option>
        ))}

        </select>
        {validationErrors.educationGrade && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.educationGrade}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">Institution</label>
        <input
          type="text"
          value={entry.institution}
          onChange={(e) => onChange("institution", e.target.value)}
          className={`w-full mt-1 border p-2 rounded ${
            validationErrors.institution ? "border-red-500" : "border-gray-300"
          }`}
        />
        {validationErrors.institution && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.institution}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium">Field of study</label>
        <input
          type="text"
          value={entry.educationName}
          onChange={(e) => onChange("educationName", e.target.value)}
          className={`w-full mt-1 border p-2 rounded ${
            validationErrors.educationName ? "border-red-500" : "border-gray-300"
          }`}
        />
        {validationErrors.institution && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.educationName}</p>
        )}
      </div>


      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">Year Completed</label>
        <input
            type="month"
            value={entry.dateObtained?.slice(0, 7) || ""} 
            onChange={(e) => {
              const formattedDate = e.target.value + "-01";
              onChange("dateObtained", formattedDate);
            }}
            className={`form-input w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.dateObtained ? "border-red-500" : "border-gray-300"
            }`}
          />

        {validationErrors.dateObtained && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.dateObtained}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Save
        </button>
        <button
          onClick={onRemove}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
        >
          Close
        </button>
      </div>
    </div>
  );
};
    export default EducationEntry;