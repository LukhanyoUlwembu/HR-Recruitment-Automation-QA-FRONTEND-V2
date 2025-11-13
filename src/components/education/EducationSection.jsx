import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import EducationEntry from "./EducationEntry";

const EducationSection = forwardRef(({ initialEntries = [], onDelete = () => {} }, ref) => {
  const [educationEntries, setEducationEntries] = useState(initialEntries);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const idp = sessionStorage.getItem("userId");
        const response = await fetch(`http://localhost:8080/applicants/${idp}`);
        if (response.ok) {
          const data = await response.json();
          const normalizedEducations = (data.applicantEducations || []).map((entry) => ({
            viewOnly: true,
            educationId: entry.educationId || null,
            tempId: Date.now() + (entry.educationId || 0),
            educationGrade: entry.educationGrade || "Not specified",
            educationName: entry.educationName || "Not specified",
            institution: entry.institution || "Unknown Institution",
            dateObtained: entry.dateObtained || "",
            version:entry.version,
            ...entry,
          }));
          setEducationEntries(normalizedEducations);
        }
      } catch (err) {
        console.log("Error fetching profile:", err.message);
      }
    };
    fetchData();
  }, []);

  useImperativeHandle(ref, () => ({
    getData: () => educationEntries,
    validate: () => {
      const hasUnsaved = educationEntries.some((entry) => !entry.viewOnly);
      return hasUnsaved ? "Please save or remove all education entries." : null;
    },
  }));

  const handleRemoveEducation = (id) => {
    const entryToRemove = educationEntries.find((entry) => entry.tempId === id);
    if (entryToRemove?.educationId) {
      onDelete(entryToRemove.educationId); // Notify parent to delete from backend
    }
    setEducationEntries((prev) => prev.filter((entry) => entry.tempId !== id));
  };

  const handleEducationChange = (id, field, value) => {
    setEducationEntries((prev) =>
      prev.map((entry) =>
        entry.tempId === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleAddEducation = () => {
    const hasUnsaved = educationEntries.some((entry) => !entry.viewOnly);
    if (hasUnsaved) {
      alert("Please save or close the current education entry before adding a new one.");
      return;
    }
    setEducationEntries((prev) => [
      ...prev,
      {
        tempId: Date.now(),
        educationGrade: "",
        institution: "",
        educationName: "",
        dateObtained: "",
        viewOnly: false,
      },
    ]);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Basic Education</h2>
      {educationEntries.map((entry) =>
        entry.viewOnly ? (
          <div key={entry.tempId} className="border border-gray-300 rounded p-4 space-y-2">
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {entry.educationGrade ? entry.educationGrade.name : "Not specified" } in {entry.educationName}
                
                </h3>
      
                <p className="text-sm text-gray-600">{entry.institution}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() =>
                    handleEducationChange(entry.tempId, "viewOnly", false)
                  }
                  className="text-blue-600 hover:underline text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleRemoveEducation(entry.tempId)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-700">
              <strong>Year Completed:</strong>{" "}
              {entry.dateObtained
                ? new Date(entry.dateObtained).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })
                : "N/A"}
            </p>
          </div>
        ) : (
          <EducationEntry
            key={entry.tempId}
            entry={entry}
            onChange={(field, value) => handleEducationChange(entry.tempId, field, value)}
            onRemove={() => handleRemoveEducation(entry.tempId)}
          />
        )
      )}
      <div className="flex justify-end">
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-700"
          onClick={handleAddEducation}
        >
          Add Education
        </button>
      </div>
    </div>
  );
});

export default EducationSection;
